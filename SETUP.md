# DRB Store Setup Guide

## Quick Start

1. **Install Node.js dependencies:**
```bash
cd drbStore
npm install
```

2. **Set up MySQL database:**
```sql
-- Run this in MySQL:
source config/database.sql
```

Or manually:
- Create database: `CREATE DATABASE drbstore;`
- Run the SQL file: `config/database.sql`

3. **Configure environment:**
- Edit `.env` file with your database credentials
- Add your Stripe keys (get them from https://dashboard.stripe.com/test/apikeys)

4. **Create uploads directory:**
```bash
mkdir uploads
```

5. **Start the server:**
```bash
npm start
```

6. **Access the application:**
- Homepage: http://localhost:3000
- Admin: http://localhost:3000/admin
- Default admin login: admin@drbstore.com / admin123

## Default Admin Account

After running the database.sql file, you'll have:
- Email: admin@drbstore.com
- Password: admin123

**Important:** Change this password in production!

## Features Included

✅ User registration and login
✅ Product catalog with search and filters
✅ Shopping cart (session-based)
✅ Checkout with Stripe payment
✅ Admin dashboard
✅ Product management (CRUD)
✅ Category management
✅ Order management
✅ Advertisement carousel management
✅ Image uploads
✅ Responsive design

## Project Structure

```
drbStore/
├── config/          # Database configuration
├── routes/          # Express routes
├── views/           # EJS templates
├── public/          # Static files (CSS, JS)
├── uploads/         # Uploaded images
└── server.js        # Main server file
```

## Technologies

- Node.js
- Express.js
- MySQL
- EJS (templates)
- bcryptjs (password hashing)
- Stripe (payments)
- Multer (file uploads)

## Notes

- All functionality from the original Symfony app is preserved
- Code is simplified and easy to understand
- Uses session-based cart (no database needed for cart)
- Admin panel requires ROLE_ADMIN or ROLE_RESPONSABLE

