@echo off
echo 🚀 Testing Remainder Queen App...
echo.

echo 📱 Starting Expo (compatible with Node 16)...
cd remainder-queen-frontend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Frontend installation failed
    pause
    exit /b 1
)

echo.
echo 🎯 Starting Expo development server...
echo 📱 Open Expo Go on your phone and scan the QR code
echo 🌐 Or press 'w' to open in web browser
echo.
call npx expo start --clear

pause
