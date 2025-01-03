import { Logo } from '@/components/Logo';
import { ThemePicker } from '@/components/ThemePicker';
import { HelloWorld } from '@repo/material-ui';

export default function Home() {
  return (
    <>
      <pre className='font-sans bg-primary text-on-primary'>I am Saad</pre>
      <ThemePicker />
      <Logo size={36} />
      <HelloWorld />
    </>
  );
}