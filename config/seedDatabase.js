const db = require('./database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Delete existing admin and manager accounts to recreate them fresh
    await db.execute('DELETE FROM users WHERE email IN (?, ?)', ['admin@drbstore.com', 'manager@drbstore.com']);

    // Create admin account with proper password
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await db.execute(
      'INSERT INTO users (name, email, password, phone, roles) VALUES (?, ?, ?, ?, ?)',
      ['Admin', 'admin@drbstore.com', adminPassword, '+1234567890', JSON.stringify(['ROLE_ADMIN', 'ROLE_USER'])]
    );
    console.log('✓ Admin account created: admin@drbstore.com / admin123');

    // Create manager account with proper password
    const managerPassword = await bcrypt.hash('manager123', 10);
    
    await db.execute(
      'INSERT INTO users (name, email, password, phone, roles) VALUES (?, ?, ?, ?, ?)',
      ['Manager', 'manager@drbstore.com', managerPassword, '+1234567891', JSON.stringify(['ROLE_RESPONSABLE', 'ROLE_USER'])]
    );
    console.log('✓ Manager account created: manager@drbstore.com / manager123');

    console.log('\nDatabase seeding completed successfully!');
    console.log('\n=== Login Credentials ===');
    console.log('Admin Account:');
    console.log('  Email: admin@drbstore.com');
    console.log('  Password: admin123');
    console.log('\nManager Account:');
    console.log('  Email: manager@drbstore.com');
    console.log('  Password: manager123');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Database seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
