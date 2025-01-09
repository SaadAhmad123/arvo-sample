import React from 'react';

export type NavButtonParam = {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
};

export const NavButton: React.FC<NavButtonParam> = ({ title, icon, onClick, selected }) => {
  return (
    <button type='button' className='group size-[56px] flex flex-col items-center justify-center' onClick={onClick}>
      <span
        className={`flex items-center justify-center w-[56px] h-[32px] group-hover:bg-surface-variant rounded-[16px] transition-all duration-400 ${selected ? 'bg-secondary-container' : ''} mb-[4px] text-on-surface`}
      >
        {icon}
      </span>
      <span className='text-[12px] text-red text-on-surface font-medium'>{title}</span>
    </button>
  );
};
