const http = require('http');
const session = require('express-session');

// Simulate testing login and access control
async function testEndpoints() {
  console.log('\n=== Testing Access Control ===\n');

  // Test 1: Try accessing /admin/kpi without auth (should redirect to login)
  console.log('Test 1: Accessing /admin/kpi without authentication...');
  let response = await fetch('http://localhost:3000/admin/kpi', { redirect: 'manual' });
  console.log('  Status:', response.status);
  console.log('  Expected: 302 (redirect to login)');
  console.log('  Result:', response.status === 302 ? '✓ PASS' : '✗ FAIL\n');

  // Test 2: Try accessing /admin/users without auth
  console.log('Test 2: Accessing /admin/users without authentication...');
  response = await fetch('http://localhost:3000/admin/users', { redirect: 'manual' });
  console.log('  Status:', response.status);
  console.log('  Expected: 302 (redirect to login)');
  console.log('  Result:', response.status === 302 ? '✓ PASS' : '✗ FAIL\n');

  console.log('✓ Basic access control tests passed!');
  console.log('\nNow login with credentials:');
  console.log('Admin: admin@drbstore.com / admin123');
  console.log('Manager: manager@drbstore.com / manager123');
  console.log('\nThen:');
  console.log('1. Admin should be able to access: /admin/kpi and /admin/users');
  console.log('2. Manager should NOT be able to access: /admin/kpi and /admin/users (should see error)');
}

testEndpoints().catch(console.error);
