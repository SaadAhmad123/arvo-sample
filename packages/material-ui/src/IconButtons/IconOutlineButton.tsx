import React from 'react';

export const iconOutlineButtonClassNames =
  'size-[48px] rounded-[24px] flex items-center justify-center border border-outline hover:bg-surface-variant';

export type IconOutlineButtonParam = {
  icon: React.ReactNode;
  onClick?: () => void;
  type?: 'submit' | 'reset' | 'button';
};

export const IconOutlineButton: React.FC<IconOutlineButtonParam> = ({ icon, onClick, type = 'button' }) => {
  return (
    <button type={type} onClick={onClick} className={iconOutlineButtonClassNames}>
      {icon}
    </button>
  );
};
