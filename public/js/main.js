/**
 * ============================================================================
 * LILIA AND ROWENA FURNITURE - SIMPLE VANILLA JAVASCRIPT (main.js)
 * ============================================================================
 * TEAM NOTES:
 * - Zero React, zero TypeScript (.tsx), and zero complex algorithms.
 * - Uses only clean, straightforward DOM functions (getElementById, innerHTML, style)
 *   so your team can easily understand, debug, and explain it!
 */

// --- 1. SIMPLE STATE VARIABLES (For Live Preview, Auth, Admin, and Cart) ---
var currentUserSession = {
    isLoggedIn: true,
    id: 1,            // Matches CustomerID = 1 in Customer table
    role: 'customer', // 'customer' or 'admin'
    name: 'Maria Teresa Santos',
    email: 'maria.santos@example.com',
    phone: '0917-123-4567',
    address: 'Unit 14B, Tower 2, Serendra, BGC, Taguig City'
};

var registeredCustomers = [
    {
        id: 1,
        fullName: 'Maria Teresa Santos',
        email: 'maria.santos@example.com',
        password: 'password123',
        phone: '0917-123-4567',
        address: 'Unit 14B, Tower 2, Serendra, BGC, Taguig City'
    },
    {
        id: 2,
        fullName: 'Atty. Roberto Mendoza',
        email: 'roberto.mendoza@example.com',
        password: 'password123',
        phone: '0918-987-6543',
        address: '88 Narra Avenue, Ayala Alabang Village, Muntinlupa'
    }
];

var databaseAdmins = [
    {
        adminId: 1,
        email: 'admin@liliaandrowena.com',
        password: 'admin123',
        name: 'Rowena & Lilia (Workshop Admin)'
    },
    {
        adminId: 2,
        email: 'lilia.owner@liliaandrowena.com',
        password: 'admin123',
        name: 'Lilia (Shop Owner)'
    }
];

var currentSelectedProduct = {
    id: 1,
    name: 'Mahogany 6-Seater Dining Set',
    category: 'Dining Sets',
    basePrice: 28500,
    image: 'public/images/product_dining_table.jpg',
    stdL: 180,
    stdW: 90,
    stdH: 75
};

var shoppingCart = [
    {
        id: 1,
        name: 'Mahogany 6-Seater Dining Set',
        basePrice: 28500,
        extraCost: 1950,
        qty: 1,
        image: 'public/images/product_dining_table.jpg',
        specs: '200L × 90W × 75H cm · Warm Walnut Stain'
    }
];

var sampleOrders = {
    '1001': {
        orderId: '1001',
        customer: 'Maria Teresa Santos',
        placed: '2026-10-24',
        due: '2026-11-08',
        status: 'In Production',
        stepIndex: 2,
        carpenter: 'Master Carding Santos',
        stage: '3rd Coat Polyurethane Curing',
        driver: 'Rene Ocampo (0918-555-6666)',
        address: 'Unit 14B, Tower 2, Serendra, BGC, Taguig City',
        itemSummary: 'Mahogany 6-Seater Dining Set (220L × 90W × 75H cm · Warm Walnut)',
        total: 30450,
        downpayment: 15225
    },
    '1002': {
        orderId: '1002',
        customer: 'Atty. Roberto Mendoza',
        placed: '2026-10-28',
        due: '2026-11-12',
        status: 'Confirmed',
        stepIndex: 1,
        carpenter: 'Master Eddie Manalo',
        stage: 'Timber Preparation & Framing',
        driver: 'Rene Ocampo (0918-555-6666)',
        address: '88 Narra Avenue, Ayala Alabang Village, Muntinlupa',
        itemSummary: 'Scandinavian Sky Blue Lounge Sofa (Standard Sizing)',
        total: 34000,
        downpayment: 17000
    }
};

// --- 2. MODAL AND DRAWER CONTROLS (Open & Close Popups) ---
function showChatSecurityAlert(message) {
    var alertBox = document.getElementById('chatSecurityAlertBox');
    if (alertBox) {
        if (message) {
            alertBox.textContent = '🛡️ ' + message;
            alertBox.style.display = 'block';
        } else {
            alertBox.textContent = '';
            alertBox.style.display = 'none';
        }
    }
}

function openModal(modalId) {
    if (modalId === 'adminModal') {
        // Strict Access Control: Customers and Guests cannot open the Admin Console
        if (!currentUserSession.isLoggedIn || currentUserSession.role !== 'admin') {
            showChatSecurityAlert('403 Forbidden: Customer accounts are not authorized to access the Admin Console.');
            var errEl = document.getElementById('authErrorBox');
            if (errEl) {
                errEl.style.display = 'block';
                errEl.textContent = '403 Forbidden: Please sign in with an Admin account to access the Admin Console.';
            }
            return;
        }
        renderAdminDashboard();
        if (typeof renderMessageFeeds === 'function') {
            renderMessageFeeds();
        }
    }
    var el = document.getElementById(modalId);
    if (el) el.classList.add('open');
}

function closeModal(modalId) {
    var el = document.getElementById(modalId);
    if (el) el.classList.remove('open');
}

function scrollToSection(sectionId) {
    var el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// --- 3. AUTHENTICATION: LOGIN, REGISTER, AND LOGOUT (Customer & Admin) ---
var currentSessionToken = null;
var isExplicitlyLoggedOut = false;
var LOCAL_STORAGE_DB_KEY = 'lr_furniture_db_v1';

function savePersistedClientDatabase() {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return;
        var payload = {
            registeredCustomers: registeredCustomers,
            currentUserSession: currentUserSession,
            currentSessionToken: currentSessionToken,
            isExplicitlyLoggedOut: isExplicitlyLoggedOut,
            shoppingCart: shoppingCart,
            sampleOrders: sampleOrders,
            staticFallbackMessagesStore: (typeof staticFallbackMessagesStore !== 'undefined') ? staticFallbackMessagesStore : []
        };
        window.localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(payload));
    } catch (e) {
        // Ignore storage quota errors
    }
}

function loadPersistedClientDatabase() {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return;
        var raw = window.localStorage.getItem(LOCAL_STORAGE_DB_KEY);
        if (!raw) return;
        var parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return;

        if (Array.isArray(parsed.registeredCustomers) && parsed.registeredCustomers.length > 0) {
            for (var i = 0; i < parsed.registeredCustomers.length; i++) {
                var sc = parsed.registeredCustomers[i];
                if (!sc || !sc.email) continue;
                var foundIdx = -1;
                for (var j = 0; j < registeredCustomers.length; j++) {
                    if (String(registeredCustomers[j].email).toLowerCase() === String(sc.email).toLowerCase()) {
                        foundIdx = j;
                        break;
                    }
                }
                if (foundIdx === -1) {
                    registeredCustomers.push({
                        id: Number(sc.id) || (registeredCustomers.length + 1),
                        fullName: sc.fullName || '',
                        email: String(sc.email).toLowerCase(),
                        password: sc.password || 'password123',
                        phone: sc.phone || '',
                        address: sc.address || ''
                    });
                } else if (sc.password) {
                    registeredCustomers[foundIdx].password = sc.password;
                    registeredCustomers[foundIdx].fullName = sc.fullName || registeredCustomers[foundIdx].fullName;
                    registeredCustomers[foundIdx].phone = sc.phone || registeredCustomers[foundIdx].phone;
                    registeredCustomers[foundIdx].address = sc.address || registeredCustomers[foundIdx].address;
                }
            }
        }

        if (parsed.currentSessionToken !== undefined) {
            currentSessionToken = parsed.currentSessionToken;
        }
        if (parsed.isExplicitlyLoggedOut !== undefined) {
            isExplicitlyLoggedOut = Boolean(parsed.isExplicitlyLoggedOut);
        }
        if (parsed.currentUserSession && typeof parsed.currentUserSession === 'object') {
            currentUserSession = parsed.currentUserSession;
        }
        if (Array.isArray(parsed.shoppingCart)) {
            shoppingCart = parsed.shoppingCart;
        }
        if (parsed.sampleOrders && typeof parsed.sampleOrders === 'object') {
            var orderKeys = Object.keys(parsed.sampleOrders);
            for (var k = 0; k < orderKeys.length; k++) {
                sampleOrders[orderKeys[k]] = parsed.sampleOrders[orderKeys[k]];
            }
        }
        if (Array.isArray(parsed.staticFallbackMessagesStore) && typeof staticFallbackMessagesStore !== 'undefined') {
            for (var m = 0; m < parsed.staticFallbackMessagesStore.length; m++) {
                var savedMsg = parsed.staticFallbackMessagesStore[m];
                if (!savedMsg || !savedMsg.MessageID) continue;
                var msgExists = false;
                for (var ex = 0; ex < staticFallbackMessagesStore.length; ex++) {
                    if (Number(staticFallbackMessagesStore[ex].MessageID) === Number(savedMsg.MessageID)) {
                        msgExists = true;
                        break;
                    }
                }
                if (!msgExists) {
                    staticFallbackMessagesStore.push(savedMsg);
                }
            }
        }
    } catch (e) {
        // Ignore corrupt storage
    }
}

function mergeServerCustomersIntoLocal(serverCustomers) {
    if (!Array.isArray(serverCustomers)) return;
    for (var i = 0; i < serverCustomers.length; i++) {
        var sc = serverCustomers[i];
        if (!sc || !sc.email) continue;
        var normEmail = String(sc.email).toLowerCase();
        var existing = null;
        for (var j = 0; j < registeredCustomers.length; j++) {
            if (String(registeredCustomers[j].email).toLowerCase() === normEmail) {
                existing = registeredCustomers[j];
                break;
            }
        }
        if (!existing) {
            registeredCustomers.push({
                id: Number(sc.id || sc.CustomerID) || (registeredCustomers.length + 1),
                fullName: sc.fullName || sc.FullName || '',
                email: normEmail,
                password: sc.password || 'password123',
                phone: sc.phone || sc.PhoneNumber || '',
                address: sc.address || sc.Address || ''
            });
        } else {
            existing.id = Number(sc.id || sc.CustomerID) || existing.id;
            existing.fullName = sc.fullName || sc.FullName || existing.fullName;
            existing.phone = sc.phone || sc.PhoneNumber || existing.phone;
            existing.address = sc.address || sc.Address || existing.address;
        }
    }
    savePersistedClientDatabase();
}

