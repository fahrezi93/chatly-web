import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';
import Input from '../components/Input';
import { saveAuthData, isAuthenticated } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/chat');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      
      // Save token and user info with remember me option
      saveAuthData(
        response.data.token,
        response.data.user.id,
        response.data.user.username,
        rememberMe
      );

      // Navigate to chat
      navigate('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#7C3AED] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1E293B]/20 to-[#1E293B]/40"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src="/logo-chatly.png" 
              alt="Chatly Logo" 
              className="h-14 w-auto"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-[#1E293B] mb-2">
            {isLogin ? 'Selamat Datang Kembali!' : 'Bergabung dengan Chatly'}
          </h1>
          <p className="text-[#64748B] text-sm">
            {isLogin ? 'Masuk untuk melanjutkan percakapan Anda' : 'Buat akun dan mulai ngobrol sekarang'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <Input
                label="Username"
                type="text"
                placeholder="contoh: fahrezi93 (huruf kecil, angka, _)"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                required
                pattern="[a-z0-9_]{3,20}"
                title="Username harus 3-20 karakter, hanya huruf kecil, angka, dan underscore"
              />
              <Input
                label="Nama Tampilan"
                type="text"
                placeholder="Nama yang akan ditampilkan (bisa pakai spasi & emoji)"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                maxLength={50}
              />
            </>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="Masukkan email Anda"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Kata Sandi"
            type="password"
            placeholder="Masukkan kata sandi"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          {isLogin && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] bg-white border-[#64748B]/30 rounded focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-[#64748B] cursor-pointer">
                Ingat saya
              </label>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : (
              isLogin ? 'Masuk' : 'Buat Akun'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#64748B]/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#64748B]">atau</span>
          </div>
        </div>

        {/* Toggle Login/Register */}
        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-[#64748B] hover:text-[#2563EB] transition-colors text-sm font-medium group"
          >
            {isLogin ? (
              <>
                Belum punya akun? <span className="text-[#2563EB] group-hover:underline">Daftar disini!</span>
              </>
            ) : (
              <>
                Sudah punya akun? <span className="text-[#2563EB] group-hover:underline">Masuk disini!</span>
              </>
            )}
          </button>
        </div>

        {/* Footer tagline */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#64748B] font-medium">
            Ngobrol Tanpa Batas
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
