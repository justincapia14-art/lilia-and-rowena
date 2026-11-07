<?php
namespace App\Controllers;

use App\Models\Admin;
use App\Models\JobOrder;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\Message;
use App\Security\Csrf;

class AdminController
{
    private Admin $adminModel;
    private JobOrder $jobOrderModel;
    private Order $orderModel;
    private Product $productModel;
    private Category $categoryModel;
    private Message $messageModel;

    public function __construct()
    {
        date_default_timezone_set('Asia/Manila');

        // Enforce strict server-side role check: deny Customer accounts with HTTP 403 Forbidden
        // and redirect unauthenticated visitors to the login page.
        if (!isset($_SESSION['admin_id']) || (int)$_SESSION['admin_id'] <= 0 || ($_SESSION['user_role'] ?? 'admin') !== 'admin') {
            if (isset($_SESSION['customer_id'])) {
                http_response_code(403);
                require __DIR__ . '/../../views/layouts/header.php';
                require __DIR__ . '/../../views/admin_access_denied.php';
                require __DIR__ . '/../../views/layouts/footer.php';
                exit;
            }
            $_SESSION['auth_error'] = 'Administrator login required to access Job Orders & Deadline Management.';
            header('Location: index.php?route=login');
            exit;
        }

        $this->adminModel = new Admin();
        $this->jobOrderModel = new JobOrder();
        $this->orderModel = new Order();
        $this->productModel = new Product();
        $this->categoryModel = new Category();
        $this->messageModel = new Message();
    }

    /**
     * Render the Admin Dashboard with Job Orders Tracking, Deadline Today, Summary Cards,
     * Separate Customer Conversations, Products, Materials, Employees, and Suppliers.
     */
    public function dashboard(): void
    {
        $activeTab = strtolower(trim((string)($_GET['tab'] ?? 'deadline_today')));
        $allowedTabs = ['deadline_today', 'orders_today', 'overdue', 'active', 'unpaid', 'all'];
        if (!in_array($activeTab, $allowedTabs, true)) {
            $activeTab = 'deadline_today';
        }

        $filters = [
            'tab'             => $activeTab,
            'search'          => trim((string)($_GET['search'] ?? '')),
            'status'          => trim((string)($_GET['status'] ?? 'ALL')),
            'priority'        => trim((string)($_GET['priority'] ?? 'ALL')),
            'deadline_filter' => trim((string)($_GET['deadline_filter'] ?? 'ALL')),
            'sort'            => trim((string)($_GET['sort'] ?? 'deadline_asc'))
        ];

        $summaryCounts = $this->jobOrderModel->getSummaryCounts();
        $jobOrders = $this->jobOrderModel->getJobOrders($filters);

        // If viewing a specific Job Order detail modal/panel inside Order Management
        $viewOrderDetail = null;
        $orderMessages = [];
        if (!empty($_GET['view_order_id'])) {
            $viewOrderDetail = $this->orderModel->getOrderDetails((int)$_GET['view_order_id']);
            if ($viewOrderDetail && !empty($viewOrderDetail['CustomerID'])) {
                $orderCustId = (int)$viewOrderDetail['CustomerID'];
                $this->messageModel->markReadForAdmin($orderCustId);
                $orderMessages = $this->messageModel->getMessagesByCustomer($orderCustId);
            }
        }

        $orders = $this->adminModel->getAllOrders();
        $products = $this->productModel->getAll();
        $categories = $this->categoryModel->getAll();
        $materials = $this->adminModel->getAllMaterials();
        $employees = $this->adminModel->getAllEmployees();
        $suppliers = $this->adminModel->getAllSuppliers();

        // Unread counts per customer for Order Management indicators & Customer Messages section
        $selectedCustomerId = isset($_GET['customer_id']) ? (int)$_GET['customer_id'] : 1;
        if ($selectedCustomerId <= 0) {
            $selectedCustomerId = 1;
        }
        if (isset($_GET['customer_id'])) {
            $this->messageModel->markReadForAdmin($selectedCustomerId);
        }
        $conversations = $this->messageModel->getCustomerConversations();
        $messages = $this->messageModel->getMessagesByCustomer($selectedCustomerId);
        $unreadByCustomer = [];
        foreach ($conversations as $conv) {
            $unreadByCustomer[(int)$conv['CustomerID']] = (int)($conv['UnreadCount'] ?? 0);
        }
        $totalAdminUnread = $this->messageModel->getUnreadCountForAdmin();

        $csrfToken = Csrf::getToken();
        $adminMessage = $_SESSION['admin_message'] ?? null;
        $adminError = $_SESSION['admin_error'] ?? null;
        unset($_SESSION['admin_message'], $_SESSION['admin_error']);

        require __DIR__ . '/../../views/layouts/header.php';
        require __DIR__ . '/../../views/admin_dashboard.php';
        require __DIR__ . '/../../views/layouts/footer.php';
    }

    /**
     * Update Job Order Status, Deadline, Priority, and Assigned Staff (with CSRF protection)
     */
    public function updateOrderStatus(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?route=admin_dashboard');
            exit;
        }

        $submittedToken = $_POST['csrf_token'] ?? null;
        if (!Csrf::verify($submittedToken)) {
            $_SESSION['admin_error'] = 'Security validation failed (invalid CSRF token). Please try again.';
            header('Location: index.php?route=admin_dashboard');
            exit;
        }

        $orderId = (int)($_POST['order_id'] ?? 0);
        $status = trim((string)($_POST['status'] ?? 'Pending'));
        $priority = trim((string)($_POST['priority'] ?? 'Normal'));
        $dueDate = trim((string)($_POST['due_date'] ?? ''));
        $deadlineTime = trim((string)($_POST['deadline_time'] ?? '17:00:00'));
        $assignedEmployeeId = !empty($_POST['assigned_employee_id']) ? (int)$_POST['assigned_employee_id'] : null;
        $jobNotes = isset($_POST['job_notes']) ? trim((string)$_POST['job_notes']) : null;
        $returnTab = trim((string)($_POST['return_tab'] ?? 'all'));

        if ($orderId <= 0) {
            $_SESSION['admin_error'] = 'Invalid Job Order ID provided.';
            header('Location: index.php?route=admin_dashboard');
            exit;
        }

        if ($dueDate !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dueDate)) {
            $_SESSION['admin_error'] = 'Invalid deadline date format. Please use YYYY-MM-DD.';
            header('Location: index.php?route=admin_dashboard&tab=' . urlencode($returnTab));
            exit;
        }

        // If only status was submitted by a legacy form, preserve existing fields or update full job order
        if ($dueDate === '' && !isset($_POST['priority'])) {
            if ($this->adminModel->updateOrderStatus($orderId, $status)) {
                $_SESSION['admin_message'] = "Job Order #{$orderId} status updated to '{$status}'.";
            }
        } else {
            $ok = $this->jobOrderModel->updateJobOrder($orderId, [
                'status'               => $status,
                'priority'             => $priority,
                'due_date'             => $dueDate,
                'deadline_time'        => $deadlineTime,
                'assigned_employee_id' => $assignedEmployeeId,
                'job_notes'            => $jobNotes
            ]);
            if ($ok) {
                $_SESSION['admin_message'] = "Job Order #JO-2026-{$orderId} updated (Status: {$status}, Priority: {$priority}, Deadline: " . ($dueDate ?: 'Unchanged') . ").";
            } else {
                $_SESSION['admin_error'] = "Unable to update Job Order #{$orderId}. Please check your inputs.";
            }
        }

        header('Location: index.php?route=admin_dashboard&tab=' . urlencode($returnTab));
        exit;
    }
}
