import React from 'react';

export type ButtonVariant = 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text';

type IconButtonParam = {
  type?: 'submit' | 'reset' | 'button';
  icon: React.ReactNode;
  tooltip?: string;
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
};

export const IconButton: React.FC<IconButtonParam> = (param) => {
  const baseStyle =
    'flex items-center justify-center size-[48px] gap-x-2 rounded-full font-medium tracking-[.00714em] text-normal transition-all duration-100 ';
  const variantStyles: Record<ButtonVariant, string> = {
    filled:
      'bg-primary text-on-primary shadow-none hover:shadow-elevation-2 active:bg-secondary active:text-on-secondary active:shadow-none',
    elevated:
      'bg-surface-container-low text-primary shadow-elevation-1 hover:bg-primary hover:text-on-primary hover:shadow-elevation-3 active:bg-secondary active:text-on-secondary',
    tonal:
      'bg-secondary-container text-on-secondary-container hover:shadow-elevation-1 hover:bg-surface-variant active:shadow-none',
    outlined: 'bg-transparent text-primary ring-1 ring-outline hover:bg-surface-container-high',
    text: 'bg-transparent text-on-surface hover:bg-surface-container-high',
  };
  const disabledStyle = param.disabled ? '' : '';

  return (
    <button
      disabled={param.disabled}
      className={`${baseStyle} ${variantStyles[param.variant ?? 'filled']} ${disabledStyle}`}
      type={param.type ?? 'button'}
      onClick={param.onClick}
      title={param.tooltip}
    >
      <span className='block'>{param.icon}</span>
    </button>
  );
};
