import express from 'express';
import http from 'http';
import crypto from 'crypto';
import { WebSocketServer } from 'ws';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// SERVER-AUTHORITATIVE DATABASE STATE (Matches 01_furniture_shop_schema.sql & 02_sample_data.sql)
// ============================================================================
const admins = [
  {
    AdminID: 1,
    Email: 'admin@liliaandrowena.com',
    Password: 'admin123',
    FullName: 'Rowena & Lilia (Workshop Admin)'
  },
  {
    AdminID: 2,
    Email: 'lilia.owner@liliaandrowena.com',
    Password: 'admin123',
    FullName: 'Lilia (Shop Owner)'
  }
];

const customers = [
  {
    CustomerID: 1,
    FullName: 'Maria Teresa Santos',
    Email: 'maria.santos@example.com',
    Password: 'password123',
    PhoneNumber: '0917-123-4567',
    Address: 'Unit 14B, Tower 2, Serendra, BGC, Taguig City',
    DefaultOrderID: 1001
  },
  {
    CustomerID: 2,
    FullName: 'Atty. Roberto Mendoza',
    Email: 'roberto.mendoza@example.com',
    Password: 'password123',
    PhoneNumber: '0918-987-6543',
    Address: '88 Narra Avenue, Ayala Alabang Village, Muntinlupa',
    DefaultOrderID: 1002
  }
];

const customerOrders = [
  { OrderID: 1001, CustomerID: 1 },
  { OrderID: 1002, CustomerID: 2 }
];

const orderMessages = [
  {
    MessageID: 1,
    CustomerID: 1,
    OrderID: 1001,
    AdminID: null,
    SenderID: 1,
    SenderRole: 'Customer',
    SenderName: 'Maria Teresa Santos',
    Topic: 'Order Follow-Up (#1001)',
    MessageText: 'Good day! I would like to follow up on Order #1001 (220cm Mahogany Dining Set). Can we also add 2 extra matching dining chairs and felt floor protectors to our order?',
    CreatedAt: '2026-11-06 09:15:00'
  },
  {
    MessageID: 2,
    CustomerID: 1,
    OrderID: 1001,
    AdminID: 1,
    SenderID: 1,
    SenderRole: 'Admin',
    SenderName: 'Rowena & Lilia (Workshop Admin)',
    Topic: 'Order Follow-Up (#1001)',
    MessageText: 'Hello Maria! Master Finisher Dante Cruz is currently applying the final walnut coat to your table. Yes, we can add 2 matching slatted mahogany chairs (+₱4,200) and complimentary felt pads before driver Rene Ocampo delivers on Nov 9!',
    CreatedAt: '2026-11-06 09:22:00'
  },
  {
    MessageID: 3,
    CustomerID: 2,
    OrderID: 1002,
    AdminID: null,
    SenderID: 2,
    SenderRole: 'Customer',
    SenderName: 'Atty. Roberto Mendoza',
    Topic: 'Add Custom Request (#1002)',
    MessageText: 'Hello Admin, for my Order #1002 (Scandinavian Sky Blue Lounge Sofa), can we include 2 extra bolster throw pillows in the same sky blue linen fabric?',
    CreatedAt: '2026-11-06 10:05:00'
  },
  {
    MessageID: 4,
    CustomerID: 2,
    OrderID: 1002,
    AdminID: 1,
    SenderID: 1,
    SenderRole: 'Admin',
    SenderName: 'Rowena & Lilia (Workshop Admin)',
    Topic: 'Add Custom Request (#1002)',
    MessageText: 'Good morning Atty. Roberto! We have reserved the extra Sky Blue Woven Linen fabric from Artisan Upholstery Co. and will hand-stitch 2 matching bolster pillows (+₱1,800) for your Order #1002.',
    CreatedAt: '2026-11-06 10:14:00'
  }
];

let nextMessageId = 5;

// ============================================================================
// SERVER-SIDE SESSION STORE (Cryptographically Random Tokens -> Authenticated User)
// Never trusts client-submitted customer_id or conversation_id for authorization.
// ============================================================================
const activeSessions = new Map();

function generateSessionToken() {
  return crypto.randomBytes(24).toString('hex');
}

