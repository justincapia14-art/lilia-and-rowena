-- =====================================================================
-- LILIA AND ROWENA FURNITURE - ADMIN JOB ORDERS & DEADLINE MIGRATION
-- PHYSICAL DESIGN, FILE 3 OF 3: Safe Non-Destructive Schema Migration
-- DBMS: MySQL 8+ / MariaDB 10.4+ (XAMPP Compatible)
-- Run this AFTER 01_furniture_shop_schema.sql and 02_sample_data.sql
-- =====================================================================

USE furniture_shop;

-- Set session timezone to Asia/Manila (UTC+08:00) for accurate deadline comparisons
SET time_zone = '+08:00';

-- 1. Safely expand Customer_Order.Status to support all Job Order statuses:
--    ('Pending', 'Order Confirmed', 'Confirmed', 'In Production', 'For Delivery', 'Ready', 'Delivered', 'Completed', 'Cancelled')
ALTER TABLE Customer_Order
    DROP CONSTRAINT IF EXISTS chk_order_status;

ALTER TABLE Customer_Order
    MODIFY COLUMN Status VARCHAR(30) NOT NULL DEFAULT 'Pending';

-- 2. Add Priority, DeadlineTime, AssignedEmployeeID, and JobNotes to Customer_Order if not already present
ALTER TABLE Customer_Order
    ADD COLUMN IF NOT EXISTS Priority VARCHAR(20) NOT NULL DEFAULT 'Normal' AFTER Status,
    ADD COLUMN IF NOT EXISTS DeadlineTime TIME NULL DEFAULT '17:00:00' AFTER DueDate,
    ADD COLUMN IF NOT EXISTS AssignedEmployeeID INT NULL AFTER Priority,
    ADD COLUMN IF NOT EXISTS JobNotes VARCHAR(255) NULL AFTER AssignedEmployeeID;

-- 3. Add Foreign Key from Customer_Order.AssignedEmployeeID -> Employee.EmployeeID
--    (Using a safe conditional check or standard constraint name)
ALTER TABLE Customer_Order
    ADD CONSTRAINT fk_order_assigned_employee
        FOREIGN KEY (AssignedEmployeeID) REFERENCES Employee (EmployeeID)
        ON UPDATE CASCADE ON DELETE SET NULL;

-- 4. Update existing sample orders (#1001 and #1002) with Priority, Assigned Staff, and Deadline Today / Active dates
UPDATE Customer_Order
SET DueDate = CURRENT_DATE,
    DeadlineTime = '08:00:00',
    Status = 'In Production',
    Priority = 'Urgent',
    AssignedEmployeeID = 1,
    JobNotes = 'Custom 220cm length Mahogany 6-Seater Dining Set — Final walnut topcoat curing for delivery today.'
WHERE OrderID = 1001;

UPDATE Customer_Order
SET OrderDate = CURRENT_DATE,
    DueDate = DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY),
    DeadlineTime = '14:00:00',
    Status = 'Order Confirmed',
    Priority = 'High',
    AssignedEmployeeID = 2,
    JobNotes = 'Scandinavian Sky Blue Lounge Sofa + 2 matching bolster pillows.'
WHERE OrderID = 1002;

-- 5. Insert additional realistic Customer & Job Order records so all 6 tabs
--    (Deadline Today, Orders Today, Overdue, Active, Unpaid, All Orders) are populated from MySQL
INSERT INTO Customer (CustomerID, FullName, Email, PasswordHash, PhoneNumber, Address) VALUES
(3, 'Engr. Danica Gomez', 'danica.gomez@example.com', '$2y$10$abcdefghijklmnopqrstuu0SYq8twpcthS10uxQ26rv0s3Obj8Ufu', '0917-542-8810', 'One Serendra, Bonifacio Global City, Taguig'),
(4, 'Dr. Ronald & Elena Ramos', 'ronald.ramos@example.com', '$2y$10$abcdefghijklmnopqrstuu0SYq8twpcthS10uxQ26rv0s3Obj8Ufu', '0918-334-9012', 'Villa Barosa, San Fernando, Pampanga'),
(5, 'Arch. Marco & Patricia Villanueva', 'marco.villanueva@example.com', '$2y$10$abcdefghijklmnopqrstuu0SYq8twpcthS10uxQ26rv0s3Obj8Ufu', '0922-719-4401', ' Beverly Hills Subdivision, Antipolo, Rizal')
ON DUPLICATE KEY UPDATE FullName = VALUES(FullName);

INSERT INTO Customer_Order (OrderID, CustomerID, OrderDate, DueDate, DeadlineTime, Status, Priority, AssignedEmployeeID, JobNotes) VALUES
-- Order #1003: DEADLINE TODAY + For Delivery + High Priority
(1003, 3, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY), CURRENT_DATE, '10:30:00', 'For Delivery', 'High', 3, 'White-glove delivery to BGC Taguig scheduled before noon today.'),
-- Order #1004: OVERDUE ORDER (Deadline passed 3 days ago, still Pending) + Urgent Priority
(1004, 5, DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), '13:30:00', 'Pending', 'Urgent', 1, 'Awaiting final brass hardware fitting and custom stain approval.'),
-- Order #1005: OVERDUE ORDER (Deadline passed 2 days ago, In Production) + High Priority
(1005, 1, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), '15:00:00', 'In Production', 'High', 4, 'Second polyurethane clear coat drying in Pampanga workshop.'),
-- Order #1006: DEADLINE TODAY + Orders Today (Rush custom order created & due today) + Urgent Priority
(1006, 4, CURRENT_DATE, CURRENT_DATE, '17:30:00', 'In Production', 'Urgent', 2, 'Showroom stock table custom-trimmed to 100x100cm for same-day Pampanga pickup.'),
-- Order #1007: COMPLETED ORDER (Fully paid & delivered)
(1007, 4, DATE_SUB(CURRENT_DATE, INTERVAL 18 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), '11:00:00', 'Completed', 'Normal', 3, 'Delivered and inspected by Dr. Ronald Ramos in San Fernando, Pampanga.')
ON DUPLICATE KEY UPDATE
    DueDate = VALUES(DueDate),
    DeadlineTime = VALUES(DeadlineTime),
    Status = VALUES(Status),
    Priority = VALUES(Priority),
    AssignedEmployeeID = VALUES(AssignedEmployeeID),
    JobNotes = VALUES(JobNotes);

INSERT INTO Order_Item (OrderItemID, OrderID, ProductID, ItemType, Quantity, UnitPrice) VALUES
(2003, 1003, 3, 'Customized', 1, 44000.00),
(2004, 1004, 5, 'Customized', 2, 24500.00),
(2005, 1005, 4, 'Standard',   2, 12800.00),
(2006, 1006, 6, 'Customized', 1, 18900.00),
(2007, 1007, 1, 'Standard',   1, 28500.00)
ON DUPLICATE KEY UPDATE Quantity = VALUES(Quantity), UnitPrice = VALUES(UnitPrice);

INSERT INTO Payment (PaymentID, OrderID, PaymentType, Amount, PaymentDate) VALUES
(3, 1003, 'Downpayment', 22000.00, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY)),
(4, 1004, 'Downpayment', 24500.00, DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY)),
(5, 1007, 'Downpayment', 14250.00, DATE_SUB(CURRENT_DATE, INTERVAL 18 DAY)),
(6, 1007, 'Final',       14250.00, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY))
ON DUPLICATE KEY UPDATE Amount = VALUES(Amount);
