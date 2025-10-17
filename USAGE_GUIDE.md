# Panduan Instalasi dan Penggunaan Chat App

## 📦 Instalasi

### Langkah 1: Pastikan MongoDB Terinstall dan Berjalan

#### Windows:
1. Download MongoDB dari https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Jalankan MongoDB:
   - Buka Services (Win + R, ketik `services.msc`)
   - Cari "MongoDB" dan pastikan statusnya "Running"
   - Atau jalankan di terminal: `net start MongoDB`

#### Mac/Linux:
```bash
# Mac (menggunakan Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Langkah 2: Setup Aplikasi

Buka PowerShell di direktori `chat-projects` dan jalankan:

```powershell
.\setup.ps1
```

Script ini akan:
- Memeriksa apakah MongoDB berjalan
- Menginstall semua dependencies untuk server
- Menginstall semua dependencies untuk client

### Langkah 3: Jalankan Aplikasi

Setelah setup selesai, jalankan:

```powershell
.\start.ps1
```

Script ini akan membuka 2 terminal baru:
- Terminal 1: Server (Backend) di `http://localhost:5000`
- Terminal 2: Client (Frontend) di `http://localhost:5173`

### Alternatif: Manual

Jika ingin menjalankan manual:

**Terminal 1 (Server):**
```powershell
cd server
npm run dev
```

**Terminal 2 (Client):**
```powershell
cd client
npm run dev
```

## 🎯 Cara Menggunakan Aplikasi

### 1. Register / Login

1. Buka browser dan akses `http://localhost:5173`
2. Anda akan melihat halaman login
3. Klik "Belum punya akun? Daftar" untuk membuat akun baru
4. Isi form:
   - Username: Nama pengguna Anda
   - Email: Email valid
   - Password: Minimal 6 karakter (disarankan)
5. Klik tombol "Daftar"
6. Anda akan otomatis login dan masuk ke halaman chat

### 2. Halaman Chat

Setelah login, Anda akan melihat layout 3 bagian:

**Bagian Kiri - Daftar Kontak:**
- Menampilkan semua pengguna yang terdaftar
- Avatar dengan inisial nama
- Indikator online/offline (titik hijau = online)
- Klik pada kontak untuk memulai chat

**Bagian Tengah - Jendela Chat:**
- Menampilkan percakapan dengan kontak yang dipilih
- Pesan Anda ditampilkan di kanan (biru)
- Pesan lawan bicara di kiri (abu-abu)
- Timestamp pada setiap pesan

**Header Chat:**
- Nama dan status online kontak
- Tombol "Panggilan Suara" (ikon telepon)

**Input Pesan:**
- Ketik pesan di bagian bawah
- Tekan "Enter" atau klik "Kirim"

### 3. Fitur Chat

**Mengirim Pesan:**
1. Pilih kontak dari daftar kiri
2. Ketik pesan di input bagian bawah
3. Klik "Kirim" atau tekan Enter
4. Pesan akan langsung terkirim secara real-time

**Melihat Riwayat Chat:**
- Semua pesan tersimpan di database
- Saat memilih kontak, riwayat chat otomatis dimuat
- Scroll ke atas untuk melihat pesan lama

### 4. Fitur Panggilan Suara

**Memulai Panggilan:**
1. Pilih kontak yang ingin dipanggil
2. Klik tombol "Panggilan Suara" di header
3. Browser akan meminta izin akses mikrofon - klik "Allow"
4. Modal panggilan akan muncul dengan status "Memanggil..."
5. Tunggu lawan bicara menjawab

**Menerima Panggilan:**
1. Saat ada panggilan masuk, modal akan muncul otomatis
2. Anda akan melihat nama pemanggil
3. Klik tombol hijau (✓) untuk menjawab
4. Klik tombol merah (X) untuk menolak

**Selama Panggilan:**
- Tombol Mute/Unmute: Untuk membisukan mikrofon Anda
- Tombol End Call (merah): Untuk mengakhiri panggilan
- Status "Terhubung" akan muncul saat panggilan aktif

**Mengakhiri Panggilan:**
- Klik tombol merah dengan ikon telepon
- Atau tutup modal

### 5. Status Online/Offline

- **Titik Hijau**: Pengguna sedang online
- **Tidak Ada Titik**: Pengguna sedang offline
- Status diperbarui secara real-time

### 6. Logout

Klik tombol "Keluar" di pojok kanan atas untuk logout.

## 🎨 Tips Penggunaan

1. **Multi-User Testing:**
   - Buka 2-3 tab browser berbeda (atau gunakan mode Incognito)
   - Register dengan email berbeda di setiap tab
   - Test chat dan panggilan antar akun

2. **Panggilan Suara:**
   - Gunakan headset untuk kualitas audio lebih baik
   - Pastikan mikrofon tidak di-mute di sistem operasi
   - Untuk testing di 1 komputer, gunakan headset untuk menghindari echo

3. **Responsif Mobile:**
   - Buka developer tools (F12)
   - Toggle device toolbar untuk simulasi mobile
   - Di mobile, kolom kiri bisa disembunyikan (planned feature)

## ⚠️ Troubleshooting

### Tidak Bisa Mengirim Pesan
- Pastikan server berjalan (cek terminal server)
- Cek koneksi internet
- Refresh halaman browser

### Panggilan Suara Tidak Berfungsi
- Pastikan browser memiliki izin akses mikrofon
- Chrome/Edge: Settings → Privacy → Site Settings → Microphone
- Reload halaman dan coba lagi
- Gunakan HTTPS untuk production (localhost OK untuk development)

### Pesan Tidak Muncul Real-time
- Cek koneksi Socket.IO di console browser (F12)
- Pastikan tidak ada error di terminal server
- Restart server dan client

### MongoDB Connection Error
```powershell
# Cek status MongoDB
Get-Service MongoDB

# Jalankan jika berhenti
net start MongoDB
```

### Port Already in Use
Jika port 5000 atau 5173 sudah digunakan:

**Server (port 5000):**
Edit `server/.env`:
```
PORT=5001
```

**Client (port 5173):**
Edit `client/vite.config.ts`:
```typescript
server: {
  port: 5174
}
```

## 🔐 Keamanan

⚠️ **Untuk Production:**
1. Ganti `JWT_SECRET` di `.env` dengan nilai yang kuat
2. Gunakan HTTPS
3. Implementasi rate limiting
4. Validasi input lebih ketat
5. Gunakan MongoDB Atlas atau database terpercaya
6. Set proper CORS origins

## 📱 Browser Support

✅ **Didukung:**
- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Opera 67+

❌ **Tidak Didukung:**
- Internet Explorer (WebRTC tidak support)

## 🆘 Bantuan Lebih Lanjut

Jika mengalami masalah:
1. Cek console browser (F12 → Console)
2. Cek terminal server untuk error
3. Pastikan semua dependencies terinstall
4. Coba hapus `node_modules` dan run `npm install` lagi

---

**Selamat Mencoba! 🚀**
