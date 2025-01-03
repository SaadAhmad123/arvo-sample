import type { Metadata } from 'next';
import { Roboto_Flex, Roboto_Serif } from 'next/font/google';
import './globals.css';

const robotoFlex = Roboto_Flex({
  variable: '--font-roboto-flex',
  subsets: ['latin'],
});

const robotoSerif = Roboto_Serif({
  variable: '--font-roboto-serif',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Icarus | System Analyzer',
  description: 'This application provides a UI to the system analysis for Icarus',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${robotoFlex.variable} ${robotoSerif.variable} antialiased font-sans bg-surface text-on-surface`}>{children}</body>
    </html>
  );
}
