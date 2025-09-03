import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthCookie } from '@/lib/auth-cookies';
import AdminLayoutClient from './components/AdminLayoutClient';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  const token = getAuthCookie();

  // If no token found, redirect to login (this is a server-side redirect)
  if (!token) {
    redirect('/');
  }

  // If authenticated, render the client component
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
