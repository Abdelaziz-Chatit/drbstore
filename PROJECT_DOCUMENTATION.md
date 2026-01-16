# DRB Store - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Key Features](#key-features)
5. [User Roles & Access Control](#user-roles--access-control)
6. [Database Schema](#database-schema)
7. [Application Flow](#application-flow)
8. [Route Structure](#route-structure)
9. [Key Functions & Locations](#key-functions--locations)
10. [Setup & Installation](#setup--installation)
11. [Running the Project](#running-the-project)

---

## 🎯 Project Overview

**DRB Store** is a modern, full-featured e-commerce platform built with Node.js and Express.js. It provides a complete shopping experience with user authentication, product catalog management, shopping cart functionality, secure payments via Stripe, and a comprehensive admin panel for managing store operations.

The platform supports multiple user roles with different permission levels:
- **Customers**: Browse products, add to cart, checkout
- **Managers**: Manage products, categories, and advertisements
- **Admins**: Full control over all store features

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (JavaScript)
- **Framework**: Express.js v4.18.2
- **Database**: MySQL 2
- **Session Management**: express-session
- **Authentication**: bcryptjs (password hashing)
- **File Upload**: multer

### Frontend
- **Template Engine**: EJS (Embedded JavaScript)
- **Layout System**: express-ejs-layouts
- **Styling**: CSS (custom design)
- **Client-side JS**: Vanilla JavaScript

### Payment Integration
- **Stripe API**: v14.7.0 (payment processing)

### Utilities
- **Environment Variables**: dotenv
- **Input Validation**: express-validator
- **Development**: nodemon (auto-reload)

---

## 📁 Project Structure

```
drbStore/
├── config/
│   ├── database.js              # MySQL connection pool
│   ├── database.sql             # Database schema & tables
│   └── seedDatabase.js          # Initial data seeding
│
├── middleware/
│   └── authMiddleware.js        # Authentication & authorization functions
│                                # (isAdmin, isManager, isAuthenticated, etc.)
│
├── routes/                       # All route handlers
│   ├── home.js                  # Homepage & landing page
│   ├── products.js              # Product catalog & display
│   ├── cart.js                  # Shopping cart operations
│   ├── checkout.js              # Payment & order checkout
│   ├── auth.js                  # Login, register, logout, profile
│   ├── admin.js                 # Admin & manager dashboards, CRUD operations
│   └── api.js                   # API endpoints
│
├── views/                        # EJS template files
│   ├── layout.ejs               # Master layout (header, nav, footer)
│   ├── error.ejs                # Error page template
│   ├── profile.ejs              # User profile page
│   │
│   ├── auth/                    # Authentication pages
│   │   ├── login.ejs            # Login form
│   │   └── register.ejs         # Registration form
│   │
│   ├── home/                    # Customer facing pages
│   │   └── index.ejs            # Homepage
│   │
│   ├── products/                # Product browsing
│   │   ├── catalog.ejs          # Product list
│   │   └── show.ejs             # Single product detail
│   │
│   ├── cart/                    # Shopping cart
│   │   └── index.ejs            # Cart page
│   │
│   ├── checkout/                # Payment & checkout
│   │   ├── index.ejs            # Checkout form
│   │   ├── success.ejs          # Order success page
│   │   └── cancel.ejs           # Payment canceled page
│   │
│   └── admin/                   # Admin & manager pages
│       ├── dashboard.ejs        # Admin dashboard (full features)
│       ├── manager-dashboard.ejs # Manager dashboard (limited features)
│       ├── products.ejs         # Product management (CRUD)
│       ├── categories.ejs       # Category management
│       ├── users.ejs            # User management (admin only)
│       ├── orders.ejs           # Orders management (admin only)
│       ├── advertisements.ejs   # Advertisement management
│       └── kpi.ejs              # Statistics dashboard
│
├── public/                       # Static files
│   ├── css/
│   │   └── style.css            # Main stylesheet
│   ├── js/
│   │   └── cart.js              # Cart functionality scripts
│   └── images/                  # Static images
│
├── uploads/                      # User-uploaded files
│   └── logo.png                 # Store logo
│
├── server.js                    # Main application entry point
├── package.json                 # Dependencies & scripts
├── .env                         # Environment variables (not in repo)
├── how to.txt                   # Git push instructions
└── PROJECT_DOCUMENTATION.md     # This file
```

---

## ✨ Key Features

### 1. **User Authentication & Authorization**
   - User registration with email validation
   - Secure login with bcrypt password hashing
   - Session-based authentication (24-hour sessions)
   - Role-based access control (RBAC)
   - User profile management

### 2. **Product Management**
   - View product catalog with filtering
   - Admin/Manager can create, read, update, delete (CRUD) products
   - Product images upload to `/uploads`
   - Category management
   - Product search functionality

### 3. **Shopping Cart**
   - Session-based cart (stored in `req.session.cart`)
   - Add/remove products
   - Quantity management
   - Real-time cart count display

### 4. **Checkout & Payment**
   - Secure checkout process
   - Stripe payment integration
   - Order confirmation
   - Payment success/cancel pages

### 5. **Admin Panel**
   - Dashboard with statistics (orders, revenue, products, users)
   - Full user management (view, edit roles, delete)
   - Complete product management
   - Category management
   - Order management & tracking
   - Advertisement management
   - KPI (Key Performance Indicators) dashboard

### 6. **Manager Panel** (Limited Admin)
   - Manager-specific dashboard
   - Can only manage: Products, Categories, Advertisements
   - Cannot access: Users, Orders, Statistics
   - Restricted from admin-only features

### 7. **Responsive Design**
   - Mobile-friendly layout
   - CSS grid and flexbox
   - Optimized for all screen sizes

---

## 👥 User Roles & Access Control

### Role Hierarchy

```
┌─────────────────────────────────────────┐
│ CUSTOMER (ROLE_USER)                    │
│ • Browse products                       │
│ • Add to cart                           │
│ • Checkout                              │
│ • View own profile                      │
│ • Cannot access admin features          │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ MANAGER (ROLE_RESPONSABLE)              │
│ • All customer features                 │
│ • Access: /admin/manager-dashboard      │
│ • Manage: Products                      │
│ • Manage: Categories                    │
│ • Manage: Advertisements                │
│ • Cannot: View users, orders, stats     │
│ • Back button → /admin/manager-dashboard│
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ ADMIN (ROLE_ADMIN)                      │
│ • All features available                │
│ • Access: /admin (full dashboard)       │
│ • Manage: Users (create, edit, delete)  │
│ • Manage: Products                      │
│ • Manage: Categories                    │
│ • Manage: Advertisements                │
│ • Manage: Orders                        │
│ • View: Statistics & KPI                │
│ • Back button → /admin                  │
└─────────────────────────────────────────┘
```

### Access Control Implementation

**Location**: [middleware/authMiddleware.js](middleware/authMiddleware.js)

Key middleware functions:
```javascript
isAuthenticated()      // Checks if user is logged in
isAdmin()             // Requires ROLE_ADMIN
isManager()           // Requires ROLE_RESPONSABLE only
isAdminOrManager()    // Requires either role
hasRole(role)         // Check specific role
hasAnyRole(roles)     // Check if user has any of the roles
```

**Location**: [routes/admin.js](routes/admin.js) - Lines 1-50

Inline middleware:
```javascript
adminOnly          // Admin dashboard only
managerOnly        // Manager dashboard only
adminOrManagerProducts // Both roles can manage products/categories/ads
```

---

## 🗄️ Database Schema

### Tables Overview

```
┌──────────────────────────────────────┐
│ Users Table                          │
├──────────────────────────────────────┤
│ id (Primary Key)                     │
│ email (Unique)                       │
│ password (Hashed with bcryptjs)      │
│ name                                 │
│ phone                                │
│ roles (JSON array: ROLE_ADMIN,       │
│        ROLE_RESPONSABLE, ROLE_USER)  │
│ created_at                           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Products Table                       │
├──────────────────────────────────────┤
│ id (Primary Key)                     │
│ name                                 │
│ description                          │
│ price                                │
│ stock                                │
│ category_id (Foreign Key)            │
│ image (filename in /uploads)         │
│ created_at                           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Categories Table                     │
├──────────────────────────────────────┤
│ id (Primary Key)                     │
│ name                                 │
│ description                          │
│ created_at                           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Orders Table                         │
├──────────────────────────────────────┤
│ id (Primary Key)                     │
│ user_id (Foreign Key)                │
│ total_amount                         │
│ status                               │
│ payment_intent_id (Stripe)           │
│ items (JSON array of products)       │
│ created_at                           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Advertisements Table                 │
├──────────────────────────────────────┤
│ id (Primary Key)                     │
│ title                                │
│ description                          │
│ image (filename in /uploads)         │
│ link                                 │
│ active                               │
│ created_at                           │
└──────────────────────────────────────┘
```

**Database Config**: [config/database.js](config/database.js)
- MySQL connection pool with 10 connections max
- Connection string from environment variables
- Error handling with console logging

**Database Schema**: [config/database.sql](config/database.sql)
- All table definitions with proper indexes
- Run once to initialize the database

---

## 🔄 Application Flow

### User Registration & Login Flow

```
┌──────────────┐
│ User visits  │
│ /auth/       │
│ register     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Register Form (register.ejs)         │
│ • Email input                        │
│ • Password input                     │
│ • Name input                         │
│ • Phone input                        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ POST /auth/register                  │
│ [routes/auth.js]                     │
│ • Validate input                     │
│ • Check email exists                 │
│ • Hash password (bcryptjs)           │
│ • Store in database                  │
└──────┬───────────────────────────────┘
       │
       ▼ Success
┌──────────────────────────────────────┐
│ Redirect to /auth/login              │
└──────────────────────────────────────┘
```

### Customer Shopping Flow

```
┌──────────────────────┐
│ Browse Products      │
│ /products            │
│ [products/          │
│  catalog.ejs]        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ View Product Detail  │
│ /products/:id        │
│ [products/show.ejs]  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Add to Cart                      │
│ JavaScript: addToCart(productId) │
│ [public/js/cart.js]              │
│ • Stored in req.session.cart     │
│ • Cart count updated             │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ View Cart                        │
│ /cart                            │
│ [cart/index.ejs]                 │
│ • Display items                  │
│ • Update quantities              │
│ • Remove items                   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Checkout                         │
│ /checkout                        │
│ [checkout/index.ejs]             │
│ • Review order                   │
│ • Enter shipping info            │
│ • Payment form                   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Process Payment (Stripe)         │
│ POST /checkout/process-payment   │
│ [routes/checkout.js]             │
│ • Create Stripe payment intent   │
│ • Charge card                    │
└──────┬───────────────────────────┘
       │
       ├─────────── Success ───────────┐
       │                               │
       ▼                               ▼
┌──────────────────┐        ┌──────────────────┐
│ /checkout/       │        │ /checkout/cancel │
│ success          │        │                  │
│ [success.ejs]    │        │ [cancel.ejs]     │
│ • Order saved    │        │ • Alert user     │
│ • Confirmation   │        │ • Retry option   │
└──────────────────┘        └──────────────────┘
```

### Admin Product Management Flow

```
┌────────────────────────────────┐
│ Access Admin Dashboard         │
│ /admin                         │
│ Admin only: [adminOnly MW]     │
│ Manager only: [managerOnly MW] │
└────┬─────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────┐
│ Admin: /admin [dashboard.ejs]          │
│ Manager: /admin/manager-dashboard      │
│          [manager-dashboard.ejs]       │
└────┬─────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────┐
│ Click: Manage Products                 │
│ Navigate to: /admin/products           │
│ [admin/products.ejs]                   │
│ [adminOrManagerProducts MW]            │
│ • List all products                    │
│ • Edit buttons & delete buttons        │
│ • Add product form                     │
└────┬─────────────────────────────────────┘
     │
     ├─────── Edit Product ───────┐
     │                             │
     ▼                             ▼
┌──────────────────┐      ┌──────────────────┐
│ Click Edit button│      │ Click Add Product│
│ Open modal       │      │ Open modal       │
│ Modal shows form │      │ Empty form       │
│ Pre-fill values: │      │                  │
│ • Product name  │      │ Fill all fields: │
│ • Description   │      │ • Name           │
│ • Price         │      │ • Description    │
│ • Stock         │      │ • Price          │
│ • Category      │      │ • Stock          │
│ • Image preview │      │ • Category       │
└────┬─────────────┘      │ • Image upload   │
     │                    └────┬────────────┘
     └────────┬─────────────────┘
              │
              ▼
     ┌──────────────────┐
     │ Submit Form      │
     │ POST /admin/     │
     │ products/:id     │
     │ [routes/admin.js]│
     │ • Validate input │
     │ • Update DB      │
     │ • Handle image   │
     └────┬─────────────┘
          │
          ▼
     ┌──────────────────┐
     │ Redirect back to │
     │ /admin/products  │
     │ • Confirm toast  │
     │ • List updated   │
     └──────────────────┘
```

---

## 🛣️ Route Structure

### Public Routes (No Authentication Required)

```
GET  /                      # Homepage [routes/home.js]
GET  /products              # Product catalog [routes/products.js]
GET  /products/:id          # Single product [routes/products.js]

GET  /auth/login            # Login page [routes/auth.js]
POST /auth/login            # Process login [routes/auth.js]
GET  /auth/register         # Register page [routes/auth.js]
POST /auth/register         # Process registration [routes/auth.js]
```

### Authenticated Customer Routes

```
GET  /auth/profile          # User profile [routes/auth.js] [isAuthenticated]
POST /auth/logout           # Logout [routes/auth.js]

GET  /cart                  # View cart [routes/cart.js]
POST /cart/add              # Add to cart [routes/cart.js]
POST /cart/update           # Update quantity [routes/cart.js]
POST /cart/remove           # Remove item [routes/cart.js]

GET  /checkout              # Checkout page [routes/checkout.js] [isAuthenticated]
POST /checkout/process-payment  # Process payment [routes/checkout.js]
```

### Admin Routes (ROLE_ADMIN Required)

```
GET  /admin                         # Admin dashboard [routes/admin.js] [adminOnly]
GET  /admin/users                   # User management [routes/admin.js] [adminOnly]
POST /admin/users                   # Create user [routes/admin.js] [adminOnly]
POST /admin/users/:id               # Update user [routes/admin.js] [adminOnly]
DELETE /admin/users/:id             # Delete user [routes/admin.js] [adminOnly]

GET  /admin/orders                  # Orders list [routes/admin.js] [adminOnly]
POST /admin/orders/:id/update-status # Update order [routes/admin.js] [adminOnly]
```

### Manager Routes (ROLE_RESPONSABLE Required)

```
GET  /admin/manager-dashboard       # Manager dashboard [routes/admin.js] [managerOnly]

GET  /admin/products                # Manage products [adminOrManagerProducts]
POST /admin/products                # Create product [adminOrManagerProducts]
POST /admin/products/:id            # Update product [adminOrManagerProducts]
DELETE /admin/products/:id          # Delete product [adminOrManagerProducts]

GET  /admin/categories              # Manage categories [adminOrManagerProducts]
POST /admin/categories              # Create category [adminOrManagerProducts]
POST /admin/categories/:id          # Update category [adminOrManagerProducts]
DELETE /admin/categories/:id        # Delete category [adminOrManagerProducts]

GET  /admin/advertisements          # Manage ads [adminOrManagerProducts]
POST /admin/advertisements          # Create ad [adminOrManagerProducts]
POST /admin/advertisements/:id      # Update ad [adminOrManagerProducts]
DELETE /admin/advertisements/:id    # Delete ad [adminOrManagerProducts]
```

### Admin & Manager Routes (Both Can Access)

```
GET  /admin/products                # Product list
POST /admin/products                # Create product
POST /admin/products/:id            # Update product
DELETE /admin/products/:id          # Delete product

GET  /admin/categories              # Category list
POST /admin/categories              # Create category
POST /admin/categories/:id          # Update category
DELETE /admin/categories/:id        # Delete category

GET  /admin/advertisements          # Advertisement list
POST /admin/advertisements          # Create ad
POST /admin/advertisements/:id      # Update ad
DELETE /admin/advertisements/:id    # Delete ad
```

### API Routes

```
GET  /api/cart                      # Get cart [routes/api.js]
POST /api/cart/add                  # Add item [routes/api.js]
POST /api/cart/update               # Update cart [routes/api.js]
POST /api/cart/remove               # Remove item [routes/api.js]
GET  /api/products                  # Get products JSON [routes/api.js]
GET  /api/categories                # Get categories JSON [routes/api.js]
```

---

## 🔍 Key Functions & Locations

### Authentication Functions

**File**: [routes/auth.js](routes/auth.js)

```javascript
// Register new user
POST /auth/register
- Validate email, password, name, phone
- Hash password with bcryptjs
- Save to users table
- Assign ROLE_USER by default

// Login user
POST /auth/login
- Verify email exists
- Compare password with bcrypt
- Create session with user data
- Store roles array in session

// Get user profile
GET /auth/profile
- Display current user info
- Update password (hashed)
- Update personal info

// Logout
POST /auth/logout
- Destroy session
- Clear cookies
```

### Product Management Functions

**File**: [routes/admin.js](routes/admin.js) - Lines 100-250

```javascript
// Get all products
GET /admin/products
- Query database for all products
- Join with categories
- Pass to products.ejs view

// Create product
POST /admin/products
- Validate input (name, price, stock, category)
- Handle image upload (multer)
- Save to products table
- Redirect to products list

// Update product
POST /admin/products/:id
- Verify product exists
- Update fields (name, description, price, stock)
- Handle new image if uploaded
- Update database
- Redirect with success message

// Delete product
DELETE /admin/products/:id
- Delete product from database
- Delete associated image from /uploads
- Redirect to products list
```

### Category Management Functions

**File**: [routes/admin.js](routes/admin.js) - Lines 250-350

```javascript
// Get all categories
GET /admin/categories
- Query all categories
- Display in categories.ejs

// Create category
POST /admin/categories
- Validate name, description
- Save to database

// Update category
POST /admin/categories/:id
- Update name/description
- Save changes

// Delete category
DELETE /admin/categories/:id
- Remove from database
- Check for product associations
```

### Cart Functions

**File**: [public/js/cart.js](public/js/cart.js)

```javascript
// Add to cart
addToCart(productId)
- Add item to session.cart object
- Update cart count display
- Show success message

// Remove from cart
removeFromCart(productId)
- Remove item from session.cart
- Update cart display
- Recalculate totals

// Update quantity
updateQuantity(productId, quantity)
- Change item quantity
- Recalculate totals
- Update display
```

### Checkout Functions

**File**: [routes/checkout.js](routes/checkout.js)

```javascript
// Display checkout page
GET /checkout
- Get cart from session
- Calculate total
- Display checkout form

// Process payment
POST /checkout/process-payment
- Validate cart and shipping info
- Create Stripe payment intent
- Process payment
- Save order to database
- Clear cart on success
- Redirect to success/cancel page
```

### User Management Functions (Admin Only)

**File**: [routes/admin.js](routes/admin.js) - Lines 400-500

```javascript
// Get all users
GET /admin/users
- Query all users
- Display in users.ejs table

// Create user
POST /admin/users
- Validate email, password, name
- Hash password
- Assign roles
- Save to database

// Update user
POST /admin/users/:id
- Update user fields
- Update roles (ROLE_ADMIN, ROLE_RESPONSABLE, ROLE_USER)
- Update password if provided (hash new)
- Save changes

// Delete user
DELETE /admin/users/:id
- Remove from database
- Check for associated orders
```

### Middleware Functions

**File**: [middleware/authMiddleware.js](middleware/authMiddleware.js)

```javascript
// Check authentication
isAuthenticated(req, res, next)
- Verify user exists in session
- Redirect to login if not
- Allow to proceed if authenticated

// Check admin role
isAdmin(req, res, next)
- Check if user has ROLE_ADMIN
- Return 403 error if not admin
- Allow to proceed if admin

// Check manager role
isManager(req, res, next)
- Check if user has ROLE_RESPONSABLE
- Ensure user is NOT also admin
- Return 403 if requirements not met

// Check admin OR manager
isAdminOrManager(req, res, next)
- Allow if user has either role
- Return 403 if neither role

// Check specific role
hasRole(roleName)(req, res, next)
- Dynamic middleware for any role
- Check if user has specific role

// Check any of multiple roles
hasAnyRole(roleArray)(req, res, next)
- Check if user has any role in array
- Useful for flexible permissions
```

### Session & User Variables

Available in all views via `res.locals`:

```javascript
// Current user object
user
user.id                    // User ID from database
user.email                 // User email
user.name                  // User name
user.phone                 // User phone
user.roles                 // Array of roles
                          // e.g., ['ROLE_USER']
                          //      ['ROLE_RESPONSABLE']
                          //      ['ROLE_ADMIN']

// Cart information
cartCount                  // Total items in cart
                          // Displayed in header

// Check roles in EJS templates
<% if (user.roles.includes('ROLE_ADMIN')) { %>
  <!-- Show admin features -->
<% } %>

<% if (user.roles.includes('ROLE_RESPONSABLE')) { %>
  <!-- Show manager features -->
<% } %>
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Step 1: Clone/Extract Project

```bash
cd drbStore
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all packages from `package.json`:
- express (web framework)
- mysql2 (database)
- bcryptjs (password hashing)
- express-session (sessions)
- multer (file uploads)
- stripe (payments)
- ejs (templating)
- dotenv (environment variables)
- express-validator (input validation)

### Step 3: Configure Database

1. **Create MySQL Database**:
```sql
CREATE DATABASE drbstore;
```

2. **Run Database Schema**:
```bash
mysql -u root -p drbstore < config/database.sql
```

Or manually import `config/database.sql` through MySQL Workbench/phpMyAdmin

### Step 4: Create Environment File

Create `.env` file in project root:

```
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=drbstore

# Server
PORT=3000
SESSION_SECRET=drbstore-secret-key-change-in-production

# Stripe (Optional - for payments)
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

### Step 5: (Optional) Seed Database

```bash
npm run seed
```

This runs `config/seedDatabase.js` and creates:
- Default admin account (admin@drbstore.com / admin123)
- Sample categories
- Sample products
- Sample advertisements

---

## ▶️ Running the Project

### Start Server (Production)

```bash
npm start
```

Server runs on `http://localhost:3000`

### Start Server (Development with Auto-Reload)

```bash
npm run dev
```

Uses nodemon to automatically restart on file changes

### Access Application

```
Homepage:      http://localhost:3000
Products:      http://localhost:3000/products
Register:      http://localhost:3000/auth/register
Login:         http://localhost:3000/auth/login

Admin Panel:   http://localhost:3000/admin
               (requires ROLE_ADMIN)

Manager Panel: http://localhost:3000/admin/manager-dashboard
               (requires ROLE_RESPONSABLE)
```

### Default Test Accounts (If Seeded)

```
Admin Account:
Email:    admin@drbstore.com
Password: admin123
Roles:    ROLE_ADMIN

Manager Account:
Email:    manager@drbstore.com
Password: manager123
Roles:    ROLE_RESPONSABLE
```

---

## 📌 Important Notes

### Session Management
- Sessions stored in server memory (production should use session store like Redis)
- 24-hour session expiration
- Cart data stored in `req.session.cart` object

### Image Uploads
- Uploaded images go to `/uploads` folder
- Accessible via `/uploads/filename.png`
- Multer configured in [routes/admin.js](routes/admin.js)
- Store logo: `/uploads/logo.png` (80px height)

### Password Security
- All passwords hashed with bcryptjs (10 salt rounds)
- Never stored as plain text
- Compared using bcrypt.compare()

### Error Handling
- 403 Forbidden: User lacks required permissions
- Error template: [views/error.ejs](views/error.ejs)
- Displays custom error messages

### Role-Based Navigation
- Back buttons intelligently route based on role
- Admin back buttons → `/admin`
- Manager back buttons → `/admin/manager-dashboard`
- Logic in view files using EJS conditionals

---

## 🔐 Security Features

✅ Password hashing (bcryptjs)
✅ Session-based authentication
✅ CORS-ready (can be enabled)
✅ Input validation (express-validator)
✅ SQL injection protection (prepared statements via mysql2)
✅ Role-based access control (RBAC)
✅ Secure Stripe payment processing
✅ Environment variable protection (dotenv)

---

## 📊 Project Statistics

- **Backend Routes**: 50+
- **Database Tables**: 5
- **Views/Templates**: 20+
- **Middleware Functions**: 10+
- **Admin Features**: 5 main modules
- **User Roles**: 3 levels
- **Payment Integration**: Stripe

---

## 🎯 Presentation Summary

**DRB Store** is a production-ready e-commerce platform demonstrating:

1. **Full-Stack Web Development**: Node.js backend + EJS frontend
2. **Database Design**: Normalized MySQL schema with relationships
3. **Authentication & Authorization**: Secure login + RBAC system
4. **Modern Architecture**: Middleware-based route protection, session management
5. **File Uploads**: Image handling with multer
6. **Payment Integration**: Stripe API integration
7. **Responsive Design**: CSS-based adaptive layout
8. **User Management**: Admin controls for all aspects
9. **Business Logic**: Shopping cart, checkout, inventory management
10. **Scalability**: Modular route structure, database connection pooling

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: Production Ready