function getAuthRequestHeaders() {
    var headers = {
        'Content-Type': 'application/json'
    };
    if (currentSessionToken) {
        headers['x-session-token'] = String(currentSessionToken);
    }
    if (isExplicitlyLoggedOut) {
        headers['x-logged-out'] = '1';
    }
    return headers;
}

function renderAuthHeaderState() {
    var loggedInBox = document.getElementById('headerLoggedInBox');
    var loggedOutBox = document.getElementById('headerLoggedOutBox');
    var userNameEl = document.getElementById('headerUserName');
    var adminNavBtn = document.getElementById('headerAdminBtn');
    var openAdminChatBtn = document.getElementById('openAdminConsoleFromChatBtn');

    if (!loggedInBox || !loggedOutBox) return;

    if (currentUserSession.isLoggedIn) {
        loggedInBox.style.display = 'flex';
        loggedOutBox.style.display = 'none';

        if (currentUserSession.role === 'admin') {
            if (userNameEl) userNameEl.textContent = '🔑 Admin (' + currentUserSession.email.split('@')[0] + ')';
            if (adminNavBtn) adminNavBtn.style.display = 'inline-flex';
            if (openAdminChatBtn) openAdminChatBtn.style.display = 'inline-flex';
        } else {
            var firstName = currentUserSession.name.split(' ')[0];
            if (userNameEl) userNameEl.textContent = 'Hello, ' + firstName;
            if (adminNavBtn) adminNavBtn.style.display = 'none';
            if (openAdminChatBtn) openAdminChatBtn.style.display = 'none';
        }

        // Pre-fill checkout fields for the logged-in user
        var chkName = document.getElementById('chkFullName');
        var chkEmail = document.getElementById('chkEmail');
        var chkPhone = document.getElementById('chkPhone');
        var chkAddr = document.getElementById('chkAddress');
        if (chkName && currentUserSession.name) chkName.value = currentUserSession.name;
        if (chkEmail && currentUserSession.email) chkEmail.value = currentUserSession.email;
        if (chkPhone && currentUserSession.phone) chkPhone.value = currentUserSession.phone;
        if (chkAddr && currentUserSession.address) chkAddr.value = currentUserSession.address;
    } else {
        loggedInBox.style.display = 'none';
        loggedOutBox.style.display = 'flex';
        if (adminNavBtn) adminNavBtn.style.display = 'none';
        if (openAdminChatBtn) openAdminChatBtn.style.display = 'none';
    }

    showChatSecurityAlert('');
    savePersistedClientDatabase();

    // Sync authenticated identity with WebSocket backend and re-render private conversation feed
    if (typeof syncSocketAuthIdentity === 'function') {
        syncSocketAuthIdentity();
    }
    if (typeof renderMessageFeeds === 'function') {
        renderMessageFeeds();
    }
}

function handleUserLogout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthRequestHeaders()
    }).catch(function () {
        fetch('public/index.php?route=api_logout', { method: 'POST' }).catch(function () {});
    });

    isExplicitlyLoggedOut = true;
    currentSessionToken = null;
    liveOrderMessages = [];
    adminConversationsList = [];
    currentUserSession = {
        isLoggedIn: false,
        id: null,
        role: 'guest',
        name: '',
        email: '',
        phone: '',
        address: ''
    };
    savePersistedClientDatabase();
    renderAuthHeaderState();
    closeModal('adminModal');
}

function tryLocalOrPhpLogin(email, password, role, openAdminOnSuccess) {
    var normEmail = String(email || '').trim().toLowerCase();
    var selRole = String(role || 'auto').toLowerCase();

    function finishLocalAuth() {
        if (selRole === 'admin' || selRole === 'auto') {
            for (var a = 0; a < databaseAdmins.length; a++) {
                if (databaseAdmins[a].email.toLowerCase() === normEmail && databaseAdmins[a].password === password) {
                    isExplicitlyLoggedOut = false;
                    currentUserSession = {
                        isLoggedIn: true,
                        id: databaseAdmins[a].adminId,
                        role: 'admin',
                        name: databaseAdmins[a].name,
                        email: databaseAdmins[a].email,
                        phone: '0917-889-4211',
                        address: 'MacArthur Highway, San Fernando, Pampanga'
                    };
                    selectedAdminConversationCustomerId = 1;
                    savePersistedClientDatabase();
                    syncStaticFallbackMessages();
                    renderAuthHeaderState();
                    if (openAdminOnSuccess) {
                        renderAdminDashboard();
                        openModal('adminModal');
                    }
                    return true;
                }
            }
        }
        if (selRole === 'customer' || selRole === 'auto') {
            for (var c = 0; c < registeredCustomers.length; c++) {
                if (registeredCustomers[c].email.toLowerCase() === normEmail && registeredCustomers[c].password === password) {
                    isExplicitlyLoggedOut = false;
                    currentUserSession = {
                        isLoggedIn: true,
                        id: registeredCustomers[c].id,
                        role: 'customer',
                        name: registeredCustomers[c].fullName,
                        email: registeredCustomers[c].email,
                        phone: registeredCustomers[c].phone,
                        address: registeredCustomers[c].address
                    };
                    savePersistedClientDatabase();
                    syncStaticFallbackMessages();
                    renderAuthHeaderState();
                    return true;
                }
            }
        }
        return false;
    }

    // Try XAMPP PHP + MySQL API bridge if available, else fall back to localStorage database
    return fetch('public/index.php?route=api_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normEmail, password: password, role: selRole })
    })
    .then(function (res) {
        return res.json().then(function (data) {
            return { status: res.status, data: data };
        });
    })
    .then(function (phpRes) {
        if (phpRes.status === 200 && phpRes.data && phpRes.data.status === 'ok' && phpRes.data.user) {
            isExplicitlyLoggedOut = false;
            if (Array.isArray(phpRes.data.customers)) {
                mergeServerCustomersIntoLocal(phpRes.data.customers);
            }
            currentUserSession = phpRes.data.user;
            savePersistedClientDatabase();
            syncStaticFallbackMessages();
            renderAuthHeaderState();
            if (openAdminOnSuccess && currentUserSession.role === 'admin') {
                renderAdminDashboard();
                openModal('adminModal');
            }
            return true;
        }
        return finishLocalAuth();
    })
    .catch(function () {
        return finishLocalAuth();
    });
}

// Authenticate account via backend /api/auth/login (with XAMPP MySQL & localStorage fallback)
function performServerLogin(email, password, role, openAdminOnSuccess) {
    var normEmail = String(email || '').trim().toLowerCase();
    return fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: normEmail,
            password: password,
            role: role || 'auto'
        })
    })
    .then(function (res) {
        return res.json().then(function (data) {
            return { status: res.status, data: data };
        });
    })
    .then(function (result) {
        if (result.status === 200 && result.data && result.data.status === 'ok' && result.data.user) {
            isExplicitlyLoggedOut = false;
            liveOrderMessages = [];
            adminConversationsList = [];
            currentSessionToken = result.data.sessionToken || null;
            currentUserSession = result.data.user;
            if (Array.isArray(result.data.customers)) {
                mergeServerCustomersIntoLocal(result.data.customers);
            }
            if (currentUserSession.role === 'admin') {
                selectedAdminConversationCustomerId = 1;
            }
            savePersistedClientDatabase();
            renderAuthHeaderState();
            fetchAuthorizedConversationMessages();
            if (openAdminOnSuccess && currentUserSession.role === 'admin') {
                renderAdminDashboard();
                openModal('adminModal');
            }
            return true;
        }

        // If account was created in localStorage before server synced, auto-sync it to /api/auth/register
        for (var c = 0; c < registeredCustomers.length; c++) {
            var localCust = registeredCustomers[c];
            if (String(localCust.email).toLowerCase() === normEmail && localCust.password === password) {
                return fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: localCust.fullName,
                        email: localCust.email,
                        password: localCust.password,
                        phone: localCust.phone,
                        address: localCust.address
                    })
                })
                .then(function (regRes) { return regRes.json(); })
                .then(function (regData) {
                    if (regData && regData.status === 'ok' && regData.user) {
                        isExplicitlyLoggedOut = false;
                        currentSessionToken = regData.sessionToken || null;
                        currentUserSession = regData.user;
                        localCust.id = regData.user.id;
                        savePersistedClientDatabase();
                        renderAuthHeaderState();
                        fetchAuthorizedConversationMessages();
                        return true;
                    }
                    return tryLocalOrPhpLogin(email, password, role, openAdminOnSuccess);
                })
                .catch(function () {
                    return tryLocalOrPhpLogin(email, password, role, openAdminOnSuccess);
                });
            }
        }
        return false;
    })
    .catch(function () {
        return tryLocalOrPhpLogin(email, password, role, openAdminOnSuccess);
    });
}

// Helper for switching between authenticated accounts via real server-side authentication
function quickSwitchChatAccount(role, targetId) {
    var numericId = Number(targetId) || 1;
    var targetEmail = 'maria.santos@example.com';
    var targetPassword = 'password123';
    var targetRole = 'customer';

    if (role === 'admin') {
        var adm = databaseAdmins[0];
        for (var i = 0; i < databaseAdmins.length; i++) {
            if (Number(databaseAdmins[i].adminId) === numericId) {
                adm = databaseAdmins[i];
                break;
            }
        }
        targetEmail = adm.email;
        targetPassword = adm.password;
        targetRole = 'admin';
    } else {
        var cust = registeredCustomers[0];
        for (var j = 0; j < registeredCustomers.length; j++) {
            if (Number(registeredCustomers[j].id) === numericId) {
                cust = registeredCustomers[j];
                break;
            }
        }
        targetEmail = cust.email;
        targetPassword = cust.password;
        targetRole = 'customer';
    }

    return performServerLogin(targetEmail, targetPassword, targetRole, false);
}

