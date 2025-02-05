'use client';

import { type NavButtonItem, Navbar } from '@repo/material-ui';
import { usePathname, useRouter } from 'next/navigation';
import { navigationOptions } from './navigationOptions';

export const NavbarLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <>
      <Navbar
        title={title}
        selectedOption={pathname}
        options={Object.fromEntries(
          navigationOptions.map((options) => [
            options.link,
            {
              filter: true,
              title: options.title,
              icon: options.icon,
              onClick: () => router.push(options.link),
            } as NavButtonItem,
          ]),
        )}
      />
      <div className='flex items-start justify-start'>
        <div className='hidden md:block w-[88px]' />
        <div className='flex-1'>{children}</div>
      </div>
    </>
  );
};
