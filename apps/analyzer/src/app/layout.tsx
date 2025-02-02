import type { Metadata } from 'next';
import { Roboto_Flex, Roboto_Serif } from 'next/font/google';
import './globals.css';
import { ThemePicker } from '@repo/material-ui';
import '@repo/material-ui/index.css';
import { NavbarLayout } from '@/components/NavbarLayout';

const robotoFlex = Roboto_Flex({
  variable: '--font-roboto-flex',
  subsets: ['latin'],
});

const robotoSerif = Roboto_Serif({
  variable: '--font-roboto-serif',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'System Analyzer',
  description: 'This application provides a UI to the system analysis for Icarus',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${robotoFlex.variable} ${robotoSerif.variable} antialiased font-sans bg-surface-container-lowest text-on-surface-container`}
      >
        <NavbarLayout title={metadata.title?.toString() ?? 'Application'}>{children}</NavbarLayout>
        <ThemePicker />
      </body>
    </html>
  );
}
