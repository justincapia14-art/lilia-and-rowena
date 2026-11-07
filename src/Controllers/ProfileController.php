<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Customer;
use App\Models\Message;
use App\Models\Order;
use App\Security\Csrf;

/**
 * ProfileController (PSR-4)
 * Handles Customer My Profile, My Addresses, My Orders, and Change Password
 * with strict session validation, CSRF protection, and anti-IDOR ownership checks.
 */
class ProfileController
{
    private Customer $customerModel;
    private Order $orderModel;
    private Message $messageModel;

    public function __construct()
    {
        $this->customerModel = new Customer();
        $this->orderModel    = new Order();
        $this->messageModel  = new Message();
    }

    private function requireCustomerSession(): int
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['customer_id']) || (int)$_SESSION['customer_id'] <= 0) {
            $_SESSION['auth_error'] = 'Please sign in to access your Customer Profile.';
            header('Location: index.php?route=login');
            exit;
        }
        return (int)$_SESSION['customer_id'];
    }

    public function showProfile(): void
    {
        $customerId = $this->requireCustomerSession();
        $customer   = $this->customerModel->findById($customerId);
        if (!$customer) {
            session_destroy();
            header('Location: index.php?route=login');
            exit;
        }

        $addresses   = $this->customerModel->getAddresses($customerId);
        $orders      = $this->orderModel->getOrdersByCustomer($customerId);
        $unreadCount = $this->messageModel->getUnreadCountForCustomer($customerId);
        $activeTab   = trim((string)($_GET['tab'] ?? 'profile'));
        if (!in_array($activeTab, ['profile', 'addresses', 'orders', 'password'], true)) {
            $activeTab = 'profile';
        }

        $editAddressId = isset($_GET['edit_address_id']) ? (int)$_GET['edit_address_id'] : 0;
        $editAddress   = null;
        if ($editAddressId > 0) {
            $editAddress = $this->customerModel->getAddressById($editAddressId, $customerId);
        }

        $csrfToken = Csrf::getToken();
        $success   = $_SESSION['profile_success'] ?? '';
        $error     = $_SESSION['profile_error'] ?? '';
        unset($_SESSION['profile_success'], $_SESSION['profile_error']);

        require __DIR__ . '/../../views/profile.php';
    }

    public function updateProfile(): void
    {
        $customerId = $this->requireCustomerSession();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?route=profile');
            exit;
        }

        if (!Csrf::verify($_POST['csrf_token'] ?? null)) {
            $_SESSION['profile_error'] = 'Invalid security token. Please try again.';
            header('Location: index.php?route=profile&tab=profile');
            exit;
        }

        $current = $this->customerModel->findById($customerId);
        if (!$current) {
            header('Location: index.php?route=login');
            exit;
        }

        $fullName       = trim((string)($_POST['full_name'] ?? ''));
        $username       = trim((string)($_POST['username'] ?? ''));
        $email          = trim((string)($_POST['email'] ?? ''));
        $phoneNumber    = trim((string)($_POST['phone_number'] ?? ''));
        $gender         = trim((string)($_POST['gender'] ?? 'Prefer not to say'));
        $birthday       = trim((string)($_POST['birthday'] ?? ''));
        $defaultAddress = trim((string)($_POST['default_address'] ?? ''));

        if ($fullName === '' || $email === '' || $phoneNumber === '') {
            $_SESSION['profile_error'] = 'Full Name, Email Address, and Mobile Number are required.';
            header('Location: index.php?route=profile&tab=profile&edit=1');
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $_SESSION['profile_error'] = 'Please enter a valid email address.';
            header('Location: index.php?route=profile&tab=profile&edit=1');
            exit;
        }

        $existingByEmail = $this->customerModel->findByEmail($email);
        if ($existingByEmail && (int)$existingByEmail['CustomerID'] !== $customerId) {
            $_SESSION['profile_error'] = 'That email address is already registered to another customer account.';
            header('Location: index.php?route=profile&tab=profile&edit=1');
            exit;
        }

        $profileImage = $current['ProfileImage'] ?? null;

        // Handle optional profile picture upload with strict MIME & size validation
        if (!empty($_FILES['profile_image']['name']) && (int)$_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
            $tmpPath  = $_FILES['profile_image']['tmp_name'];
            $fileSize = (int)$_FILES['profile_image']['size'];
            $maxSize  = 2 * 1024 * 1024; // 2MB

            if ($fileSize > $maxSize) {
                $_SESSION['profile_error'] = 'Profile image must be 2MB or smaller.';
                header('Location: index.php?route=profile&tab=profile&edit=1');
                exit;
            }

            $finfo    = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = (string)$finfo->file($tmpPath);
            $allowed  = [
                'image/jpeg' => 'jpg',
                'image/png'  => 'png',
                'image/webp' => 'webp',
            ];

            if (!isset($allowed[$mimeType])) {
                $_SESSION['profile_error'] = 'Only JPG, PNG, and WEBP image files are allowed.';
                header('Location: index.php?route=profile&tab=profile&edit=1');
                exit;
            }

            $uploadDir = __DIR__ . '/../../public/uploads/profiles';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $fileName = sprintf('customer_%d_%s.%s', $customerId, bin2hex(random_bytes(6)), $allowed[$mimeType]);
            $destPath = $uploadDir . '/' . $fileName;

            if (move_uploaded_file($tmpPath, $destPath)) {
                $profileImage = 'uploads/profiles/' . $fileName;
            }
        }

        $this->customerModel->updateProfile($customerId, [
            'full_name'       => $fullName,
            'username'        => $username,
            'email'           => $email,
            'phone_number'    => $phoneNumber,
            'gender'          => $gender,
            'birthday'        => $birthday !== '' ? $birthday : null,
            'default_address' => $defaultAddress,
            'profile_image'   => $profileImage,
        ]);

        $_SESSION['customer_name']    = $fullName;
        $_SESSION['customer_email']   = $email;
        $_SESSION['customer_phone']   = $phoneNumber;
        $_SESSION['customer_address'] = $defaultAddress;
        $_SESSION['profile_success']  = 'Your profile information has been updated.';

        header('Location: index.php?route=profile&tab=profile');
        exit;
    }

    public function saveAddress(): void
    {
        $customerId = $this->requireCustomerSession();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?route=profile&tab=addresses');
            exit;
        }

        if (!Csrf::verify($_POST['csrf_token'] ?? null)) {
            $_SESSION['profile_error'] = 'Invalid security token. Please try again.';
            header('Location: index.php?route=profile&tab=addresses');
            exit;
        }

        $addressId = isset($_POST['address_id']) && (int)$_POST['address_id'] > 0 ? (int)$_POST['address_id'] : null;

        $recipientName = trim((string)($_POST['recipient_name'] ?? ''));
        $phoneNumber   = trim((string)($_POST['phone_number'] ?? ''));
        $houseStreet   = trim((string)($_POST['house_street'] ?? ''));
        $barangay      = trim((string)($_POST['barangay'] ?? ''));
        $city          = trim((string)($_POST['city'] ?? ''));
        $province      = trim((string)($_POST['province'] ?? ''));
        $postalCode    = trim((string)($_POST['postal_code'] ?? ''));
        $deliveryNotes = trim((string)($_POST['delivery_notes'] ?? ''));
        $label         = trim((string)($_POST['address_label'] ?? 'Home'));
        $isDefault     = !empty($_POST['is_default']);

        if ($recipientName === '' || $phoneNumber === '' || $houseStreet === '' || $barangay === '' || $city === '' || $province === '' || $postalCode === '') {
            $_SESSION['profile_error'] = 'Please complete all required delivery address fields.';
            header('Location: index.php?route=profile&tab=addresses');
            exit;
        }

        $this->customerModel->saveAddress($customerId, [
            'recipient_name' => $recipientName,
            'phone_number'   => $phoneNumber,
            'house_street'   => $houseStreet,
            'barangay'       => $barangay,
            'city'           => $city,
            'province'       => $province,
            'postal_code'    => $postalCode,
            'delivery_notes' => $deliveryNotes,
            'address_label'  => $label,
            'is_default'     => $isDefault ? 1 : 0,
        ], $addressId);

        $_SESSION['profile_success'] = $addressId ? 'Delivery address updated.' : 'New delivery address added.';
        header('Location: index.php?route=profile&tab=addresses');
        exit;
    }

    public function setDefaultAddress(): void
    {
        $customerId = $this->requireCustomerSession();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?route=profile&tab=addresses');
            exit;
        }

        if (!Csrf::verify($_POST['csrf_token'] ?? null)) {
            $_SESSION['profile_error'] = 'Invalid security token.';
            header('Location: index.php?route=profile&tab=addresses');
            exit;
        }

        $addressId = (int)($_POST['address_id'] ?? 0);

        if ($addressId > 0 && $this->customerModel->setDefaultAddress($addressId, $customerId)) {
            $_SESSION['profile_success'] = 'Default delivery address updated.';
        } else {
            $_SESSION['profile_error'] = 'Unable to update default address.';
        }

        header('Location: index.php?route=profile&tab=addresses');
        exit;
    }

    public function deleteAddress(): void
    {
        $customerId = $this->requireCustomerSession();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?route=profile&tab=addresses');
            exit;
        }

        if (!Csrf::verify($_POST['csrf_token'] ?? null)) {
            $_SESSION['profile_error'] = 'Invalid security token.';
            header('Location: index.php?route=profile&tab=addresses');
            exit;
        }

        $addressId = (int)($_POST['address_id'] ?? 0);

        if ($addressId > 0 && $this->customerModel->deleteAddress($addressId, $customerId)) {
            $_SESSION['profile_success'] = 'Delivery address removed.';
        } else {
            $_SESSION['profile_error'] = 'Unable to delete address.';
        }

        header('Location: index.php?route=profile&tab=addresses');
        exit;
    }

    public function changePassword(): void
    {
        $customerId = $this->requireCustomerSession();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?route=profile&tab=password');
            exit;
        }

        if (!Csrf::verify($_POST['csrf_token'] ?? null)) {
            $_SESSION['profile_error'] = 'Invalid security token.';
            header('Location: index.php?route=profile&tab=password');
            exit;
        }

        $currentPassword = (string)($_POST['current_password'] ?? '');
        $newPassword     = (string)($_POST['new_password'] ?? '');
        $confirmPassword = (string)($_POST['confirm_password'] ?? '');

        if ($currentPassword === '' || $newPassword === '' || $confirmPassword === '') {
            $_SESSION['profile_error'] = 'All password fields are required.';
            header('Location: index.php?route=profile&tab=password');
            exit;
        }

        if (strlen($newPassword) < 6) {
            $_SESSION['profile_error'] = 'New password must be at least 6 characters long.';
            header('Location: index.php?route=profile&tab=password');
            exit;
        }

        if ($newPassword !== $confirmPassword) {
            $_SESSION['profile_error'] = 'New password and confirmation do not match.';
            header('Location: index.php?route=profile&tab=password');
            exit;
        }

        $updated = $this->customerModel->changePassword($customerId, $currentPassword, $newPassword);
        if (!$updated) {
            $_SESSION['profile_error'] = 'Your current password is incorrect.';
            header('Location: index.php?route=profile&tab=password');
            exit;
        }

        $_SESSION['profile_success'] = 'Your password has been securely updated.';
        header('Location: index.php?route=profile&tab=password');
        exit;
    }
}
