'use server';

import React from 'react';

interface IFAB {
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
  variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'default' | 'large';
}

export const FAB: React.FC<IFAB> = ({
  children = <></>,
  className = '',
  type = 'button',
  disabled = false,
  title = 'button',
  onClick = () => {},
  variant = 'primary',
  size = 'default',
}) => {
  // Base sizes according to MD3 specifications
  const sizeClasses = {
    small: 'w-12 h-12 text-base',
    default: 'w-14 h-14 text-lg',
    large: 'w-24 h-24 text-xl',
  };

  // Color variants according to MD3 specifications
  const variantClasses = {
    surface: 'bg-surface-container-high text-primary hover:bg-surface-container-highest',
    primary: 'bg-primary text-on-primary hover:bg-primary/90',
    secondary: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90',
    tertiary: 'bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/90',
  };

  // State layer opacities according to MD3
  const stateClasses = disabled
    ? 'opacity-38 cursor-not-allowed'
    : 'hover:shadow-elevation-4 active:shadow-elevation-2 active:scale-95 active:bg-secondary active:text-on-secondary';

  return (
    <button
      type={type}
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-2xl
        shadow-elevation-2
        flex items-center justify-center
        transition-all duration-100
        focus:outline-none
        focus-visible:ring-2 focus-visible:ring-primary/25
        ${stateClasses}
        ${className}
      `}
    >
      {children}
    </button>
  );
};