function switchAuthTab(tabPaneId, btnEl) {
    var panes = document.querySelectorAll('.auth-tab-pane');
    for (var i = 0; i < panes.length; i++) {
        panes[i].style.display = 'none';
    }
    var target = document.getElementById(tabPaneId);
    if (target) target.style.display = 'block';

    var btns = document.querySelectorAll('#authModal .tab-btn');
    for (var j = 0; j < btns.length; j++) {
        btns[j].classList.remove('active');
    }
    if (btnEl) btnEl.classList.add('active');

    var errEl = document.getElementById('authErrorBox');
    if (errEl) errEl.style.display = 'none';
}

function fillPresetLogin(role) {
    var emailIn = document.getElementById('loginEmailInput');
    var passIn = document.getElementById('loginPassInput');
    var roleSelect = document.getElementById('loginRoleInput');
    var errEl = document.getElementById('authErrorBox');
    if (errEl) errEl.style.display = 'none';

    if (role === 'admin') {
        if (emailIn) emailIn.value = 'admin@liliaandrowena.com';
        if (passIn) passIn.value = 'admin123';
        if (roleSelect) roleSelect.value = 'admin';
    } else if (role === 'customer2') {
        if (emailIn) emailIn.value = 'roberto.mendoza@example.com';
        if (passIn) passIn.value = 'password123';
        if (roleSelect) roleSelect.value = 'customer';
    } else {
        if (emailIn) emailIn.value = 'maria.santos@example.com';
        if (passIn) passIn.value = 'password123';
        if (roleSelect) roleSelect.value = 'customer';
    }
}

function handleCustomerLogin(event) {
    event.preventDefault();
    var email = document.getElementById('loginEmailInput').value.trim().toLowerCase();
    var password = document.getElementById('loginPassInput').value;
    var selectedRole = document.getElementById('loginRoleInput').value;
    var errEl = document.getElementById('authErrorBox');

    performServerLogin(email, password, selectedRole, true).then(function (ok) {
        if (ok) {
            if (errEl) errEl.style.display = 'none';
            closeModal('authModal');
        } else if (errEl) {
            errEl.style.display = 'block';
            errEl.textContent = 'Invalid email or password. Use Customer #1 (maria.santos@example.com / password123), Customer #2 (roberto.mendoza@example.com / password123), or Admin (admin@liliaandrowena.com / admin123).';
        }
    });
    return false;
}

function handleCustomerRegister(event) {
    event.preventDefault();
    var fullName = document.getElementById('regFullName').value.trim();
    var email = document.getElementById('regEmail').value.trim().toLowerCase();
    var password = document.getElementById('regPassword').value;
    var phone = document.getElementById('regPhone').value.trim();
    var address = document.getElementById('regAddress').value.trim();
    var errEl = document.getElementById('authErrorBox');

    if (!fullName || !email || !password || !phone || !address) {
        if (errEl) {
            errEl.style.display = 'block';
            errEl.textContent = 'Please complete all required fields to create your customer account.';
        }
        return false;
    }

    function finalizeClientRegistration(assignedId, tokenFromServer, serverCustomers) {
        var numericId = Number(assignedId) || (registeredCustomers.length + 1);
        var existingIdx = -1;
        for (var i = 0; i < registeredCustomers.length; i++) {
            if (String(registeredCustomers[i].email).toLowerCase() === email) {
                existingIdx = i;
                break;
            }
        }
        var newCust = {
            id: numericId,
            fullName: fullName,
            email: email,
            password: password,
            phone: phone,
            address: address
        };
        if (existingIdx === -1) {
            registeredCustomers.push(newCust);
        } else {
            registeredCustomers[existingIdx] = newCust;
        }
        if (Array.isArray(serverCustomers)) {
            mergeServerCustomersIntoLocal(serverCustomers);
        }

        isExplicitlyLoggedOut = false;
        liveOrderMessages = [];
        adminConversationsList = [];
        currentSessionToken = tokenFromServer || null;
        currentUserSession = {
            isLoggedIn: true,
            id: numericId,
            role: 'customer',
            name: fullName,
            email: email,
            phone: phone,
            address: address
        };

        savePersistedClientDatabase();
        if (errEl) errEl.style.display = 'none';

        // Clear registration inputs
        document.getElementById('regFullName').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regPhone').value = '';
        document.getElementById('regAddress').value = '';

        renderAuthHeaderState();
        fetchAuthorizedConversationMessages();
        closeModal('authModal');
    }

    fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullName: fullName,
            email: email,
            password: password,
            phone: phone,
            address: address
        })
    })
    .then(function (res) {
        return res.json().then(function (data) {
            return { status: res.status, data: data };
        });
    })
    .then(function (result) {
        if (result.status === 200 && result.data && result.data.status === 'ok' && result.data.user) {
            finalizeClientRegistration(result.data.user.id, result.data.sessionToken, result.data.customers);
        } else if (errEl) {
            errEl.style.display = 'block';
            errEl.textContent = (result.data && result.data.error) ? result.data.error : 'Unable to register customer account.';
        }
    })
    .catch(function () {
        // Check duplicate in localStorage first
        for (var i = 0; i < registeredCustomers.length; i++) {
            if (String(registeredCustomers[i].email).toLowerCase() === email) {
                if (errEl) {
                    errEl.style.display = 'block';
                    errEl.textContent = 'An account with this email address already exists.';
                }
                return;
            }
        }

        // Try XAMPP PHP + MySQL bridge (public/index.php?route=api_register), then fallback to localStorage
        fetch('public/index.php?route=api_register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: fullName,
                email: email,
                password: password,
                phone: phone,
                address: address
            })
        })
        .then(function (phpRes) {
            return phpRes.json().then(function (phpData) {
                return { status: phpRes.status, data: phpData };
            });
        })
        .then(function (phpResult) {
            if (phpResult.status === 200 && phpResult.data && phpResult.data.status === 'ok' && phpResult.data.user) {
                finalizeClientRegistration(phpResult.data.user.id, null, phpResult.data.customers);
            } else if (phpResult.status === 409 && phpResult.data && phpResult.data.error) {
                if (errEl) {
                    errEl.style.display = 'block';
                    errEl.textContent = phpResult.data.error;
                }
            } else {
                var maxId = 2;
                for (var k = 0; k < registeredCustomers.length; k++) {
                    if (Number(registeredCustomers[k].id) > maxId) maxId = Number(registeredCustomers[k].id);
                }
                finalizeClientRegistration(maxId + 1, null, null);
            }
        })
        .catch(function () {
            var maxId = 2;
            for (var k = 0; k < registeredCustomers.length; k++) {
                if (Number(registeredCustomers[k].id) > maxId) maxId = Number(registeredCustomers[k].id);
            }
            finalizeClientRegistration(maxId + 1, null, null);
        });
    });

    return false;
}

// --- 4. ADMIN DASHBOARD FUNCTIONS (Table: Admin & Connected Tables) ---
function renderAdminDashboard() {
    var tbody = document.getElementById('adminOrdersTableBody');
    if (!tbody) return;

    var statuses = ['Pending', 'Confirmed', 'In Production', 'Ready', 'Delivered'];
    var rowsHtml = '';

    var keys = Object.keys(sampleOrders);
    for (var i = 0; i < keys.length; i++) {
        var ord = sampleOrders[keys[i]];
        var optionsHtml = '';
        for (var s = 0; s < statuses.length; s++) {
            var sel = (ord.status === statuses[s]) ? 'selected' : '';
            optionsHtml += '<option value="' + statuses[s] + '" ' + sel + '>' + statuses[s] + '</option>';
        }

        rowsHtml += '<tr style="border-bottom: 1px solid #f1f5f9;">' +
            '<td style="padding: 0.65rem;"><strong>#' + ord.orderId + '</strong></td>' +
            '<td style="padding: 0.65rem;">' + ord.customer + '</td>' +
            '<td style="padding: 0.65rem;">' + ord.itemSummary + '</td>' +
            '<td style="padding: 0.65rem;">₱' + ord.total.toLocaleString() + '</td>' +
            '<td style="padding: 0.65rem;"><span class="btn-sm-soft">' + ord.status + '</span></td>' +
            '<td style="padding: 0.65rem;">' +
                '<select onchange="updateAdminOrderStatus(\'' + ord.orderId + '\', this.value)" style="padding: 0.3rem 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.76rem;">' +
                    optionsHtml +
                '</select>' +
            '</td>' +
        '</tr>';
    }

    tbody.innerHTML = rowsHtml;
}

function updateAdminOrderStatus(orderId, newStatus) {
    var record = sampleOrders[orderId];
    if (!record) return;

    var stages = ['Pending', 'Confirmed', 'In Production', 'Ready', 'Delivered'];
    var idx = stages.indexOf(newStatus);
    record.status = newStatus;
    record.stepIndex = (idx !== -1) ? idx : 0;

    savePersistedClientDatabase();
    renderAdminDashboard();
    lookupOrderById(orderId);

    var msgBox = document.getElementById('adminStatusNotice');
    if (msgBox) {
        msgBox.style.display = 'block';
        msgBox.textContent = '✓ Order #' + orderId + ' status updated to "' + newStatus + '" in Customer_Order table.';
    }
}

// --- 5. CATALOG CATEGORY FILTER ---
function filterCatalog(categoryName, btnElement) {
    var buttons = document.querySelectorAll('.cat-pill');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    if (btnElement) btnElement.classList.add('active');

    var cards = document.querySelectorAll('.product-card[data-category]');
    var visibleCount = 0;
    for (var j = 0; j < cards.length; j++) {
        var cardCat = cards[j].getAttribute('data-category');
        if (categoryName === 'ALL' || cardCat === categoryName) {
            cards[j].style.display = 'flex';
            visibleCount++;
        } else {
            cards[j].style.display = 'none';
        }
    }

    var countEl = document.getElementById('catalogCountText');
    if (countEl) countEl.textContent = visibleCount;
}

