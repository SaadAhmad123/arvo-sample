import React from 'react';

export const iconButtonClassNames =
  'size-[48px] rounded-[24px] flex items-center justify-center hover:bg-surface-variant';

export type IconButtonParam = {
  tabIndex?: number;
  type?: 'submit' | 'reset' | 'button';
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
};

export const IconButton: React.FC<IconButtonParam> = ({
  type = 'button',
  icon,
  onClick,
  tabIndex,
  title,
  disabled,
}) => {
  return (
    <button
      disabled={disabled}
      tabIndex={tabIndex}
      type={type}
      onClick={onClick}
      className={iconButtonClassNames}
      title={title}
    >
      {icon}
    </button>
  );
};
