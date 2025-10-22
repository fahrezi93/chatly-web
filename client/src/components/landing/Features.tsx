import { MessageSquare, Video, Shield, Users } from 'lucide-react';

const Features = () => {
  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Bekerja Lebih Cerdas & Tetap Terhubung Di Mana Pun Anda Berada.
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 sm:gap-10 items-start">
          {/* Feature 1 - Instant Messaging */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Pesan Instan</h3>
              <p className="text-base text-slate-400 leading-relaxed px-4 sm:px-0">
                Ngobrol dengan tim Anda secara real-time. Atur percakapan dalam channel yang terorganisir.
              </p>
            </div>
          </div>

          {/* Feature 2 - Phone Mockup (Center) */}
          <div className="flex justify-center my-8 md:my-0">
            <div className="relative scale-90 sm:scale-100">
              <div className="relative w-[280px] h-[560px] bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-2.5 shadow-2xl border-[6px] border-gray-800">
                <div className="relative w-full h-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[2rem] overflow-hidden">
                  <div className="flex items-center justify-between px-6 pt-8 pb-3">
                    <span className="text-white text-xs font-semibold">9:41 AM</span>
                  </div>
                  <div className="px-5 pb-3 flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
                    <div>
                      <h3 className="text-white text-sm font-bold">Tim Kerja</h3>
                      <p className="text-[10px] text-white/60">5 anggota</p>
                    </div>
                  </div>
                  <div className="px-5 space-y-3 pb-20">
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-lg px-4 py-2 max-w-[75%]">
                        <p className="text-white text-sm">Meeting jam 2 siang ya!</p>
                        <p className="text-xs text-white/50 mt-1">11:20</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[#2563EB] rounded-2xl rounded-tr-lg px-4 py-2 max-w-[75%]">
                        <p className="text-white text-sm">Siap! 👍</p>
                        <p className="text-xs text-white/70 mt-1">11:21</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-lg px-4 py-2 max-w-[75%]">
                        <p className="text-white text-sm">Jangan lupa bawa laptop.</p>
                        <p className="text-xs text-white/50 mt-1">11:22</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[#2563EB] rounded-2xl rounded-tr-lg px-4 py-2 max-w-[75%]">
                        <p className="text-white text-sm">Oke, noted! 💻</p>
                        <p className="text-xs text-white/70 mt-1">11:22</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-5 left-0 right-0 px-5">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 flex items-center space-x-2">
                      <div className="flex-1 text-[9px] text-white/50">Ketik pesan...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 - Video & Audio Calls */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                <Video className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Video & Audio Call</h3>
              <p className="text-base text-slate-400 leading-relaxed px-4 sm:px-0">
                Bertemu tatap muka secara instan dengan kualitas jernih dan tanpa lag.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Features Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm text-slate-300 font-medium">Pesan Instan</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center mx-auto mb-3">
              <Video className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm text-slate-300 font-medium">Video & Audio Call</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm text-slate-300 font-medium">Berbagi & Kolaborasi</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm text-slate-300 font-medium">Notifikasi Cerdas</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
