const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1E293B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 mb-8 sm:mb-10">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2.5 mb-3 sm:mb-4">
              <img src="/logo-chatly-putih.png" alt="Chatly Logo" className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-base sm:text-lg font-bold">
                Chatly
              </span>
            </div>
            <p className="text-white/60 text-xs leading-relaxed">
              Ngobrol Tanpa Batas - Platform komunikasi modern untuk tim dan individu.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-3 text-xs">PRODUK</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-white/60 hover:text-white transition-colors text-xs">Fitur</a></li>
              <li><a href="#pricing" className="text-white/60 hover:text-white transition-colors text-xs">Harga</a></li>
              <li><a href="#security" className="text-white/60 hover:text-white transition-colors text-xs">Keamanan</a></li>
              <li><a href="#updates" className="text-white/60 hover:text-white transition-colors text-xs">Pembaruan</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-3 text-xs">PERUSAHAAN</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-white/60 hover:text-white transition-colors text-xs">Tentang</a></li>
              <li><a href="#blog" className="text-white/60 hover:text-white transition-colors text-xs">Blog</a></li>
              <li><a href="#careers" className="text-white/60 hover:text-white transition-colors text-xs">Karir</a></li>
              <li><a href="#contact" className="text-white/60 hover:text-white transition-colors text-xs">Kontak</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-3 text-xs">LEGAL</h3>
            <ul className="space-y-2">
              <li><a href="#privacy" className="text-white/60 hover:text-white transition-colors text-xs">Privasi</a></li>
              <li><a href="#terms" className="text-white/60 hover:text-white transition-colors text-xs">Ketentuan</a></li>
              <li><a href="#cookies" className="text-white/60 hover:text-white transition-colors text-xs">Cookie</a></li>
              <li><a href="#gdpr" className="text-white/60 hover:text-white transition-colors text-xs">GDPR</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-4 sm:pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3">
            <p className="text-white/60 text-xs text-center md:text-left">
              © {currentYear} Chatly. Hak cipta dilindungi.
            </p>
            <div className="flex items-center space-x-4 sm:space-x-6 text-xs">
              <a href="#privacy" className="text-white/60 hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#terms" className="text-white/60 hover:text-white transition-colors">Ketentuan Layanan</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
