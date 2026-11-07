-- =====================================================================
-- LILIA AND ROWENA FURNITURE - SAFE DATABASE MIGRATION SCRIPT
-- FILE 4: Customer My Profile, Multiple Delivery Addresses, and Message Read/Unread Tracking
-- Run this on an existing `furniture_shop` database to add new columns/tables safely
-- without deleting any existing customers, orders, or messages.
-- =====================================================================

USE furniture_shop;

-- 1. Add Profile Columns to `Customer` table (if not already present)
ALTER TABLE Customer
    ADD COLUMN IF NOT EXISTS Username     VARCHAR(50)  NULL AFTER FullName,
    ADD COLUMN IF NOT EXISTS Gender       VARCHAR(20)  NULL AFTER PhoneNumber,
    ADD COLUMN IF NOT EXISTS Birthday     DATE         NULL AFTER Gender,
    ADD COLUMN IF NOT EXISTS ProfileImage VARCHAR(255) NULL AFTER Birthday;

-- 2. Create `Customer_Address` table for Shopee-style Multiple Saved Delivery Addresses
CREATE TABLE IF NOT EXISTS Customer_Address (
    AddressID             INT           NOT NULL AUTO_INCREMENT,
    CustomerID            INT           NOT NULL,
    RecipientName         VARCHAR(100)  NOT NULL,
    PhoneNumber           VARCHAR(20)   NOT NULL,
    HouseStreet           VARCHAR(150)  NOT NULL,
    Barangay              VARCHAR(100)  NOT NULL,
    City                  VARCHAR(100)  NOT NULL,
    Province              VARCHAR(100)  NOT NULL,
    PostalCode            VARCHAR(20)   NOT NULL,
    DeliveryInstructions  VARCHAR(255)  NULL,
    AddressLabel          VARCHAR(20)   NOT NULL DEFAULT 'Home',
    IsDefault             TINYINT(1)    NOT NULL DEFAULT 0,
    CreatedAt             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_customer_address PRIMARY KEY (AddressID),
    CONSTRAINT fk_address_customer FOREIGN KEY (CustomerID)
        REFERENCES Customer (CustomerID)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

-- 3. Add Read/Unread Notification Columns to `Order_Message` table
ALTER TABLE Order_Message
    ADD COLUMN IF NOT EXISTS IsRead TINYINT(1) NOT NULL DEFAULT 0 AFTER MessageText,
    ADD COLUMN IF NOT EXISTS ReadAt DATETIME   NULL AFTER IsRead;

-- 4. Seed initial default addresses from existing Customer records if Customer_Address is empty
INSERT INTO Customer_Address (AddressID, CustomerID, RecipientName, PhoneNumber, HouseStreet, Barangay, City, Province, PostalCode, DeliveryInstructions, AddressLabel, IsDefault)
VALUES
(101, 1, 'Maria Teresa Santos', '0917-123-4567', 'Unit 14B, Tower 2, Serendra, 11th Ave', 'Fort Bonifacio', 'Taguig City', 'Metro Manila', '1634', 'Coordinate with Tower 2 service elevator guard.', 'Home', 1),
(102, 1, 'Maria Teresa Santos (Office)', '0917-123-4567', '18F One Corporate Centre, Julia Vargas Ave', 'San Antonio', 'Pasig City', 'Metro Manila', '1605', 'Weekdays 9AM-5PM reception desk.', 'Work', 0),
(103, 2, 'Atty. Roberto Mendoza', '0918-987-6543', '88 Narra Avenue, Ayala Alabang Village', 'Ayala Alabang', 'Muntinlupa City', 'Metro Manila', '1780', 'Present delivery gate pass at Acacia Gate.', 'Home', 1)
ON DUPLICATE KEY UPDATE RecipientName = VALUES(RecipientName);
