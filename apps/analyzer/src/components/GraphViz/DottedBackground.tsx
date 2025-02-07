'use client';

import React, { forwardRef } from 'react';

type DottedBackgroundProps = {
  size?: number;
};

export const DottedBackground = forwardRef<SVGSVGElement, DottedBackgroundProps>(({ size = 20 }, ref) => {
  return (
    <svg ref={ref} className='absolute inset-0 w-full h-full -z-10' xmlns='http://www.w3.org/2000/svg'>
      <title>Dotted background</title>
      <pattern
        id='dotPattern'
        x='0'
        y='0'
        width={size}
        height={size}
        patternUnits='userSpaceOnUse'
        patternTransform='translate(0 0) scale(1)'
      >
        <circle cx='2' cy='2' r='1' className='fill-on-surface opacity-50' />
      </pattern>
      <rect width='100%' height='100%' fill='url(#dotPattern)' />
    </svg>
  );
});
