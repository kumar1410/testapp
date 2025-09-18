require('dotenv').config();
const mysql = require('mysql2/promise');

// Test users to be added
const TEST_USERS = [
  {
    name: 'Admin User',
    phone: '1111111111',
    role: 'admin',
    username: 'admin',
    password: '$2b$10$xLRTmYEYkOPHoKwYOGKtb.l8sCdTXAJo5yDOWxIXpV2e7lS0DV2Li' // hashed 'admin123'
  },
  {
    name: 'Test User',
    phone: '2222222222',
    role: 'test',
    username: 'test',
    password: '$2b$10$8KvWJ3ZLt1h7BTY3QjAZgek7K3YnpFPd9xzMkwkzwpwqIl/yahZXi' // hashed 'test123'
  },
  {
    name: 'Demo User',
    phone: '3333333333',
    role: 'test',
    username: 'demouser',
    password: '$2b$10$YU5Xs7rFYBXmKwyCsrq4/.Th6LfFZViwqUQVvQ.PhApI5RkQc3y3.' // hashed 'demo123'
  }
];

async function setupTestUsers() {
  let connection;

  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database successfully!');

    // Create test_users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS test_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(15) NOT NULL UNIQUE,
        role ENUM('admin', 'test') NOT NULL DEFAULT 'test',
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_username (username),
        UNIQUE KEY unique_phone (phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Test users table created/verified!');

    // Insert test users
    for (const user of TEST_USERS) {
      try {
        await connection.execute(
          `INSERT INTO test_users (name, phone, role, username, password) 
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           name = VALUES(name),
           role = VALUES(role),
           password = VALUES(password)`,
          [user.name, user.phone, user.role, user.username, user.password]
        );
        console.log(`✅ User ${user.username} created/updated successfully`);
      } catch (err) {
        console.error(`❌ Error creating user ${user.username}:`, err.message);
      }
    }

    // Verify the users were created
    const [rows] = await connection.execute('SELECT username, role, name FROM test_users ORDER BY role, username');
    console.log('\nTest users in database:');
    console.table(rows);

  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupTestUsers().then(() => {
  console.log('\nSetup completed! You can now use these test accounts:');
  console.log('1. admin/admin123 (Admin access)');
  console.log('2. test/test123 (Test user)');
  console.log('3. demouser/demo123 (Demo user)');
  process.exit(0);
});