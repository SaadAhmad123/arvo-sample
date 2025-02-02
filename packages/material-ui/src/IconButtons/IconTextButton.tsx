import React from 'react';

export type IconTextButtonParam = {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  width?: 'full' | number;
  alignLeft?: boolean;
  type?: 'submit' | 'reset' | 'button';
};

export const IconTextButton: React.FC<IconTextButtonParam> = ({
  title,
  icon,
  onClick,
  selected,
  width,
  alignLeft,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={[
        'flex items-center gap-2',
        'h-[48px] rounded-[24px] hover:bg-surface-variant pl-4 pr-6 text-left',
        selected ? 'bg-secondary-container' : 'bg-transparent',
        width === 'full' && `w-full ${alignLeft ? 'justify-start' : 'justify-center'}`,
      ]
        .filter((item) => item)
        .join(' ')}
      style={{
        width: width !== 'full' ? width : undefined,
      }}
    >
      {icon}
      {title}
    </button>
  );
};

export default IconTextButton;
