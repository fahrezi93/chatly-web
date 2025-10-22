const Stats = () => {
  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Simple CTA Section */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#1E293B] mb-4">
            Siap Mengubah Cara Komunikasi Anda?
          </h2>
          <p className="text-base lg:text-lg text-[#64748B] mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan tim yang sudah menggunakan Chatly untuk tetap terhubung dan produktif.
          </p>
          <button className="bg-[#2563EB] hover:bg-[#3B82F6] text-white px-7 py-3 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm">
            MULAI GRATIS
          </button>
        </div>
      </div>
    </section>
  );
};

export default Stats;
