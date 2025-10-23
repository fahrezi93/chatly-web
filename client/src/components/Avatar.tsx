import React from 'react';

interface AvatarProps {
  username: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar: React.FC<AvatarProps> = ({ username, isOnline = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-24 h-24 text-3xl'
  };

  const initial = username.charAt(0).toUpperCase();
  
  const colors = [
    'bg-gradient-to-br from-red-400 to-red-600',
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-emerald-400 to-emerald-600',
    'bg-gradient-to-br from-amber-400 to-amber-600',
    'bg-gradient-to-br from-purple-400 to-purple-600',
    'bg-gradient-to-br from-pink-400 to-pink-600',
    'bg-gradient-to-br from-indigo-400 to-indigo-600',
    'bg-gradient-to-br from-cyan-400 to-cyan-600'
  ];
  
  const colorIndex = username.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center font-semibold text-white shadow-soft`}>
        {initial}
      </div>
      {isOnline !== undefined && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 ${isOnline ? 'bg-accent-500' : 'bg-neutral-400'} border-2 border-white rounded-full`}></div>
      )}
    </div>
  );
};

export default Avatar;
