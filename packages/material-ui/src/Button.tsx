import React from 'react';

export type ButtonVariant = 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text';

type ButtonParam = {
  title: string;
  type?: 'submit' | 'reset' | 'button';
  icon?: React.ReactNode;
  tooltip?: string;
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  width?: 'full' | number;
  justifyContent?: 'start' | 'center' | 'end';
  className?: string
};

export const Button: React.FC<ButtonParam> = (param) => {
  const baseStyle =
    'flex items-center px-6 py-2.5 min-h-[48px] gap-x-2 rounded-full font-medium tracking-[.00714em] text-normal transition-all duration-100 ';
  const variantStyles: Record<ButtonVariant, string> = {
    filled:
      'bg-primary text-on-primary shadow-none hover:shadow-elevation-2 active:bg-secondary active:text-on-secondary active:shadow-none',
    elevated:
      'bg-surface-container-low text-primary shadow-elevation-1 hover:bg-primary hover:text-on-primary hover:shadow-elevation-3 active:bg-secondary active:text-on-secondary',
    tonal:
      'bg-secondary-container text-on-secondary-container hover:shadow-elevation-1 hover:bg-surface-variant active:shadow-none',
    outlined: 'bg-transparent text-primary ring-1 ring-outline hover:bg-surface-container-high',
    text: 'bg-transparent text-primary hover:bg-surface-container-high',
  };
  const disabledStyle = param.disabled ? '' : '';

  return (
    <button
      disabled={param.disabled}
      className={`${baseStyle} ${variantStyles[param.variant ?? 'filled']} ${disabledStyle} ${param.className ?? ''}`}
      type={param.type ?? 'button'}
      onClick={param.onClick}
      title={param.tooltip ?? param.title}
      style={{
        ...(param.width ? { width: param.width === 'full' ? '100%' : `${param.width}px` } : {}),
        justifyContent: param.justifyContent ?? 'center',
      }}
    >
      {param.icon ? <span className='block'>{param.icon}</span> : <></>}
      <span className='block text-left'>{param.title}</span>
    </button>
  );
};
