import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username: string;
    email: string;
  };
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications'>('account');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Pengaturan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#64748B]/10">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'account'
                ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Akun
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'privacy'
                ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Privasi
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'notifications'
                ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Notifikasi
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-4">Informasi Akun</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Nama Pengguna
                    </label>
                    <input
                      type="text"
                      defaultValue={currentUser.username}
                      className="w-full px-4 py-2 border border-[#64748B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={currentUser.email}
                      className="w-full px-4 py-2 border border-[#64748B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                      disabled
                    />
                    <p className="text-xs text-[#64748B] mt-1">Email tidak dapat diubah</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#64748B]/10 pt-6">
                <h3 className="text-lg font-bold text-[#1E293B] mb-4">Ubah Kata Sandi</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Kata Sandi Lama
                    </label>
                    <input
                      type="password"
                      placeholder="Masukkan kata sandi lama"
                      className="w-full px-4 py-2 border border-[#64748B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      placeholder="Masukkan kata sandi baru"
                      className="w-full px-4 py-2 border border-[#64748B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      placeholder="Konfirmasi kata sandi baru"
                      className="w-full px-4 py-2 border border-[#64748B]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                    />
                  </div>
                  <button className="bg-[#2563EB] hover:bg-[#3B82F6] text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                    Ubah Kata Sandi
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-4">Pengaturan Privasi</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-[#64748B]/10">
                    <div>
                      <p className="font-medium text-[#1E293B]">Status Online</p>
                      <p className="text-sm text-[#64748B]">Tampilkan status online kepada kontak</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[#64748B]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-[#64748B]/10">
                    <div>
                      <p className="font-medium text-[#1E293B]">Terakhir Dilihat</p>
                      <p className="text-sm text-[#64748B]">Tampilkan waktu terakhir online</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[#64748B]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-[#64748B]/10">
                    <div>
                      <p className="font-medium text-[#1E293B]">Status Mengetik</p>
                      <p className="text-sm text-[#64748B]">Tampilkan indikator saat mengetik</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[#64748B]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-[#1E293B]">Tanda Baca Pesan</p>
                      <p className="text-sm text-[#64748B]">Kirim tanda baca pesan (✓✓)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[#64748B]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-4">Notifikasi</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-[#64748B]/10">
                    <div>
                      <p className="font-medium text-[#1E293B]">Notifikasi Desktop</p>
                      <p className="text-sm text-[#64748B]">Tampilkan notifikasi di desktop</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[#64748B]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-[#64748B]/10">
                    <div>
                      <p className="font-medium text-[#1E293B]">Suara Notifikasi</p>
                      <p className="text-sm text-[#64748B]">Putar suara saat menerima pesan</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[#64748B]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-[#64748B]/10">
                    <div>
                      <p className="font-medium text-[#1E293B]">Preview Pesan</p>
                      <p className="text-sm text-[#64748B]">Tampilkan preview pesan di notifikasi</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[#64748B]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-[#1E293B]">Notifikasi Grup</p>
                      <p className="text-sm text-[#64748B]">Terima notifikasi dari pesan grup</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[#64748B]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#64748B]/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-[#64748B]/20 text-[#64748B] rounded-lg font-semibold hover:bg-[#64748B]/5 transition-colors"
          >
            Batal
          </button>
          <button className="px-6 py-2 bg-[#2563EB] hover:bg-[#3B82F6] text-white rounded-lg font-semibold transition-colors">
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
