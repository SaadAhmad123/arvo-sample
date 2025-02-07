import React from 'react';

export type ContainerParam = {
  className?: string;
  children?: React.ReactNode | React.ReactNode[];
};

export const Container: React.FC<ContainerParam> = ({ className, children }) => (
  <div className={`max-w-[1760px] mx-auto p-2 ${className}`}>{children}</div>
);

export const ContentContainer: React.FC<ContainerParam> = ({ className, children }) => (
  <div className={`max-w-[1200px] mx-auto ${className}`}>{children}</div>
);

export const PaddedContentContainer: React.FC<ContainerParam> = ({ className, children }) => (
  <div className={`max-w-[1200px] mx-auto ${className} px-4 sm:px-8`} >{children}</div>
);


export const PrimaryContainer: React.FC<ContainerParam> = ({ className, children }) => (
  <div
    className={`bg-surface-container-low p-8 sm:p-14 rounded-3xl text-on-surface flex items-start justify-center flex-col ${className}`}
  >
    {children}
  </div>
);
