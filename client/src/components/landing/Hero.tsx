import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Fixed Modern Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/80 backdrop-blur-lg border-slate-200/80 shadow-sm' : 'bg-transparent border-transparent'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src={isScrolled ? "/logo-chatly.png" : "/logo-chatly-putih.png"} alt="Chatly" className="w-6 h-6" />
              </div>
              <span className={`text-xl font-bold transition-colors duration-300 ${isScrolled ? 'text-slate-800' : 'text-white'}`}>
                Chatly
              </span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <a href="#features" className={`transition-colors duration-300 text-sm font-medium px-4 py-2 rounded-lg ${isScrolled ? 'text-slate-600 hover:bg-black/5' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                Fitur
              </a>
              <a href="#how-it-works" className={`transition-colors duration-300 text-sm font-medium px-4 py-2 rounded-lg ${isScrolled ? 'text-slate-600 hover:bg-black/5' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                Cara Kerja
              </a>
              <a href="#testimonials" className={`transition-colors duration-300 text-sm font-medium px-4 py-2 rounded-lg ${isScrolled ? 'text-slate-600 hover:bg-black/5' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                Testimonial
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              <Link 
                to="/login" 
                className={`transition-colors duration-300 font-medium text-sm hidden sm:inline-block px-4 py-2 rounded-lg ${isScrolled ? 'text-slate-600 hover:bg-black/5' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                Masuk
              </Link>
              <Link 
                to="/login" 
                className={`transition-all duration-300 text-sm font-semibold px-5 py-2 rounded-md ${isScrolled ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/30' : 'bg-white hover:bg-slate-200 text-blue-600 shadow-lg hover:shadow-white/30'}`}>
                Coba Gratis
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <section className="relative min-h-screen bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#7C3AED] overflow-hidden pt-20 sm:pt-24">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1E293B]/20 to-[#1E293B]/40"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-4 sm:space-y-6 text-white">
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm font-semibold tracking-wider opacity-90 uppercase">
                Tetap Terhubung Kapan Saja, Di Mana Saja
              </p>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Ngobrol Tanpa Batas
              </h1>
            </div>

            <p className="text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed max-w-lg">
              Chatly membuat obrolan, panggilan, dan pertemuan lebih lancar dari sebelumnya. Rasakan komunikasi modern yang cepat dengan sentuhan personal — semua dalam satu tempat.
            </p>

            <div className="flex items-center space-x-3 sm:space-x-4 pt-2">
              <Link 
                to="/login"
                className="inline-flex items-center justify-center space-x-2 bg-white text-[#2563EB] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg text-xs sm:text-sm"
              >
                <span>COBA SEKARANG</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-3 pt-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-2 border-white"></div>
              </div>
              <div className="ml-2">
                <p className="text-lg sm:text-xl font-bold">99.1%</p>
                <p className="text-xs text-white/70 max-w-sm">Rekam jejak terbukti dalam kepuasan klien dan kesuksesan berkelanjutan di seluruh dunia.</p>
              </div>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="relative flex items-center justify-center mt-8 lg:mt-0">
            <div className="relative scale-90 sm:scale-100">
              {/* Phone Frame */}
              <div className="relative w-[280px] h-[560px] bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-2.5 shadow-2xl border-[6px] border-gray-800">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
                
                {/* Screen */}
                <div className="relative w-full h-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[2rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-6 pt-8 pb-3">
                    <span className="text-white text-xs font-semibold">9:41 AM</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-2.5 bg-white/30 rounded-sm"></div>
                      <div className="w-3 h-2.5 bg-white/30 rounded-sm"></div>
                      <div className="w-3 h-2.5 bg-white rounded-sm"></div>
                    </div>
                  </div>

                  {/* Chat Header */}
                  <div className="px-5 pb-3 flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                    <div>
                      <h3 className="text-white text-sm font-bold">Sarah Johnson</h3>
                      <p className="text-[10px] text-green-400 flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                        Online
                      </p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="px-5 space-y-2.5 pb-16">
                    {/* Received Message */}
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm px-3 py-2 max-w-[70%]">
                        <p className="text-white text-[10px]">Halo! Gimana kabarnya?</p>
                        <p className="text-[8px] text-white/50 mt-0.5">10:30</p>
                      </div>
                    </div>
                    
                    {/* Sent Message */}
                    <div className="flex justify-end">
                      <div className="bg-[#2563EB] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[70%]">
                        <p className="text-white text-[10px]">Baik banget! Lagi coba app chat baru nih 🚀</p>
                        <p className="text-[8px] text-white/70 mt-0.5">10:31</p>
                      </div>
                    </div>

                    {/* Received Message */}
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm px-3 py-2 max-w-[70%]">
                        <p className="text-white text-[10px]">Wah keren! UI-nya bagus ya 😍</p>
                        <p className="text-[8px] text-white/50 mt-0.5">10:31</p>
                      </div>
                    </div>

                    {/* Sent Message */}
                    <div className="flex justify-end">
                      <div className="bg-[#2563EB] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[70%]">
                        <p className="text-white text-[10px]">Iya! Cepat lagi 💬</p>
                        <p className="text-[8px] text-white/70 mt-0.5">10:32</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="absolute bottom-5 left-0 right-0 px-5">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 flex items-center space-x-2">
                      <div className="flex-1 text-[9px] text-white/50">Ketik pesan...</div>
                      <div className="w-6 h-6 bg-[#2563EB] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="hidden lg:block absolute -right-6 top-16 bg-white rounded-xl shadow-2xl p-3 max-w-[180px] animate-float">
                <p className="text-xs font-semibold text-[#1E293B] mb-0.5">Ngobrol Tanpa Batas</p>
                <p className="text-[10px] text-[#64748B]">Cepat, Aman, & Mudah</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Hero;
