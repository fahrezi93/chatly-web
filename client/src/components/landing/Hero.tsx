import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#7C3AED] overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1E293B]/20 to-[#1E293B]/40"></div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo-chatly-putih.png" alt="Chatly Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-white">
              Chatly
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-white/90 hover:text-white transition-colors text-sm font-medium">
              TENTANG
            </a>
            <a href="#pricing" className="text-white/90 hover:text-white transition-colors text-sm font-medium">
              HARGA
            </a>
            <a href="#demo" className="text-white/90 hover:text-white transition-colors text-sm font-medium">
              DEMO
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-white/90 hover:text-white transition-colors font-medium text-sm"
            >
              Masuk
            </Link>
            <Link 
              to="/login" 
              className="bg-white text-[#2563EB] px-5 py-2 rounded-full font-semibold hover:bg-white/90 transition-all duration-200 text-sm"
            >
              COBA SEKARANG
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-white">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-wider opacity-90 uppercase">
                Tetap Terhubung Kapan Saja, Di Mana Saja
              </p>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Ngobrol Tanpa Batas
              </h1>
            </div>

            <p className="text-base lg:text-lg text-white/80 leading-relaxed max-w-lg">
              Chatly membuat obrolan, panggilan, dan pertemuan lebih lancar dari sebelumnya. Rasakan komunikasi modern yang cepat dengan sentuhan personal — semua dalam satu tempat.
            </p>

            <div className="flex items-center space-x-4 pt-2">
              <Link 
                to="/login"
                className="inline-flex items-center justify-center space-x-2 bg-white text-[#2563EB] px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg text-sm"
              >
                <span>COBA SEKARANG</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-3 pt-4">
              <div className="flex -space-x-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold">+</span>
                </div>
              </div>
              <div className="ml-2">
                <p className="text-xl font-bold">99.1%</p>
                <p className="text-xs text-white/70 max-w-sm">Rekam jejak terbukti dalam kepuasan klien dan kesuksesan berkelanjutan di seluruh dunia.</p>
              </div>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="relative flex items-center justify-center">
            <div className="relative">
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
              <div className="absolute -right-6 top-16 bg-white rounded-xl shadow-2xl p-3 max-w-[180px] animate-float">
                <p className="text-xs font-semibold text-[#1E293B] mb-0.5">Ngobrol Tanpa Batas</p>
                <p className="text-[10px] text-[#64748B]">Cepat, Aman, & Mudah</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