// --- 6. CUSTOM SIZING CALCULATOR (Product Detail & Customizer) ---
function openProductCustomizer(id, name, category, basePrice, image, stdL, stdW, stdH) {
    currentSelectedProduct = {
        id: id,
        name: name,
        category: category,
        basePrice: basePrice,
        image: image,
        stdL: stdL,
        stdW: stdW,
        stdH: stdH
    };

    var titleEl = document.getElementById('custModalTitle');
    var catEl = document.getElementById('custModalCategory');
    var imgEl = document.getElementById('custModalImg');
    var baseEl = document.getElementById('basePrice');
    var lenIn = document.getElementById('customLength');
    var widIn = document.getElementById('customWidth');
    var heiIn = document.getElementById('customHeight');
    var qtyIn = document.getElementById('customQty');

    if (titleEl) titleEl.textContent = name;
    if (catEl) catEl.textContent = category + ' · Custom Sizing Studio';
    if (imgEl) {
        imgEl.dataset.fb = '';
        imgEl.src = image;
    }
    if (baseEl) baseEl.textContent = basePrice;
    if (lenIn) lenIn.value = stdL;
    if (widIn) widIn.value = stdW;
    if (heiIn) heiIn.value = stdH;
    if (qtyIn) qtyIn.value = 1;

    updateProductPrice();
    openModal('customizerModal');
}

function updateProductPrice() {
    var basePriceEl = document.getElementById('basePrice');
    if (!basePriceEl) return;

    var basePrice = parseFloat(basePriceEl.textContent) || 0;
    var isCustomCheckbox = document.getElementById('isCustomCheckbox');
    var lengthInput = document.getElementById('customLength');
    var widthInput = document.getElementById('customWidth');
    var heightInput = document.getElementById('customHeight');
    var finishSelect = document.getElementById('colorFinish');
    var dimensionInputs = document.getElementById('dimensionInputs');

    var extra = 0;

    if (isCustomCheckbox && isCustomCheckbox.checked) {
        if (dimensionInputs) dimensionInputs.style.opacity = '1';

        var len = parseFloat(lengthInput ? lengthInput.value : 120) || 120;
        var wid = parseFloat(widthInput ? widthInput.value : 80) || 80;
        var hei = parseFloat(heightInput ? heightInput.value : 75) || 75;

        if (len > 120) extra += (len - 120) * 15;
        if (wid > 80) extra += (wid - 80) * 12;
        if (hei > 75) extra += (hei - 75) * 10;

        if (finishSelect && finishSelect.value.indexOf('Walnut') !== -1) {
            extra += 1500;
        } else if (finishSelect && finishSelect.value.indexOf('Lacquer') !== -1) {
            extra += 1200;
        }
    } else {
        if (dimensionInputs) dimensionInputs.style.opacity = '0.5';
    }

    var extraCostEl = document.getElementById('extraCost');
    var displayTotalEl = document.getElementById('displayTotal');

    if (extraCostEl) extraCostEl.textContent = extra.toLocaleString();
    if (displayTotalEl) {
        var unitTotal = basePrice + extra;
        displayTotalEl.textContent = '₱' + unitTotal.toLocaleString();
    }
}

// --- 7. SHOPPING CART FUNCTIONS (Add, Update Qty, Remove) ---
function quickAddToCart(id, name, basePrice, image) {
    shoppingCart.push({
        id: id,
        name: name,
        basePrice: basePrice,
        extraCost: 0,
        qty: 1,
        image: image,
        specs: 'Standard Catalog Dimensions'
    });
    savePersistedClientDatabase();
    renderCartDrawer();
    openModal('cartDrawerBackdrop');
}

function addCustomizedToCart() {
    var isCustom = document.getElementById('isCustomCheckbox').checked;
    var len = document.getElementById('customLength').value;
    var wid = document.getElementById('customWidth').value;
    var hei = document.getElementById('customHeight').value;
    var finish = document.getElementById('colorFinish').value;
    var qty = parseInt(document.getElementById('customQty').value, 10) || 1;
    var extraText = document.getElementById('extraCost').textContent.replace(/,/g, '');
    var extraCost = isCustom ? (parseFloat(extraText) || 0) : 0;

    var specsText = isCustom
        ? (len + 'L × ' + wid + 'W × ' + hei + 'H cm · ' + finish)
        : 'Standard Catalog Dimensions';

    shoppingCart.push({
        id: currentSelectedProduct.id,
        name: currentSelectedProduct.name,
        basePrice: currentSelectedProduct.basePrice,
        extraCost: extraCost,
        qty: qty,
        image: currentSelectedProduct.image,
        specs: specsText
    });

    savePersistedClientDatabase();
    closeModal('customizerModal');
    renderCartDrawer();
    openModal('cartDrawerBackdrop');
}

function changeCartQty(index, delta) {
    if (!shoppingCart[index]) return;
    shoppingCart[index].qty += delta;
    if (shoppingCart[index].qty <= 0) {
        shoppingCart.splice(index, 1);
    }
    savePersistedClientDatabase();
    renderCartDrawer();
}

function removeCartItem(index) {
    shoppingCart.splice(index, 1);
    savePersistedClientDatabase();
    renderCartDrawer();
}

function renderCartDrawer() {
    var listEl = document.getElementById('cartItemsContainer');
    var countEl = document.getElementById('headerCartCount');
    var drawerTitleCount = document.getElementById('drawerCartCount');

    var totalQty = 0;
    var subtotal = 0;
    var html = '';

    for (var i = 0; i < shoppingCart.length; i++) {
        var item = shoppingCart[i];
        var unitPrice = item.basePrice + item.extraCost;
        var lineTotal = unitPrice * item.qty;
        totalQty += item.qty;
        subtotal += lineTotal;

        html += '<div class="cart-item-card">' +
            '<img src="' + item.image + '" onerror="if(!this.dataset.fb){this.dataset.fb=\'1\';this.src=this.src.replace(\'public/images/\',\'images/\');}" alt="' + item.name + '" class="cart-item-thumb">' +
            '<div class="cart-item-details">' +
                '<div class="cart-item-top">' +
                    '<h4>' + item.name + '</h4>' +
                    '<button type="button" class="btn-trash" onclick="removeCartItem(' + i + ')" title="Remove">✕</button>' +
                '</div>' +
                '<span class="cart-spec-chip">' + item.specs + '</span>' +
                '<div class="cart-item-bottom">' +
                    '<div class="qty-stepper">' +
                        '<button type="button" onclick="changeCartQty(' + i + ', -1)">-</button>' +
                        '<span>' + item.qty + '</span>' +
                        '<button type="button" onclick="changeCartQty(' + i + ', 1)">+</button>' +
                    '</div>' +
                    '<strong>₱' + lineTotal.toLocaleString() + '</strong>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    if (shoppingCart.length === 0) {
        html = '<div style="text-align:center; padding: 3rem 1rem; color:#64748b;">' +
            '<p style="font-weight:700; color:#0f172a; margin-bottom:0.4rem;">Your Shopping Cart is Empty</p>' +
            '<p style="font-size:0.8rem;">Browse our solid hardwood furniture catalog to add pieces.</p>' +
        '</div>';
    }

    if (listEl) listEl.innerHTML = html;
    if (countEl) countEl.textContent = totalQty;
    if (drawerTitleCount) drawerTitleCount.textContent = totalQty;

    var shipping = (subtotal >= 15000 || subtotal === 0) ? 0 : 850;
    var grandTotal = subtotal + shipping;
    var downpayment = Math.round(grandTotal * 0.5);

    var subEl = document.getElementById('cartSubtotalText');
    var grandEl = document.getElementById('cartGrandTotalText');
    var dpEl = document.getElementById('cartDownpaymentText');
    var chkTotalEl = document.getElementById('checkoutTotalText');
    var chkDpEl = document.getElementById('checkoutDpText');
    var chkBtnDpEl = document.getElementById('checkoutBtnDpText');

    if (subEl) subEl.textContent = '₱' + subtotal.toLocaleString();
    if (grandEl) grandEl.textContent = '₱' + grandTotal.toLocaleString();
    if (dpEl) dpEl.textContent = '₱' + downpayment.toLocaleString();
    if (chkTotalEl) chkTotalEl.textContent = '₱' + grandTotal.toLocaleString() + ' (' + totalQty + ' pcs)';
    if (chkDpEl) chkDpEl.textContent = '₱' + downpayment.toLocaleString();
    if (chkBtnDpEl) chkBtnDpEl.textContent = '₱' + downpayment.toLocaleString();
}

// --- 8. CHECKOUT AND ORDER TRACKING ---
function proceedToCheckoutModal() {
    if (shoppingCart.length === 0) return;
    closeModal('cartDrawerBackdrop');
    openModal('checkoutModal');
}

function submitLiveOrder(event) {
    event.preventDefault();
    var nameIn = document.getElementById('chkFullName');
    var phoneIn = document.getElementById('chkPhone');
    var addrIn = document.getElementById('chkAddress');
    var errBox = document.getElementById('checkoutErrorMsg');

    if (!nameIn.value.trim() || phoneIn.value.trim().length < 10 || addrIn.value.trim().length < 8) {
        if (errBox) {
            errBox.style.display = 'block';
            errBox.textContent = 'Please provide your full name, a valid mobile number, and complete delivery address.';
        }
        return false;
    }

    if (errBox) errBox.style.display = 'none';

    var subtotal = 0;
    for (var i = 0; i < shoppingCart.length; i++) {
        subtotal += (shoppingCart[i].basePrice + shoppingCart[i].extraCost) * shoppingCart[i].qty;
    }
    var grandTotal = subtotal + (subtotal >= 15000 ? 0 : 850);
    var dp = Math.round(grandTotal * 0.5);
    var firstItemName = shoppingCart[0] ? (shoppingCart[0].name + ' (' + shoppingCart[0].specs + ')') : 'Custom Furniture Order';

    var newOrderId = '1003';
    sampleOrders[newOrderId] = {
        orderId: newOrderId,
        customer: nameIn.value.trim(),
        placed: '2026-11-07',
        due: '2026-11-21',
        status: 'Pending',
        stepIndex: 0,
        carpenter: 'Master Carding Santos',
        stage: 'Timber Selection & Grain Matching',
        driver: 'Rene Ocampo (0918-555-6666)',
        address: addrIn.value.trim(),
        itemSummary: firstItemName,
        total: grandTotal,
        downpayment: dp
    };

    shoppingCart = [];
    savePersistedClientDatabase();
    renderCartDrawer();
    renderAdminDashboard();
    closeModal('checkoutModal');
    lookupOrderById(newOrderId);
    openModal('trackOrderModal');
    return false;
}

