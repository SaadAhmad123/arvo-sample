import React from 'react';

export type CardParam = {
  header?: React.ReactNode;
  hoverable?: boolean;
  children: React.ReactNode | React.ReactNode[];
};

export const Card: React.FC<CardParam> = ({ children, header, hoverable }) => {
  return (
    <div
      className={`bg-surface-container-low text-on-surface rounded-3xl transition-all duration-300 overflow-hidden ${hoverable ? 'hover:bg-secondary-container' : ''}`}
    >
      {header}
      <div className='p-6'>{children}</div>
    </div>
  );
};
