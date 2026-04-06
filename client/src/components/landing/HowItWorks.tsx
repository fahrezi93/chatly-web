import { UserPlus, Users, MessageSquare, ArrowRight, ShieldCheck, Check } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      icon: <UserPlus size={28} strokeWidth={2} />,
      title: 'Daftar Gratis',
      description: 'Buat akun dalam hitungan detik. Cukup gunakan email untuk memulai.',
      preview: (
        <div className="mt-8 relative group-hover:scale-105 transition-transform duration-500">
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 shadow-sm border border-slate-200 flex items-center space-x-3 max-w-[200px]">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck size={16} />
            </div>
            <div className="flex-1">
              <div className="h-2 w-16 bg-slate-200 rounded-full mb-1.5"></div>
              <div className="h-2 w-24 bg-slate-100 rounded-full"></div>
            </div>
            <Check size={14} className="text-green-500" />
          </div>
        </div>
      )
    },
    {
      num: '02',
      icon: <Users size={28} strokeWidth={2} />,
      title: 'Undang Tim',
      description: 'Kirimkan tautan undangan eksklusif ke anggota tim dengan satu kali klik.',
      preview: (
        <div className="mt-8 relative h-10 w-full max-w-[200px]">
          {/* Avatar 1 */}
          <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center shadow-sm z-[40] absolute left-0 transition-all duration-500 ease-in-out">
            <Users size={16} className="text-slate-400 group-hover:text-blue-600" />
          </div>
          {/* Avatar 2 */}
          <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center shadow-sm z-[30] absolute left-2 group-hover:left-8 transition-all duration-500 ease-in-out">
            <Users size={16} className="text-slate-400 group-hover:text-blue-600" />
          </div>
          {/* Avatar 3 */}
          <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center shadow-sm z-[20] absolute left-4 group-hover:left-16 transition-all duration-500 ease-in-out">
            <Users size={16} className="text-slate-400 group-hover:text-blue-600" />
          </div>
          {/* Avatar 4 */}
          <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center shadow-sm z-[10] absolute left-6 group-hover:left-24 transition-all duration-500 ease-in-out">
            <Users size={16} className="text-slate-400 group-hover:text-blue-600" />
          </div>
          {/* Plus Button */}
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-blue-200 bg-blue-50 flex items-center justify-center text-blue-400 z-0 absolute left-8 group-hover:left-[120px] group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 ease-in-out">
            <span className="text-lg font-bold">+</span>
          </div>
        </div>
      )
    },
    {
      num: '03',
      icon: <MessageSquare size={28} strokeWidth={2} />,
      title: 'Mulai Ngobrol',
      description: 'Nikmati komunikasi tanpa batas, panggilan video jernih, dan kolaborasi.',
      preview: (
        <div className="mt-8 space-y-2 relative group-hover:translate-x-2 transition-transform duration-500">
          <div className="bg-blue-600 rounded-2xl rounded-tr-sm p-2.5 max-w-[140px] shadow-lg shadow-blue-600/20">
            <div className="h-1.5 w-16 bg-white/30 rounded-full mb-1"></div>
            <div className="h-1.5 w-10 bg-white/20 rounded-full"></div>
          </div>
          <div className="bg-white rounded-2xl rounded-tl-sm p-2.5 max-w-[120px] shadow-sm border border-slate-100 ml-4">
            <div className="h-1.5 w-12 bg-slate-200 rounded-full mb-1"></div>
            <div className="h-1.5 w-8 bg-slate-100 rounded-full"></div>
          </div>
        </div>
      )
    },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-slate-50 text-slate-900 font-sans relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100/30 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-indigo-100/30 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20 lg:mb-28">
          <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-4">Sangat Sederhana</h2>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Langkah Mudah Bergabung <br className="hidden sm:block" /> Dengan Chatly.
          </h3>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Kami merancang alur kerja yang intuitif agar Anda bisa fokus pada hal terpenting: berkomunikasi dengan lancar.
          </p>
        </div>

        {/* Steps Path Grid */}
        <div className="grid md:grid-cols-3 gap-12 lg:gap-20 relative">
          
          {/* Glowing Rail - Desktop */}
          <div className="hidden md:block absolute top-[48px] left-[15%] w-[70%] h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-transparent z-0 opacity-40"></div>

          {steps.map((step, index) => (
            <div 
              key={index} 
              className="group relative flex flex-col items-center sm:items-start text-center sm:text-left z-10"
            >
              {/* Floating Number Anchor */}
              <div className="mb-8 relative">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-900/5 group-hover:shadow-blue-500/10 border border-slate-100 group-hover:-translate-y-2 transition-all duration-500 relative z-10">
                  <div className="text-blue-600 group-hover:scale-110 transition-transform duration-500">
                    {step.icon}
                  </div>
                </div>
                
                {/* Index Bubble */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white text-[11px] font-black rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all duration-500 border-2 border-white z-20">
                  {step.num}
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                  {step.title}
                </h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 group-hover:text-slate-700">
                  {step.description}
                </p>
                
                {/* Visual Preview Fragment */}
                <div className="pt-2 opacity-[0.8] group-hover:opacity-100 transition-all duration-300">
                  {step.preview}
                </div>
              </div>

              {/* Mobile Connector */}
              {index < 2 && (
                <div className="md:hidden w-px h-12 bg-gradient-to-b from-blue-300 to-transparent my-6"></div>
              )}
            </div>
          ))}
        </div>

        {/* Action Call */}
        <div className="mt-24 text-center">
          <div className="inline-block p-1 bg-white rounded-full shadow-xl shadow-blue-600/5 border border-slate-100 group">
            <button className="flex items-center gap-4 bg-slate-900 group-hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold transition-all duration-500 shadow-lg transform active:scale-95">
              <span>Mulai Petualangan Anda</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
            </button>
          </div>
          <p className="mt-6 text-slate-400 text-sm font-medium">Bebas biaya pendaftaran. Mulai dalam 30 detik.</p>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;

