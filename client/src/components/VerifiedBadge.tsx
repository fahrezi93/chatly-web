import React from 'react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <svg 
      className={`${sizeClasses[size]} inline-block flex-shrink-0`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
      <path 
        d="M9 12l2 2 4-4" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default VerifiedBadge;
