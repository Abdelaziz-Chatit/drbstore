const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isAdmin, isAdminOrManager } = require('../middleware/authMiddleware');

// Admin-only middleware - ADMIN ROLE REQUIRED
const adminOnly = (req, res, next) => {
  if (!req.session.user) {
    console.log('[adminOnly] No user in session, redirecting to login');
    return res.redirect('/auth/login');
  }
  const roles = req.session.user.roles || [];
  console.log('[adminOnly] User:', req.session.user.email, 'Roles:', roles);
  if (!roles.includes('ROLE_ADMIN')) {
    console.log('[adminOnly] Access DENIED - not an admin');
    return res.status(403).render('error', { message: 'Admin access required. Only administrators can perform this action.' });
  }
  console.log('[adminOnly] Access GRANTED - is admin');
  next();
};

// Manager-only middleware - can only manage products, categories, and advertisements
const managerOnly = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  const roles = req.session.user.roles || [];
  // Manager has ROLE_RESPONSABLE but NOT ROLE_ADMIN
  if (!roles.includes('ROLE_RESPONSABLE') || roles.includes('ROLE_ADMIN')) {
    return res.status(403).render('error', { message: 'Manager access required.' });
  }
  next();
};

// Admin or Manager - for products, categories, advertisements ONLY
const adminOrManagerProducts = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  const roles = req.session.user.roles || [];
  if (!roles.includes('ROLE_ADMIN') && !roles.includes('ROLE_RESPONSABLE')) {
    return res.status(403).render('error', { message: 'Access denied.' });
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

// =============== KPI ENDPOINTS (ADMIN ONLY) ===============

// Get KPI/Analytics Dashboard (Admin only)
router.get('/kpi', adminOnly, async (req, res) => {
  try {
    // Get order statistics
    const [orderStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
      FROM orders
    `);

    // Get product statistics
    const [productStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_products,
        SUM(stock) as total_stock,
        COUNT(CASE WHEN stock <= 5 THEN 1 END) as low_stock_items
      FROM products
    `);

    // Get user statistics
    const [userStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN roles LIKE '%ROLE_ADMIN%' THEN 1 END) as admin_count,
        COUNT(CASE WHEN roles LIKE '%ROLE_RESPONSABLE%' THEN 1 END) as manager_count
      FROM users
    `);

    // Get category statistics
    const [categoryStats] = await db.execute(`
      SELECT 
        c.id,
        c.name,
        COUNT(p.id) as product_count,
        COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY c.id, c.name
      ORDER BY total_sold DESC
    `);

    // Get monthly revenue (all orders including pending)
    const [monthlyRevenue] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as orders,
        SUM(total_amount) as revenue
      FROM orders
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    // Get top products
    const [topProducts] = await db.execute(`
      SELECT 
        p.id,
        p.name,
        COUNT(oi.id) as times_sold,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.price * oi.quantity) as total_revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id, p.name
      ORDER BY total_quantity DESC
      LIMIT 10
    `);

    res.render('admin/kpi', {
      title: 'KPI & Analytics - DRB Store',
      orderStats: orderStats[0],
      productStats: productStats[0],
      userStats: userStats[0],
      categoryStats: categoryStats,
      monthlyRevenue: monthlyRevenue,
      topProducts: topProducts
    });
  } catch (error) {
    console.error('KPI dashboard error:', error);
    res.status(500).render('error', { message: 'Error loading KPI dashboard' });
  }
});

// API endpoint for KPI data (for charts, etc.)
router.get('/api/kpi-data', adminOnly, async (req, res) => {
  try {
    const [monthlyRevenue] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as orders,
        SUM(total_amount) as revenue
      FROM orders
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    res.json({
      success: true,
      data: monthlyRevenue
    });
  } catch (error) {
    console.error('KPI API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============== USER MANAGEMENT (ADMIN ONLY) ===============

// Get users management page (Admin only)
router.get('/users', adminOnly, async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT id, name, email, phone, roles, created_at FROM users ORDER BY created_at DESC
    `);

    res.render('admin/users', {
      title: 'Manage Users - DRB Store',
      users: users
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).render('error', { message: 'Error loading users' });
  }
});

// Create new user (Admin only)
router.post('/users', adminOnly, async (req, res) => {
  try {
    const { name, email, password, phone, roles } = req.body;

    // Check if user exists
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure roles is an array
    const userRoles = Array.isArray(roles) ? roles : ['ROLE_USER'];

    await db.execute(
      'INSERT INTO users (name, email, password, phone, roles) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, JSON.stringify(userRoles)]
    );

    res.redirect('/admin/users');
  } catch (error) {
    console.error('Create user error:', error);
    res.redirect('/admin/users');
  }
});

