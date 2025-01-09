'use client';

import React from 'react';
import { NavButton } from '../NavButton';
import type { NavbarParam, NavButtonItem } from './types';

export function Navbar<T extends Record<string, NavButtonItem>>({ logo, options, selectedOption }: NavbarParam<T>) {
  return (
    <>
      <div className='hidden md:block fixed top-0 left-0 left w-[88px] bg-surface-container text-on-surface h-screen z-50 overflow-y-auto'>
        <div className='flex flex-col items-center justify-between py-6 h-screen'>
          <nav className='flex flex-col items-center justify-center gap-5'>
            {logo ? logo : <></>}
            {Object.entries(options ?? {})
              .filter(([key, item]) => item.filter)
              .map(([key, item]) => (
                <NavButton
                  key={key}
                  title={item.title}
                  icon={item.icon}
                  selected={selectedOption === key}
                  onClick={() => item.onClick?.()}
                />
              ))}
          </nav>
        </div>
      </div>
    </>
  );
}
