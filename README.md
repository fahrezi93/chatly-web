# Chat App - Aplikasi Chat dan Panggilan Suara Modern

Aplikasi chat real-time berbasis web dengan fitur panggilan suara menggunakan WebRTC. Terinspirasi dari Discord dan WhatsApp Web dengan tema gelap yang modern.

## 🚀 Fitur Utama

- ✅ **Chat Real-time** - Komunikasi instant menggunakan Socket.IO
- ✅ **Panggilan Suara** - Fitur voice call menggunakan WebRTC
- ✅ **Autentikasi** - Register dan login dengan JWT
- ✅ **Status Online/Offline** - Melihat status kehadiran pengguna
- ✅ **Tema Gelap** - Desain modern dengan dark mode
- ✅ **Responsif** - Tampilan optimal di desktop dan mobile

## 🛠️ Teknologi

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- bcryptjs

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Socket.IO Client
- React Router DOM
- WebRTC API
- Axios

## 📋 Prasyarat

Pastikan Anda telah menginstal:
- Node.js (v16 atau lebih tinggi)
- MongoDB (terinstal dan berjalan)
- npm atau yarn

## 🔧 Instalasi

### 1. Clone atau Download Project

### 2. Setup Backend (Server)

```powershell
# Masuk ke direktori server
cd server

# Install dependencies
npm install

# Buat file .env
Copy-Item .env.example .env

# Edit file .env dan sesuaikan konfigurasi
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/chat-app
# JWT_SECRET=your_secret_key_here

# Jalankan server dalam mode development
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### 3. Setup Frontend (Client)

Buka terminal/PowerShell baru:

```powershell
# Masuk ke direktori client
cd client

# Install dependencies
npm install

# Jalankan aplikasi dalam mode development
npm run dev
```

Client akan berjalan di `http://localhost:5173`

## 🎯 Cara Menggunakan

1. **Pastikan MongoDB berjalan** di sistem Anda
2. **Jalankan server backend** terlebih dahulu
3. **Jalankan aplikasi frontend**
4. **Buka browser** dan akses `http://localhost:5173`
5. **Daftar akun baru** atau login jika sudah memiliki akun
6. **Pilih kontak** dari daftar untuk memulai chat
7. **Klik tombol telepon** untuk memulai panggilan suara

## 📁 Struktur Project

```
chat-projects/
├── server/                 # Backend aplikasi
│   ├── src/
│   │   ├── models/        # Model database (User, Message)
│   │   │   ├── User.ts
│   │   │   └── Message.ts
│   │   └── server.ts      # Server utama dengan Socket.IO
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── client/                 # Frontend aplikasi
    ├── src/
    │   ├── components/    # Komponen React
    │   │   ├── Avatar.tsx
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── ContactList.tsx
    │   │   ├── ChatWindow.tsx
    │   │   └── VoiceCallModal.tsx
    │   ├── pages/         # Halaman utama
    │   │   ├── LoginPage.tsx
    │   │   └── ChatPage.tsx
    │   ├── types/         # TypeScript types
    │   │   └── index.ts
    │   ├── App.tsx        # Root component
    │   ├── main.tsx       # Entry point
    │   └── index.css      # Global styles
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

## 🎨 Desain & UX

- **Tema Gelap**: Background abu-abu gelap (bg-gray-900) sebagai default
- **Warna Aksen**: Biru cerah (bg-blue-600) untuk tombol dan notifikasi
- **Layout 3 Kolom**: 
  - Kiri: Daftar kontak dengan avatar dan status online
  - Tengah: Jendela chat utama
  - Kanan: (Reserved untuk pengembangan selanjutnya)
- **Animasi Halus**: Transisi smooth pada hover dan interaksi
- **Responsif**: Menyesuaikan layout di berbagai ukuran layar

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Daftar pengguna baru
- `POST /api/auth/login` - Login pengguna

### Users
- `GET /api/users` - Mendapatkan semua pengguna

### Messages
- `GET /api/messages/:userId/:recipientId` - Mendapatkan riwayat pesan

## 🔌 Socket.IO Events

### Client → Server
- `user-connected` - Pengguna terhubung
- `private-message` - Mengirim pesan pribadi
- `call-user` - Memulai panggilan
- `answer-call` - Menjawab panggilan
- `ice-candidate` - Mengirim ICE candidate
- `reject-call` - Menolak panggilan
- `end-call` - Mengakhiri panggilan

### Server → Client
- `receive-message` - Menerima pesan baru
- `message-sent` - Konfirmasi pesan terkirim
- `user-status-changed` - Status online/offline berubah
- `incoming-call` - Panggilan masuk
- `call-answered` - Panggilan dijawab
- `call-rejected` - Panggilan ditolak
- `call-ended` - Panggilan berakhir

## 🚧 Pengembangan Selanjutnya

- [ ] Notifikasi push
- [ ] Pengiriman file/gambar
- [ ] Video call
- [ ] Group chat
- [ ] Emoji picker
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Message search
- [ ] Dark/Light theme toggle
- [ ] Profile settings

## 📝 Catatan Penting

- Pastikan MongoDB berjalan sebelum memulai server
- Untuk production, ganti `JWT_SECRET` dengan nilai yang aman
- WebRTC memerlukan HTTPS untuk production (dapat menggunakan ngrok untuk testing)
- Izinkan akses mikrofon di browser untuk fitur panggilan suara

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Pastikan MongoDB berjalan:
- Windows: Cek service MongoDB di Services
- Mac/Linux: sudo systemctl start mongod
```

### Port Already in Use
```
Ubah port di file .env (server) atau vite.config.ts (client)
```

### WebRTC Not Working
```
- Pastikan menggunakan HTTPS atau localhost
- Berikan izin akses mikrofon di browser
- Cek console browser untuk error
```

## 📄 Lisensi

MIT License - Bebas digunakan untuk keperluan pembelajaran dan pengembangan.

## 👨‍💻 Kontribusi

Kontribusi sangat diterima! Silakan fork repository dan buat pull request.

---

**Dibuat dengan ❤️ menggunakan React, Node.js, dan WebRTC**
