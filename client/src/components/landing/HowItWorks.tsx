import { UserPlus, Users, MessageSquare } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="w-8 h-8 text-blue-400" />,
      title: 'Daftar Gratis',
      description: 'Buat akun dalam hitungan detik dengan email atau nomor telepon Anda.',
    },
    {
      icon: <Users className="w-8 h-8 text-blue-400" />,
      title: 'Undang Tim',
      description: 'Tambahkan anggota tim atau teman untuk mulai berkomunikasi.',
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-blue-400" />,
      title: 'Mulai Ngobrol',
      description: 'Kirim pesan, panggilan video, dan berbagi file dengan mudah.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100/60 rounded-full mb-4">
            <span className="text-sm font-semibold text-blue-600">CARA KERJA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            Mulai dalam 3 Langkah Mudah
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Bergabung dengan Chatly sangat mudah dan cepat
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 transform -translate-y-1/2"></div>

          <div className="relative grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center p-6 bg-white border border-slate-200/80 rounded-2xl shadow-lg">
                {/* Step Number */}
                <div className="absolute -top-4 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 bg-blue-100/50 rounded-xl flex items-center justify-center mb-5 border border-blue-200/60">
                  {step.icon}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/40 text-sm">
            <span>Mulai Sekarang</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
