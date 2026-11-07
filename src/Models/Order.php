<?php
namespace App\Models;

use App\Config\Database;
use PDO;
use Exception;

/**
 * Order Model
 * Handles transactions across:
 * - Customer_Order
 * - Order_Item
 * - Customization
 * - Payment (Downpayment / Cash)
 * - Delivery
 */
class Order
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Create a complete customer order with items, customizations, and initial downpayment
     */
    public function placeOrder(array $orderData): int
    {
        $this->db->beginTransaction();

        try {
            // 1. Insert into Customer_Order
            $dueDate = date('Y-m-d', strtotime('+14 days')); // 2 weeks standard bespoke production time
            $stmtOrder = $this->db->prepare(
                "INSERT INTO Customer_Order (CustomerID, OrderDate, DueDate, Status) 
                 VALUES (:customerId, CURRENT_DATE(), :dueDate, 'Pending')"
            );
            $stmtOrder->execute([
                'customerId' => $orderData['customerId'],
                'dueDate'    => $dueDate
            ]);
            $orderId = (int)$this->db->lastInsertId();

            $totalAmount = 0;

            // 2. Insert items and customizations
            $stmtItem = $this->db->prepare(
                "INSERT INTO Order_Item (OrderID, ProductID, ItemType, Quantity, UnitPrice) 
                 VALUES (:orderId, :productId, :itemType, :quantity, :unitPrice)"
            );

            $stmtCustom = $this->db->prepare(
                "INSERT INTO Customization (OrderItemID, Length, Width, Height, ColorFinish, Notes, ExtraCost) 
                 VALUES (:orderItemId, :length, :width, :height, :colorFinish, :notes, :extraCost)"
            );

            foreach ($orderData['items'] as $item) {
                $itemType = !empty($item['customization']) ? 'Customized' : 'Standard';
                $extraCost = isset($item['extraCost']) ? (float)$item['extraCost'] : 0.0;
                $unitPrice = (float)$item['basePrice'] + $extraCost;
                $quantity = (int)$item['quantity'];

                $stmtItem->execute([
                    'orderId'   => $orderId,
                    'productId' => $item['productId'] ?? null,
                    'itemType'  => $itemType,
                    'quantity'  => $quantity,
                    'unitPrice' => $unitPrice,
                ]);
                $orderItemId = (int)$this->db->lastInsertId();

                $totalAmount += ($unitPrice * $quantity);

                // Insert customization if customized
                if ($itemType === 'Customized' && !empty($item['customization'])) {
                    $c = $item['customization'];
                    $stmtCustom->execute([
                        'orderItemId' => $orderItemId,
                        'length'      => $c['length'] ?? null,
                        'width'       => $c['width'] ?? null,
                        'height'      => $c['height'] ?? null,
                        'colorFinish' => $c['colorFinish'] ?? null,
                        'notes'       => $c['notes'] ?? null,
                        'extraCost'   => $extraCost,
                    ]);
                }
            }

            // 3. Record Payment (50% Downpayment record)
            $downpaymentAmount = round($totalAmount * 0.5, 2);
            $stmtPayment = $this->db->prepare(
                "INSERT INTO Payment (OrderID, PaymentType, Amount, PaymentDate) 
                 VALUES (:orderId, 'Downpayment', :amount, CURRENT_DATE())"
            );
            $stmtPayment->execute([
                'orderId' => $orderId,
                'amount'  => $downpaymentAmount,
            ]);

            // 4. Schedule Delivery
            // Find an active driver employee or default to ID 1
            $driverStmt = $this->db->query("SELECT EmployeeID FROM Employee WHERE Role = 'Driver' AND Status = 'Active' LIMIT 1");
            $driver = $driverStmt->fetch();
            $driverId = $driver ? (int)$driver['EmployeeID'] : 1;

            $scheduledDate = date('Y-m-d', strtotime('+15 days'));
            $stmtDelivery = $this->db->prepare(
                "INSERT INTO Delivery (OrderID, DriverID, ReceiverName, DeliveryAddress, ScheduledDate, DeliveryStatus) 
                 VALUES (:orderId, :driverId, :receiverName, :deliveryAddress, :scheduledDate, 'Scheduled')"
            );
            $stmtDelivery->execute([
                'orderId'         => $orderId,
                'driverId'        => $driverId,
                'receiverName'    => $orderData['receiverName'],
                'deliveryAddress' => $orderData['deliveryAddress'],
                'scheduledDate'   => $scheduledDate,
            ]);

            $this->db->commit();
            return $orderId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Fetch order details by OrderID for tracking
     */
    public function getOrderDetails(int $orderId): ?array
    {
        $stmtOrder = $this->db->prepare(
            "SELECT o.*, c.FullName as CustomerName, c.Email, c.PhoneNumber 
             FROM Customer_Order o
             INNER JOIN Customer c ON o.CustomerID = c.CustomerID
             WHERE o.OrderID = :orderId
             LIMIT 1"
        );
        $stmtOrder->execute(['orderId' => $orderId]);
        $order = $stmtOrder->fetch();

        if (!$order) {
            return null;
        }

        // Fetch Items & Customizations
        $stmtItems = $this->db->prepare(
            "SELECT oi.*, p.ProductName, p.ImagePath,
                    cz.Length, cz.Width, cz.Height, cz.ColorFinish, cz.Notes, cz.ExtraCost
             FROM Order_Item oi
             LEFT JOIN Product p ON oi.ProductID = p.ProductID
             LEFT JOIN Customization cz ON oi.OrderItemID = cz.OrderItemID
             WHERE oi.OrderID = :orderId"
        );
        $stmtItems->execute(['orderId' => $orderId]);
        $order['items'] = $stmtItems->fetchAll();

        // Fetch Payments
        $stmtPayments = $this->db->prepare("SELECT * FROM Payment WHERE OrderID = :orderId ORDER BY PaymentID ASC");
        $stmtPayments->execute(['orderId' => $orderId]);
        $order['payments'] = $stmtPayments->fetchAll();

        // Fetch Delivery
        $stmtDelivery = $this->db->prepare(
            "SELECT d.*, e.FullName as DriverName, e.PhoneNumber as DriverPhone 
             FROM Delivery d
             LEFT JOIN Employee e ON d.DriverID = e.EmployeeID
             WHERE d.OrderID = :orderId
             LIMIT 1"
        );
        $stmtDelivery->execute(['orderId' => $orderId]);
        $order['delivery'] = $stmtDelivery->fetch();

        return $order;
    }

    /**
     * Get all orders for a specific customer
     */
    public function getOrdersByCustomer(int $customerId): array
    {
        $stmt = $this->db->prepare(
            "SELECT o.*, 
                    (SELECT COUNT(*) FROM Order_Item WHERE OrderID = o.OrderID) as TotalItems,
                    (SELECT SUM(UnitPrice * Quantity) FROM Order_Item WHERE OrderID = o.OrderID) as TotalAmount
             FROM Customer_Order o
             WHERE o.CustomerID = :customerId
             ORDER BY o.OrderID DESC"
        );
        $stmt->execute(['customerId' => $customerId]);
        return $stmt->fetchAll();
    }
}
