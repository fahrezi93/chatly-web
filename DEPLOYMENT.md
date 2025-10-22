# 🚀 Deployment Guide

## Backend (Railway)

### Status
✅ Backend sudah di-deploy di Railway

### Environment Variables yang Diperlukan:
Pastikan sudah set di Railway dashboard:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key untuk JWT authentication
- `CLIENT_URL` - URL frontend Vercel (setelah deploy)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `PORT` - Otomatis di-set oleh Railway

### Railway URL:
Setelah deployment berhasil, copy URL backend Railway Anda (contoh: `https://chatly-web-production.up.railway.app`)

---

## Frontend (Vercel)

### Langkah Deploy ke Vercel:

#### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

#### 2. Deploy via Vercel Dashboard (Recommended)

1. **Login ke Vercel**
   - Buka https://vercel.com
   - Login dengan GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select repository: `fahrezi93/chatly-web`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**
   - Click "Environment Variables"
   - Add variable:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://your-railway-backend-url.railway.app` (URL Railway backend Anda)
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Tunggu proses build selesai (~2-3 menit)

#### 3. Deploy via CLI (Alternative)

```bash
# Login ke Vercel
vercel login

# Deploy dari root project
vercel

# Ikuti prompt:
# - Set up and deploy? Yes
# - Which scope? (pilih account Anda)
# - Link to existing project? No
# - Project name? chatly-web
# - In which directory is your code located? ./client
# - Override settings? Yes
#   - Build Command: npm run build
#   - Output Directory: dist
#   - Development Command: npm run dev

# Set environment variable
vercel env add VITE_API_URL

# Paste Railway backend URL, tekan Enter
# Select environment: Production, Preview, Development (pilih semua)

# Deploy ke production
vercel --prod
```

### 4. Update Backend CORS

Setelah frontend di-deploy, update `CLIENT_URL` di Railway:
1. Buka Railway dashboard
2. Pilih service backend
3. Go to "Variables"
4. Update `CLIENT_URL` dengan URL Vercel Anda (contoh: `https://chatly-web.vercel.app`)
5. Redeploy backend

---

## Testing

### 1. Test Backend
```bash
curl https://your-railway-backend.railway.app/health
```

Response:
```json
{
  "status": "ok",
  "uptime": 123.45,
  "mongodb": "connected"
}
```

### 2. Test Frontend
- Buka URL Vercel Anda
- Coba register/login
- Test chat functionality
- Test voice call
- Test file upload

---

## Troubleshooting

### Backend Issues

**Problem**: Healthcheck failed
- **Solution**: Pastikan MongoDB URI benar dan database accessible

**Problem**: CORS error
- **Solution**: Update `CLIENT_URL` di Railway dengan URL Vercel yang benar

### Frontend Issues

**Problem**: API calls gagal
- **Solution**: Pastikan `VITE_API_URL` di Vercel sudah benar

**Problem**: Socket.IO tidak connect
- **Solution**: Pastikan backend Railway sudah running dan accessible

**Problem**: Build failed
- **Solution**: Check build logs di Vercel dashboard

---

## URLs

- **Frontend (Vercel)**: https://your-app.vercel.app
- **Backend (Railway)**: https://your-app.railway.app
- **GitHub Repo**: https://github.com/fahrezi93/chatly-web

---

## Maintenance

### Update Backend
```bash
git add .
git commit -m "update: backend changes"
git push
# Railway akan auto-deploy
```

### Update Frontend
```bash
git add .
git commit -m "update: frontend changes"
git push
# Vercel akan auto-deploy
```

### Rollback
- **Vercel**: Dashboard → Deployments → pilih deployment sebelumnya → Promote to Production
- **Railway**: Dashboard → Deployments → pilih deployment sebelumnya → Redeploy
