import React from 'react';

export type IconFilledButtonParam = {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  width?: 'full' | number;
  type?: 'submit' | 'reset' | 'button';
};

export const IconFilledButton: React.FC<IconFilledButtonParam> = ({ title, icon, onClick, width, type = 'button' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={[
        'h-[48px] rounded-[24px] bg-primary text-on-primary pl-4 pr-6 flex items-center gap-2',
        width === 'full' && 'w-full justify-center',
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
