# DRB Store - Installation Instructions

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Database Setup

1. Open MySQL and create the database:
```sql
CREATE DATABASE drbstore;
```

2. Run the SQL file:
```bash
mysql -u root -p drbstore < config/database.sql
```

Or manually copy and paste the contents of `config/database.sql` into MySQL.

## Step 3: Configure Environment

1. Copy `.env.example` to `.env` (or edit the existing `.env`)
2. Update these values:
   - `DB_HOST` - Your MySQL host (usually `localhost`)
   - `DB_USER` - Your MySQL username (usually `root`)
   - `DB_PASSWORD` - Your MySQL password
   - `DB_NAME` - Database name (should be `drbstore`)
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_PUBLIC_KEY` - Your Stripe public key

## Step 4: Create Uploads Directory

```bash
mkdir uploads
```

## Step 5: Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Step 6: Access the Application

- **Homepage:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **Default Admin Login:**
  - Email: `admin@drbstore.com`
  - Password: `admin123`

## Features

✅ User registration and login
✅ Product catalog with search
✅ Shopping cart
✅ Checkout with Stripe
✅ Admin dashboard
✅ Product management
✅ Category management
✅ Order management
✅ Advertisement management

## Troubleshooting

**Database connection error:**
- Check your MySQL is running
- Verify credentials in `.env`
- Make sure database `drbstore` exists

**Port already in use:**
- Change `PORT` in `.env` to a different port (e.g., 3001)

**Images not showing:**
- Make sure `uploads` directory exists
- Check file permissions

**Stripe errors:**
- Use test keys from Stripe dashboard
- Test card: 4242 4242 4242 4242

