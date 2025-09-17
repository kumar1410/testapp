Write-Host "🚀 Starting Remainder Queen Development Environment..." -ForegroundColor Green
Write-Host ""

Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location "Remainder_Queen_Backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependency installation failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location "..\remainder-queen-frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependency installation failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🔧 Setting up environment..." -ForegroundColor Yellow
Set-Location "..\Remainder_Queen_Backend"
node setup.js

Set-Location "..\remainder-queen-frontend"
node setup.js

Write-Host ""
Write-Host "🎯 Starting Backend Server..." -ForegroundColor Green
Set-Location "..\Remainder_Queen_Backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "📱 Starting Frontend Development Server..." -ForegroundColor Green
Set-Location "..\remainder-queen-frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx expo start"

Write-Host ""
Write-Host "✅ Development environment started!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Backend will be available at http://localhost:5000" -ForegroundColor White
Write-Host "2. Frontend will open in Expo Go or simulator" -ForegroundColor White
Write-Host "3. Make sure MySQL is running" -ForegroundColor White
Write-Host "4. Update .env file with your configuration" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
