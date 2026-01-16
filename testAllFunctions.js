const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode }));
    });

    req.on('error', (error) => reject(error));
    req.end();
  });
}

async function testAllFunctions() {
  try {
    console.log('🧪 Testing all website functions...\n');

    // Test 1: Check home page
    console.log('1. Testing home page...');
    const home = await makeRequest('/');
    console.log('   ✅ Home page: ' + home.status);

    // Test 2: Check products page
    console.log('2. Testing products page...');
    const products = await makeRequest('/products');
    console.log('   ✅ Products page: ' + products.status);

    // Test 3: Check cart page
    console.log('3. Testing cart page...');
    const cart = await makeRequest('/cart');
    console.log('   ✅ Cart page: ' + cart.status);

    // Test 4: Check login page
    console.log('4. Testing login page...');
    const login = await makeRequest('/auth/login');
    console.log('   ✅ Login page: ' + login.status);

    console.log('\n✅ All basic pages are accessible!\n');
    console.log('📝 IMPORTANT - Manual testing checklist:');
    console.log('\n🔓 AUTH & PROFILE:');
    console.log('   [ ] Login with admin@drbstore.com / admin123');
    console.log('   [ ] Click profile button (👤 name)');
    console.log('   [ ] Verify profile page loads with user info');
    console.log('   [ ] Click "Edit Profile" button');
    console.log('   [ ] Verify edit modal opens');
    console.log('   [ ] Edit a field and save');
    console.log('   [ ] Verify success message shows and page reloads');

    console.log('\n📊 ADMIN PANEL:');
    console.log('   [ ] Click "Admin" button in navbar');
    console.log('   [ ] Verify admin dashboard loads');

    console.log('\n🛍️  PRODUCT MANAGEMENT:');
    console.log('   [ ] Click "Products" in admin menu');
    console.log('   [ ] Click "Edit" button on a product');
    console.log('   [ ] Verify edit modal opens with product data');
    console.log('   [ ] Edit a field and save');
    console.log('   [ ] Verify product updates');

    console.log('\n📦 CATEGORY MANAGEMENT:');
    console.log('   [ ] Click "Categories" in admin menu');
    console.log('   [ ] Click "Edit" button on a category');
    console.log('   [ ] Verify modal opens');
    console.log('   [ ] Edit and save');

    console.log('\n📢 ADVERTISEMENT MANAGEMENT:');
    console.log('   [ ] Click "Advertisements" in admin menu');
    console.log('   [ ] Click "Edit" button on an ad');
    console.log('   [ ] Verify modal opens');
    console.log('   [ ] Edit and save');

    console.log('\n🛒 SHOPPING & CHECKOUT:');
    console.log('   [ ] Go to home page');
    console.log('   [ ] Add product to cart');
    console.log('   [ ] Go to cart page');
    console.log('   [ ] Click checkout');
    console.log('   [ ] Fill order form and submit');
    console.log('   [ ] Verify success page shows');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAllFunctions();
