# LILIA AND ROWENA FURNITURE - COMPLETE PHP PROJECT & SETUP GUIDE

## 📋 Table of Contents
1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Folder Organization (Detailed Hierarchy)](#2-folder-organization-detailed-hierarchy)
3. [Step-by-Step Installation & Setup (XAMPP & MySQL)](#3-step-by-step-installation--setup-xampp--mysql)
4. [PSR-4 Autoloading & Composer Instructions](#4-psr-4-autoloading--composer-instructions)
5. [Conversion-Focused Homepage Design Breakdown](#5-conversion-focused-homepage-design-breakdown)
6. [Testing the Core Workflows (Customer, Admin & Live Chat)](#6-testing-the-core-workflows-customer-admin--live-chat)

---

## 1. Project Overview & Architecture
This project is built for **LILIA AND ROWENA FURNITURE**, an artisanal solid wood furniture workshop based in Pampanga and Manila.

### Key Architectural Highlights:
- **Clean MVC & PSR-4 Architecture**: Follows PHP Standards Recommendation (PSR-4) with namespace `App\`.
- **Database-Driven**: Direct PDO connection to `furniture_shop` utilizing the exact physical database design.
- **Light Blue & Crisp White Palette**: Modern, conversion-focused luxury aesthetic.
- **Minimal Vanilla JavaScript**: Zero heavy JS frameworks (no React/Vue/jQuery/TSX). Plain DOM manipulations with clear comments.
- **Real-Time Customer-to-Admin Messaging**: Live order follow-up and custom add-on chat connected to the `Order_Message` table.
- **No Complex Algorithms**: Clean procedural and object-oriented flow so your team can easily integrate custom algorithms or data structures later if required by your instructor.

---

## 2. Folder Organization (Detailed Hierarchy)

Here is the organized directory hierarchy designed for easy debugging and team collaboration:

```
lilia_and_rowena_furniture/
├── composer.json                  <- Defines PSR-4 namespace ("App\\": "src/")
├── config/
│   └── database.php               <- PDO connection credentials (host, dbname, user, password)
├── database/
│   ├── 01_furniture_shop_schema.sql  <- Physical Database Tables (Run First)
│   └── 02_sample_data.sql            <- Initial Seed Data (Products, Categories, Admin, Customers, Messages)
├── public/                        <- Document Root (Publicly accessible files only)
│   ├── index.php                  <- Front Controller & URL Router (Entry point)
│   ├── css/
│   │   └── style.css              <- Light blue + white styling & responsive grid
│   ├── js/
│   │   └── main.js                <- Simple vanilla JS with clear English comments
│   └── images/                    <- Product & Showroom photography
├── src/                           <- Application Core Logic (Protected from direct web access)
│   ├── Config/
│   │   └── Database.php           <- Database Singleton class
│   ├── Controllers/
│   │   ├── HomeController.php     <- Homepage, Catalog & Product details
│   │   ├── AuthController.php     <- Customer & Admin Login, Registration & Session Logout
│   │   ├── AdminController.php    <- Admin Dashboard & Order Status Management
│   │   ├── MessageController.php  <- Real-Time Customer <-> Admin Order Follow-Up & Add-On Chat
│   │   ├── CartController.php     <- Session Cart & Dimension Customization
│   │   └── OrderController.php    <- Checkout, Payments & Order Tracking
│   └── Models/
│       ├── Admin.php              <- Admin table auth & workshop dashboard queries
│       ├── Category.php           <- Category table queries
│       ├── Customer.php           <- Customer table & password_hash auth
│       ├── Message.php            <- Order_Message table live chat queries
│       ├── Product.php            <- Product table catalog queries
│       └── Order.php              <- Transactional handler for Orders & Deliveries
└── views/                         <- HTML Templates (Separated from PHP business logic)
    ├── layouts/
    │   ├── header.php             <- Top notification, Logo, Nav & Cart counter
    │   └── footer.php             <- Trust badges, Showroom address & Links
    ├── home.php                   <- 8-Section Conversion-Focused Homepage
    ├── catalog.php                <- Furniture Catalog with Category Filters
    ├── product_detail.php         <- Interactive Customization Sizing Calculator
    ├── cart.php                   <- Shopping Cart & Downpayment breakdown
    ├── checkout.php               <- Delivery recipient form & COD terms
    ├── order_success.php          <- Order Confirmation ticket
    ├── track_order.php            <- Visual production timeline & driver details
    ├── messages.php               <- Live Customer <-> Admin Order Follow-Up & Add-On Chat
    ├── admin_dashboard.php        <- Admin Console (Orders, Live Messages, Materials, Employees)
    ├── login.php                  <- Customer & Admin Login Form
    └── register.php               <- Customer Registration Form
```

---

## 3. Step-by-Step Installation & Setup (XAMPP & MySQL)

### Step 1: Copy Project to XAMPP
1. Open your XAMPP installation directory (typically `C:\xampp\htdocs\`).
2. Extract or copy the project folder into:
   ```
   C:\xampp\htdocs\lilia_and_rowena_furniture\
   ```

### Step 2: Start Apache and MySQL
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **Apache**.
3. Click **Start** next to **MySQL**.

### Step 3: Import the Database
1. Open your browser and navigate to: `http://localhost/phpmyadmin/`
2. Click the **Import** tab at the top.
3. Select the file:
   `C:\xampp\htdocs\lilia_and_rowena_furniture\database\01_furniture_shop_schema.sql`
   and click **Go**.
4. Once the `furniture_shop` database is created, import the seed data file:
   `C:\xampp\htdocs\lilia_and_rowena_furniture\database\02_sample_data.sql`
   and click **Go**.

### Step 4: Access the Website
Open your browser and visit:
```
http://localhost/lilia_and_rowena_furniture/public/
```
*(Or using the PHP built-in development server in a terminal: `cd public && php -S localhost:8000`)*

---

## 4. PSR-4 Autoloading & Composer Instructions

The application follows the PSR-4 autoloading standard:
```json
"autoload": {
    "psr-4": {
        "App\\": "src/"
    }
}
```

### How to run Composer:
1. Open a Terminal or Command Prompt inside the project root directory:
   ```bash
   cd C:\xampp\htdocs\lilia_and_rowena_furniture
   composer dump-autoload
   ```
2. **Built-in Fallback:** If Composer is not installed on a teammate's or instructor's machine, **the website will still run without errors!** `public/index.php` includes a native PSR-4 `spl_autoload_register` fallback so all `App\` classes load automatically out of the box.

---

## 5. Conversion-Focused Homepage Design Breakdown

Each section of the homepage is engineered to turn visitors into customers:

1. **Hero Section (Above the Fold)**
   - *Purpose:* Capture attention and communicate the value proposition within the first 3 seconds.
   - *Content:* Editorial headline, showroom photography, dual CTA buttons (Explore Collection & Request Bespoke Sizing), and 3 instant trust badges.
   - *Conversion Contribution:* Eliminates ambiguity and gives visitors 1-click access to the catalog.

2. **Trust & Credibility Strip (Metrics)**
   - *Purpose:* Prove workshop legitimacy and craftsmanship track record.
   - *Content:* 28+ Years experience, 2,400+ homes furnished, 100% kiln-dried hardwood, 4.9/5 client satisfaction.
   - *Conversion Contribution:* Reduces buyer hesitation on high-ticket furniture purchases.

3. **Services Overview (Custom Carpentry, Finishes, Delivery)**
   - *Purpose:* Show buyers they are not limited to standard sizes and can order pieces tailored to their floorplan.
   - *Content:* 4 service cards with clear descriptions and direct links to the custom sizing studio.
   - *Conversion Contribution:* Unlocks higher-value custom bespoke orders.

4. **Strategic Benefits (Why Choose Solid Hardwood vs Flat-Pack)**
   - *Purpose:* Differentiate Lilia & Rowena from commercial particleboard and imported flat-pack brands.
   - *Content:* 3 core benefits (Direct-from-workshop pricing, perfect spatial fit guarantee, safe 50% downpayment model).
   - *Conversion Contribution:* Elevates perceived value before customers compare prices.

5. **Featured Collection Grid**
   - *Purpose:* Showcase signature best-sellers with transparent pricing and immediate customization.
   - *Content:* High-resolution product photography, category tags, base prices, and "Customize" / "Add to Cart" buttons.
   - *Conversion Contribution:* Converts high-intent shoppers with zero friction.

6. **Customer Testimonials & Social Proof**
   - *Purpose:* Build trust through verified stories from homeowners and interior designers.
   - *Content:* 5-star ratings, detailed quotes (custom 220cm dining set, master bedroom teak bedframe), and client attribution.
   - *Conversion Contribution:* Reinforces buyer confidence through peer validation.

7. **Objection-Busting FAQs**
   - *Purpose:* Address common buyer questions before they cause checkout abandonment.
   - *Content:* Wood species used, custom dimension workflow, 50% downpayment & COD terms, lead times (10-14 days), and 5-year structural warranty.
   - *Conversion Contribution:* Removes purchase friction and support bottlenecks.

8. **Final High-Impact Call to Action**
   - *Purpose:* Provide a decisive closing prompt at the bottom of the page.
   - *Content:* Direct workshop phone line and catalog button.
   - *Conversion Contribution:* Captures visitors who scrolled through the entire page.

---

## 6. Testing the Core Workflows (Customer, Admin & Live Chat)

### Default Admin Account (`Admin` Table):
- **Email:** `admin@liliaandrowena.com` (or `lilia.owner@liliaandrowena.com`)
- **Password:** `admin123`
- **Features:** Access the **Admin Management Console** (`index.php?route=admin_dashboard`) to update `Customer_Order` statuses (`Pending`, `Confirmed`, `In Production`, `Ready`, `Delivered`), reply to customer messages in the **Live Customer Order Follow-Up & Add-On Inbox** (`Order_Message` table), inspect `Material` stock, and view `Employee` assignments.

### Default Customer Account (`Customer` Table):
- **Email:** `maria.santos@example.com` (or `roberto.mendoza@example.com`)
- **Password:** `password123`
- **Features:** Browse & filter catalog, configure custom dimensions (`Length`, `Width`, `Height`, `ColorFinish`), place orders with 50% downpayment, track live order stages, and message the Admin in real time to follow up on an order or request custom add-ons.

### Sample Order Tracking:
- **Order #:** `1001` (Status: In Production, Custom 220cm Mahogany Dining Set)
- **Order #:** `1002` (Status: Confirmed, Scandinavian Sky Blue Lounge Sofa)
