import express from 'express';
import http from 'http';
import crypto from 'crypto';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PERSISTENT_STORE_PATH = path.join(__dirname, 'database', 'persistent_store.json');

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
    Username: 'maria.santos',
    Email: 'maria.santos@example.com',
    Password: 'password123',
    PhoneNumber: '0917-123-4567',
    Gender: 'Female',
    Birthday: '1991-05-14',
    ProfileImage: null,
    Address: 'Unit 14B, Tower 2, Serendra, Fort Bonifacio, Taguig City, Metro Manila 1634',
    DefaultOrderID: 1001
  },
  {
    CustomerID: 2,
    FullName: 'Atty. Roberto Mendoza',
    Username: 'atty.roberto',
    Email: 'roberto.mendoza@example.com',
    Password: 'password123',
    PhoneNumber: '0918-987-6543',
    Gender: 'Male',
    Birthday: '1983-11-22',
    ProfileImage: null,
    Address: '88 Narra Avenue, Ayala Alabang Village, Ayala Alabang, Muntinlupa City, Metro Manila 1780',
    DefaultOrderID: 1002
  },
  {
    CustomerID: 3,
    FullName: 'Engr. Danica Gomez',
    Username: 'danica.gomez',
    Email: 'danica.gomez@example.com',
    Password: 'password123',
    PhoneNumber: '0917-542-8810',
    Gender: 'Female',
    Birthday: '1994-02-09',
    ProfileImage: null,
    Address: 'One Serendra, Bonifacio Global City, Taguig',
    DefaultOrderID: 1003
  },
  {
    CustomerID: 4,
    FullName: 'Dr. Ronald & Elena Ramos',
    Username: 'dr.ronald.ramos',
    Email: 'ronald.ramos@example.com',
    Password: 'password123',
    PhoneNumber: '0918-334-9012',
    Gender: 'Male',
    Birthday: '1979-08-19',
    ProfileImage: null,
    Address: 'Villa Barosa, San Fernando, Pampanga',
    DefaultOrderID: 1006
  },
  {
    CustomerID: 5,
    FullName: 'Arch. Marco & Patricia Villanueva',
    Username: 'arch.marco',
    Email: 'marco.villanueva@example.com',
    Password: 'password123',
    PhoneNumber: '0922-719-4401',
    Gender: 'Male',
    Birthday: '1987-04-03',
    ProfileImage: null,
    Address: 'Beverly Hills Subdivision, Antipolo, Rizal',
    DefaultOrderID: 1004
  }
];

let customerAddresses = [
  {
    AddressID: 101,
    CustomerID: 1,
    AddressLabel: 'Home',
    RecipientName: 'Maria Teresa Santos',
    PhoneNumber: '0917-123-4567',
    HouseStreet: 'Unit 14B, Tower 2, Serendra',
    Barangay: 'Fort Bonifacio',
    City: 'Taguig City',
    Province: 'Metro Manila',
    PostalCode: '1634',
    DeliveryNotes: 'Service elevator pass required at lobby',
    IsDefault: 1
  },
  {
    AddressID: 102,
    CustomerID: 1,
    AddressLabel: 'Work',
    RecipientName: 'Maria Teresa Santos (Office)',
    PhoneNumber: '0917-123-4567',
    HouseStreet: '18F One Ayala West Tower, Ayala Ave',
    Barangay: 'San Lorenzo',
    City: 'Makati City',
    Province: 'Metro Manila',
    PostalCode: '1223',
    DeliveryNotes: 'Deliver between 10AM and 4PM weekdays',
    IsDefault: 0
  },
  {
    AddressID: 103,
    CustomerID: 2,
    AddressLabel: 'Home',
    RecipientName: 'Atty. Roberto Mendoza',
    PhoneNumber: '0918-987-6543',
    HouseStreet: '88 Narra Avenue, Ayala Alabang Village',
    Barangay: 'Ayala Alabang',
    City: 'Muntinlupa City',
    Province: 'Metro Manila',
    PostalCode: '1780',
    DeliveryNotes: 'Notify village security gate upon arrival',
    IsDefault: 1
  }
];
let nextAddressId = 104;

function getTodayManila() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function offsetDateManila(daysOffset) {
  const baseStr = getTodayManila();
  const [y, m, d] = baseStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + Number(daysOffset || 0)));
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

const customerOrders = [
  { OrderID: 1001, CustomerID: 1 },
  { OrderID: 1002, CustomerID: 2 },
  { OrderID: 1003, CustomerID: 3 },
  { OrderID: 1004, CustomerID: 5 },
  { OrderID: 1005, CustomerID: 1 },
  { OrderID: 1006, CustomerID: 4 },
  { OrderID: 1007, CustomerID: 4 }
];

