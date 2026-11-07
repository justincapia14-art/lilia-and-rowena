<?php
$cartCount = 0;
if (!empty($_SESSION['cart'])) {
    foreach ($_SESSION['cart'] as $item) {
        $cartCount += $item['quantity'];
    }
}
$isCustomerLoggedIn = isset($_SESSION['customer_id']);
$isAdminLoggedIn = isset($_SESSION['admin_id']);
$customerName = $_SESSION['customer_name'] ?? 'Customer';
$adminEmail = $_SESSION['admin_email'] ?? 'Admin';
$currentRoute = $_GET['route'] ?? 'home';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lilia &amp; Rowena Furniture | Handcrafted Fine Furniture</title>
    <link rel="stylesheet" href="css/style.css">
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

        <!-- Zone 2: Main Navigation Links -->
        <nav class="nav-links">
            <a href="index.php?route=home" class="<?= $currentRoute === 'home' ? 'active' : '' ?>">Home</a>
            <a href="index.php?route=catalog" class="<?= $currentRoute === 'catalog' ? 'active' : '' ?>">Furniture Catalog</a>
            <a href="index.php?route=home#services">Custom Carpentry</a>
            <a href="index.php?route=home#benefits">Why Choose Us</a>
            <a href="index.php?route=track" class="<?= $currentRoute === 'track' ? 'active' : '' ?>">Track Order</a>
            <a href="index.php?route=messages" class="<?= $currentRoute === 'messages' ? 'active' : '' ?>" style="color: #0284c7; font-weight: 700;">💬 Message Admin</a>
            <?php if ($isAdminLoggedIn): ?>
                <a href="index.php?route=admin_dashboard" style="color: #0284c7; font-weight: 700;">🔑 Admin Panel</a>
            <?php endif; ?>
        </nav>

        <!-- Zone 3: Actions: Account (Customer / Admin / Logout) + Cart -->
        <div class="header-actions">
            <?php if ($isAdminLoggedIn): ?>
                <div class="user-greeting">
                    <a href="index.php?route=admin_dashboard" class="btn-sm-soft">Admin: <?= htmlspecialchars(explode('@', $adminEmail)[0]) ?></a>
                    <a href="index.php?route=logout" class="btn-link-sm" style="color: #dc2626; font-weight: 700;">Logout</a>
                </div>
            <?php elseif ($isCustomerLoggedIn): ?>
                <div class="user-greeting">
                    <span>Hello, <?= htmlspecialchars(explode(' ', $customerName)[0]) ?></span>
                    <a href="index.php?route=logout" class="btn-link-sm" style="color: #dc2626; font-weight: 700;">Logout</a>
                </div>
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
