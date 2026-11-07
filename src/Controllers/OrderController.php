<?php
namespace App\Controllers;

use App\Models\Order;
use App\Models\Customer;
use Exception;

class OrderController
{
    private Order $orderModel;
    private Customer $customerModel;

    public function __construct()
    {
        $this->orderModel = new Order();
        $this->customerModel = new Customer();
    }

    /**
     * Show Checkout Form
     */
    public function checkout(): void
    {
        if (empty($_SESSION['cart'])) {
            header('Location: index.php?route=cart');
            exit;
        }

        // Customer details and saved addresses if logged in
        $customer = null;
        $savedAddresses = [];
        if (isset($_SESSION['customer_id'])) {
            $customerId = (int)$_SESSION['customer_id'];
            $customer = $this->customerModel->findById($customerId);
            $savedAddresses = $this->customerModel->getAddresses($customerId);
        }

        $cartItems = $_SESSION['cart'];
        $subtotal = 0;
        foreach ($cartItems as $item) {
            $price = $item['basePrice'] + ($item['extraCost'] ?? 0);
            $subtotal += ($price * $item['quantity']);
        }
        $shippingFee = ($subtotal >= 15000) ? 0 : 850;
        $grandTotal = $subtotal + $shippingFee;
        $requiredDownpayment = round($grandTotal * 0.5, 2);

        $error = $_SESSION['checkout_error'] ?? null;
        unset($_SESSION['checkout_error']);

        require __DIR__ . '/../../views/layouts/header.php';
        require __DIR__ . '/../../views/checkout.php';
        require __DIR__ . '/../../views/layouts/footer.php';
    }

    /**
     * Process checkout and save to database
     */
    public function placeOrder(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?route=checkout');
            exit;
        }

        if (empty($_SESSION['cart'])) {
            header('Location: index.php?route=cart');
            exit;
        }

        $fullName    = trim($_POST['full_name'] ?? '');
        $email       = trim($_POST['email'] ?? '');
        $phoneNumber = trim($_POST['phone_number'] ?? '');
        $address     = trim($_POST['address'] ?? '');

        if (empty($fullName) || empty($email) || empty($phoneNumber) || empty($address)) {
            $_SESSION['checkout_error'] = 'Please fill in all recipient and delivery details.';
            header('Location: index.php?route=checkout');
            exit;
        }

        try {
            // Find or create customer
            $customerId = null;
            if (isset($_SESSION['customer_id'])) {
                $customerId = (int)$_SESSION['customer_id'];
            } else {
                $existing = $this->customerModel->findByEmail($email);
                if ($existing) {
                    $customerId = (int)$existing['CustomerID'];
                } else {
                    // Create guest customer with a default password
                    $defaultPassword = bin2hex(random_bytes(6));
                    $customerId = $this->customerModel->register($fullName, $email, $defaultPassword, $phoneNumber, $address);
                }
            }

            // Prepare items array
            $items = [];
            foreach ($_SESSION['cart'] as $item) {
                $items[] = [
                    'productId'     => $item['productId'],
                    'basePrice'     => $item['basePrice'],
                    'extraCost'     => $item['extraCost'],
                    'quantity'      => $item['quantity'],
                    'customization' => $item['customization'] ?? null,
                ];
            }

            // Execute transaction via Order model
            $orderId = $this->orderModel->placeOrder([
                'customerId'      => $customerId,
                'receiverName'    => $fullName,
                'deliveryAddress' => $address,
                'items'           => $items,
            ]);

            // Clear session cart
            $_SESSION['cart'] = [];
            $_SESSION['recent_order_id'] = $orderId;

            header("Location: index.php?route=order_success&id={$orderId}");
            exit;
        } catch (Exception $e) {
            $_SESSION['checkout_error'] = 'Error placing order: ' . $e->getMessage();
            header('Location: index.php?route=checkout');
            exit;
        }
    }

    /**
     * Show Order Success Screen
     */
    public function orderSuccess(): void
    {
        $orderId = (int)($_GET['id'] ?? 0);
        $order = $this->orderModel->getOrderDetails($orderId);

        if (!$order) {
            header('Location: index.php?route=home');
            exit;
        }

        require __DIR__ . '/../../views/layouts/header.php';
        require __DIR__ . '/../../views/order_success.php';
        require __DIR__ . '/../../views/layouts/footer.php';
    }

    /**
     * Track Order Page
     */
    public function track(): void
    {
        $orderId = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;
        $order = null;

        if ($orderId > 0) {
            $order = $this->orderModel->getOrderDetails($orderId);
        }

        require __DIR__ . '/../../views/layouts/header.php';
        require __DIR__ . '/../../views/track_order.php';
        require __DIR__ . '/../../views/layouts/footer.php';
    }
}
