# 🚀 Deployment Guide - Remainder Queen App

## Quick Deploy to Render (No Local Setup Required)

### Step 1: Create Hosted Database (Planetscale)

1. **Sign up at [planetscale.com](https://planetscale.com)**
2. **Create a new database:**
   - Click "Create database"
   - Name: `remainder_queen_db_main`
   - Region: Choose closest to you
   - Plan: Free (Hobby)
3. **Get connection details:**
   - Go to your database → "Connect"
   - Click "Generate new password"
   - Copy the connection string (Node.js format)
   - Note these values:
     - `host`: `aws.connect.psdb.cloud`
     - `username`: `your_username`
     - `password`: `your_password`
     - `database`: `remainder_queen_db_main`

### Step 2: Deploy Backend to Render

1. **Push code to GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/remainder-queen.git
   git push -u origin main
   ```

2. **Deploy on Render:**

   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Select `Remainder_Queen_Backend` folder
   - Configure:
     - **Name**: `remainder-queen-backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Set Environment Variables:**

   - In Render dashboard → Your service → Environment
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=10000
     DB_HOST=aws.connect.psdb.cloud
     DB_USER=your_planetscale_username
     DB_PASSWORD=your_planetscale_password
     DB_NAME=remainder_queen_db_main
     DB_CONNECTION_LIMIT=10
     DB_QUEUE_LIMIT=0
     JWT_SECRET=your-super-secret-jwt-key-here
     OTP_SECRET=your-otp-secret-key-here
     TWO_FACTOR_API_KEY=your-2factor-api-key
     FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_encoded_service_account
     ```

4. **Get Firebase Service Account Base64:**

   - In PowerShell:
     ```powershell
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("serviceAccountKey.json"))
     ```
   - Copy the output and paste as `FIREBASE_SERVICE_ACCOUNT_BASE64`

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your service URL: `https://your-service-name.onrender.com`

### Step 3: Update Frontend Configuration

1. **Update API URL:**
     
   - Open `remainder-queen-frontend/config/axiosConfig.ts`
   - Replace the URL:
     ```typescript
     let url = "httckps://your-service-name.onrender.com";
     ```

2. **Test locally (optional):**
   ```bash
   cd remainder-queen-frontend
   npm install
   npx expo start
   ```

### Step 4: Test the App

1. **Open Expo Go on your phone**
2. **Scan the QR code** from terminal
3. **Test the flow:**
   - Sign Up with your phone number
   - Login → Send OTP → Enter OTP (check backend logs for OTP)
   - Create tasks and test notifications

## Alternative: Test Without Phone (Development Mode)

If you want to test without SMS:

1. **Update auth controller** to skip SMS:

   ```javascript
   // In auth.controller.js, comment out the SMS part:
   // const response = await axios.get(url);
   // console.log("2factor:", response.data);
   ```

2. **The OTP will be logged** in Render logs for testing

## Database Schema (Auto-created)

The app will automatically create these tables:

- `users` - User accounts
- `task` - Task management
- `user_push_tokens` - Push notification tokens

## Troubleshooting

### Backend Issues:

- **Database connection failed**: Check Planetscale credentials
- **Firebase error**: Verify service account base64
- **OTP not working**: Check 2Factor API key or use logged OTP

### Frontend Issues:

- **API calls failing**: Check Render URL in axiosConfig.ts
- **Expo not starting**: Try `npx expo start --clear`

### Render Issues:

- **Build failing**: Check Node.js version (should be 18+)
- **Service not starting**: Check environment variables
- **Database timeout**: Check Planetscale connection limits

## Production Checklist

- [ ] Database hosted on Planetscale
- [ ] Backend deployed on Render
- [ ] Environment variables set
- [ ] Firebase service account configured
- [ ] Frontend API URL updated
- [ ] Test authentication flow
- [ ] Test task creation
- [ ] Test push notifications

## Cost

- **Planetscale**: Free tier (1 billion reads/month)
- **Render**: Free tier (750 hours/month)
- **Firebase**: Free tier (unlimited notifications)
- **2Factor.in**: Free tier (10 SMS/day)

Total: **$0/month** for development and small production use!

## Next Steps After Deployment

1. **Test all features** thoroughly
2. **Set up monitoring** (optional)
3. **Configure custom domain** (optional)
4. **Set up CI/CD** (optional)
5. **Add more features** as needed

Your app will be live at: `https://your-service-name.onrender.com` 🎉
