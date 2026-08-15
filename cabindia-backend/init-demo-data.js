// cabindia-backend/init-demo-data.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDemoData() {
  console.log('🌱 Seeding demo data...');
  console.log('============================================');
  
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
      connectTimeout: 30000,
    });

    console.log('✅ Connected to database successfully!');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log('============================================');

    // ============================================
    // 1. CREATE OR UPDATE DEMO USERS (FIXED)
    // ============================================
    console.log('\n👤 Creating/Updating demo users...');
    
    const demoUsers = [
      { name: 'Rahul Sharma', email: 'rahul@demo.com', mobile: '9876543210', password: 'Demo@123' },
      { name: 'Priya Patel', email: 'priya@demo.com', mobile: '9876543211', password: 'Demo@123' },
      { name: 'Amit Kumar', email: 'amit@demo.com', mobile: '9876543212', password: 'Demo@123' },
      { name: 'Sneha Reddy', email: 'sneha@demo.com', mobile: '9876543213', password: 'Demo@123' },
      { name: 'Vikram Singh', email: 'vikram@demo.com', mobile: '9876543214', password: 'Demo@123' },
      { name: 'Admin User', email: 'admin@cabindia.com', mobile: '9876543215', password: 'Admin@123' },
    ];

    const userIds = [];
    for (const user of demoUsers) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const role = user.email.includes('admin') ? 'admin' : 'user';
        
        // Check if user exists by email
        const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [user.email]);
        
        if (existing.length > 0) {
          // UPDATE existing user - don't update mobile if it's the same
          await connection.execute(
            `UPDATE users SET 
              name = ?, 
              password = ?, 
              role = ?,
              updated_at = NOW()
             WHERE email = ?`,
            [user.name, hashedPassword, role, user.email]
          );
          userIds.push({ id: existing[0].id, email: user.email, password: user.password, name: user.name });
          console.log(`  🔄 Updated: ${user.name} (${user.email}) with password: ${user.password}`);
        } else {
          // INSERT new user
          const [result] = await connection.execute(
            `INSERT INTO users (name, email, mobile, password, role, created_at) 
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [user.name, user.email, user.mobile, hashedPassword, role]
          );
          userIds.push({ id: result.insertId, email: user.email, password: user.password, name: user.name });
          console.log(`  ✅ Created: ${user.name} (${user.email}) with password: ${user.password}`);
        }
      } catch (err) {
        // If mobile duplicate error, try again with different approach
        if (err.code === 'ER_DUP_ENTRY' && err.message.includes('mobile')) {
          console.log(`  ⚠️ Mobile number already exists for ${user.email}, skipping mobile update`);
          try {
            // Try to update without mobile
            const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [user.email]);
            if (existing.length > 0) {
              const hashedPassword = await bcrypt.hash(user.password, 10);
              const role = user.email.includes('admin') ? 'admin' : 'user';
              await connection.execute(
                `UPDATE users SET 
                  name = ?, 
                  password = ?, 
                  role = ?,
                  updated_at = NOW()
                 WHERE email = ?`,
                [user.name, hashedPassword, role, user.email]
              );
              userIds.push({ id: existing[0].id, email: user.email, password: user.password, name: user.name });
              console.log(`  🔄 Updated: ${user.name} (${user.email}) with password: ${user.password} (mobile skipped)`);
            }
          } catch (retryErr) {
            console.error(`  ❌ Failed to process ${user.email}:`, retryErr.message);
          }
        } else {
          console.error(`  ❌ Failed to process ${user.email}:`, err.message);
        }
      }
    }
    console.log(`✅ Processed ${userIds.length} demo users`);

    // ============================================
    // 2. CREATE DEMO DRIVERS
    // ============================================
    console.log('\n🚗 Creating demo drivers...');
    
    const drivers = [
      { user_id: userIds[0]?.id, license_number: 'DL-2024-001', status: 'online', is_available: true },
      { user_id: userIds[1]?.id, license_number: 'DL-2024-002', status: 'online', is_available: true },
      { user_id: userIds[2]?.id, license_number: 'DL-2024-003', status: 'online', is_available: true },
    ];

    const driverIds = [];
    for (const driver of drivers) {
      if (!driver.user_id) continue;
      try {
        const [existing] = await connection.execute(
          'SELECT id FROM drivers WHERE user_id = ?',
          [driver.user_id]
        );
        if (existing.length > 0) {
          driverIds.push(existing[0].id);
          console.log(`  ⚠️ Driver already exists for user ${driver.user_id}`);
          continue;
        }
        
        const [result] = await connection.execute(
          `INSERT INTO drivers (user_id, license_number, status, is_available, created_at) 
           VALUES (?, ?, ?, ?, NOW())`,
          [driver.user_id, driver.license_number, driver.status, driver.is_available]
        );
        driverIds.push(result.insertId);
        console.log(`  ✅ Created driver ${driver.license_number}`);
      } catch (err) {
        console.error(`  ❌ Failed to create driver:`, err.message);
      }
    }
    console.log(`✅ Created ${driverIds.length} demo drivers`);

    // ============================================
    // 3. CREATE DEMO VEHICLES
    // ============================================
    console.log('\n🚙 Creating demo vehicles...');
    
    const vehicles = [
      { driver_id: driverIds[0], make: 'White', model: 'Maruti Swift', license_plate: 'OD-02-AB-1234', type: 'Sedan' },
      { driver_id: driverIds[1], make: 'Red', model: 'Hyundai i20', license_plate: 'OD-02-CD-5678', type: 'Sedan' },
      { driver_id: driverIds[2], make: 'Black', model: 'Tata Tiago', license_plate: 'OD-02-EF-9012', type: 'Mini' },
    ];

    for (const vehicle of vehicles) {
      if (!vehicle.driver_id) continue;
      try {
        await connection.execute(
          `INSERT INTO vehicles (driver_id, make, model, license_plate, type, created_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [vehicle.driver_id, vehicle.make, vehicle.model, vehicle.license_plate, vehicle.type]
        );
        console.log(`  ✅ Created vehicle: ${vehicle.model} (${vehicle.license_plate})`);
      } catch (err) {
        console.error(`  ❌ Failed to create vehicle:`, err.message);
      }
    }
    console.log(`✅ Created ${vehicles.length} demo vehicles`);

    // ============================================
    // 4. CREATE DEMO RIDES
    // ============================================
    console.log('\n🚕 Creating demo rides...');
    
    const rideStatuses = ['completed', 'completed', 'completed', 'completed', 'pending', 'accepted', 'started'];
    const locations = [
      { pickup: 'Bhubaneswar Railway Station', drop: 'KIIT University', lat: 20.2961, lon: 85.8245 },
      { pickup: 'Smart City Square', drop: 'Infosys Campus', lat: 20.3100, lon: 85.8300 },
      { pickup: 'BMC Bhawani Mall', drop: 'Utkal University', lat: 20.3200, lon: 85.8400 },
      { pickup: 'Patia Square', drop: 'Nayapalli', lat: 20.3350, lon: 85.8500 },
      { pickup: 'Airport Road', drop: 'Railway Station', lat: 20.2950, lon: 85.8200 },
      { pickup: 'Jagamara', drop: 'Bhubaneswar Town Hall', lat: 20.2850, lon: 85.8350 },
      { pickup: 'Chandrasekharpur', drop: 'Infocity', lat: 20.3250, lon: 85.8450 },
    ];

    const ridePrices = [180, 220, 150, 200, 250, 300, 175];
    const rideTypes = ['Sedan', 'Sedan', 'Mini', 'Auto', 'SUV', 'Sedan', 'Mini'];
    const paymentStatuses = ['paid', 'paid', 'paid', 'paid', 'pending', 'pending', 'paid'];
    const rideIds = [];

    for (let i = 0; i < Math.min(7, locations.length); i++) {
      try {
        const loc = locations[i];
        const status = rideStatuses[i % rideStatuses.length];
        const price = ridePrices[i % ridePrices.length];
        const type = rideTypes[i % rideTypes.length];
        const driverId = driverIds[i % driverIds.length];
        const userId = userIds[(i + 1) % userIds.length]?.id;
        const paymentStatus = paymentStatuses[i % paymentStatuses.length];

        if (!userId || !driverId) continue;

        const [existing] = await connection.execute(
          'SELECT id FROM rides WHERE pickup_address = ? AND dropoff_address = ?',
          [loc.pickup, loc.drop]
        );
        if (existing.length > 0) {
          rideIds.push(existing[0].id);
          console.log(`  ⚠️ Ride already exists: ${loc.pickup} → ${loc.drop}`);
          continue;
        }

        const [result] = await connection.execute(
          `INSERT INTO rides (
            user_id, driver_id, pickup_address, pickup_lat, pickup_lon,
            dropoff_address, dropoff_lat, dropoff_lon,
            vehicle_type_requested, estimated_price, final_price,
            distance_km, status, payment_status,
            requested_at, accepted_at, started_at, completed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
          [
            userId, driverId,
            loc.pickup, loc.lat, loc.lon,
            loc.drop, loc.lat + 0.02, loc.lon + 0.02,
            type, price, status === 'completed' ? price : null,
            5 + Math.random() * 10,
            status,
            paymentStatus,
            status !== 'pending' ? 'NOW()' : null,
            status === 'started' || status === 'completed' ? 'NOW()' : null,
            status === 'completed' ? 'NOW()' : null,
          ]
        );
        rideIds.push(result.insertId);
        console.log(`  ✅ Created ride: ${loc.pickup} → ${loc.drop} (${status})`);
      } catch (err) {
        console.error(`  ❌ Failed to create ride:`, err.message);
      }
    }
    console.log(`✅ Created ${rideIds.length} demo rides`);

    // ============================================
    // 5. CREATE DEMO CONTACT MESSAGES
    // ============================================
    console.log('\n📧 Creating demo contact messages...');
    
    const demoMessages = [
      { name: 'Rahul Sharma', email: 'rahul@demo.com', mobile: '9876543210', message: 'Great service! The driver was very polite and reached on time.' },
      { name: 'Priya Patel', email: 'priya@demo.com', mobile: '9876543211', message: 'Love the app! Very easy to book and the prices are reasonable.' },
      { name: 'Amit Kumar', email: 'amit@demo.com', mobile: '9876543212', message: 'I had an issue with payment but the support team resolved it quickly.' },
      { name: 'Sneha Reddy', email: 'sneha@demo.com', mobile: '9876543213', message: 'The ride was very comfortable. Highly recommend CabIndia!' },
      { name: 'Vikram Singh', email: 'vikram@demo.com', mobile: '9876543214', message: 'Need more captains in my area. Otherwise the service is great.' },
    ];

    for (const msg of demoMessages) {
      try {
        await connection.execute(
          `INSERT INTO contact_messages (name, email, mobile, message, created_at) 
           VALUES (?, ?, ?, ?, NOW())`,
          [msg.name, msg.email, msg.mobile, msg.message]
        );
        console.log(`  ✅ Created message from ${msg.name}`);
      } catch (err) {
        console.error(`  ❌ Failed to create message:`, err.message);
      }
    }
    console.log(`✅ Created ${demoMessages.length} demo contact messages`);

    // ============================================
    // 6. CREATE DEMO SUPPORT TICKETS
    // ============================================
    console.log('\n🎫 Creating demo support tickets...');
    
    const ticketCategories = ['booking', 'payment', 'driver', 'safety', 'refund', 'other'];
    const ticketStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    const ticketPriorities = ['low', 'medium', 'high', 'urgent'];
    const ticketDescriptions = [
      'Unable to book a ride, app shows error',
      'Payment failed but money was deducted from my account',
      'Driver was rude and unprofessional',
      'Safety concern during the ride',
      'Requesting refund for cancelled ride',
      'General inquiry about the service',
    ];

    for (let i = 0; i < 6; i++) {
      try {
        const userId = userIds[i % userIds.length]?.id;
        if (!userId) continue;

        const ticketId = `TKT-${Date.now().toString().slice(-8)}-${String.fromCharCode(65 + i)}`;
        
        await connection.execute(
          `INSERT INTO support_tickets (
            user_id, ticket_id, category, priority, status,
            description, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            userId,
            ticketId,
            ticketCategories[i % ticketCategories.length],
            ticketPriorities[i % ticketPriorities.length],
            ticketStatuses[i % ticketStatuses.length],
            ticketDescriptions[i % ticketDescriptions.length],
          ]
        );
        console.log(`  ✅ Created ticket: ${ticketId}`);
      } catch (err) {
        console.error(`  ❌ Failed to create ticket:`, err.message);
      }
    }
    console.log('✅ Created demo support tickets');

    // ============================================
    // 7. CREATE DEMO PAYMENT RECORDS
    // ============================================
    console.log('\n💳 Creating demo payment records...');
    
    for (let i = 0; i < Math.min(5, rideIds.length); i++) {
      try {
        const userId = userIds[i % userIds.length]?.id;
        const rideId = rideIds[i % rideIds.length];
        const driverId = driverIds[i % driverIds.length];
        
        if (!userId || !rideId || !driverId) {
          console.log(`  ⚠️ Skipping payment ${i+1}: missing data`);
          continue;
        }
        
        const amount = 100 + Math.random() * 400;
        const status = i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'pending' : 'refunded';
        
        await connection.execute(
          `INSERT INTO payments (user_id, ride_id, driver_id, amount, status, created_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [userId, rideId, driverId, Math.round(amount), status]
        );
        console.log(`  ✅ Created payment of ₹${Math.round(amount)} (${status}) for ride ${rideId}`);
      } catch (err) {
        console.error(`  ❌ Failed to create payment:`, err.message);
      }
    }
    console.log('✅ Created demo payment records');

    // ============================================
    // 8. CREATE DEMO REFUNDS
    // ============================================
    console.log('\n↩️ Creating demo refund records...');
    
    const [completedRides] = await connection.execute(
      'SELECT id FROM rides WHERE status = "completed" LIMIT 3'
    );
    
    for (let i = 0; i < Math.min(3, completedRides.length); i++) {
      try {
        const userId = userIds[i % userIds.length]?.id;
        const rideId = completedRides[i]?.id;
        
        if (!userId || !rideId) {
          console.log(`  ⚠️ Skipping refund ${i+1}: missing data`);
          continue;
        }
        
        const refundId = `REF-${Date.now().toString().slice(-8)}-${String.fromCharCode(65 + i)}`;
        const amount = 50 + Math.random() * 150;
        const status = i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'processed' : 'pending';
        
        await connection.execute(
          `INSERT INTO refunds (refund_id, ride_id, user_id, amount, reason, status, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [
            refundId,
            rideId,
            userId,
            Math.round(amount),
            'Customer requested refund for ride cancellation',
            status,
          ]
        );
        console.log(`  ✅ Created refund: ${refundId} (₹${Math.round(amount)}) for ride ${rideId}`);
      } catch (err) {
        console.error(`  ❌ Failed to create refund:`, err.message);
      }
    }
    console.log('✅ Created demo refund records');

    // ============================================
    // 9. VERIFY USERS AND DISPLAY SUMMARY
    // ============================================
    console.log('\n============================================');
    console.log('🎉 DEMO DATA SEEDING COMPLETE!');
    console.log('============================================');
    
    // Get all users to display
    const [allUsers] = await connection.execute(
      'SELECT id, name, email, role FROM users WHERE email LIKE "%@demo.com%" OR email = "admin@cabindia.com"'
    );
    
    console.log('\n📋 DEMO LOGIN CREDENTIALS:');
    console.log('----------------------------');
    allUsers.forEach((u, i) => {
      const password = u.email.includes('admin') ? 'Admin@123' : 'Demo@123';
      console.log(`${i + 1}. 👤 ${u.name}`);
      console.log(`   📧 Email: ${u.email}`);
      console.log(`   🔑 Password: ${password}`);
      console.log('   👤 Role: ' + (u.role || 'user'));
      console.log('----------------------------');
    });
    
    // Show statistics
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [driverCount] = await connection.execute('SELECT COUNT(*) as count FROM drivers');
    const [rideCount] = await connection.execute('SELECT COUNT(*) as count FROM rides');
    const [ticketCount] = await connection.execute('SELECT COUNT(*) as count FROM support_tickets');
    const [paymentCount] = await connection.execute('SELECT COUNT(*) as count FROM payments');
    const [refundCount] = await connection.execute('SELECT COUNT(*) as count FROM refunds');
    
    console.log('\n📊 DATABASE STATISTICS:');
    console.log(`👤 Users: ${userCount[0].count}`);
    console.log(`🚗 Drivers: ${driverCount[0].count}`);
    console.log(`🚕 Rides: ${rideCount[0].count}`);
    console.log(`💳 Payments: ${paymentCount[0].count}`);
    console.log(`↩️ Refunds: ${refundCount[0].count}`);
    console.log(`🎫 Support Tickets: ${ticketCount[0].count}`);
    console.log('============================================');
    console.log('✅ Ready for client presentation! 🚀');

    await connection.end();

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error('Please check your .env file and database connection.');
    process.exit(1);
  }
}

// Run the seeding function
seedDemoData();