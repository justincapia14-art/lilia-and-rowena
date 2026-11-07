<?php
namespace App\Models;

use App\Config\Database;
use PDO;
use DateTimeImmutable;
use DateTimeZone;

/**
 * JobOrder Model
 * Handles Admin-Only Job Orders Tracking, Deadline Today Filtering, Overdue Detection,
 * KPI Summary Cards, and Order Management Actions in the Asia/Manila timezone.
 */
class JobOrder
{
    private PDO $db;

    public const ALLOWED_STATUSES = [
        'Pending',
        'Order Confirmed',
        'In Production',
        'For Delivery',
        'Completed',
        'Cancelled'
    ];

    public const ALLOWED_PRIORITIES = [
        'Normal',
        'High',
        'Urgent'
    ];

    public function __construct()
    {
        date_default_timezone_set('Asia/Manila');
        $this->db = Database::getConnection();
        $this->ensureSchemaColumns();
    }

    /**
     * Current date (YYYY-MM-DD) in Asia/Manila timezone
     */
    public static function todayManila(): string
    {
        $now = new DateTimeImmutable('now', new DateTimeZone('Asia/Manila'));
        return $now->format('Y-m-d');
    }

    /**
     * Normalize legacy status strings ('Confirmed', 'Ready', 'Delivered') to standard Job Order statuses
     */
    public static function normalizeStatus(string $status): string
    {
        $s = trim($status);
        if ($s === 'Confirmed') {
            return 'Order Confirmed';
        }
        if ($s === 'Ready') {
            return 'For Delivery';
        }
        if ($s === 'Delivered') {
            return 'Completed';
        }
        return in_array($s, self::ALLOWED_STATUSES, true) ? $s : 'Pending';
    }

    /**
     * Ensure Priority, DeadlineTime, AssignedEmployeeID, and JobNotes columns exist on Customer_Order
     */
    private function ensureSchemaColumns(): void
    {
        try {
            $this->db->exec("SET time_zone = '+08:00'");
            $colsStmt = $this->db->query("SHOW COLUMNS FROM Customer_Order");
            $existingCols = [];
            foreach ($colsStmt->fetchAll() as $col) {
                $existingCols[strtolower($col['Field'])] = true;
            }

            if (!isset($existingCols['priority'])) {
                $this->db->exec("ALTER TABLE Customer_Order MODIFY COLUMN Status VARCHAR(30) NOT NULL DEFAULT 'Pending'");
                $this->db->exec("ALTER TABLE Customer_Order ADD COLUMN Priority VARCHAR(20) NOT NULL DEFAULT 'Normal' AFTER Status");
            }
            if (!isset($existingCols['deadlinetime'])) {
                $this->db->exec("ALTER TABLE Customer_Order ADD COLUMN DeadlineTime TIME NULL DEFAULT '17:00:00' AFTER DueDate");
            }
            if (!isset($existingCols['assignedemployeeid'])) {
                $this->db->exec("ALTER TABLE Customer_Order ADD COLUMN AssignedEmployeeID INT NULL AFTER Priority");
            }
            if (!isset($existingCols['jobnotes'])) {
                $this->db->exec("ALTER TABLE Customer_Order ADD COLUMN JobNotes VARCHAR(255) NULL AFTER AssignedEmployeeID");
            }
        } catch (\Throwable $e) {
            // Ignore if privileges restrict DDL or columns already exist
        }
    }

