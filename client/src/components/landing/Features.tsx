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
          
          {/* Card 1: Instant Messaging (col-span-1 to col-span-2) */}
          <div className="relative md:col-span-2 bg-white rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between border-2 border-slate-100">
            {/* Giant Watermark Icon */}
            <div className="absolute -bottom-16 -right-16 text-slate-50 opacity-80 pointer-events-none transform -rotate-12 transition-transform duration-700 group-hover:scale-110">
              <MessageSquare size={380} strokeWidth={1} />
            </div>
            
            <div className="relative z-10 w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
              <MessageSquare size={32} strokeWidth={2} />
            </div>
            <div className="relative z-10 max-w-md mt-auto">
              <h4 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">Pesan Instan <br className="hidden md:block"/> Tanpa Batas</h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                Kirim pesan teks, suara, dan file dengan kecepatan kilat. Alur komunikasi yang mengalir murni tanpa hambatan pemrosesan.
              </p>
            </div>
          </div>

          {/* Card 2: Video Call (row-span-2, Tall) */}
          <div className="relative md:col-span-1 md:row-span-2 bg-blue-600 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-600/30 hover:-translate-y-1 transition-all duration-500 flex flex-col border-2 border-transparent">
             {/* Giant Watermark Icon */}
             <div className="absolute -top-10 -right-10 text-white opacity-[0.07] pointer-events-none transform rotate-12 transition-transform duration-700 group-hover:rotate-45">
              <Video size={400} strokeWidth={1.5} />
            </div>

            <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center mb-auto border border-white/30 hidden md:flex">
              <Video size={32} strokeWidth={2} />
            </div>

            <div className="relative z-10 mt-auto pt-16 md:pt-0">
               <h4 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">Video Call<br/> Kristal</h4>
               <p className="text-blue-100 font-medium leading-relaxed">
                 Resolusi tinggi, stabilisasi koneksi, tanpa patah-patah. Bertatap muka dari jarak ribuan kilometer layaknya dalam satu meja konferensi.
               </p>
            </div>
          </div>

          {/* Card 3: Keamanan (col-span-1) */}
          <div className="relative md:col-span-1 bg-slate-950 rounded-[2.5rem] p-8 lg:p-10 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-end border-2 border-[#0B0F19]">
             {/* Giant Watermark Icon */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-[0.03] pointer-events-none transition-transform duration-700 group-hover:scale-125">
               <Shield size={300} strokeWidth={1.5} />
             </div>

            <div className="relative z-10">
               <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/5">
                 <Shield size={24} strokeWidth={1.5} />
               </div>
               <h4 className="text-2xl font-bold text-white mb-2 tracking-tight">Keamanan Penuh</h4>
               <p className="text-slate-400 text-sm font-medium leading-relaxed">
                 Enkripsi murni. Tak ada siapa pun yang tahu apa yang Anda diskusikan.
               </p>
            </div>
          </div>

          {/* Card 4: Kolaborasi Grup (col-span-1) */}
          <div className="relative md:col-span-1 bg-slate-200/50 rounded-[2.5rem] p-8 lg:p-10 overflow-hidden hover:bg-slate-200 transition-all duration-500 flex flex-col justify-end border-2 border-transparent">
            {/* Giant Watermark Icon */}
            <div className="absolute -bottom-10 -right-4 text-slate-300 opacity-50 pointer-events-none transition-transform duration-700 hover:rotate-12">
               <Users size={200} strokeWidth={1.5} />
            </div>

            <div className="relative z-10">
               <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                 <Users size={24} strokeWidth={1.5} />
               </div>
               <h4 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Kolaborasi Tim</h4>
               <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[90%]">
                 Ruang kerja yang tak membatasi jumlah percabangan ide Anda.
               </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;
