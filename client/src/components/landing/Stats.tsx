const Stats = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 leading-tight">
            Siap Mengubah Cara Komunikasi Anda?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan tim yang sudah menggunakan Chatly untuk tetap terhubung dan produktif.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/40 text-sm">
            MULAI GRATIS
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-16">
          <p className="text-center text-sm text-slate-500 mb-6">Dipercaya oleh perusahaan terkemuka di seluruh dunia</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12 opacity-70">
            <div className="text-2xl font-bold text-slate-400">TechCorp</div>
            <div className="text-2xl font-bold text-slate-400">StartupHub</div>
            <div className="text-2xl font-bold text-slate-400">InnovateLab</div>
            <div className="text-2xl font-bold text-slate-400">DigitalWave</div>
            <div className="text-2xl font-bold text-slate-400">NextGen</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