    /**
     * Fetch Dashboard Summary Card KPIs & Tab Counts directly from MySQL using Asia/Manila date
     */
    public function getSummaryCounts(): array
    {
        $today = self::todayManila();

        $sql = "
            SELECT
                COUNT(*) AS TotalOrders,
                SUM(CASE WHEN o.DueDate = :today1 AND o.Status != 'Cancelled' THEN 1 ELSE 0 END) AS DeadlineToday,
                SUM(CASE WHEN o.OrderDate = :today2 THEN 1 ELSE 0 END) AS OrdersToday,
                SUM(CASE WHEN o.DueDate IS NOT NULL AND o.DueDate < :today3 AND o.Status NOT IN ('Completed', 'Delivered', 'Cancelled') THEN 1 ELSE 0 END) AS OverdueOrders,
                SUM(CASE WHEN o.Status = 'Pending' THEN 1 ELSE 0 END) AS PendingOrders,
                SUM(CASE WHEN o.Status IN ('Completed', 'Delivered') THEN 1 ELSE 0 END) AS CompletedOrders,
                SUM(CASE WHEN o.Status IN ('Pending', 'Order Confirmed', 'Confirmed', 'In Production', 'For Delivery', 'Ready') THEN 1 ELSE 0 END) AS ActiveOrders,
                SUM(
                    CASE WHEN o.Status != 'Cancelled' AND
                        COALESCE((SELECT SUM(oi.UnitPrice * oi.Quantity) FROM Order_Item oi WHERE oi.OrderID = o.OrderID), 0) >
                        COALESCE((SELECT SUM(p.Amount) FROM Payment p WHERE p.OrderID = o.OrderID), 0)
                    THEN 1 ELSE 0 END
                ) AS UnpaidOrders
            FROM Customer_Order o
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'today1' => $today,
            'today2' => $today,
            'today3' => $today
        ]);
        $row = $stmt->fetch() ?: [];

        return [
            'totalOrders'     => (int)($row['TotalOrders'] ?? 0),
            'deadlineToday'   => (int)($row['DeadlineToday'] ?? 0),
            'ordersToday'     => (int)($row['OrdersToday'] ?? 0),
            'overdueOrders'   => (int)($row['OverdueOrders'] ?? 0),
            'pendingOrders'   => (int)($row['PendingOrders'] ?? 0),
            'completedOrders' => (int)($row['CompletedOrders'] ?? 0),
            'activeOrders'    => (int)($row['ActiveOrders'] ?? 0),
            'unpaidOrders'    => (int)($row['UnpaidOrders'] ?? 0),
            'todayManila'     => $today
        ];
    }

    /**
     * Query Job Orders with Tab, Search, Status, Priority, Deadline Filter, and Sort
     */
    public function getJobOrders(array $filters = []): array
    {
        $today = self::todayManila();
        $tab = strtolower(trim((string)($filters['tab'] ?? 'deadline_today')));
        $search = trim((string)($filters['search'] ?? ''));
        $statusFilter = trim((string)($filters['status'] ?? 'ALL'));
        $priorityFilter = trim((string)($filters['priority'] ?? 'ALL'));
        $deadlineFilter = strtoupper(trim((string)($filters['deadline_filter'] ?? 'ALL')));
        $sortBy = strtolower(trim((string)($filters['sort'] ?? 'deadline_asc')));

        $where = ['1=1'];
        $params = [];

        // 1. Tab filter (Deadline Today vs Orders Today vs Overdue vs Active vs Unpaid vs All)
        if ($tab === 'deadline_today') {
            $where[] = "o.DueDate = :tabToday AND o.Status != 'Cancelled'";
            $params['tabToday'] = $today;
        } elseif ($tab === 'orders_today') {
            $where[] = "o.OrderDate = :tabOrderToday";
            $params['tabOrderToday'] = $today;
        } elseif ($tab === 'overdue') {
            $where[] = "o.DueDate IS NOT NULL AND o.DueDate < :tabOverdueToday AND o.Status NOT IN ('Completed', 'Delivered', 'Cancelled')";
            $params['tabOverdueToday'] = $today;
        } elseif ($tab === 'active') {
            $where[] = "o.Status IN ('Pending', 'Order Confirmed', 'Confirmed', 'In Production', 'For Delivery', 'Ready')";
        } elseif ($tab === 'unpaid') {
            $where[] = "o.Status != 'Cancelled' AND COALESCE((SELECT SUM(oi2.UnitPrice * oi2.Quantity) FROM Order_Item oi2 WHERE oi2.OrderID = o.OrderID), 0) > COALESCE((SELECT SUM(p2.Amount) FROM Payment p2 WHERE p2.OrderID = o.OrderID), 0)";
        }

        // 2. Status filter
        if ($statusFilter !== '' && strtoupper($statusFilter) !== 'ALL') {
            $normStatus = self::normalizeStatus($statusFilter);
            if ($normStatus === 'Order Confirmed') {
                $where[] = "o.Status IN ('Order Confirmed', 'Confirmed')";
            } elseif ($normStatus === 'For Delivery') {
                $where[] = "o.Status IN ('For Delivery', 'Ready')";
            } elseif ($normStatus === 'Completed') {
                $where[] = "o.Status IN ('Completed', 'Delivered')";
            } else {
                $where[] = "o.Status = :statusFilter";
                $params['statusFilter'] = $normStatus;
            }
        }

        // 3. Priority filter
        if ($priorityFilter !== '' && strtoupper($priorityFilter) !== 'ALL') {
            if (in_array($priorityFilter, self::ALLOWED_PRIORITIES, true)) {
                $where[] = "COALESCE(o.Priority, 'Normal') = :priorityFilter";
                $params['priorityFilter'] = $priorityFilter;
            }
        }

        // 4. Deadline filter
        if ($deadlineFilter === 'DUE_TODAY') {
            $where[] = "o.DueDate = :dlToday AND o.Status != 'Cancelled'";
            $params['dlToday'] = $today;
        } elseif ($deadlineFilter === 'OVERDUE') {
            $where[] = "o.DueDate IS NOT NULL AND o.DueDate < :dlOverdue AND o.Status NOT IN ('Completed', 'Delivered', 'Cancelled')";
            $params['dlOverdue'] = $today;
        } elseif ($deadlineFilter === 'UPCOMING') {
            $where[] = "o.DueDate > :dlUpcoming AND o.Status NOT IN ('Completed', 'Delivered', 'Cancelled')";
            $params['dlUpcoming'] = $today;
        }

        // 5. Search by Job Order ID or Customer Name / Email / Phone
        if ($search !== '') {
            $numericSearch = preg_replace('/[^0-9]/', '', $search);
            if ($numericSearch !== '') {
                $where[] = "(CAST(o.OrderID AS CHAR) LIKE :searchId OR c.FullName LIKE :searchName OR c.PhoneNumber LIKE :searchPhone OR c.Email LIKE :searchEmail)";
                $params['searchId'] = '%' . $numericSearch . '%';
                $params['searchName'] = '%' . $search . '%';
                $params['searchPhone'] = '%' . $search . '%';
                $params['searchEmail'] = '%' . $search . '%';
            } else {
                $where[] = "(c.FullName LIKE :searchName OR c.PhoneNumber LIKE :searchPhone OR c.Email LIKE :searchEmail OR EXISTS (SELECT 1 FROM Order_Item oi3 LEFT JOIN Product p3 ON oi3.ProductID = p3.ProductID WHERE oi3.OrderID = o.OrderID AND p3.ProductName LIKE :searchProd))";
                $params['searchName'] = '%' . $search . '%';
                $params['searchPhone'] = '%' . $search . '%';
                $params['searchEmail'] = '%' . $search . '%';
                $params['searchProd'] = '%' . $search . '%';
            }
        }

        // 6. Order By Clause
        $orderBySql = "COALESCE(o.DueDate, '9999-12-31') ASC, COALESCE(o.DeadlineTime, '17:00:00') ASC, o.OrderID DESC";
        if ($sortBy === 'deadline_desc') {
            $orderBySql = "COALESCE(o.DueDate, '1970-01-01') DESC, COALESCE(o.DeadlineTime, '17:00:00') DESC, o.OrderID DESC";
        } elseif ($sortBy === 'id_desc') {
            $orderBySql = "o.OrderID DESC";
        } elseif ($sortBy === 'priority_desc') {
            $orderBySql = "CASE COALESCE(o.Priority, 'Normal') WHEN 'Urgent' THEN 3 WHEN 'High' THEN 2 ELSE 1 END DESC, COALESCE(o.DueDate, '9999-12-31') ASC";
        }

        $whereSql = implode(' AND ', $where);

        $sql = "
            SELECT
                o.OrderID,
                o.CustomerID,
                o.OrderDate,
                o.DueDate,
                COALESCE(o.DeadlineTime, '17:00:00') AS DeadlineTime,
                o.Status,
                COALESCE(o.Priority, 'Normal') AS Priority,
                o.AssignedEmployeeID,
                o.JobNotes,
                c.FullName AS CustomerName,
                c.Email AS CustomerEmail,
                c.PhoneNumber AS CustomerPhone,
                c.Address AS CustomerAddress,
                e.FullName AS AssignedStaffName,
                e.Role AS AssignedStaffRole,
                COALESCE((
                    SELECT GROUP_CONCAT(CONCAT(COALESCE(p.ProductName, 'Custom Bespoke Furniture'), ' (×', oi.Quantity, ')') SEPARATOR ', ')
                    FROM Order_Item oi
                    LEFT JOIN Product p ON oi.ProductID = p.ProductID
                    WHERE oi.OrderID = o.OrderID
                ), 'Custom Solid Wood Furniture') AS ProductSummary,
                COALESCE((
                    SELECT SUM(oi.Quantity)
                    FROM Order_Item oi
                    WHERE oi.OrderID = o.OrderID
                ), 1) AS TotalQuantity,
                COALESCE((
                    SELECT COUNT(*)
                    FROM Order_Item oi
                    WHERE oi.OrderID = o.OrderID
                ), 1) AS ItemCount,
                COALESCE((
                    SELECT SUM(oi.UnitPrice * oi.Quantity)
                    FROM Order_Item oi
                    WHERE oi.OrderID = o.OrderID
                ), 0) AS TotalAmount,
                COALESCE((
                    SELECT SUM(pay.Amount)
                    FROM Payment pay
                    WHERE pay.OrderID = o.OrderID
                ), 0) AS TotalPaid
            FROM Customer_Order o
            INNER JOIN Customer c ON o.CustomerID = c.CustomerID
            LEFT JOIN Employee e ON o.AssignedEmployeeID = e.EmployeeID
            WHERE {$whereSql}
            ORDER BY {$orderBySql}
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        foreach ($rows as &$r) {
            $r['NormalizedStatus'] = self::normalizeStatus((string)($r['Status'] ?? 'Pending'));
            $r['JobOrderCode'] = 'JO-2026-' . str_pad((string)$r['OrderID'], 4, '0', STR_PAD_LEFT);
            $r['TotalAmount'] = (float)$r['TotalAmount'];
            $r['TotalPaid'] = (float)$r['TotalPaid'];
            $r['BalanceDue'] = max(0.0, $r['TotalAmount'] - $r['TotalPaid']);
            $due = (string)($r['DueDate'] ?? '');
            $isFinished = in_array($r['NormalizedStatus'], ['Completed', 'Cancelled'], true);
            $r['IsDeadlineToday'] = ($due !== '' && $due === $today && $r['NormalizedStatus'] !== 'Cancelled');
            $r['IsOverdue'] = ($due !== '' && $due < $today && !$isFinished);
            $r['IsCreatedToday'] = ((string)($r['OrderDate'] ?? '') === $today);
        }
        unset($r);

        return $rows;
    }

    /**
     * Update Job Order Status, Deadline, Priority, Assigned Staff, and Notes using Prepared Statements
     */
    public function updateJobOrder(int $orderId, array $data): bool
    {
        if ($orderId <= 0) {
            return false;
        }

        $status = self::normalizeStatus((string)($data['status'] ?? 'Pending'));
        $priority = trim((string)($data['priority'] ?? 'Normal'));
        if (!in_array($priority, self::ALLOWED_PRIORITIES, true)) {
            $priority = 'Normal';
        }

        $dueDate = trim((string)($data['due_date'] ?? $data['DueDate'] ?? ''));
        if ($dueDate !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dueDate)) {
            return false;
        }

        $deadlineTime = trim((string)($data['deadline_time'] ?? $data['DeadlineTime'] ?? '17:00:00'));
        if (preg_match('/^\d{2}:\d{2}$/', $deadlineTime)) {
            $deadlineTime .= ':00';
        } elseif (!preg_match('/^\d{2}:\d{2}:\d{2}$/', $deadlineTime)) {
            $deadlineTime = '17:00:00';
        }

        $assignedEmployeeId = !empty($data['assigned_employee_id']) ? (int)$data['assigned_employee_id'] : null;
        $jobNotes = isset($data['job_notes']) ? trim((string)$data['job_notes']) : null;

        $sql = "
            UPDATE Customer_Order
            SET Status = :status,
                Priority = :priority,
                DueDate = :dueDate,
                DeadlineTime = :deadlineTime,
                AssignedEmployeeID = :assignedEmployeeId,
                JobNotes = COALESCE(:jobNotes, JobNotes)
            WHERE OrderID = :orderId
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'status'             => $status,
            'priority'           => $priority,
            'dueDate'            => $dueDate !== '' ? $dueDate : null,
            'deadlineTime'       => $deadlineTime,
            'assignedEmployeeId' => $assignedEmployeeId,
            'jobNotes'           => $jobNotes,
            'orderId'            => $orderId
        ]);
    }
}
