#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up Remainder Queen Backend...\n");

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, ".env");
if (!fs.existsSync(envPath)) {
  const envContent = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=remainder_queen_db_main
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Date.now()}
OTP_SECRET=your-otp-secret-key-change-this-in-production-${Date.now()}

# 2Factor API (for SMS OTP) - Get your API key from https://2factor.in
TWO_FACTOR_API_KEY=your-2factor-api-key

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Server Configuration
PORT=5000
NODE_ENV=development
`;

  fs.writeFileSync(envPath, envContent);
  console.log("✅ Created .env file with default configuration");
  console.log("⚠️  Please update the environment variables in .env file");
} else {
  console.log("✅ .env file already exists");
}

// Check if serviceAccountKey.json exists
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.log("❌ serviceAccountKey.json not found");
  console.log(
    "📝 Please download your Firebase service account key and place it as serviceAccountKey.json"
  );
  console.log(
    "🔗 Get it from: https://console.firebase.google.com/project/remainderqueen/settings/serviceaccounts/adminsdk"
  );
} else {
  console.log("✅ Firebase service account key found");
}

console.log("\n📋 Next steps:");
console.log("1. Update .env file with your actual configuration");
console.log("2. Ensure MySQL is running and create the database");
console.log("3. Run: npm install");
console.log("4. Run: npm run dev");
console.log("\n🎉 Setup complete!");