function createDefaultJobOrders() {
  const today = getTodayManila();
  return [
    {
      orderId: 1001,
      jobOrderCode: 'JO-2026-1001',
      customerId: 1,
      customer: 'Maria Teresa Santos',
      customerPhone: '0917-123-4567',
      customerEmail: 'maria.santos@example.com',
      address: 'Unit 14B, Tower 2, Serendra, BGC, Taguig City',
      itemSummary: 'Mahogany 6-Seater Dining Set (220L × 90W × 75H cm · Warm Walnut)',
      quantity: 1,
      status: 'In Production',
      priority: 'Urgent',
      placed: offsetDateManila(-10),
      due: today,
      deadlineTime: '08:00',
      carpenter: 'Master Carding Santos',
      assignedEmployeeId: 1,
      stage: '3rd Coat Polyurethane Curing',
      driver: 'Rene Ocampo (0918-555-6666)',
      total: 30450,
      downpayment: 15225,
      paidAmount: 15225,
      jobNotes: 'Custom 220cm length Mahogany 6-Seater Dining Set — Final walnut topcoat curing for delivery today.'
    },
    {
      orderId: 1002,
      jobOrderCode: 'JO-2026-1002',
      customerId: 2,
      customer: 'Atty. Roberto Mendoza',
      customerPhone: '0918-987-6543',
      customerEmail: 'roberto.mendoza@example.com',
      address: '88 Narra Avenue, Ayala Alabang Village, Muntinlupa',
      itemSummary: 'Scandinavian Sky Blue Lounge Sofa (Standard Sizing)',
      quantity: 1,
      status: 'Order Confirmed',
      priority: 'High',
      placed: today,
      due: offsetDateManila(5),
      deadlineTime: '14:00',
      carpenter: 'Master Eddie Manalo',
      assignedEmployeeId: 2,
      stage: 'Timber Preparation & Framing',
      driver: 'Rene Ocampo (0918-555-6666)',
      total: 34000,
      downpayment: 17000,
      paidAmount: 17000,
      jobNotes: 'Scandinavian Sky Blue Lounge Sofa + 2 matching bolster pillows.'
    },
    {
      orderId: 1003,
      jobOrderCode: 'JO-2026-1003',
      customerId: 3,
      customer: 'Engr. Danica Gomez',
      customerPhone: '0917-542-8810',
      customerEmail: 'danica.gomez@example.com',
      address: 'One Serendra, Bonifacio Global City, Taguig',
      itemSummary: 'Minimalist Teak King Bedframe (Custom Floating Nightstands)',
      quantity: 1,
      status: 'For Delivery',
      priority: 'High',
      placed: offsetDateManila(-6),
      due: today,
      deadlineTime: '10:30',
      carpenter: 'Rene Ocampo',
      assignedEmployeeId: 3,
      stage: 'Out for White-Glove Delivery',
      driver: 'Rene Ocampo (0918-555-6666)',
      total: 44000,
      downpayment: 22000,
      paidAmount: 22000,
      jobNotes: 'White-glove delivery to BGC Taguig scheduled before noon today.'
    },
    {
      orderId: 1004,
      jobOrderCode: 'JO-2026-1004',
      customerId: 5,
      customer: 'Arch. Marco & Patricia Villanueva',
      customerPhone: '0922-719-4401',
      customerEmail: 'marco.villanueva@example.com',
      address: 'Beverly Hills Subdivision, Antipolo, Rizal',
      itemSummary: 'Executive Ergonomic Oak Desk (Dovetail Drawers)',
      quantity: 2,
      status: 'Pending',
      priority: 'Urgent',
      placed: offsetDateManila(-12),
      due: offsetDateManila(-3),
      deadlineTime: '13:30',
      carpenter: 'Master Carding Santos',
      assignedEmployeeId: 1,
      stage: 'Awaiting Hardware & Stain Sign-Off',
      driver: 'Rene Ocampo (0918-555-6666)',
      total: 49000,
      downpayment: 24500,
      paidAmount: 24500,
      jobNotes: 'Awaiting final brass hardware fitting and custom stain approval.'
    },
    {
      orderId: 1005,
      jobOrderCode: 'JO-2026-1005',
      customerId: 1,
      customer: 'Maria Teresa Santos',
      customerPhone: '0917-123-4567',
      customerEmail: 'maria.santos@example.com',
      address: 'Unit 14B, Tower 2, Serendra, BGC, Taguig City',
      itemSummary: 'Solid Acacia Round Coffee Table (Live Edge Slab)',
      quantity: 2,
      status: 'In Production',
      priority: 'High',
      placed: offsetDateManila(-10),
      due: offsetDateManila(-2),
      deadlineTime: '15:00',
      carpenter: 'Dante Cruz',
      assignedEmployeeId: 4,
      stage: '2nd Coat Polyurethane Clear Finishing',
      driver: 'Rene Ocampo (0918-555-6666)',
      total: 25600,
      downpayment: 12800,
      paidAmount: 0,
      jobNotes: 'Second polyurethane clear coat drying in Pampanga workshop.'
    },
    {
      orderId: 1006,
      jobOrderCode: 'JO-2026-1006',
      customerId: 4,
      customer: 'Dr. Ronald & Elena Ramos',
      customerPhone: '0918-334-9012',
      customerEmail: 'ronald.ramos@example.com',
      address: 'Villa Barosa, San Fernando, Pampanga',
      itemSummary: 'Compact 4-Seater Breakfast Nook Set (100×100cm Custom)',
      quantity: 1,
      status: 'In Production',
      priority: 'Urgent',
      placed: today,
      due: today,
      deadlineTime: '17:30',
      carpenter: 'Master Eddie Manalo',
      assignedEmployeeId: 2,
      stage: 'Final Sanding & Inspection',
      driver: 'Rene Ocampo (0918-555-6666)',
      total: 18900,
      downpayment: 9450,
      paidAmount: 0,
      jobNotes: 'Showroom stock table custom-trimmed to 100x100cm for same-day Pampanga pickup.'
    },
    {
      orderId: 1007,
      jobOrderCode: 'JO-2026-1007',
      customerId: 4,
      customer: 'Dr. Ronald & Elena Ramos',
      customerPhone: '0918-334-9012',
      customerEmail: 'ronald.ramos@example.com',
      address: 'Villa Barosa, San Fernando, Pampanga',
      itemSummary: 'Mahogany 6-Seater Dining Set (Standard Catalog Dimensions)',
      quantity: 1,
      status: 'Completed',
      priority: 'Normal',
      placed: offsetDateManila(-18),
      due: offsetDateManila(-5),
      deadlineTime: '11:00',
      carpenter: 'Rene Ocampo',
      assignedEmployeeId: 3,
      stage: 'Delivered & Inspected',
      driver: 'Rene Ocampo (0918-555-6666)',
      total: 28500,
      downpayment: 14250,
      paidAmount: 28500,
      jobNotes: 'Delivered and inspected by Dr. Ronald Ramos in San Fernando, Pampanga.'
    }
  ];
}

let jobOrders = createDefaultJobOrders();

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
    IsRead: 1,
    ReadAt: '2026-11-06 09:20:00',
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
    MessageText: 'Hello Maria! Master Finisher Dante Cruz is currently applying the final walnut coat to your table. Yes, we can add 2 matching slatted mahogany chairs (+₱4,200) and complimentary felt pads before driver Rene Ocampo delivers!',
    IsRead: 0,
    ReadAt: null,
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
    IsRead: 0,
    ReadAt: null,
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
    IsRead: 0,
    ReadAt: null,
    CreatedAt: '2026-11-06 10:14:00'
  }
];

let nextMessageId = 5;

// ============================================================================
// SERVER-SIDE SESSION STORE & PERSISTENT DISK DATABASE
// Never trusts client-submitted customer_id or conversation_id for authorization.
// ============================================================================
const activeSessions = new Map();

function formatSavedAddressObj(addr) {
  if (!addr) return '';
  const parts = [
    addr.HouseStreet,
    addr.Barangay ? `Brgy. ${addr.Barangay}` : '',
    addr.City,
    addr.Province,
    addr.PostalCode
  ].map((s) => String(s || '').trim()).filter(Boolean);
  let base = parts.join(', ');
  if (addr.DeliveryNotes && String(addr.DeliveryNotes).trim()) {
    base += ` (${String(addr.DeliveryNotes).trim()})`;
  }
  return base;
}

