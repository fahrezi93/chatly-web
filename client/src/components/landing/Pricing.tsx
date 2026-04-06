import React from 'react';
import { Check, Zap, Shield, Globe } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Standard',
      price: '0',
      description: 'Cocok untuk pengguna personal yang baru memulai.',
      features: [
        'Hingga 500 anggota grup',
        'Penyimpanan cloud 5GB',
        'Enkripsi End-to-End',
        'Panggilan suara grup',
        'Support komunitas'
      ],
      cta: 'Mulai Sekarang',
      highlighted: false,
      icon: <Shield className="text-blue-500" size={24} />
    },
    {
      name: 'Pro',
      price: '49',
      description: 'Solusi terbaik untuk tim kecil yang sedang berkembang.',
      features: [
        'Tanpa batas anggota grup',
        'Penyimpanan cloud 50GB',
        'Panggilan video HD grup',
        'Manajemen admin lanjutan',
        'Prioritas email support',
        'Riwayat pesan tak terbatas'
      ],
      cta: 'Coba Gratis 14 Hari',
      highlighted: true,
      icon: <Zap className="text-blue-500" size={24} />
    },
    {
      name: 'Business',
      price: '99',
      description: 'Performa maksimal untuk perusahaan skala besar.',
      features: [
        'Penyimpanan cloud tak terbatas',
        'Keamanan tingkat enterprise',
        'Integrasi API kustom',
        'Account manager khusus',
        'SLA 99.9%',
        'Analistik tim mendalam'
      ],
      cta: 'Hubungi Kami',
      highlighted: false,
      icon: <Globe className="text-blue-500" size={24} />
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Pilih Paket yang <span className="text-blue-600">Sesuai</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Mulai gratis dan tingkatkan paket Anda seiring berkembangnya kebutuhan tim Anda. Tanpa biaya tersembunyi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 flex flex-col group ${
                plan.highlighted 
                  ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 scale-105 z-10' 
                  : 'bg-white border border-slate-200 text-slate-900 shadow-xl shadow-slate-100'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">
                  Paling Populer
                </div>
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                  plan.highlighted ? 'bg-white/20' : 'bg-blue-50'
                }`}>
                  {React.cloneElement(plan.icon as React.ReactElement, { 
                    className: plan.highlighted ? 'text-white' : 'text-blue-600' 
                  })}
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-blue-100' : 'text-slate-500'}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">IDR {plan.price}k</span>
                  <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-slate-500'}`}>/bulan</span>
                </div>
              </div>

              <div className="flex-grow space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.highlighted ? 'bg-white/20' : 'bg-blue-50'
                    }`}>
                      <Check size={12} className={plan.highlighted ? 'text-white' : 'text-blue-600'} />
                    </div>
                    <span className={`text-sm ${plan.highlighted ? 'text-white' : 'text-slate-700 font-medium'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 transform active:scale-95 shadow-lg ${
                plan.highlighted 
                  ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-blue-500/20' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
