import React from 'react';

export type CardParam = {
  header?: React.ReactNode;
  hoverable?: boolean;
  children: React.ReactNode | React.ReactNode[];
  elevation?: 'lowest' | 'low' | 'normal' | 'high' | 'highest';
  shadow?: boolean;
};

export const Card: React.FC<CardParam> = ({ children, header, hoverable, elevation, shadow }) => {
  const styleMap: Record<NonNullable<CardParam['elevation']>, string> = {
    lowest: `bg-surface-container-lowest ${shadow ? 'shadow-elevation-1' : ''}`,
    low: `bg-surface-container-low ${shadow ? 'shadow-elevation-2' : ''}`,
    normal: `bg-surface-container ${shadow ? 'shadow-elevation-3' : ''}`,
    high: `bg-surface-container-high ${shadow ? 'shadow-elevation-4' : ''}`,
    highest: `bg-surface-container-highest ${shadow ? 'shadow-elevation-5' : ''}`,
  };
  return (
    <div
      className={`text-on-surface rounded-3xl transition-all duration-300 overflow-hidden ${hoverable ? 'hover:bg-secondary-container' : ''} ${styleMap[elevation ?? 'low']} `}
    >
      {header}
      <div className='p-6'>{children}</div>
    </div>
  );
};
