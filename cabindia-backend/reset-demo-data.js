// cabindia-backend/reset-demo-data.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDemoData() {
  console.log('🔄 Resetting demo data...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
    });

    console.log('✅ Connected to database');

    // Delete in correct order (foreign key constraints)
    await connection.execute('DELETE FROM refunds');
    await connection.execute('DELETE FROM support_tickets');
    await connection.execute('DELETE FROM payments');
    await connection.execute('DELETE FROM rides');
    await connection.execute('DELETE FROM vehicles');
    await connection.execute('DELETE FROM drivers');
    await connection.execute('DELETE FROM contact_messages');
    await connection.execute('DELETE FROM users WHERE email LIKE "%@demo.com%" OR email = "admin@cabindia.com"');
    
    console.log('✅ Demo data reset successfully!');
    console.log('📋 Run "npm run seed" to re-seed demo data.');

    await connection.end();
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
}

resetDemoData();