<?php
namespace App\Controllers;

use App\Models\Customer;
use App\Models\Admin;

class AuthController
{
    private Customer $customerModel;
    private Admin $adminModel;

    public function __construct()
    {
        $this->customerModel = new Customer();
        $this->adminModel = new Admin();
    }

    /**
     * Show Login Form (Supports both Customer and Admin login)
     */
    public function showLogin(): void
    {
        if (isset($_SESSION['admin_id'])) {
            header('Location: index.php?route=admin_dashboard');
            exit;
        }
        if (isset($_SESSION['customer_id'])) {
            header('Location: index.php?route=home');
            exit;
        }

        $error = $_SESSION['auth_error'] ?? null;
        unset($_SESSION['auth_error']);

        require __DIR__ . '/../../views/layouts/header.php';
        require __DIR__ . '/../../views/login.php';
        require __DIR__ . '/../../views/layouts/footer.php';
    }

    /**
     * Process Login Submission (Checks Admin table first or Customer table)
     */
    public function handleLogin(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?route=login');
            exit;
        }

        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $loginRole = $_POST['login_role'] ?? 'auto';

        if (empty($email) || empty($password)) {
            $_SESSION['auth_error'] = 'Please enter both your email address and password.';
            header('Location: index.php?route=login');
            exit;
        }

        // 1. Check Admin Table (if role is admin or auto)
        if ($loginRole === 'admin' || $loginRole === 'auto') {
            $admin = $this->adminModel->authenticate($email, $password);
            if ($admin) {
                if (session_status() === PHP_SESSION_ACTIVE) {
                    session_regenerate_id(true);
                }
                unset($_SESSION['customer_id'], $_SESSION['customer_name'], $_SESSION['customer_email'], $_SESSION['customer_phone'], $_SESSION['customer_address']);
                $_SESSION['admin_id'] = (int)$admin['AdminID'];
                $_SESSION['admin_email'] = $admin['Email'];
                $_SESSION['user_role'] = 'admin';
                $_SESSION['flash_toast'] = [
                    'type' => 'success',
                    'title' => 'Login Successful!',
                    'message' => 'Welcome back to Lilia & Rowena Order Management.'
                ];
                header('Location: index.php?route=admin_dashboard');
                exit;
            }
        }

        // 2. Check Customer Table (if role is customer or auto)
        if ($loginRole === 'customer' || $loginRole === 'auto') {
            $customer = $this->customerModel->authenticate($email, $password);
            if ($customer) {
                if (session_status() === PHP_SESSION_ACTIVE) {
                    session_regenerate_id(true);
                }
                unset($_SESSION['admin_id'], $_SESSION['admin_email']);
                $_SESSION['customer_id'] = (int)$customer['CustomerID'];
                $_SESSION['customer_name'] = $customer['FullName'];
                $_SESSION['customer_email'] = $customer['Email'];
                $_SESSION['customer_phone'] = $customer['PhoneNumber'];
                $_SESSION['customer_address'] = $customer['Address'];
                $_SESSION['user_role'] = 'customer';
                $_SESSION['flash_toast'] = [
                    'type' => 'success',
                    'title' => 'Login Successful!',
                    'message' => 'Welcome back, ' . $customer['FullName'] . '.'
                ];

                $redirect = $_SESSION['redirect_after_login'] ?? 'index.php?route=home';
                unset($_SESSION['redirect_after_login']);
                header("Location: $redirect");
                exit;
            }
        }

        $_SESSION['auth_error'] = 'Invalid Email or Password. Please check your credentials and try again.';
        $_SESSION['flash_toast'] = [
            'type' => 'error',
            'title' => 'Invalid Email or Password.',
            'message' => 'Please verify your email address and password.'
        ];
        header('Location: index.php?route=login');
        exit;
    }

    /**
     * Show Customer Registration Form
     */
    public function showRegister(): void
    {
        $error = $_SESSION['register_error'] ?? null;
        unset($_SESSION['register_error']);

        require __DIR__ . '/../../views/layouts/header.php';
        require __DIR__ . '/../../views/register.php';
        require __DIR__ . '/../../views/layouts/footer.php';
    }

    /**
     * Process Customer Registration
     */
    public function handleRegister(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?route=register');
            exit;
        }

        $fullName    = trim($_POST['full_name'] ?? '');
        $email       = trim($_POST['email'] ?? '');
        $password    = $_POST['password'] ?? '';
        $phoneNumber = trim($_POST['phone_number'] ?? '');
        $address     = trim($_POST['address'] ?? '');

        if (empty($fullName) || empty($email) || empty($password) || empty($phoneNumber) || empty($address)) {
            $_SESSION['register_error'] = 'Please Complete All Required Fields.';
            $_SESSION['flash_toast'] = [
                'type' => 'error',
                'title' => 'Please Complete All Required Fields.',
                'message' => 'All fields are required to register your account.'
            ];
            header('Location: index.php?route=register');
            exit;
        }

        if ($this->customerModel->findByEmail($email)) {
            $_SESSION['register_error'] = 'An account with this email address already exists. Please log in.';
            $_SESSION['flash_toast'] = [
                'type' => 'error',
                'title' => 'Unable to Save Changes. Please Try Again.',
                'message' => 'An account with this email address already exists.'
            ];
            header('Location: index.php?route=register');
            exit;
        }

        $customerId = $this->customerModel->register($fullName, $email, $password, $phoneNumber, $address);

        unset($_SESSION['admin_id'], $_SESSION['admin_email']);
        $_SESSION['customer_id'] = $customerId;
        $_SESSION['customer_name'] = $fullName;
        $_SESSION['customer_email'] = $email;
        $_SESSION['customer_phone'] = $phoneNumber;
        $_SESSION['customer_address'] = $address;
        $_SESSION['user_role'] = 'customer';
        $_SESSION['flash_toast'] = [
            'type' => 'success',
            'title' => 'Account Created Successfully!',
            'message' => 'Welcome to Lilia & Rowena Furniture, ' . $fullName . '.'
        ];

        header('Location: index.php?route=home');
        exit;
    }

    /**
     * Logout Customer or Admin
     */
    public function logout(): void
    {
        unset(
            $_SESSION['customer_id'],
            $_SESSION['customer_name'],
            $_SESSION['customer_email'],
            $_SESSION['customer_phone'],
            $_SESSION['customer_address'],
            $_SESSION['admin_id'],
            $_SESSION['admin_email'],
            $_SESSION['user_role']
        );
        $_SESSION['flash_toast'] = [
            'type' => 'success',
            'title' => 'Logged Out',
            'message' => 'You have been logged out successfully.'
        ];
        header('Location: index.php?route=home');
        exit;
    }
}
