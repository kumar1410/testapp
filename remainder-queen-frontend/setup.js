#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up Remainder Queen Frontend...\n");

// Check if google-services.json exists
const googleServicesPath = path.join(__dirname, "google-services.json");
if (!fs.existsSync(googleServicesPath)) {
  console.log("❌ google-services.json not found");
  console.log(
    "📝 Please download your Firebase config file and place it as google-services.json"
  );
  console.log(
    "🔗 Get it from: https://console.firebase.google.com/project/remainderqueen/settings/general"
  );
} else {
  console.log("✅ Firebase config file found");
}

// Check app.json configuration
const appJsonPath = path.join(__dirname, "app.json");
if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

  // Check if package name matches
  const expectedPackageName = "com.remainderqueen";
  const actualPackageName = appJson.expo?.android?.package;

  if (actualPackageName !== expectedPackageName) {
    console.log("⚠️  Package name mismatch detected");
    console.log(`Expected: ${expectedPackageName}`);
    console.log(`Found: ${actualPackageName}`);
    console.log(
      "📝 Please update the package name in app.json to match your Firebase project"
    );
  } else {
    console.log("✅ Package name configuration looks good");
  }
}

console.log("\n📋 Next steps:");
console.log("1. Ensure google-services.json is properly configured");
console.log("2. Update the API URL in config/axiosConfig.ts if needed");
console.log("3. Run: npm install");
console.log("4. Run: npx expo start");
console.log("\n🎉 Setup complete!");
