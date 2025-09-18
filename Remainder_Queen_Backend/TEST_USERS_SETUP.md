# Test Users Setup Guide

This guide explains how to set up test users in your Render database.

## Prerequisites

1. MySQL database credentials from Render:
   - DB_HOST
   - DB_USER
   - DB_PASSWORD
   - DB_NAME

2. Node.js installed on your machine

## Setup Steps

1. Go to the backend scripts directory:
   ```bash
   cd Remainder_Queen_Backend/scripts
   ```

2. Copy the example env file and edit it:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your Render database credentials:
   ```bash
   nano .env
   ```

4. Install required dependencies:
   ```bash
   npm install mysql2 dotenv
   ```

5. Run the setup script:
   ```bash
   node setup-test-db.js
   ```

## Test Users

After running the script, these test accounts will be available:

1. Admin User:
   - Username: admin
   - Password: admin123
   - Role: admin
   - Phone: 1111111111

2. Test User:
   - Username: test
   - Password: test123
   - Role: test
   - Phone: 2222222222

3. Demo User:
   - Username: demouser
   - Password: demo123
   - Role: test
   - Phone: 3333333333

## Verification

You can verify the setup by:

1. Using the test login endpoint:
   ```bash
   curl -X POST https://testapp-4x8g.onrender.com/api/v1/auth/test-login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin"}'
   ```

2. Using the app's test login screen with any of the above credentials.

## Troubleshooting

1. If you get database connection errors:
   - Verify your database credentials in `.env`
   - Make sure your IP is whitelisted in Render's database settings

2. If the script fails:
   - Check the error message
   - Verify that the database user has sufficient privileges
   - Try running the script with `DEBUG=1 node setup-test-db.js` for more details