const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { initDB, getDB } = require("./config/dbConfig");
const logger = require("./logger");
require("dotenv").config();
const cors = require("cors");

// Test users for development and testing
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

const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*", // your frontend URL
    credentials: true, // allow cookies / auth headers
  })
);

// Setup Morgan with Winston
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Function to setup test users
async function setupTestUsers(db) {
  try {
    // Create test_users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS test_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        phoneno VARCHAR(15) NOT NULL UNIQUE,
        role ENUM('admin', 'test') NOT NULL DEFAULT 'test',
        username VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_username (username),
        UNIQUE KEY unique_phone (phoneno)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Insert test users
    for (const user of TEST_USERS) {
      await db.execute(
        `INSERT INTO test_users (name, phoneno, role, username) 
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name),
         role = VALUES(role)`,
        [user.name, user.phoneno, user.role, user.username]
      );
    }

    console.log('✅ Test users table ready.');
    
    // Log available test users
    const [users] = await db.execute('SELECT username, role FROM test_users ORDER BY role, username');
    console.log('\nAvailable test users for direct login:');
    console.table(users);

  } catch (err) {
    console.error('Failed to setup test users:', err.message);
  }
}

app.get("/", async (req, res) => {
  const db = getDB();
  const [users] = await db.execute('SELECT username, role FROM test_users ORDER BY role, username');
  
  res.json({
    status: "Backend running",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
    message: "Welcome to the Remainder Queen Backend API!",
    database: process.env.DB_NAME || "not set",
    testUsers: users
  });
});

// Routes
const userRoutes = require("./routes/users.routes");
app.use("/api/v1/users", userRoutes);
const authRoutes = require("./routes/auth.routes");
app.use("/api/v1/auth", authRoutes);
const taskRoutes = require("./routes/task.routes");
app.use("/api/v1/task", taskRoutes);
// Routes

// Notifications routes (FCM token register/unregister)
const notificationsRoutes = require("./routes/notifications.routes");
app.use("/api/v1/notifications", notificationsRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  await initDB(); // ✅ DB + tables ready once
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
