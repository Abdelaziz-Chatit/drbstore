const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Home page
router.get('/', async (req, res) => {
  try {
    // Get active advertisements
    const [ads] = await db.execute(
      'SELECT * FROM advertisements WHERE is_active = 1 ORDER BY `order` ASC'
    );

    // Get all categories
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY name ASC');

    // Get featured products (first 8)
    const [products] = await db.execute(
      'SELECT * FROM products ORDER BY id DESC LIMIT 8'
    );

    // Get total products count
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM products');
    const totalProducts = countResult[0].total;

    res.render('home/index', {
      title: 'DRB Store - Home',
      advertisements: ads,
      categories: categories,
      products: products,
      totalProducts: totalProducts
    });
  } catch (error) {
    console.error('Home error:', error);
    res.status(500).render('error', { message: 'Error loading homepage' });
  }
});

module.exports = router;

