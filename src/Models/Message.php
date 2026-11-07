<?php
namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Message Model (PSR-4)
 * Maps to the `Order_Message` table in `furniture_shop`.
 * Uses PDO prepared statements for all queries and enforces conversation ownership.
 */
class Message
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Verify whether a given CustomerID exists in the Customer table.
     */
    public function customerExists(int $customerId): bool
    {
        if ($customerId <= 0) {
            return false;
        }
        $stmt = $this->db->prepare("SELECT CustomerID FROM Customer WHERE CustomerID = :cid LIMIT 1");
        $stmt->execute([':cid' => $customerId]);
        return (bool)$stmt->fetch();
    }

    /**
     * Verify whether a specific OrderID belongs to the authenticated CustomerID.
     * Prevents IDOR where Customer A references Customer B's OrderID.
     */
    public function doesOrderBelongToCustomer(int $orderId, int $customerId): bool
    {
        if ($orderId <= 0 || $customerId <= 0) {
            return false;
        }
        $stmt = $this->db->prepare(
            "SELECT OrderID FROM Customer_Order WHERE OrderID = :oid AND CustomerID = :cid LIMIT 1"
        );
        $stmt->execute([
            ':oid' => $orderId,
            ':cid' => $customerId,
        ]);
        return (bool)$stmt->fetch();
    }

    /**
     * Fetch a single message by MessageID using a prepared statement (used for ownership checks).
     */
    public function getMessageById(int $messageId): ?array
    {
        if ($messageId <= 0) {
            return null;
        }
        $stmt = $this->db->prepare(
            "SELECT m.MessageID, m.CustomerID, m.OrderID, m.AdminID,
                    CASE WHEN m.SenderRole = 'Admin' THEN m.AdminID ELSE m.CustomerID END AS SenderID,
                    m.SenderRole, m.SenderName, m.Topic, m.MessageText, m.CreatedAt
             FROM Order_Message m
             WHERE m.MessageID = :mid
             LIMIT 1"
        );
        $stmt->execute([':mid' => $messageId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Fetch messages strictly for a single Customer's private conversation (Customer <-> Admin).
     * Computes `SenderID` from `AdminID` (when SenderRole = 'Admin') or `CustomerID` (when SenderRole = 'Customer').
     */
    public function getMessagesByCustomer(int $customerId): array
    {
        if ($customerId <= 0) {
            return [];
        }

        $sql = "SELECT m.MessageID, m.CustomerID, m.OrderID, m.AdminID,
                       CASE WHEN m.SenderRole = 'Admin' THEN m.AdminID ELSE m.CustomerID END AS SenderID,
                       m.SenderRole, m.SenderName, m.Topic, m.MessageText, m.CreatedAt,
                       c.FullName AS CustomerName, c.Email AS CustomerEmail
                FROM Order_Message m
                INNER JOIN Customer c ON m.CustomerID = c.CustomerID
                WHERE m.CustomerID = :cid
                ORDER BY m.CreatedAt ASC, m.MessageID ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':cid' => $customerId]);
        return $stmt->fetchAll();
    }

    /**
     * Backward-compatible alias that requires a valid CustomerID so conversations never mix.
     */
    public function getMessages(?int $customerId = null): array
    {
        if ($customerId === null || $customerId <= 0) {
            return [];
        }
        return $this->getMessagesByCustomer($customerId);
    }

    /**
     * Fetch the list of separate customer conversations for the Admin Inbox sidebar.
     * Uses a prepared statement and groups strictly by CustomerID.
     */
    public function getCustomerConversations(): array
    {
        $sql = "SELECT c.CustomerID, c.FullName, c.Email, c.PhoneNumber,
                       COUNT(m.MessageID) AS MessageCount,
                       MAX(m.CreatedAt) AS LastMessageAt
                FROM Customer c
                LEFT JOIN Order_Message m ON c.CustomerID = m.CustomerID
                GROUP BY c.CustomerID, c.FullName, c.Email, c.PhoneNumber
                ORDER BY COALESCE(MAX(m.CreatedAt), '1970-01-01 00:00:00') DESC, c.CustomerID ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Insert a new message into a specific Customer's private conversation using a prepared statement.
     */
    public function createMessage(
        int $customerId,
        ?int $orderId,
        ?int $adminId,
        string $senderRole,
        string $senderName,
        string $topic,
        string $messageText
    ): int {
        $sql = "INSERT INTO Order_Message
                (CustomerID, OrderID, AdminID, SenderRole, SenderName, Topic, MessageText)
                VALUES (:cid, :oid, :aid, :role, :name, :topic, :text)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':cid'   => $customerId,
            ':oid'   => ($orderId && $orderId > 0) ? $orderId : null,
            ':aid'   => ($adminId && $adminId > 0) ? $adminId : null,
            ':role'  => $senderRole,
            ':name'  => $senderName,
            ':topic' => $topic,
            ':text'  => $messageText,
        ]);
        return (int)$this->db->lastInsertId();
    }

    /**
     * Update a message's text strictly if it belongs to the specified CustomerID and SenderRole.
     */
    public function updateMessageForCustomer(int $messageId, int $customerId, string $newText): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE Order_Message
             SET MessageText = :text
             WHERE MessageID = :mid AND CustomerID = :cid AND SenderRole = 'Customer'"
        );
        $stmt->execute([
            ':text' => $newText,
            ':mid'  => $messageId,
            ':cid'  => $customerId,
        ]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Delete a message strictly if it belongs to the specified CustomerID and SenderRole.
     */
    public function deleteMessageForCustomer(int $messageId, int $customerId): bool
    {
        $stmt = $this->db->prepare(
            "DELETE FROM Order_Message
             WHERE MessageID = :mid AND CustomerID = :cid AND SenderRole = 'Customer'"
        );
        $stmt->execute([
            ':mid' => $messageId,
            ':cid' => $customerId,
        ]);
        return $stmt->rowCount() > 0;
    }
}
