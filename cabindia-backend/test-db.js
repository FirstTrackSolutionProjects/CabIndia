const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
      connectTimeout: 30000,
    });
    
    console.log('✅ Connection successful!');
    
    // Test queries
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`👤 Users: ${users[0].count}`);
    
    const [drivers] = await connection.execute('SELECT COUNT(*) as count FROM drivers');
    console.log(`🚗 Drivers: ${drivers[0].count}`);
    
    const [rides] = await connection.execute('SELECT COUNT(*) as count FROM rides');
    console.log(`🚕 Rides: ${rides[0].count}`);
    
    await connection.end();
    console.log('✅ All tests passed! Database is ready.');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();