const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Product catalog
router.get('/', async (req, res) => {
  try {
    const { category, search, price_min, price_max } = req.query;
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (price_min) {
      query += ' AND p.price >= ?';
      params.push(price_min);
    }

    if (price_max) {
      query += ' AND p.price <= ?';
      params.push(price_max);
    }

    query += ' ORDER BY p.id DESC';

    const [products] = await db.execute(query, params);
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY name ASC');

    let selectedCategory = null;
    if (category) {
      const [cats] = await db.execute('SELECT * FROM categories WHERE id = ?', [category]);
      selectedCategory = cats[0] || null;
    }

    res.render('products/catalog', {
      title: 'Products - DRB Store',
      products: products,
      categories: categories,
      selectedCategory: selectedCategory,
      search: search || null,
      price_min: price_min || null,
      price_max: price_max || null
    });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).render('error', { message: 'Error loading products' });
  }
});

// Product detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await db.execute(
      'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).render('error', { message: 'Product not found' });
    }

    res.render('products/show', {
      title: `${products[0].name} - DRB Store`,
      product: products[0]
    });
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).render('error', { message: 'Error loading product' });
  }
});

module.exports = router;

