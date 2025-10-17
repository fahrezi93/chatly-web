import React from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Batal'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-16 h-16 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-16 h-16 rounded-full bg-yellow-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-700">
        {getIcon()}
        
        <h2 className="text-xl font-bold text-white text-center mb-2">
          {title}
        </h2>
        
        <p className="text-gray-300 text-center mb-6">
          {message}
        </p>
        
        <div className="flex gap-3 justify-center">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="secondary"
              className="px-6 py-2"
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={onConfirm}
            variant={type === 'error' ? 'danger' : 'primary'}
            className="px-6 py-2"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
