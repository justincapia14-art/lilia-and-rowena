<?php
namespace App\Controllers;

use App\Models\Message;

/**
 * MessageController (PSR-4)
 * Enforces strict server-side authorization and anti-IDOR protection for
 * 1-on-1 Customer-to-Admin messaging (Order Follow-Ups & Custom Add-Ons).
 */
class MessageController
{
    private Message $messageModel;

    public function __construct()
    {
        $this->messageModel = new Message();
    }

    /**
     * Resolve authenticated session identity from PHP $_SESSION.
     * Never trusts client-submitted role or user_id parameters.
     */
    private function getAuthenticatedIdentity(): array
    {
        $isAdmin = isset($_SESSION['admin_id']) && (int)$_SESSION['admin_id'] > 0 && ($_SESSION['user_role'] ?? 'admin') === 'admin';
        $sessionCustomerId = (!$isAdmin && isset($_SESSION['customer_id'])) ? (int)$_SESSION['customer_id'] : 0;

        return [
            'isAuthenticated' => ($isAdmin || $sessionCustomerId > 0),
            'isAdmin'         => $isAdmin,
            'adminId'         => $isAdmin ? (int)$_SESSION['admin_id'] : 0,
            'customerId'      => $sessionCustomerId,
            'customerName'    => (string)($_SESSION['customer_name'] ?? 'Customer'),
        ];
    }

    /**
     * Inspect $_GET and request payload for any client-supplied conversation/customer/sender IDs.
     * Returns true if a logged-in Customer attempted to tamper with IDs to access another customer's conversation.
     */
    private function hasUnauthorizedCustomerIdTampering(int $authenticatedCustomerId, array $input = []): bool
    {
        $candidateParams = [
            $_GET['customer_id'] ?? null,
            $_GET['CustomerID'] ?? null,
            $_GET['conversation_id'] ?? null,
            $_GET['conversationId'] ?? null,
            $_GET['viewer_id'] ?? null,
            $input['customer_id'] ?? null,
            $input['CustomerID'] ?? null,
            $input['conversation_id'] ?? null,
            $input['conversationId'] ?? null,
            $input['sender_id'] ?? null,
            $input['SenderID'] ?? null,
            $input['viewer_id'] ?? null,
        ];

        foreach ($candidateParams as $param) {
            if ($param !== null && $param !== '' && (int)$param !== $authenticatedCustomerId) {
                return true;
            }
        }

        // Prevent a Customer from spoofing Admin role in request parameters
        $suppliedRole = strtolower(trim((string)($input['sender_role'] ?? $input['SenderRole'] ?? $_GET['viewer_role'] ?? '')));
        if ($suppliedRole !== '' && $suppliedRole !== 'customer') {
            return true;
        }

        return false;
    }

