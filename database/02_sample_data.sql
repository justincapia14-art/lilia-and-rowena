-- =====================================================================
-- LILIA AND ROWENA FURNITURE - SAMPLE SEED DATA
-- PHYSICAL DESIGN, FILE 2 OF 3: Insert Initial Sample Records
-- DBMS: MySQL 8+ / MariaDB 10.4+ (XAMPP works)
-- Run this AFTER running 01_furniture_shop_schema.sql
-- =====================================================================

USE furniture_shop;

-- 1. Insert Categories
INSERT INTO Category (CategoryID, CategoryName, Description) VALUES
(1, 'Living Room', 'Artisanal sofas, coffee tables, media consoles, and accent lounge chairs.'),
(2, 'Dining Sets', 'Solid mahogany and teak dining tables with 4, 6, and 8-seater configurations.'),
(3, 'Bedroom Suite', 'Solid wood king & queen bedframes, floating nightstands, and wardrobes.'),
(4, 'Home Office', 'Executive ergonomic desks, solid wood bookshelves, and filing credenzas.')
ON DUPLICATE KEY UPDATE CategoryName = VALUES(CategoryName);

-- 2. Insert Suppliers
INSERT INTO Supplier (SupplierID, SupplierName, ContactPersonName, Phone, Address) VALUES
(1, 'Pampanga Sustainable Hardwoods Inc.', 'Don Rafael Pineda', '0917-555-1234', 'Guagua, Pampanga'),
(2, 'Luzon Timber & Kiln-Drying Mill', 'Arturo Maglangit', '0918-222-7890', 'Valenzuela City, Metro Manila'),
(3, 'Artisan Upholstery & Fabrics Co.', 'Carmen Del Rosario', '0922-888-4321', 'Binondo, Manila')
ON DUPLICATE KEY UPDATE SupplierName = VALUES(SupplierName);

-- 3. Insert Employees (Carpenters, Finishers, Drivers, Helpers)
INSERT INTO Employee (EmployeeID, FullName, Role, PhoneNumber, HireDate, Status) VALUES
(1, 'Master Carding Santos', 'Carpenter', '0917-111-2222', '2015-03-12', 'Active'),
(2, 'Master Eddie Manalo', 'Carpenter', '0917-333-4444', '2018-06-20', 'Active'),
(3, 'Rene Ocampo', 'Driver', '0918-555-6666', '2019-11-05', 'Active'),
(4, 'Dante Cruz', 'Finisher', '0922-777-8888', '2020-02-14', 'Active'),
(5, 'Jun Morales', 'Helper', '0920-999-0000', '2022-08-01', 'Active')
ON DUPLICATE KEY UPDATE FullName = VALUES(FullName);

-- 4. Insert Products
INSERT INTO Product (ProductID, CategoryID, ProductName, Description, BasePrice, ImagePath, IsCustomizable) VALUES
(1, 2, 'Mahogany 6-Seater Dining Set', 'Handcrafted from 100% kiln-dried solid mahogany with mortise & tenon joinery. Includes 6 ergonomic slatted-back chairs.', 28500.00, 'images/product_dining_table.jpg', 1),
(2, 1, 'Scandinavian Sky Blue Lounge Sofa', 'Contemporary 3-seater living room sofa with soft woven sky blue upholstery and a solid kiln-dried ash wood base frame.', 34000.00, 'images/product_lounge_sofa.jpg', 1),
(3, 3, 'Minimalist Teak King Bedframe', 'Master bedroom platform bedframe with floating bedside drawers. Hand-finished with natural teak oil for a rich organic grain.', 42500.00, 'images/product_wooden_bedframe.jpg', 1),
(4, 1, 'Solid Acacia Round Coffee Table', 'Organic tree slab coffee table featuring natural live edges and brushed steel pedestal legs.', 12800.00, 'images/product_dining_table.jpg', 1),
(5, 4, 'Executive Ergonomic Oak Desk', 'Substantial home office work desk with 3 soft-closing drawers and built-in hidden cable management grommets.', 24500.00, 'images/product_dining_table.jpg', 1),
(6, 2, 'Compact 4-Seater Breakfast Nook Set', 'Space-saving solid wood square table with 4 stackable tapered-leg chairs designed for modern apartments and condos.', 18900.00, 'images/product_dining_table.jpg', 1)
ON DUPLICATE KEY UPDATE ProductName = VALUES(ProductName);

