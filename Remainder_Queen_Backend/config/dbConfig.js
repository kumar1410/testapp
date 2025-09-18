const mysql = require("mysql2/promise");

// Test users configuration
const TEST_USERS = [
  {
    name: 'Admin User',
    phoneno: '1111111111',
    role: 'admin',
    username: 'admin'
  },
  {
    name: 'Test User',
    phoneno: '2222222222',
    role: 'test',
    username: 'test'
  },
  {
    name: 'Demo User',
    phoneno: '3333333333',
    role: 'test',
    username: 'demouser'
  }
];

let pool;

async function createTestUsersTable(pool) {
  try {
    console.log('Creating test_users table...');
    
    // Drop the table first to avoid any schema issues
    await pool.execute('DROP TABLE IF EXISTS test_users');
    
    // Create test_users table
    await pool.execute(`
      CREATE TABLE test_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        phoneno VARCHAR(15) NOT NULL,
        role ENUM('admin', 'test') NOT NULL DEFAULT 'test',
        username VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_username (username),
        UNIQUE KEY unique_phone (phoneno)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Test users table created successfully');

    // Insert test users
    for (const user of TEST_USERS) {
      try {
        await pool.execute(
          `INSERT INTO test_users (name, phoneno, role, username) 
           VALUES (?, ?, ?, ?)`,
          [user.name, user.phoneno, user.role, user.username]
        );
        console.log(`✅ Test user ${user.username} created`);
      } catch (err) {
        console.error(`Failed to create test user ${user.username}:`, err.message);
      }
    }

    // Verify the users were created
    const [users] = await pool.execute('SELECT * FROM test_users');
    console.log('\nTest users in database:');
    console.table(users);
  } catch (err) {
    console.error('Failed to setup test users:', err);
    throw err;
  }
}

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
      queueLimit: 0,
      multipleStatements: true
    });

    // Test the connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');

    // Setup test users table
    await createTestUsersTable(pool);

    return true;
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
    throw err;
  }
}

function getDB() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return pool;
}

module.exports = {
  initDB,
  getDB
};
    `);

    await pool.query(`
  CREATE TABLE IF NOT EXISTS task (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Status ENUM('Todo', 'Completed','Rejected') DEFAULT 'Todo',

    Assignee VARCHAR(15),
    AssignTo VARCHAR(15),

    CreatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_task_assignee FOREIGN KEY (Assignee) REFERENCES users(phoneno) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_task_assignto FOREIGN KEY (AssignTo) REFERENCES users(phoneno) ON DELETE SET NULL ON UPDATE CASCADE
  );
`);

    console.log("✅ Users table ready.");

    // Push tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_push_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(512) NOT NULL,
        platform ENUM('ios','android') NULL,
        created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_user_token (user_id, token),
        CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ Push tokens table ready.");

    return pool;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
}

function getDB() {
  if (!pool) {
    throw new Error("DB not initialized. Call initDB() first.");
  }
  return pool;
}

module.exports = { initDB, getDB };
