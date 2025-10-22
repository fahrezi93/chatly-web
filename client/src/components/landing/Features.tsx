import { MessageSquare, Video, Shield } from 'lucide-react';

const Features = () => {
  return (
    <section id="features" className="py-16 lg:py-20 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4">
            Bekerja Lebih Cerdas & Tetap
            <br />
            Terhubung Di Mana Pun Anda Berada.
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 items-start">
          {/* Feature 1 - Instant Messaging */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-[#3B82F6]" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Pesan Instan</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Ngobrol dengan tim Anda secara real-time. Atur percakapan dalam channel yang terorganisir.
              </p>
            </div>
          </div>

          {/* Feature 2 - Phone Mockup (Center) */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative w-[240px] h-[480px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2rem] p-2 shadow-2xl border-[3px] border-gray-700">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl z-10"></div>
                
                {/* Screen */}
                <div className="relative w-full h-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[1.7rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-4 pt-6 pb-2">
                    <span className="text-white text-[10px] font-semibold">9:41 AM</span>
                    <div className="flex items-center space-x-0.5">
                      <div className="w-2.5 h-2 bg-white/30 rounded-sm"></div>
                      <div className="w-2.5 h-2 bg-white/30 rounded-sm"></div>
                      <div className="w-2.5 h-2 bg-white rounded-sm"></div>
                    </div>
                  </div>

                  {/* Chat Header */}
                  <div className="px-4 pb-2 flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
                    <div>
                      <h3 className="text-white text-xs font-bold">Tim Kerja</h3>
                      <p className="text-[8px] text-white/60">5 anggota</p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="px-4 space-y-2 pb-14">
                    {/* Received Message */}
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl rounded-tl-sm px-2.5 py-1.5 max-w-[75%]">
                        <p className="text-white text-[9px]">Meeting jam 2 siang ya!</p>
                        <p className="text-[7px] text-white/50 mt-0.5">11:20</p>
                      </div>
                    </div>
                    
                    {/* Sent Message */}
                    <div className="flex justify-end">
                      <div className="bg-[#2563EB] rounded-xl rounded-tr-sm px-2.5 py-1.5 max-w-[75%]">
                        <p className="text-white text-[9px]">Siap! 👍</p>
                        <p className="text-[7px] text-white/70 mt-0.5">11:21</p>
                      </div>
                    </div>

                    {/* Received Message */}
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl rounded-tl-sm px-2.5 py-1.5 max-w-[75%]">
                        <p className="text-white text-[9px]">Jangan lupa bawa laptop</p>
                        <p className="text-[7px] text-white/50 mt-0.5">11:22</p>
                      </div>
                    </div>

                    {/* Sent Message */}
                    <div className="flex justify-end">
                      <div className="bg-[#2563EB] rounded-xl rounded-tr-sm px-2.5 py-1.5 max-w-[75%]">
                        <p className="text-white text-[9px]">Oke noted! 💻</p>
                        <p className="text-[7px] text-white/70 mt-0.5">11:22</p>
                      </div>
                    </div>

                    {/* Received Message */}
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl rounded-tl-sm px-2.5 py-1.5 max-w-[75%]">
                        <p className="text-white text-[9px]">Perfect! See you 🚀</p>
                        <p className="text-[7px] text-white/50 mt-0.5">11:23</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="absolute bottom-4 left-0 right-0 px-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg px-2.5 py-1.5 flex items-center space-x-1.5">
                      <div className="flex-1 text-[8px] text-white/50">Ketik pesan...</div>
                      <div className="w-5 h-5 bg-[#2563EB] rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 - Video & Audio Calls */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Video className="w-8 h-8 text-[#3B82F6]" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Video & Audio Call</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Bertemu tatap muka secara instan dengan kualitas jernih dan tanpa lag.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Features Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-11 h-11 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-5 h-5 text-[#2563EB]" />
            </div>
            <p className="text-xs text-white/80 font-medium">Pesan Instan</p>
          </div>
          <div className="text-center">
            <div className="w-11 h-11 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center mx-auto mb-2">
              <Video className="w-5 h-5 text-[#2563EB]" />
            </div>
            <p className="text-xs text-white/80 font-medium">Video & Audio Call</p>
          </div>
          <div className="text-center">
            <div className="w-11 h-11 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-5 h-5 text-[#2563EB]" />
            </div>
            <p className="text-xs text-white/80 font-medium">Berbagi & Kolaborasi</p>
          </div>
          <div className="text-center">
            <div className="w-11 h-11 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-5 h-5 text-[#2563EB]" />
            </div>
            <p className="text-xs text-white/80 font-medium">Notifikasi Cerdas</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