-- 5. Insert Raw Materials
INSERT INTO Material (MaterialID, SupplierID, MaterialName, MaterialType, Unit, UnitCost, StockQuantity) VALUES
(1, 1, 'Kiln-Dried Mahogany Planks (2"x8"x10\')', 'Hardwood', 'Board Feet', 145.00, 850.00),
(2, 1, 'Seasoned Teak Timber (3"x6"x8\')', 'Hardwood', 'Board Feet', 220.00, 420.00),
(3, 2, 'American White Ash Planks', 'Hardwood', 'Board Feet', 190.00, 310.00),
(4, 3, 'Sky Blue Woven Linen Fabric', 'Fabric', 'Meters', 450.00, 120.00),
(5, 2, 'Matte Polyurethane Clear Coat', 'Finishing', 'Gallons', 1250.00, 45.00)
ON DUPLICATE KEY UPDATE MaterialName = VALUES(MaterialName);

-- 6. Insert Admin Accounts (Table: Admin)
-- Default Password for both Admin accounts is: admin123
-- Hash generated via PHP password_hash('admin123', PASSWORD_DEFAULT)
INSERT INTO Admin (AdminID, Email, Password, ProductID, CategoryID, MaterialID, EmployeeID, SupplierID) VALUES
(1, 'admin@liliaandrowena.com', '$2y$10$abcdefghijklmnopqrstuuEZ4tpXm4W5SeJkDbuNdfJ.CF0.Wc2V2', 1, 1, 1, 1, 1),
(2, 'lilia.owner@liliaandrowena.com', '$2y$10$abcdefghijklmnopqrstuuEZ4tpXm4W5SeJkDbuNdfJ.CF0.Wc2V2', 2, 2, 2, 2, 2)
ON DUPLICATE KEY UPDATE Email = VALUES(Email), Password = VALUES(Password);

-- 7. Insert Sample Customers (Table: Customer)
-- Default Password for all Customer accounts is: password123
-- Hash generated via PHP password_hash('password123', PASSWORD_DEFAULT)
INSERT INTO Customer (CustomerID, FullName, Username, Email, PasswordHash, PhoneNumber, Gender, Birthday, ProfileImage, Address) VALUES
(1, 'Maria Teresa Santos', 'mariateresa_s', 'maria.santos@example.com', '$2y$10$abcdefghijklmnopqrstuu0SYq8twpcthS10uxQ26rv0s3Obj8Ufu', '0917-123-4567', 'Female', '1992-05-14', NULL, 'Unit 14B, Tower 2, Serendra, Brgy. Fort Bonifacio, Taguig City, Metro Manila, 1634'),
(2, 'Atty. Roberto Mendoza', 'atty_roberto', 'roberto.mendoza@example.com', '$2y$10$abcdefghijklmnopqrstuu0SYq8twpcthS10uxQ26rv0s3Obj8Ufu', '0918-987-6543', 'Male', '1985-11-22', NULL, '88 Narra Avenue, Ayala Alabang Village, Brgy. Ayala Alabang, Muntinlupa City, Metro Manila, 1780'),
(3, 'Engr. Danica Gomez', 'danica_gomez', 'danica.gomez@example.com', '$2y$10$abcdefghijklmnopqrstuu0SYq8twpcthS10uxQ26rv0s3Obj8Ufu', '0917-542-8810', 'Female', '1994-08-03', NULL, 'One Serendra, Bonifacio Global City, Brgy. Fort Bonifacio, Taguig City, Metro Manila, 1634'),
(4, 'Dr. Ronald & Elena Ramos', 'dr_ronald_ramos', 'ronald.ramos@example.com', '$2y$10$abcdefghijklmnopqrstuu0SYq8twpcthS10uxQ26rv0s3Obj8Ufu', '0918-334-9012', 'Male', '1979-02-19', NULL, 'Villa Barosa, Brgy. Dolores, San Fernando, Pampanga, 2000'),
(5, 'Arch. Marco & Patricia Villanueva', 'arch_marco', 'marco.villanueva@example.com', '$2y$10$abcdefghijklmnopqrstuu0SYq8twpcthS10uxQ26rv0s3Obj8Ufu', '0922-719-4401', 'Male', '1988-07-09', NULL, 'Beverly Hills Subdivision, Brgy. Beverly Hills, Antipolo, Rizal, 1870')
ON DUPLICATE KEY UPDATE FullName = VALUES(FullName), Username = VALUES(Username), PasswordHash = VALUES(PasswordHash);

