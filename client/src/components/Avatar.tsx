import React from 'react';

interface AvatarProps {
  username: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ username, isOnline = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl'
  };

  const initial = username.charAt(0).toUpperCase();
  
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];
  
  const colorIndex = username.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center font-bold text-white`}>
        {initial}
      </div>
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
      )}
    </div>
  );
};

export default Avatar;
