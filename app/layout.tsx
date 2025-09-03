import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getAuthCookie } from '@/lib/auth-cookies';
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Awaken Chatbot',
  description: 'A modern chatbot that can be embedded as an iframe',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
