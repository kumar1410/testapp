# Remainder Queen - Task Management App

A full-stack task management application with Firebase push notifications, built with React Native (Expo) frontend and Node.js backend.

## 🚀 Features

- **User Authentication**: Phone number-based OTP authentication
- **Task Management**: Create, assign, update, and track tasks
- **Push Notifications**: Real-time notifications via Firebase Cloud Messaging
- **Cross-Platform**: Works on iOS and Android
- **Real-time Updates**: Live task status updates

## 📁 Project Structure

```
Cursor-Prj/
├── Remainder_Queen_Backend/     # Node.js backend API
│   ├── config/                  # Database and Firebase configuration
│   ├── controllers/             # API route handlers
│   ├── models/                  # Database models
│   ├── routes/                  # API routes
│   ├── services/                # Business logic services
│   ├── middlewares/             # Authentication middleware
│   └── utils/                   # Utility functions
├── remainder-queen-frontend/    # React Native frontend
│   ├── app/                     # Expo Router pages
│   ├── components/              # Reusable components
│   ├── context/                 # React Context providers
│   ├── services/                # API service functions
│   └── config/                  # App configuration
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MySQL database
- Firebase project
- Expo CLI (for mobile development)
- 2Factor.in API key (for SMS OTP)

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd Remainder_Queen_Backend
   ```

2. **Run setup script:**

   ```bash
   node setup.js
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Configure environment:**

   - Update `.env` file with your configuration
   - Add your 2Factor.in API key
   - Ensure `serviceAccountKey.json` is in the backend root

5. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd remainder-queen-frontend
   ```

2. **Run setup script:**

   ```bash
   node setup.js
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Configure Firebase:**

   - Ensure `google-services.json` is in the frontend root
   - Update package name in `app.json` if needed

5. **Start the development server:**
   ```bash
   npx expo start
   ```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=remainder_queen_db_main

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
OTP_SECRET=your-otp-secret-key

# 2Factor API
TWO_FACTOR_API_KEY=your-2factor-api-key

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Frontend Configuration

Update `config/axiosConfig.ts` with your backend URL:

```typescript
let url = "http://YOUR_IP_ADDRESS:5000"; // Your computer's IP address
```

## 📱 Mobile Development

### For Physical Device Testing

1. **Install Expo Go app** on your phone
2. **Start the development server:**
   ```bash
   npx expo start
   ```
3. **Scan the QR code** with Expo Go

### For iOS Simulator

```bash
npx expo run:ios
```

### For Android Emulator

```bash
npx expo run:android
```

## 🔥 Firebase Setup

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com)
2. **Enable Authentication** (Phone provider)
3. **Enable Cloud Messaging**
4. **Download configuration files:**
   - Backend: Service Account Key → `serviceAccountKey.json`
   - Frontend: Android config → `google-services.json`

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phoneno VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_on DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tasks Table

```sql
CREATE TABLE task (
  id INT AUTO_INCREMENT PRIMARY KEY,
  Title VARCHAR(255) NOT NULL,
  Description TEXT,
  Status ENUM('Todo', 'Completed', 'Rejected') DEFAULT 'Todo',
  Assignee VARCHAR(15),
  AssignTo VARCHAR(15),
  CreatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_assignee FOREIGN KEY (Assignee) REFERENCES users(phoneno),
  CONSTRAINT fk_task_assignto FOREIGN KEY (AssignTo) REFERENCES users(phoneno)
);
```

### Push Tokens Table

```sql
CREATE TABLE user_push_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(512) NOT NULL,
  platform ENUM('ios', 'android'),
  created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_token (user_id, token),
  CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🚀 API Endpoints

### Authentication

- `POST /api/v1/auth/send-otp` - Send OTP to phone number
- `POST /api/v1/auth/verify-otp` - Verify OTP and get JWT token

### Users

- `POST /api/v1/users` - Create new user
- `GET /api/v1/users` - Get all users

### Tasks

- `POST /api/v1/task` - Create new task
- `GET /api/v1/task` - Get user's tasks
- `GET /api/v1/task/:id` - Get task by ID
- `PUT /api/v1/task/:id` - Update task
- `PUT /api/v1/task/:id/status` - Update task status

### Notifications

- `POST /api/v1/notifications/register` - Register push token
- `POST /api/v1/notifications/unregister` - Unregister push token

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error:**

   - Ensure MySQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Firebase Configuration Error:**

   - Check if `serviceAccountKey.json` exists
   - Verify Firebase project settings
   - Ensure correct package name in `app.json`

3. **OTP Not Received:**

   - Check 2Factor.in API key
   - Verify phone number format
   - Check API quota

4. **Push Notifications Not Working:**
   - Ensure device has internet connection
   - Check notification permissions
   - Verify Firebase configuration

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in backend `.env` file.

## 📝 Development Notes

- The app uses JWT tokens for authentication
- Tasks are assigned by phone number
- Push notifications are sent for task updates
- Database uses MySQL with connection pooling
- Frontend uses Expo Router for navigation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues, please check the troubleshooting section or create an issue in the repository.
