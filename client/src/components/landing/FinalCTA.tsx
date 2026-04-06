import { ArrowRight, MessageSquare, Zap, Globe } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* The Main Gradient Card - Mirroring Hero Colors */}
        <div className="relative bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#3B82F6] rounded-[3rem] px-8 py-16 md:py-24 text-center shadow-2xl shadow-blue-500/20 overflow-hidden group">
          
          {/* Subtle Grid Pattern - Matching Hero Style */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>

          {/* Decorative Glowing Orbs */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 delay-150"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Trust Badge - Matching Hero Stats Style */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8 animate-bounce transition-all duration-1000">
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-5 h-5 rounded-full bg-slate-200 border border-blue-600"></div>
                ))}
              </div>
              <span className="text-white text-xs font-bold uppercase tracking-wider">99.1% Kepuasan Pengguna</span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Siap untuk Mulai <br className="hidden md:block" />
              Ngobrol Lebih <span className="text-blue-100 underline decoration-blue-300 underline-offset-8">Seru?</span>
            </h2>
            
            <p className="text-blue-50 text-base md:text-lg mb-10 opacity-90 max-w-xl mx-auto font-medium">
              Bergabunglah dengan ribuan orang yang telah merasakan sensasi obrolan ultra-cepat dan aman bersama Chatly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Primary Button - White (Matches Hero style) */}
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-slate-50 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group-btn">
                <span>Mulai Gratis</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              {/* Secondary Button - Outline */}
              <button className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300">
                Lihat Demo
              </button>
            </div>

            {/* Quick Feature Pill */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 opacity-60">
              <div className="flex items-center gap-2 text-white text-sm">
                <MessageSquare size={16} />
                <span>Modern UI</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Zap size={16} />
                <span>Ultra Cepat</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Globe size={16} />
                <span>Multi Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