function lookupOrderById(orderId) {
    var inputEl = document.getElementById('trackOrderInput');
    if (inputEl && orderId) inputEl.value = orderId;

    var query = String(orderId || (inputEl ? inputEl.value : '1001')).replace(/[^0-9]/g, '');
    var record = sampleOrders[query];
    var resultBox = document.getElementById('trackResultContainer');

    if (!resultBox) return;

    if (!record) {
        resultBox.innerHTML = '<div style="padding:2rem; text-align:center; color:#dc2626; font-size:0.85rem;">' +
            'Order #' + query + ' was not found. Please try sample Order #1001 or #1002.' +
        '</div>';
        return;
    }

    var stages = ['Pending', 'Confirmed', 'In Production', 'Ready', 'Delivered'];
    var timelineHtml = '';
    for (var i = 0; i < stages.length; i++) {
        var doneClass = (i <= record.stepIndex) ? 'done' : '';
        var circleText = (i <= record.stepIndex) ? '✓' : (i + 1);
        timelineHtml += '<div class="timeline-node ' + doneClass + '">' +
            '<div class="node-circle">' + circleText + '</div>' +
            '<span class="node-label">' + stages[i] + '</span>' +
        '</div>';
    }

    resultBox.innerHTML =
        '<div class="price-banner-box">' +
            '<div>' +
                '<span class="modal-kicker">Order Reference #' + record.orderId + '</span>' +
                '<strong style="font-size:1.05rem; display:block;">Recipient: ' + record.customer + '</strong>' +
                '<span style="font-size:0.75rem; color:#475569;">Placed: ' + record.placed + ' · Target Completion: ' + record.due + '</span>' +
            '</div>' +
            '<span class="btn-sm-primary">' + record.status + '</span>' +
        '</div>' +
        '<div class="timeline-track">' + timelineHtml + '</div>' +
        '<div class="form-row-2" style="margin-bottom:1rem;">' +
            '<div style="padding:0.9rem; border:1px solid #e2e8f0; border-radius:8px;">' +
                '<strong style="font-size:0.75rem; color:#0369a1; display:block; margin-bottom:0.3rem;">🔨 WORKSHOP ASSIGNMENT</strong>' +
                '<p style="font-size:0.78rem;"><strong>Carpenter:</strong> ' + record.carpenter + '</p>' +
                '<p style="font-size:0.78rem;"><strong>Stage:</strong> ' + record.stage + '</p>' +
            '</div>' +
            '<div style="padding:0.9rem; border:1px solid #e2e8f0; border-radius:8px;">' +
                '<strong style="font-size:0.75rem; color:#0369a1; display:block; margin-bottom:0.3rem;">🚚 IN-HOUSE DELIVERY DISPATCH</strong>' +
                '<p style="font-size:0.78rem;"><strong>Driver:</strong> ' + record.driver + '</p>' +
                '<p style="font-size:0.78rem;"><strong>Address:</strong> ' + record.address + '</p>' +
            '</div>' +
        '</div>' +
        '<div style="padding:0.9rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;">' +
            '<div>' +
                '<strong>' + record.itemSummary + '</strong><br>' +
                '<span style="color:#64748b;">50% Downpayment Recorded: ₱' + record.downpayment.toLocaleString() + '</span>' +
            '</div>' +
            '<strong style="font-size:0.95rem;">₱' + record.total.toLocaleString() + '</strong>' +
        '</div>';
}

// --- 9. SIMPLE TABS FOR PROJECT HUB ---
function switchHubTab(tabId, btnEl) {
    var panes = document.querySelectorAll('.hub-tab-pane');
    for (var i = 0; i < panes.length; i++) {
        panes[i].style.display = 'none';
    }
    var target = document.getElementById(tabId);
    if (target) target.style.display = 'block';

    var btns = document.querySelectorAll('#projectHubModal .tab-btn');
    for (var j = 0; j < btns.length; j++) {
        btns[j].classList.remove('active');
    }
    if (btnEl) btnEl.classList.add('active');
}

// --- 10. PRIVATE 1-ON-1 CUSTOMER <-> ADMIN MESSAGING (Table: Order_Message) ---
// Initial messages from database/02_sample_data.sql (synced with WebSocket & REST backend)
var liveOrderMessages = [];

