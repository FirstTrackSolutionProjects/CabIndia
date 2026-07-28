// cabindia-backend/test-db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);
  console.log('Port:', process.env.DB_PORT);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 12291,
      ssl: {
        rejectUnauthorized: false,
      },
      connectTimeout: 30000,
    });
    
    console.log('✅ Connection successful!');
    
    const [result] = await connection.execute('SELECT 1 as test, NOW() as time');
    console.log('Query result:', result);
    
    await connection.end();
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testConnection();