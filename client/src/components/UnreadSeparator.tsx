import React from 'react';

const UnreadSeparator: React.FC = () => {
  return (
    <div className="flex items-center justify-center my-4 px-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
      <div className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
        Pesan Baru
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
    </div>
  );
};

export default UnreadSeparator;
