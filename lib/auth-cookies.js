import { cookies } from 'next/headers';

// Set authentication cookie (server-side)
export function setAuthCookie(token) {
  const cookieStore = cookies();

  cookieStore.set('awaken-tk', token, {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  });
}

// Remove authentication cookie (server-side)
export function removeAuthCookie() {
  const cookieStore = cookies();

  cookieStore.set('awaken-tk', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });
}

// Get authentication cookie (server-side)
export function getAuthCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get('awaken-tk')?.value;

  return token;
}

// Note: Client-side cookie access is intentionally removed for security.
// All cookie operations are handled server-side via HTTP-only cookies.
