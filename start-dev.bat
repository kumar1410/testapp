@echo off
echo 🚀 Starting Remainder Queen Development Environment...
echo.

echo 📦 Installing Backend Dependencies...
cd Remainder_Queen_Backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed
    pause
    exit /b 1
)

echo.
echo 📦 Installing Frontend Dependencies...
cd ..\remainder-queen-frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed
    pause
    exit /b 1
)

echo.
echo 🔧 Setting up environment...
cd ..\Remainder_Queen_Backend
call node setup.js

cd ..\remainder-queen-frontend
call node setup.js

echo.
echo 🎯 Starting Backend Server...
cd ..\Remainder_Queen_Backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 📱 Starting Frontend Development Server...
cd ..\remainder-queen-frontend
start "Frontend Server" cmd /k "npx expo start"

echo.
echo ✅ Development environment started!
echo.
echo 📋 Next steps:
echo 1. Backend will be available at http://localhost:5000
echo 2. Frontend will open in Expo Go or simulator
echo 3. Make sure MySQL is running
echo 4. Update .env file with your configuration
echo.
echo Press any key to exit...
pause > nul