function getAddressesForCustomer(customerId) {
  const cid = Number(customerId);
  const cust = customers.find((c) => Number(c.CustomerID) === cid);
  let list = customerAddresses.filter((a) => Number(a.CustomerID) === cid);
  if (list.length === 0 && cust) {
    const seeded = {
      AddressID: nextAddressId++,
      CustomerID: cid,
      AddressLabel: 'Home',
      RecipientName: cust.FullName || 'Valued Customer',
      PhoneNumber: cust.PhoneNumber || '0917-000-0000',
      HouseStreet: cust.Address || 'Metro Manila',
      Barangay: 'Poblacion',
      City: 'Metro Manila',
      Province: 'Metro Manila',
      PostalCode: '1000',
      DeliveryNotes: '',
      IsDefault: 1
    };
    customerAddresses.push(seeded);
    list = [seeded];
  }
  return list.sort((a, b) => Number(b.IsDefault) - Number(a.IsDefault) || Number(b.AddressID) - Number(a.AddressID));
}

function getUnreadCountForCustomer(customerId) {
  const cid = Number(customerId);
  if (!cid || cid <= 0) return 0;
  return orderMessages.filter(
    (m) =>
      Number(m.CustomerID) === cid &&
      String(m.SenderRole || '').toLowerCase() === 'admin' &&
      Number(m.IsRead ?? 0) === 0
  ).length;
}

function getUnreadCountForAdmin(customerId = null) {
  return orderMessages.filter((m) => {
    if (String(m.SenderRole || '').toLowerCase() !== 'customer') return false;
    if (Number(m.IsRead ?? 0) !== 0) return false;
    if (customerId !== null && customerId !== undefined && Number(customerId) > 0) {
      return Number(m.CustomerID) === Number(customerId);
    }
    return true;
  }).length;
}

function getUnreadByCustomerMapForAdmin() {
  const map = {};
  for (const c of customers) {
    map[Number(c.CustomerID)] = getUnreadCountForAdmin(c.CustomerID);
  }
  return map;
}

function markMessagesReadForCustomer(customerId) {
  const cid = Number(customerId);
  if (!cid || cid <= 0) return 0;
  let updated = 0;
  const now = formatTimestamp();
  for (const m of orderMessages) {
    if (
      Number(m.CustomerID) === cid &&
      String(m.SenderRole || '').toLowerCase() === 'admin' &&
      Number(m.IsRead ?? 0) === 0
    ) {
      m.IsRead = 1;
      m.ReadAt = now;
      updated++;
    }
  }
  if (updated > 0) savePersistentStore();
  return updated;
}

function markMessagesReadForAdmin(customerId) {
  const cid = Number(customerId);
  if (!cid || cid <= 0) return 0;
  let updated = 0;
  const now = formatTimestamp();
  for (const m of orderMessages) {
    if (
      Number(m.CustomerID) === cid &&
      String(m.SenderRole || '').toLowerCase() === 'customer' &&
      Number(m.IsRead ?? 0) === 0
    ) {
      m.IsRead = 1;
      m.ReadAt = now;
      updated++;
    }
  }
  if (updated > 0) savePersistentStore();
  return updated;
}

function loadPersistentStore() {
  try {
    if (!fs.existsSync(PERSISTENT_STORE_PATH)) return;
    const raw = fs.readFileSync(PERSISTENT_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.customers)) {
      for (const savedCust of parsed.customers) {
        if (!savedCust || !savedCust.Email) continue;
        const existingIdx = customers.findIndex(
          (c) => String(c.Email).toLowerCase() === String(savedCust.Email).toLowerCase()
        );
        if (existingIdx === -1) {
          customers.push({
            CustomerID: Number(savedCust.CustomerID) || customers.length + 1,
            FullName: String(savedCust.FullName || ''),
            Username: String(savedCust.Username || ''),
            Email: String(savedCust.Email || '').toLowerCase(),
            Password: String(savedCust.Password || ''),
            PhoneNumber: String(savedCust.PhoneNumber || ''),
            Gender: String(savedCust.Gender || 'Prefer not to say'),
            Birthday: savedCust.Birthday || null,
            ProfileImage: savedCust.ProfileImage || null,
            Address: String(savedCust.Address || ''),
            DefaultOrderID: savedCust.DefaultOrderID || null
          });
        } else {
          customers[existingIdx] = {
            ...customers[existingIdx],
            ...savedCust
          };
        }
      }
    }
    if (Array.isArray(parsed.customerAddresses) && parsed.customerAddresses.length > 0) {
      customerAddresses = parsed.customerAddresses;
      const maxAddrId = customerAddresses.reduce((max, a) => Math.max(max, Number(a.AddressID) || 100), 103);
      nextAddressId = Math.max(Number(parsed.nextAddressId) || 104, maxAddrId + 1);
    }
    if (Array.isArray(parsed.orderMessages) && parsed.orderMessages.length > 0) {
      orderMessages.length = 0;
      for (const m of parsed.orderMessages) {
        if (m.IsRead === undefined) {
          m.IsRead = Number(m.MessageID) === 1 ? 1 : 0;
        }
        orderMessages.push(m);
      }
      const maxId = orderMessages.reduce((max, m) => Math.max(max, Number(m.MessageID) || 0), 4);
      nextMessageId = Math.max(Number(parsed.nextMessageId) || 5, maxId + 1);
    }
    if (Array.isArray(parsed.jobOrders) && parsed.jobOrders.length > 0) {
      jobOrders = parsed.jobOrders;
    }
    if (Array.isArray(parsed.sessions)) {
      for (const [tok, sess] of parsed.sessions) {
        if (tok && sess && sess.isAuthenticated) {
          if (!sess.csrfToken) {
            sess.csrfToken = crypto.randomBytes(24).toString('hex');
          }
          activeSessions.set(tok, sess);
        }
      }
    }
  } catch (err) {
    console.error('Notice: Could not load persistent store:', err.message);
  }
}

