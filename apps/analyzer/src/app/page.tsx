import { Logo } from '@/components/Logo';
import { ThemePicker, Button } from '@repo/material-ui';
import { AArrowUp } from 'lucide-react';

export default function Home() {
  return (
    <>
      <pre className='font-sans bg-primary text-on-primary'>I am Saad</pre>
      <ThemePicker />
      <Logo size={36} />
      <Button title='Hello World' icon={<AArrowUp />} />
      <br />
      <Button title='Hello World' />
      <br />
      <div className='w-[300px]'>
        <Button title='Hello World My name is Saad Ahmad' icon={<AArrowUp />} cover='fill' />
      </div>
      <br />
      <div className='p-4 bg-surface-container-lowest'>
        <Button title='Hello World' variant='elevated' />
      </div>
      <br />
      <div className='p-4 bg-surface-container-lowest'>
        <Button title='Hello World' variant='elevated' icon={<AArrowUp />} />
      </div>
      <br />
      <Button title='Hello World' variant='tonal' />
      <br />
      <Button title='Hello World' variant='tonal' icon={<AArrowUp />} />
      <br />
      <Button title='Hello World' variant='outlined' />
      <br />
      <Button title='Hello World' variant='text' icon={<AArrowUp />} />
    </>
  );
}
