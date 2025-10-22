import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart",
      image: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=2563EB&color=fff&size=128",
      content: "Chatly mengubah cara tim kami berkomunikasi. Sekarang semua lebih cepat dan terorganisir!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      image: "https://ui-avatars.com/api/?name=Michael+Chen&background=3B82F6&color=fff&size=128",
      content: "Interface yang intuitif dan fitur yang lengkap. Sangat recommended untuk tim remote!",
      rating: 5
    },
    {
      name: "Amanda Rodriguez",
      role: "Marketing Director",
      image: "https://ui-avatars.com/api/?name=Amanda+Rodriguez&background=60A5FA&color=fff&size=128",
      content: "Kami sudah mencoba banyak platform, tapi Chatly adalah yang terbaik. Simple dan powerful!",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-blue-400">TESTIMONI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100 mb-4">
            Apa Kata Pengguna Kami
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Ribuan tim sudah mempercayai Chatly untuk komunikasi mereka
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-slate-800/50 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700/80 hover:scale-105 backdrop-blur-sm"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-bold text-slate-100">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