// Update user (Admin only)
router.post('/users/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, roles, password } = req.body;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userRoles = Array.isArray(roles) ? roles : ['ROLE_USER'];
      
      await db.execute(
        'UPDATE users SET name = ?, email = ?, phone = ?, roles = ?, password = ? WHERE id = ?',
        [name, email, phone || null, JSON.stringify(userRoles), hashedPassword, id]
      );
    } else {
      const userRoles = Array.isArray(roles) ? roles : ['ROLE_USER'];
      
      await db.execute(
        'UPDATE users SET name = ?, email = ?, phone = ?, roles = ? WHERE id = ?',
        [name, email, phone || null, JSON.stringify(userRoles), id]
      );
    }

    res.redirect('/admin/users');
  } catch (error) {
    console.error('Update user error:', error);
    res.redirect('/admin/users');
  }
});

// Delete user (Admin only)
router.post('/users/:id/delete', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deletion of current user
    if (id == req.session.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Delete user error:', error);
    res.redirect('/admin/users');
  }
});

// =============== ORIGINAL ADMIN FEATURES ===============

// Admin dashboard - ADMIN ONLY with role-specific view
router.get('/', adminOnly, async (req, res) => {
  try {
    // Get statistics (only for admin)
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
      isAdmin: true,
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

// Manager dashboard - MANAGER ONLY
router.get('/manager-dashboard', managerOnly, async (req, res) => {
  try {
    // Get product statistics
    const [productStats] = await db.execute('SELECT COUNT(*) as total FROM products');
    const [categoryStats] = await db.execute('SELECT COUNT(*) as total FROM categories');
    const [adsStats] = await db.execute('SELECT COUNT(*) as total FROM advertisements');

    res.render('admin/manager-dashboard', {
      title: 'Manager Dashboard - DRB Store',
      isManager: true,
      stats: {
        products: productStats[0].total || 0,
        categories: categoryStats[0].total || 0,
        advertisements: adsStats[0].total || 0
      }
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).render('error', { message: 'Error loading dashboard' });
  }
});

// Products management - ADMIN AND MANAGER
router.get('/products', adminOrManagerProducts, async (req, res) => {
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

// Create product - ADMIN AND MANAGER
router.post('/products', adminOrManagerProducts, upload.single('image'), async (req, res) => {
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

// Update product - ADMIN AND MANAGER
router.post('/products/:id', adminOrManagerProducts, upload.single('image'), async (req, res) => {
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

// Delete product - ADMIN AND MANAGER
router.post('/products/:id/delete', adminOrManagerProducts, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Delete product error:', error);
    res.redirect('/admin/products');
  }
});

// Categories management - ADMIN AND MANAGER
router.get('/categories', adminOrManagerProducts, async (req, res) => {
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

// Create category - ADMIN AND MANAGER
router.post('/categories', adminOrManagerProducts, upload.single('image'), async (req, res) => {
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

// Update category - ADMIN AND MANAGER
router.post('/categories/:id', adminOrManagerProducts, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    if (req.file) {
      await db.execute(
        'UPDATE categories SET name = ?, slug = ?, image = ? WHERE id = ?',
        [name, slug, req.file.filename, id]
      );
    } else {
      await db.execute(
        'UPDATE categories SET name = ?, slug = ? WHERE id = ?',
        [name, slug, id]
      );
    }

    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Update category error:', error);
    res.redirect('/admin/categories');
  }
});

// Delete category - ADMIN AND MANAGER
router.post('/categories/:id/delete', adminOrManagerProducts, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Delete category error:', error);
    res.redirect('/admin/categories');
  }
});

// Orders management - ADMIN ONLY
router.get('/orders', adminOnly, async (req, res) => {
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

// Update order status - ADMIN ONLY
router.post('/orders/:id/status', adminOnly, async (req, res) => {
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

// Advertisements management - ADMIN AND MANAGER
router.get('/advertisements', adminOrManagerProducts, async (req, res) => {
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

// Create advertisement - ADMIN AND MANAGER
router.post('/advertisements', adminOrManagerProducts, upload.single('image'), async (req, res) => {
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

// Update advertisement - ADMIN AND MANAGER
router.post('/advertisements/:id', adminOrManagerProducts, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link, order, is_active } = req.body;

    if (req.file) {
      await db.execute(
        'UPDATE advertisements SET title = ?, description = ?, image = ?, link = ?, `order` = ?, is_active = ? WHERE id = ?',
        [title, description || null, req.file.filename, link || null, parseInt(order) || 0, is_active === 'on' ? 1 : 0, id]
      );
    } else {
      await db.execute(
        'UPDATE advertisements SET title = ?, description = ?, link = ?, `order` = ?, is_active = ? WHERE id = ?',
        [title, description || null, link || null, parseInt(order) || 0, is_active === 'on' ? 1 : 0, id]
      );
    }

    res.redirect('/admin/advertisements');
  } catch (error) {
    console.error('Update advertisement error:', error);
    res.redirect('/admin/advertisements');
  }
});

// Delete advertisement - ADMIN AND MANAGER
router.post('/advertisements/:id/delete', adminOrManagerProducts, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM advertisements WHERE id = ?', [id]);
    res.redirect('/admin/advertisements');
  } catch (error) {
    console.error('Delete advertisement error:', error);
    res.redirect('/admin/advertisements');
  }
});

module.exports = router;

