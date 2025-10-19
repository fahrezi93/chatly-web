import React, { useState } from 'react';

interface FilePreviewModalProps {
  file: File;
  onSend: (caption: string) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onSend, onCancel, isUploading = false }) => {
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Generate preview URL for images
  React.useEffect(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Get file icon based on type
  const getFileIcon = () => {
    if (file.type.includes('pdf')) {
      return (
        <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/>
          <text x="10" y="14" fontSize="6" textAnchor="middle" fill="currentColor">PDF</text>
        </svg>
      );
    }
    if (file.type.includes('document') || file.type.includes('msword')) {
      return (
        <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/>
          <text x="10" y="14" fontSize="5" textAnchor="middle" fill="currentColor">DOC</text>
        </svg>
      );
    }
    return (
      <svg className="w-16 h-16 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSend = () => {
    onSend(caption);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-primary-500 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preview File</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center mb-6">
            {/* Image Preview */}
            {file.type.startsWith('image/') ? (
              <img
                src={previewUrl}
                alt={file.name}
                className="max-w-full max-h-[400px] object-contain rounded-lg shadow-md"
              />
            ) : (
              /* File Icon Preview */
              <div className="flex flex-col items-center gap-4 p-8 bg-neutral-50 rounded-lg">
                {getFileIcon()}
                <div className="text-center">
                  <p className="font-medium text-neutral-900 mb-1 break-all">{file.name}</p>
                  <p className="text-sm text-neutral-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Caption Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Tambahkan Caption (Opsional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={file.type.startsWith('image/') ? "Tambahkan caption untuk foto..." : "Tambahkan deskripsi untuk file..."}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs text-neutral-500">
              <span>Tekan Enter untuk baris baru</span>
              <span>{caption.length}/500</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-neutral-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="px-6 py-2 text-neutral-700 hover:bg-neutral-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={handleSend}
            disabled={isUploading}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <span>Kirim</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
