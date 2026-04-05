import { UserPlus, Users, MessageSquare, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      icon: <UserPlus className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />,
      title: 'Daftar Gratis',
      description: 'Buat akun Anda dalam hitungan detik. Cukup gunakan email atau nomor telepon untuk memulai.',
    },
    {
      num: '02',
      icon: <Users className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />,
      title: 'Undang Tim',
      description: 'Kirimkan tautan undangan eksklusif ke anggota tim atau teman Anda dengan satu kali klik.',
    },
    {
      num: '03',
      icon: <MessageSquare className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />,
      title: 'Mulai Ngobrol',
      description: 'Nikmati komunikasi tanpa batas, panggilan video jernih, dan kolaborasi seketika.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-white text-slate-900 font-sans border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 lg:mb-24 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-3">Cara Kerja</h2>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Mulai Dalam <br /> 3 Langkah Mudah.
            </h3>
          </div>
          <p className="text-slate-500 text-lg max-w-md md:text-right">
            Kami membuang semua kerumitan. Proses on-boarding yang dirancang khusus untuk kecepatan dan kenyamanan Anda.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
          
          {/* Subtle connecting line for desktop */}
          <div className="hidden md:block absolute top-[4.5rem] left-[15%] w-[70%] h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-transparent z-0"></div>

          {steps.map((step, index) => (
            <div 
              key={index} 
              className="group relative flex flex-col p-8 lg:p-10 bg-slate-50 rounded-[2rem] hover:bg-slate-900 transition-all duration-500 overflow-hidden z-10 hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-slate-900/20"
            >
              {/* Giant Background Number */}
              <div className="absolute -top-6 -right-4 text-[8rem] font-black text-slate-200/50 group-hover:text-white/5 transition-colors duration-500 select-none z-0">
                {step.num}
              </div>
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Icon Container */}
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-blue-600 transition-colors duration-500">
                  {step.icon}
                </div>

                <div className="mt-auto">
                  <h4 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-4 transition-colors duration-300">
                    {step.title}
                  </h4>
                  <p className="text-slate-500 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Area */}
        <div className="mt-20 flex justify-center">
          <button className="group inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transform hover:-translate-y-1">
            <span>Mulai Sekarang — Gratis</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
