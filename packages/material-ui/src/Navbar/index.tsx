'use client';
import { IconButton } from '../IconButtons/IconButton';
import { NavButton } from '../NavButton';
import type { NavButtonItem, NavbarParam } from './types';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined';
import { useToggle } from '../hooks';
import { Sidebar } from '../Sidebar';
import { Separator } from '../Separator';
import { Spinner } from '../Spinner';
import { Button } from '../Button';

export function Navbar<T extends Record<string, NavButtonItem>>({
  logo,
  options,
  selectedOption,
  title,
}: NavbarParam<T>) {
  const [showSidebar, toggleSidebar] = useToggle(false);
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
      <div className='md:hidden items-center justify-between h-[56px]' />
      <div className='flex md:hidden items-center justify-between fixed top-0 h-[56px] w-screen bg-surface-container text-on-surface  px-4 z-50'>
        <div className='flex items-center gap-2'>
          <IconButton icon={<MenuOutlinedIcon />} onClick={toggleSidebar} />
          <h1 className='text-md font-medium'>{title}</h1>
        </div>
        <Sidebar show={showSidebar} onClickBackground={toggleSidebar}>
          <div className='flex items-center gap-2'>
            <IconButton icon={<MenuOpenOutlinedIcon />} onClick={toggleSidebar} />
            <p>{title}</p>
          </div>
          <Separator />
          <Separator />
          <div className='flex flex-col items-center w-full'>
            {Object.entries(
              options ?? {
                loading: {
                  filter: true,
                  title: 'Loading...',
                  icon: <Spinner size={24} />,
                },
              },
            )
              .filter(([key, item]) => item.filter)
              .map(([key, item]) => (
                <Button
                  key={key}
                  title={item.title}
                  icon={item.icon}
                  width={'full'}
                  justifyContent='start'
                  variant={selectedOption === key ? 'tonal' : 'text'}
                  onClick={() => {
                    item.onClick?.();
                    toggleSidebar();
                  }}
                />
              ))}
          </div>
        </Sidebar>
      </div>
    </>
  );
}
