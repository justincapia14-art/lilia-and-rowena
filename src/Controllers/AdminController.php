<?php
namespace App\Controllers;

use App\Models\Admin;
use App\Models\Product;
use App\Models\Category;
use App\Models\Message;

class AdminController
{
    private Admin $adminModel;
    private Product $productModel;
    private Category $categoryModel;
    private Message $messageModel;

    public function __construct()
    {
        // Enforce strict server-side role check: deny Customer accounts with HTTP 403 Forbidden
        if (!isset($_SESSION['admin_id']) || (int)$_SESSION['admin_id'] <= 0 || ($_SESSION['user_role'] ?? 'admin') !== 'admin') {
            if (isset($_SESSION['customer_id'])) {
                http_response_code(403);
                echo "<h1>403 Forbidden</h1><p>Access denied: Customer accounts cannot access the Admin Console or other customers' conversations.</p>";
                exit;
            }
            header('Location: index.php?route=login');
            exit;
        }

        $this->adminModel = new Admin();
        $this->productModel = new Product();
        $this->categoryModel = new Category();
        $this->messageModel = new Message();
    }

    /**
     * Render the Admin Dashboard (Orders, Separate Customer Conversations, Products, Categories, Materials, Employees, Suppliers)
     */
    public function dashboard(): void
    {
        $orders = $this->adminModel->getAllOrders();
        $products = $this->productModel->getAll();
        $categories = $this->categoryModel->getAll();
        $materials = $this->adminModel->getAllMaterials();
        $employees = $this->adminModel->getAllEmployees();
        $suppliers = $this->adminModel->getAllSuppliers();

        // Separate 1-on-1 conversations per Customer
        $conversations = $this->messageModel->getCustomerConversations();
        $defaultCustomerId = !empty($conversations) ? (int)$conversations[0]['CustomerID'] : 1;
        $requestedCustomerId = isset($_GET['customer_id']) ? (int)$_GET['customer_id'] : $defaultCustomerId;
        $selectedCustomerId = $this->messageModel->customerExists($requestedCustomerId) ? $requestedCustomerId : $defaultCustomerId;
        $messages = $this->messageModel->getMessagesByCustomer($selectedCustomerId);

        $adminMessage = $_SESSION['admin_message'] ?? null;
        unset($_SESSION['admin_message']);

        require __DIR__ . '/../../views/layouts/header.php';
        require __DIR__ . '/../../views/admin_dashboard.php';
        require __DIR__ . '/../../views/layouts/footer.php';
    }

    /**
     * Update Customer_Order Status from Admin Dashboard
     */
    public function updateOrderStatus(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $orderId = (int)($_POST['order_id'] ?? 0);
            $status = trim($_POST['status'] ?? '');

            if ($orderId > 0 && $this->adminModel->updateOrderStatus($orderId, $status)) {
                $_SESSION['admin_message'] = "Order #{$orderId} status updated to '{$status}'.";
            }
        }
        header('Location: index.php?route=admin_dashboard');
        exit;
    }
}
