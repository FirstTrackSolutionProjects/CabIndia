// cabindia-backend/init-db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  console.log('🔧 Initializing database...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
      connectTimeout: 30000,
    });
    
    console.log('✅ Connected to database');
    
    // Create tables
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mobile VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NOT NULL,
        license_number VARCHAR(50),
        status ENUM('online', 'offline', 'on_trip', 'pending_verification') DEFAULT 'offline',
        current_lat DECIMAL(10, 8),
        current_lon DECIMAL(11, 8),
        is_available BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        vehicle_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        driver_id INT NOT NULL,
        make VARCHAR(50),
        model VARCHAR(50) NOT NULL,
        license_plate VARCHAR(20) NOT NULL,
        type VARCHAR(30) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS rides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        driver_id INT,
        pickup_address VARCHAR(255) NOT NULL,
        pickup_lat DECIMAL(10, 8) NOT NULL,
        pickup_lon DECIMAL(11, 8) NOT NULL,
        dropoff_address VARCHAR(255) NOT NULL,
        dropoff_lat DECIMAL(10, 8) NOT NULL,
        dropoff_lon DECIMAL(11, 8) NOT NULL,
        vehicle_type_requested VARCHAR(30) NOT NULL,
        estimated_price VARCHAR(50),
        final_price VARCHAR(50),
        distance_km DECIMAL(10, 2),
        status ENUM('pending', 'accepted', 'started', 'completed', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        cancellation_reason TEXT,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        accepted_at TIMESTAMP NULL,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        cancelled_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        mobile VARCHAR(20),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];
    
    for (const query of queries) {
      await connection.execute(query);
    }
    
    console.log('✅ All tables created successfully');
    
    await connection.end();
    console.log('✅ Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initDatabase();