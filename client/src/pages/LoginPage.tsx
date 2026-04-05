import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';
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

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ email: '', password: '', username: '', displayName: '' });
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans sm:overflow-hidden selection:bg-blue-500/30">
      
      {/* --- LEFT SIDE: Visual/Brand (Hidden on Mobile) --- */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative bg-slate-950 overflow-hidden isolate">
        
        {/* Minimalist Texture overlay without gradient color */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none mix-blend-overlay"></div>

        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 xl:p-20">
          <div>
            <div className="flex items-center gap-3 text-white mb-20 animate-fade-in">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <MessageSquare size={20} className="text-white" fill="currentColor" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Chatly.</span>
            </div>
            
            <h1 className="text-[3.5rem] xl:text-[4.5rem] font-bold text-white tracking-tight leading-[1.05] mb-6 animate-slide-in-up">
              {isLogin ? (
                <>Kembali untuk<br/><span className="text-blue-500">terhubung.</span></>
              ) : (
                <>Mulai obrolan<br/><span className="text-blue-500">tanpa batas.</span></>
              )}
            </h1>
            <p className="text-lg text-slate-400 max-w-md font-medium leading-relaxed animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              Platform komunikasi instan yang didesain untuk kenyamanan, kecepatan, dan obrolan yang lebih bermakna.
            </p>
          </div>

          {/* Minimalist Floating Chat UI Mockup */}
          <div className="relative mt-8 xl:mt-12 group animate-slide-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <div className="bg-slate-900 rounded-[28px] p-6 w-[90%] xl:w-[80%] border border-slate-800 shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-blue-600 p-[2px]">
                    <img src={`https://ui-avatars.com/api/?name=${isLogin ? 'Alex' : 'Budi'}&background=fff&color=2563EB`} alt="avatar" className="w-full h-full rounded-full border-2 border-slate-900" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-white text-[16px] font-semibold tracking-wide">{isLogin ? 'Alex Danvers' : 'Budi Santoso'}</h3>
                  <p className="text-blue-500 text-xs font-semibold tracking-wide uppercase mt-0.5">Sedang mengetik...</p>
                </div>
              </div>
              <div className="bg-slate-800 rounded-2xl rounded-tl-sm p-4 inline-block">
                <p className="text-slate-200 text-[15px] leading-relaxed">
                  {isLogin ? 'Desain barunya kelihatan keren banget! ✨' : 'Wah, asik banget aplikasinya! 🚀'}
                </p>
              </div>
            </div>
            
            <div className="absolute -bottom-6 right-0 xl:-bottom-10 xl:right-4 bg-blue-600 rounded-[24px] rounded-br-sm p-4 xl:p-5 shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
              <p className="text-white text-[15px] xl:text-[16px] leading-snug font-medium">Setuju, sangat minimalis! 😍</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Login/Register Form --- */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto bg-white lg:rounded-l-3xl z-20">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="absolute top-6 left-6 flex lg:hidden items-center gap-2">
           <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <MessageSquare size={18} className="text-white" fill="currentColor" />
           </div>
           <span className="text-xl font-bold tracking-tight text-slate-900">Chatly.</span>
        </div>

        <div className="w-full max-w-[420px] pt-12 lg:pt-0">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[2rem] sm:text-[2.5rem] font-bold text-slate-900 tracking-tight mb-2 leading-tight">
              {isLogin ? 'Selamat Datang' : 'Buat Akun'}
            </h2>
            <p className="text-slate-500 font-medium text-[15px]">
              {isLogin ? 'Silakan masukkan detail Anda untuk masuk.' : 'Daftar sekarang untuk memulai obrolan.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-5 animate-slide-in-down">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Username"
                    type="text"
                    placeholder="fahrezi"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    required
                    pattern="[a-z0-9_]{3,20}"
                    title="3-20 karakter"
                  />
                  <Input
                    label="Nama"
                    type="text"
                    placeholder="Tampilan"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    required
                    maxLength={50}
                  />
                </div>
              </div>
            )}

            <div className={`${!isLogin ? 'animate-fade-in space-y-5' : 'space-y-5'}`}>
              <Input
                label="Alamat Email"
                type="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                label="Kata Sandi"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between pt-1 pb-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 peer appearance-none border-2 border-slate-200 rounded-[6px] bg-white checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer hover:border-blue-400"
                    />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[14px] text-slate-500 group-hover:text-slate-900 transition-colors font-semibold select-none">Ingat saya</span>
                </label>
                <button type="button" className="text-[14px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Lupa kata sandi?
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-[14px] flex items-center gap-3 border border-red-100 animate-slide-in-up">
                <AlertCircle size={18} className="shrink-0 text-red-500" />
                <p className="leading-snug font-semibold">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full relative flex justify-center items-center py-3.5 text-[15px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? 'Masuk ke Akun' : 'Daftar Sekarang'}
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Alternative Auth / Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400 font-bold tracking-widest text-[11px] uppercase">Atau</span>
            </div>
          </div>

          <div className="text-center lg:text-left text-[14.5px] font-medium text-slate-500">
            {isLogin ? 'Belum bergabung di Chatly? ' : 'Sudah punya akun? '}
            <button
              type="button"
              onClick={handleToggleMode}
              className="font-bold text-blue-600 hover:text-blue-700 transition-colors hover:underline"
            >
              {isLogin ? 'Buat akun sekarang' : 'Masuk di sini'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
