import React from 'react';

export type SeparatorParam = {
  padding?: number;
  horizontal?: boolean;
};

export const Separator: React.FC<SeparatorParam> = ({ padding = 4, horizontal }) => {
  if (horizontal) {
    return <div style={{ display: 'inline-block', padding: `0 ${padding}px` }} />;
  }
  return <div style={{ display: 'block', padding: `${padding}px 0` }} />;
};
