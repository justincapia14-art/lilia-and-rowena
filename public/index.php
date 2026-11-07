<?php
/**
 * Lilia and Rowena Furniture Shop Management and E-Commerce System
 * Front Controller & PSR-4 Router
 */

session_start();

// 1. PSR-4 Autoloading Setup
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
} else {
    spl_autoload_register(function ($class) {
        $prefix = 'App\\';
        $base_dir = __DIR__ . '/../src/';

        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }

        $relative_class = substr($class, $len);
        $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

        if (file_exists($file)) {
            require $file;
        }
    });
}

use App\Controllers\HomeController;
use App\Controllers\AuthController;
use App\Controllers\CartController;
use App\Controllers\OrderController;
use App\Controllers\AdminController;
use App\Controllers\MessageController;

// 2. Simple Routing Mechanism
$route = $_GET['route'] ?? 'home';

switch ($route) {
    case 'home':
        (new HomeController())->index();
        break;

    case 'catalog':
        (new HomeController())->catalog();
        break;

    case 'product':
        (new HomeController())->productDetail();
        break;

    // Authentication (Customer & Admin Login, Register, Logout)
    case 'login':
        (new AuthController())->showLogin();
        break;

    case 'do_login':
        (new AuthController())->handleLogin();
        break;

    case 'register':
        (new AuthController())->showRegister();
        break;

    case 'do_register':
        (new AuthController())->handleRegister();
        break;

    case 'logout':
        (new AuthController())->logout();
        break;

    // Admin Dashboard (Maps to Admin table & connected tables)
    case 'admin_dashboard':
        (new AdminController())->dashboard();
        break;

    case 'admin_update_order':
        (new AdminController())->updateOrderStatus();
        break;

    // Real-Time Customer-Admin Messaging (Order Follow-Ups & Custom Add-Ons)
    case 'messages':
        (new MessageController())->index();
        break;

    case 'messages_poll':
        (new MessageController())->poll();
        break;

    case 'messages_send':
        (new MessageController())->send();
        break;

    case 'messages_update':
        (new MessageController())->update();
        break;

    case 'messages_delete':
        (new MessageController())->delete();
        break;

    // Shopping Cart
    case 'cart':
        (new CartController())->index();
        break;

    case 'cart_add':
        (new CartController())->add();
        break;

    case 'cart_update':
        (new CartController())->update();
        break;

    case 'cart_remove':
        (new CartController())->remove();
        break;

    // Checkout & Order Tracking
    case 'checkout':
        (new OrderController())->checkout();
        break;

    case 'place_order':
        (new OrderController())->placeOrder();
        break;

    case 'order_success':
        (new OrderController())->orderSuccess();
        break;

    case 'track':
        (new OrderController())->track();
        break;

    default:
        header("HTTP/1.0 404 Not Found");
        echo "<h1>404 - Page Not Found</h1><p><a href='index.php'>Return to Homepage</a></p>";
        break;
}