    /**
     * Emit an HTTP 403 Forbidden response and terminate immediately.
     */
    private function denyAccessForbidden(string $reason, bool $isJsonRequest = false): void
    {
        http_response_code(403);
        if ($isJsonRequest || isset($_GET['ajax']) || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'error',
                'code'   => 403,
                'error'  => $reason,
            ]);
            exit;
        }

        echo "<!doctype html><html lang='en'><head><meta charset='UTF-8'><title>403 Forbidden</title></head>";
        echo "<body style='font-family:sans-serif;padding:2rem;'><h1>403 Forbidden</h1><p>" . htmlspecialchars($reason) . "</p>";
        echo "<p><a href='index.php?route=messages'>Return to Your Private Conversation</a></p></body></html>";
        exit;
    }

    /**
     * Render the Live Order Follow-Up & Workshop Chat page.
     * - Customer A can only view Customer A's conversation (403 Forbidden if URL customer_id / conversation_id is changed).
     * - Admin can view all customer conversations and open any customer's conversation.
     */
    public function index(): void
    {
        $auth = $this->getAuthenticatedIdentity();

        if (!$auth['isAuthenticated']) {
            $_SESSION['auth_error'] = 'Please sign in to access your private conversation with the Workshop Admin.';
            header('Location: index.php?route=login');
            exit;
        }

        if ($auth['isAdmin']) {
            $conversations = $this->messageModel->getCustomerConversations();
            $defaultCustId = !empty($conversations) ? (int)$conversations[0]['CustomerID'] : 1;
            $requestedId = $_GET['customer_id'] ?? $_GET['conversation_id'] ?? null;
            $activeCustomerId = ($requestedId !== null && (int)$requestedId > 0) ? (int)$requestedId : $defaultCustId;

            if (!$this->messageModel->customerExists($activeCustomerId)) {
                $activeCustomerId = $defaultCustId;
            }
            $messages = $this->messageModel->getMessagesByCustomer($activeCustomerId);
        } else {
            // Customer: reject any manual URL tampering (?customer_id=2 or ?conversation_id=2) with HTTP 403 Forbidden
            if ($this->hasUnauthorizedCustomerIdTampering($auth['customerId'])) {
                $this->denyAccessForbidden('Forbidden: Customers cannot access another customer\'s private conversation.', false);
            }

            // Derive CustomerID strictly from the authenticated PHP session
            $conversations = [];
            $activeCustomerId = $auth['customerId'];
            $messages = $this->messageModel->getMessagesByCustomer($activeCustomerId);
        }

        require __DIR__ . '/../../views/layouts/header.php';
        require __DIR__ . '/../../views/messages.php';
        require __DIR__ . '/../../views/layouts/footer.php';
    }

    /**
     * Real-time JSON endpoint for polling live messages with strict backend authorization.
     */
    public function poll(): void
    {
        header('Content-Type: application/json');

        $auth = $this->getAuthenticatedIdentity();

        if (!$auth['isAuthenticated']) {
            http_response_code(401);
            echo json_encode([
                'status' => 'error',
                'code'   => 401,
                'error'  => 'Authentication required to view private conversation messages.',
            ]);
            exit;
        }

        if (!$auth['isAdmin']) {
            if ($this->hasUnauthorizedCustomerIdTampering($auth['customerId'])) {
                $this->denyAccessForbidden('Forbidden: You can only retrieve messages belonging to your own conversation.', true);
            }
            $targetCustomerId = $auth['customerId'];
        } else {
            $requestedCustomerId = isset($_GET['customer_id'])
                ? (int)$_GET['customer_id']
                : (isset($_GET['conversation_id']) ? (int)$_GET['conversation_id'] : 1);
            $targetCustomerId = $requestedCustomerId > 0 ? $requestedCustomerId : 1;
        }

        $messages = $this->messageModel->getMessagesByCustomer($targetCustomerId);
        echo json_encode([
            'status'      => 'ok',
            'customer_id' => $targetCustomerId,
            'messages'    => $messages,
        ]);
        exit;
    }

    /**
     * Handle sending a new message with strict backend conversation & order ownership validation.
     */
    public function send(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?route=messages');
            exit;
        }

        $rawBody = file_get_contents('php://input');
        $jsonData = json_decode($rawBody, true);
        $isJsonRequest = is_array($jsonData);
        $input = $isJsonRequest ? $jsonData : $_POST;

        $auth = $this->getAuthenticatedIdentity();

        if (!$auth['isAuthenticated']) {
            if ($isJsonRequest || isset($_GET['ajax'])) {
                http_response_code(401);
                header('Content-Type: application/json');
                echo json_encode([
                    'status' => 'error',
                    'code'   => 401,
                    'error'  => 'Authentication required to send messages.',
                ]);
                exit;
            }
            header('Location: index.php?route=login');
            exit;
        }

        if ($auth['isAdmin']) {
            $senderRole = 'Admin';
            $adminId = $auth['adminId'];
            $customerId = (int)($input['customer_id'] ?? $input['CustomerID'] ?? $input['conversation_id'] ?? 1);
            if ($customerId <= 0 || !$this->messageModel->customerExists($customerId)) {
                $this->denyAccessForbidden('Forbidden: Target customer conversation does not exist.', $isJsonRequest);
            }
            $senderName = 'Rowena & Lilia (Workshop Admin)';
        } else {
            // Customer: reject any attempt to specify another customer's ID, conversation ID, or Admin role
            if ($this->hasUnauthorizedCustomerIdTampering($auth['customerId'], $input)) {
                $this->denyAccessForbidden('Forbidden: Cannot send messages to another customer\'s conversation.', $isJsonRequest);
            }

            // Always derive CustomerID from the authenticated session
            $senderRole = 'Customer';
            $adminId = null;
            $customerId = $auth['customerId'];
            $senderName = $auth['customerName'];
        }

        $orderId = !empty($input['order_id'])
            ? (int)$input['order_id']
            : (!empty($input['OrderID']) ? (int)$input['OrderID'] : null);

        // Validate that if an OrderID is provided by a Customer, that order actually belongs to the authenticated Customer
        if (!$auth['isAdmin'] && $orderId !== null && $orderId > 0) {
            if (!$this->messageModel->doesOrderBelongToCustomer($orderId, $customerId)) {
                $this->denyAccessForbidden('Forbidden: You cannot reference an order belonging to another customer.', $isJsonRequest);
            }
        }

        $topic = trim((string)($input['topic'] ?? $input['Topic'] ?? 'Order Follow-Up'));
        $messageText = trim((string)($input['message_text'] ?? $input['MessageText'] ?? ''));

        if ($messageText !== '' && $customerId > 0) {
            $newId = $this->messageModel->createMessage(
                $customerId,
                $orderId,
                $adminId,
                $senderRole,
                $senderName,
                $topic,
                $messageText
            );

            if ($isJsonRequest || isset($_GET['ajax'])) {
                header('Content-Type: application/json');
                echo json_encode([
                    'status'      => 'ok',
                    'message_id'  => $newId,
                    'customer_id' => $customerId,
                    'messages'    => $this->messageModel->getMessagesByCustomer($customerId),
                ]);
                exit;
            }
        }

        $redirectRoute = $auth['isAdmin']
            ? ('admin_dashboard&customer_id=' . $customerId)
            : 'messages';
        header("Location: index.php?route={$redirectRoute}");
        exit;
    }

    /**
     * Update an existing message with strict ownership verification (prevents IDOR edits).
     */
    public function update(): void
    {
        header('Content-Type: application/json');

        $rawBody = file_get_contents('php://input');
        $jsonData = json_decode($rawBody, true);
        $input = is_array($jsonData) ? $jsonData : $_POST;

        $auth = $this->getAuthenticatedIdentity();
        if (!$auth['isAuthenticated']) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'code' => 401, 'error' => 'Authentication required.']);
            exit;
        }

        $messageId = (int)($input['message_id'] ?? $input['MessageID'] ?? $_GET['message_id'] ?? 0);
        $newText = trim((string)($input['message_text'] ?? $input['MessageText'] ?? ''));

        if ($messageId <= 0 || $newText === '') {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'code' => 400, 'error' => 'Valid message_id and message_text are required.']);
            exit;
        }

        $existing = $this->messageModel->getMessageById($messageId);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'code' => 404, 'error' => 'Message not found.']);
            exit;
        }

        if (!$auth['isAdmin']) {
            if ($this->hasUnauthorizedCustomerIdTampering($auth['customerId'], $input) ||
                (int)$existing['CustomerID'] !== $auth['customerId'] ||
                strtolower((string)$existing['SenderRole']) !== 'customer') {
                $this->denyAccessForbidden('Forbidden: You cannot modify another customer\'s or admin\'s message.', true);
            }
            $this->messageModel->updateMessageForCustomer($messageId, $auth['customerId'], $newText);
        }

        echo json_encode(['status' => 'ok', 'message_id' => $messageId]);
        exit;
    }

    /**
     * Delete an existing message with strict ownership verification (prevents IDOR deletion).
     */
    public function delete(): void
    {
        header('Content-Type: application/json');

        $rawBody = file_get_contents('php://input');
        $jsonData = json_decode($rawBody, true);
        $input = is_array($jsonData) ? $jsonData : $_POST;

        $auth = $this->getAuthenticatedIdentity();
        if (!$auth['isAuthenticated']) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'code' => 401, 'error' => 'Authentication required.']);
            exit;
        }

        $messageId = (int)($input['message_id'] ?? $input['MessageID'] ?? $_GET['message_id'] ?? 0);
        if ($messageId <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'code' => 400, 'error' => 'Valid message_id is required.']);
            exit;
        }

        $existing = $this->messageModel->getMessageById($messageId);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'code' => 404, 'error' => 'Message not found.']);
            exit;
        }

        if (!$auth['isAdmin']) {
            if ($this->hasUnauthorizedCustomerIdTampering($auth['customerId'], $input) ||
                (int)$existing['CustomerID'] !== $auth['customerId'] ||
                strtolower((string)$existing['SenderRole']) !== 'customer') {
                $this->denyAccessForbidden('Forbidden: You cannot delete another customer\'s or admin\'s message.', true);
            }
            $this->messageModel->deleteMessageForCustomer($messageId, $auth['customerId']);
        }

        echo json_encode(['status' => 'ok', 'deleted_message_id' => $messageId]);
        exit;
    }
}
