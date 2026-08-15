// cabindia-backend/reset-all-users.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAllUsers() {
  console.log('🗑️ Removing ALL users and related data...');
  console.log('============================================');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
    });

    console.log('✅ Connected to database successfully!');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    
    // Get count before deletion
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\n📊 Found ${userCount[0].count} users in database`);

    // Delete in correct order to avoid foreign key constraints
    console.log('\n🗑️ Deleting related data first...');
    
    // Delete refunds
    await connection.execute('DELETE FROM refunds');
    console.log('  ✅ Refunds deleted');
    
    // Delete payments
    await connection.execute('DELETE FROM payments');
    console.log('  ✅ Payments deleted');
    
    // Delete support tickets
    await connection.execute('DELETE FROM support_tickets');
    console.log('  ✅ Support tickets deleted');
    
    // Delete contact messages
    await connection.execute('DELETE FROM contact_messages');
    console.log('  ✅ Contact messages deleted');
    
    // Delete rides
    await connection.execute('DELETE FROM rides');
    console.log('  ✅ Rides deleted');
    
    // Delete vehicles
    await connection.execute('DELETE FROM vehicles');
    console.log('  ✅ Vehicles deleted');
    
    // Delete drivers
    await connection.execute('DELETE FROM drivers');
    console.log('  ✅ Drivers deleted');
    
    // Delete ALL users
    const [result] = await connection.execute('DELETE FROM users');
    console.log(`  ✅ ${result.affectedRows} users deleted`);
    
    // Verify
    const [remaining] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\n📊 Remaining users: ${remaining[0].count}`);
    
    console.log('\n============================================');
    console.log('✅ All users and related data removed successfully!');
    console.log('📋 Run "npm run seed" to create fresh demo data.');
    console.log('============================================');

    await connection.end();

  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
}

resetAllUsers();