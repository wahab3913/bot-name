import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenEdge, JWTPayload } from '@/lib/jwt-edge';

// Verify JWT token (Edge Runtime compatible)
async function verifyToken(
  token: string | undefined
): Promise<JWTPayload | null> {
  try {
    if (!token) return null;
    return await verifyTokenEdge(token);
  } catch (error) {
    // Token verification failed
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies or Authorization header
  const cookieToken = request.cookies.get('awaken-tk')?.value;
  const headerToken = request.headers
    .get('authorization')
    ?.replace('Bearer ', '');
  const token = cookieToken || headerToken;

  const user = await verifyToken(token);

  // Define protected and public routes
  const protectedRoutes = ['/admin/dashboard'];
  const authRoutes = ['/', '/admin'];
  const protectedApiRoutes = ['/api/admin'];
  const publicApiRoutes = ['/api/admin/login']; // Public routes that don't need auth

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.includes(pathname);
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicApiRoute = publicApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Handle API routes
  if (isProtectedApiRoute && !isPublicApiRoute) {
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    // API route is authenticated, continue
    return NextResponse.next();
  }

  // Handle protected dashboard routes
  if (isProtectedRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // User is authenticated, allow access to dashboard

    return NextResponse.next();
  }

  // Handle auth routes (login page)
  if (isAuthRoute) {
    if (user) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    // User not authenticated, show login page

    return NextResponse.next();
  }

  // For all other routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match root route (login page)
    '/',
    // Match admin routes (both protected and auth routes)
    '/admin/:path*',
    // Match API routes that need protection
    '/api/admin/:path*',
  ],
};
