const mysql = require("mysql2/promise");
let pool;

async function initDB() {
  try {
    // Create connection pool
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test the connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');

    // Create test users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        phoneno VARCHAR(15) NOT NULL,
        role ENUM('admin', 'test') NOT NULL DEFAULT 'test',
        username VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_username (username),
        UNIQUE KEY unique_phone (phoneno)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Test users table created');

    // Insert test users
    const testUsers = [
      { name: 'Admin User', phoneno: '1111111111', role: 'admin', username: 'admin' },
      { name: 'Test User', phoneno: '2222222222', role: 'test', username: 'test' },
      { name: 'Demo User', phoneno: '3333333333', role: 'test', username: 'demouser' }
    ];

    // Insert each test user
    for (const user of testUsers) {
      try {
        await pool.query(
          `INSERT INTO test_users (name, phoneno, role, username) 
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           name = VALUES(name),
           role = VALUES(role)`,
          [user.name, user.phoneno, user.role, user.username]
        );
        console.log(`✅ Test user ${user.username} ready`);
      } catch (err) {
        console.warn(`⚠️ Note: ${user.username} may already exist:`, err.message);
      }
    }

    // Verify test users
    const [users] = await pool.query('SELECT username, role FROM test_users');
    console.log('\nAvailable test users:');
    console.table(users);

    return true;
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    throw err;
  }
}

function getDB() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return pool;
}

module.exports = { initDB, getDB };