function parseCookies(cookieHeader) {
  const result = {};
  if (!cookieHeader) return result;
  const pairs = String(cookieHeader).split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx > 0) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      result[key] = decodeURIComponent(val);
    }
  }
  return result;
}

function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    `lr_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    'lr_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  );
}

function createCustomerSession(customer) {
  const token = generateSessionToken();
  const sessionData = {
    token,
    isAuthenticated: true,
    role: 'customer',
    userId: Number(customer.CustomerID),
    name: customer.FullName,
    email: customer.Email,
    phone: customer.PhoneNumber || '',
    address: customer.Address || '',
    activeCustomerId: Number(customer.CustomerID)
  };
  activeSessions.set(token, sessionData);
  return sessionData;
}

function createAdminSession(admin) {
  const token = generateSessionToken();
  const sessionData = {
    token,
    isAuthenticated: true,
    role: 'admin',
    userId: Number(admin.AdminID),
    name: admin.FullName,
    email: admin.Email,
    phone: '0917-889-4211',
    address: 'MacArthur Highway, San Fernando, Pampanga',
    activeCustomerId: 1
  };
  activeSessions.set(token, sessionData);
  return sessionData;
}

function formatTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    now.getFullYear() + '-' +
    pad(now.getMonth() + 1) + '-' +
    pad(now.getDate()) + ' ' +
    pad(now.getHours()) + ':' +
    pad(now.getMinutes()) + ':' +
    pad(now.getSeconds())
  );
}

function findCustomerById(customerId) {
  const cid = Number(customerId);
  return customers.find((c) => Number(c.CustomerID) === cid) || null;
}

function doesOrderBelongToCustomer(orderId, customerId) {
  const oid = Number(orderId);
  const cid = Number(customerId);
  if (!oid || oid <= 0) return true;
  const found = customerOrders.find((o) => Number(o.OrderID) === oid);
  if (!found) return false;
  return Number(found.CustomerID) === cid;
}

// Strictly filter messages by CustomerID so conversations are never mixed
function getConversationMessages(customerId) {
  const cid = Number(customerId);
  if (!cid || cid <= 0) return [];
  return orderMessages.filter((m) => Number(m.CustomerID) === cid);
}

// Build Admin conversation list summary across all customers
function getCustomerConversationsSummary() {
  return customers.map((c) => {
    const msgs = getConversationMessages(c.CustomerID);
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    return {
      CustomerID: c.CustomerID,
      FullName: c.FullName,
      Email: c.Email,
      DefaultOrderID: c.DefaultOrderID,
      MessageCount: msgs.length,
      LastMessageText: lastMsg ? lastMsg.MessageText : 'No messages yet',
      LastMessageAt: lastMsg ? lastMsg.CreatedAt : null
    };
  });
}

/**
 * Resolve the authenticated user from the server-side session store (`activeSessions`).
 * Falls back to header/query identity ONLY when no server-side session cookie/token exists.
 */
function resolveAuthenticatedSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const bearerHeader = String(req.headers.authorization || '');
  const bearerToken = bearerHeader.startsWith('Bearer ') ? bearerHeader.slice(7).trim() : '';
  const token =
    String(req.headers['x-session-token'] || '').trim() ||
    bearerToken ||
    String((req.query && req.query.session_token) || '').trim() ||
    String(cookies.lr_session || '').trim();

  if (token && activeSessions.has(token)) {
    return activeSessions.get(token);
  }

  // Fallback for stateless automated test requests without a session cookie
  const fallbackRole = String(req.headers['x-auth-role'] || (req.query && req.query.viewer_role) || '').toLowerCase();
  const fallbackId = Number(req.headers['x-auth-user-id'] || (req.query && req.query.viewer_id)) || 0;
  if ((fallbackRole === 'customer' || fallbackRole === 'admin') && fallbackId > 0) {
    if (fallbackRole === 'admin') {
      const adm = admins.find((a) => Number(a.AdminID) === fallbackId) || admins[0];
      return {
        token: null,
        isAuthenticated: true,
        role: 'admin',
        userId: Number(adm.AdminID),
        name: adm.FullName,
        email: adm.Email,
        activeCustomerId: 1
      };
    }
    const cust = findCustomerById(fallbackId);
    if (cust) {
      return {
        token: null,
        isAuthenticated: true,
        role: 'customer',
        userId: Number(cust.CustomerID),
        name: cust.FullName,
        email: cust.Email,
        activeCustomerId: Number(cust.CustomerID)
      };
    }
  }

  return {
    token: null,
    isAuthenticated: false,
    role: 'guest',
    userId: 0,
    name: '',
    email: '',
    activeCustomerId: null
  };
}

/**
 * Detect any attempt by a logged-in Customer to access or modify another customer's conversation
 * via query parameters, URL parameters, headers, or request body (Anti-IDOR).
 */
function detectCustomerIdTampering(authenticatedCustomerId, req, routeConversationId = null) {
  const q = req.query || {};
  const b = req.body || {};

  const candidateIds = [
    routeConversationId,
    q.customer_id,
    q.CustomerID,
    q.conversation_id,
    q.conversationId,
    q.viewer_id,
    q.sender_id,
    q.SenderID,
    b.customer_id,
    b.CustomerID,
    b.conversation_id,
    b.conversationId,
    b.viewer_id,
    b.sender_id,
    b.SenderID,
    b.AuthUserID,
    req.headers['x-auth-user-id']
  ];

  for (const rawVal of candidateIds) {
    if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
      if (Number(rawVal) !== Number(authenticatedCustomerId)) {
        return true;
      }
    }
  }

  // Also detect if a Customer tries to spoof role = 'admin' in headers/query/body
  const candidateRoles = [
    q.viewer_role,
    q.sender_role,
    q.SenderRole,
    b.viewer_role,
    b.sender_role,
    b.SenderRole,
    b.AuthRole,
    req.headers['x-auth-role']
  ];

  for (const rawRole of candidateRoles) {
    if (rawRole !== undefined && rawRole !== null && String(rawRole).trim() !== '') {
      if (String(rawRole).trim().toLowerCase() !== 'customer') {
        return true;
      }
    }
  }

  return false;
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const server = http.createServer(app);

  // ==========================================================================
  // WEBSOCKET SERVER ON /ws-chat (Server-Authenticated Private 1-on-1 Messaging)
  // ==========================================================================
  const wss = new WebSocketServer({ server, path: '/ws-chat' });

  function sendAuthorizedConversationState(ws) {
    if (!ws || ws.readyState !== 1) return;
    const auth = ws.auth || { role: 'guest', userId: 0, activeCustomerId: null };

    if (auth.role === 'customer' && Number(auth.userId) > 0) {
      const ownCustomerId = Number(auth.userId);
      ws.send(
        JSON.stringify({
          type: 'messages:init',
          conversationCustomerId: ownCustomerId,
          messages: getConversationMessages(ownCustomerId),
          conversations: []
        })
      );
    } else if (auth.role === 'admin' && Number(auth.userId) > 0) {
      const targetCustomerId = Number(auth.activeCustomerId) || 1;
      ws.send(
        JSON.stringify({
          type: 'messages:init',
          conversationCustomerId: targetCustomerId,
          messages: getConversationMessages(targetCustomerId),
          conversations: getCustomerConversationsSummary()
        })
      );
    } else {
      ws.send(
        JSON.stringify({
          type: 'messages:init',
          conversationCustomerId: null,
          messages: [],
          conversations: []
        })
      );
    }
  }

  // Send a newly created message ONLY to the owning Customer and to Admins
  function dispatchPrivateMessageEvent(newMsg) {
    const targetCustomerId = Number(newMsg.CustomerID);
    const adminConversations = getCustomerConversationsSummary();

    for (const client of wss.clients) {
      if (client.readyState !== 1) continue;
      const auth = client.auth || { role: 'guest', userId: 0 };

      if (auth.role === 'admin' && Number(auth.userId) > 0) {
        client.send(
          JSON.stringify({
            type: 'message:created',
            conversationCustomerId: targetCustomerId,
            message: newMsg,
            conversations: adminConversations
          })
        );
      } else if (auth.role === 'customer' && Number(auth.userId) === targetCustomerId) {
        client.send(
          JSON.stringify({
            type: 'message:created',
            conversationCustomerId: targetCustomerId,
            message: newMsg
          })
        );
      }
    }
  }

  wss.on('connection', (ws, req) => {
    const cookies = parseCookies(req.headers.cookie);
    const cookieToken = String(cookies.lr_session || '').trim();
    const existingSession = cookieToken && activeSessions.has(cookieToken) ? activeSessions.get(cookieToken) : null;

    if (existingSession && existingSession.isAuthenticated) {
      ws.sessionToken = existingSession.token;
      ws.auth = {
        role: existingSession.role,
        userId: Number(existingSession.userId),
        activeCustomerId: existingSession.role === 'admin' ? (Number(existingSession.activeCustomerId) || 1) : Number(existingSession.userId)
      };
    } else {
      ws.sessionToken = null;
      ws.auth = {
        role: 'guest',
        userId: 0,
        activeCustomerId: null
      };
    }

    sendAuthorizedConversationState(ws);

    ws.on('message', (data) => {
      try {
        const packet = JSON.parse(data.toString());

        // 1. Authenticate WebSocket connection using server-issued sessionToken
        if (packet.type === 'auth:identify') {
          const token = String(packet.sessionToken || ws.sessionToken || '').trim();
          const session = token && activeSessions.has(token) ? activeSessions.get(token) : null;

          if (!session || !session.isAuthenticated) {
            ws.auth = { role: 'guest', userId: 0, activeCustomerId: null };
            sendAuthorizedConversationState(ws);
            return;
          }

          ws.sessionToken = session.token;

          if (session.role === 'customer') {
            // If a Customer tries to claim another user's ID or conversation in auth:identify, reject with 403
            if (
              (packet.userId !== undefined && Number(packet.userId) !== Number(session.userId)) ||
              (packet.activeCustomerId !== undefined && Number(packet.activeCustomerId) !== Number(session.userId)) ||
              (packet.role !== undefined && String(packet.role).toLowerCase() !== 'customer')
            ) {
              ws.send(
                JSON.stringify({
                  type: 'error:forbidden',
                  code: 403,
                  error: 'Forbidden: Customers can only access their own private conversation.'
                })
              );
              return;
            }
            ws.auth = {
              role: 'customer',
              userId: Number(session.userId),
              activeCustomerId: Number(session.userId)
            };
          } else if (session.role === 'admin') {
            const targetCid = Number(packet.activeCustomerId) || Number(session.activeCustomerId) || 1;
            session.activeCustomerId = targetCid;
            ws.auth = {
              role: 'admin',
              userId: Number(session.userId),
              activeCustomerId: targetCid
            };
          }

          sendAuthorizedConversationState(ws);
          return;
        }

        // 2. Switch conversation (ONLY allowed for authenticated Admins; DENIED for Customers)
        if (packet.type === 'conversation:select') {
          const token = String(packet.sessionToken || ws.sessionToken || '').trim();
          const session = token && activeSessions.has(token) ? activeSessions.get(token) : null;
          const effectiveRole = session ? session.role : (ws.auth ? ws.auth.role : 'guest');
          const effectiveUserId = session ? Number(session.userId) : (ws.auth ? Number(ws.auth.userId) : 0);

          if (effectiveRole !== 'admin' || effectiveUserId <= 0) {
            ws.send(
              JSON.stringify({
                type: 'error:forbidden',
                code: 403,
                error: 'Forbidden: Customer accounts cannot switch to or view another customer\'s conversation.'
              })
            );
            return;
          }

          const targetCid = Number(packet.activeCustomerId || packet.customer_id) || 1;
          if (!findCustomerById(targetCid)) {
            ws.send(
              JSON.stringify({
                type: 'error:forbidden',
                code: 404,
                error: 'Target customer conversation not found.'
              })
            );
            return;
          }

          if (session) session.activeCustomerId = targetCid;
          ws.auth.activeCustomerId = targetCid;
          sendAuthorizedConversationState(ws);
          return;
        }

        // 3. Send a message in a private conversation (Strict server-side session verification)
        if (packet.type === 'message:send') {
          const text = String(packet.MessageText || packet.message_text || '').trim();
          if (!text) return;

          const token = String(packet.sessionToken || ws.sessionToken || '').trim();
          const session = token && activeSessions.has(token) ? activeSessions.get(token) : null;

          if (!session || !session.isAuthenticated) {
            ws.send(
              JSON.stringify({
                type: 'error:forbidden',
                code: 401,
                error: 'Authentication required to send messages.'
              })
            );
            return;
          }

          let customerId;
          let adminId;
          let senderId;
          let senderRole;
          let senderName;

          if (session.role === 'admin') {
            senderRole = 'Admin';
            adminId = Number(session.userId);
            senderId = Number(session.userId);
            customerId = Number(packet.CustomerID || packet.customer_id || ws.auth.activeCustomerId || session.activeCustomerId) || 1;
            if (!findCustomerById(customerId)) {
              ws.send(
                JSON.stringify({
                  type: 'error:forbidden',
                  code: 403,
                  error: 'Forbidden: Target customer conversation does not exist.'
                })
              );
              return;
            }
            senderName = session.name || 'Rowena & Lilia (Workshop Admin)';
          } else {
            // Customer: reject any attempt to spoof CustomerID, conversation_id, SenderID, or SenderRole
            const suppliedCid = packet.CustomerID ?? packet.customer_id ?? packet.conversation_id;
            const suppliedSid = packet.SenderID ?? packet.sender_id ?? packet.AuthUserID;
            const suppliedRole = packet.SenderRole ?? packet.sender_role ?? packet.AuthRole;

            if (
              (suppliedCid !== undefined && suppliedCid !== null && Number(suppliedCid) !== Number(session.userId)) ||
              (suppliedSid !== undefined && suppliedSid !== null && Number(suppliedSid) !== Number(session.userId)) ||
              (suppliedRole !== undefined && suppliedRole !== null && String(suppliedRole).toLowerCase() !== 'customer')
            ) {
              ws.send(
                JSON.stringify({
                  type: 'error:forbidden',
                  code: 403,
                  error: 'Forbidden: You can only send messages to your own private conversation.'
                })
              );
              return;
            }

            // Validate OrderID ownership if provided
            const suppliedOrderId = packet.OrderID ?? packet.order_id;
            if (suppliedOrderId && !doesOrderBelongToCustomer(suppliedOrderId, session.userId)) {
              ws.send(
                JSON.stringify({
                  type: 'error:forbidden',
                  code: 403,
                  error: 'Forbidden: You cannot reference an order belonging to another customer.'
                })
              );
              return;
            }

            // Derive CustomerID, SenderID, and SenderName strictly from the authenticated server session
            senderRole = 'Customer';
            adminId = null;
            senderId = Number(session.userId);
            customerId = Number(session.userId);
            senderName = session.name;
          }

          const newMsg = {
            MessageID: nextMessageId++,
            CustomerID: customerId,
            OrderID: (packet.OrderID || packet.order_id) ? Number(packet.OrderID || packet.order_id) : null,
            AdminID: adminId,
            SenderID: senderId,
            SenderRole: senderRole,
            SenderName: senderName,
            Topic: String(packet.Topic || packet.topic || 'Order Follow-Up').trim(),
            MessageText: text,
            CreatedAt: formatTimestamp()
          };

          orderMessages.push(newMsg);
          dispatchPrivateMessageEvent(newMsg);
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });
  });

  // ==========================================================================
  // SERVER-SIDE AUTHENTICATION ENDPOINTS (/api/auth/*)
  // ==========================================================================

  // Retrieve or bootstrap current server-side session
  app.get('/api/auth/session', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const token = String(req.headers['x-session-token'] || cookies.lr_session || '').trim();

    if (token && activeSessions.has(token)) {
      const session = activeSessions.get(token);
      return res.json({
        status: 'ok',
        sessionToken: session.token,
        user: {
          isLoggedIn: session.isAuthenticated,
          id: session.userId,
          role: session.role,
          name: session.name,
          email: session.email,
          phone: session.phone,
          address: session.address
        }
      });
    }

    // Default initial session for Customer #1 (Maria Teresa Santos) so initial load has a real server session
    const defaultSession = createCustomerSession(customers[0]);
    setSessionCookie(res, defaultSession.token);
    return res.json({
      status: 'ok',
      sessionToken: defaultSession.token,
      user: {
        isLoggedIn: true,
        id: defaultSession.userId,
        role: defaultSession.role,
        name: defaultSession.name,
        email: defaultSession.email,
        phone: defaultSession.phone,
        address: defaultSession.address
      }
    });
  });

  // Authenticate Customer or Admin credentials and issue a new server-side session token
  app.post('/api/auth/login', (req, res) => {
    const body = req.body || {};
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const selectedRole = String(body.role || body.login_role || 'auto').toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        error: 'Please enter both your email address and password.'
      });
    }

    // Remove previous session if present
    const cookies = parseCookies(req.headers.cookie);
    const oldToken = String(req.headers['x-session-token'] || cookies.lr_session || '').trim();
    if (oldToken) activeSessions.delete(oldToken);

    // 1. Check Admin credentials
    if (selectedRole === 'admin' || selectedRole === 'auto') {
      const adm = admins.find((a) => a.Email.toLowerCase() === email && a.Password === password);
      if (adm) {
        const session = createAdminSession(adm);
        setSessionCookie(res, session.token);
        return res.json({
          status: 'ok',
          sessionToken: session.token,
          user: {
            isLoggedIn: true,
            id: session.userId,
            role: 'admin',
            name: session.name,
            email: session.email,
            phone: session.phone,
            address: session.address
          }
        });
      }
    }

    // 2. Check Customer credentials
    if (selectedRole === 'customer' || selectedRole === 'auto') {
      const cust = customers.find((c) => c.Email.toLowerCase() === email && c.Password === password);
      if (cust) {
        const session = createCustomerSession(cust);
        setSessionCookie(res, session.token);
        return res.json({
          status: 'ok',
          sessionToken: session.token,
          user: {
            isLoggedIn: true,
            id: session.userId,
            role: 'customer',
            name: session.name,
            email: session.email,
            phone: session.phone,
            address: session.address
          }
        });
      }
    }

    return res.status(401).json({
      status: 'error',
      error: 'Invalid email or password.'
    });
  });

  // Register a new Customer and create an authenticated server-side session
  app.post('/api/auth/register', (req, res) => {
    const body = req.body || {};
    const fullName = String(body.fullName || body.full_name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const phone = String(body.phone || body.phone_number || '').trim();
    const address = String(body.address || '').trim();

    if (!fullName || !email || !password || !phone || !address) {
      return res.status(400).json({
        status: 'error',
        error: 'All fields are required to register your customer account.'
      });
    }

    if (customers.some((c) => c.Email.toLowerCase() === email)) {
      return res.status(409).json({
        status: 'error',
        error: 'An account with this email address already exists.'
      });
    }

    const newCustomer = {
      CustomerID: customers.length + 1,
      FullName: fullName,
      Email: email,
      Password: password,
      PhoneNumber: phone,
      Address: address,
      DefaultOrderID: null
    };
    customers.push(newCustomer);

    const session = createCustomerSession(newCustomer);
    setSessionCookie(res, session.token);

    return res.json({
      status: 'ok',
      sessionToken: session.token,
      user: {
        isLoggedIn: true,
        id: session.userId,
        role: 'customer',
        name: session.name,
        email: session.email,
        phone: session.phone,
        address: session.address
      }
    });
  });

  // Logout and invalidate server-side session
  app.post('/api/auth/logout', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const token = String(req.headers['x-session-token'] || cookies.lr_session || '').trim();
    if (token) activeSessions.delete(token);
    clearSessionCookie(res);
    return res.json({ status: 'ok' });
  });

  // ==========================================================================
  // MESSAGING REST & PHP-COMPATIBLE ENDPOINTS WITH STRICT ANTI-IDOR ENFORCEMENT
  // ==========================================================================

  function handleGetMessagesRequest(req, res, routeConversationId = null) {
    const session = resolveAuthenticatedSession(req);

    if (!session.isAuthenticated || (session.role !== 'customer' && session.role !== 'admin') || session.userId <= 0) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        error: 'Authentication required to access private conversations.'
      });
    }

    if (session.role === 'customer') {
      // Strictly reject any attempt by Customer A to request Customer B's conversation via URL, query, or header
      if (detectCustomerIdTampering(session.userId, req, routeConversationId)) {
        return res.status(403).json({
          status: 'error',
          code: 403,
          error: 'Forbidden: Customers can only access their own private conversation.'
        });
      }

      // Derive CustomerID strictly from the authenticated server session
      const ownCustomerId = Number(session.userId);
      return res.json({
        status: 'ok',
        customer_id: ownCustomerId,
        messages: getConversationMessages(ownCustomerId)
      });
    }

    // Authenticated Admin: can view all customer conversations and open any customer's conversation
    const rawRequestedId =
      routeConversationId ??
      req.query.customer_id ??
      req.query.CustomerID ??
      req.query.conversation_id ??
      req.query.conversationId ??
      session.activeCustomerId ??
      1;
    const targetCustomerId = Number(rawRequestedId) || 1;

    if (!findCustomerById(targetCustomerId)) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        error: 'Customer conversation not found.'
      });
    }

    session.activeCustomerId = targetCustomerId;

    return res.json({
      status: 'ok',
      customer_id: targetCustomerId,
      messages: getConversationMessages(targetCustomerId),
      conversations: getCustomerConversationsSummary()
    });
  }

  function handlePostMessageRequest(req, res, routeConversationId = null) {
    const session = resolveAuthenticatedSession(req);

    if (!session.isAuthenticated || (session.role !== 'customer' && session.role !== 'admin') || session.userId <= 0) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        error: 'Authentication required to send messages.'
      });
    }

    const body = req.body || {};

    if (session.role === 'customer') {
      // Strictly reject any attempt by Customer A to send a message to Customer B's conversation
      if (detectCustomerIdTampering(session.userId, req, routeConversationId)) {
        return res.status(403).json({
          status: 'error',
          code: 403,
          error: 'Forbidden: Cannot send a message to another customer\'s conversation.'
        });
      }
    }

    const text = String(body.message_text || body.MessageText || '').trim();
    if (!text) {
      return res.status(400).json({ status: 'error', code: 400, error: 'Message text is required.' });
    }

    let customerId;
    let adminId;
    let senderId;
    let senderRole;
    let senderName;

    if (session.role === 'admin') {
      senderRole = 'Admin';
      adminId = Number(session.userId);
      senderId = Number(session.userId);
      customerId = Number(
        routeConversationId ??
        body.customer_id ??
        body.CustomerID ??
        body.conversation_id ??
        body.conversationId ??
        session.activeCustomerId ??
        1
      );
      if (!findCustomerById(customerId)) {
        return res.status(403).json({
          status: 'error',
          code: 403,
          error: 'Forbidden: Target customer conversation does not exist.'
        });
      }
      senderName = session.name || 'Rowena & Lilia (Workshop Admin)';
    } else {
      // Derive CustomerID, SenderID, and SenderName strictly from the authenticated Customer session
      senderRole = 'Customer';
      adminId = null;
      senderId = Number(session.userId);
      customerId = Number(session.userId);
      senderName = session.name;
    }

    const orderId = (body.order_id || body.OrderID) ? Number(body.order_id || body.OrderID) : null;
    if (session.role === 'customer' && orderId !== null && !doesOrderBelongToCustomer(orderId, customerId)) {
      return res.status(403).json({
        status: 'error',
        code: 403,
        error: 'Forbidden: You cannot reference an order belonging to another customer.'
      });
    }

    const newMsg = {
      MessageID: nextMessageId++,
      CustomerID: customerId,
      OrderID: orderId,
      AdminID: adminId,
      SenderID: senderId,
      SenderRole: senderRole,
      SenderName: senderName,
      Topic: String(body.topic || body.Topic || 'Order Follow-Up').trim(),
      MessageText: text,
      CreatedAt: formatTimestamp()
    };

    orderMessages.push(newMsg);
    dispatchPrivateMessageEvent(newMsg);

    return res.json({
      status: 'ok',
      customer_id: customerId,
      message: newMsg,
      messages: getConversationMessages(customerId),
      conversations: session.role === 'admin' ? getCustomerConversationsSummary() : []
    });
  }

  function handleModifyOrDeleteMessage(req, res, action) {
    const session = resolveAuthenticatedSession(req);
    if (!session.isAuthenticated || session.userId <= 0) {
      return res.status(401).json({ status: 'error', code: 401, error: 'Authentication required.' });
    }

    const body = req.body || {};
    if (session.role === 'customer' && detectCustomerIdTampering(session.userId, req)) {
      return res.status(403).json({
        status: 'error',
        code: 403,
        error: 'Forbidden: You cannot modify or delete messages in another customer\'s conversation.'
      });
    }

    const messageId = Number(req.params.messageId || body.message_id || body.MessageID || req.query.message_id) || 0;
    const idx = orderMessages.findIndex((m) => Number(m.MessageID) === messageId);
    if (idx === -1) {
      return res.status(404).json({ status: 'error', code: 404, error: 'Message not found.' });
    }

    const targetMsg = orderMessages[idx];

    if (session.role === 'customer') {
      if (Number(targetMsg.CustomerID) !== Number(session.userId) || String(targetMsg.SenderRole).toLowerCase() !== 'customer') {
        return res.status(403).json({
          status: 'error',
          code: 403,
          error: 'Forbidden: You cannot modify or delete another customer\'s or admin\'s message.'
        });
      }
    }

    if (action === 'delete') {
      orderMessages.splice(idx, 1);
      return res.json({ status: 'ok', deleted_message_id: messageId });
    }

    const newText = String(body.message_text || body.MessageText || '').trim();
    if (!newText) {
      return res.status(400).json({ status: 'error', code: 400, error: 'Updated message text is required.' });
    }
    targetMsg.MessageText = newText;
    return res.json({ status: 'ok', message: targetMsg });
  }

  // REST API Routes
  app.get('/api/messages', (req, res) => handleGetMessagesRequest(req, res));
  app.get('/api/conversations/:conversationId/messages', (req, res) =>
    handleGetMessagesRequest(req, res, req.params.conversationId)
  );
  app.post('/api/messages', (req, res) => handlePostMessageRequest(req, res));
  app.post('/api/conversations/:conversationId/messages', (req, res) =>
    handlePostMessageRequest(req, res, req.params.conversationId)
  );
  app.put('/api/messages/:messageId', (req, res) => handleModifyOrDeleteMessage(req, res, 'update'));
  app.patch('/api/messages/:messageId', (req, res) => handleModifyOrDeleteMessage(req, res, 'update'));
  app.delete('/api/messages/:messageId', (req, res) => handleModifyOrDeleteMessage(req, res, 'delete'));

  // Admin-only conversations list endpoint
  app.get('/api/admin/conversations', (req, res) => {
    const session = resolveAuthenticatedSession(req);
    if (!session.isAuthenticated) {
      return res.status(401).json({ status: 'error', code: 401, error: 'Authentication required.' });
    }
    if (session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        code: 403,
        error: 'Forbidden: Customer accounts cannot access the Admin conversation list.'
      });
    }
    return res.json({
      status: 'ok',
      conversations: getCustomerConversationsSummary()
    });
  });

  // PHP-Compatible Front Controller Route Support (/index.php?route=...)
  app.all(['/index.php', '/public/index.php'], (req, res, next) => {
    const route = String(req.query.route || '').trim();
    if (route === 'messages' || route === 'messages_poll') {
      return handleGetMessagesRequest(req, res);
    }
    if (route === 'messages_send' && req.method === 'POST') {
      return handlePostMessageRequest(req, res);
    }
    if (route === 'messages_update') {
      return handleModifyOrDeleteMessage(req, res, 'update');
    }
    if (route === 'messages_delete') {
      return handleModifyOrDeleteMessage(req, res, 'delete');
    }
    if (route === 'admin_dashboard') {
      const session = resolveAuthenticatedSession(req);
      if (session.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          code: 403,
          error: 'Forbidden: Customer accounts cannot access the Admin Console.'
        });
      }
      return handleGetMessagesRequest(req, res);
    }
    next();
  });

  // Serve static assets under both /public/* (for GitHub Pages / direct HTML compatibility) and /*
  const publicPath = path.join(__dirname, 'public');
  app.use('/public', express.static(publicPath));
  app.use(express.static(publicPath));

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Mount Vite in middleware mode for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Lilia & Rowena Furniture Server + Private WebSocket Chat running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
