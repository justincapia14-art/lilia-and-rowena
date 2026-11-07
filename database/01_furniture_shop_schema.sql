-- =====================================================================
-- FURNITURE SHOP MANAGEMENT AND SALES SYSTEM
-- PHYSICAL DESIGN, FILE 1 OF 3: create the database and tables
-- DBMS: MySQL 8+ / MariaDB 10.4+ (XAMPP works)
-- Run order: 01 (this file) -> 02_sample_data.sql -> 03_sql_operations_and_queries.sql
-- =====================================================================

-- Only uncomment the next line if you want to wipe everything and start over.
-- DROP DATABASE IF EXISTS furniture_shop;

CREATE DATABASE IF NOT EXISTS furniture_shop
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE furniture_shop;

-- Tables are created parent first, then child, so every FOREIGN KEY
-- points to a table that already exists.
-- ---------------------------------------------------------------------
-- 2. Category
-- ---------------------------------------------------------------------
CREATE TABLE Category (
    CategoryID    INT           NOT NULL AUTO_INCREMENT,
    CategoryName  VARCHAR(50)   NOT NULL,
    Description   VARCHAR(255)  NULL,
    CONSTRAINT pk_category PRIMARY KEY (CategoryID),
    CONSTRAINT uq_category_name UNIQUE (CategoryName)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 3. Supplier
-- ---------------------------------------------------------------------
CREATE TABLE Supplier (
    SupplierID         INT           NOT NULL AUTO_INCREMENT,
    SupplierName       VARCHAR(100)  NOT NULL,
    ContactPersonName  VARCHAR(100)  NULL,
    Phone              VARCHAR(20)   NOT NULL,
    Address            VARCHAR(255)  NULL,
    CONSTRAINT pk_supplier PRIMARY KEY (SupplierID),
    CONSTRAINT uq_supplier_email UNIQUE (Email)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 4. Customer: client-side login uses Email + PasswordHash
-- ---------------------------------------------------------------------
CREATE TABLE Customer (
    CustomerID    INT           NOT NULL AUTO_INCREMENT,
    FullName      VARCHAR(100)  NOT NULL,
    Email         VARCHAR(100)  NOT NULL,
    PasswordHash  VARCHAR(255)  NOT NULL,
    PhoneNumber   VARCHAR(20)   NOT NULL,
    Address       VARCHAR(255)  NOT NULL,
    CONSTRAINT pk_customer PRIMARY KEY (CustomerID),
    CONSTRAINT uq_customer_email UNIQUE (Email)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 5. Employee: worker records only (carpenters, finisher, drivers); no login
-- ---------------------------------------------------------------------
CREATE TABLE Employee (
    EmployeeID   INT           NOT NULL AUTO_INCREMENT,
    FullName     VARCHAR(100)  NOT NULL,
    Role         VARCHAR(30)   NOT NULL,
    PhoneNumber  VARCHAR(20)   NULL,
    HireDate     DATE          NOT NULL,
    Status       VARCHAR(20)   NOT NULL DEFAULT 'Active',
    CONSTRAINT pk_employee PRIMARY KEY (EmployeeID),
    CONSTRAINT chk_employee_role   CHECK (Role IN ('Carpenter', 'Finisher', 'Driver', 'Helper')),
    CONSTRAINT chk_employee_status CHECK (Status IN ('Active', 'Inactive'))
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 6. Product: the catalog (ProductCode is used by binary search)
-- ---------------------------------------------------------------------
CREATE TABLE Product (
    ProductID       INT            NOT NULL AUTO_INCREMENT,
    CategoryID      INT            NOT NULL,
    ProductName     VARCHAR(100)   NOT NULL,
    Description     VARCHAR(255)   NULL,
    BasePrice       DECIMAL(10,2)  NOT NULL,
    ImagePath       VARCHAR(255)   NULL,
    IsCustomizable  TINYINT(1)     NOT NULL DEFAULT 1,
    CONSTRAINT pk_product PRIMARY KEY (ProductID),
    CONSTRAINT chk_product_price CHECK (BasePrice >= 0),
    CONSTRAINT fk_product_category FOREIGN KEY (CategoryID)
        REFERENCES Category (CategoryID)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 7. Material: raw materials (MaterialCode is used by binary search)
-- ---------------------------------------------------------------------
CREATE TABLE Material (
    MaterialID     INT            NOT NULL AUTO_INCREMENT,
    SupplierID     INT            NOT NULL,
    MaterialName   VARCHAR(100)   NOT NULL,
    MaterialType   VARCHAR(50)    NOT NULL,
    Unit           VARCHAR(20)    NOT NULL,
    UnitCost       DECIMAL(10,2)  NOT NULL,
    StockQuantity  DECIMAL(10,2)  NOT NULL DEFAULT 0,
    CONSTRAINT pk_material PRIMARY KEY (MaterialID),
    CONSTRAINT chk_material_cost  CHECK (UnitCost >= 0),
    CONSTRAINT chk_material_stock CHECK (StockQuantity >= 0),
    CONSTRAINT fk_material_supplier FOREIGN KEY (SupplierID)
        REFERENCES Supplier (SupplierID)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;


CREATE TABLE Admin (
    AdminID      INT           NOT NULL AUTO_INCREMENT,
    Email        VARCHAR(100)  NOT NULL,
    Password     VARCHAR(255)  NOT NULL,           -- password_hash() output, never plain text
    ProductID    INT           NULL,
    CategoryID   INT           NULL,
    MaterialID   INT           NULL,
    EmployeeID   INT           NULL,
    SupplierID   INT           NULL,
    CONSTRAINT pk_admin PRIMARY KEY (AdminID),
    CONSTRAINT uq_admin_email UNIQUE (Email),
    CONSTRAINT fk_admin_product  FOREIGN KEY (ProductID)
        REFERENCES Product (ProductID)   ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_admin_category FOREIGN KEY (CategoryID)
        REFERENCES Category (CategoryID) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_admin_material FOREIGN KEY (MaterialID)
        REFERENCES Material (MaterialID) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_admin_employee FOREIGN KEY (EmployeeID)
        REFERENCES Employee (EmployeeID) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_admin_supplier FOREIGN KEY (SupplierID)
        REFERENCES Supplier (SupplierID) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 8. Customer_Order: header of an order (the whole purchase)
-- ---------------------------------------------------------------------
CREATE TABLE Customer_Order (
    OrderID             INT           NOT NULL AUTO_INCREMENT,
    CustomerID          INT           NOT NULL,
    OrderDate           DATE          NOT NULL DEFAULT (CURRENT_DATE),
    DueDate             DATE          NULL,
    DeadlineTime        TIME          NULL DEFAULT '17:00:00',
    Status              VARCHAR(30)   NOT NULL DEFAULT 'Pending',
    Priority            VARCHAR(20)   NOT NULL DEFAULT 'Normal',
    AssignedEmployeeID  INT           NULL,
    JobNotes            VARCHAR(255)  NULL,
    CONSTRAINT pk_order PRIMARY KEY (OrderID),
    CONSTRAINT chk_order_status CHECK (Status IN
        ('Pending', 'Order Confirmed', 'Confirmed', 'In Production', 'For Delivery', 'Ready', 'Delivered', 'Completed', 'Cancelled')),
    CONSTRAINT chk_order_priority CHECK (Priority IN ('Normal', 'High', 'Urgent')),
    CONSTRAINT chk_order_dates CHECK (DueDate IS NULL OR DueDate >= OrderDate),
    CONSTRAINT fk_order_customer FOREIGN KEY (CustomerID)
        REFERENCES Customer (CustomerID)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_order_assigned_employee FOREIGN KEY (AssignedEmployeeID)
        REFERENCES Employee (EmployeeID)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 9. Order_Item: one ordered piece (junction between orders and products)
--    ProductID may be NULL for a fully custom piece with no catalog base.
--    UnitPrice is the agreed price at the time of the order
--    (BasePrice + ExtraCost for customized catalog pieces).
-- ---------------------------------------------------------------------
CREATE TABLE Order_Item (
    OrderItemID  INT            NOT NULL AUTO_INCREMENT,
    OrderID      INT            NOT NULL,
    ProductID    INT            NULL,
    ItemType     VARCHAR(20)    NOT NULL,
    Quantity     INT            NOT NULL DEFAULT 1,
    UnitPrice    DECIMAL(10,2)  NOT NULL,
    CONSTRAINT pk_order_item PRIMARY KEY (OrderItemID),
    CONSTRAINT chk_item_type  CHECK (ItemType IN ('Standard', 'Customized')),
    CONSTRAINT chk_item_qty   CHECK (Quantity > 0),
    CONSTRAINT chk_item_price CHECK (UnitPrice >= 0),
    CONSTRAINT fk_item_order FOREIGN KEY (OrderID)
        REFERENCES Customer_Order (OrderID)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (ProductID)
        REFERENCES Product (ProductID)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 10. Customization: specs of a customized piece (1:1 optional with Order_Item)
-- ---------------------------------------------------------------------
CREATE TABLE Customization (
    CustomizationID  INT            NOT NULL AUTO_INCREMENT,
    OrderItemID      INT            NOT NULL,
    Length           DECIMAL(6,2)   NULL,           -- centimeters
    Width            DECIMAL(6,2)   NULL,
    Height           DECIMAL(6,2)   NULL,
    ColorFinish      VARCHAR(50)    NULL,
    Notes            VARCHAR(255)   NULL,
    ExtraCost        DECIMAL(10,2)  NOT NULL DEFAULT 0,
    CONSTRAINT pk_customization PRIMARY KEY (CustomizationID),
    CONSTRAINT uq_customization_item UNIQUE (OrderItemID),      -- makes it 1:1
    CONSTRAINT chk_custom_cost CHECK (ExtraCost >= 0),
    CONSTRAINT fk_custom_item FOREIGN KEY (OrderItemID)
        REFERENCES Order_Item (OrderItemID)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 11. Order_Item_Material: junction (M:N) between ordered pieces and materials
-- ---------------------------------------------------------------------
CREATE TABLE Order_Item_Material (
    OrderItemID   INT            NOT NULL,
    MaterialID    INT            NOT NULL,
    QuantityUsed  DECIMAL(10,2)  NOT NULL,
    CONSTRAINT pk_item_material PRIMARY KEY (OrderItemID, MaterialID),   -- composite key
    CONSTRAINT chk_qty_used CHECK (QuantityUsed > 0),
    CONSTRAINT fk_oim_item FOREIGN KEY (OrderItemID)
        REFERENCES Order_Item (OrderItemID)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_oim_material FOREIGN KEY (MaterialID)
        REFERENCES Material (MaterialID)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 12. Production_Task: junction (M:N) between ordered pieces and workers
-- ---------------------------------------------------------------------
CREATE TABLE Production_Task (
    TaskID       INT          NOT NULL AUTO_INCREMENT,
    OrderItemID  INT          NOT NULL,
    EmployeeID   INT          NOT NULL,
    Stage        VARCHAR(30)  NOT NULL,
    StartDate    DATE         NULL,
    EndDate      DATE         NULL,
    TaskStatus   VARCHAR(20)  NOT NULL DEFAULT 'Pending',
    CONSTRAINT pk_task PRIMARY KEY (TaskID),
    CONSTRAINT chk_task_stage  CHECK (Stage IN ('Cutting', 'Assembly', 'Sanding', 'Finishing')),
    CONSTRAINT chk_task_status CHECK (TaskStatus IN ('Pending', 'In Progress', 'Done')),
    CONSTRAINT chk_task_dates  CHECK (StartDate IS NULL OR EndDate IS NULL OR EndDate >= StartDate),
    CONSTRAINT fk_task_item FOREIGN KEY (OrderItemID)
        REFERENCES Order_Item (OrderItemID)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_task_employee FOREIGN KEY (EmployeeID)
        REFERENCES Employee (EmployeeID)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 13. Payment: cash only, so there is no PaymentMethod column.
--     One order can have several payments (downpayment, progress, final).
--     Balance and paid status are calculated by queries, not stored.
-- ---------------------------------------------------------------------
CREATE TABLE Payment (
    PaymentID    INT            NOT NULL AUTO_INCREMENT,
    OrderID      INT            NOT NULL,
    PaymentType  VARCHAR(20)    NOT NULL,
    Amount       DECIMAL(10,2)  NOT NULL,
    PaymentDate  DATE           NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT pk_payment PRIMARY KEY (PaymentID),
    CONSTRAINT chk_payment_type   CHECK (PaymentType IN ('Downpayment', 'Progress', 'Final')),
    CONSTRAINT chk_payment_amount CHECK (Amount > 0),
    CONSTRAINT fk_payment_order FOREIGN KEY (OrderID)
        REFERENCES Customer_Order (OrderID)
        ON UPDATE CASCADE ON DELETE RESTRICT          -- keep money records
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 14. Delivery: one delivery per order, done by the shop's own driver
-- ---------------------------------------------------------------------
CREATE TABLE Delivery (
    DeliveryID       INT           NOT NULL AUTO_INCREMENT,
    OrderID          INT           NOT NULL,
    DriverID         INT           NOT NULL,
    ReceiverName     VARCHAR(100)  NOT NULL,
    DeliveryAddress  VARCHAR(255)  NOT NULL,
    ScheduledDate    DATE          NOT NULL,
    DeliveryStatus   VARCHAR(20)   NOT NULL DEFAULT 'Scheduled',
    CONSTRAINT pk_delivery PRIMARY KEY (DeliveryID),
    CONSTRAINT uq_delivery_order UNIQUE (OrderID),               -- makes it 1:1
    CONSTRAINT chk_delivery_status CHECK (DeliveryStatus IN ('Scheduled', 'Out for Delivery', 'Delivered')),
    CONSTRAINT fk_delivery_order FOREIGN KEY (OrderID)
        REFERENCES Customer_Order (OrderID)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_delivery_driver FOREIGN KEY (DriverID)
        REFERENCES Employee (EmployeeID)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- 15. Order_Message: real-time messaging between Customer and Admin
--     Allows customers to follow up on an order, request custom add-ons,
--     or message the workshop Admin directly.
-- ---------------------------------------------------------------------
CREATE TABLE Order_Message (
    MessageID    INT           NOT NULL AUTO_INCREMENT,
    CustomerID   INT           NOT NULL,
    OrderID      INT           NULL,
    AdminID      INT           NULL,
    SenderRole   VARCHAR(20)   NOT NULL,
    SenderName   VARCHAR(100)  NOT NULL,
    Topic        VARCHAR(60)   NOT NULL DEFAULT 'Order Follow-Up',
    MessageText  TEXT          NOT NULL,
    CreatedAt    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_order_message PRIMARY KEY (MessageID),
    CONSTRAINT chk_message_sender CHECK (SenderRole IN ('Customer', 'Admin')),
    CONSTRAINT fk_msg_customer FOREIGN KEY (CustomerID)
        REFERENCES Customer (CustomerID)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_msg_order FOREIGN KEY (OrderID)
        REFERENCES Customer_Order (OrderID)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_msg_admin FOREIGN KEY (AdminID)
        REFERENCES Admin (AdminID)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE = InnoDB;

-- Evidence for your screenshots:
SHOW TABLES;
-- DESCRIBE Customer_Order;
-- SHOW CREATE TABLE Order_Item;