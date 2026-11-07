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

    // JSON API Bridge for index.html when running in XAMPP with MySQL (furniture_shop)
    case 'api_register':
    case 'api_login':
    case 'api_session':
    case 'api_logout':
        header('Content-Type: application/json; charset=utf-8');
        try {
            $rawInput = file_get_contents('php://input');
            $jsonBody = $rawInput ? (json_decode($rawInput, true) ?: []) : [];
            $data = array_merge($_POST, $jsonBody);
            $customerModel = new \App\Models\Customer();
            $adminModel = new \App\Models\Admin();

            $mapCustomers = function () use ($customerModel): array {
                $rows = $customerModel->getAllCustomers();
                return array_map(function ($r) {
                    return [
                        'id' => (int)$r['CustomerID'],
                        'fullName' => $r['FullName'],
                        'email' => $r['Email'],
                        'phone' => $r['PhoneNumber'],
                        'address' => $r['Address']
                    ];
                }, $rows);
            };

            if ($route === 'api_logout') {
                session_unset();
                echo json_encode(['status' => 'ok']);
                exit;
            }

            if ($route === 'api_session') {
                if (isset($_SESSION['admin_id'])) {
                    echo json_encode([
                        'status' => 'ok',
                        'customers' => $mapCustomers(),
                        'user' => [
                            'isLoggedIn' => true,
                            'id' => (int)$_SESSION['admin_id'],
                            'role' => 'admin',
                            'name' => 'Rowena & Lilia (Workshop Admin)',
                            'email' => $_SESSION['admin_email'] ?? 'admin@liliaandrowena.com',
                            'phone' => '0917-889-4211',
                            'address' => 'MacArthur Highway, San Fernando, Pampanga'
                        ]
                    ]);
                    exit;
                }
                if (isset($_SESSION['customer_id'])) {
                    echo json_encode([
                        'status' => 'ok',
                        'customers' => $mapCustomers(),
                        'user' => [
                            'isLoggedIn' => true,
                            'id' => (int)$_SESSION['customer_id'],
                            'role' => 'customer',
                            'name' => $_SESSION['customer_name'] ?? '',
                            'email' => $_SESSION['customer_email'] ?? '',
                            'phone' => $_SESSION['customer_phone'] ?? '',
                            'address' => $_SESSION['customer_address'] ?? ''
                        ]
                    ]);
                    exit;
                }
                echo json_encode(['status' => 'ok', 'customers' => $mapCustomers(), 'user' => null]);
                exit;
            }

            if ($route === 'api_register') {
                $fullName = trim((string)($data['fullName'] ?? $data['full_name'] ?? ''));
                $email = strtolower(trim((string)($data['email'] ?? '')));
                $password = (string)($data['password'] ?? '');
                $phone = trim((string)($data['phone'] ?? $data['phone_number'] ?? ''));
                $address = trim((string)($data['address'] ?? ''));

                if (!$fullName || !$email || !$password || !$phone || !$address) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'error' => 'All fields are required.']);
                    exit;
                }
                if ($customerModel->findByEmail($email)) {
                    http_response_code(409);
                    echo json_encode(['status' => 'error', 'error' => 'An account with this email address already exists.']);
                    exit;
                }

                $newId = $customerModel->register($fullName, $email, $password, $phone, $address);
                unset($_SESSION['admin_id'], $_SESSION['admin_email']);
                $_SESSION['customer_id'] = $newId;
                $_SESSION['customer_name'] = $fullName;
                $_SESSION['customer_email'] = $email;
                $_SESSION['customer_phone'] = $phone;
                $_SESSION['customer_address'] = $address;
                $_SESSION['user_role'] = 'customer';

                echo json_encode([
                    'status' => 'ok',
                    'customers' => $mapCustomers(),
                    'user' => [
                        'isLoggedIn' => true,
                        'id' => $newId,
                        'role' => 'customer',
                        'name' => $fullName,
                        'email' => $email,
                        'phone' => $phone,
                        'address' => $address
                    ]
                ]);
                exit;
            }

            if ($route === 'api_login') {
                $email = strtolower(trim((string)($data['email'] ?? '')));
                $password = (string)($data['password'] ?? '');
                $role = strtolower(trim((string)($data['role'] ?? $data['login_role'] ?? 'auto')));

                if ($role === 'admin' || $role === 'auto') {
                    $adm = $adminModel->authenticate($email, $password);
                    if ($adm) {
                        unset($_SESSION['customer_id'], $_SESSION['customer_name'], $_SESSION['customer_email'], $_SESSION['customer_phone'], $_SESSION['customer_address']);
                        $_SESSION['admin_id'] = (int)$adm['AdminID'];
                        $_SESSION['admin_email'] = $adm['Email'];
                        $_SESSION['user_role'] = 'admin';
                        echo json_encode([
                            'status' => 'ok',
                            'customers' => $mapCustomers(),
                            'user' => [
                                'isLoggedIn' => true,
                                'id' => (int)$adm['AdminID'],
                                'role' => 'admin',
                                'name' => 'Rowena & Lilia (Workshop Admin)',
                                'email' => $adm['Email'],
                                'phone' => '0917-889-4211',
                                'address' => 'MacArthur Highway, San Fernando, Pampanga'
                            ]
                        ]);
                        exit;
                    }
                }
                if ($role === 'customer' || $role === 'auto') {
                    $cust = $customerModel->authenticate($email, $password);
                    if ($cust) {
                        unset($_SESSION['admin_id'], $_SESSION['admin_email']);
                        $_SESSION['customer_id'] = (int)$cust['CustomerID'];
                        $_SESSION['customer_name'] = $cust['FullName'];
                        $_SESSION['customer_email'] = $cust['Email'];
                        $_SESSION['customer_phone'] = $cust['PhoneNumber'];
                        $_SESSION['customer_address'] = $cust['Address'];
                        $_SESSION['user_role'] = 'customer';
                        echo json_encode([
                            'status' => 'ok',
                            'customers' => $mapCustomers(),
                            'user' => [
                                'isLoggedIn' => true,
                                'id' => (int)$cust['CustomerID'],
                                'role' => 'customer',
                                'name' => $cust['FullName'],
                                'email' => $cust['Email'],
                                'phone' => $cust['PhoneNumber'],
                                'address' => $cust['Address']
                            ]
                        ]);
                        exit;
                    }
                }
                http_response_code(401);
                echo json_encode(['status' => 'error', 'error' => 'Invalid email or password.']);
                exit;
            }
        } catch (\Throwable $e) {
            http_response_code(503);
            echo json_encode(['status' => 'db_unavailable', 'error' => $e->getMessage()]);
            exit;
        }
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