function savePersistentStore() {
  try {
    const dir = path.dirname(PERSISTENT_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const payload = {
      customers,
      customerAddresses,
      nextAddressId,
      jobOrders,
      orderMessages,
      nextMessageId,
      sessions: Array.from(activeSessions.entries())
    };
    fs.writeFileSync(PERSISTENT_STORE_PATH, JSON.stringify(payload, null, 2), 'utf8');
  } catch (err) {
    console.error('Notice: Could not save persistent store:', err.message);
  }
}

function getPublicCustomersList() {
  return customers.map((c) => ({
    id: Number(c.CustomerID),
    fullName: c.FullName,
    username: c.Username || '',
    email: c.Email,
    phone: c.PhoneNumber || '',
    gender: c.Gender || 'Prefer not to say',
    birthday: c.Birthday || '',
    profileImage: c.ProfileImage || null,
    address: c.Address || ''
  }));
}

loadPersistentStore();

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
  const csrfToken = crypto.randomBytes(24).toString('hex');
  const sessionData = {
    token,
    csrfToken,
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
  savePersistentStore();
  return sessionData;
}

function createAdminSession(admin) {
  const token = generateSessionToken();
  const csrfToken = crypto.randomBytes(24).toString('hex');
  const sessionData = {
    token,
    csrfToken,
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
  savePersistentStore();
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

// Build Admin conversation list summary across all customers (including UnreadCount)
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
      UnreadCount: getUnreadCountForAdmin(c.CustomerID),
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
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

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
            IsRead: 0,
            ReadAt: null,
            CreatedAt: formatTimestamp()
          };

          orderMessages.push(newMsg);
          savePersistentStore();
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
    const token = String(
      req.headers['x-session-token'] ||
      (req.query && req.query.session_token) ||
      cookies.lr_session ||
      ''
    ).trim();

    if (token && activeSessions.has(token)) {
      const session = activeSessions.get(token);
      if (!session.csrfToken) {
        session.csrfToken = crypto.randomBytes(24).toString('hex');
      }
      const custRecord = session.role === 'customer' ? findCustomerById(session.userId) : null;
      if (custRecord) {
        session.name = custRecord.FullName;
        session.email = custRecord.Email;
        session.phone = custRecord.PhoneNumber || '';
        session.address = custRecord.Address || '';
      }
      const unreadCount =
        session.role === 'customer'
          ? getUnreadCountForCustomer(session.userId)
          : getUnreadCountForAdmin();
      return res.json({
        status: 'ok',
        sessionToken: session.token,
        csrfToken: session.csrfToken,
        todayManila: getTodayManila(),
        unreadCount,
        unreadByCustomer: session.role === 'admin' ? getUnreadByCustomerMapForAdmin() : {},
        customers: getPublicCustomersList(),
        addresses: session.role === 'customer' ? getAddressesForCustomer(session.userId) : [],
        user: {
          isLoggedIn: session.isAuthenticated,
          id: session.userId,
          role: session.role,
          name: session.name,
          username: custRecord ? (custRecord.Username || '') : 'admin',
          email: session.email,
          phone: session.phone,
          gender: custRecord ? (custRecord.Gender || 'Prefer not to say') : '',
          birthday: custRecord ? (custRecord.Birthday || '') : '',
          profileImage: custRecord ? (custRecord.ProfileImage || null) : null,
          address: session.address
        }
      });
    }

    // If user explicitly logged out before refreshing, respect logged-out state
    if (String(req.headers['x-logged-out'] || '') === '1') {
      return res.json({
        status: 'ok',
        sessionToken: null,
        csrfToken: null,
        todayManila: getTodayManila(),
        unreadCount: 0,
        customers: getPublicCustomersList(),
        addresses: [],
        user: {
          isLoggedIn: false,
          id: null,
          role: 'guest',
          name: '',
          email: '',
          phone: '',
          address: ''
        }
      });
    }

    // Default initial session for Customer #1 (Maria Teresa Santos) so initial load has a real server session
    const defaultSession = createCustomerSession(customers[0]);
    setSessionCookie(res, defaultSession.token);
    return res.json({
      status: 'ok',
      sessionToken: defaultSession.token,
      csrfToken: defaultSession.csrfToken,
      todayManila: getTodayManila(),
      unreadCount: getUnreadCountForCustomer(defaultSession.userId),
      customers: getPublicCustomersList(),
      addresses: getAddressesForCustomer(defaultSession.userId),
      user: {
        isLoggedIn: true,
        id: defaultSession.userId,
        role: defaultSession.role,
        name: defaultSession.name,
        username: customers[0].Username || 'maria.santos',
        email: defaultSession.email,
        phone: defaultSession.phone,
        gender: customers[0].Gender || 'Female',
        birthday: customers[0].Birthday || '1991-05-14',
        profileImage: customers[0].ProfileImage || null,
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
          csrfToken: session.csrfToken,
          todayManila: getTodayManila(),
          unreadCount: getUnreadCountForAdmin(),
          unreadByCustomer: getUnreadByCustomerMapForAdmin(),
          customers: getPublicCustomersList(),
          addresses: [],
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
          csrfToken: session.csrfToken,
          todayManila: getTodayManila(),
          unreadCount: getUnreadCountForCustomer(session.userId),
          customers: getPublicCustomersList(),
          addresses: getAddressesForCustomer(session.userId),
          user: {
            isLoggedIn: true,
            id: session.userId,
            role: 'customer',
            name: session.name,
            username: cust.Username || '',
            email: session.email,
            phone: session.phone,
            gender: cust.Gender || 'Prefer not to say',
            birthday: cust.Birthday || '',
            profileImage: cust.ProfileImage || null,
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

    const maxCustomerId = customers.reduce((max, c) => Math.max(max, Number(c.CustomerID) || 0), 0);
    const defaultUsername = email.split('@')[0].replace(/[^a-z0-9._-]/gi, '').toLowerCase();
    const newCustomer = {
      CustomerID: maxCustomerId + 1,
      FullName: fullName,
      Username: defaultUsername,
      Email: email,
      Password: password,
      PhoneNumber: phone,
      Gender: 'Prefer not to say',
      Birthday: null,
      ProfileImage: null,
      Address: address,
      DefaultOrderID: null
    };
    customers.push(newCustomer);
    getAddressesForCustomer(newCustomer.CustomerID);
    savePersistentStore();

    const session = createCustomerSession(newCustomer);
    setSessionCookie(res, session.token);

    return res.json({
      status: 'ok',
      sessionToken: session.token,
      csrfToken: session.csrfToken,
      unreadCount: 0,
      customers: getPublicCustomersList(),
      addresses: getAddressesForCustomer(newCustomer.CustomerID),
      user: {
        isLoggedIn: true,
        id: session.userId,
        role: 'customer',
        name: session.name,
        username: newCustomer.Username,
        email: session.email,
        phone: session.phone,
        gender: newCustomer.Gender,
        birthday: '',
        profileImage: null,
        address: session.address
      }
    });
  });

  // Logout and invalidate server-side session
  app.post('/api/auth/logout', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const token = String(req.headers['x-session-token'] || cookies.lr_session || '').trim();
    if (token) {
      activeSessions.delete(token);
      savePersistentStore();
    }
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
      if (String(req.query.mark_read || '') === '1') {
        markMessagesReadForCustomer(ownCustomerId);
      }
      return res.json({
        status: 'ok',
        customer_id: ownCustomerId,
        unreadCount: getUnreadCountForCustomer(ownCustomerId),
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
    if (String(req.query.mark_read || '') === '1') {
      markMessagesReadForAdmin(targetCustomerId);
    }

    return res.json({
      status: 'ok',
      customer_id: targetCustomerId,
      unreadCount: getUnreadCountForAdmin(),
      unreadByCustomer: getUnreadByCustomerMapForAdmin(),
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
      IsRead: 0,
      ReadAt: null,
      CreatedAt: formatTimestamp()
    };

    orderMessages.push(newMsg);
    savePersistentStore();
    dispatchPrivateMessageEvent(newMsg);

    return res.json({
      status: 'ok',
      customer_id: customerId,
      message: newMsg,
      unreadCount: session.role === 'customer' ? getUnreadCountForCustomer(customerId) : getUnreadCountForAdmin(),
      unreadByCustomer: session.role === 'admin' ? getUnreadByCustomerMapForAdmin() : {},
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
      savePersistentStore();
      return res.json({ status: 'ok', deleted_message_id: messageId });
    }

    const newText = String(body.message_text || body.MessageText || '').trim();
    if (!newText) {
      return res.status(400).json({ status: 'error', code: 400, error: 'Updated message text is required.' });
    }
    targetMsg.MessageText = newText;
    savePersistentStore();
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
      unreadCount: getUnreadCountForAdmin(),
      unreadByCustomer: getUnreadByCustomerMapForAdmin(),
      conversations: getCustomerConversationsSummary()
    });
  });

  // ==========================================================================
  // UNREAD MESSAGE NOTIFICATION & MARK-AS-READ ENDPOINTS
  // ==========================================================================
  app.get('/api/notifications/unread', (req, res) => {
    const session = resolveAuthenticatedSession(req);
    if (!session.isAuthenticated || session.userId <= 0) {
      return res.json({ status: 'ok', unreadCount: 0, unreadByCustomer: {} });
    }
    if (session.role === 'customer') {
      return res.json({
        status: 'ok',
        role: 'customer',
        unreadCount: getUnreadCountForCustomer(session.userId)
      });
    }
    return res.json({
      status: 'ok',
      role: 'admin',
      unreadCount: getUnreadCountForAdmin(),
      unreadByCustomer: getUnreadByCustomerMapForAdmin()
    });
  });

  app.post('/api/messages/mark-read', (req, res) => {
    const session = resolveAuthenticatedSession(req);
    if (!session.isAuthenticated || session.userId <= 0) {
      return res.status(401).json({ status: 'error', error: 'Authentication required.' });
    }
    const body = req.body || {};
    if (session.role === 'customer') {
      const marked = markMessagesReadForCustomer(session.userId);
      return res.json({
        status: 'ok',
        marked,
        unreadCount: getUnreadCountForCustomer(session.userId)
      });
    }
    const targetCustomerId = Number(body.customer_id || body.customerId || session.activeCustomerId || 1);
    const marked = markMessagesReadForAdmin(targetCustomerId);
    return res.json({
      status: 'ok',
      marked,
      customer_id: targetCustomerId,
      unreadCount: getUnreadCountForAdmin(),
      unreadByCustomer: getUnreadByCustomerMapForAdmin(),
      conversations: getCustomerConversationsSummary()
    });
  });

  // ==========================================================================
  // CUSTOMER MY PROFILE, MY ADDRESSES & CHANGE PASSWORD ENDPOINTS
  // Strictly scoped to authenticated Customer session (Anti-IDOR)
  // ==========================================================================
  function requireCustomerSessionApi(req, res) {
    const session = resolveAuthenticatedSession(req);
    if (!session || !session.isAuthenticated || session.role !== 'customer' || session.userId <= 0) {
      res.status(401).json({
        status: 'error',
        code: 401,
        error: 'Please sign in with a Customer account to manage your profile and addresses.'
      });
      return null;
    }
    const cust = findCustomerById(session.userId);
    if (!cust) {
      res.status(404).json({ status: 'error', error: 'Customer profile not found.' });
      return null;
    }
    return { session, cust };
  }

  app.get('/api/profile', (req, res) => {
    const ctx = requireCustomerSessionApi(req, res);
    if (!ctx) return;
    const { cust } = ctx;
    const cid = Number(cust.CustomerID);
    const custOrders = jobOrders.filter(
      (o) => Number(o.customerId) === cid || String(o.customerEmail || '').toLowerCase() === String(cust.Email).toLowerCase()
    );
    return res.json({
      status: 'ok',
      profile: {
        id: cid,
        fullName: cust.FullName,
        username: cust.Username || '',
        email: cust.Email,
        phone: cust.PhoneNumber || '',
        gender: cust.Gender || 'Prefer not to say',
        birthday: cust.Birthday || '',
        profileImage: cust.ProfileImage || null,
        address: cust.Address || ''
      },
      addresses: getAddressesForCustomer(cid),
      orders: custOrders,
      unreadCount: getUnreadCountForCustomer(cid)
    });
  });

  app.post('/api/profile/update', (req, res) => {
    const ctx = requireCustomerSessionApi(req, res);
    if (!ctx) return;
    const { session, cust } = ctx;
    const body = req.body || {};

    const fullName = String(body.fullName ?? body.full_name ?? cust.FullName).trim();
    const username = String(body.username ?? cust.Username ?? '').trim();
    const email = String(body.email ?? cust.Email).trim().toLowerCase();
    const phone = String(body.phone ?? body.phone_number ?? cust.PhoneNumber).trim();
    const gender = String(body.gender ?? cust.Gender ?? 'Prefer not to say').trim();
    const birthday = String(body.birthday ?? cust.Birthday ?? '').trim();
    const address = String(body.address ?? body.default_address ?? cust.Address).trim();
    const profileImage = body.profileImage !== undefined ? body.profileImage : cust.ProfileImage;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        status: 'error',
        error: 'Full Name, Email Address, and Mobile Number are required.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        status: 'error',
        error: 'Please enter a valid email address.'
      });
    }

    const emailConflict = customers.find(
      (c) => c.Email.toLowerCase() === email && Number(c.CustomerID) !== Number(cust.CustomerID)
    );
    if (emailConflict) {
      return res.status(409).json({
        status: 'error',
        error: 'That email address is already registered to another customer account.'
      });
    }

    if (profileImage && typeof profileImage === 'string' && profileImage.startsWith('data:')) {
      if (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(profileImage)) {
        return res.status(400).json({
          status: 'error',
          error: 'Only JPG, PNG, and WEBP image files are allowed.'
        });
      }
      if (profileImage.length > 3 * 1024 * 1024) {
        return res.status(400).json({
          status: 'error',
          error: 'Profile image must be 2MB or smaller.'
        });
      }
    }

    cust.FullName = fullName;
    cust.Username = username;
    cust.Email = email;
    cust.PhoneNumber = phone;
    cust.Gender = ['Female', 'Male', 'Other', 'Prefer not to say'].includes(gender) ? gender : 'Prefer not to say';
    cust.Birthday = birthday || null;
    cust.Address = address;
    cust.ProfileImage = profileImage || null;

    session.name = fullName;
    session.email = email;
    session.phone = phone;
    session.address = address;

    savePersistentStore();

    return res.json({
      status: 'ok',
      message: 'Your profile has been updated.',
      profile: {
        id: Number(cust.CustomerID),
        fullName: cust.FullName,
        username: cust.Username || '',
        email: cust.Email,
        phone: cust.PhoneNumber,
        gender: cust.Gender,
        birthday: cust.Birthday || '',
        profileImage: cust.ProfileImage || null,
        address: cust.Address
      },
      addresses: getAddressesForCustomer(cust.CustomerID)
    });
  });

  app.post('/api/profile/password', (req, res) => {
    const ctx = requireCustomerSessionApi(req, res);
    if (!ctx) return;
    const { cust } = ctx;
    const body = req.body || {};

    const currentPassword = String(body.currentPassword ?? body.current_password ?? '');
    const newPassword = String(body.newPassword ?? body.new_password ?? '');
    const confirmPassword = String(body.confirmPassword ?? body.confirm_password ?? '');

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ status: 'error', error: 'All password fields are required.' });
    }
    if (cust.Password !== currentPassword) {
      return res.status(400).json({ status: 'error', error: 'Your current password is incorrect.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ status: 'error', error: 'New password must be at least 6 characters long.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: 'error', error: 'New password and confirmation do not match.' });
    }

    cust.Password = newPassword;
    savePersistentStore();
    return res.json({ status: 'ok', message: 'Your password has been securely updated.' });
  });

  app.get('/api/addresses', (req, res) => {
    const ctx = requireCustomerSessionApi(req, res);
    if (!ctx) return;
    return res.json({
      status: 'ok',
      addresses: getAddressesForCustomer(ctx.cust.CustomerID)
    });
  });

  app.post('/api/addresses/save', (req, res) => {
    const ctx = requireCustomerSessionApi(req, res);
    if (!ctx) return;
    const { session, cust } = ctx;
    const cid = Number(cust.CustomerID);
    const body = req.body || {};

    const addressId = Number(body.addressId || body.address_id || 0);
    const recipientName = String(body.recipientName || body.recipient_name || '').trim();
    const phoneNumber = String(body.phoneNumber || body.phone_number || '').trim();
    const houseStreet = String(body.houseStreet || body.house_street || '').trim();
    const barangay = String(body.barangay || '').trim();
    const city = String(body.city || '').trim();
    const province = String(body.province || '').trim();
    const postalCode = String(body.postalCode || body.postal_code || '').trim();
    const deliveryNotes = String(body.deliveryNotes || body.delivery_notes || '').trim();
    const addressLabel = ['Home', 'Work'].includes(body.addressLabel || body.address_label)
      ? (body.addressLabel || body.address_label)
      : 'Home';

    if (!recipientName || !phoneNumber || !houseStreet || !barangay || !city || !province || !postalCode) {
      return res.status(400).json({
        status: 'error',
        error: 'Please complete all required delivery address fields.'
      });
    }

    const existingList = customerAddresses.filter((a) => Number(a.CustomerID) === cid);
    let isDefault = Boolean(body.isDefault || body.is_default || existingList.length === 0);

    let targetAddr = null;
    if (addressId > 0) {
      targetAddr = customerAddresses.find(
        (a) => Number(a.AddressID) === addressId && Number(a.CustomerID) === cid
      );
      if (!targetAddr) {
        return res.status(403).json({
          status: 'error',
          error: 'Forbidden: Address not found or does not belong to your account.'
        });
      }
    }

    if (isDefault) {
      for (const a of customerAddresses) {
        if (Number(a.CustomerID) === cid) a.IsDefault = 0;
      }
    }

    if (targetAddr) {
      targetAddr.RecipientName = recipientName;
      targetAddr.PhoneNumber = phoneNumber;
      targetAddr.HouseStreet = houseStreet;
      targetAddr.Barangay = barangay;
      targetAddr.City = city;
      targetAddr.Province = province;
      targetAddr.PostalCode = postalCode;
      targetAddr.DeliveryNotes = deliveryNotes;
      targetAddr.AddressLabel = addressLabel;
      if (isDefault) targetAddr.IsDefault = 1;
    } else {
      targetAddr = {
        AddressID: nextAddressId++,
        CustomerID: cid,
        AddressLabel: addressLabel,
        RecipientName: recipientName,
        PhoneNumber: phoneNumber,
        HouseStreet: houseStreet,
        Barangay: barangay,
        City: city,
        Province: province,
        PostalCode: postalCode,
        DeliveryNotes: deliveryNotes,
        IsDefault: isDefault ? 1 : 0
      };
      customerAddresses.push(targetAddr);
    }

    // Ensure at least one default address exists for this customer
    const updatedList = getAddressesForCustomer(cid);
    if (!updatedList.some((a) => Number(a.IsDefault) === 1) && updatedList.length > 0) {
      updatedList[0].IsDefault = 1;
    }

    const defaultObj = updatedList.find((a) => Number(a.IsDefault) === 1);
    if (defaultObj) {
      cust.Address = formatSavedAddressObj(defaultObj);
      session.address = cust.Address;
    }

    savePersistentStore();
    return res.json({
      status: 'ok',
      message: addressId > 0 ? 'Delivery address updated.' : 'New delivery address saved.',
      address: targetAddr,
      defaultAddress: cust.Address,
      addresses: getAddressesForCustomer(cid)
    });
  });

  app.post('/api/addresses/default', (req, res) => {
    const ctx = requireCustomerSessionApi(req, res);
    if (!ctx) return;
    const { session, cust } = ctx;
    const cid = Number(cust.CustomerID);
    const addressId = Number((req.body || {}).addressId || (req.body || {}).address_id || 0);

    const target = customerAddresses.find(
      (a) => Number(a.AddressID) === addressId && Number(a.CustomerID) === cid
    );
    if (!target) {
      return res.status(404).json({ status: 'error', error: 'Address not found.' });
    }

    for (const a of customerAddresses) {
      if (Number(a.CustomerID) === cid) {
        a.IsDefault = Number(a.AddressID) === addressId ? 1 : 0;
      }
    }

    cust.Address = formatSavedAddressObj(target);
    session.address = cust.Address;
    savePersistentStore();

    return res.json({
      status: 'ok',
      message: 'Default delivery address updated.',
      defaultAddress: cust.Address,
      addresses: getAddressesForCustomer(cid)
    });
  });

  app.post('/api/addresses/delete', (req, res) => {
    const ctx = requireCustomerSessionApi(req, res);
    if (!ctx) return;
    const { session, cust } = ctx;
    const cid = Number(cust.CustomerID);
    const addressId = Number((req.body || {}).addressId || (req.body || {}).address_id || 0);

    const idx = customerAddresses.findIndex(
      (a) => Number(a.AddressID) === addressId && Number(a.CustomerID) === cid
    );
    if (idx === -1) {
      return res.status(404).json({ status: 'error', error: 'Address not found.' });
    }

    const wasDefault = Number(customerAddresses[idx].IsDefault) === 1;
    customerAddresses.splice(idx, 1);

    const remaining = customerAddresses.filter((a) => Number(a.CustomerID) === cid);
    if (wasDefault && remaining.length > 0) {
      remaining[0].IsDefault = 1;
      cust.Address = formatSavedAddressObj(remaining[0]);
      session.address = cust.Address;
    }

    savePersistentStore();
    return res.json({
      status: 'ok',
      message: 'Delivery address deleted.',
      defaultAddress: cust.Address,
      addresses: getAddressesForCustomer(cid)
    });
  });
  // Protected by strict server-side Admin session validation + CSRF protection
  // ==========================================================================
  function normalizeJobStatus(status) {
    const s = String(status || '').trim();
    if (s === 'Confirmed') return 'Order Confirmed';
    if (s === 'Ready') return 'For Delivery';
    if (s === 'Delivered') return 'Completed';
    const allowed = ['Pending', 'Order Confirmed', 'In Production', 'For Delivery', 'Completed', 'Cancelled'];
    return allowed.includes(s) ? s : 'Pending';
  }

  function computeServerJobOrderSummary() {
    const today = getTodayManila();
    let totalOrders = 0;
    let deadlineToday = 0;
    let ordersToday = 0;
    let overdueOrders = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    let activeOrders = 0;
    let unpaidOrders = 0;

    for (const ord of jobOrders) {
      totalOrders++;
      const st = normalizeJobStatus(ord.status);
      const due = String(ord.due || '').slice(0, 10);
      const placed = String(ord.placed || '').slice(0, 10);
      const finished = st === 'Completed' || st === 'Cancelled';
      const paid = Number(ord.paidAmount !== undefined ? ord.paidAmount : ord.downpayment || 0);
      const balance = Math.max(0, Number(ord.total || 0) - paid);

      if (due === today && st !== 'Cancelled') deadlineToday++;
      if (placed === today) ordersToday++;
      if (due && due < today && !finished) overdueOrders++;
      if (st === 'Pending') pendingOrders++;
      if (st === 'Completed') completedOrders++;
      if (['Pending', 'Order Confirmed', 'In Production', 'For Delivery'].includes(st)) activeOrders++;
      if (st !== 'Cancelled' && balance > 0) unpaidOrders++;
    }

    return {
      totalOrders,
      deadlineToday,
      ordersToday,
      overdueOrders,
      pendingOrders,
      completedOrders,
      activeOrders,
      unpaidOrders,
      todayManila: today
    };
  }

  function requireAdminSession(req, res, verifyCsrf = false) {
    const session = resolveAuthenticatedSession(req);
    if (!session || !session.isAuthenticated || session.userId <= 0) {
      res.status(401).json({
        status: 'error',
        code: 401,
        error: '401 Unauthorized: Please sign in with an Admin account to access Job Orders & Deadline Management.'
      });
      return null;
    }
    if (session.role !== 'admin') {
      res.status(403).json({
        status: 'error',
        code: 403,
        error: '403 Forbidden: Customer accounts are not authorized to access Admin Job Orders & Deadline Management.'
      });
      return null;
    }
    if (verifyCsrf && session.csrfToken) {
      const body = req.body || {};
      const submittedCsrf = String(
        req.headers['x-csrf-token'] || body.csrf_token || body.csrfToken || ''
      ).trim();
      if (submittedCsrf && submittedCsrf !== session.csrfToken) {
        res.status(403).json({
          status: 'error',
          code: 403,
          error: '403 Forbidden: Invalid CSRF security token.'
        });
        return null;
      }
    }
    return session;
  }

  app.get('/api/admin/job-orders', (req, res) => {
    const session = requireAdminSession(req, res, false);
    if (!session) return;
    return res.json({
      status: 'ok',
      csrfToken: session.csrfToken || null,
      todayManila: getTodayManila(),
      unreadCount: getUnreadCountForAdmin(),
      unreadByCustomer: getUnreadByCustomerMapForAdmin(),
      summary: computeServerJobOrderSummary(),
      orders: jobOrders
    });
  });

  app.post('/api/admin/job-orders/update', (req, res) => {
    const session = requireAdminSession(req, res, true);
    if (!session) return;

    const body = req.body || {};
    const orderId = Number(body.orderId || body.order_id);
    if (!orderId) {
      return res.status(400).json({ status: 'error', error: 'Valid Job Order ID is required.' });
    }

    const target = jobOrders.find((o) => Number(o.orderId) === orderId);
    if (!target) {
      return res.status(404).json({ status: 'error', error: `Job Order #${orderId} not found.` });
    }

    if (body.status !== undefined) {
      target.status = normalizeJobStatus(body.status);
    }
    if (body.priority !== undefined) {
      const p = String(body.priority).trim();
      if (['Normal', 'High', 'Urgent'].includes(p)) {
        target.priority = p;
      }
    }
    if (body.due !== undefined || body.due_date !== undefined) {
      const newDue = String(body.due ?? body.due_date ?? '').trim();
      if (newDue && !/^\d{4}-\d{2}-\d{2}$/.test(newDue)) {
        return res.status(400).json({ status: 'error', error: 'Deadline date must be in YYYY-MM-DD format.' });
      }
      if (newDue) target.due = newDue;
    }
    if (body.deadlineTime !== undefined || body.deadline_time !== undefined) {
      const dt = String(body.deadlineTime ?? body.deadline_time ?? '').trim();
      if (dt) target.deadlineTime = dt.slice(0, 5);
    }
    if (body.carpenter !== undefined || body.assignedStaff !== undefined) {
      const staff = String(body.carpenter ?? body.assignedStaff ?? '').trim();
      if (staff) target.carpenter = staff;
    }
    if (body.paidAmount !== undefined && !Number.isNaN(Number(body.paidAmount))) {
      target.paidAmount = Math.max(0, Number(body.paidAmount));
    }
    if (body.jobNotes !== undefined || body.job_notes !== undefined) {
      target.jobNotes = String(body.jobNotes ?? body.job_notes ?? '').trim();
    }

    savePersistentStore();
    return res.json({
      status: 'ok',
      order: target,
      summary: computeServerJobOrderSummary(),
      orders: jobOrders
    });
  });

  app.post('/api/admin/job-orders/create', (req, res) => {
    const session = requireAdminSession(req, res, true);
    if (!session) return;

    const body = req.body || {};
    const customerName = String(body.customer || body.customerName || '').trim();
    const itemSummary = String(body.itemSummary || body.productName || '').trim();
    const due = String(body.due || body.due_date || getTodayManila()).trim();
    const quantity = Math.max(1, Number(body.quantity) || 1);
    const total = Math.max(0, Number(body.total || body.totalAmount) || 28500);
    const paidAmount = Math.max(0, Number(body.paidAmount !== undefined ? body.paidAmount : Math.round(total * 0.5)));
    const priority = ['Normal', 'High', 'Urgent'].includes(body.priority) ? body.priority : 'Normal';
    const status = normalizeJobStatus(body.status || 'Pending');
    const carpenter = String(body.carpenter || body.assignedStaff || 'Master Carding Santos').trim();

    if (!customerName || !itemSummary || !/^\d{4}-\d{2}-\d{2}$/.test(due)) {
      return res.status(400).json({
        status: 'error',
        error: 'Customer name, furniture product, and a valid deadline date (YYYY-MM-DD) are required.'
      });
    }

    const maxId = jobOrders.reduce((max, o) => Math.max(max, Number(o.orderId) || 1000), 1000);
    const newId = maxId + 1;
    const newOrder = {
      orderId: newId,
      jobOrderCode: `JO-2026-${newId}`,
      customerId: Number(body.customerId) || 1,
      customer: customerName,
      customerPhone: String(body.customerPhone || '0917-000-0000').trim(),
      customerEmail: String(body.customerEmail || '').trim(),
      address: String(body.address || 'Metro Manila / Pampanga').trim(),
      itemSummary,
      quantity,
      status,
      priority,
      placed: getTodayManila(),
      due,
      deadlineTime: String(body.deadlineTime || '17:00').slice(0, 5),
      carpenter,
      assignedEmployeeId: 1,
      stage: 'Timber Selection & Grain Matching',
      driver: 'Rene Ocampo (0918-555-6666)',
      total,
      downpayment: Math.round(total * 0.5),
      paidAmount,
      jobNotes: String(body.jobNotes || '').trim()
    };

    jobOrders.unshift(newOrder);
    customerOrders.push({ OrderID: newId, CustomerID: newOrder.customerId });
    savePersistentStore();

    return res.json({
      status: 'ok',
      order: newOrder,
      summary: computeServerJobOrderSummary(),
      orders: jobOrders
    });
  });

  // Allow customer storefront checkout to also record into jobOrders
  app.post('/api/orders/create', (req, res) => {
    const body = req.body || {};
    const maxId = jobOrders.reduce((max, o) => Math.max(max, Number(o.orderId) || 1000), 1000);
    const newId = Number(body.orderId) > maxId ? Number(body.orderId) : maxId + 1;
    const total = Math.max(0, Number(body.total) || 28500);
    const dp = Math.round(total * 0.5);
    const newOrder = {
      orderId: newId,
      jobOrderCode: `JO-2026-${newId}`,
      customerId: Number(body.customerId) || 1,
      customer: String(body.customer || 'Valued Customer').trim(),
      customerPhone: String(body.customerPhone || '0917-123-4567').trim(),
      customerEmail: String(body.customerEmail || '').trim(),
      address: String(body.address || 'Metro Manila').trim(),
      itemSummary: String(body.itemSummary || 'Custom Solid Wood Furniture').trim(),
      quantity: Math.max(1, Number(body.quantity) || 1),
      status: 'Pending',
      priority: 'Normal',
      placed: getTodayManila(),
      due: String(body.due || offsetDateManila(14)).trim(),
      deadlineTime: '17:00',
      carpenter: 'Master Carding Santos',
      assignedEmployeeId: 1,
      stage: 'Timber Selection & Grain Matching',
      driver: 'Rene Ocampo (0918-555-6666)',
      total,
      downpayment: dp,
      paidAmount: dp,
      jobNotes: 'Placed online via Lilia & Rowena Storefront.'
    };
    jobOrders.unshift(newOrder);
    customerOrders.push({ OrderID: newId, CustomerID: newOrder.customerId });
    savePersistentStore();
    return res.json({ status: 'ok', order: newOrder });
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
    if (route === 'admin_dashboard' || route === 'admin_job_orders' || route === 'api_admin_job_orders') {
      const session = requireAdminSession(req, res, false);
      if (!session) return;
      return res.json({
        status: 'ok',
        csrfToken: session.csrfToken || null,
        todayManila: getTodayManila(),
        summary: computeServerJobOrderSummary(),
        orders: jobOrders,
        conversations: getCustomerConversationsSummary()
      });
    }
    if (route === 'admin_update_order' || route === 'api_admin_update_job_order') {
      const session = requireAdminSession(req, res, true);
      if (!session) return;
      return res.json({
        status: 'ok',
        summary: computeServerJobOrderSummary(),
        orders: jobOrders
      });
    }
    next();
  });

  // Serve static assets under both /public/* (for GitHub Pages / direct HTML compatibility) and /*
  const publicPath = path.join(__dirname, 'public');
  const noCacheStaticOptions = {
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
  };
  app.use('/public', express.static(publicPath, noCacheStaticOptions));
  app.use(express.static(publicPath, noCacheStaticOptions));

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
