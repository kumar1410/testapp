const { initDB } = require("../config/dbConfig");
const { getDB } = require("../config/dbConfig");

const testUsers = [
  {
    name: "Admin User",
    phoneno: "1111111111",
    role: "admin",
    username: "admin"
  },
  {
    name: "Test User",
    phoneno: "2222222222",
    role: "test",
    username: "test"
  },
  {
    name: "Demo User",
    phoneno: "3333333333",
    role: "test",
    username: "demouser"
  }
];

async function setupTestUsers() {
  try {
    await initDB();
    const db = getDB();

    // First, create test_users table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS test_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        phoneno VARCHAR(15) NOT NULL UNIQUE,
        role ENUM('admin', 'test') NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert test users
    for (const user of testUsers) {
      try {
        await db.execute(
          "INSERT INTO test_users (name, phoneno, role, username) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role)",
          [user.name, user.phoneno, user.role, user.username]
        );
        console.log(`User ${user.username} created/updated successfully`);
      } catch (err) {
        console.error(`Error creating user ${user.username}:`, err);
      }
    }

    console.log("Test users setup completed!");
  } catch (err) {
    console.error("Setup failed:", err);
  } finally {
    process.exit();
  }
}

setupTestUsers();