const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware to check admin
const isAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  const roles = req.session.user.roles || [];
  if (!roles.includes('ROLE_ADMIN') && !roles.includes('ROLE_RESPONSABLE')) {
    return res.status(403).render('error', { message: 'Access denied' });
  }
  next();
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Admin dashboard
router.get('/', isAdmin, async (req, res) => {
  try {
    // Get statistics
    const [orderStats] = await db.execute(
      'SELECT COUNT(*) as total, SUM(total_amount) as revenue FROM orders WHERE status = "paid"'
    );
    const [productStats] = await db.execute('SELECT COUNT(*) as total FROM products');
    const [userStats] = await db.execute('SELECT COUNT(*) as total FROM users');
    const [recentOrders] = await db.execute(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 10'
    );

    res.render('admin/dashboard', {
      title: 'Admin Dashboard - DRB Store',
      stats: {
        orders: orderStats[0].total || 0,
        revenue: orderStats[0].revenue || 0,
        products: productStats[0].total || 0,
        users: userStats[0].total || 0
      },
      recentOrders: recentOrders
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).render('error', { message: 'Error loading dashboard' });
  }
});

// Products management
router.get('/products', isAdmin, async (req, res) => {
  try {
    const [products] = await db.execute(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC'
    );
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY name ASC');

    res.render('admin/products', {
      title: 'Manage Products - DRB Store',
      products: products,
      categories: categories
    });
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).render('error', { message: 'Error loading products' });
  }
});

// Create product
router.post('/products', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    const image = req.file ? req.file.filename : null;

    await db.execute(
      'INSERT INTO products (name, description, price, stock, image, category_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, parseFloat(price), parseInt(stock), image, category_id || null]
    );

    res.redirect('/admin/products');
  } catch (error) {
    console.error('Create product error:', error);
    res.redirect('/admin/products');
  }
});

// Update product
router.post('/products/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id } = req.body;

    if (req.file) {
      await db.execute(
        'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image = ?, category_id = ? WHERE id = ?',
        [name, description, parseFloat(price), parseInt(stock), req.file.filename, category_id || null, id]
      );
    } else {
      await db.execute(
        'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ? WHERE id = ?',
        [name, description, parseFloat(price), parseInt(stock), category_id || null, id]
      );
    }

    res.redirect('/admin/products');
  } catch (error) {
    console.error('Update product error:', error);
    res.redirect('/admin/products');
  }
});

// Delete product
router.post('/products/:id/delete', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Delete product error:', error);
    res.redirect('/admin/products');
  }
});

// Categories management
router.get('/categories', isAdmin, async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY name ASC');
    res.render('admin/categories', {
      title: 'Manage Categories - DRB Store',
      categories: categories
    });
  } catch (error) {
    console.error('Admin categories error:', error);
    res.status(500).render('error', { message: 'Error loading categories' });
  }
});

// Create category
router.post('/categories', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const image = req.file ? req.file.filename : null;

    await db.execute(
      'INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)',
      [name, slug, image]
    );

    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Create category error:', error);
    res.redirect('/admin/categories');
  }
});

// Orders management
router.get('/orders', isAdmin, async (req, res) => {
  try {
    const [orders] = await db.execute(
      'SELECT o.*, u.name as user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC'
    );
    res.render('admin/orders', {
      title: 'Manage Orders - DRB Store',
      orders: orders
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(500).render('error', { message: 'Error loading orders' });
  }
});

// Update order status
router.post('/orders/:id/status', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.redirect('/admin/orders');
  } catch (error) {
    console.error('Update order status error:', error);
    res.redirect('/admin/orders');
  }
});

// Advertisements management
router.get('/advertisements', isAdmin, async (req, res) => {
  try {
    const [ads] = await db.execute('SELECT * FROM advertisements ORDER BY `order` ASC');
    res.render('admin/advertisements', {
      title: 'Manage Advertisements - DRB Store',
      advertisements: ads
    });
  } catch (error) {
    console.error('Admin ads error:', error);
    res.status(500).render('error', { message: 'Error loading advertisements' });
  }
});

// Create advertisement
router.post('/advertisements', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, link, order, is_active } = req.body;
    const image = req.file ? req.file.filename : null;

    await db.execute(
      'INSERT INTO advertisements (title, description, image, link, `order`, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description || null, image, link || null, parseInt(order) || 0, is_active === 'on' ? 1 : 0]
    );

    res.redirect('/admin/advertisements');
  } catch (error) {
    console.error('Create ad error:', error);
    res.redirect('/admin/advertisements');
  }
});

module.exports = router;

