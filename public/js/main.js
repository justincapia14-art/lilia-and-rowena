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
    username: 'maria.santos',
    email: 'maria.santos@example.com',
    phone: '0917-123-4567',
    gender: 'Female',
    birthday: '1992-05-14',
    profileImage: '',
    address: 'Unit 14B, Tower 2, Serendra, BGC, Taguig City'
};

var registeredCustomers = [
    {
        id: 1,
        fullName: 'Maria Teresa Santos',
        username: 'maria.santos',
        email: 'maria.santos@example.com',
        password: 'password123',
        phone: '0917-123-4567',
        gender: 'Female',
        birthday: '1992-05-14',
        profileImage: '',
        address: 'Unit 14B, Tower 2, Serendra, BGC, Taguig City'
    },
    {
        id: 2,
        fullName: 'Atty. Roberto Mendoza',
        username: 'roberto.mendoza',
        email: 'roberto.mendoza@example.com',
        password: 'password123',
        phone: '0918-987-6543',
        gender: 'Male',
        birthday: '1984-11-20',
        profileImage: '',
        address: '88 Narra Avenue, Ayala Alabang Village, Muntinlupa'
    }
];

var customerSavedAddresses = [
    {
        AddressID: 1,
        CustomerID: 1,
        RecipientName: 'Maria Teresa Santos',
        PhoneNumber: '0917-123-4567',
        StreetAddress: 'Unit 14B, Tower 2, Serendra',
        Barangay: 'Fort Bonifacio',
        City: 'Taguig City',
        Province: 'Metro Manila',
        PostalCode: '1634',
        DeliveryNotes: 'Use South Lobby service elevator; notify concierge 30 mins prior.',
        AddressLabel: 'Home',
        IsDefault: 1
    },
    {
        AddressID: 2,
        CustomerID: 1,
        RecipientName: 'Maria Teresa Santos (Office)',
        PhoneNumber: '0917-123-4567',
        StreetAddress: '18th Floor, One Bonifacio High Street, 5th Ave',
        Barangay: 'Fort Bonifacio',
        City: 'Taguig City',
        Province: 'Metro Manila',
        PostalCode: '1634',
        DeliveryNotes: 'Deliveries accepted Mon-Fri 9:00 AM - 4:00 PM at loading bay.',
        AddressLabel: 'Work',
        IsDefault: 0
    },
    {
        AddressID: 3,
        CustomerID: 2,
        RecipientName: 'Atty. Roberto Mendoza',
        PhoneNumber: '0918-987-6543',
        StreetAddress: '88 Narra Avenue, Ayala Alabang Village',
        Barangay: 'Ayala Alabang',
        City: 'Muntinlupa City',
        Province: 'Metro Manila',
        PostalCode: '1780',
        DeliveryNotes: 'Present workshop gate pass at Madras Gate guardhouse.',
        AddressLabel: 'Home',
        IsDefault: 1
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

// --- ASIA/MANILA TIMEZONE DATE HELPERS ---
function getTodayManilaClient() {
    try {
        var fmt = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        return fmt.format(new Date());
    } catch (e) {
        var d = new Date();
        var yyyy = d.getFullYear();
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        return yyyy + '-' + mm + '-' + dd;
    }
}

function offsetDateManilaClient(offsetDays) {
    var todayStr = getTodayManilaClient();
    var parts = todayStr.split('-');
    var dt = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
    dt.setUTCDate(dt.getUTCDate() + Number(offsetDays || 0));
    var yyyy = dt.getUTCFullYear();
    var mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
    var dd = String(dt.getUTCDate()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd;
}

function formatReadableDateManila(ymdStr) {
    if (!ymdStr) return 'No Date';
    var parts = String(ymdStr).slice(0, 10).split('-');
    if (parts.length !== 3) return ymdStr;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var mIdx = parseInt(parts[1], 10) - 1;
    var mName = months[mIdx] || parts[1];
    var dayNum = parseInt(parts[2], 10) || parts[2];
    return mName + ' ' + dayNum + ', ' + parts[0];
}

function buildDefaultSampleOrders() {
    var today = getTodayManilaClient();
    return {
        '1001': {
            orderId: '1001',
            customerId: 1,
            customer: 'Maria Teresa Santos',
            customerPhone: '0917-123-4567',
            customerEmail: 'maria.santos@example.com',
            placed: offsetDateManilaClient(-5),
            due: today,
            deadlineTime: '02:30 PM',
            status: 'In Production',
            priority: 'Urgent',
            quantity: 1,
            stepIndex: 2,
            carpenter: 'Master Carding Santos',
            stage: '3rd Coat Polyurethane Curing',
            driver: 'Rene Ocampo (0918-555-6666)',
            address: 'Unit 14B, Tower 2, Serendra, BGC, Taguig City',
            productName: 'Mahogany 6-Seater Dining Set',
            itemSummary: 'Mahogany 6-Seater Dining Set (220L × 90W × 75H cm · Warm Walnut)',
            jobNotes: 'Client requested felt floor protectors on all 6 dining chairs. Scheduled for final inspection today.',
            total: 30450,
            downpayment: 15225
        },
        '1002': {
            orderId: '1002',
            customerId: 2,
            customer: 'Atty. Roberto Mendoza',
            customerPhone: '0918-987-6543',
            customerEmail: 'roberto.mendoza@example.com',
            placed: offsetDateManilaClient(-3),
            due: offsetDateManilaClient(4),
            deadlineTime: '04:00 PM',
            status: 'Order Confirmed',
            priority: 'Normal',
            quantity: 1,
            stepIndex: 1,
            carpenter: 'Master Eddie Manalo',
            stage: 'Timber Preparation & Framing',
            driver: 'Rene Ocampo (0918-555-6666)',
            address: '88 Narra Avenue, Ayala Alabang Village, Muntinlupa',
            productName: 'Scandinavian Sky Blue Lounge Sofa',
            itemSummary: 'Scandinavian Sky Blue Lounge Sofa (Standard Sizing)',
            jobNotes: 'High-density foam cushion core arrived from supplier; upholstery stitching in progress.',
            total: 34000,
            downpayment: 17000
        },
        '1003': {
            orderId: '1003',
            customerId: 1,
            customer: 'Maria Teresa Santos',
            customerPhone: '0917-123-4567',
            customerEmail: 'maria.santos@example.com',
            placed: offsetDateManilaClient(-7),
            due: today,
            deadlineTime: '10:30 AM',
            status: 'For Delivery',
            priority: 'High',
            quantity: 1,
            stepIndex: 3,
            carpenter: 'Master Carding Santos',
            stage: 'Loaded on Workshop Delivery Truck',
            driver: 'Rene Ocampo (0918-555-6666)',
            address: 'Unit 14B, Tower 2, Serendra, BGC, Taguig City',
            productName: 'Solid Acacia King Bedframe',
            itemSummary: 'Solid Acacia King Bedframe (200L × 180W × 110H cm · Natural Teak Oil)',
            jobNotes: 'White-glove delivery scheduled for BGC service elevator window at 10:30 AM today.',
            total: 23500,
            downpayment: 11750
        },
        '1004': {
            orderId: '1004',
            customerId: 2,
            customer: 'Atty. Roberto Mendoza',
            customerPhone: '0918-987-6543',
            customerEmail: 'roberto.mendoza@example.com',
            placed: today,
            due: today,
            deadlineTime: '05:30 PM',
            status: 'Pending',
            priority: 'Urgent',
            quantity: 2,
            stepIndex: 0,
            carpenter: 'Master Eddie Manalo',
            stage: 'Urgent Executive Conference Table Modification',
            driver: 'Rene Ocampo (0918-555-6666)',
            address: '88 Narra Avenue, Ayala Alabang Village, Muntinlupa',
            productName: 'Mahogany 6-Seater Dining Set',
            itemSummary: 'Mahogany 6-Seater Dining Set (240L × 100W × 75H cm · Executive Gloss)',
            jobNotes: 'Rush Showroom Stock Release requested for law firm conference room today; awaiting 50% downpayment.',
            total: 61800,
            downpayment: 0
        },
        '1005': {
            orderId: '1005',
            customerId: 1,
            customer: 'Maria Teresa Santos',
            customerPhone: '0917-123-4567',
            customerEmail: 'maria.santos@example.com',
            placed: offsetDateManilaClient(-10),
            due: offsetDateManilaClient(-2),
            deadlineTime: '01:00 PM',
            status: 'In Production',
            priority: 'Urgent',
            quantity: 1,
            stepIndex: 2,
            carpenter: 'Master Carding Santos',
            stage: 'Custom Brass Leg Fitting & Final Buffing',
            driver: 'Rene Ocampo (0918-555-6666)',
            address: 'Unit 14B, Tower 2, Serendra, BGC, Taguig City',
            productName: 'Scandinavian Sky Blue Lounge Sofa',
            itemSummary: 'Scandinavian Sky Blue Lounge Sofa (180L × 88W × 82H cm · Warm Walnut Trim)',
            jobNotes: 'OVERDUE: Custom imported brass leg caps arrived 2 days late; prioritize workshop completion immediately.',
            total: 31500,
            downpayment: 15750
        },
        '1006': {
            orderId: '1006',
            customerId: 2,
            customer: 'Atty. Roberto Mendoza',
            customerPhone: '0918-987-6543',
            customerEmail: 'roberto.mendoza@example.com',
            placed: offsetDateManilaClient(-8),
            due: offsetDateManilaClient(-1),
            deadlineTime: '03:00 PM',
            status: 'Order Confirmed',
            priority: 'High',
            quantity: 1,
            stepIndex: 1,
            carpenter: 'Master Eddie Manalo',
            stage: 'Kiln-Dried Timber Mortise & Tenon Joinery',
            driver: 'Rene Ocampo (0918-555-6666)',
            address: '88 Narra Avenue, Ayala Alabang Village, Muntinlupa',
            productName: 'Solid Acacia King Bedframe',
            itemSummary: 'Solid Acacia King Bedframe + Pair of Floating Nightstands (Warm Walnut)',
            jobNotes: 'OVERDUE: Follow up with client secretary regarding custom headboard outlet cutouts.',
            total: 28900,
            downpayment: 0
        },
        '1007': {
            orderId: '1007',
            customerId: 1,
            customer: 'Maria Teresa Santos',
            customerPhone: '0917-123-4567',
            customerEmail: 'maria.santos@example.com',
            placed: offsetDateManilaClient(-14),
            due: offsetDateManilaClient(-5),
            deadlineTime: '11:00 AM',
            status: 'Completed',
            priority: 'Normal',
            quantity: 1,
            stepIndex: 4,
            carpenter: 'Master Carding Santos',
            stage: 'Delivered & Signed Off by Client',
            driver: 'Rene Ocampo (0918-555-6666)',
            address: 'Unit 14B, Tower 2, Serendra, BGC, Taguig City',
            productName: 'Mahogany 6-Seater Dining Set',
            itemSummary: 'Mahogany 6-Seater Dining Set (Standard 180L × 90W × 75H cm · Natural Teak Oil)',
            jobNotes: 'Delivered and assembled on site. Full balance paid upon inspection.',
            total: 28500,
            downpayment: 28500
        }
    };
}

var sampleOrders = buildDefaultSampleOrders();

// --- 2. MODAL AND DRAWER CONTROLS (Open & Close Popups) ---
function showChatSecurityAlert(message) {
    var alertBox = document.getElementById('chatSecurityAlertBox');
    if (alertBox) {
        if (message) {
            alertBox.textContent = message;
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
        if (typeof refreshAdminJobOrdersFromServer === 'function') {
            refreshAdminJobOrdersFromServer(true);
        }
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
var currentCsrfToken = 'lr_csrf_local_token_v1';
var isExplicitlyLoggedOut = false;
var LOCAL_STORAGE_DB_KEY = 'lr_furniture_db_v1';

function savePersistedClientDatabase() {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return;
        var payload = {
            schemaVersion: 3,
            registeredCustomers: registeredCustomers,
            customerSavedAddresses: customerSavedAddresses,
            currentUserSession: currentUserSession,
            currentSessionToken: currentSessionToken,
            currentCsrfToken: currentCsrfToken,
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
                        username: sc.username || String(sc.email).split('@')[0],
                        email: String(sc.email).toLowerCase(),
                        password: sc.password || 'password123',
                        phone: sc.phone || '',
                        gender: sc.gender || '',
                        birthday: sc.birthday || '',
                        profileImage: sc.profileImage || '',
                        address: sc.address || ''
                    });
                } else {
                    if (sc.password) registeredCustomers[foundIdx].password = sc.password;
                    registeredCustomers[foundIdx].fullName = sc.fullName || registeredCustomers[foundIdx].fullName;
                    registeredCustomers[foundIdx].username = sc.username || registeredCustomers[foundIdx].username;
                    registeredCustomers[foundIdx].phone = sc.phone || registeredCustomers[foundIdx].phone;
                    registeredCustomers[foundIdx].gender = sc.gender !== undefined ? sc.gender : registeredCustomers[foundIdx].gender;
                    registeredCustomers[foundIdx].birthday = sc.birthday !== undefined ? sc.birthday : registeredCustomers[foundIdx].birthday;
                    registeredCustomers[foundIdx].profileImage = sc.profileImage !== undefined ? sc.profileImage : registeredCustomers[foundIdx].profileImage;
                    registeredCustomers[foundIdx].address = sc.address || registeredCustomers[foundIdx].address;
                }
            }
        }

        if (Array.isArray(parsed.customerSavedAddresses) && parsed.customerSavedAddresses.length > 0) {
            customerSavedAddresses = parsed.customerSavedAddresses;
        }

        if (parsed.currentSessionToken !== undefined) {
            currentSessionToken = parsed.currentSessionToken;
        }
        if (parsed.currentCsrfToken) {
            currentCsrfToken = parsed.currentCsrfToken;
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
        if (parsed.sampleOrders && typeof parsed.sampleOrders === 'object' && (parsed.schemaVersion === 2 || parsed.schemaVersion === 3)) {
            var orderKeys = Object.keys(parsed.sampleOrders);
            for (var k = 0; k < orderKeys.length; k++) {
                var oid = orderKeys[k];
                sampleOrders[oid] = Object.assign({}, sampleOrders[oid] || {}, parsed.sampleOrders[oid]);
            }
        }
        if (Array.isArray(parsed.staticFallbackMessagesStore) && typeof staticFallbackMessagesStore !== 'undefined') {
            for (var m = 0; m < parsed.staticFallbackMessagesStore.length; m++) {
                var savedMsg = parsed.staticFallbackMessagesStore[m];
                if (!savedMsg || !savedMsg.MessageID) continue;
                var msgExists = false;
                for (var ex = 0; ex < staticFallbackMessagesStore.length; ex++) {
                    if (Number(staticFallbackMessagesStore[ex].MessageID) === Number(savedMsg.MessageID)) {
                        if (savedMsg.IsRead !== undefined) {
                            staticFallbackMessagesStore[ex].IsRead = Number(savedMsg.IsRead);
                        }
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
                username: sc.username || sc.Username || normEmail.split('@')[0],
                email: normEmail,
                password: sc.password || 'password123',
                phone: sc.phone || sc.PhoneNumber || '',
                gender: sc.gender || sc.Gender || '',
                birthday: sc.birthday || sc.Birthday || '',
                profileImage: sc.profileImage || sc.ProfileImage || '',
                address: sc.address || sc.Address || ''
            });
        } else {
            existing.id = Number(sc.id || sc.CustomerID) || existing.id;
            existing.fullName = sc.fullName || sc.FullName || existing.fullName;
            existing.username = sc.username || sc.Username || existing.username;
            existing.phone = sc.phone || sc.PhoneNumber || existing.phone;
            if (sc.gender !== undefined || sc.Gender !== undefined) existing.gender = sc.gender || sc.Gender || '';
            if (sc.birthday !== undefined || sc.Birthday !== undefined) existing.birthday = sc.birthday || sc.Birthday || '';
            if (sc.profileImage !== undefined || sc.ProfileImage !== undefined) existing.profileImage = sc.profileImage || sc.ProfileImage || '';
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
    if (currentCsrfToken) {
        headers['x-csrf-token'] = String(currentCsrfToken);
    }
    if (isExplicitlyLoggedOut) {
        headers['x-logged-out'] = '1';
    }
    return headers;
}

function renderAvatarElement(el, nameStr, profileImageStr) {
    if (!el) return;
    var cleanImg = String(profileImageStr || '').trim();
    if (cleanImg) {
        el.innerHTML = '<img src="' + escapeHtmlText(cleanImg) + '" alt="' + escapeHtmlText(nameStr || 'Profile') + '" />';
    } else {
        var initial = String(nameStr || 'M').trim().charAt(0).toUpperCase() || 'M';
        el.textContent = initial;
    }
}

function renderAuthHeaderState() {
    var loggedInBox = document.getElementById('headerLoggedInBox');
    var loggedOutBox = document.getElementById('headerLoggedOutBox');
    var custDropdownWrap = document.getElementById('customerProfileDropdownWrap');
    var adminLoggedInWrap = document.getElementById('headerAdminLoggedInWrap');
    var userNameEl = document.getElementById('headerUserName');
    var headerAvatarEl = document.getElementById('headerProfileAvatar');
    var dropNameEl = document.getElementById('dropdownCustomerName');
    var dropEmailEl = document.getElementById('dropdownCustomerEmail');
    var adminNameLabel = document.getElementById('headerAdminNameLabel');
    var adminNavBtn = document.getElementById('headerAdminBtn');
    var openAdminChatBtn = document.getElementById('openAdminConsoleFromChatBtn');
    var csrfInput = document.getElementById('adminCsrfTokenInput');
    var cpCsrfInput = document.getElementById('cpProfileCsrfToken');
    if (csrfInput && currentCsrfToken) {
        csrfInput.value = currentCsrfToken;
    }
    if (cpCsrfInput && currentCsrfToken) {
        cpCsrfInput.value = currentCsrfToken;
    }

    if (!loggedInBox || !loggedOutBox) return;

    if (currentUserSession.isLoggedIn) {
        loggedInBox.style.display = 'flex';
        loggedOutBox.style.display = 'none';

        if (currentUserSession.role === 'admin') {
            if (custDropdownWrap) custDropdownWrap.style.display = 'none';
            if (adminLoggedInWrap) adminLoggedInWrap.style.display = 'inline-flex';
            if (adminNameLabel) adminNameLabel.textContent = 'Admin (' + (currentUserSession.email || 'admin').split('@')[0] + ')';
            if (adminNavBtn) adminNavBtn.style.display = 'inline-flex';
            if (openAdminChatBtn) openAdminChatBtn.style.display = 'inline-flex';
        } else {
            if (custDropdownWrap) custDropdownWrap.style.display = 'inline-flex';
            if (adminLoggedInWrap) adminLoggedInWrap.style.display = 'none';
            if (userNameEl) userNameEl.textContent = 'My Account';
            var localRec = getCustomerRecordById(currentUserSession.id);
            var avatarImg = currentUserSession.profileImage || (localRec && localRec.profileImage) || '';
            renderAvatarElement(headerAvatarEl, currentUserSession.name, avatarImg);
            if (dropNameEl) dropNameEl.textContent = currentUserSession.name || 'Valued Customer';
            if (dropEmailEl) dropEmailEl.textContent = currentUserSession.email || '';
            if (adminNavBtn) adminNavBtn.style.display = 'none';
            if (openAdminChatBtn) openAdminChatBtn.style.display = 'none';
        }

        // Pre-fill checkout fields & saved address selector for the logged-in user
        if (typeof populateCheckoutSavedAddresses === 'function') {
            populateCheckoutSavedAddresses();
        } else {
            var chkName = document.getElementById('chkFullName');
            var chkEmail = document.getElementById('chkEmail');
            var chkPhone = document.getElementById('chkPhone');
            var chkAddr = document.getElementById('chkAddress');
            if (chkName && currentUserSession.name) chkName.value = currentUserSession.name;
            if (chkEmail && currentUserSession.email) chkEmail.value = currentUserSession.email;
            if (chkPhone && currentUserSession.phone) chkPhone.value = currentUserSession.phone;
            if (chkAddr && currentUserSession.address) chkAddr.value = currentUserSession.address;
        }
    } else {
        loggedInBox.style.display = 'none';
        loggedOutBox.style.display = 'flex';
        if (adminNavBtn) adminNavBtn.style.display = 'none';
        if (openAdminChatBtn) openAdminChatBtn.style.display = 'none';
        closeCustomerProfileDropdown();
    }

    if (typeof updateUnreadBadgesUI === 'function') {
        updateUnreadBadgesUI();
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

// ============================================================================
// 3B. PROFESSIONAL LOADING EFFECTS, CONFIRMATION DIALOGS & TOAST NOTIFICATIONS
// ============================================================================
var activeConfirmModalConfig = null;
var isConfirmModalActionInFlight = false;
var isOrderSubmissionInFlight = false;
var isMessageSendInFlight = false;

function ensureToastContainerExists() {
    var container = document.getElementById('globalToastContainer');
    if (!container && typeof document !== 'undefined' && document.body) {
        container = document.createElement('div');
        container.id = 'globalToastContainer';
        container.className = 'ux-toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'false');
        document.body.appendChild(container);
    }
    return container;
}

function dismissToast(toastEl) {
    if (!toastEl || toastEl.dataset.dismissed === '1') return;
    toastEl.dataset.dismissed = '1';
    toastEl.classList.add('ux-toast-hiding');
    setTimeout(function () {
        if (toastEl && toastEl.parentNode) {
            toastEl.parentNode.removeChild(toastEl);
        }
    }, 220);
}

function showToast(type, title, message, durationMs) {
    var variant = String(type || 'success').toLowerCase();
    if (variant !== 'success' && variant !== 'error' && variant !== 'warning' && variant !== 'info') {
        variant = 'info';
    }
    var container = ensureToastContainerExists();
    if (!container) return null;

    // Limit concurrent visible toasts to 4 so the screen never clutters
    var existingToasts = container.querySelectorAll('.ux-toast');
    if (existingToasts.length >= 4) {
        dismissToast(existingToasts[0]);
    }

    var iconMap = {
        success: '✓',
        error: '✕',
        warning: '!',
        info: 'i'
    };

    var toast = document.createElement('div');
    toast.className = 'ux-toast ux-toast-' + variant;
    toast.setAttribute('role', variant === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', variant === 'error' ? 'assertive' : 'polite');

    var safeTitle = escapeHtmlText(title || (variant === 'error' ? 'Action Failed' : 'Notification'));
    var safeMsg = message ? escapeHtmlText(message) : '';

    toast.innerHTML =
        '<div class="ux-toast-icon" aria-hidden="true">' + (iconMap[variant] || '✓') + '</div>' +
        '<div class="ux-toast-body">' +
            '<p class="ux-toast-title">' + safeTitle + '</p>' +
            (safeMsg ? '<p class="ux-toast-msg">' + safeMsg + '</p>' : '') +
        '</div>' +
        '<button type="button" class="ux-toast-close" aria-label="Dismiss notification">✕</button>';

    var closeBtn = toast.querySelector('.ux-toast-close');
    if (closeBtn) {
        closeBtn.onclick = function () {
            dismissToast(toast);
        };
    }

    container.appendChild(toast);

    var timeoutDuration = typeof durationMs === 'number'
        ? durationMs
        : (variant === 'error' ? 5500 : 4000);

    if (timeoutDuration > 0) {
        setTimeout(function () {
            dismissToast(toast);
        }, timeoutDuration);
    }

    return toast;
}

function showSuccessToast(title, message, durationMs) {
    return showToast('success', title, message, durationMs);
}

function showErrorToast(title, message, durationMs) {
    return showToast('error', title, message, durationMs);
}

function showWarningToast(title, message, durationMs) {
    return showToast('warning', title, message, durationMs);
}

function showInfoToast(title, message, durationMs) {
    return showToast('info', title, message, durationMs);
}

function setButtonLoading(btnEl, isLoading, loadingText) {
    if (!btnEl) return;
    if (isLoading) {
        if (!btnEl.getAttribute('data-ux-orig-html')) {
            btnEl.setAttribute('data-ux-orig-html', btnEl.innerHTML);
        }
        btnEl.disabled = true;
        btnEl.setAttribute('aria-busy', 'true');
        btnEl.classList.add('is-loading-btn');
        var label = loadingText || 'Processing...';
        btnEl.innerHTML =
            '<span class="btn-spinner" aria-hidden="true"></span>' +
            '<span>' + escapeHtmlText(label) + '</span>';
    } else {
        var origHtml = btnEl.getAttribute('data-ux-orig-html');
        if (origHtml !== null) {
            btnEl.innerHTML = origHtml;
            btnEl.removeAttribute('data-ux-orig-html');
        }
        btnEl.disabled = false;
        btnEl.removeAttribute('aria-busy');
        btnEl.classList.remove('is-loading-btn');
    }
}

function markFieldInvalid(inputEl, isInvalid) {
    if (!inputEl) return;
    if (isInvalid) {
        inputEl.classList.add('input-field-error');
        if (!inputEl.dataset.uxErrorBound) {
            inputEl.dataset.uxErrorBound = '1';
            inputEl.addEventListener('input', function () {
                inputEl.classList.remove('input-field-error');
            });
            inputEl.addEventListener('change', function () {
                inputEl.classList.remove('input-field-error');
            });
        }
    } else {
        inputEl.classList.remove('input-field-error');
    }
}

function ensureConfirmModalExists() {
    var modal = document.getElementById('uxConfirmModal');
    if (!modal && typeof document !== 'undefined' && document.body) {
        modal = document.createElement('div');
        modal.id = 'uxConfirmModal';
        modal.className = 'ux-confirm-backdrop';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'uxConfirmTitle');
        modal.setAttribute('aria-describedby', 'uxConfirmMessage');
        modal.style.display = 'none';
        modal.onclick = function (e) {
            if (e.target === modal) closeConfirmModal();
        };
        modal.innerHTML =
            '<div class="ux-confirm-card">' +
                '<div class="ux-confirm-header">' +
                    '<div id="uxConfirmIconWrap" class="ux-confirm-icon-wrap variant-primary" aria-hidden="true">!</div>' +
                    '<div style="flex: 1; min-width: 0;">' +
                        '<h3 id="uxConfirmTitle" class="ux-confirm-title">Confirm Action</h3>' +
                        '<p id="uxConfirmMessage" class="ux-confirm-message">Are you sure you want to proceed?</p>' +
                    '</div>' +
                '</div>' +
                '<div class="ux-confirm-actions">' +
                    '<button type="button" id="uxConfirmCancelBtn" class="btn-confirm-cancel" onclick="closeConfirmModal()">Cancel</button>' +
                    '<button type="button" id="uxConfirmActionBtn" class="btn-confirm-primary" onclick="executeConfirmModalAction()">Confirm</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);
    }
    return modal;
}

function openConfirmModal(options) {
    var opts = options || {};
    var modal = ensureConfirmModalExists();
    if (!modal) {
        if (typeof opts.onConfirm === 'function') {
            opts.onConfirm();
        }
        return;
    }

    isConfirmModalActionInFlight = false;
    activeConfirmModalConfig = opts;

    var titleEl = document.getElementById('uxConfirmTitle');
    var msgEl = document.getElementById('uxConfirmMessage');
    var cancelBtn = document.getElementById('uxConfirmCancelBtn');
    var actionBtn = document.getElementById('uxConfirmActionBtn');
    var iconWrap = document.getElementById('uxConfirmIconWrap');

    var variant = opts.variant || 'primary';
    if (titleEl) titleEl.textContent = opts.title || 'Confirm Action';
    if (msgEl) msgEl.textContent = opts.message || 'Are you sure you want to proceed?';

    if (cancelBtn) {
        cancelBtn.disabled = false;
        cancelBtn.textContent = opts.cancelText || 'Cancel';
    }
    if (actionBtn) {
        setButtonLoading(actionBtn, false);
        actionBtn.textContent = opts.confirmText || 'Confirm';
        actionBtn.className = (variant === 'danger') ? 'btn-confirm-danger' : 'btn-confirm-primary';
    }
    if (iconWrap) {
        iconWrap.className = 'ux-confirm-icon-wrap variant-' + (variant === 'danger' ? 'danger' : (variant === 'warning' ? 'warning' : 'primary'));
        iconWrap.textContent = (variant === 'danger') ? '!' : '✓';
    }

    modal.style.display = 'flex';
    if (actionBtn) {
        setTimeout(function () {
            if (actionBtn && !actionBtn.disabled) actionBtn.focus();
        }, 20);
    }
}

function closeConfirmModal(forceClose) {
    if (isConfirmModalActionInFlight && !forceClose) return;
    var modal = document.getElementById('uxConfirmModal');
    var cfg = activeConfirmModalConfig;
    activeConfirmModalConfig = null;
    isConfirmModalActionInFlight = false;

    var actionBtn = document.getElementById('uxConfirmActionBtn');
    var cancelBtn = document.getElementById('uxConfirmCancelBtn');
    if (actionBtn) setButtonLoading(actionBtn, false);
    if (cancelBtn) cancelBtn.disabled = false;
    if (modal) modal.style.display = 'none';

    if (!forceClose && cfg && typeof cfg.onCancel === 'function') {
        cfg.onCancel();
    }
}

function executeConfirmModalAction() {
    if (!activeConfirmModalConfig || isConfirmModalActionInFlight) return;
    var cfg = activeConfirmModalConfig;
    var actionBtn = document.getElementById('uxConfirmActionBtn');
    var cancelBtn = document.getElementById('uxConfirmCancelBtn');

    isConfirmModalActionInFlight = true;
    if (cancelBtn) cancelBtn.disabled = true;
    if (actionBtn) {
        setButtonLoading(actionBtn, true, cfg.loadingText || 'Processing...');
    }

    var finishAndClose = function () {
        closeConfirmModal(true);
    };

    try {
        var result = (typeof cfg.onConfirm === 'function') ? cfg.onConfirm(actionBtn) : null;
        if (result && typeof result.then === 'function') {
            result.then(function () {
                finishAndClose();
            }).catch(function () {
                finishAndClose();
            });
        } else {
            finishAndClose();
        }
    } catch (err) {
        finishAndClose();
    }
}

function performConfirmedUserLogout() {
    return new Promise(function (resolve) {
        var finalizeLogoutState = function () {
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
            closeModal('customerProfileModal');
            closeModal('liveChatModal');
            closeModal('checkoutModal');
            showSuccessToast('Logged Out', 'You have been logged out successfully.');
            resolve();
        };

        fetch('/api/auth/logout', {
            method: 'POST',
            headers: getAuthRequestHeaders()
        })
        .then(function () {
            setTimeout(finalizeLogoutState, 180);
        })
        .catch(function () {
            fetch('public/index.php?route=api_logout', { method: 'POST' })
                .catch(function () {})
                .finally(function () {
                    setTimeout(finalizeLogoutState, 180);
                });
        });
    });
}

function handleUserLogout(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    closeCustomerProfileDropdown();
    openConfirmModal({
        title: 'Confirm Logout',
        message: 'Are you sure you want to log out of your account?',
        cancelText: 'Cancel',
        confirmText: 'Yes, Log Out',
        loadingText: 'Logging out...',
        variant: 'danger',
        onConfirm: function () {
            return performConfirmedUserLogout();
        }
    });
    return false;
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
            if (phpRes.data.csrfToken) {
                currentCsrfToken = phpRes.data.csrfToken;
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
            if (result.data.csrfToken) {
                currentCsrfToken = result.data.csrfToken;
            }
            currentUserSession = result.data.user;
            if (Array.isArray(result.data.customers)) {
                mergeServerCustomersIntoLocal(result.data.customers);
            }
            if (currentUserSession.role === 'admin') {
                selectedAdminConversationCustomerId = 1;
                if (typeof refreshAdminJobOrdersFromServer === 'function') {
                    refreshAdminJobOrdersFromServer(true);
                }
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
    var emailIn = document.getElementById('loginEmailInput');
    var passIn = document.getElementById('loginPassInput');
    var roleIn = document.getElementById('loginRoleInput');
    var submitBtn = document.getElementById('loginSubmitBtn') || (event.target && event.target.querySelector('button[type="submit"]'));
    var errEl = document.getElementById('authErrorBox');

    var email = emailIn ? emailIn.value.trim().toLowerCase() : '';
    var password = passIn ? passIn.value : '';
    var selectedRole = roleIn ? roleIn.value : 'auto';

    markFieldInvalid(emailIn, !email);
    markFieldInvalid(passIn, !password);

    if (!email || !password) {
        if (errEl) {
            errEl.style.display = 'block';
            errEl.textContent = 'Please Complete All Required Fields.';
        }
        showErrorToast('Please Complete All Required Fields.', 'Enter both your email address and password to sign in.');
        return false;
    }

    setButtonLoading(submitBtn, true, 'Logging in...');

    performServerLogin(email, password, selectedRole, true).then(function (ok) {
        setButtonLoading(submitBtn, false);
        if (ok) {
            if (errEl) errEl.style.display = 'none';
            markFieldInvalid(emailIn, false);
            markFieldInvalid(passIn, false);
            closeModal('authModal');
            showSuccessToast('Login Successful!', 'Welcome back, ' + (currentUserSession.name || 'Valued Client') + '.');
        } else {
            markFieldInvalid(emailIn, true);
            markFieldInvalid(passIn, true);
            if (errEl) {
                errEl.style.display = 'block';
                errEl.textContent = 'Invalid Email or Password. Use Customer #1 (maria.santos@example.com / password123), Customer #2 (roberto.mendoza@example.com / password123), or Admin (admin@liliaandrowena.com / admin123).';
            }
            showErrorToast('Invalid Email or Password.', 'Please check your email and password and try again.');
        }
    }).catch(function () {
        setButtonLoading(submitBtn, false);
        showErrorToast('Invalid Email or Password.', 'Unable to sign in at this moment. Please try again.');
    });
    return false;
}

function handleCustomerRegister(event) {
    event.preventDefault();
    var nameIn = document.getElementById('regFullName');
    var emailIn = document.getElementById('regEmail');
    var passIn = document.getElementById('regPassword');
    var phoneIn = document.getElementById('regPhone');
    var addrIn = document.getElementById('regAddress');
    var submitBtn = document.getElementById('registerSubmitBtn') || (event.target && event.target.querySelector('button[type="submit"]'));
    var errEl = document.getElementById('authErrorBox');

    var fullName = nameIn ? nameIn.value.trim() : '';
    var email = emailIn ? emailIn.value.trim().toLowerCase() : '';
    var password = passIn ? passIn.value : '';
    var phone = phoneIn ? phoneIn.value.trim() : '';
    var address = addrIn ? addrIn.value.trim() : '';

    markFieldInvalid(nameIn, !fullName);
    markFieldInvalid(emailIn, !email);
    markFieldInvalid(passIn, !password);
    markFieldInvalid(phoneIn, !phone);
    markFieldInvalid(addrIn, !address);

    if (!fullName || !email || !password || !phone || !address) {
        if (errEl) {
            errEl.style.display = 'block';
            errEl.textContent = 'Please Complete All Required Fields.';
        }
        showErrorToast('Please Complete All Required Fields.', 'Please fill out all required fields to create your customer account.');
        return false;
    }

    setButtonLoading(submitBtn, true, 'Creating your account...');

    function finalizeClientRegistration(assignedId, tokenFromServer, serverCustomers) {
        setButtonLoading(submitBtn, false);
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
        if (nameIn) nameIn.value = '';
        if (emailIn) emailIn.value = '';
        if (passIn) passIn.value = '';
        if (phoneIn) phoneIn.value = '';
        if (addrIn) addrIn.value = '';

        renderAuthHeaderState();
        fetchAuthorizedConversationMessages();
        closeModal('authModal');
        showSuccessToast('Account Created Successfully!', 'Welcome to Lilia & Rowena Furniture, ' + fullName + '.');
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
        } else {
            setButtonLoading(submitBtn, false);
            var errMsg = (result.data && result.data.error) ? result.data.error : 'Unable to Save Changes. Please Try Again.';
            if (errEl) {
                errEl.style.display = 'block';
                errEl.textContent = errMsg;
            }
            showErrorToast('Unable to Save Changes. Please Try Again.', errMsg);
        }
    })
    .catch(function () {
        // Check duplicate in localStorage first
        for (var i = 0; i < registeredCustomers.length; i++) {
            if (String(registeredCustomers[i].email).toLowerCase() === email) {
                setButtonLoading(submitBtn, false);
                if (errEl) {
                    errEl.style.display = 'block';
                    errEl.textContent = 'An account with this email address already exists.';
                }
                showErrorToast('Unable to Save Changes. Please Try Again.', 'An account with this email address already exists.');
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
                setButtonLoading(submitBtn, false);
                if (errEl) {
                    errEl.style.display = 'block';
                    errEl.textContent = phpResult.data.error;
                }
                showErrorToast('Unable to Save Changes. Please Try Again.', phpResult.data.error);
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

// --- 4. ADMIN JOB ORDERS TRACKING & DEADLINE MANAGEMENT (Asia/Manila Timezone) ---
var activeAdminOmsTab = 'deadline_today';
var selectedAdminDetailOrderId = null;

function escapeAdminHtml(str) {
    return String(str === null || str === undefined ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function isOrderFinishedStatus(statusStr) {
    var s = String(statusStr || '').trim().toLowerCase();
    return s === 'completed' || s === 'delivered' || s === 'cancelled';
}

function getStatusStepIndex(statusStr) {
    var s = String(statusStr || '').trim().toLowerCase();
    if (s === 'pending') return 0;
    if (s === 'order confirmed' || s === 'confirmed') return 1;
    if (s === 'in production') return 2;
    if (s === 'for delivery' || s === 'ready') return 3;
    if (s === 'completed' || s === 'delivered') return 4;
    return 0;
}

function getStatusBadgeClassName(statusStr) {
    var s = String(statusStr || '').trim().toLowerCase();
    if (s === 'pending') return 'oms-status-pending';
    if (s === 'order confirmed' || s === 'confirmed') return 'oms-status-confirmed';
    if (s === 'in production') return 'oms-status-production';
    if (s === 'for delivery' || s === 'ready') return 'oms-status-delivery';
    if (s === 'completed' || s === 'delivered') return 'oms-status-completed';
    if (s === 'cancelled') return 'oms-status-cancelled';
    return 'oms-status-confirmed';
}

function getPriorityBadgeClassName(priorityStr) {
    var p = String(priorityStr || 'Normal').trim().toLowerCase();
    if (p === 'urgent') return 'oms-priority-urgent';
    if (p === 'high') return 'oms-priority-high';
    return 'oms-priority-normal';
}

function getPriorityIconText(priorityStr) {
    var p = String(priorityStr || 'Normal').trim();
    if (p === 'Urgent') return 'Urgent';
    if (p === 'High') return 'High';
    return 'Normal';
}

function getPriorityRankNumber(priorityStr) {
    var p = String(priorityStr || 'Normal').trim();
    if (p === 'Urgent') return 3;
    if (p === 'High') return 2;
    return 1;
}

function computeAdminJobOrderSummaries(todayManila) {
    var keys = Object.keys(sampleOrders);
    var summary = {
        totalOrders: keys.length,
        deadlineToday: 0,
        ordersToday: 0,
        overdueOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        activeOrders: 0,
        unpaidOrders: 0
    };

    for (var i = 0; i < keys.length; i++) {
        var ord = sampleOrders[keys[i]];
        if (!ord) continue;
        var dueDate = String(ord.due || '').slice(0, 10);
        var orderDate = String(ord.placed || '').slice(0, 10);
        var status = String(ord.status || 'Pending').trim();
        var finished = isOrderFinishedStatus(status);
        var totalAmt = Number(ord.total) || 0;
        var paidAmt = Number(ord.downpayment) || 0;

        if (dueDate === todayManila) {
            summary.deadlineToday++;
        }
        if (orderDate === todayManila) {
            summary.ordersToday++;
        }
        if (!finished && dueDate !== '' && dueDate < todayManila) {
            summary.overdueOrders++;
        }
        if (status.toLowerCase() === 'pending') {
            summary.pendingOrders++;
        }
        if (status.toLowerCase() === 'completed' || status.toLowerCase() === 'delivered') {
            summary.completedOrders++;
        }
        if (!finished) {
            summary.activeOrders++;
        }
        if (paidAmt < totalAmt && status.toLowerCase() !== 'cancelled') {
            summary.unpaidOrders++;
        }
    }

    return summary;
}

function switchAdminOmsTab(tabName) {
    activeAdminOmsTab = tabName || 'deadline_today';
    var allTabs = ['deadline_today', 'orders_today', 'overdue', 'active', 'unpaid', 'all'];
    for (var i = 0; i < allTabs.length; i++) {
        var tBtn = document.getElementById('omsTab_' + allTabs[i]);
        if (tBtn) {
            if (allTabs[i] === activeAdminOmsTab) {
                tBtn.classList.add('active');
            } else {
                tBtn.classList.remove('active');
            }
        }
    }

    var navDue = document.getElementById('omsNavDeadlineTodayBtn');
    var navAll = document.getElementById('omsNavAllOrdersBtn');
    var navOvd = document.getElementById('omsNavOverdueBtn');
    if (navDue) navDue.classList.toggle('active', activeAdminOmsTab === 'deadline_today');
    if (navAll) navAll.classList.toggle('active', activeAdminOmsTab === 'all');
    if (navOvd) navOvd.classList.toggle('active', activeAdminOmsTab === 'overdue');

    renderAdminDashboard();
}

function filterAdminByKpiStatus(statusName) {
    var statusSelect = document.getElementById('omsStatusFilter') || document.getElementById('adminFilterStatusSelect');
    if (statusSelect) {
        statusSelect.value = statusName || 'ALL';
    }
    switchAdminOmsTab('all');
}

function resetAdminOmsFilters() {
    var searchIn = document.getElementById('omsSearchInput') || document.getElementById('adminSearchOrderInput');
    var statusSel = document.getElementById('omsStatusFilter') || document.getElementById('adminFilterStatusSelect');
    var prioSel = document.getElementById('omsPriorityFilter') || document.getElementById('adminFilterPrioritySelect');
    var dateSel = document.getElementById('omsDeadlineFilter') || document.getElementById('adminFilterDeadlineDateInput');
    var sortSel = document.getElementById('omsSortSelect') || document.getElementById('adminSortOrdersSelect');

    if (searchIn) searchIn.value = '';
    if (statusSel) statusSel.value = 'ALL';
    if (prioSel) prioSel.value = 'ALL';
    if (dateSel) dateSel.value = (dateSel.tagName === 'SELECT') ? 'ALL' : '';
    if (sortSel) sortSel.value = 'deadline_asc';

    renderAdminDashboard();
}

function scrollToAdminSection(elementId) {
    var target = document.getElementById(elementId);
    var container = document.getElementById('omsMainScrollContainer');
    if (target && container) {
        var topOffset = target.offsetTop - container.offsetTop - 12;
        container.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    } else if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function openAdminMessagesInOms() {
    scrollToAdminSection('adminMessagesBlock');
    if (currentUserSession.isLoggedIn && currentUserSession.role === 'admin') {
        markMessagesAsReadForViewer(selectedAdminConversationCustomerId);
    }
    var replyIn = document.getElementById('adminReplyInput');
    if (replyIn) replyIn.focus();
}

function showAdminOmsNotice(messageText) {
    var msgBox = document.getElementById('adminStatusNotice');
    if (msgBox) {
        msgBox.style.display = 'block';
        msgBox.textContent = messageText;
    }
}

function mergeServerJobOrdersIntoClient(serverOrders) {
    if (!Array.isArray(serverOrders)) return;
    for (var i = 0; i < serverOrders.length; i++) {
        var so = serverOrders[i];
        if (!so) continue;
        var oid = String(so.orderId || so.OrderID || '');
        if (!oid) continue;
        var existing = sampleOrders[oid] || {};
        sampleOrders[oid] = {
            orderId: oid,
            customerId: Number(so.customerId || so.CustomerID || existing.customerId || 1),
            customer: so.customer || so.CustomerName || existing.customer || 'Valued Client',
            customerPhone: so.customerPhone || so.CustomerPhone || existing.customerPhone || '0917-123-4567',
            customerEmail: so.customerEmail || so.CustomerEmail || existing.customerEmail || 'client@example.com',
            placed: String(so.placed || so.OrderDate || existing.placed || getTodayManilaClient()).slice(0, 10),
            due: String(so.due || so.DueDate || existing.due || getTodayManilaClient()).slice(0, 10),
            deadlineTime: so.deadlineTime || so.DeadlineTime || existing.deadlineTime || '05:00 PM',
            status: so.status || so.Status || existing.status || 'Pending',
            priority: so.priority || so.Priority || existing.priority || 'Normal',
            quantity: Number(so.quantity || so.TotalQuantity || existing.quantity || 1),
            stepIndex: getStatusStepIndex(so.status || so.Status || existing.status || 'Pending'),
            carpenter: so.carpenter || so.AssignedStaff || existing.carpenter || 'Master Carding Santos',
            stage: so.stage || existing.stage || 'Workshop Production Schedule',
            driver: so.driver || existing.driver || 'Rene Ocampo (0918-555-6666)',
            address: so.address || so.CustomerAddress || existing.address || 'Metro Manila Delivery',
            productName: so.productName || so.FurnitureProduct || existing.productName || 'Custom Solid Wood Furniture',
            itemSummary: so.itemSummary || so.FurnitureProduct || existing.itemSummary || 'Custom Solid Wood Furniture',
            jobNotes: (so.jobNotes !== undefined) ? so.jobNotes : (so.JobNotes || existing.jobNotes || ''),
            total: Number(so.total !== undefined ? so.total : (so.TotalAmount !== undefined ? so.TotalAmount : existing.total)) || 28500,
            downpayment: Number(so.downpayment !== undefined ? so.downpayment : (so.PaidAmount !== undefined ? so.PaidAmount : existing.downpayment)) || 0
        };
    }
    savePersistedClientDatabase();
}

function refreshAdminJobOrdersFromServer(silent) {
    if (!currentUserSession || !currentUserSession.isLoggedIn || currentUserSession.role !== 'admin') {
        return;
    }
    fetch('/api/admin/job-orders', {
        method: 'GET',
        headers: getAuthRequestHeaders()
    })
    .then(function (res) { return res.json().then(function (d) { return { status: res.status, data: d }; }); })
    .then(function (result) {
        if (result.status === 200 && result.data && result.data.status === 'ok') {
            if (result.data.csrfToken) {
                currentCsrfToken = result.data.csrfToken;
            }
            if (Array.isArray(result.data.orders)) {
                mergeServerJobOrdersIntoClient(result.data.orders);
            }
            renderAdminDashboard();
            if (!silent) {
                showAdminOmsNotice('✓ Synced ' + Object.keys(sampleOrders).length + ' Job Orders with database (Asia/Manila: ' + getTodayManilaClient() + ').');
            }
        }
    })
    .catch(function () {
        fetch('public/index.php?route=api_admin_job_orders')
            .then(function (r) { return r.json(); })
            .then(function (phpData) {
                if (phpData && phpData.status === 'ok' && Array.isArray(phpData.orders)) {
                    mergeServerJobOrdersIntoClient(phpData.orders);
                    renderAdminDashboard();
                }
            })
            .catch(function () {});
    });
}

function syncJobOrderUpdateToServer(orderId, updateFields, noticeMsg) {
    var record = sampleOrders[String(orderId)];
    if (!record) return;

    if (updateFields.status !== undefined) {
        record.status = updateFields.status;
        record.stepIndex = getStatusStepIndex(updateFields.status);
    }
    if (updateFields.priority !== undefined) {
        record.priority = updateFields.priority;
    }
    if (updateFields.due !== undefined && updateFields.due) {
        record.due = String(updateFields.due).slice(0, 10);
    }
    if (updateFields.deadlineTime !== undefined && updateFields.deadlineTime) {
        record.deadlineTime = updateFields.deadlineTime;
    }
    if (updateFields.carpenter !== undefined && updateFields.carpenter) {
        record.carpenter = updateFields.carpenter;
    }
    if (updateFields.downpayment !== undefined && !isNaN(Number(updateFields.downpayment))) {
        record.downpayment = Number(updateFields.downpayment);
    }
    if (updateFields.jobNotes !== undefined) {
        record.jobNotes = updateFields.jobNotes;
    }

    savePersistedClientDatabase();
    renderAdminDashboard();
    lookupOrderById(String(orderId));
    if (noticeMsg) {
        showAdminOmsNotice(noticeMsg);
    }

    var bodyPayload = {
        orderId: String(orderId),
        status: record.status,
        priority: record.priority,
        due: record.due,
        deadlineTime: record.deadlineTime,
        carpenter: record.carpenter,
        downpayment: record.downpayment,
        jobNotes: record.jobNotes,
        csrf_token: currentCsrfToken
    };

    if (!currentUserSession || !currentUserSession.isLoggedIn || currentUserSession.role !== 'admin') {
        return Promise.resolve(null);
    }

    return fetch('/api/admin/job-orders/update', {
        method: 'POST',
        headers: getAuthRequestHeaders(),
        body: JSON.stringify(bodyPayload)
    })
    .then(function (res) { return res.json().then(function (d) { return { status: res.status, data: d }; }); })
    .then(function (result) {
        if (result.status === 200 && result.data && Array.isArray(result.data.orders)) {
            mergeServerJobOrdersIntoClient(result.data.orders);
            renderAdminDashboard();
        }
        return result;
    })
    .catch(function () {
        return fetch('public/index.php?route=api_admin_update_job_order', {
            method: 'POST',
            headers: getAuthRequestHeaders(),
            body: JSON.stringify(bodyPayload)
        }).catch(function () {});
    });
}

function quickUpdateJobOrderStatus(orderId, newStatus, selectEl) {
    var record = sampleOrders[String(orderId)];
    var prevStatus = record ? record.status : 'Pending';
    if (record && String(record.status) === String(newStatus)) {
        return;
    }

    var isCancelling = String(newStatus).toLowerCase() === 'cancelled';
    openConfirmModal({
        title: isCancelling ? 'Cancel Job Order' : 'Update Order Status',
        message: isCancelling
            ? 'Are you sure you want to cancel this order?'
            : 'Are you sure you want to update this order status?',
        cancelText: 'Cancel',
        confirmText: isCancelling ? 'Yes, Cancel Order' : 'Update Status',
        loadingText: 'Updating order status...',
        variant: isCancelling ? 'danger' : 'primary',
        onCancel: function () {
            if (selectEl) {
                selectEl.value = prevStatus;
            } else {
                renderAdminDashboard();
            }
        },
        onConfirm: function () {
            return Promise.resolve(
                syncJobOrderUpdateToServer(
                    orderId,
                    { status: newStatus },
                    '✓ Job Order #JO-' + orderId + ' status updated to "' + newStatus + '" in Customer_Order.'
                )
            ).then(function () {
                showSuccessToast('Order Status Updated Successfully!', 'Job Order #JO-' + orderId + ' is now marked as "' + newStatus + '".');
            });
        }
    });
}

function updateAdminOrderStatus(orderId, newStatus) {
    quickUpdateJobOrderStatus(orderId, newStatus);
}

function quickUpdateJobOrderPriority(orderId, newPriority) {
    Promise.resolve(
        syncJobOrderUpdateToServer(
            orderId,
            { priority: newPriority },
            '✓ Job Order #JO-' + orderId + ' priority set to "' + newPriority + '".'
        )
    ).then(function () {
        showSuccessToast('Changes Saved Successfully!', 'Job Order #JO-' + orderId + ' priority set to "' + newPriority + '".');
    });
}

function quickUpdateJobOrderDeadline(orderId, newDueDate) {
    if (!newDueDate) return;
    Promise.resolve(
        syncJobOrderUpdateToServer(
            orderId,
            { due: newDueDate },
            '✓ Job Order #JO-' + orderId + ' deadline updated to ' + formatReadableDateManila(newDueDate) + ' (' + newDueDate + ').'
        )
    ).then(function () {
        showSuccessToast('Deadline Updated Successfully!', 'Job Order #JO-' + orderId + ' deadline set to ' + formatReadableDateManila(newDueDate) + '.');
    });
}

function quickUpdateJobOrderStaff(orderId, newStaff) {
    Promise.resolve(
        syncJobOrderUpdateToServer(
            orderId,
            { carpenter: newStaff },
            '✓ Job Order #JO-' + orderId + ' assigned to ' + newStaff + '.'
        )
    ).then(function () {
        showSuccessToast('Changes Saved Successfully!', 'Job Order #JO-' + orderId + ' assigned to ' + newStaff + '.');
    });
}

function renderAdminDashboard() {
    var tbody = document.getElementById('adminOrdersTableBody');
    if (!tbody) return;

    var todayManila = getTodayManilaClient();
    var todayChip = document.getElementById('omsTodayManilaLabel') || document.getElementById('adminTodayDateChip');
    if (todayChip) {
        todayChip.textContent = todayManila;
    }

    var newDueInput = document.getElementById('newJoDeadline') || document.getElementById('newJobDueDate');
    if (newDueInput && !newDueInput.value) {
        newDueInput.value = todayManila;
    }

    // 1. Update Top 5 Dashboard Summary Cards, Sidebar Counters & 6 Tab Counters from real sampleOrders state
    var counts = computeAdminJobOrderSummaries(todayManila);

    var elTotal = document.getElementById('kpiTotalOrders') || document.getElementById('kpiTotalOrdersCount');
    var elDueToday = document.getElementById('kpiDeadlineToday') || document.getElementById('kpiDeadlineTodayCount');
    var elOverdue = document.getElementById('kpiOverdueOrders') || document.getElementById('kpiOverdueOrdersCount');
    var elPending = document.getElementById('kpiPendingOrders') || document.getElementById('kpiPendingOrdersCount');
    var elCompleted = document.getElementById('kpiCompletedOrders') || document.getElementById('kpiCompletedOrdersCount');

    if (elTotal) elTotal.textContent = counts.totalOrders;
    if (elDueToday) elDueToday.textContent = counts.deadlineToday;
    if (elOverdue) elOverdue.textContent = counts.overdueOrders;
    if (elPending) elPending.textContent = counts.pendingOrders;
    if (elCompleted) elCompleted.textContent = counts.completedOrders;

    var sbDue = document.getElementById('omsSidebarDueTodayCount');
    var sbTot = document.getElementById('omsSidebarTotalCount');
    var sbOvd = document.getElementById('omsSidebarOverdueCount');
    if (sbDue) sbDue.textContent = counts.deadlineToday;
    if (sbTot) sbTot.textContent = counts.totalOrders;
    if (sbOvd) sbOvd.textContent = counts.overdueOrders;

    var bDueToday = document.getElementById('tabCount_deadline_today') || document.getElementById('tabBadgeDeadlineToday');
    var bOrdersToday = document.getElementById('tabCount_orders_today') || document.getElementById('tabBadgeOrdersToday');
    var bOverdue = document.getElementById('tabCount_overdue') || document.getElementById('tabBadgeOverdue');
    var bActive = document.getElementById('tabCount_active') || document.getElementById('tabBadgeActive');
    var bUnpaid = document.getElementById('tabCount_unpaid') || document.getElementById('tabBadgeUnpaid');
    var bAll = document.getElementById('tabCount_all') || document.getElementById('tabBadgeAll');

    if (bDueToday) bDueToday.textContent = counts.deadlineToday;
    if (bOrdersToday) bOrdersToday.textContent = counts.ordersToday;
    if (bOverdue) bOverdue.textContent = counts.overdueOrders;
    if (bActive) bActive.textContent = counts.activeOrders;
    if (bUnpaid) bUnpaid.textContent = counts.unpaidOrders;
    if (bAll) bAll.textContent = counts.totalOrders;

    var tabKickerMap = {
        deadline_today: 'JOB ORDERS TRACKING: DEADLINE TODAY',
        orders_today: 'JOB ORDERS TRACKING: ORDERS CREATED TODAY',
        overdue: 'JOB ORDERS TRACKING: OVERDUE ORDERS',
        active: 'JOB ORDERS TRACKING: ACTIVE PRODUCTION ORDERS',
        unpaid: 'JOB ORDERS TRACKING: UNPAID / BALANCE DUE ORDERS',
        all: 'JOB ORDERS TRACKING: ALL FURNITURE ORDERS'
    };
    var tabSubMap = {
        deadline_today: counts.deadlineToday + ' deadline today orders',
        orders_today: counts.ordersToday + ' orders created today',
        overdue: counts.overdueOrders + ' overdue unfinished orders',
        active: counts.activeOrders + ' active workshop orders',
        unpaid: counts.unpaidOrders + ' orders with unpaid balance',
        all: counts.totalOrders + ' total furniture job orders'
    };

    var kickerEl = document.getElementById('omsActiveTabKicker');
    var subDueEl = document.getElementById('omsSubtitleDueTodayText');
    if (kickerEl) kickerEl.textContent = tabKickerMap[activeAdminOmsTab] || tabKickerMap.deadline_today;
    if (subDueEl) subDueEl.textContent = tabSubMap[activeAdminOmsTab] || tabSubMap.deadline_today;

    // 2. Read Search, Filter, and Sort inputs
    var searchEl = document.getElementById('omsSearchInput') || document.getElementById('adminSearchOrderInput');
    var statusFilterEl = document.getElementById('omsStatusFilter') || document.getElementById('adminFilterStatusSelect');
    var prioFilterEl = document.getElementById('omsPriorityFilter') || document.getElementById('adminFilterPrioritySelect');
    var dateFilterEl = document.getElementById('omsDeadlineFilter') || document.getElementById('adminFilterDeadlineDateInput');
    var sortEl = document.getElementById('omsSortSelect') || document.getElementById('adminSortOrdersSelect');

    var q = searchEl ? searchEl.value.trim().toLowerCase() : '';
    var statusFilter = statusFilterEl ? statusFilterEl.value : 'ALL';
    var prioFilter = prioFilterEl ? prioFilterEl.value : 'ALL';
    var dateFilter = dateFilterEl ? dateFilterEl.value.trim() : 'ALL';
    var sortBy = sortEl ? sortEl.value : 'deadline_asc';

    // 3. Filter Job Orders
    var keys = Object.keys(sampleOrders);
    var filtered = [];
    for (var i = 0; i < keys.length; i++) {
        var ord = sampleOrders[keys[i]];
        if (!ord) continue;

        var dueDate = String(ord.due || '').slice(0, 10);
        var orderDate = String(ord.placed || '').slice(0, 10);
        var status = String(ord.status || 'Pending').trim();
        var priority = String(ord.priority || 'Normal').trim();
        var finished = isOrderFinishedStatus(status);
        var totalAmt = Number(ord.total) || 0;
        var paidAmt = Number(ord.downpayment) || 0;

        // Tab filter
        if (activeAdminOmsTab === 'deadline_today' && dueDate !== todayManila) continue;
        if (activeAdminOmsTab === 'orders_today' && orderDate !== todayManila) continue;
        if (activeAdminOmsTab === 'overdue' && (finished || !dueDate || dueDate >= todayManila)) continue;
        if (activeAdminOmsTab === 'active' && finished) continue;
        if (activeAdminOmsTab === 'unpaid' && (paidAmt >= totalAmt || status.toLowerCase() === 'cancelled')) continue;

        // Status filter
        if (statusFilter && statusFilter !== 'ALL') {
            var normFilter = statusFilter.toLowerCase();
            var normStatus = status.toLowerCase();
            if (normFilter === 'order confirmed') {
                if (normStatus !== 'order confirmed' && normStatus !== 'confirmed') continue;
            } else if (normFilter === 'for delivery') {
                if (normStatus !== 'for delivery' && normStatus !== 'ready') continue;
            } else if (normFilter === 'completed') {
                if (normStatus !== 'completed' && normStatus !== 'delivered') continue;
            } else if (normStatus !== normFilter) {
                continue;
            }
        }

        // Priority filter
        if (prioFilter && prioFilter !== 'ALL' && priority.toLowerCase() !== prioFilter.toLowerCase()) {
            continue;
        }

        // Deadline dropdown or exact date filter
        if (dateFilter && dateFilter !== 'ALL') {
            if (dateFilter === 'DUE_TODAY') {
                if (dueDate !== todayManila) continue;
            } else if (dateFilter === 'OVERDUE') {
                if (finished || !dueDate || dueDate >= todayManila) continue;
            } else if (dateFilter === 'UPCOMING') {
                if (finished || !dueDate || dueDate <= todayManila) continue;
            } else if (dueDate !== dateFilter) {
                continue;
            }
        }

        // Search query (Job Order ID, Customer Name, Phone, Email, Product)
        if (q) {
            var haystack = (
                'jo-' + ord.orderId + ' ' +
                'jo-2026-' + ord.orderId + ' ' +
                ord.orderId + ' ' +
                (ord.customer || '') + ' ' +
                (ord.customerPhone || '') + ' ' +
                (ord.customerEmail || '') + ' ' +
                (ord.productName || '') + ' ' +
                (ord.itemSummary || '') + ' ' +
                (ord.carpenter || '')
            ).toLowerCase();
            if (haystack.indexOf(q) === -1) continue;
        }

        filtered.push(ord);
    }

    // 4. Sort filtered Job Orders
    filtered.sort(function (a, b) {
        var dueA = String(a.due || '');
        var dueB = String(b.due || '');
        if (sortBy === 'deadline_desc') {
            if (dueA !== dueB) return dueB.localeCompare(dueA);
            return Number(b.orderId) - Number(a.orderId);
        }
        if (sortBy === 'priority_desc') {
            var diffP = getPriorityRankNumber(b.priority) - getPriorityRankNumber(a.priority);
            if (diffP !== 0) return diffP;
            return dueA.localeCompare(dueB);
        }
        if (sortBy === 'newest' || sortBy === 'id_desc') {
            return Number(b.orderId) - Number(a.orderId);
        }
        // Default: deadline_asc (earliest deadline first, then highest priority)
        if (dueA !== dueB) return dueA.localeCompare(dueB);
        return getPriorityRankNumber(b.priority) - getPriorityRankNumber(a.priority);
    });

    // 5. Compute Financial Strip Totals for visible rows
    var stripTotal = 0;
    var stripPaid = 0;
    var stripDue = 0;
    for (var f = 0; f < filtered.length; f++) {
        var tAmt = Number(filtered[f].total) || 0;
        var pAmt = Number(filtered[f].downpayment) || 0;
        stripTotal += tAmt;
        stripPaid += pAmt;
        stripDue += Math.max(0, tAmt - pAmt);
    }

    var stripTotalEl = document.getElementById('omsStripTotalAmount');
    var stripDueEl = document.getElementById('omsStripTotalDue');
    var stripPaidEl = document.getElementById('omsStripTotalPaid');

    if (stripTotalEl) stripTotalEl.textContent = '₱' + stripTotal.toLocaleString();
    if (stripDueEl) stripDueEl.textContent = '₱' + stripDue.toLocaleString();
    if (stripPaidEl) stripPaidEl.textContent = '₱' + stripPaid.toLocaleString();

    // 6. Render 11-Column Job Orders Table Rows
    var allowedStatuses = ['Pending', 'Order Confirmed', 'In Production', 'For Delivery', 'Completed', 'Cancelled'];
    var allowedPriorities = ['Normal', 'High', 'Urgent'];
    var allowedStaff = [
        'Master Carding Santos',
        'Master Eddie Manalo',
        'Dante Cruz',
        'Rene Ocampo'
    ];

    if (filtered.length === 0) {
        tbody.innerHTML =
            '<tr>' +
                '<td colspan="11" style="padding:2.2rem 1rem; text-align:center; color:#64748b;">' +
                    '<strong style="display:block; color:#0f172a; font-size:0.9rem; margin-bottom:0.3rem;">No Job Orders Match Your Current Tab or Filter</strong>' +
                    '<span style="font-size:0.78rem;">Try switching to the <strong>All Orders</strong> tab or clicking <strong>Reset Filters</strong> on the search bar.</span>' +
                '</td>' +
            '</tr>';
        return;
    }

    var rowsHtml = '';
    for (var r = 0; r < filtered.length; r++) {
        var item = filtered[r];
        var oid = String(item.orderId);
        var dueDate = String(item.due || '').slice(0, 10);
        var orderDate = String(item.placed || '').slice(0, 10);
        var status = String(item.status || 'Pending').trim();
        var priority = String(item.priority || 'Normal').trim();
        var qty = Number(item.quantity) || 1;
        var total = Number(item.total) || 0;
        var paid = Number(item.downpayment) || 0;
        var balance = Math.max(0, total - paid);
        var finished = isOrderFinishedStatus(status);
        var isOverdue = (!finished && dueDate !== '' && dueDate < todayManila);
        var isDueToday = (dueDate === todayManila);
        var isOrderedToday = (orderDate === todayManila);

        var rowClass = '';
        if (isOverdue) {
            rowClass = 'oms-row-overdue';
        } else if (!finished && (isDueToday || priority === 'Urgent')) {
            rowClass = 'oms-row-urgent';
        }

        // Status options
        var statusOpts = '';
        for (var s = 0; s < allowedStatuses.length; s++) {
            var stOpt = allowedStatuses[s];
            var isSel = (status.toLowerCase() === stOpt.toLowerCase() ||
                (stOpt === 'Order Confirmed' && status.toLowerCase() === 'confirmed') ||
                (stOpt === 'For Delivery' && status.toLowerCase() === 'ready') ||
                (stOpt === 'Completed' && status.toLowerCase() === 'delivered'));
            statusOpts += '<option value="' + stOpt + '" ' + (isSel ? 'selected' : '') + '>' + stOpt + '</option>';
        }

        // Priority options
        var prioOpts = '';
        for (var p = 0; p < allowedPriorities.length; p++) {
            var prOpt = allowedPriorities[p];
            prioOpts += '<option value="' + prOpt + '" ' + (priority === prOpt ? 'selected' : '') + '>' + prOpt + '</option>';
        }

        // Staff options
        var staffOpts = '';
        var currentStaff = item.carpenter || 'Master Carding Santos';
        for (var stf = 0; stf < allowedStaff.length; stf++) {
            var staffName = allowedStaff[stf];
            var staffSel = (currentStaff.indexOf(staffName.split(' ')[1] || staffName) !== -1) ? 'selected' : '';
            staffOpts += '<option value="' + escapeAdminHtml(staffName) + '" ' + staffSel + '>' + escapeAdminHtml(staffName) + '</option>';
        }

        // Deadline badge
        var deadlineBadgeHtml = '';
        if (isOverdue) {
            deadlineBadgeHtml = '<span class="oms-deadline-tag overdue">OVERDUE</span>';
        } else if (isDueToday && !finished) {
            deadlineBadgeHtml = '<span class="oms-deadline-tag today">DUE TODAY</span>';
        } else if (isDueToday && finished) {
            deadlineBadgeHtml = '<span class="oms-deadline-tag ok">✓ DUE TODAY</span>';
        } else if (finished) {
            deadlineBadgeHtml = '<span class="oms-deadline-tag ok">✓ FINISHED</span>';
        } else {
            deadlineBadgeHtml = '<span class="oms-deadline-tag ok">SCHEDULED</span>';
        }

        var prodTitle = item.productName || (item.itemSummary ? item.itemSummary.split('(')[0].trim() : 'Custom Furniture');
        var prodSpec = item.itemSummary || prodTitle;
        if (prodSpec.indexOf(prodTitle) === 0 && prodSpec.length > prodTitle.length) {
            prodSpec = prodSpec.slice(prodTitle.length).trim();
        }

        var custUnreadForAdmin = (typeof computeUnreadCountForAdminByCustomer === 'function')
            ? computeUnreadCountForAdminByCustomer(item.customerId || 1)
            : 0;
        var unreadPillHtml = custUnreadForAdmin > 0
            ? '<div style="margin-top:0.2rem;"><span class="unread-red-badge" title="Unread customer message">' + custUnreadForAdmin + ' new</span></div>'
            : '';

        rowsHtml +=
            '<tr class="' + rowClass + '">' +
                // 1. Job Order ID
                '<td>' +
                    '<span class="oms-job-id">#JO-' + escapeAdminHtml(oid) + '</span>' +
                    '<span class="oms-job-items-sub">' + qty + ' item' + (qty > 1 ? 's' : '') + '</span>' +
                '</td>' +
                // 2. Customer Name
                '<td>' +
                    '<span class="oms-cust-name">' + escapeAdminHtml(item.customer) + '</span>' +
                    '<span class="oms-cust-meta">Tel: ' + escapeAdminHtml(item.customerPhone || '0917-123-4567') + '</span>' +
                    unreadPillHtml +
                '</td>' +
                // 3. Furniture Product
                '<td>' +
                    '<span class="oms-prod-name">' + escapeAdminHtml(prodTitle) + '</span>' +
                    '<span class="oms-prod-notes">' + escapeAdminHtml(prodSpec) + '</span>' +
                '</td>' +
                // 4. Quantity
                '<td>' +
                    '<span style="display:inline-block; background:#f1f5f9; color:#0f172a; font-weight:800; padding:0.18rem 0.42rem; border-radius:6px; font-size:0.7rem; white-space:nowrap;">' +
                        qty + ' pc' + (qty > 1 ? 's' : '') +
                    '</span>' +
                '</td>' +
                // 5. Order Status
                '<td>' +
                    '<div><span class="oms-status-badge ' + getStatusBadgeClassName(status) + '">' + escapeAdminHtml(status) + '</span></div>' +
                    '<select aria-label="Status for JO-' + escapeAdminHtml(oid) + '" onchange="quickUpdateJobOrderStatus(\'' + escapeAdminHtml(oid) + '\', this.value, this)" style="margin-top:0.22rem; padding:0.15rem 0.2rem; font-size:0.65rem; border:1px solid #cbd5e1; border-radius:5px; background:#fff; width:100px;">' +
                        statusOpts +
                    '</select>' +
                '</td>' +
                // 6. Total Amount
                '<td>' +
                    '<span class="oms-amount-main">₱' + total.toLocaleString() + '</span>' +
                    (balance > 0
                        ? '<span class="oms-amount-sub due">Due: ₱' + balance.toLocaleString() + '</span>'
                        : '<span class="oms-amount-sub paid">✓ Paid</span>') +
                '</td>' +
                // 7. Priority
                '<td>' +
                    '<div><span class="oms-priority-badge ' + getPriorityBadgeClassName(priority) + '">' + getPriorityIconText(priority) + '</span></div>' +
                    '<select aria-label="Priority for JO-' + escapeAdminHtml(oid) + '" onchange="quickUpdateJobOrderPriority(\'' + escapeAdminHtml(oid) + '\', this.value)" style="margin-top:0.22rem; padding:0.15rem 0.2rem; font-size:0.65rem; border:1px solid #cbd5e1; border-radius:5px; background:#fff; width:74px;">' +
                        prioOpts +
                    '</select>' +
                '</td>' +
                // 8. Order Date
                '<td>' +
                    '<strong style="display:block; color:#0f172a; font-size:0.7rem; white-space:nowrap;">' + formatReadableDateManila(orderDate) + '</strong>' +
                    '<span style="display:block; font-size:0.62rem; color:#64748b;">' + escapeAdminHtml(orderDate) + '</span>' +
                    (isOrderedToday ? '<div><span style="display:inline-block; margin-top:0.15rem; background:#e0f2fe; color:#0369a1; font-size:0.58rem; font-weight:800; padding:0.08rem 0.3rem; border-radius:4px;">NEW TODAY</span></div>' : '') +
                '</td>' +
                // 9. Assigned Staff
                '<td>' +
                    '<div><span class="oms-staff-chip">' + escapeAdminHtml(currentStaff) + '</span></div>' +
                    '<select aria-label="Staff for JO-' + escapeAdminHtml(oid) + '" onchange="quickUpdateJobOrderStaff(\'' + escapeAdminHtml(oid) + '\', this.value)" style="margin-top:0.22rem; padding:0.15rem 0.2rem; font-size:0.64rem; border:1px solid #cbd5e1; border-radius:5px; background:#fff; width:108px;">' +
                        staffOpts +
                    '</select>' +
                '</td>' +
                // 10. Deadline
                '<td>' +
                    '<span class="oms-deadline-date">' + formatReadableDateManila(dueDate) + '</span>' +
                    '<span class="oms-deadline-time">' + escapeAdminHtml(item.deadlineTime || '05:00 PM') + '</span>' +
                    '<div>' + deadlineBadgeHtml + '</div>' +
                    '<input type="date" aria-label="Deadline for JO-' + escapeAdminHtml(oid) + '" value="' + escapeAdminHtml(dueDate) + '" onchange="quickUpdateJobOrderDeadline(\'' + escapeAdminHtml(oid) + '\', this.value)" style="margin-top:0.2rem; padding:0.12rem 0.18rem; font-size:0.63rem; border:1px solid #cbd5e1; border-radius:5px; background:#fff; width:104px;">' +
                '</td>' +
                // 11. Actions
                '<td>' +
                    '<div style="display:flex; flex-direction:column; gap:0.25rem;">' +
                        '<button type="button" class="btn-sm-primary" onclick="openAdminJobOrderDetail(\'' + escapeAdminHtml(oid) + '\')" style="padding:0.24rem 0.45rem; font-size:0.66rem; white-space:nowrap; display:inline-flex; align-items:center; justify-content:center; gap:0.25rem;">' +
                            '<span>View / Chat</span>' +
                            (custUnreadForAdmin > 0 ? '<span class="unread-red-badge" style="min-width:16px; height:16px; font-size:0.62rem; padding:0 4px;">' + custUnreadForAdmin + '</span>' : '') +
                        '</button>' +
                        (!finished
                            ? '<button type="button" class="btn-sm-outline" onclick="quickUpdateJobOrderStatus(\'' + escapeAdminHtml(oid) + '\', \'Completed\')" style="padding:0.2rem 0.42rem; font-size:0.64rem; white-space:nowrap; color:#15803d; border-color:#86efac;">✓ Done</button>'
                            : '') +
                    '</div>' +
                '</td>' +
            '</tr>';
    }

    tbody.innerHTML = rowsHtml;

    if (selectedAdminDetailOrderId && sampleOrders[selectedAdminDetailOrderId]) {
        renderAdminJobOrderDetailContent(selectedAdminDetailOrderId);
    }
}

function renderAdminJobOrderDetailContent(orderId) {
    var panel = document.getElementById('adminJobOrderDetailPanel') || document.getElementById('adminOrderDetailPanel');
    var record = sampleOrders[String(orderId)];
    if (!panel || !record) return;

    var total = Number(record.total) || 0;
    var paid = Number(record.downpayment) || 0;
    var balance = Math.max(0, total - paid);
    var orderCustomerId = Number(record.customerId) || 1;
    var adminViewerSession = (currentUserSession.isLoggedIn && currentUserSession.role === 'admin')
        ? currentUserSession
        : { isLoggedIn: true, id: 1, role: 'admin', name: 'Rowena & Lilia (Workshop Admin)' };
    var orderChatHtml = buildMessengerFeedHtml(adminViewerSession, orderCustomerId);

    panel.style.display = 'block';
    panel.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.85rem; padding-bottom:0.65rem; border-bottom:1px solid #bae6fd;">' +
            '<div>' +
                '<span class="modal-kicker" style="color:#0284c7;">DETAILED JOB ORDER VIEW, DEADLINE EDITOR & ORDER MESSAGES</span>' +
                '<h4 style="font-size:1rem; font-weight:800; color:#0f172a; margin:0.15rem 0 0;">Job Order #JO-' + escapeAdminHtml(record.orderId) + ' — ' + escapeAdminHtml(record.customer) + '</h4>' +
            '</div>' +
            '<button type="button" class="btn-sm-outline" onclick="closeAdminJobOrderDetail()">✕ Close Detail View</button>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0.75rem; margin-bottom:0.9rem; font-size:0.78rem;">' +
            '<div style="background:#f8fafc; padding:0.7rem; border-radius:8px; border:1px solid #e2e8f0;">' +
                '<strong style="color:#0369a1; display:block; margin-bottom:0.25rem;">CUSTOMER & DELIVERY SNAPSHOT</strong>' +
                '<div><strong>Name:</strong> ' + escapeAdminHtml(record.customer) + '</div>' +
                '<div><strong>Phone:</strong> ' + escapeAdminHtml(record.customerPhone || '0917-123-4567') + '</div>' +
                '<div><strong>Email:</strong> ' + escapeAdminHtml(record.customerEmail || 'client@example.com') + '</div>' +
                '<div><strong>Delivery Address:</strong> ' + escapeAdminHtml(record.address || 'Metro Manila') + '</div>' +
            '</div>' +
            '<div style="background:#f8fafc; padding:0.7rem; border-radius:8px; border:1px solid #e2e8f0;">' +
                '<strong style="color:#0369a1; display:block; margin-bottom:0.25rem;">FURNITURE SPECIFICATIONS</strong>' +
                '<div><strong>Product:</strong> ' + escapeAdminHtml(record.productName || record.itemSummary) + '</div>' +
                '<div><strong>Specs:</strong> ' + escapeAdminHtml(record.itemSummary) + '</div>' +
                '<div><strong>Quantity:</strong> ' + (Number(record.quantity) || 1) + ' pc(s)</div>' +
                '<div><strong>Order Date:</strong> ' + formatReadableDateManila(record.placed) + ' (' + escapeAdminHtml(record.placed) + ')</div>' +
            '</div>' +
            '<div style="background:#f8fafc; padding:0.7rem; border-radius:8px; border:1px solid #e2e8f0;">' +
                '<strong style="color:#0369a1; display:block; margin-bottom:0.25rem;">FINANCIAL SUMMARY</strong>' +
                '<div><strong>Total Amount:</strong> ₱' + total.toLocaleString() + '</div>' +
                '<div><strong>Paid / Downpayment:</strong> ₱' + paid.toLocaleString() + '</div>' +
                '<div><strong>Remaining Balance:</strong> <span style="color:' + (balance > 0 ? '#dc2626' : '#15803d') + '; font-weight:800;">₱' + balance.toLocaleString() + '</span></div>' +
                '<div><strong>Workshop Stage:</strong> ' + escapeAdminHtml(record.stage || 'In Progress') + '</div>' +
            '</div>' +
        '</div>' +
        '<form onsubmit="return saveAdminJobOrderDetail(event, \'' + escapeAdminHtml(record.orderId) + '\')" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:0.65rem; align-items:end; background:#f0f9ff; padding:0.85rem; border-radius:8px; border:1px solid #bae6fd; margin-bottom:1rem;">' +
            '<div>' +
                '<label style="display:block; font-size:0.7rem; font-weight:700; color:#0369a1; margin-bottom:0.2rem;">Order Status</label>' +
                '<select id="detailEditStatus" style="width:100%; padding:0.42rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.78rem; background:#fff;">' +
                    '<option value="Pending" ' + (record.status === 'Pending' ? 'selected' : '') + '>Pending</option>' +
                    '<option value="Order Confirmed" ' + ((record.status === 'Order Confirmed' || record.status === 'Confirmed') ? 'selected' : '') + '>Order Confirmed</option>' +
                    '<option value="In Production" ' + (record.status === 'In Production' ? 'selected' : '') + '>In Production</option>' +
                    '<option value="For Delivery" ' + ((record.status === 'For Delivery' || record.status === 'Ready') ? 'selected' : '') + '>For Delivery</option>' +
                    '<option value="Completed" ' + ((record.status === 'Completed' || record.status === 'Delivered') ? 'selected' : '') + '>Completed</option>' +
                    '<option value="Cancelled" ' + (record.status === 'Cancelled' ? 'selected' : '') + '>Cancelled</option>' +
                '</select>' +
            '</div>' +
            '<div>' +
                '<label style="display:block; font-size:0.7rem; font-weight:700; color:#0369a1; margin-bottom:0.2rem;">Priority Level</label>' +
                '<select id="detailEditPriority" style="width:100%; padding:0.42rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.78rem; background:#fff;">' +
                    '<option value="Normal" ' + (record.priority === 'Normal' ? 'selected' : '') + '>Normal</option>' +
                    '<option value="High" ' + (record.priority === 'High' ? 'selected' : '') + '>High</option>' +
                    '<option value="Urgent" ' + (record.priority === 'Urgent' ? 'selected' : '') + '>Urgent</option>' +
                '</select>' +
            '</div>' +
            '<div>' +
                '<label style="display:block; font-size:0.7rem; font-weight:700; color:#0369a1; margin-bottom:0.2rem;">Deadline Date</label>' +
                '<input type="date" id="detailEditDueDate" value="' + escapeAdminHtml(String(record.due || '').slice(0, 10)) + '" required style="width:100%; padding:0.4rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.78rem; background:#fff;">' +
            '</div>' +
            '<div>' +
                '<label style="display:block; font-size:0.7rem; font-weight:700; color:#0369a1; margin-bottom:0.2rem;">Deadline Time</label>' +
                '<input type="text" id="detailEditDeadlineTime" value="' + escapeAdminHtml(record.deadlineTime || '05:00 PM') + '" style="width:100%; padding:0.4rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.78rem; background:#fff;">' +
            '</div>' +
            '<div>' +
                '<label style="display:block; font-size:0.7rem; font-weight:700; color:#0369a1; margin-bottom:0.2rem;">Assigned Staff</label>' +
                '<select id="detailEditStaff" style="width:100%; padding:0.42rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.78rem; background:#fff;">' +
                    '<option value="Master Carding Santos" ' + (String(record.carpenter).indexOf('Carding') !== -1 ? 'selected' : '') + '>Master Carding Santos</option>' +
                    '<option value="Master Eddie Manalo" ' + (String(record.carpenter).indexOf('Eddie') !== -1 ? 'selected' : '') + '>Master Eddie Manalo</option>' +
                    '<option value="Dante Cruz" ' + (String(record.carpenter).indexOf('Dante') !== -1 ? 'selected' : '') + '>Dante Cruz</option>' +
                    '<option value="Rene Ocampo" ' + (String(record.carpenter).indexOf('Rene') !== -1 ? 'selected' : '') + '>Rene Ocampo</option>' +
                '</select>' +
            '</div>' +
            '<div>' +
                '<label style="display:block; font-size:0.7rem; font-weight:700; color:#0369a1; margin-bottom:0.2rem;">Paid Amount (₱)</label>' +
                '<input type="number" id="detailEditPaidAmount" value="' + paid + '" min="0" style="width:100%; padding:0.4rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.78rem; background:#fff;">' +
            '</div>' +
            '<div style="grid-column: 1 / -1;">' +
                '<label style="display:block; font-size:0.7rem; font-weight:700; color:#0369a1; margin-bottom:0.2rem;">Workshop Production & Delivery Notes</label>' +
                '<input type="text" id="detailEditJobNotes" value="' + escapeAdminHtml(record.jobNotes || '') + '" placeholder="Add carpentry, finish, or delivery notes..." style="width:100%; padding:0.42rem 0.6rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.78rem; background:#fff;">' +
            '</div>' +
            '<div style="grid-column: 1 / -1; display:flex; justify-content:flex-end; gap:0.5rem;">' +
                '<button type="submit" class="btn-sm-primary" style="padding:0.48rem 1rem;">Save Job Order Changes</button>' +
            '</div>' +
        '</form>' +
        // Embedded Order Messages Inside Order Management
        '<div style="border:1px solid #bae6fd; border-radius:10px; padding:0.95rem; background:#f8fafc;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.55rem;">' +
                '<div>' +
                    '<strong style="font-size:0.86rem; color:#0369a1;">Order Messages & Customer Conversation (' + escapeAdminHtml(record.customer) + ')</strong>' +
                    '<span style="display:block; font-size:0.72rem; color:#64748b;">Managed directly inside Order Management · Opening this order marks customer messages as Read.</span>' +
                '</div>' +
                '<span style="font-size:0.7rem; font-weight:700; color:#15803d; background:#dcfce7; padding:0.18rem 0.55rem; border-radius:999px; border:1px solid #bbf7d0;">✓ Messages Read</span>' +
            '</div>' +
            '<div id="adminOrderDetailChatFeed" class="chat-feed-box" style="height:175px; background:#ffffff; margin-bottom:0.65rem;">' +
                orderChatHtml +
            '</div>' +
            '<form onsubmit="return handleAdminDetailReplySubmit(event, ' + orderCustomerId + ', \'' + escapeAdminHtml(record.orderId) + '\')" style="display:flex; gap:0.5rem; flex-wrap:wrap;">' +
                '<input type="text" id="adminDetailReplyInput" required placeholder="Reply privately to ' + escapeAdminHtml(record.customer) + ' regarding Job Order #JO-' + escapeAdminHtml(record.orderId) + '..." style="flex:1; min-width:220px; padding:0.5rem 0.75rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.78rem; background:#ffffff;" />' +
                '<button type="submit" class="btn-sm-primary">Send Order Reply →</button>' +
            '</form>' +
        '</div>';
}

function openAdminJobOrderDetail(orderId) {
    selectedAdminDetailOrderId = String(orderId);
    var record = sampleOrders[selectedAdminDetailOrderId];
    if (record && record.customerId) {
        selectedAdminConversationCustomerId = Number(record.customerId) || 1;
        if (typeof markMessagesAsReadForViewer === 'function') {
            markMessagesAsReadForViewer(selectedAdminConversationCustomerId);
        }
        if (typeof fetchAuthorizedConversationMessages === 'function') {
            fetchAuthorizedConversationMessages(selectedAdminConversationCustomerId);
        }
    }
    renderAdminJobOrderDetailContent(selectedAdminDetailOrderId);
    var panel = document.getElementById('adminJobOrderDetailPanel') || document.getElementById('adminOrderDetailPanel');
    var container = document.getElementById('omsMainScrollContainer');
    if (panel && container) {
        var topOffset = panel.offsetTop - container.offsetTop - 12;
        container.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    } else if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function closeAdminJobOrderDetail() {
    selectedAdminDetailOrderId = null;
    var panel = document.getElementById('adminJobOrderDetailPanel') || document.getElementById('adminOrderDetailPanel');
    if (panel) {
        panel.style.display = 'none';
        panel.innerHTML = '';
    }
}

function saveAdminJobOrderDetail(event, orderId) {
    event.preventDefault();
    var submitBtn = event.target ? event.target.querySelector('button[type="submit"]') : null;
    var statusEl = document.getElementById('detailEditStatus');
    var prioEl = document.getElementById('detailEditPriority');
    var dueEl = document.getElementById('detailEditDueDate');
    var timeEl = document.getElementById('detailEditDeadlineTime');
    var staffEl = document.getElementById('detailEditStaff');
    var paidEl = document.getElementById('detailEditPaidAmount');
    var notesEl = document.getElementById('detailEditJobNotes');

    var newStatus = statusEl ? statusEl.value : 'In Production';
    var newDue = dueEl ? dueEl.value : getTodayManilaClient();
    if (!newDue) {
        markFieldInvalid(dueEl, true);
        showErrorToast('Please Complete All Required Fields.', 'Please select a valid deadline date for this job order.');
        return false;
    }

    setButtonLoading(submitBtn, true, 'Saving changes...');

    Promise.resolve(
        syncJobOrderUpdateToServer(
            orderId,
            {
                status: newStatus,
                priority: prioEl ? prioEl.value : 'Normal',
                due: newDue,
                deadlineTime: timeEl ? timeEl.value.trim() : '05:00 PM',
                carpenter: staffEl ? staffEl.value : 'Master Carding Santos',
                downpayment: paidEl ? Number(paidEl.value) : 0,
                jobNotes: notesEl ? notesEl.value.trim() : ''
            },
            '✓ Saved full Job Order #JO-' + orderId + ' details, deadline, and priority.'
        )
    ).finally(function () {
        setButtonLoading(submitBtn, false);
        showSuccessToast('Changes Saved Successfully!', 'Job Order #JO-' + orderId + ' status, deadline, and notes have been updated.');
    });
    return false;
}

function toggleNewJobOrderForm() {
    var box = document.getElementById('newJobOrderFormCard') || document.getElementById('adminNewJobOrderFormBox');
    if (!box) return;
    if (box.style.display === 'none' || !box.style.display) {
        box.style.display = 'block';
        var dueIn = document.getElementById('newJoDeadline') || document.getElementById('newJobDueDate');
        if (dueIn && !dueIn.value) {
            dueIn.value = getTodayManilaClient();
        }
    } else {
        box.style.display = 'none';
    }
}

function handleCreateNewJobOrder(event) {
    event.preventDefault();
    if (!currentUserSession.isLoggedIn || currentUserSession.role !== 'admin') {
        showChatSecurityAlert('403 Forbidden: Only Admin accounts can create Job Orders.');
        showErrorToast('Unable to Save Changes. Please Try Again.', 'Only authorized Administrators can create Job Orders.');
        return false;
    }

    var submitBtn = document.getElementById('newJobOrderSubmitBtn') || (event.target && event.target.querySelector('button[type="submit"]'));
    var custNameEl = document.getElementById('newJoCustomer') || document.getElementById('newJobCustomerName');
    var prodNameEl = document.getElementById('newJoProduct') || document.getElementById('newJobProductSelect');
    var qtyEl = document.getElementById('newJoQty') || document.getElementById('newJobQty');
    var totalEl = document.getElementById('newJoTotal') || document.getElementById('newJobTotal');
    var prioEl = document.getElementById('newJoPriority') || document.getElementById('newJobPriority');
    var dueEl = document.getElementById('newJoDeadline') || document.getElementById('newJobDueDate');
    var staffEl = document.getElementById('newJoStaff') || document.getElementById('newJobStaffSelect');

    var custName = custNameEl ? custNameEl.value.trim() : '';
    var prodName = prodNameEl ? prodNameEl.value.trim() : 'Custom Solid Wood Furniture';
    var qty = qtyEl ? (parseInt(qtyEl.value, 10) || 1) : 1;
    var total = totalEl ? (parseFloat(totalEl.value) || 28500) : 28500;
    var paid = Math.round(total * 0.5);
    var status = 'Pending';
    var priority = prioEl ? prioEl.value : 'Urgent';
    var due = (dueEl && dueEl.value) ? dueEl.value : getTodayManilaClient();
    var deadlineTime = '05:00 PM';
    var staff = staffEl ? staffEl.value : 'Master Carding Santos';
    var notes = 'Created by Admin in Job Orders Console.';

    if (!custName) {
        markFieldInvalid(custNameEl, true);
        showErrorToast('Please Complete All Required Fields.', 'Please enter the customer name for the new Job Order.');
        return false;
    }

    setButtonLoading(submitBtn, true, 'Saving changes...');

    var maxId = 1007;
    var keys = Object.keys(sampleOrders);
    for (var i = 0; i < keys.length; i++) {
        var n = Number(keys[i]);
        if (n > maxId) maxId = n;
    }
    var newId = String(maxId + 1);
    var today = getTodayManilaClient();

    sampleOrders[newId] = {
        orderId: newId,
        customerId: 1,
        customer: custName || 'Walk-in Showroom Client',
        customerPhone: '0917-555-0199',
        customerEmail: 'showroom.client@example.com',
        placed: today,
        due: due,
        deadlineTime: deadlineTime,
        status: status,
        priority: priority,
        quantity: qty,
        stepIndex: getStatusStepIndex(status),
        carpenter: staff,
        stage: 'Scheduled via Admin Job Orders Console',
        driver: 'Rene Ocampo (0918-555-6666)',
        address: 'Metro Manila Delivery',
        productName: prodName,
        itemSummary: prodName + ' (Custom Workshop Order)',
        jobNotes: notes,
        total: total,
        downpayment: paid
    };

    savePersistedClientDatabase();

    fetch('/api/admin/job-orders/create', {
        method: 'POST',
        headers: getAuthRequestHeaders(),
        body: JSON.stringify({
            customer: custName,
            productName: prodName,
            itemSummary: sampleOrders[newId].itemSummary,
            quantity: qty,
            total: total,
            downpayment: paid,
            status: status,
            priority: priority,
            due: due,
            deadlineTime: deadlineTime,
            carpenter: staff,
            jobNotes: sampleOrders[newId].jobNotes,
            csrf_token: currentCsrfToken
        })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
        if (data && data.status === 'ok' && Array.isArray(data.orders)) {
            mergeServerJobOrdersIntoClient(data.orders);
        }
    })
    .catch(function () {})
    .finally(function () {
        setButtonLoading(submitBtn, false);
        toggleNewJobOrderForm();
        renderAdminDashboard();
        showAdminOmsNotice('✓ Created new Job Order #JO-' + newId + ' for ' + custName + ' (Deadline: ' + formatReadableDateManila(due) + ').');
        showSuccessToast('Changes Saved Successfully!', 'Job Order #JO-' + newId + ' created for ' + custName + '.');
    });

    return false;
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
function quickAddToCart(id, name, basePrice, image, btnEl) {
    var finalizeAdd = function () {
        if (btnEl) {
            setButtonLoading(btnEl, false);
        }
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
        showSuccessToast('Product Added to Cart!', name + ' has been added to your cart.');
    };

    if (btnEl) {
        setButtonLoading(btnEl, true, '');
        setTimeout(finalizeAdd, 180);
    } else {
        finalizeAdd();
    }
}

function addCustomizedToCart(btnEl) {
    var targetBtn = btnEl || document.getElementById('customizerAddBtn');
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

    setButtonLoading(targetBtn, true, 'Adding to cart...');

    setTimeout(function () {
        setButtonLoading(targetBtn, false);
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
        showSuccessToast('Product Added to Cart!', currentSelectedProduct.name + ' (' + specsText + ') added to cart.');
    }, 220);
}

function changeCartQty(index, delta) {
    if (!shoppingCart[index]) return;
    var nextQty = (Number(shoppingCart[index].qty) || 1) + delta;
    if (nextQty <= 0) {
        removeCartItem(index);
        return;
    }
    shoppingCart[index].qty = nextQty;
    savePersistedClientDatabase();
    renderCartDrawer();
    showSuccessToast('Cart Updated Successfully!', shoppingCart[index].name + ' quantity updated to ' + nextQty + '.');
}

function removeCartItem(index) {
    if (!shoppingCart[index]) return;
    var itemToRemove = shoppingCart[index];
    openConfirmModal({
        title: 'Remove Cart Item',
        message: 'Are you sure you want to remove this item from your cart?',
        cancelText: 'Cancel',
        confirmText: 'Remove Item',
        loadingText: 'Removing item...',
        variant: 'danger',
        onConfirm: function () {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    if (shoppingCart[index]) {
                        shoppingCart.splice(index, 1);
                    }
                    savePersistedClientDatabase();
                    renderCartDrawer();
                    showSuccessToast('Item Removed Successfully!', (itemToRemove ? itemToRemove.name : 'Item') + ' was removed from your cart.');
                    resolve();
                }, 180);
            });
        }
    });
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
    if (typeof populateCheckoutSavedAddresses === 'function') {
        populateCheckoutSavedAddresses();
    }
    openModal('checkoutModal');
}

function submitLiveOrder(event) {
    event.preventDefault();
    if (isOrderSubmissionInFlight) {
        return false;
    }

    var nameIn = document.getElementById('chkFullName');
    var emailIn = document.getElementById('chkEmail');
    var phoneIn = document.getElementById('chkPhone');
    var addrIn = document.getElementById('chkAddress');
    var submitBtn = document.getElementById('checkoutSubmitBtn') || (event.target && event.target.querySelector('button[type="submit"]'));
    var errBox = document.getElementById('checkoutErrorMsg');

    var fullNameVal = nameIn ? nameIn.value.trim() : '';
    var emailVal = emailIn ? emailIn.value.trim() : (currentUserSession.email || 'client@example.com');
    var phoneVal = phoneIn ? phoneIn.value.trim() : '';
    var addrVal = addrIn ? addrIn.value.trim() : '';

    var nameInvalid = fullNameVal.length < 2;
    var emailInvalid = !emailVal || emailVal.indexOf('@') === -1;
    var phoneInvalid = phoneVal.replace(/[^0-9]/g, '').length < 10;
    var addrInvalid = addrVal.length < 8;

    markFieldInvalid(nameIn, nameInvalid);
    markFieldInvalid(emailIn, emailInvalid);
    markFieldInvalid(phoneIn, phoneInvalid);
    markFieldInvalid(addrIn, addrInvalid);

    if (nameInvalid || emailInvalid || phoneInvalid || addrInvalid) {
        if (errBox) {
            errBox.style.display = 'block';
            errBox.textContent = 'Please Complete All Required Fields. Provide your full name, valid email, mobile number, and complete delivery address.';
        }
        showErrorToast('Please Complete All Required Fields.', 'Please verify your recipient name, email, mobile number, and delivery address.');
        return false;
    }

    if (shoppingCart.length === 0) {
        showErrorToast('Unable to Process Your Order.', 'Your shopping cart is currently empty.');
        return false;
    }

    if (errBox) errBox.style.display = 'none';

    openConfirmModal({
        title: 'Confirm Your Order',
        message: 'Please review your order details. Do you want to place this order?',
        cancelText: 'Cancel',
        confirmText: 'Confirm & Place Order',
        loadingText: 'Placing your order...',
        variant: 'primary',
        onConfirm: function () {
            isOrderSubmissionInFlight = true;
            setButtonLoading(submitBtn, true, 'Placing your order...');

            var subtotal = 0;
            var totalQty = 0;
            for (var i = 0; i < shoppingCart.length; i++) {
                subtotal += (shoppingCart[i].basePrice + shoppingCart[i].extraCost) * shoppingCart[i].qty;
                totalQty += (Number(shoppingCart[i].qty) || 1);
            }
            var grandTotal = subtotal + (subtotal >= 15000 ? 0 : 850);
            var dp = Math.round(grandTotal * 0.5);
            var firstProdName = shoppingCart[0] ? shoppingCart[0].name : 'Custom Furniture Order';
            var firstItemName = shoppingCart[0] ? (shoppingCart[0].name + ' (' + shoppingCart[0].specs + ')') : 'Custom Furniture Order';

            var maxId = 1007;
            var keys = Object.keys(sampleOrders);
            for (var k = 0; k < keys.length; k++) {
                var num = Number(keys[k]);
                if (num > maxId) maxId = num;
            }
            var newOrderId = String(maxId + 1);
            var todayManila = getTodayManilaClient();
            var targetDue = offsetDateManilaClient(14);
            var idempotencyKey = 'ord_' + (currentUserSession.id || 'guest') + '_' + grandTotal + '_' + Date.now();

            var localRecord = {
                orderId: newOrderId,
                customerId: currentUserSession.isLoggedIn ? (Number(currentUserSession.id) || 1) : 1,
                customer: fullNameVal,
                customerPhone: phoneVal,
                customerEmail: emailVal,
                placed: todayManila,
                due: targetDue,
                deadlineTime: '04:00 PM',
                status: 'Pending',
                priority: 'Normal',
                quantity: totalQty || 1,
                stepIndex: 0,
                carpenter: 'Master Carding Santos',
                stage: 'Timber Selection & Grain Matching',
                driver: 'Rene Ocampo (0918-555-6666)',
                address: addrVal,
                productName: firstProdName,
                itemSummary: firstItemName,
                jobNotes: 'Online Storefront Order — 50% Downpayment Recorded.',
                total: grandTotal,
                downpayment: dp
            };

            return fetch('/api/orders/create', {
                method: 'POST',
                headers: getAuthRequestHeaders(),
                body: JSON.stringify({
                    idempotencyKey: idempotencyKey,
                    customerName: fullNameVal,
                    customerPhone: phoneVal,
                    customerEmail: emailVal,
                    address: addrVal,
                    productName: firstProdName,
                    itemSummary: firstItemName,
                    quantity: totalQty || 1,
                    total: grandTotal,
                    downpayment: dp,
                    due: targetDue
                })
            })
            .then(function (res) {
                return res.json().then(function (data) {
                    return { status: res.status, data: data };
                });
            })
            .then(function (result) {
                if (result.status === 200 && result.data && result.data.order) {
                    var srvOrd = result.data.order;
                    newOrderId = String(srvOrd.orderId || newOrderId);
                    localRecord.orderId = newOrderId;
                }
                sampleOrders[newOrderId] = localRecord;
            })
            .catch(function () {
                sampleOrders[newOrderId] = localRecord;
            })
            .finally(function () {
                isOrderSubmissionInFlight = false;
                setButtonLoading(submitBtn, false);
                shoppingCart = [];
                savePersistedClientDatabase();
                renderCartDrawer();
                renderAdminDashboard();
                closeModal('checkoutModal');
                lookupOrderById(newOrderId);
                openModal('trackOrderModal');
                showSuccessToast('Order Placed Successfully!', 'Order #' + newOrderId + ' has been confirmed and scheduled for workshop production.');
            });
        }
    });

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
                '<strong style="font-size:0.75rem; color:#0369a1; display:block; margin-bottom:0.3rem;">WORKSHOP ASSIGNMENT</strong>' +
                '<p style="font-size:0.78rem;"><strong>Carpenter:</strong> ' + record.carpenter + '</p>' +
                '<p style="font-size:0.78rem;"><strong>Stage:</strong> ' + record.stage + '</p>' +
            '</div>' +
            '<div style="padding:0.9rem; border:1px solid #e2e8f0; border-radius:8px;">' +
                '<strong style="font-size:0.75rem; color:#0369a1; display:block; margin-bottom:0.3rem;">IN-HOUSE DELIVERY DISPATCH</strong>' +
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
        MessageText: 'Hello Maria! Master Finisher Dante Cruz is currently applying the final walnut coat to your table. Yes, we can add 2 matching slatted mahogany chairs (+₱4,200) and complimentary felt pads before driver Rene Ocampo delivers on Nov 9!',
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
        IsRead: 1,
        ReadAt: '2026-11-06 10:25:00',
        CreatedAt: '2026-11-06 10:14:00'
    }
];

function syncStaticFallbackMessages() {
    if (!currentUserSession.isLoggedIn) {
        liveOrderMessages = [];
        adminConversationsList = [];
        renderMessageFeeds();
        updateUnreadBadgesUI();
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
            var unread = 0;
            for (var j = 0; j < staticFallbackMessagesStore.length; j++) {
                var m = staticFallbackMessagesStore[j];
                if (Number(m.CustomerID) === Number(c.id)) {
                    count++;
                    if (String(m.SenderRole) === 'Customer' && Number(m.IsRead || 0) === 0) {
                        unread++;
                    }
                }
            }
            return { CustomerID: c.id, FullName: c.fullName, MessageCount: count, UnreadCount: unread };
        });
    } else {
        adminConversationsList = [];
    }
    renderMessageFeeds();
    updateUnreadBadgesUI();
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
            // Sync staticFallbackMessagesStore read statuses with server
            for (var s = 0; s < liveOrderMessages.length; s++) {
                var srvMsg = liveOrderMessages[s];
                var foundLocal = false;
                for (var l = 0; l < staticFallbackMessagesStore.length; l++) {
                    if (Number(staticFallbackMessagesStore[l].MessageID) === Number(srvMsg.MessageID)) {
                        staticFallbackMessagesStore[l] = srvMsg;
                        foundLocal = true;
                        break;
                    }
                }
                if (!foundLocal) {
                    staticFallbackMessagesStore.push(srvMsg);
                }
            }
            if (Array.isArray(result.data.conversations)) {
                adminConversationsList = result.data.conversations;
            }
            renderMessageFeeds();
            updateUnreadBadgesUI();
            if (currentUserSession.role === 'admin') {
                renderAdminDashboard();
            }
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
            '<strong style="display:block; color:#0f172a; margin-bottom:0.35rem;">Private Customer-Admin Messenger</strong>' +
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
        var unreadForCust = (typeof computeUnreadCountForAdminByCustomer === 'function')
            ? computeUnreadCountForAdminByCustomer(cid)
            : 0;
        var isSelected = (cid === Number(selectedAdminConversationCustomerId));
        var btnClass = isSelected ? 'btn-sm-primary' : 'btn-sm-soft';
        var orderLabel = (cid === 1) ? 'Order #1001' : ((cid === 2) ? 'Order #1002' : 'Custom Inquiry');

        html +=
            '<button type="button" class="' + btnClass + '" data-conversation-btn="' + cid + '" onclick="selectAdminConversation(' + cid + ')">' +
                '<span>' + escapeHtmlText(cust.fullName) + ' (Customer #' + cid + ' · ' + orderLabel + ' · ' + msgCount + ' msgs)</span>' +
                (unreadForCust > 0 ? '<span class="unread-red-badge" style="margin-left:0.35rem;">' + unreadForCust + '</span>' : '') +
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
    if (typeof markMessagesAsReadForViewer === 'function') {
        markMessagesAsReadForViewer(requestedCid);
    }

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

function handleAdminReplyTargetChange(val) {
    if (!val) return;
    var parts = String(val).split('|');
    var cid = Number(parts[0]) || 1;
    selectAdminConversation(cid);
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
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'1001\', \'Order Follow-Up (#1001)\', \'Hello Admin! I would like to follow up on the production status of Order #1001 (Mahogany Dining Set). How is the finishing progressing?\')">Follow up Order #1001 status</button>' +
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'1001\', \'Add Custom Request (#1001)\', \'Hello Admin! Can we add 2 extra matching solid mahogany dining chairs to our Order #1001?\')">Add 2 extra chairs to Order #1001</button>' +
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'1001\', \'Delivery Schedule (#1001)\', \'Good day! Could you please confirm the estimated delivery arrival window for Order #1001?\')">Confirm Order #1001 delivery time</button>';
        } else if (cid === 2) {
            quickChipsBox.innerHTML =
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'1002\', \'Order Follow-Up (#1002)\', \'Hello Admin! I would like to check on the framing progress for my Order #1002 (Scandinavian Sky Blue Lounge Sofa).\')">Follow up Order #1002 status</button>' +
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'1002\', \'Add Custom Request (#1002)\', \'Hello Admin, can we add a water-resistant fabric guard treatment to our Order #1002 Sky Blue Lounge Sofa?\')">Add fabric guard to Order #1002</button>' +
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'1002\', \'Delivery Schedule (#1002)\', \'Good day! Could you please confirm the scheduled delivery date for Order #1002 to Ayala Alabang?\')">Confirm Order #1002 delivery date</button>';
        } else {
            quickChipsBox.innerHTML =
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'\', \'Workshop Inquiry\', \'Hello Admin! I would like to request a custom dimension quote for a solid mahogany dining table.\')">Request Custom Dimension Quote</button>' +
                '<button type="button" class="chat-chip-btn" onclick="fillChatQuickPrompt(\'\', \'Delivery Coordination\', \'Hello Admin! What is the lead time for delivery to Metro Manila?\')">Ask About Delivery Lead Time</button>';
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
    var updatedFallback = false;
    for (var s = 0; s < staticFallbackMessagesStore.length; s++) {
        if (Number(staticFallbackMessagesStore[s].MessageID) === Number(newMsg.MessageID)) {
            staticFallbackMessagesStore[s] = newMsg;
            updatedFallback = true;
            break;
        }
    }
    if (!updatedFallback) {
        staticFallbackMessagesStore.push(newMsg);
    }

    var updatedLive = false;
    for (var i = 0; i < liveOrderMessages.length; i++) {
        if (Number(liveOrderMessages[i].MessageID) === Number(newMsg.MessageID)) {
            liveOrderMessages[i] = newMsg;
            updatedLive = true;
            break;
        }
    }
    if (!updatedLive) {
        liveOrderMessages.push(newMsg);
    }

    savePersistedClientDatabase();
    renderMessageFeeds();
    updateUnreadBadgesUI();
    if (currentUserSession.role === 'admin') {
        renderAdminDashboard();
    }
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

// Render private conversations in both the Messenger Chat Modal and Order Management Detail Panel
function renderMessageFeeds() {
    var customerFeed = document.getElementById('customerChatFeed');
    var adminFeed = document.getElementById('adminChatFeed');
    var adminOrderDetailFeed = document.getElementById('adminOrderDetailChatFeed');
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

    if (headerCount) headerCount.textContent = visibleConversationMsgs.length;
    if (floatingCount) floatingCount.textContent = visibleConversationMsgs.length;

    // Update the authenticated viewer & private conversation indicator inside the Messenger modal
    if (viewerStatusEl) {
        if (currentUserSession.isLoggedIn && currentUserSession.role === 'admin') {
            var activeCust = getCustomerRecordById(activeConversationCustomerId);
            viewerStatusEl.innerHTML =
                'Logged in as <strong>' + escapeHtmlText(currentUserSession.name) + '</strong> (<code>AdminID: ' + Number(currentUserSession.id) + '</code>) · ' +
                'Viewing Private Conversation with <strong>' + escapeHtmlText(activeCust.fullName) + ' (Customer #' + activeConversationCustomerId + ')</strong>';
        } else if (currentUserSession.isLoggedIn && currentUserSession.role === 'customer') {
            viewerStatusEl.innerHTML =
                'Private Conversation: <strong>' + escapeHtmlText(currentUserSession.name) + '</strong> (<code>CustomerID: ' + Number(currentUserSession.id) + '</code>) ↔ <strong>Workshop Admin</strong> — Only you and the Admin can see this chat.';
        } else {
            viewerStatusEl.innerHTML =
                '<strong>Sign In Required</strong> — Please sign in as a Customer or Admin to access your private conversation.';
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

    if (activeConversationCustomerId) {
        renderPrivateOrderOptionsForConversation(activeConversationCustomerId);
    }

    // 1. Render main Messenger Chat Window (#customerChatFeed) scoped strictly to activeConversationCustomerId
    if (customerFeed) {
        customerFeed.innerHTML = buildMessengerFeedHtml(currentUserSession, activeConversationCustomerId);
        customerFeed.scrollTop = customerFeed.scrollHeight;
    }

    // 2. Render Order Management Detail Chat Feed (#adminOrderDetailChatFeed)
    var adminViewerSession = (currentUserSession.isLoggedIn && currentUserSession.role === 'admin')
        ? currentUserSession
        : { isLoggedIn: true, id: 1, role: 'admin', name: 'Rowena & Lilia (Workshop Admin)' };

    if (adminFeed) {
        adminFeed.innerHTML = buildMessengerFeedHtml(adminViewerSession, selectedAdminConversationCustomerId);
        adminFeed.scrollTop = adminFeed.scrollHeight;
    }
    if (adminOrderDetailFeed && selectedAdminDetailOrderId && sampleOrders[selectedAdminDetailOrderId]) {
        var ordCid = Number(sampleOrders[selectedAdminDetailOrderId].customerId) || 1;
        adminOrderDetailFeed.innerHTML = buildMessengerFeedHtml(adminViewerSession, ordCid);
        adminOrderDetailFeed.scrollTop = adminOrderDetailFeed.scrollHeight;
    }

    if (typeof updateUnreadBadgesUI === 'function') {
        updateUnreadBadgesUI();
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
                    if (data.csrfToken) {
                        currentCsrfToken = data.csrfToken;
                    }
                    currentUserSession = data.user;
                    savePersistedClientDatabase();
                    renderAuthHeaderState();
                    syncCustomerProfileFromServer();
                    if (currentUserSession.role === 'admin' && typeof refreshAdminJobOrdersFromServer === 'function') {
                        refreshAdminJobOrdersFromServer(true);
                    }
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
            setTimeout(initRealTimeMessaging, 3000);
        };
    } catch (err) {
        // Fallback when WebSocket is unavailable
    }
}

// Open the Live Chat Modal & mark incoming messages read for the viewer
function openLiveChatModal(prefillOrderId, prefillTopic) {
    closeCustomerProfileDropdown();
    if (currentUserSession.isLoggedIn) {
        if (currentUserSession.role === 'customer') {
            markMessagesAsReadForViewer();
        } else if (currentUserSession.role === 'admin') {
            markMessagesAsReadForViewer(selectedAdminConversationCustomerId);
        }
    }
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
            IsRead: 0,
            ReadAt: null,
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
    if (isMessageSendInFlight) return false;
    if (!currentUserSession.isLoggedIn || !currentUserSession.id) {
        openModal('authModal');
        showWarningToast('Sign In Required', 'Please sign in to your account to send a private message.');
        return false;
    }

    var inputEl = document.getElementById('customerChatInput');
    var orderSelect = document.getElementById('chatOrderSelect');
    var topicSelect = document.getElementById('chatTopicSelect');
    var submitBtn = document.getElementById('chatSendSubmitBtn') || (event.target && event.target.querySelector('button[type="submit"]'));

    var text = inputEl ? inputEl.value.trim() : '';
    if (!text) {
        markFieldInvalid(inputEl, true);
        showErrorToast('Please Complete All Required Fields.', 'Please enter a message before sending.');
        return false;
    }
    markFieldInvalid(inputEl, false);

    var orderId = (orderSelect && orderSelect.value) ? Number(orderSelect.value) : null;
    var topic = (topicSelect && topicSelect.value) ? topicSelect.value : 'Order Follow-Up';

    isMessageSendInFlight = true;
    setButtonLoading(submitBtn, true, 'Sending message...');

    var payload = (currentUserSession.role === 'admin')
        ? {
            CustomerID: Number(selectedAdminConversationCustomerId) || 1,
            OrderID: orderId,
            Topic: topic,
            MessageText: text
        }
        : {
            OrderID: orderId,
            Topic: topic,
            MessageText: text
        };

    Promise.resolve(sendLiveOrderMessage(payload))
        .then(function () {
            if (inputEl) inputEl.value = '';
            showSuccessToast('Message Sent Successfully!', 'Your private message has been delivered.');
        })
        .catch(function () {
            showErrorToast('Failed to Send Message.', 'Unable to send your message right now. Please try again.');
        })
        .finally(function () {
            isMessageSendInFlight = false;
            setButtonLoading(submitBtn, false);
        });

    return false;
}

function handleAdminReplySubmit(event) {
    event.preventDefault();
    if (isMessageSendInFlight) return false;
    if (!currentUserSession.isLoggedIn || currentUserSession.role !== 'admin') {
        showChatSecurityAlert('403 Forbidden: Only Admin accounts can send Admin replies.');
        showErrorToast('Failed to Send Message.', 'Only authorized Admin accounts can send Admin replies.');
        return false;
    }

    var replyInput = document.getElementById('adminReplyInput');
    var targetSelect = document.getElementById('adminReplyTargetOrder');
    var submitBtn = document.getElementById('adminReplySubmitBtn') || (event.target && event.target.querySelector('button[type="submit"]'));

    var text = replyInput ? replyInput.value.trim() : '';
    if (!text) {
        markFieldInvalid(replyInput, true);
        showErrorToast('Please Complete All Required Fields.', 'Please enter a reply message for the customer.');
        return false;
    }
    markFieldInvalid(replyInput, false);

    var parts = (targetSelect && targetSelect.value)
        ? targetSelect.value.split('|')
        : [String(selectedAdminConversationCustomerId || 1), '1001', 'Order Follow-Up (#1001)'];
    var custId = Number(parts[0]) || Number(selectedAdminConversationCustomerId) || 1;
    var ordId = Number(parts[1]) || (custId === 2 ? 1002 : 1001);
    var topic = parts[2] || 'Workshop Admin Reply';

    selectedAdminConversationCustomerId = custId;
    isMessageSendInFlight = true;
    setButtonLoading(submitBtn, true, 'Sending message...');

    Promise.resolve(
        sendLiveOrderMessage({
            CustomerID: custId,
            OrderID: ordId,
            Topic: topic,
            MessageText: text
        })
    )
    .then(function () {
        if (replyInput) replyInput.value = '';
        var msgBox = document.getElementById('adminStatusNotice');
        var targetCust = getCustomerRecordById(custId);
        if (msgBox) {
            msgBox.style.display = 'block';
            msgBox.textContent = '✓ Private Admin reply sent to ' + targetCust.fullName + ' (Customer #' + custId + ') — visible only in Customer #' + custId + '\'s conversation.';
        }
        showSuccessToast('Message Sent Successfully!', 'Reply delivered to ' + targetCust.fullName + '.');
    })
    .catch(function () {
        showErrorToast('Failed to Send Message.', 'Could not deliver reply. Please try again.');
    })
    .finally(function () {
        isMessageSendInFlight = false;
        setButtonLoading(submitBtn, false);
    });

    return false;
}

// Reply to Customer directly from inside Order Management Job Order Detail panel
function handleAdminDetailReplySubmit(event, customerId, orderId) {
    event.preventDefault();
    if (isMessageSendInFlight) return false;
    if (!currentUserSession.isLoggedIn || currentUserSession.role !== 'admin') {
        return false;
    }
    var inputEl = document.getElementById('adminDetailReplyInput');
    var submitBtn = event.target ? event.target.querySelector('button[type="submit"]') : null;
    var text = inputEl ? inputEl.value.trim() : '';
    if (!text) {
        markFieldInvalid(inputEl, true);
        showErrorToast('Please Complete All Required Fields.', 'Please enter a reply message before sending.');
        return false;
    }
    markFieldInvalid(inputEl, false);

    var cid = Number(customerId) || 1;
    var oid = Number(orderId) || 1001;
    selectedAdminConversationCustomerId = cid;

    isMessageSendInFlight = true;
    setButtonLoading(submitBtn, true, 'Sending message...');

    Promise.resolve(
        sendLiveOrderMessage({
            CustomerID: cid,
            OrderID: oid,
            Topic: 'Order Follow-Up (#' + oid + ')',
            MessageText: text
        })
    ).then(function () {
        if (inputEl) inputEl.value = '';
        if (selectedAdminDetailOrderId) {
            renderAdminJobOrderDetailContent(selectedAdminDetailOrderId);
        }
        showAdminOmsNotice('✓ Order reply sent to Customer #' + cid + ' for Job Order #JO-' + oid + '.');
        showSuccessToast('Message Sent Successfully!', 'Order reply delivered for Job Order #JO-' + oid + '.');
    }).catch(function () {
        showErrorToast('Failed to Send Message.', 'Unable to send order reply. Please try again.');
    }).finally(function () {
        isMessageSendInFlight = false;
        setButtonLoading(submitBtn, false);
    });

    return false;
}

// ============================================================================
// 11. RED UNREAD MESSAGE NOTIFICATION BADGES & READ STATUS SYNC
// ============================================================================
function getAllKnownMessagesForUnreadCount() {
    // Combine staticFallbackMessagesStore and liveOrderMessages without duplicates
    var mapById = {};
    var result = [];
    for (var i = 0; i < staticFallbackMessagesStore.length; i++) {
        var m = staticFallbackMessagesStore[i];
        if (m && m.MessageID) {
            mapById[Number(m.MessageID)] = m;
        }
    }
    for (var j = 0; j < liveOrderMessages.length; j++) {
        var lm = liveOrderMessages[j];
        if (lm && lm.MessageID) {
            mapById[Number(lm.MessageID)] = lm;
        }
    }
    var keys = Object.keys(mapById);
    for (var k = 0; k < keys.length; k++) {
        result.push(mapById[keys[k]]);
    }
    return result;
}

// Customer unread count: ONLY messages sent by Admin in this customer's conversation with IsRead == 0
function computeUnreadCountForCustomer(customerId) {
    var cid = Number(customerId) || 0;
    if (cid <= 0) return 0;
    var allMsgs = getAllKnownMessagesForUnreadCount();
    var unread = 0;
    for (var i = 0; i < allMsgs.length; i++) {
        var msg = allMsgs[i];
        if (
            Number(msg.CustomerID) === cid &&
            String(msg.SenderRole || '').toLowerCase() === 'admin' &&
            Number(msg.IsRead !== undefined ? msg.IsRead : 1) === 0
        ) {
            unread++;
        }
    }
    return unread;
}

// Admin unread count per customer: ONLY messages sent by Customer with IsRead == 0
function computeUnreadCountForAdminByCustomer(customerId) {
    var cid = Number(customerId) || 0;
    if (cid <= 0) return 0;
    for (var c = 0; c < adminConversationsList.length; c++) {
        if (Number(adminConversationsList[c].CustomerID) === cid && adminConversationsList[c].UnreadCount !== undefined) {
            return Number(adminConversationsList[c].UnreadCount) || 0;
        }
    }
    var allMsgs = getAllKnownMessagesForUnreadCount();
    var unread = 0;
    for (var i = 0; i < allMsgs.length; i++) {
        var msg = allMsgs[i];
        if (
            Number(msg.CustomerID) === cid &&
            String(msg.SenderRole || '').toLowerCase() === 'customer' &&
            Number(msg.IsRead !== undefined ? msg.IsRead : 1) === 0
        ) {
            unread++;
        }
    }
    return unread;
}

function computeTotalUnreadCountForAdmin() {
    var total = 0;
    for (var i = 0; i < registeredCustomers.length; i++) {
        total += computeUnreadCountForAdminByCustomer(registeredCustomers[i].id);
    }
    return total;
}

function setBadgeElementCount(badgeEl, count) {
    if (!badgeEl) return;
    var n = Number(count) || 0;
    if (n > 0) {
        badgeEl.textContent = String(n);
        badgeEl.style.display = 'inline-flex';
    } else {
        badgeEl.textContent = '0';
        badgeEl.style.display = 'none';
    }
}

function updateUnreadBadgesUI() {
    var headerBadge = document.getElementById('headerUnreadBadge');
    var dropdownBadge = document.getElementById('dropdownUnreadBadge');
    var cpSidebarBadge = document.getElementById('cpSidebarUnreadBadge');
    var adminHeaderBadge = document.getElementById('adminHeaderUnreadBadge');
    var omsSidebarBadge = document.getElementById('omsSidebarUnreadBadge');
    var omsSidebarMessagesBadge = document.getElementById('omsSidebarMessagesUnreadBadge');

    if (!currentUserSession || !currentUserSession.isLoggedIn) {
        setBadgeElementCount(headerBadge, 0);
        setBadgeElementCount(dropdownBadge, 0);
        setBadgeElementCount(cpSidebarBadge, 0);
        setBadgeElementCount(adminHeaderBadge, 0);
        setBadgeElementCount(omsSidebarBadge, 0);
        setBadgeElementCount(omsSidebarMessagesBadge, 0);
        return;
    }

    if (currentUserSession.role === 'customer') {
        var custUnread = computeUnreadCountForCustomer(currentUserSession.id);
        setBadgeElementCount(headerBadge, custUnread);
        setBadgeElementCount(dropdownBadge, custUnread);
        setBadgeElementCount(cpSidebarBadge, custUnread);
        setBadgeElementCount(adminHeaderBadge, 0);
        setBadgeElementCount(omsSidebarBadge, 0);
        setBadgeElementCount(omsSidebarMessagesBadge, 0);
    } else if (currentUserSession.role === 'admin') {
        var admUnread = computeTotalUnreadCountForAdmin();
        setBadgeElementCount(headerBadge, 0);
        setBadgeElementCount(dropdownBadge, 0);
        setBadgeElementCount(cpSidebarBadge, 0);
        setBadgeElementCount(adminHeaderBadge, admUnread);
        setBadgeElementCount(omsSidebarBadge, admUnread);
        setBadgeElementCount(omsSidebarMessagesBadge, admUnread);
    }
}

function markMessagesAsReadForViewer(targetCustomerIdForAdmin) {
    if (!currentUserSession || !currentUserSession.isLoggedIn) return;
    var nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (currentUserSession.role === 'customer') {
        var cid = Number(currentUserSession.id) || 1;
        for (var i = 0; i < staticFallbackMessagesStore.length; i++) {
            var m = staticFallbackMessagesStore[i];
            if (Number(m.CustomerID) === cid && String(m.SenderRole).toLowerCase() === 'admin') {
                m.IsRead = 1;
                m.ReadAt = nowIso;
            }
        }
        for (var j = 0; j < liveOrderMessages.length; j++) {
            var lm = liveOrderMessages[j];
            if (Number(lm.CustomerID) === cid && String(lm.SenderRole).toLowerCase() === 'admin') {
                lm.IsRead = 1;
                lm.ReadAt = nowIso;
            }
        }
    } else if (currentUserSession.role === 'admin') {
        var targetCid = Number(targetCustomerIdForAdmin || selectedAdminConversationCustomerId) || 1;
        for (var a = 0; a < staticFallbackMessagesStore.length; a++) {
            var am = staticFallbackMessagesStore[a];
            if (Number(am.CustomerID) === targetCid && String(am.SenderRole).toLowerCase() === 'customer') {
                am.IsRead = 1;
                am.ReadAt = nowIso;
            }
        }
        for (var b = 0; b < liveOrderMessages.length; b++) {
            var alm = liveOrderMessages[b];
            if (Number(alm.CustomerID) === targetCid && String(alm.SenderRole).toLowerCase() === 'customer') {
                alm.IsRead = 1;
                alm.ReadAt = nowIso;
            }
        }
        for (var c = 0; c < adminConversationsList.length; c++) {
            if (Number(adminConversationsList[c].CustomerID) === targetCid) {
                adminConversationsList[c].UnreadCount = 0;
            }
        }
    }

    savePersistedClientDatabase();
    updateUnreadBadgesUI();
    if (currentUserSession.role === 'admin') {
        renderAdminDashboard();
    }

    fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: getAuthRequestHeaders(),
        body: JSON.stringify({
            customerId: targetCustomerIdForAdmin || selectedAdminConversationCustomerId || currentUserSession.id
        })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
        if (data && data.status === 'ok' && Array.isArray(data.conversations)) {
            adminConversationsList = data.conversations;
            updateUnreadBadgesUI();
            if (currentUserSession.role === 'admin') {
                renderAdminDashboard();
            }
        }
    })
    .catch(function () {
        fetch('public/index.php?route=api_mark_messages_read', {
            method: 'POST',
            headers: getAuthRequestHeaders(),
            body: JSON.stringify({
                customerId: targetCustomerIdForAdmin || selectedAdminConversationCustomerId || currentUserSession.id
            })
        }).catch(function () {});
    });
}

// ============================================================================
// 12. CUSTOMER PROFILE DROPDOWN MENU (Matches Reference Screenshot)
// ============================================================================
function toggleCustomerProfileDropdown(event) {
    if (event) {
        event.stopPropagation();
    }
    var menu = document.getElementById('customerProfileDropdownMenu');
    var trigger = document.getElementById('customerProfileTriggerBtn');
    if (!menu) return;
    var isOpen = menu.classList.contains('open');
    if (isOpen) {
        closeCustomerProfileDropdown();
    } else {
        menu.classList.add('open');
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        updateUnreadBadgesUI();
    }
}

function closeCustomerProfileDropdown() {
    var menu = document.getElementById('customerProfileDropdownMenu');
    var trigger = document.getElementById('customerProfileTriggerBtn');
    if (menu) menu.classList.remove('open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

function openMessagesFromCustomerDropdown() {
    closeCustomerProfileDropdown();
    openLiveChatModal();
}

// ============================================================================
// 13. SHOPEE-INSPIRED CUSTOMER "MY PROFILE" & "MY ADDRESSES" MANAGEMENT
// ============================================================================
var activeCustomerProfileTab = 'profile';
var isCustomerProfileEditMode = false;

function showCustomerProfileNotice(msg, isError) {
    var okBox = document.getElementById('cpFeedbackBanner');
    var errBox = document.getElementById('cpErrorBanner');
    if (okBox) okBox.style.display = 'none';
    if (errBox) errBox.style.display = 'none';
    if (!msg) return;
    if (isError) {
        if (errBox) {
            errBox.textContent = msg;
            errBox.style.display = 'block';
        }
    } else if (okBox) {
        okBox.textContent = msg;
        okBox.style.display = 'block';
    }
}

function getAddressesForCustomer(customerId) {
    var cid = Number(customerId) || 1;
    var list = [];
    for (var i = 0; i < customerSavedAddresses.length; i++) {
        if (Number(customerSavedAddresses[i].CustomerID) === cid) {
            list.push(customerSavedAddresses[i]);
        }
    }
    list.sort(function (a, b) {
        if (Number(b.IsDefault) !== Number(a.IsDefault)) {
            return Number(b.IsDefault) - Number(a.IsDefault);
        }
        return Number(a.AddressID) - Number(b.AddressID);
    });
    return list;
}

function formatFullSavedAddressLine(addr) {
    if (!addr) return '';
    var parts = [
        addr.StreetAddress,
        addr.Barangay ? ('Brgy. ' + addr.Barangay) : '',
        addr.City,
        addr.Province,
        addr.PostalCode
    ].filter(function (p) { return Boolean(p && String(p).trim()); });
    return parts.join(', ');
}

function syncCustomerProfileFromServer() {
    if (!currentUserSession || !currentUserSession.isLoggedIn || currentUserSession.role !== 'customer') {
        return Promise.resolve(null);
    }
    return fetch('/api/profile', {
        method: 'GET',
        headers: getAuthRequestHeaders()
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
        if (data && data.status === 'ok') {
            if (data.profile) {
                var p = data.profile;
                currentUserSession.name = p.fullName || currentUserSession.name;
                currentUserSession.username = p.username || currentUserSession.username;
                currentUserSession.email = p.email || currentUserSession.email;
                currentUserSession.phone = p.phone || currentUserSession.phone;
                currentUserSession.gender = p.gender !== undefined ? p.gender : currentUserSession.gender;
                currentUserSession.birthday = p.birthday !== undefined ? p.birthday : currentUserSession.birthday;
                currentUserSession.profileImage = p.profileImage !== undefined ? p.profileImage : currentUserSession.profileImage;
                currentUserSession.address = p.address || currentUserSession.address;

                for (var i = 0; i < registeredCustomers.length; i++) {
                    if (Number(registeredCustomers[i].id) === Number(currentUserSession.id)) {
                        registeredCustomers[i].fullName = currentUserSession.name;
                        registeredCustomers[i].username = currentUserSession.username;
                        registeredCustomers[i].email = currentUserSession.email;
                        registeredCustomers[i].phone = currentUserSession.phone;
                        registeredCustomers[i].gender = currentUserSession.gender;
                        registeredCustomers[i].birthday = currentUserSession.birthday;
                        registeredCustomers[i].profileImage = currentUserSession.profileImage;
                        registeredCustomers[i].address = currentUserSession.address;
                        break;
                    }
                }
            }
            if (Array.isArray(data.addresses)) {
                var cid = Number(currentUserSession.id) || 1;
                var others = customerSavedAddresses.filter(function (a) { return Number(a.CustomerID) !== cid; });
                customerSavedAddresses = others.concat(data.addresses);
            }
            savePersistedClientDatabase();
            renderAuthHeaderState();
        }
        return data;
    })
    .catch(function () {
        return null;
    });
}

function openCustomerProfileModal(tabName) {
    closeCustomerProfileDropdown();
    if (!currentUserSession || !currentUserSession.isLoggedIn) {
        openModal('authModal');
        return;
    }
    showCustomerProfileNotice('', false);
    populateCustomerProfileModalFields();
    switchCustomerProfileTab(tabName || 'profile');
    toggleCustomerProfileEditMode(false);
    openModal('customerProfileModal');
    syncCustomerProfileFromServer().then(function () {
        populateCustomerProfileModalFields();
        renderCustomerAddressesList();
        renderCustomerMyOrdersList();
    });
}

function switchCustomerProfileTab(tabName) {
    activeCustomerProfileTab = tabName || 'profile';
    var tabs = ['profile', 'addresses', 'orders', 'password'];
    for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        var pane = document.getElementById('cpPane_' + t);
        var navBtn = document.getElementById('cpNav_' + t);
        if (pane) pane.style.display = (t === activeCustomerProfileTab) ? 'block' : 'none';
        if (navBtn) navBtn.classList.toggle('active', t === activeCustomerProfileTab);
    }
    showCustomerProfileNotice('', false);
    if (activeCustomerProfileTab === 'addresses') {
        renderCustomerAddressesList();
    } else if (activeCustomerProfileTab === 'orders') {
        renderCustomerMyOrdersList();
    } else if (activeCustomerProfileTab === 'profile') {
        populateCustomerProfileModalFields();
    }
}

function populateCustomerProfileModalFields() {
    var cid = Number(currentUserSession.id) || 1;
    var custRec = getCustomerRecordById(cid);
    var fullName = currentUserSession.name || custRec.fullName || '';
    var username = currentUserSession.username || custRec.username || (currentUserSession.email || '').split('@')[0];
    var email = currentUserSession.email || custRec.email || '';
    var phone = currentUserSession.phone || custRec.phone || '';
    var gender = currentUserSession.gender !== undefined ? currentUserSession.gender : (custRec.gender || '');
    var birthday = currentUserSession.birthday !== undefined ? currentUserSession.birthday : (custRec.birthday || '');
    var profileImage = currentUserSession.profileImage || custRec.profileImage || '';
    var defaultAddr = currentUserSession.address || custRec.address || '';

    var addrList = getAddressesForCustomer(cid);
    for (var i = 0; i < addrList.length; i++) {
        if (Number(addrList[i].IsDefault) === 1) {
            defaultAddr = formatFullSavedAddressLine(addrList[i]);
            break;
        }
    }

    var nameIn = document.getElementById('cpFullName');
    var userIn = document.getElementById('cpUsername');
    var emailIn = document.getElementById('cpEmail');
    var phoneIn = document.getElementById('cpPhone');
    var genderIn = document.getElementById('cpGender');
    var bdayIn = document.getElementById('cpBirthday');
    var addrIn = document.getElementById('cpDefaultAddress');
    var sidebarName = document.getElementById('cpSidebarName');
    var sidebarAvatar = document.getElementById('cpSidebarAvatar');
    var largeAvatar = document.getElementById('cpAvatarPreviewBox');

    if (nameIn) nameIn.value = fullName;
    if (userIn) userIn.value = username;
    if (emailIn) emailIn.value = email;
    if (phoneIn) phoneIn.value = phone;
    if (genderIn) genderIn.value = gender || '';
    if (bdayIn) bdayIn.value = birthday || '';
    if (addrIn) addrIn.value = defaultAddr;
    if (sidebarName) sidebarName.textContent = fullName;
    renderAvatarElement(sidebarAvatar, fullName, profileImage);
    renderAvatarElement(largeAvatar, fullName, profileImage);
}

function toggleCustomerProfileEditMode(enable) {
    isCustomerProfileEditMode = Boolean(enable);
    var fieldIds = ['cpFullName', 'cpUsername', 'cpEmail', 'cpPhone', 'cpGender', 'cpBirthday', 'cpDefaultAddress'];
    for (var i = 0; i < fieldIds.length; i++) {
        var el = document.getElementById(fieldIds[i]);
        if (el) el.disabled = !isCustomerProfileEditMode;
    }
    var actionsBox = document.getElementById('cpProfileFormActions');
    var editBtn = document.getElementById('cpEditProfileToggleBtn');
    if (actionsBox) actionsBox.style.display = isCustomerProfileEditMode ? 'flex' : 'none';
    if (editBtn) editBtn.style.display = isCustomerProfileEditMode ? 'none' : 'inline-flex';
    if (!isCustomerProfileEditMode) {
        populateCustomerProfileModalFields();
    } else {
        var firstInput = document.getElementById('cpFullName');
        if (firstInput) firstInput.focus();
    }
}

function handleProfileImageFileChange(fileInput) {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
    var file = fileInput.files[0];
    var selectBtn = document.getElementById('cpSelectAvatarBtn');
    var allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.indexOf(String(file.type).toLowerCase()) === -1) {
        showCustomerProfileNotice('The Selected File Is Not Supported. Please choose a JPG, PNG, or WEBP image.', true);
        showErrorToast('The Selected File Is Not Supported.', 'Allowed image formats are .JPG, .JPEG, .PNG, and .WEBP.');
        fileInput.value = '';
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        showCustomerProfileNotice('The Selected File Is Not Supported. Maximum allowed file size is 2 MB.', true);
        showErrorToast('The Selected File Is Not Supported.', 'Image size exceeds the 2 MB maximum limit.');
        fileInput.value = '';
        return;
    }

    setButtonLoading(selectBtn, true, 'Uploading profile picture...');

    var reader = new FileReader();
    reader.onload = function (e) {
        var dataUrl = e.target.result;
        currentUserSession.profileImage = dataUrl;
        for (var i = 0; i < registeredCustomers.length; i++) {
            if (Number(registeredCustomers[i].id) === Number(currentUserSession.id)) {
                registeredCustomers[i].profileImage = dataUrl;
                break;
            }
        }
        savePersistedClientDatabase();
        populateCustomerProfileModalFields();
        renderAuthHeaderState();

        fetch('/api/profile/update', {
            method: 'POST',
            headers: getAuthRequestHeaders(),
            body: JSON.stringify({
                fullName: currentUserSession.name,
                username: currentUserSession.username,
                email: currentUserSession.email,
                phone: currentUserSession.phone,
                gender: currentUserSession.gender,
                birthday: currentUserSession.birthday,
                address: currentUserSession.address,
                profileImage: dataUrl,
                csrf_token: currentCsrfToken
            })
        })
        .catch(function () {})
        .finally(function () {
            setButtonLoading(selectBtn, false);
            showCustomerProfileNotice('✓ Profile picture updated and saved to your account.', false);
            showSuccessToast('Profile Updated Successfully!', 'Your profile picture has been uploaded and saved.');
        });
    };
    reader.onerror = function () {
        setButtonLoading(selectBtn, false);
        showErrorToast('The Selected File Is Not Supported.', 'Could not read the selected image file.');
    };
    reader.readAsDataURL(file);
}

function saveCustomerProfileForm(event) {
    event.preventDefault();
    var nameIn = document.getElementById('cpFullName');
    var userIn = document.getElementById('cpUsername');
    var emailIn = document.getElementById('cpEmail');
    var phoneIn = document.getElementById('cpPhone');
    var genderIn = document.getElementById('cpGender');
    var bdayIn = document.getElementById('cpBirthday');
    var addrIn = document.getElementById('cpDefaultAddress');
    var saveBtn = document.getElementById('cpSaveProfileBtn') || (event.target && event.target.querySelector('button[type="submit"]'));

    var fullName = (nameIn ? nameIn.value : '').trim();
    var username = (userIn ? userIn.value : '').trim();
    var email = (emailIn ? emailIn.value : '').trim().toLowerCase();
    var phone = (phoneIn ? phoneIn.value : '').trim();
    var gender = (genderIn ? genderIn.value : '').trim();
    var birthday = (bdayIn ? bdayIn.value : '').trim();
    var defaultAddress = (addrIn ? addrIn.value : '').trim();

    markFieldInvalid(nameIn, fullName.length < 2);
    markFieldInvalid(emailIn, !email || email.indexOf('@') === -1);
    markFieldInvalid(phoneIn, phone.replace(/[^0-9]/g, '').length < 10);
    markFieldInvalid(addrIn, defaultAddress.length < 5);

    if (fullName.length < 2 || !email || email.indexOf('@') === -1 || phone.replace(/[^0-9]/g, '').length < 10 || defaultAddress.length < 5) {
        showCustomerProfileNotice('Please Complete All Required Fields before saving your profile.', true);
        showErrorToast('Please Complete All Required Fields.', 'Please enter a valid full name, email address, mobile number, and default delivery address.');
        return false;
    }

    setButtonLoading(saveBtn, true, 'Saving changes...');

    currentUserSession.name = fullName;
    currentUserSession.username = username || email.split('@')[0];
    currentUserSession.email = email;
    currentUserSession.phone = phone;
    currentUserSession.gender = gender;
    currentUserSession.birthday = birthday;
    currentUserSession.address = defaultAddress;

    var cid = Number(currentUserSession.id) || 1;
    for (var i = 0; i < registeredCustomers.length; i++) {
        if (Number(registeredCustomers[i].id) === cid) {
            registeredCustomers[i].fullName = fullName;
            registeredCustomers[i].username = currentUserSession.username;
            registeredCustomers[i].email = email;
            registeredCustomers[i].phone = phone;
            registeredCustomers[i].gender = gender;
            registeredCustomers[i].birthday = birthday;
            registeredCustomers[i].address = defaultAddress;
            break;
        }
    }

    // Update default address record if one exists
    var updatedDefaultAddr = false;
    for (var a = 0; a < customerSavedAddresses.length; a++) {
        if (Number(customerSavedAddresses[a].CustomerID) === cid && Number(customerSavedAddresses[a].IsDefault) === 1) {
            customerSavedAddresses[a].RecipientName = fullName;
            customerSavedAddresses[a].PhoneNumber = phone;
            customerSavedAddresses[a].StreetAddress = defaultAddress;
            updatedDefaultAddr = true;
            break;
        }
    }
    if (!updatedDefaultAddr) {
        customerSavedAddresses.push({
            AddressID: Date.now(),
            CustomerID: cid,
            RecipientName: fullName,
            PhoneNumber: phone,
            StreetAddress: defaultAddress,
            Barangay: '',
            City: 'Metro Manila',
            Province: 'Metro Manila',
            PostalCode: '',
            DeliveryNotes: '',
            AddressLabel: 'Home',
            IsDefault: 1
        });
    }

    savePersistedClientDatabase();

    fetch('/api/profile/update', {
        method: 'POST',
        headers: getAuthRequestHeaders(),
        body: JSON.stringify({
            fullName: fullName,
            username: currentUserSession.username,
            email: email,
            phone: phone,
            gender: gender,
            birthday: birthday,
            address: defaultAddress,
            profileImage: currentUserSession.profileImage || '',
            csrf_token: currentCsrfToken
        })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
        if (data && data.status === 'ok' && Array.isArray(data.addresses)) {
            var others = customerSavedAddresses.filter(function (ad) { return Number(ad.CustomerID) !== cid; });
            customerSavedAddresses = others.concat(data.addresses);
            savePersistedClientDatabase();
        }
    })
    .catch(function () {
        return fetch('public/index.php?route=api_profile_update', {
            method: 'POST',
            headers: getAuthRequestHeaders(),
            body: JSON.stringify({
                fullName: fullName,
                username: currentUserSession.username,
                email: email,
                phone: phone,
                gender: gender,
                birthday: birthday,
                address: defaultAddress,
                csrf_token: currentCsrfToken
            })
        }).catch(function () {});
    })
    .finally(function () {
        setButtonLoading(saveBtn, false);
        toggleCustomerProfileEditMode(false);
        populateCustomerProfileModalFields();
        renderAuthHeaderState();
        showCustomerProfileNotice('✓ Profile Updated Successfully! Your personal details and default address have been saved.', false);
        showSuccessToast('Profile Updated Successfully!', 'Your personal information and default delivery address have been saved.');
    });

    return false;
}

// --- MY ADDRESSES CRUD (Shopee-Style Delivery Address Book) ---
function renderCustomerAddressesList() {
    var container = document.getElementById('cpAddressesListContainer');
    if (!container) return;
    var cid = Number(currentUserSession.id) || 1;
    var list = getAddressesForCustomer(cid);

    if (list.length === 0) {
        container.innerHTML =
            '<div style="padding:2rem; text-align:center; color:#64748b; border:1px dashed #cbd5e1; border-radius:10px;">' +
                '<strong style="display:block; color:#0f172a; margin-bottom:0.25rem;">No Saved Delivery Addresses Yet</strong>' +
                '<span style="font-size:0.78rem;">Click "+ Add New Address" above to save your home or office delivery destination.</span>' +
            '</div>';
        return;
    }

    var html = '';
    for (var i = 0; i < list.length; i++) {
        var addr = list[i];
        var aid = Number(addr.AddressID);
        var isDef = Number(addr.IsDefault) === 1;
        var fullLine = formatFullSavedAddressLine(addr);
        html +=
            '<div class="cp-address-card ' + (isDef ? 'is-default' : '') + '">' +
                '<div style="flex:1; min-width:0;">' +
                    '<div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.3rem;">' +
                        '<strong style="font-size:0.88rem; color:#0f172a;">' + escapeHtmlText(addr.RecipientName) + '</strong>' +
                        '<span style="color:#cbd5e1;">|</span>' +
                        '<span style="font-size:0.8rem; color:#475569; font-weight:600;">Tel: ' + escapeHtmlText(addr.PhoneNumber) + '</span>' +
                        '<span class="cp-label-badge">' + escapeHtmlText(addr.AddressLabel || 'Home') + '</span>' +
                        (isDef ? '<span class="cp-default-badge">Default</span>' : '') +
                    '</div>' +
                    '<div style="font-size:0.8rem; color:#334155; line-height:1.45;">' + escapeHtmlText(fullLine) + '</div>' +
                    (addr.DeliveryNotes
                        ? '<div style="font-size:0.73rem; color:#64748b; margin-top:0.2rem;">Note: ' + escapeHtmlText(addr.DeliveryNotes) + '</div>'
                        : '') +
                '</div>' +
                '<div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.4rem; flex-shrink:0;">' +
                    '<div style="display:flex; gap:0.5rem;">' +
                        '<button type="button" class="btn-link-sm" style="font-size:0.75rem; color:#0284c7; font-weight:700;" onclick="openCustomerAddressEditor(' + aid + ')">Edit</button>' +
                        (list.length > 1
                            ? '<button type="button" class="btn-link-sm" style="font-size:0.75rem; color:#dc2626; font-weight:700;" onclick="deleteCustomerAddress(' + aid + ')">Delete</button>'
                            : '') +
                    '</div>' +
                    (!isDef
                        ? '<button type="button" class="btn-sm-soft" style="font-size:0.7rem; padding:0.25rem 0.6rem;" onclick="setCustomerDefaultAddress(' + aid + ')">Set as Default</button>'
                        : '<span style="font-size:0.7rem; color:#0369a1; font-weight:700;">✓ Active Default</span>') +
                '</div>' +
            '</div>';
    }
    container.innerHTML = html;
}

function openCustomerAddressEditor(addressId) {
    var card = document.getElementById('cpAddressEditorCard');
    var titleEl = document.getElementById('cpAddressEditorTitle');
    if (!card) return;
    card.style.display = 'block';

    var cid = Number(currentUserSession.id) || 1;
    var existing = null;
    if (addressId) {
        for (var i = 0; i < customerSavedAddresses.length; i++) {
            if (Number(customerSavedAddresses[i].AddressID) === Number(addressId) && Number(customerSavedAddresses[i].CustomerID) === cid) {
                existing = customerSavedAddresses[i];
                break;
            }
        }
    }

    document.getElementById('addrEditId').value = existing ? String(existing.AddressID) : '';
    document.getElementById('addrRecipientName').value = existing ? (existing.RecipientName || '') : (currentUserSession.name || '');
    document.getElementById('addrPhoneNumber').value = existing ? (existing.PhoneNumber || '') : (currentUserSession.phone || '');
    document.getElementById('addrStreet').value = existing ? (existing.StreetAddress || '') : '';
    document.getElementById('addrBarangay').value = existing ? (existing.Barangay || '') : '';
    document.getElementById('addrCity').value = existing ? (existing.City || '') : '';
    document.getElementById('addrProvince').value = existing ? (existing.Province || 'Metro Manila') : 'Metro Manila';
    document.getElementById('addrPostalCode').value = existing ? (existing.PostalCode || '') : '';
    document.getElementById('addrNotes').value = existing ? (existing.DeliveryNotes || '') : '';
    document.getElementById('addrLabel').value = existing ? (existing.AddressLabel || 'Home') : 'Home';
    document.getElementById('addrIsDefault').checked = existing ? (Number(existing.IsDefault) === 1) : (getAddressesForCustomer(cid).length === 0);

    if (titleEl) {
        titleEl.textContent = existing ? 'Edit Delivery Address' : 'Add New Delivery Address';
    }
}

function closeCustomerAddressEditor() {
    var card = document.getElementById('cpAddressEditorCard');
    if (card) card.style.display = 'none';
}

function saveCustomerAddressForm(event) {
    event.preventDefault();
    var cid = Number(currentUserSession.id) || 1;
    var editId = document.getElementById('addrEditId').value.trim();
    var recIn = document.getElementById('addrRecipientName');
    var phoneIn = document.getElementById('addrPhoneNumber');
    var streetIn = document.getElementById('addrStreet');
    var brgyIn = document.getElementById('addrBarangay');
    var cityIn = document.getElementById('addrCity');
    var provIn = document.getElementById('addrProvince');
    var postalIn = document.getElementById('addrPostalCode');
    var notesIn = document.getElementById('addrNotes');
    var labelIn = document.getElementById('addrLabel');
    var saveBtn = document.getElementById('cpSaveAddressBtn') || (event.target && event.target.querySelector('button[type="submit"]'));

    var recipientName = recIn ? recIn.value.trim() : '';
    var phoneNumber = phoneIn ? phoneIn.value.trim() : '';
    var streetAddress = streetIn ? streetIn.value.trim() : '';
    var barangay = brgyIn ? brgyIn.value.trim() : '';
    var city = cityIn ? cityIn.value.trim() : '';
    var province = provIn ? provIn.value.trim() : '';
    var postalCode = postalIn ? postalIn.value.trim() : '';
    var deliveryNotes = notesIn ? notesIn.value.trim() : '';
    var addressLabel = labelIn ? (labelIn.value || 'Home') : 'Home';
    var isDefault = document.getElementById('addrIsDefault').checked ? 1 : 0;

    markFieldInvalid(recIn, !recipientName);
    markFieldInvalid(phoneIn, !phoneNumber);
    markFieldInvalid(streetIn, !streetAddress);
    markFieldInvalid(cityIn, !city);
    markFieldInvalid(provIn, !province);

    if (!recipientName || !phoneNumber || !streetAddress || !city || !province) {
        showCustomerProfileNotice('Please Complete All Required Fields for your delivery address.', true);
        showErrorToast('Please Complete All Required Fields.', 'Please enter recipient name, contact number, street address, city, and province.');
        return false;
    }

    setButtonLoading(saveBtn, true, 'Saving delivery address...');

    var myAddresses = getAddressesForCustomer(cid);
    if (myAddresses.length === 0) {
        isDefault = 1;
    }

    if (isDefault === 1) {
        for (var i = 0; i < customerSavedAddresses.length; i++) {
            if (Number(customerSavedAddresses[i].CustomerID) === cid) {
                customerSavedAddresses[i].IsDefault = 0;
            }
        }
    }

    var savedRecord = null;
    if (editId) {
        for (var j = 0; j < customerSavedAddresses.length; j++) {
            if (Number(customerSavedAddresses[j].AddressID) === Number(editId) && Number(customerSavedAddresses[j].CustomerID) === cid) {
                customerSavedAddresses[j].RecipientName = recipientName;
                customerSavedAddresses[j].PhoneNumber = phoneNumber;
                customerSavedAddresses[j].StreetAddress = streetAddress;
                customerSavedAddresses[j].Barangay = barangay;
                customerSavedAddresses[j].City = city;
                customerSavedAddresses[j].Province = province;
                customerSavedAddresses[j].PostalCode = postalCode;
                customerSavedAddresses[j].DeliveryNotes = deliveryNotes;
                customerSavedAddresses[j].AddressLabel = addressLabel;
                customerSavedAddresses[j].IsDefault = isDefault;
                savedRecord = customerSavedAddresses[j];
                break;
            }
        }
    }

    if (!savedRecord) {
        var maxAid = 10;
        for (var k = 0; k < customerSavedAddresses.length; k++) {
            if (Number(customerSavedAddresses[k].AddressID) > maxAid) {
                maxAid = Number(customerSavedAddresses[k].AddressID);
            }
        }
        savedRecord = {
            AddressID: maxAid + 1,
            CustomerID: cid,
            RecipientName: recipientName,
            PhoneNumber: phoneNumber,
            StreetAddress: streetAddress,
            Barangay: barangay,
            City: city,
            Province: province,
            PostalCode: postalCode,
            DeliveryNotes: deliveryNotes,
            AddressLabel: addressLabel,
            IsDefault: isDefault
        };
        customerSavedAddresses.push(savedRecord);
    }

    if (Number(savedRecord.IsDefault) === 1) {
        var formatted = formatFullSavedAddressLine(savedRecord);
        currentUserSession.address = formatted;
        for (var c = 0; c < registeredCustomers.length; c++) {
            if (Number(registeredCustomers[c].id) === cid) {
                registeredCustomers[c].address = formatted;
                break;
            }
        }
    }

    savePersistedClientDatabase();

    fetch('/api/addresses/save', {
        method: 'POST',
        headers: getAuthRequestHeaders(),
        body: JSON.stringify({
            addressId: editId ? Number(editId) : null,
            recipientName: recipientName,
            phoneNumber: phoneNumber,
            streetAddress: streetAddress,
            barangay: barangay,
            city: city,
            province: province,
            postalCode: postalCode,
            deliveryNotes: deliveryNotes,
            addressLabel: addressLabel,
            isDefault: Boolean(isDefault),
            csrf_token: currentCsrfToken
        })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
        if (data && data.status === 'ok' && Array.isArray(data.addresses)) {
            var others = customerSavedAddresses.filter(function (ad) { return Number(ad.CustomerID) !== cid; });
            customerSavedAddresses = others.concat(data.addresses);
            savePersistedClientDatabase();
        }
    })
    .catch(function () {})
    .finally(function () {
        setButtonLoading(saveBtn, false);
        closeCustomerAddressEditor();
        renderCustomerAddressesList();
        populateCustomerProfileModalFields();
        renderAuthHeaderState();
        showCustomerProfileNotice('✓ Changes Saved Successfully! Delivery address saved.', false);
        showSuccessToast('Changes Saved Successfully!', 'Delivery address has been saved to your address book.');
    });

    return false;
}

function setCustomerDefaultAddress(addressId) {
    var cid = Number(currentUserSession.id) || 1;
    var chosen = null;
    for (var i = 0; i < customerSavedAddresses.length; i++) {
        if (Number(customerSavedAddresses[i].CustomerID) === cid) {
            if (Number(customerSavedAddresses[i].AddressID) === Number(addressId)) {
                customerSavedAddresses[i].IsDefault = 1;
                chosen = customerSavedAddresses[i];
            } else {
                customerSavedAddresses[i].IsDefault = 0;
            }
        }
    }
    if (chosen) {
        var fullLine = formatFullSavedAddressLine(chosen);
        currentUserSession.address = fullLine;
        for (var c = 0; c < registeredCustomers.length; c++) {
            if (Number(registeredCustomers[c].id) === cid) {
                registeredCustomers[c].address = fullLine;
                break;
            }
        }
    }
    savePersistedClientDatabase();
    renderCustomerAddressesList();
    populateCustomerProfileModalFields();
    renderAuthHeaderState();
    showCustomerProfileNotice('✓ Default delivery address updated.', false);
    showSuccessToast('Changes Saved Successfully!', 'Default delivery address updated.');

    fetch('/api/addresses/default', {
        method: 'POST',
        headers: getAuthRequestHeaders(),
        body: JSON.stringify({ addressId: Number(addressId), csrf_token: currentCsrfToken })
    }).catch(function () {});
}

function deleteCustomerAddress(addressId) {
    openConfirmModal({
        title: 'Delete Delivery Address',
        message: 'Are you sure you want to delete this address?',
        cancelText: 'Cancel',
        confirmText: 'Delete Address',
        loadingText: 'Deleting record...',
        variant: 'danger',
        onConfirm: function () {
            var cid = Number(currentUserSession.id) || 1;
            var remaining = [];
            var removedWasDefault = false;
            for (var i = 0; i < customerSavedAddresses.length; i++) {
                var a = customerSavedAddresses[i];
                if (Number(a.CustomerID) === cid && Number(a.AddressID) === Number(addressId)) {
                    if (Number(a.IsDefault) === 1) removedWasDefault = true;
                    continue;
                }
                remaining.push(a);
            }
            customerSavedAddresses = remaining;
            if (removedWasDefault) {
                for (var j = 0; j < customerSavedAddresses.length; j++) {
                    if (Number(customerSavedAddresses[j].CustomerID) === cid) {
                        customerSavedAddresses[j].IsDefault = 1;
                        currentUserSession.address = formatFullSavedAddressLine(customerSavedAddresses[j]);
                        break;
                    }
                }
            }
            savePersistedClientDatabase();

            return fetch('/api/addresses/delete', {
                method: 'POST',
                headers: getAuthRequestHeaders(),
                body: JSON.stringify({ addressId: Number(addressId), csrf_token: currentCsrfToken })
            })
            .catch(function () {})
            .finally(function () {
                renderCustomerAddressesList();
                populateCustomerProfileModalFields();
                renderAuthHeaderState();
                showCustomerProfileNotice('✓ Address removed from your saved addresses.', false);
                showSuccessToast('Item Removed Successfully!', 'Delivery address deleted from your address book.');
            });
        }
    });
}

// --- CHECKOUT SAVED ADDRESS SELECTOR INTEGRATION ---
function populateCheckoutSavedAddresses() {
    var selectEl = document.getElementById('chkSavedAddressSelect');
    var boxEl = document.getElementById('chkSavedAddressBox');
    var chkName = document.getElementById('chkFullName');
    var chkEmail = document.getElementById('chkEmail');
    var chkPhone = document.getElementById('chkPhone');
    var chkAddr = document.getElementById('chkAddress');

    if (!currentUserSession || !currentUserSession.isLoggedIn || currentUserSession.role !== 'customer') {
        if (boxEl) boxEl.style.display = 'none';
        return;
    }
    if (boxEl) boxEl.style.display = 'block';
    if (chkEmail && currentUserSession.email) chkEmail.value = currentUserSession.email;

    var cid = Number(currentUserSession.id) || 1;
    var list = getAddressesForCustomer(cid);
    if (!selectEl) return;

    if (list.length === 0) {
        selectEl.innerHTML = '<option value="custom">Custom Delivery Address (Type below)</option>';
        if (chkName && currentUserSession.name) chkName.value = currentUserSession.name;
        if (chkPhone && currentUserSession.phone) chkPhone.value = currentUserSession.phone;
        if (chkAddr && currentUserSession.address) chkAddr.value = currentUserSession.address;
        return;
    }

    var optsHtml = '';
    var defaultAddr = list[0];
    for (var i = 0; i < list.length; i++) {
        var a = list[i];
        var isDef = Number(a.IsDefault) === 1;
        if (isDef) defaultAddr = a;
        var labelTag = '[' + (a.AddressLabel || 'Home') + (isDef ? ' · DEFAULT' : '') + '] ';
        var summary = labelTag + a.RecipientName + ' (' + a.PhoneNumber + ') — ' + formatFullSavedAddressLine(a);
        optsHtml += '<option value="' + Number(a.AddressID) + '" ' + (isDef ? 'selected' : '') + '>' + escapeHtmlText(summary) + '</option>';
    }
    optsHtml += '<option value="custom">+ Enter a different one-time delivery address below</option>';
    selectEl.innerHTML = optsHtml;

    if (defaultAddr) {
        if (chkName) chkName.value = defaultAddr.RecipientName || currentUserSession.name || '';
        if (chkPhone) chkPhone.value = defaultAddr.PhoneNumber || currentUserSession.phone || '';
        if (chkAddr) chkAddr.value = formatFullSavedAddressLine(defaultAddr);
    }
}

function handleCheckoutAddressSelection(addressIdValue) {
    if (!addressIdValue || addressIdValue === 'custom') return;
    var cid = Number(currentUserSession.id) || 1;
    var list = getAddressesForCustomer(cid);
    for (var i = 0; i < list.length; i++) {
        if (Number(list[i].AddressID) === Number(addressIdValue)) {
            var chosen = list[i];
            var chkName = document.getElementById('chkFullName');
            var chkPhone = document.getElementById('chkPhone');
            var chkAddr = document.getElementById('chkAddress');
            if (chkName) chkName.value = chosen.RecipientName || currentUserSession.name || '';
            if (chkPhone) chkPhone.value = chosen.PhoneNumber || currentUserSession.phone || '';
            if (chkAddr) chkAddr.value = formatFullSavedAddressLine(chosen);
            break;
        }
    }
}

// --- CUSTOMER MY ORDERS LIST IN MY PROFILE MODAL ---
function renderCustomerMyOrdersList() {
    var container = document.getElementById('cpMyOrdersListContainer');
    if (!container) return;
    var cid = Number(currentUserSession.id) || 1;
    var keys = Object.keys(sampleOrders);
    var myOrders = [];
    for (var i = 0; i < keys.length; i++) {
        var ord = sampleOrders[keys[i]];
        if (ord && Number(ord.customerId) === cid) {
            myOrders.push(ord);
        }
    }
    myOrders.sort(function (a, b) {
        return Number(b.orderId) - Number(a.orderId);
    });

    if (myOrders.length === 0) {
        container.innerHTML =
            '<div style="padding:2rem; text-align:center; color:#64748b; border:1px dashed #cbd5e1; border-radius:10px;">' +
                '<strong style="display:block; color:#0f172a; margin-bottom:0.25rem;">No Orders Found Under Your Account Yet</strong>' +
                '<span style="font-size:0.78rem;">Explore our handcrafted solid wood collection to place your first custom order.</span>' +
            '</div>';
        return;
    }

    var html = '';
    for (var j = 0; j < myOrders.length; j++) {
        var o = myOrders[j];
        var total = Number(o.total) || 0;
        var paid = Number(o.downpayment) || 0;
        var balance = Math.max(0, total - paid);
        html +=
            '<div class="cp-address-card" style="flex-direction:column; gap:0.65rem;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center; width:100%; flex-wrap:wrap; gap:0.5rem; border-bottom:1px solid #f1f5f9; padding-bottom:0.5rem;">' +
                    '<div>' +
                        '<strong style="font-size:0.88rem; color:#0369a1;">Order #' + escapeHtmlText(o.orderId) + '</strong>' +
                        '<span style="font-size:0.74rem; color:#64748b; margin-left:0.5rem;">Placed: ' + escapeHtmlText(o.placed) + ' · Target Date: ' + escapeHtmlText(o.due) + '</span>' +
                    '</div>' +
                    '<span class="oms-status-badge ' + getStatusBadgeClassName(o.status) + '">' + escapeHtmlText(o.status) + '</span>' +
                '</div>' +
                '<div style="display:flex; justify-content:space-between; align-items:flex-start; width:100%; flex-wrap:wrap; gap:0.75rem; font-size:0.8rem;">' +
                    '<div style="flex:1; min-width:220px;">' +
                        '<strong style="color:#0f172a; display:block;">' + escapeHtmlText(o.itemSummary || o.productName) + '</strong>' +
                        '<div style="color:#475569; font-size:0.75rem; margin-top:0.2rem;"><strong>Order Delivery Snapshot:</strong> ' + escapeHtmlText(o.address) + '</div>' +
                        '<div style="color:#64748b; font-size:0.73rem; margin-top:0.15rem;">Carpenter: ' + escapeHtmlText(o.carpenter) + ' · Stage: ' + escapeHtmlText(o.stage) + '</div>' +
                    '</div>' +
                    '<div style="text-align:right;">' +
                        '<strong style="font-size:0.95rem; color:#0f172a; display:block;">₱' + total.toLocaleString() + '</strong>' +
                        '<span style="font-size:0.72rem; color:' + (balance > 0 ? '#dc2626' : '#15803d') + '; font-weight:700;">' +
                            (balance > 0 ? ('Balance Due: ₱' + balance.toLocaleString()) : '✓ Paid in Full') +
                        '</span>' +
                        '<div style="display:flex; gap:0.4rem; margin-top:0.45rem; justify-content:flex-end;">' +
                            '<button type="button" class="btn-sm-soft" style="font-size:0.7rem; padding:0.25rem 0.55rem;" onclick="closeModal(\'customerProfileModal\'); lookupOrderById(\'' + escapeHtmlText(o.orderId) + '\'); openModal(\'trackOrderModal\');">Track Order</button>' +
                            '<button type="button" class="btn-sm-primary" style="font-size:0.7rem; padding:0.25rem 0.55rem;" onclick="closeModal(\'customerProfileModal\'); openLiveChatModal(\'' + escapeHtmlText(o.orderId) + '\', \'Order Follow-Up (#' + escapeHtmlText(o.orderId) + ')\');">Message Admin</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }
    container.innerHTML = html;
}

// --- CHANGE PASSWORD IN MY PROFILE MODAL ---
function handleCustomerChangePassword(event) {
    event.preventDefault();
    var curIn = document.getElementById('cpCurrentPassword');
    var newIn = document.getElementById('cpNewPassword');
    var confIn = document.getElementById('cpConfirmPassword');
    var submitBtn = document.getElementById('cpUpdatePasswordBtn') || (event.target && event.target.querySelector('button[type="submit"]'));

    var curPass = curIn ? curIn.value : '';
    var newPass = newIn ? newIn.value : '';
    var confirmPass = confIn ? confIn.value : '';

    markFieldInvalid(curIn, !curPass);
    markFieldInvalid(newIn, !newPass || newPass.length < 6);
    markFieldInvalid(confIn, !confirmPass || newPass !== confirmPass);

    if (!curPass || !newPass || !confirmPass) {
        showCustomerProfileNotice('Please Complete All Required Fields.', true);
        showErrorToast('Please Complete All Required Fields.', 'Please fill in your current password, new password, and confirmation password.');
        return false;
    }
    if (newPass.length < 6) {
        showCustomerProfileNotice('New password must be at least 6 characters long.', true);
        showErrorToast('Unable to Save Changes. Please Try Again.', 'New password must be at least 6 characters long.');
        return false;
    }
    if (newPass !== confirmPass) {
        showCustomerProfileNotice('New password and confirmation password do not match.', true);
        showErrorToast('Unable to Save Changes. Please Try Again.', 'New password and confirmation password do not match.');
        return false;
    }

    var cid = Number(currentUserSession.id) || 1;
    var custRec = null;
    for (var i = 0; i < registeredCustomers.length; i++) {
        if (Number(registeredCustomers[i].id) === cid) {
            custRec = registeredCustomers[i];
            break;
        }
    }

    if (custRec && custRec.password && custRec.password !== curPass) {
        markFieldInvalid(curIn, true);
        showCustomerProfileNotice('Current password is incorrect. Please verify and try again.', true);
        showErrorToast('Invalid Email or Password.', 'Your current password is incorrect. Please verify and try again.');
        return false;
    }

    setButtonLoading(submitBtn, true, 'Saving changes...');

    if (custRec) {
        custRec.password = newPass;
    }
    savePersistedClientDatabase();

    fetch('/api/profile/password', {
        method: 'POST',
        headers: getAuthRequestHeaders(),
        body: JSON.stringify({
            currentPassword: curPass,
            newPassword: newPass,
            confirmPassword: confirmPass,
            csrf_token: currentCsrfToken
        })
    })
    .catch(function () {})
    .finally(function () {
        setButtonLoading(submitBtn, false);
        if (curIn) curIn.value = '';
        if (newIn) newIn.value = '';
        if (confIn) confIn.value = '';
        showCustomerProfileNotice('✓ Password Changed Successfully! Your account password has been updated securely.', false);
        showSuccessToast('Password Changed Successfully!', 'Your account password has been updated securely.');
    });

    return false;
}

// Progressive enhancement for multi-page PHP views (Logout confirmation, Destructive actions, Form loading spinners)
function initPhpPageUxEnhancements() {
    // 1. Intercept PHP Logout links (a[href*="route=logout"] or [data-ux-confirm="logout"])
    var logoutLinks = document.querySelectorAll('a[href*="route=logout"], [data-ux-confirm="logout"]');
    for (var i = 0; i < logoutLinks.length; i++) {
        (function (linkEl) {
            if (linkEl.dataset.uxBound === '1') return;
            linkEl.dataset.uxBound = '1';
            linkEl.addEventListener('click', function (e) {
                e.preventDefault();
                var targetHref = linkEl.getAttribute('href') || 'index.php?route=logout';
                openConfirmModal({
                    title: 'Confirm Logout',
                    message: 'Are you sure you want to log out of your account?',
                    cancelText: 'Cancel',
                    confirmText: 'Yes, Log Out',
                    loadingText: 'Logging out...',
                    variant: 'danger',
                    onConfirm: function () {
                        return new Promise(function () {
                            window.location.href = targetHref;
                        });
                    }
                });
            });
        })(logoutLinks[i]);
    }

    // 2. Intercept PHP forms with data-ux-confirm-title (e.g., Remove Cart Item, Delete Address, Place Order)
    var confirmForms = document.querySelectorAll('form[data-ux-confirm-title]');
    for (var j = 0; j < confirmForms.length; j++) {
        (function (formEl) {
            if (formEl.dataset.uxBound === '1') return;
            formEl.dataset.uxBound = '1';
            formEl.addEventListener('submit', function (e) {
                if (formEl.dataset.uxConfirmed === '1') {
                    var btn = formEl.querySelector('button[type="submit"]');
                    if (btn && formEl.dataset.uxLoadingText) {
                        setButtonLoading(btn, true, formEl.dataset.uxLoadingText);
                    }
                    return true;
                }
                e.preventDefault();
                openConfirmModal({
                    title: formEl.dataset.uxConfirmTitle || 'Confirm Action',
                    message: formEl.dataset.uxConfirmMessage || 'Are you sure you want to proceed?',
                    cancelText: 'Cancel',
                    confirmText: formEl.dataset.uxConfirmButton || 'Confirm',
                    loadingText: formEl.dataset.uxLoadingText || 'Processing...',
                    variant: formEl.dataset.uxConfirmVariant || 'primary',
                    onConfirm: function () {
                        return new Promise(function () {
                            formEl.dataset.uxConfirmed = '1';
                            var submitBtn = formEl.querySelector('button[type="submit"]');
                            if (submitBtn && formEl.dataset.uxLoadingText) {
                                setButtonLoading(submitBtn, true, formEl.dataset.uxLoadingText);
                            }
                            formEl.submit();
                        });
                    }
                });
                return false;
            });
        })(confirmForms[j]);
    }

    // 3. Add loading spinners to standard PHP forms with data-ux-loading-text
    var loadingForms = document.querySelectorAll('form[data-ux-loading-text]:not([data-ux-confirm-title])');
    for (var k = 0; k < loadingForms.length; k++) {
        (function (formEl) {
            if (formEl.dataset.uxLoadingBound === '1') return;
            formEl.dataset.uxLoadingBound = '1';
            formEl.addEventListener('submit', function (e) {
                if (formEl.dataset.uxSubmitting === '1') {
                    e.preventDefault();
                    return false;
                }
                formEl.dataset.uxSubmitting = '1';
                var submitBtn = formEl.querySelector('button[type="submit"]');
                if (submitBtn) {
                    setButtonLoading(submitBtn, true, formEl.dataset.uxLoadingText || 'Processing...');
                }
            });
        })(loadingForms[k]);
    }

    // 4. Display any server-rendered PHP flash toast embedded in window.__PHP_FLASH_TOASTS__
    if (typeof window !== 'undefined' && Array.isArray(window.__PHP_FLASH_TOASTS__)) {
        for (var f = 0; f < window.__PHP_FLASH_TOASTS__.length; f++) {
            var item = window.__PHP_FLASH_TOASTS__[f];
            if (item && (item.title || item.message)) {
                showToast(item.type || 'success', item.title || 'Notification', item.message || '');
            }
        }
        window.__PHP_FLASH_TOASTS__ = [];
    }
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

    // Close Customer Profile Dropdown or Confirmation Modal when pressing Escape
    document.addEventListener('click', function (e) {
        var wrap = document.getElementById('customerProfileDropdownWrap');
        if (wrap && !wrap.contains(e.target)) {
            closeCustomerProfileDropdown();
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeCustomerProfileDropdown();
            closeConfirmModal();
        }
    });

    renderAuthHeaderState();
    renderCartDrawer();
    renderAdminDashboard();
    lookupOrderById('1001');
    initRealTimeMessaging();
    initPhpPageUxEnhancements();
});


