# Script untuk menjalankan aplikasi Chat (Server dan Client)
# Pastikan sudah menjalankan setup.ps1 terlebih dahulu

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Chat App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah MongoDB berjalan
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if (-not $mongoProcess) {
    Write-Host "✗ MongoDB tidak berjalan!" -ForegroundColor Red
    Write-Host "  Silakan jalankan MongoDB terlebih dahulu" -ForegroundColor Yellow
    exit
}

Write-Host "Membuka 2 terminal baru..." -ForegroundColor Yellow
Write-Host "- Terminal 1: Server (Backend)" -ForegroundColor Cyan
Write-Host "- Terminal 2: Client (Frontend)" -ForegroundColor Cyan
Write-Host ""

# Jalankan server di terminal baru
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; Write-Host 'Starting Server...' -ForegroundColor Green; npm run dev"

# Tunggu 3 detik
Start-Sleep -Seconds 3

# Jalankan client di terminal baru
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; Write-Host 'Starting Client...' -ForegroundColor Green; npm run dev"

Write-Host "✓ Server dan Client sedang berjalan" -ForegroundColor Green
Write-Host ""
Write-Host "Akses aplikasi di: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Tekan Ctrl+C di masing-masing terminal untuk menghentikan" -ForegroundColor Gray
