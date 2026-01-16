const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function testSystem() {
  try {
    console.log('=== Testing User Access Control ===\n');

    // Get all users
    const [users] = await db.execute('SELECT id, name, email, password, roles FROM users');
    
    console.log('Users in database:');
    users.forEach(user => {
      const roles = typeof user.roles === 'string' ? JSON.parse(user.roles) : user.roles;
      console.log(`\n  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Roles: ${JSON.stringify(roles)}`);
    });

    // Test admin password
    console.log('\n=== Testing Admin Password ===');
    const adminUser = users.find(u => u.email === 'admin@drbstore.com');
    if (adminUser) {
      const isValidAdmin = await bcrypt.compare('admin123', adminUser.password);
      console.log(`Admin password "admin123" is valid: ${isValidAdmin}`);
    } else {
      console.log('ERROR: Admin user not found!');
    }

    // Test manager password
    console.log('\n=== Testing Manager Password ===');
    const managerUser = users.find(u => u.email === 'manager@drbstore.com');
    if (managerUser) {
      const isValidManager = await bcrypt.compare('manager123', managerUser.password);
      console.log(`Manager password "manager123" is valid: ${isValidManager}`);
    } else {
      console.log('ERROR: Manager user not found!');
    }

    console.log('\n=== Role Check Function Test ===');
    
    // Simulate admin session
    if (adminUser) {
      const adminRoles = typeof adminUser.roles === 'string' ? JSON.parse(adminUser.roles) : adminUser.roles;
      console.log('\nAdmin Session Roles:', adminRoles);
      console.log('Has ROLE_ADMIN:', adminRoles.includes('ROLE_ADMIN'));
      console.log('Has ROLE_RESPONSABLE:', adminRoles.includes('ROLE_RESPONSABLE'));
    }

    // Simulate manager session
    if (managerUser) {
      const managerRoles = typeof managerUser.roles === 'string' ? JSON.parse(managerUser.roles) : managerUser.roles;
      console.log('\nManager Session Roles:', managerRoles);
      console.log('Has ROLE_ADMIN:', managerRoles.includes('ROLE_ADMIN'));
      console.log('Has ROLE_RESPONSABLE:', managerRoles.includes('ROLE_RESPONSABLE'));
    }

    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testSystem();
