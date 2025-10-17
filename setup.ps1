# Script untuk setup dan menjalankan aplikasi Chat
# Pastikan MongoDB sudah berjalan sebelum menjalankan script ini

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Chat App - Full Stack" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah MongoDB berjalan
Write-Host "[1/4] Memeriksa MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✓ MongoDB berjalan" -ForegroundColor Green
} else {
    Write-Host "✗ MongoDB tidak berjalan!" -ForegroundColor Red
    Write-Host "  Silakan jalankan MongoDB terlebih dahulu" -ForegroundColor Yellow
    Write-Host ""
    exit
}

# Install dependencies untuk server
Write-Host ""
Write-Host "[2/4] Menginstall dependencies untuk Server..." -ForegroundColor Yellow
Set-Location -Path "server"
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies server sudah terinstall" -ForegroundColor Green
} else {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies server berhasil diinstall" -ForegroundColor Green
    } else {
        Write-Host "✗ Gagal install dependencies server" -ForegroundColor Red
        exit
    }
}
Set-Location -Path ".."

# Install dependencies untuk client
Write-Host ""
Write-Host "[3/4] Menginstall dependencies untuk Client..." -ForegroundColor Yellow
Set-Location -Path "client"
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies client sudah terinstall" -ForegroundColor Green
} else {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies client berhasil diinstall" -ForegroundColor Green
    } else {
        Write-Host "✗ Gagal install dependencies client" -ForegroundColor Red
        exit
    }
}
Set-Location -Path ".."

# Selesai
Write-Host ""
Write-Host "[4/4] Setup selesai!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cara Menjalankan Aplikasi" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Jalankan Server (Terminal 1):" -ForegroundColor Yellow
Write-Host "   cd server" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. Jalankan Client (Terminal 2):" -ForegroundColor Yellow
Write-Host "   cd client" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Buka browser dan akses:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Atau gunakan script:" -ForegroundColor Yellow
Write-Host "   .\start.ps1" -ForegroundColor White
Write-Host ""
