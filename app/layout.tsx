import type { Metadata } from 'next';
import { Poppins, Space_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import Navbar from '@/components/navbar/Navbar';

//Fonts
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-spaceMono',
});
const paralucent = localFont({
  src: [
    {
      path: '../public/fonts/Paralucent-Light.otf',
      style: 'normal',
    },
  ],
  variable: '--font-paralucent',
});

export const metadata: Metadata = {
  title: 'effekt - supabase',
  description: 'Boilerplate code for supabase, db and auth',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${poppins.variable} ${paralucent.variable} ${spaceMono.variable} font-poppins bg-dark text-white font-light overflow-x-hidden`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
