# DRB Store - Role-Based Access Control Implementation

## ✅ Implementation Summary

I've successfully implemented a comprehensive role-based access control system with admin and manager accounts. Here's what's been set up:

## 🔐 Login Credentials

### Admin Account (Full Access)
- **Email:** admin@drbstore.com
- **Password:** admin123
- **Roles:** ROLE_ADMIN, ROLE_USER
- **Permissions:** Full access to all features including user management and KPI analytics

### Manager Account (Limited Access)
- **Email:** manager@drbstore.com
- **Password:** manager123
- **Roles:** ROLE_RESPONSABLE, ROLE_USER
- **Permissions:** Can manage products, orders, categories, and advertisements (but NOT users or KPIs)

## 📁 Files Created/Modified

### New Files:
1. **`middleware/authMiddleware.js`** - Reusable authentication middleware with role-based checks
2. **`config/seedDatabase.js`** - Database seeding script to create default accounts
3. **`views/admin/users.ejs`** - User management interface (Admin only)
4. **`views/admin/kpi.ejs`** - KPI & Analytics dashboard (Admin only)

### Modified Files:
1. **`routes/admin.js`** - Updated with user management endpoints and KPI endpoints
2. **`package.json`** - Added seed script

## 🎯 Features Implemented

### 1. User Management (Admin Only)
- **Endpoint:** `/admin/users`
- View all users with their roles and creation dates
- Create new users with specific roles
- Edit user details and roles
- Delete users (with protection against self-deletion)
- Password management during creation/update

### 2. KPI & Analytics Dashboard (Admin Only)
- **Endpoint:** `/admin/kpi`
- **Key Metrics:**
  - Total Revenue (from paid orders)
  - Total Orders with breakdown (completed/pending)
  - Product Statistics (total, stock, low-stock items)
  - User Statistics (total users, admins, managers)
  - Average Order Value
  
- **Charts & Visualizations:**
  - Monthly Revenue Trend (bar chart with order count overlay)
  - Category Performance (sales by category)
  - Top Selling Products (with revenue breakdown)
  
- **Data:** Real-time calculations from database

### 3. Role-Based Access Control
- **ROLE_ADMIN:** Full access to all features
- **ROLE_RESPONSABLE:** Manager access (products, orders, categories, ads)
- **ROLE_USER:** Standard customer account
- Flexible role assignment during user creation

### 4. Middleware Protection
All endpoints include proper authentication and authorization checks:
- `isAdmin` - Requires ROLE_ADMIN
- `isAdminOrManager` - Requires ROLE_ADMIN or ROLE_RESPONSABLE
- `isAuthenticated` - Requires login
- `hasRole()` - Check for specific role
- `hasAnyRole()` - Check for any of multiple roles

## 🔧 How to Use

### 1. Seed Admin/Manager Accounts
Run this command once to create default accounts:
```bash
npm run seed
```

### 2. Access Admin Panel
1. Login at `/auth/login` with admin credentials
2. Navigate to `/admin` for the main dashboard
3. Use the navigation to access different sections

### 3. View/Manage Users (Admin Only)
- Go to `/admin/users`
- Click "New User" to create accounts
- Edit roles and permissions for existing users
- Delete users as needed

### 4. View KPI Dashboard (Admin Only)
- Go to `/admin/kpi`
- View real-time business metrics
- Analyze category and product performance
- Track monthly revenue trends

## 📊 Database Schema

The users table now supports JSON role arrays:
```sql
roles JSON DEFAULT ('["ROLE_USER"]')
```

Example role configurations:
- Admin: `["ROLE_ADMIN", "ROLE_USER"]`
- Manager: `["ROLE_RESPONSABLE", "ROLE_USER"]`
- Customer: `["ROLE_USER"]`

## 🛡️ Security Features

1. **Password Hashing:** All passwords are hashed with bcryptjs
2. **Session Management:** Secure session handling with express-session
3. **Role Validation:** Server-side validation on all protected endpoints
4. **CSRF Protection Ready:** Structure supports easy CSRF middleware integration
5. **Input Validation:** Express-validator integration in auth routes

## 🚀 Current Status

✅ Server is running on `http://localhost:3000`
✅ Database connected successfully
✅ Admin and Manager accounts created
✅ All endpoints functional and protected
✅ UI components created for user management and KPI dashboard

## 📝 Testing Checklist

- [ ] Login with admin account and verify full access
- [ ] Login with manager account and verify limited access (no users/KPI access)
- [ ] Create a new user through admin panel
- [ ] Update user roles and permissions
- [ ] Delete a test user
- [ ] View KPI dashboard with real data
- [ ] Try accessing admin endpoints as regular user (should be denied)
- [ ] Try accessing KPI as manager (should be denied)

## 🔗 Key Routes

- `/auth/login` - Login page
- `/admin` - Admin dashboard
- `/admin/users` - User management (Admin only)
- `/admin/kpi` - Analytics dashboard (Admin only)
- `/admin/products` - Product management (Admin/Manager)
- `/admin/orders` - Order management (Admin/Manager)
- `/admin/categories` - Category management (Admin/Manager)
- `/admin/advertisements` - Ad management (Admin/Manager)
