import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart",
      image: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=2563EB&color=fff&size=128&font-size=0.33",
      content: "Chatly berhasil memotong waktu koordinasi kami hingga 50%. Tampilannya yang sangat clean membuat tim kami langsung terbiasa tanpa masa adaptasi.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      image: "https://ui-avatars.com/api/?name=Michael+Chen&background=0F172A&color=fff&size=128&font-size=0.33",
      content: "Sebagai manajer produk, komunikasi real-time yang stabil adalah kunci. Platform ini benar-benar revolusioner, ringan namun sangat bertenaga.",
      rating: 5
    },
    {
      name: "Amanda Rodriguez",
      role: "Operations Director",
      image: "https://ui-avatars.com/api/?name=Amanda+Rodriguez&background=ede9fe&color=4c1d95&size=128&font-size=0.33",
      content: "Fitur video call-nya sejernih kristal, tak pernah putus. Dan sistem enkripsinya membuat kami merasa sangat aman saat bertukar dokumen rahasia.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="relative py-24 lg:py-32 bg-slate-950 text-white font-sans overflow-hidden">
      
      {/* Subtle modern background accent without using gradients directly on background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-900/10 blur-[150px] pointer-events-none rounded-full transform translate-x-1/2"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <div className="inline-flex items-center space-x-2 mb-6">
            <span className="h-px w-8 bg-blue-500"></span>
            <span className="text-sm font-bold text-blue-500 tracking-widest uppercase">Kepercayaan Klien</span>
            <span className="h-px w-8 bg-blue-500"></span>
          </div>
          <h2 className="text-[2.5rem] sm:text-[3rem] lg:text-[3.5rem] font-bold text-white leading-tight mb-6 tracking-tight">
            Dipercaya Oleh Ribuan <br className="hidden md:block" /> Tim Hebat.
          </h2>
          <p className="text-lg text-slate-400 font-medium">
            Jangan hanya percaya pada kata-kata kami. Dengarkan hasil nyata dari mereka yang telah bertransformasi menggunakan Chatly.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="group relative bg-[#0B0F19] p-8 lg:p-10 rounded-[2rem] border border-white/5 transition-all duration-500 hover:border-blue-500/30 hover:-translate-y-2 flex flex-col"
            >
              {/* Giant background quote icon */}
              <div className="absolute top-6 right-8 text-white/[0.02] group-hover:text-blue-500/10 transition-colors duration-500 z-0">
                <Quote size={120} fill="currentColor" strokeWidth={0} />
              </div>

              {/* Stars rating */}
              <div className="flex gap-1.5 mb-8 relative z-10">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-blue-500 text-blue-500" />
                ))}
              </div>

              {/* Quotes Content */}
              <p className="text-slate-300 text-[17px] leading-relaxed mb-10 relative z-10 flex-grow font-medium">
                "{testimonial.content}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 relative z-10 mt-auto pt-6 border-t border-white/5">
                <div className="relative">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full border-2 border-slate-800 object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 border-2 border-[#0B0F19] rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-[17px]">{testimonial.name}</h4>
                  <p className="text-[13px] text-slate-500 font-semibold">{testimonial.role}</p>
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