-- 7B. Insert Saved Customer Delivery Addresses (Table: Customer_Address)
INSERT INTO Customer_Address (AddressID, CustomerID, RecipientName, PhoneNumber, HouseStreet, Barangay, City, Province, PostalCode, DeliveryInstructions, AddressLabel, IsDefault) VALUES
(101, 1, 'Maria Teresa Santos', '0917-123-4567', 'Unit 14B, Tower 2, Serendra, 11th Ave', 'Fort Bonifacio', 'Taguig City', 'Metro Manila', '1634', 'Coordinate with Tower 2 service elevator guard.', 'Home', 1),
(102, 1, 'Maria Teresa Santos (Office)', '0917-123-4567', '18F One Corporate Centre, Julia Vargas Ave', 'San Antonio', 'Pasig City', 'Metro Manila', '1605', 'Weekdays 9AM-5PM reception desk.', 'Work', 0),
(103, 2, 'Atty. Roberto Mendoza', '0918-987-6543', '88 Narra Avenue, Ayala Alabang Village', 'Ayala Alabang', 'Muntinlupa City', 'Metro Manila', '1780', 'Present delivery gate pass at Acacia Gate.', 'Home', 1)
ON DUPLICATE KEY UPDATE RecipientName = VALUES(RecipientName), IsDefault = VALUES(IsDefault);

-- 8. Insert Sample Customer Job Orders (Deadline Today, Orders Today, Overdue, Active, Unpaid, Completed)
INSERT INTO Customer_Order (OrderID, CustomerID, OrderDate, DueDate, DeadlineTime, Status, Priority, AssignedEmployeeID, JobNotes) VALUES
(1001, 1, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), CURRENT_DATE, '08:00:00', 'In Production', 'Urgent', 1, 'Custom 220cm length Mahogany 6-Seater Dining Set — Final walnut topcoat curing for delivery today.'),
(1002, 2, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), '14:00:00', 'Order Confirmed', 'High', 2, 'Scandinavian Sky Blue Lounge Sofa + 2 matching bolster pillows.'),
(1003, 3, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY), CURRENT_DATE, '10:30:00', 'For Delivery', 'High', 3, 'White-glove delivery to BGC Taguig scheduled before noon today.'),
(1004, 5, DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), '13:30:00', 'Pending', 'Urgent', 1, 'Awaiting final brass hardware fitting and custom stain approval.'),
(1005, 1, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), '15:00:00', 'In Production', 'High', 4, 'Second polyurethane clear coat drying in Pampanga workshop.'),
(1006, 4, CURRENT_DATE, CURRENT_DATE, '17:30:00', 'In Production', 'Urgent', 2, 'Showroom stock table custom-trimmed to 100x100cm for same-day Pampanga pickup.'),
(1007, 4, DATE_SUB(CURRENT_DATE, INTERVAL 18 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), '11:00:00', 'Completed', 'Normal', 3, 'Delivered and inspected by Dr. Ronald Ramos in San Fernando, Pampanga.')
ON DUPLICATE KEY UPDATE
    DueDate = VALUES(DueDate),
    DeadlineTime = VALUES(DeadlineTime),
    Status = VALUES(Status),
    Priority = VALUES(Priority),
    AssignedEmployeeID = VALUES(AssignedEmployeeID),
    JobNotes = VALUES(JobNotes);

-- 9. Insert Order Items
INSERT INTO Order_Item (OrderItemID, OrderID, ProductID, ItemType, Quantity, UnitPrice) VALUES
(2001, 1001, 1, 'Customized', 1, 30450.00),
(2002, 1002, 2, 'Standard',   1, 34000.00),
(2003, 1003, 3, 'Customized', 1, 44000.00),
(2004, 1004, 5, 'Customized', 2, 24500.00),
(2005, 1005, 4, 'Standard',   2, 12800.00),
(2006, 1006, 6, 'Customized', 1, 18900.00),
(2007, 1007, 1, 'Standard',   1, 28500.00)
ON DUPLICATE KEY UPDATE Quantity = VALUES(Quantity), UnitPrice = VALUES(UnitPrice);