// Static fallback store used ONLY when opened on static GitHub Pages / file:// without server.js
var staticFallbackMessagesStore = [
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

function syncStaticFallbackMessages() {
    if (!currentUserSession.isLoggedIn) {
        liveOrderMessages = [];
        adminConversationsList = [];
        renderMessageFeeds();
        return;
    }
    var targetCid = (currentUserSession.role === 'admin')
        ? (Number(selectedAdminConversationCustomerId) || 1)
        : (Number(currentUserSession.id) || 1);
    var filtered = [];
    for (var i = 0; i < staticFallbackMessagesStore.length; i++) {
        if (Number(staticFallbackMessagesStore[i].CustomerID) === targetCid) {
            filtered.push(staticFallbackMessagesStore[i]);
        }
    }
    liveOrderMessages = filtered;
    if (currentUserSession.role === 'admin') {
        adminConversationsList = registeredCustomers.map(function (c) {
            var count = 0;
            for (var j = 0; j < staticFallbackMessagesStore.length; j++) {
                if (Number(staticFallbackMessagesStore[j].CustomerID) === Number(c.id)) count++;
            }
            return { CustomerID: c.id, FullName: c.fullName, MessageCount: count };
        });
    } else {
        adminConversationsList = [];
    }
    renderMessageFeeds();
}

// Tracks which Customer conversation the Admin currently has open (1 = Maria Santos, 2 = Atty. Roberto, etc.)
var selectedAdminConversationCustomerId = 1;
var adminConversationsList = [];
var chatSocket = null;

// Fetch strictly the authorized conversation messages from the server
function fetchAuthorizedConversationMessages(explicitCustomerIdForAdmin) {
    if (!currentUserSession.isLoggedIn) {
        liveOrderMessages = [];
        renderMessageFeeds();
        return Promise.resolve(null);
    }

    var url = '/api/messages';
    if (currentUserSession.role === 'admin') {
        var targetId = Number(explicitCustomerIdForAdmin || selectedAdminConversationCustomerId) || 1;
        url = '/api/messages?customer_id=' + encodeURIComponent(targetId);
    }

    return fetch(url, {
        method: 'GET',
        headers: getAuthRequestHeaders()
    })
    .then(function (res) {
        return res.json().then(function (data) {
            return { status: res.status, data: data };
        });
    })
    .then(function (result) {
        if (result.status === 403) {
            showChatSecurityAlert((result.data && result.data.error) || '403 Forbidden: Access denied.');
            return result;
        }
        if (result.status === 200 && result.data && Array.isArray(result.data.messages)) {
            liveOrderMessages = result.data.messages;
            if (Array.isArray(result.data.conversations)) {
                adminConversationsList = result.data.conversations;
            }
            renderMessageFeeds();
        }
        return result;
    })
    .catch(function () {
        syncStaticFallbackMessages();
        return null;
    });
}

// Determine the actual sender ID from the database message record
function getMessageSenderId(msg) {
    if (!msg) return 0;
    if (msg.SenderID !== undefined && msg.SenderID !== null) {
        return Number(msg.SenderID);
    }
    if (String(msg.SenderRole || '').toLowerCase() === 'admin') {
        return Number(msg.AdminID) || 1;
    }
    return Number(msg.CustomerID) || 1;
}

// Compare the message sender's ID and role with the currently logged-in user's ID and role
function isMessageOwnedByViewer(msg, viewerSession) {
    if (!viewerSession || !viewerSession.isLoggedIn || !viewerSession.id) {
        return false;
    }
    var msgSenderId = getMessageSenderId(msg);
    var msgSenderRole = String(msg.SenderRole || '').toLowerCase();
    var loggedInUserId = Number(viewerSession.id);
    var loggedInUserRole = String(viewerSession.role || '').toLowerCase();

    return (loggedInUserRole === msgSenderRole) && (loggedInUserId === msgSenderId);
}

// Return strictly the messages belonging to a single CustomerID conversation
function getPrivateConversationMessages(conversationCustomerId) {
    var targetCid = Number(conversationCustomerId);
    if (!targetCid || targetCid <= 0) return [];
    // Additional defense-in-depth: if viewer is a customer, never return messages for any other CustomerID
    if (currentUserSession.isLoggedIn && currentUserSession.role === 'customer') {
        if (targetCid !== Number(currentUserSession.id)) {
            return [];
        }
    }
    var filtered = [];
    for (var i = 0; i < liveOrderMessages.length; i++) {
        if (Number(liveOrderMessages[i].CustomerID) === targetCid) {
            filtered.push(liveOrderMessages[i]);
        }
    }
    return filtered;
}

// Look up Customer metadata by CustomerID
function getCustomerRecordById(customerId) {
    var cid = Number(customerId);
    for (var i = 0; i < registeredCustomers.length; i++) {
        if (Number(registeredCustomers[i].id) === cid) {
            return registeredCustomers[i];
        }
    }
    return {
        id: cid,
        fullName: 'Customer #' + cid,
        email: '',
        phone: '',
        address: ''
    };
}

// Build Messenger-aligned HTML strictly for a specific Customer's private conversation
function buildMessengerFeedHtml(viewerSession, conversationCustomerId) {
    if (!viewerSession || !viewerSession.isLoggedIn || !viewerSession.id) {
        return '<div style="text-align:center; padding: 2.5rem 1rem; color:#475569;">' +
            '<strong style="display:block; color:#0f172a; margin-bottom:0.35rem;">🔒 Private Customer-Admin Messenger</strong>' +
            '<span style="font-size:0.8rem;">Please sign in to your Customer or Admin account to view your private conversation.</span>' +
        '</div>';
    }

    var privateMsgs = getPrivateConversationMessages(conversationCustomerId);
    if (privateMsgs.length === 0) {
        var custInfo = getCustomerRecordById(conversationCustomerId);
        return '<div style="text-align:center; padding: 2.5rem 1rem; color:#64748b; font-size:0.82rem;">' +
            '<strong style="display:block; color:#0f172a; margin-bottom:0.3rem;">Private Conversation with ' + escapeHtmlText(custInfo.fullName) + ' (Customer #' + Number(conversationCustomerId) + ')</strong>' +
            '<span>No messages in this private conversation yet. Send a message below to start!</span>' +
        '</div>';
    }

    var html = '';
    for (var i = 0; i < privateMsgs.length; i++) {
        var msg = privateMsgs[i];
        var senderId = getMessageSenderId(msg);
        var isOwnMessage = isMessageOwnedByViewer(msg, viewerSession);

        var rowClass = isOwnMessage ? 'chat-row own-row' : 'chat-row other-row';
        var bubbleClass = isOwnMessage ? 'chat-bubble msg-own' : 'chat-bubble msg-other';
        var orderTag = msg.OrderID ? ('Order #' + msg.OrderID) : 'General Inquiry';
        var senderLabel = isOwnMessage
            ? (escapeHtmlText(msg.SenderName) + ' (You)')
            : (escapeHtmlText(msg.SenderName) + ' (' + escapeHtmlText(msg.SenderRole) + ')');

        html +=
            '<div class="' + rowClass + '" data-message-id="' + Number(msg.MessageID) + '" data-conversation-customer-id="' + Number(msg.CustomerID) + '" data-sender-id="' + senderId + '" data-sender-role="' + escapeHtmlText(msg.SenderRole) + '" data-alignment="' + (isOwnMessage ? 'right' : 'left') + '">' +
                '<div class="' + bubbleClass + '" data-sender-id="' + senderId + '" data-sender-role="' + escapeHtmlText(msg.SenderRole) + '" data-own-message="' + (isOwnMessage ? 'true' : 'false') + '">' +
                    '<div class="chat-bubble-meta">' +
                        '<strong>' + senderLabel + '</strong>' +
                        '<span>' + escapeHtmlText(msg.Topic || orderTag) + ' · ' + escapeHtmlText(msg.CreatedAt) + '</span>' +
                    '</div>' +
                    '<div>' + escapeHtmlText(msg.MessageText) + '</div>' +
                '</div>' +
            '</div>';
    }
    return html;
}

// Build the Admin's Customer Conversation List (ONLY populated for Admin accounts)
function buildAdminConversationListHtml() {
    if (!currentUserSession.isLoggedIn || currentUserSession.role !== 'admin') {
        return '';
    }
    var html = '';
    for (var i = 0; i < registeredCustomers.length; i++) {
        var cust = registeredCustomers[i];
        var cid = Number(cust.id);
        var msgCount = 0;
        for (var k = 0; k < adminConversationsList.length; k++) {
            if (Number(adminConversationsList[k].CustomerID) === cid) {
                msgCount = Number(adminConversationsList[k].MessageCount) || 0;
                break;
            }
        }
        if (msgCount === 0 && cid === Number(selectedAdminConversationCustomerId)) {
            msgCount = getPrivateConversationMessages(cid).length;
        }
        var isSelected = (cid === Number(selectedAdminConversationCustomerId));
        var btnClass = isSelected ? 'btn-sm-primary' : 'btn-sm-soft';
        var orderLabel = (cid === 1) ? 'Order #1001' : ((cid === 2) ? 'Order #1002' : 'Custom Inquiry');

        html +=
            '<button type="button" class="' + btnClass + '" data-conversation-btn="' + cid + '" onclick="selectAdminConversation(' + cid + ')">' +
                '<span>👤 ' + escapeHtmlText(cust.fullName) + ' (Customer #' + cid + ' · ' + orderLabel + ' · ' + msgCount + ' msgs)</span>' +
            '</button>';
    }
    return html;
}

// Switch active customer conversation (Strictly authorized for Admin; DENIED with 403 for Customers)
function selectAdminConversation(customerId) {
    var requestedCid = Number(customerId) || 1;

    // If a Customer attempts to call selectAdminConversation(2) to view another customer's chat, deny immediately
    if (!currentUserSession.isLoggedIn || currentUserSession.role !== 'admin') {
        showChatSecurityAlert('403 Forbidden: Customer accounts cannot switch to or access another customer\'s conversation.');
        if (chatSocket && chatSocket.readyState === 1) {
            chatSocket.send(JSON.stringify({
                type: 'conversation:select',
                sessionToken: currentSessionToken,
                activeCustomerId: requestedCid
            }));
        }
        return false;
    }

    selectedAdminConversationCustomerId = requestedCid;
    showChatSecurityAlert('');

    // Sync Admin reply dropdown in Admin Console
    var targetSelect = document.getElementById('adminReplyTargetOrder');
    if (targetSelect) {
        for (var i = 0; i < targetSelect.options.length; i++) {
            var parts = targetSelect.options[i].value.split('|');
            if (Number(parts[0]) === selectedAdminConversationCustomerId) {
                targetSelect.selectedIndex = i;
                break;
            }
        }
    }

    // Request selected customer's conversation from backend WebSocket and REST
    if (chatSocket && chatSocket.readyState === 1) {
        chatSocket.send(JSON.stringify({
            type: 'conversation:select',
            sessionToken: currentSessionToken,
            activeCustomerId: selectedAdminConversationCustomerId
        }));
    }

    return fetchAuthorizedConversationMessages(selectedAdminConversationCustomerId);
}

// Update Order dropdown, Topic dropdown, and Quick Templates so Customers only see their own orders
function renderPrivateOrderOptionsForConversation(conversationCustomerId) {
    var orderSelect = document.getElementById('chatOrderSelect');
    var topicSelect = document.getElementById('chatTopicSelect');
    var quickChipsBox = document.getElementById('chatQuickChipsContainer');
    var cid = Number(conversationCustomerId) || 1;
    var orderNum = (cid === 1) ? '1001' : ((cid === 2) ? '1002' : '');

    if (orderSelect && orderSelect.getAttribute('data-for-customer-id') !== String(cid)) {
        orderSelect.setAttribute('data-for-customer-id', String(cid));
        var optionsHtml = '';
        if (cid === 1) {
            optionsHtml += '<option value="1001">Order #1001 — Mahogany 6-Seater Dining Set</option>';
        } else if (cid === 2) {
            optionsHtml += '<option value="1002">Order #1002 — Scandinavian Sky Blue Lounge Sofa</option>';
        }
        optionsHtml += '<option value="">General Inquiry / New Custom Quote</option>';
        orderSelect.innerHTML = optionsHtml;
    }

    if (topicSelect && topicSelect.getAttribute('data-for-customer-id') !== String(cid)) {
        topicSelect.setAttribute('data-for-customer-id', String(cid));
        var topicSuffix = orderNum ? (' (#' + orderNum + ')') : '';
        topicSelect.innerHTML =
            '<option value="Order Follow-Up' + topicSuffix + '">Order Status Follow-Up' + topicSuffix + '</option>' +
            '<option value="Add Custom Request' + topicSuffix + '">Add Extra Item / Modify Custom Spec' + topicSuffix + '</option>' +
            '<option value="Delivery Coordination' + topicSuffix + '">Delivery Schedule Coordination' + topicSuffix + '</option>' +
            '<option value="Workshop Inquiry">General Workshop Inquiry</option>';
    }

    if (quickChipsBox) {
        if (cid === 1) {
            quickChipsBox.innerHTML =
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'1001\', \'Order Follow-Up (#1001)\', \'Hello Admin! I would like to follow up on the production status of Order #1001 (Mahogany Dining Set). How is the finishing progressing?\')">📋 Follow up Order #1001 status</button>' +
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'1001\', \'Add Custom Request (#1001)\', \'Hello Admin! Can we add 2 extra matching solid mahogany dining chairs to our Order #1001?\')">➕ Add 2 extra chairs to Order #1001</button>' +
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'1001\', \'Delivery Schedule (#1001)\', \'Good day! Could you please confirm the estimated delivery arrival window for Order #1001?\')">🚚 Confirm Order #1001 delivery time</button>';
        } else if (cid === 2) {
            quickChipsBox.innerHTML =
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'1002\', \'Order Follow-Up (#1002)\', \'Hello Admin! I would like to check on the framing progress for my Order #1002 (Scandinavian Sky Blue Lounge Sofa).\')">📋 Follow up Order #1002 status</button>' +
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'1002\', \'Add Custom Request (#1002)\', \'Hello Admin, can we add a water-resistant fabric guard treatment to our Order #1002 Sky Blue Lounge Sofa?\')">🛋️ Add fabric guard to Order #1002</button>' +
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'1002\', \'Delivery Schedule (#1002)\', \'Good day! Could you please confirm the scheduled delivery date for Order #1002 to Ayala Alabang?\')">🚚 Confirm Order #1002 delivery date</button>';
        } else {
            quickChipsBox.innerHTML =
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'\', \'Workshop Inquiry\', \'Hello Admin! I would like to request a custom dimension quote for a solid mahogany dining table.\')">📐 Request Custom Dimension Quote</button>' +
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'\', \'Delivery Coordination\', \'Hello Admin! What is the lead time for delivery to Metro Manila?\')">🚚 Ask About Delivery Lead Time</button>';
        }
    }
}

// Idempotent helper to merge messages into client store without duplicates (strictly scoped to authorized conversation)
function upsertLiveMessage(newMsg) {
    if (!newMsg || !newMsg.MessageID) return;
    if (currentUserSession.isLoggedIn && currentUserSession.role === 'customer') {
        if (Number(newMsg.CustomerID) !== Number(currentUserSession.id)) {
            return;
        }
    }
    for (var i = 0; i < liveOrderMessages.length; i++) {
        if (Number(liveOrderMessages[i].MessageID) === Number(newMsg.MessageID)) {
            liveOrderMessages[i] = newMsg;
            renderMessageFeeds();
            return;
        }
    }
    liveOrderMessages.push(newMsg);
    renderMessageFeeds();
}

function escapeHtmlText(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Sync the authenticated user's session token with the WebSocket server
function syncSocketAuthIdentity() {
    if (!chatSocket || chatSocket.readyState !== 1) return;
    if (!currentUserSession.isLoggedIn || !currentSessionToken) {
        chatSocket.send(JSON.stringify({
            type: 'auth:identify',
            sessionToken: null
        }));
        return;
    }

    var identifyPacket = {
        type: 'auth:identify',
        sessionToken: currentSessionToken
    };
    if (currentUserSession.role === 'admin') {
        identifyPacket.activeCustomerId = selectedAdminConversationCustomerId;
    }
    chatSocket.send(JSON.stringify(identifyPacket));
}

// Render private conversations in both the Messenger Chat Modal and the Admin Console Inbox
function renderMessageFeeds() {
    var customerFeed = document.getElementById('customerChatFeed');
    var adminFeed = document.getElementById('adminChatFeed');
    var headerCount = document.getElementById('headerMsgCount');
    var floatingCount = document.getElementById('floatingMsgCount');
    var viewerStatusEl = document.getElementById('chatCurrentViewerLabel');
    var chatInputEl = document.getElementById('customerChatInput');
    var switchCust1Btn = document.getElementById('chatSwitchCust1Btn');
    var switchCust2Btn = document.getElementById('chatSwitchCust2Btn');
    var switchAdmin1Btn = document.getElementById('chatSwitchAdmin1Btn');
    var adminConvBoxInChat = document.getElementById('adminConversationSelectorBox');
    var adminConvListInChat = document.getElementById('adminConversationListInChat');
    var adminConvListInConsole = document.getElementById('adminConversationListInConsole');
    var adminActiveThreadLabel = document.getElementById('adminActiveThreadLabel');

    // Determine which conversation is active for the currently logged-in user
    var activeConversationCustomerId = null;
    if (currentUserSession.isLoggedIn) {
        if (currentUserSession.role === 'admin') {
            activeConversationCustomerId = Number(selectedAdminConversationCustomerId) || 1;
        } else {
            // Customer is strictly locked to their own private conversation (CustomerID === currentUserSession.id)
            activeConversationCustomerId = Number(currentUserSession.id) || 1;
        }
    }

    var visibleConversationMsgs = activeConversationCustomerId
        ? getPrivateConversationMessages(activeConversationCustomerId)
        : [];

    // Header badge shows only the count of messages in the user's private conversation (or active thread for Admin)
    if (headerCount) headerCount.textContent = visibleConversationMsgs.length;
    if (floatingCount) floatingCount.textContent = visibleConversationMsgs.length;

    // Update the authenticated viewer & private conversation indicator inside the Messenger modal
    if (viewerStatusEl) {
        if (currentUserSession.isLoggedIn && currentUserSession.role === 'admin') {
            var activeCust = getCustomerRecordById(activeConversationCustomerId);
            viewerStatusEl.innerHTML =
                '🔑 Logged in as <strong>' + escapeHtmlText(currentUserSession.name) + '</strong> (<code>AdminID: ' + Number(currentUserSession.id) + '</code>) · ' +
                'Viewing Private Conversation with <strong>' + escapeHtmlText(activeCust.fullName) + ' (Customer #' + activeConversationCustomerId + ')</strong>';
        } else if (currentUserSession.isLoggedIn && currentUserSession.role === 'customer') {
            viewerStatusEl.innerHTML =
                '🔒 Private Conversation: <strong>' + escapeHtmlText(currentUserSession.name) + '</strong> (<code>CustomerID: ' + Number(currentUserSession.id) + '</code>) ↔ <strong>Workshop Admin</strong> — Only you and the Admin can see this chat.';
        } else {
            viewerStatusEl.innerHTML =
                '🔒 <strong>Sign In Required</strong> — Please sign in as a Customer or Admin to access your private conversation.';
        }
    }

    // Show the Admin's Customer Conversation List switcher ONLY when Admin is logged in
    if (adminConvBoxInChat) {
        adminConvBoxInChat.style.display = (currentUserSession.isLoggedIn && currentUserSession.role === 'admin') ? 'block' : 'none';
    }
    var convButtonsHtml = buildAdminConversationListHtml();
    if (adminConvListInChat) {
        adminConvListInChat.innerHTML = convButtonsHtml;
    }
    if (adminConvListInConsole) {
        adminConvListInConsole.innerHTML = convButtonsHtml;
    }
    if (adminActiveThreadLabel) {
        var targetCust = getCustomerRecordById(selectedAdminConversationCustomerId);
        adminActiveThreadLabel.innerHTML =
            'Active Private Conversation: <strong>' + escapeHtmlText(targetCust.fullName) + ' (Customer #' + Number(selectedAdminConversationCustomerId) + ')</strong> ↔ <strong>Workshop Admin</strong>';
    }

    // Keep Admin Console reply dropdown options synced with all registered customers
    var targetSelect = document.getElementById('adminReplyTargetOrder');
    if (targetSelect) {
        var selectHtml = '';
        for (var c = 0; c < registeredCustomers.length; c++) {
            var rc = registeredCustomers[c];
            var ordNum = (rc.id === 1) ? '1001' : ((rc.id === 2) ? '1002' : '1003');
            var topicStr = (rc.id === 2) ? ('Add Custom Request (#' + ordNum + ')') : ('Order Follow-Up (#' + ordNum + ')');
            var selAttr = (Number(rc.id) === Number(selectedAdminConversationCustomerId)) ? ' selected' : '';
            selectHtml += '<option value="' + rc.id + '|' + ordNum + '|' + topicStr + '"' + selAttr + '>Reply Privately to ' + escapeHtmlText(rc.fullName) + ' (Customer #' + rc.id + ')</option>';
        }
        targetSelect.innerHTML = selectHtml;
    }

    if (chatInputEl) {
        if (currentUserSession.isLoggedIn && currentUserSession.role === 'admin') {
            var activeCustObj = getCustomerRecordById(activeConversationCustomerId);
            chatInputEl.placeholder = 'Reply privately to ' + activeCustObj.fullName + ' (Customer #' + activeConversationCustomerId + ')...';
        } else if (currentUserSession.isLoggedIn && currentUserSession.role === 'customer') {
            chatInputEl.placeholder = 'Send a private message to Workshop Admin as ' + currentUserSession.name + '...';
        } else {
            chatInputEl.placeholder = 'Please sign in to send a private message...';
        }
    }

    // Highlight active quick-switch button in the Messenger modal
    if (switchCust1Btn) {
        var isCust1 = currentUserSession.isLoggedIn && currentUserSession.role === 'customer' && Number(currentUserSession.id) === 1;
        switchCust1Btn.className = isCust1 ? 'btn-sm-primary' : 'btn-sm-soft';
    }
    if (switchCust2Btn) {
        var isCust2 = currentUserSession.isLoggedIn && currentUserSession.role === 'customer' && Number(currentUserSession.id) === 2;
        switchCust2Btn.className = isCust2 ? 'btn-sm-primary' : 'btn-sm-soft';
    }
    if (switchAdmin1Btn) {
        var isAdm1 = currentUserSession.isLoggedIn && currentUserSession.role === 'admin';
        switchAdmin1Btn.className = isAdm1 ? 'btn-sm-primary' : 'btn-sm-soft';
    }

    // Update Order dropdown & Quick Prompts for the active private conversation
    if (activeConversationCustomerId) {
        renderPrivateOrderOptionsForConversation(activeConversationCustomerId);
    }

    // 1. Render main Messenger Chat Window (#customerChatFeed) scoped strictly to activeConversationCustomerId
    if (customerFeed) {
        customerFeed.innerHTML = buildMessengerFeedHtml(currentUserSession, activeConversationCustomerId);
        customerFeed.scrollTop = customerFeed.scrollHeight;
    }

    // 2. Render Admin Console Inbox (#adminChatFeed) scoped strictly to selectedAdminConversationCustomerId
    if (adminFeed) {
        var adminViewerSession = (currentUserSession.isLoggedIn && currentUserSession.role === 'admin')
            ? currentUserSession
            : { isLoggedIn: true, id: 1, role: 'admin', name: 'Rowena & Lilia (Workshop Admin)' };
        adminFeed.innerHTML = buildMessengerFeedHtml(adminViewerSession, selectedAdminConversationCustomerId);
        adminFeed.scrollTop = adminFeed.scrollHeight;
    }
}

// Connect to Real-Time WebSocket Server (/ws-chat) for instant private 1-on-1 messaging
function initRealTimeMessaging() {
    // 1. Bootstrap server-side session token (sending saved session token from localStorage)
    fetch('/api/auth/session', {
        method: 'GET',
        headers: getAuthRequestHeaders()
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data && data.status === 'ok') {
                if (Array.isArray(data.customers)) {
                    mergeServerCustomersIntoLocal(data.customers);
                }
                if (data.user) {
                    var savedEmail = (currentUserSession && currentUserSession.isLoggedIn && currentUserSession.email)
                        ? String(currentUserSession.email).toLowerCase()
                        : '';
                    var serverEmail = String(data.user.email || '').toLowerCase();

                    // If localStorage has a non-default logged-in user and server fell back to default Maria, sync the saved user to server
                    if (savedEmail && savedEmail !== serverEmail && serverEmail === 'maria.santos@example.com') {
                        var savedPass = 'password123';
                        var savedRole = currentUserSession.role || 'customer';
                        if (savedRole === 'admin') {
                            savedPass = 'admin123';
                        } else {
                            for (var m = 0; m < registeredCustomers.length; m++) {
                                if (String(registeredCustomers[m].email).toLowerCase() === savedEmail) {
                                    savedPass = registeredCustomers[m].password || 'password123';
                                    break;
                                }
                            }
                        }
                        return performServerLogin(savedEmail, savedPass, savedRole, false);
                    }

                    currentSessionToken = data.sessionToken || null;
                    currentUserSession = data.user;
                    savePersistedClientDatabase();
                    renderAuthHeaderState();
                    return fetchAuthorizedConversationMessages();
                }
            }
            return null;
        })
        .catch(function () {
            // Try XAMPP PHP + MySQL session, otherwise use localStorage persisted session & messages
            fetch('public/index.php?route=api_session')
                .then(function (r) { return r.json(); })
                .then(function (phpData) {
                    if (phpData && phpData.status === 'ok') {
                        if (Array.isArray(phpData.customers)) {
                            mergeServerCustomersIntoLocal(phpData.customers);
                        }
                        if (phpData.user && phpData.user.isLoggedIn) {
                            currentUserSession = phpData.user;
                            savePersistedClientDatabase();
                            renderAuthHeaderState();
                        }
                    }
                    syncStaticFallbackMessages();
                })
                .catch(function () {
                    syncStaticFallbackMessages();
                });
        });

    try {
        var protocol = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
        var wsUrl = protocol + '//' + window.location.host + '/ws-chat';
        chatSocket = new WebSocket(wsUrl);

        chatSocket.onopen = function () {
            var badge = document.getElementById('liveSocketStatusBadge');
            if (badge) {
                badge.textContent = '● Private Real-Time Connected';
                badge.style.background = '#dcfce7';
                badge.style.color = '#15803d';
            }
            syncSocketAuthIdentity();
        };

        chatSocket.onmessage = function (event) {
            try {
                var data = JSON.parse(event.data);
                if (data.type === 'error:forbidden') {
                    showChatSecurityAlert(data.error || '403 Forbidden: Unauthorized conversation access blocked.');
                    return;
                }
                if (data.type === 'messages:init' && Array.isArray(data.messages)) {
                    // Replace local message store exclusively with the server-authorized conversation messages
                    liveOrderMessages = data.messages;
                    if (Array.isArray(data.conversations)) {
                        adminConversationsList = data.conversations;
                    }
                    renderMessageFeeds();
                } else if (data.type === 'message:created' && data.message) {
                    if (Array.isArray(data.conversations)) {
                        adminConversationsList = data.conversations;
                    }
                    upsertLiveMessage(data.message);
                }
            } catch (e) {
                // Ignore malformed packet
            }
        };

        chatSocket.onclose = function () {
            // Reconnect automatically after 3 seconds if connection drops
            setTimeout(initRealTimeMessaging, 3000);
        };
    } catch (err) {
        // Fallback when WebSocket is unavailable
    }
}

// Open the Live Chat Modal
function openLiveChatModal(prefillOrderId, prefillTopic) {
    renderMessageFeeds();
    if (prefillOrderId) {
        var orderSelect = document.getElementById('chatOrderSelect');
        if (orderSelect) orderSelect.value = String(prefillOrderId);
    }
    if (prefillTopic) {
        var topicSelect = document.getElementById('chatTopicSelect');
        if (topicSelect) topicSelect.value = prefillTopic;
    }
    openModal('liveChatModal');
    var inputEl = document.getElementById('customerChatInput');
    if (inputEl) inputEl.focus();
}

// Open Live Chat directly from the Track Order Modal
function openFollowUpFromTracker() {
    var trackInput = document.getElementById('trackOrderInput');
    var orderId = trackInput ? trackInput.value.trim() : '1001';
    closeModal('trackOrderModal');
    openLiveChatModal(orderId, 'Order Follow-Up (#' + orderId + ')');
}

// Quick 1-Click Template Chip for Customers
function fillChatQuickPrompt(orderId, topic, messageText) {
    var orderSelect = document.getElementById('chatOrderSelect');
    var topicSelect = document.getElementById('chatTopicSelect');
    var inputEl = document.getElementById('customerChatInput');

    if (orderSelect) orderSelect.value = String(orderId);
    if (topicSelect) {
        var found = false;
        for (var i = 0; i < topicSelect.options.length; i++) {
            if (topicSelect.options[i].value === topic) {
                found = true;
                break;
            }
        }
        if (!found) {
            var opt = document.createElement('option');
            opt.value = topic;
            opt.textContent = topic;
            topicSelect.appendChild(opt);
        }
        topicSelect.value = topic;
    }
    if (inputEl) {
        inputEl.value = messageText;
        inputEl.focus();
    }
}

// Send a live message via server-authenticated POST /api/messages (deriving CustomerID from server session for Customers)
function sendLiveOrderMessage(payload) {
    return fetch('/api/messages', {
        method: 'POST',
        headers: getAuthRequestHeaders(),
        body: JSON.stringify(payload)
    })
    .then(function (res) {
        return res.json().then(function (data) {
            return { status: res.status, data: data };
        });
    })
    .then(function (result) {
        if (result.status === 403 || result.status === 401) {
            showChatSecurityAlert((result.data && result.data.error) || '403 Forbidden: Cannot send message to another customer\'s conversation.');
            return result;
        }
        showChatSecurityAlert('');
        if (result.data && result.data.message) {
            if (Array.isArray(result.data.conversations)) {
                adminConversationsList = result.data.conversations;
            }
            upsertLiveMessage(result.data.message);
        }
        return result;
    })
    .catch(function () {
        // Static GitHub Pages / file:// fallback when /api/messages is unavailable
        var fallbackCid = (currentUserSession.role === 'admin')
            ? (Number(payload.CustomerID || selectedAdminConversationCustomerId) || 1)
            : (Number(currentUserSession.id) || 1);
        var newFallbackMsg = {
            MessageID: staticFallbackMessagesStore.length + 10,
            CustomerID: fallbackCid,
            OrderID: payload.OrderID || null,
            AdminID: (currentUserSession.role === 'admin') ? Number(currentUserSession.id) : null,
            SenderID: Number(currentUserSession.id) || 1,
            SenderRole: (currentUserSession.role === 'admin') ? 'Admin' : 'Customer',
            SenderName: currentUserSession.name || 'User',
            Topic: payload.Topic || 'Order Follow-Up',
            MessageText: payload.MessageText || '',
            CreatedAt: 'Just now'
        };
        staticFallbackMessagesStore.push(newFallbackMsg);
        savePersistedClientDatabase();
        syncStaticFallbackMessages();
        return null;
    });
}

function handleCustomerChatSubmit(event) {
    event.preventDefault();
    if (!currentUserSession.isLoggedIn || !currentUserSession.id) {
        openModal('authModal');
        return false;
    }

    var inputEl = document.getElementById('customerChatInput');
    var orderSelect = document.getElementById('chatOrderSelect');
    var topicSelect = document.getElementById('chatTopicSelect');

    var text = inputEl ? inputEl.value.trim() : '';
    if (!text) return false;

    var orderId = (orderSelect && orderSelect.value) ? Number(orderSelect.value) : null;
    var topic = (topicSelect && topicSelect.value) ? topicSelect.value : 'Order Follow-Up';

    if (currentUserSession.role === 'admin') {
        // Admin explicitly specifies the selected customer conversation to reply to
        sendLiveOrderMessage({
            CustomerID: Number(selectedAdminConversationCustomerId) || 1,
            OrderID: orderId,
            Topic: topic,
            MessageText: text
        });
    } else {
        // Customer: do not send client-supplied CustomerID; backend derives CustomerID strictly from authenticated session
        sendLiveOrderMessage({
            OrderID: orderId,
            Topic: topic,
            MessageText: text
        });
    }

    if (inputEl) inputEl.value = '';
    return false;
}

function handleAdminReplySubmit(event) {
    event.preventDefault();
    if (!currentUserSession.isLoggedIn || currentUserSession.role !== 'admin') {
        showChatSecurityAlert('403 Forbidden: Only Admin accounts can send Admin replies.');
        return false;
    }

    var replyInput = document.getElementById('adminReplyInput');
    var targetSelect = document.getElementById('adminReplyTargetOrder');

    var text = replyInput ? replyInput.value.trim() : '';
    if (!text) return false;

    var parts = (targetSelect && targetSelect.value)
        ? targetSelect.value.split('|')
        : [String(selectedAdminConversationCustomerId || 1), '1001', 'Order Follow-Up (#1001)'];
    var custId = Number(parts[0]) || Number(selectedAdminConversationCustomerId) || 1;
    var ordId = Number(parts[1]) || (custId === 2 ? 1002 : 1001);
    var topic = parts[2] || 'Workshop Admin Reply';

    // Switch active admin conversation to the customer being replied to so Admin immediately sees the reply in that thread
    selectedAdminConversationCustomerId = custId;

    sendLiveOrderMessage({
        CustomerID: custId,
        OrderID: ordId,
        Topic: topic,
        MessageText: text
    });

    if (replyInput) replyInput.value = '';

    var msgBox = document.getElementById('adminStatusNotice');
    var targetCust = getCustomerRecordById(custId);
    if (msgBox) {
        msgBox.style.display = 'block';
        msgBox.textContent = '✓ Private Admin reply sent to ' + targetCust.fullName + ' (Customer #' + custId + ') — visible only in Customer #' + custId + '\'s conversation.';
    }
    return false;
}

// Initialize listeners on page load
document.addEventListener('DOMContentLoaded', function () {
    loadPersistedClientDatabase();

    var lengthInput = document.getElementById('customLength');
    var widthInput = document.getElementById('customWidth');
    var heightInput = document.getElementById('customHeight');
    var finishSelect = document.getElementById('colorFinish');
    var isCustomCheckbox = document.getElementById('isCustomCheckbox');

    if (lengthInput) lengthInput.addEventListener('input', updateProductPrice);
    if (widthInput) widthInput.addEventListener('input', updateProductPrice);
    if (heightInput) heightInput.addEventListener('input', updateProductPrice);
    if (finishSelect) finishSelect.addEventListener('change', updateProductPrice);
    if (isCustomCheckbox) isCustomCheckbox.addEventListener('change', updateProductPrice);

    renderAuthHeaderState();
    renderCartDrawer();
    renderAdminDashboard();
    lookupOrderById('1001');
    initRealTimeMessaging();
});

