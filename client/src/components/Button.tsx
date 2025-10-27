import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-medium';
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white active:bg-primary-800',
    secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300',
    danger: 'bg-error hover:bg-red-600 text-white active:bg-red-700'
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
