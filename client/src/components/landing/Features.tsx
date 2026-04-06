import { MessageSquare, Video, Shield, Users } from 'lucide-react';

const Features = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-slate-50 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-16 lg:mb-24 max-w-2xl">
          <h2 className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-4">Fitur Utama</h2>
          <h3 className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.1] tracking-tight">
            Alat Komunikasi <br/> Kelas Dunia.
          </h3>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 auto-rows-[minmax(250px,auto)] lg:auto-rows-[300px]">
          
          {/* Card 1: Instant Messaging */}
          <div className="group relative md:col-span-2 bg-white rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between border-2 border-slate-100">
            {/* Giant Watermark Icon */}
            <div className="absolute -bottom-16 -right-16 text-blue-50 opacity-[0.4] group-hover:opacity-100 pointer-events-none transform -rotate-12 transition-all duration-700 group-hover:scale-110 group-hover:rotate-0">
              <MessageSquare size={380} strokeWidth={1} />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <MessageSquare size={32} strokeWidth={2.5} />
              </div>
              <div className="max-w-md">
                <h4 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">Pesan Instan <br className="hidden md:block"/> Real-time</h4>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Kirim pesan teks, suara, dan file secepat kilat. Alur komunikasi yang mengalir murni tanpa hambatan pemrosesan.
                </p>
              </div>
            </div>

            {/* Tiny UI Preview */}
            <div className="relative z-10 mt-12 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full animate-bounce">Typing...</div>
              <div className="bg-slate-100 text-slate-400 text-[10px] px-3 py-1 rounded-full">Delivered</div>
            </div>
          </div>

          {/* Card 2: Video Call (Taller) */}
          <div className="group relative md:col-span-1 md:row-span-2 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-600/40 hover:-translate-y-2 transition-all duration-500 flex flex-col border-2 border-white/10">
             {/* Giant Watermark Icon */}
             <div className="absolute -top-10 -right-10 text-white opacity-[0.1] pointer-events-none transform rotate-12 transition-all duration-700 group-hover:scale-125 group-hover:-rotate-12">
              <Video size={400} strokeWidth={1.5} />
            </div>

            <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center mb-auto border border-white/30 hidden md:flex group-hover:bg-white/30 group-hover:scale-110 transition-all duration-500">
              <Video size={32} strokeWidth={2.5} />
            </div>

            <div className="relative z-10 mt-auto pt-16 md:pt-0">
               <div className="flex items-center space-x-2 mb-4">
                 <span className="flex h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
                 <span className="text-xs font-bold text-white/70 uppercase tracking-widest">4K HD Available</span>
               </div>
               <h4 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">Kualitas<br/> Tanpa Batas</h4>
               <p className="text-blue-100 font-medium leading-relaxed">
                 Resolusi tinggi, stabilisasi koneksi, tanpa patah-patah. Bertatap muka dari jarak jauh layaknya dalam satu meja.
               </p>
            </div>
          </div>

          {/* Card 3: Security */}
          <div className="group relative md:col-span-1 bg-slate-950 rounded-[2.5rem] p-8 lg:p-10 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-end border-2 border-white/5">
             {/* Giant Watermark Icon */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 opacity-[0.05] pointer-events-none transition-all duration-700 group-hover:scale-150 group-hover:opacity-[0.08]">
               <Shield size={320} strokeWidth={1} />
             </div>

            <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">
               <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                 <Shield size={24} strokeWidth={2} />
               </div>
               <h4 className="text-2xl font-bold text-white mb-2 tracking-tight">Keamanan Penuh</h4>
               <p className="text-slate-400 text-sm font-medium leading-relaxed">
                 End-to-end encryption. Rahasia Anda tetap menjadi milik Anda selamanya.
               </p>
            </div>
          </div>

          {/* Card 4: Team Collaboration */}
          <div className="group relative md:col-span-1 bg-slate-100 rounded-[2.5rem] p-8 lg:p-10 overflow-hidden hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-end border-2 border-transparent hover:border-slate-200">
            {/* Giant Watermark Icon */}
            <div className="absolute -bottom-10 -right-4 text-blue-600 opacity-[0.05] group-hover:opacity-[0.1] pointer-events-none transition-all duration-700 group-hover:-translate-x-4">
               <Users size={250} strokeWidth={1.5} />
            </div>

            <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">
               <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-200 group-hover:border-blue-200 group-hover:text-blue-700 transition-colors duration-500">
                 <Users size={24} strokeWidth={2} />
               </div>
               <h4 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Kolaborasi Tim</h4>
               <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[90%]">
                 Ruang kerja yang tak membatasi kreativitas dan koordinasi tim Anda.
               </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;
