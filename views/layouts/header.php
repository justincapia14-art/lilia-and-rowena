<?php
$cartCount = 0;
if (!empty($_SESSION['cart'])) {
    foreach ($_SESSION['cart'] as $item) {
        $cartCount += $item['quantity'];
    }
}
$isCustomerLoggedIn = isset($_SESSION['customer_id']) && (int)$_SESSION['customer_id'] > 0;
$isAdminLoggedIn = isset($_SESSION['admin_id']) && (int)$_SESSION['admin_id'] > 0;
$customerName = $_SESSION['customer_name'] ?? 'Customer';
$adminEmail = $_SESSION['admin_email'] ?? 'Admin';
$currentRoute = $_GET['route'] ?? ($_GET['action'] ?? 'home');

// Compute accurate unread message count from database (never counting own messages)
$headerUnreadCount = 0;
try {
    if ($isCustomerLoggedIn && class_exists('\App\Models\Message')) {
        $msgModelHeader = new \App\Models\Message();
        $headerUnreadCount = $msgModelHeader->getUnreadCountForCustomer((int)$_SESSION['customer_id']);
    } elseif ($isAdminLoggedIn && class_exists('\App\Models\Message')) {
        $msgModelHeader = new \App\Models\Message();
        $headerUnreadCount = $msgModelHeader->getUnreadCountForAdmin();
    }
} catch (\Throwable $e) {
    $headerUnreadCount = 0;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lilia &amp; Rowena Furniture | Handcrafted Fine Furniture</title>
    <link rel="stylesheet" href="css/style.css?v=20261107_v5">
    <link rel="stylesheet" href="public/css/style.css?v=20261107_v5">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>

<!-- TOP NOTIFICATION BANNER -->
<div class="top-announcement">
    <strong>Solid Wood Guarantee</strong>
    <span class="sep">·</span>
    <span>100% Kiln-Dried Mahogany &amp; Teak</span>
    <span class="sep">·</span>
    <span>Free White-Glove Metro Delivery for Orders ₱15,000+</span>
</div>

<!-- 3-ZONE NAVIGATION HEADER -->
<header class="main-header">
    <div class="header-container">
        <!-- Zone 1: Brand Wordmark -->
        <a href="index.php?route=home" class="brand-logo">
            <span class="brand-title">LILIA &amp; ROWENA</span>
            <span class="brand-tagline">Handcrafted Fine Furniture</span>
        </a>

        <!-- Zone 2: Main Navigation Links (Separate Messages button removed from customer topbar) -->
        <nav class="nav-links">
            <a href="index.php?route=home" class="<?= $currentRoute === 'home' ? 'active' : '' ?>">Home</a>
            <a href="index.php?route=catalog" class="<?= $currentRoute === 'catalog' ? 'active' : '' ?>">Furniture Catalog</a>
            <a href="index.php?route=home#services">Custom Carpentry</a>
            <a href="index.php?route=home#benefits">Why Choose Us</a>
            <a href="index.php?route=track" class="<?= $currentRoute === 'track' ? 'active' : '' ?>">Track Order</a>
            <?php if ($isAdminLoggedIn): ?>
                <a href="index.php?route=admin_dashboard" style="color: #0284c7; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem;">
                    <span>Order Management</span>
                    <?php if ($headerUnreadCount > 0): ?>
                        <span class="unread-red-badge"><?= (int)$headerUnreadCount ?></span>
                    <?php endif; ?>
                </a>
            <?php endif; ?>
        </nav>

        <!-- Zone 3: Actions: Customer Profile Dropdown / Admin / Cart -->
        <div class="header-actions">
            <?php if ($isAdminLoggedIn): ?>
                <div class="user-greeting">
                    <a href="index.php?route=admin_dashboard" class="btn-sm-soft">
                        Admin: <?= htmlspecialchars(explode('@', $adminEmail)[0]) ?>
                        <?php if ($headerUnreadCount > 0): ?>
                            <span class="unread-red-badge" style="margin-left: 0.35rem;"><?= (int)$headerUnreadCount ?></span>
                        <?php endif; ?>
                    </a>
                    <a href="index.php?route=logout" class="btn-link-sm" style="color: #dc2626; font-weight: 700;">Logout</a>
                </div>
            <?php elseif ($isCustomerLoggedIn): ?>
                <!-- Customer Profile Dropdown (Matches attached reference image) -->
                <div class="customer-profile-dropdown-wrap" id="phpCustomerProfileDropdown">
                    <button type="button"
                            class="customer-profile-trigger"
                            id="phpCustomerProfileBtn"
                            aria-haspopup="true"
                            aria-expanded="false"
                            onclick="var m=document.getElementById('phpCustomerProfileMenu'); var open=m.classList.toggle('open'); this.setAttribute('aria-expanded', open ? 'true' : 'false');">
                        <span class="profile-trigger-avatar" aria-hidden="true"><?= htmlspecialchars(strtoupper(substr((string)$customerName, 0, 1) ?: 'M')) ?></span>
                        <span class="profile-trigger-label">My Account</span>
                        <?php if ($headerUnreadCount > 0): ?>
                            <span class="unread-red-badge" title="<?= (int)$headerUnreadCount ?> unread message(s)"><?= (int)$headerUnreadCount ?></span>
                        <?php endif; ?>
                        <span class="profile-trigger-chevron" aria-hidden="true">▾</span>
                    </button>

                    <div class="customer-profile-menu" id="phpCustomerProfileMenu" role="menu" aria-label="My Account Menu">
                        <div class="customer-profile-menu-head">
                            <strong><?= htmlspecialchars($customerName) ?></strong>
                            <span>Customer Account</span>
                        </div>
                        <a href="index.php?route=profile&amp;tab=profile" class="customer-profile-item" role="menuitem">
                            <span>My Profile</span>
                        </a>
                        <a href="index.php?route=profile&amp;tab=addresses" class="customer-profile-item" role="menuitem">
                            <span>My Addresses</span>
                        </a>
                        <a href="index.php?route=profile&amp;tab=orders" class="customer-profile-item" role="menuitem">
                            <span>My Orders</span>
                        </a>
                        <a href="index.php?route=messages" class="customer-profile-item" role="menuitem">
                            <span>Messages</span>
                            <?php if ($headerUnreadCount > 0): ?>
                                <span class="unread-red-badge" style="margin-left: auto;"><?= (int)$headerUnreadCount ?></span>
                            <?php endif; ?>
                        </a>
                        <a href="index.php?route=profile&amp;tab=password" class="customer-profile-item" role="menuitem">
                            <span>Change Password</span>
                        </a>
                        <div class="customer-profile-divider"></div>
                        <a href="index.php?route=logout" class="customer-profile-item cp-logout" role="menuitem">
                            <span>Logout</span>
                        </a>
                    </div>
                </div>
                <script>
                document.addEventListener('click', function(ev) {
                    var wrap = document.getElementById('phpCustomerProfileDropdown');
                    var menu = document.getElementById('phpCustomerProfileMenu');
                    var btn = document.getElementById('phpCustomerProfileBtn');
                    if (wrap && menu && !wrap.contains(ev.target)) {
                        menu.classList.remove('open');
                        if (btn) btn.setAttribute('aria-expanded', 'false');
                    }
                });
                document.addEventListener('keydown', function(ev) {
                    if (ev.key === 'Escape') {
                        var menu = document.getElementById('phpCustomerProfileMenu');
                        var btn = document.getElementById('phpCustomerProfileBtn');
                        if (menu) menu.classList.remove('open');
                        if (btn) btn.setAttribute('aria-expanded', 'false');
                    }
                });
                </script>
            <?php else: ?>
                <a href="index.php?route=login" class="btn-sm-soft">Sign In / Admin</a>
            <?php endif; ?>

            <a href="index.php?route=cart" class="cart-btn" aria-label="Shopping Cart">
                <span>Cart</span>
                <span class="cart-badge" id="headerCartCount"><?= $cartCount ?></span>
            </a>
        </div>
    </div>
</header>

<main class="page-content">
