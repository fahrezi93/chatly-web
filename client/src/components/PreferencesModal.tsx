import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(() => 
    (localStorage.getItem('preferences_theme') as 'light' | 'dark' | 'auto') || 'light'
  );
  const [fontSize, setFontSize] = useState(() => 
    localStorage.getItem('preferences_fontSize') || 'medium'
  );
  const [enterToSend, setEnterToSend] = useState(() => 
    localStorage.getItem('preferences_enterToSend') !== 'false'
  );
  const [autoDownload, setAutoDownload] = useState(() => 
    localStorage.getItem('preferences_autoDownload') === 'true'
  );
  const [emojiPicker, setEmojiPicker] = useState(() => 
    localStorage.getItem('preferences_emojiPicker') !== 'false'
  );
  const [compactMode, setCompactMode] = useState(() => 
    localStorage.getItem('preferences_compactMode') === 'true'
  );

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('preferences_theme', theme);
    localStorage.setItem('preferences_fontSize', fontSize);
    localStorage.setItem('preferences_enterToSend', String(enterToSend));
    localStorage.setItem('preferences_autoDownload', String(autoDownload));
    localStorage.setItem('preferences_emojiPicker', String(emojiPicker));
    localStorage.setItem('preferences_compactMode', String(compactMode));
  }, [theme, fontSize, enterToSend, autoDownload, emojiPicker, compactMode]);

  const handleSavePreferences = () => {
    // Preferences are already saved via useEffect
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Preferences</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] space-y-6">
          {/* Appearance */}
          <div>
            <h3 className="text-lg font-bold text-[#1E293B] mb-4">Tampilan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-3">
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-[#2563EB] bg-[#2563EB]/5'
                        : 'border-[#64748B]/20 hover:border-[#64748B]/40'
                    }`}
                  >
                    <div className="w-full h-12 bg-white rounded border border-[#64748B]/20 mb-2"></div>
                    <p className="text-sm font-medium text-[#1E293B]">Terang</p>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-[#2563EB] bg-[#2563EB]/5'
                        : 'border-[#64748B]/20 hover:border-[#64748B]/40'
                    }`}
                  >
                    <div className="w-full h-12 bg-[#1E293B] rounded mb-2"></div>
                    <p className="text-sm font-medium text-[#1E293B]">Gelap</p>
                  </button>
                  <button
                    onClick={() => setTheme('auto')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'auto'
                        ? 'border-[#2563EB] bg-[#2563EB]/5'
                        : 'border-[#64748B]/20 hover:border-[#64748B]/40'
                    }`}
                  >
                    <div className="w-full h-12 bg-gradient-to-r from-white to-[#1E293B] rounded mb-2"></div>
                    <p className="text-sm font-medium text-[#1E293B]">Otomatis</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-3">
                  Ukuran Font
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFontSize('small')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      fontSize === 'small'
                        ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]'
                        : 'border-[#64748B]/20 text-[#64748B] hover:border-[#64748B]/40'
                    }`}
                  >
                    <p className="text-xs font-medium">Kecil</p>
                  </button>
                  <button
                    onClick={() => setFontSize('medium')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      fontSize === 'medium'
                        ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]'
                        : 'border-[#64748B]/20 text-[#64748B] hover:border-[#64748B]/40'
                    }`}
                  >
                    <p className="text-sm font-medium">Sedang</p>
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      fontSize === 'large'
                        ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]'
                        : 'border-[#64748B]/20 text-[#64748B] hover:border-[#64748B]/40'
                    }`}
                  >
                    <p className="text-base font-medium">Besar</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="border-t border-[#64748B]/10 pt-6">
            <h3 className="text-lg font-bold text-[#1E293B] mb-4">Bahasa</h3>
            <div>
              <label className="block text-sm font-medium text-[#64748B] mb-2">
                Bahasa Aplikasi
              </label>
              <div className="w-full px-4 py-2 border border-[#64748B]/20 rounded-lg bg-neutral-50 text-neutral-700">
                Bahasa Indonesia
              </div>
              <p className="text-xs text-[#64748B] mt-1">Hanya tersedia dalam Bahasa Indonesia</p>
            </div>
          </div>

          {/* Chat Preferences */}
          <div className="border-t border-[#64748B]/10 pt-6">
            <h3 className="text-lg font-bold text-[#1E293B] mb-4">Preferensi Chat</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[#64748B]/10">
                <div>
                  <p className="font-medium text-[#1E293B]">Enter untuk Kirim</p>
                  <p className="text-sm text-[#64748B]">Tekan Enter untuk mengirim pesan</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={enterToSend}
                    onChange={(e) => setEnterToSend(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[#64748B]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#64748B]/10">
                <div>
                  <p className="font-medium text-[#1E293B]">Auto-download Media</p>
                  <p className="text-sm text-[#64748B]">Download gambar dan video otomatis</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={autoDownload}
                    onChange={(e) => setAutoDownload(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[#64748B]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#64748B]/10">
                <div>
                  <p className="font-medium text-[#1E293B]">Emoji Picker</p>
                  <p className="text-sm text-[#64748B]">Tampilkan emoji picker di input</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={emojiPicker}
                    onChange={(e) => setEmojiPicker(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[#64748B]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[#1E293B]">Compact Mode</p>
                  <p className="text-sm text-[#64748B]">Tampilan chat lebih padat</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[#64748B]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="border-t border-[#64748B]/10 pt-6">
            <h3 className="text-lg font-bold text-[#1E293B] mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#64748B]">Cari pesan</span>
                <kbd className="px-3 py-1 bg-[#F8FAFC] border border-[#64748B]/20 rounded text-xs font-mono text-[#1E293B]">
                  Ctrl + F
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#64748B]">Buat grup baru</span>
                <kbd className="px-3 py-1 bg-[#F8FAFC] border border-[#64748B]/20 rounded text-xs font-mono text-[#1E293B]">
                  Ctrl + N
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#64748B]">Buka pengaturan</span>
                <kbd className="px-3 py-1 bg-[#F8FAFC] border border-[#64748B]/20 rounded text-xs font-mono text-[#1E293B]">
                  Ctrl + ,
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#64748B]">Emoji picker</span>
                <kbd className="px-3 py-1 bg-[#F8FAFC] border border-[#64748B]/20 rounded text-xs font-mono text-[#1E293B]">
                  Ctrl + E
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#64748B]/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-[#64748B]/20 text-[#64748B] rounded-lg font-semibold hover:bg-[#64748B]/5 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleSavePreferences}
            className="px-6 py-2 bg-[#2563EB] hover:bg-[#3B82F6] text-white rounded-lg font-semibold transition-colors"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal;
