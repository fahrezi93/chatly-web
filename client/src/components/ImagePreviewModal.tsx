import React, { useEffect } from 'react';

interface ImagePreviewModalProps {
  imageUrl: string;
  fileName?: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, fileName, onClose }) => {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
        aria-label="Close preview"
      >
        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Download button */}
      <a
        href={imageUrl}
        download={fileName}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-16 md:top-6 md:right-20 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
        onClick={(e) => e.stopPropagation()}
        aria-label="Download image"
      >
        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </a>

      {/* Image container */}
      <div 
        className="relative max-w-[95vw] max-h-[95vh] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={fileName || 'Preview'}
          className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
        />
        
        {/* File name */}
        {fileName && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white px-4 py-3 rounded-b-lg">
            <p className="text-sm md:text-base text-center truncate">{fileName}</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm">
        <p>Click outside or press ESC to close</p>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