-- 10. Insert Customization specs for OrderItem 2001 (Order #1001)
INSERT INTO Customization (CustomizationID, OrderItemID, Length, Width, Height, ColorFinish, Notes, ExtraCost) VALUES
(1, 2001, 220.00, 90.00, 75.00, 'Warm Walnut Stain', 'Extended table length to 220cm with matching warm walnut stain for dining room.', 1950.00)
ON DUPLICATE KEY UPDATE ExtraCost = VALUES(ExtraCost);

-- 11. Insert Production Tasks
INSERT INTO Production_Task (TaskID, OrderItemID, EmployeeID, Stage, StartDate, EndDate, TaskStatus) VALUES
(1, 2001, 1, 'Cutting', '2026-10-25', '2026-10-27', 'Done'),
(2, 2001, 1, 'Assembly', '2026-10-28', '2026-10-31', 'Done'),
(3, 2001, 4, 'Sanding', '2026-11-01', '2026-11-03', 'Done'),
(4, 2001, 4, 'Finishing', '2026-11-04', NULL, 'In Progress')
ON DUPLICATE KEY UPDATE TaskStatus = VALUES(TaskStatus);

-- 12. Insert Payments (50% Downpayment & Completed Full Payments)
INSERT INTO Payment (PaymentID, OrderID, PaymentType, Amount, PaymentDate) VALUES
(1, 1001, 'Downpayment', 15225.00, '2026-10-24'),
(2, 1002, 'Downpayment', 17000.00, CURRENT_DATE),
(3, 1003, 'Downpayment', 22000.00, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY)),
(4, 1004, 'Downpayment', 24500.00, DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY)),
(5, 1007, 'Downpayment', 14250.00, DATE_SUB(CURRENT_DATE, INTERVAL 18 DAY)),
(6, 1007, 'Final',       14250.00, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY))
ON DUPLICATE KEY UPDATE Amount = VALUES(Amount);

-- 13. Insert Delivery
INSERT INTO Delivery (DeliveryID, OrderID, DriverID, ReceiverName, DeliveryAddress, ScheduledDate, DeliveryStatus) VALUES
(1, 1001, 3, 'Maria Teresa Santos', 'Unit 14B, Tower 2, Serendra, BGC, Taguig City', CURRENT_DATE, 'Scheduled'),
(2, 1002, 3, 'Atty. Roberto Mendoza', '88 Narra Avenue, Ayala Alabang Village, Muntinlupa', DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), 'Scheduled'),
(3, 1003, 3, 'Engr. Danica Gomez', 'One Serendra, Bonifacio Global City, Taguig', CURRENT_DATE, 'Out for Delivery'),
(4, 1007, 3, 'Dr. Ronald & Elena Ramos', 'Villa Barosa, San Fernando, Pampanga', DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), 'Delivered')
ON DUPLICATE KEY UPDATE DeliveryStatus = VALUES(DeliveryStatus);

-- 14. Insert Order_Message (Private 1-on-1 Customer-Admin Conversations per CustomerID with IsRead tracking)
INSERT INTO Order_Message (MessageID, CustomerID, OrderID, AdminID, SenderRole, SenderName, Topic, MessageText, IsRead, CreatedAt) VALUES
(1, 1, 1001, NULL, 'Customer', 'Maria Teresa Santos', 'Order Follow-Up (#1001)', 'Good day! I would like to follow up on Order #1001 (220cm Mahogany Dining Set). Can we also add 2 extra matching dining chairs and felt floor protectors to our order?', 0, '2026-11-06 09:15:00'),
(2, 1, 1001, 1, 'Admin', 'Rowena & Lilia (Workshop Admin)', 'Order Follow-Up (#1001)', 'Hello Maria! Master Finisher Dante Cruz is currently applying the final walnut coat to your table. Yes, we can add 2 matching slatted mahogany chairs (+₱4,200) and complimentary felt pads before driver Rene Ocampo delivers on Nov 9!', 0, '2026-11-06 09:22:00'),
(3, 2, 1002, NULL, 'Customer', 'Atty. Roberto Mendoza', 'Add Custom Request (#1002)', 'Hello Admin, for my Order #1002 (Scandinavian Sky Blue Lounge Sofa), can we include 2 extra bolster throw pillows in the same sky blue linen fabric?', 0, '2026-11-06 10:05:00'),
(4, 2, 1002, 1, 'Admin', 'Rowena & Lilia (Workshop Admin)', 'Add Custom Request (#1002)', 'Good morning Atty. Roberto! We have reserved the extra Sky Blue Woven Linen fabric from Artisan Upholstery Co. and will hand-stitch 2 matching bolster pillows (+₱1,800) for your Order #1002.', 0, '2026-11-06 10:14:00')
ON DUPLICATE KEY UPDATE MessageText = VALUES(MessageText), IsRead = VALUES(IsRead);



