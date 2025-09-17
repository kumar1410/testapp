const admin = require("firebase-admin");

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return admin;

  // Initialize using a service account JSON path or base64 JSON in env
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json";
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  let credential;
  if (serviceAccountBase64) {
    const json = Buffer.from(serviceAccountBase64, "base64").toString("utf8");
    credential = admin.credential.cert(JSON.parse(json));
  } else if (serviceAccountPath) {
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const serviceAccount = require(serviceAccountPath);
      credential = admin.credential.cert(serviceAccount);
    } catch (error) {
      console.error("Error loading service account:", error.message);
      throw new Error(
        `Failed to load service account from ${serviceAccountPath}`
      );
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = admin.credential.applicationDefault();
  } else {
    // Fallback to default service account
    try {
      const serviceAccount = require("./serviceAccountKey.json");
      credential = admin.credential.cert(serviceAccount);
    } catch (error) {
      throw new Error(
        "Firebase Admin credentials not provided. Please ensure serviceAccountKey.json exists or set environment variables."
      );
    }
  }

  admin.initializeApp({
    credential,
  });
  initialized = true;
  return admin;
}

module.exports = { initFirebaseAdmin };
