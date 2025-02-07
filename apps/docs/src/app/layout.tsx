import type { Metadata } from 'next';
import { Roboto_Flex, Roboto_Serif } from 'next/font/google';
import './globals.css';
import { ThemePicker } from '@repo/material-ui';
import '@repo/material-ui/index.css';
import { NavbarLayout } from '@/components/NavbarLayout';

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  variable: '--font-roboto-flex',
  display: 'swap',
});

const robotoSerif = Roboto_Serif({
  subsets: ['latin'],
  variable: '--font-roboto-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Arvo',
  description: 'A modern event driven architecture',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${robotoFlex.variable} ${robotoSerif.variable} antialiased font-sans bg-surface-container-lowest text-on-surface`}
      >
        <NavbarLayout title={metadata.title?.toString() ?? 'Application'}>{children}</NavbarLayout>
        <ThemePicker defaultPreferences={{ color: '#968f76', mode: 'light' }} />
      </body>
    </html>
  );
}
