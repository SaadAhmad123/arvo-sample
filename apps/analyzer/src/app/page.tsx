'use client';

import { Logo } from '@/components/Logo';
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined';
import { Button, NavButton, Navbar, ThemePicker } from '@repo/material-ui';

export default function Home() {
  return (
    <>
      <Navbar
        options={{
          home: {
            title: 'Home',
            icon: <Logo size={20} />,
            filter: true,
          },
          about: {
            title: 'Home',
            icon: <MenuOpenOutlinedIcon />,
            filter: true,
          },
        }}
        selectedOption='home'
      />
      <pre className='font-sans bg-primary text-on-primary'>I am Saad</pre>
      <ThemePicker />
      <Logo size={36} />
      <Button title='Hello World' icon={<MenuOpenOutlinedIcon />} />
      <br />
      <Button title='Hello World' />
      <br />
      <div className='w-[300px]'>
        <Button title='Hello World My name is Saad Ahmad' icon={<MenuOpenOutlinedIcon />} cover='fill' />
      </div>
      <br />
      <div className='p-4 bg-surface-container-lowest'>
        <Button title='Hello World' variant='elevated' />
      </div>
      <br />
      <div className='p-4 bg-surface-container-lowest'>
        <Button title='Hello World' variant='elevated' icon={<MenuOpenOutlinedIcon />} />
      </div>
      <br />
      <Button title='Hello World' variant='tonal' />
      <br />
      <Button title='Hello World' variant='tonal' icon={<MenuOpenOutlinedIcon />} />
      <br />
      <Button title='Hello World' variant='outlined' />
      <br />
      <Button title='Hello World' variant='text' icon={<MenuOpenOutlinedIcon />} />
      <br />
      <NavButton title='Hello' icon={<MenuOpenOutlinedIcon />} />
    </>
  );
}
