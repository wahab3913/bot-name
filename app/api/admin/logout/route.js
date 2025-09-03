import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth-cookies';

export async function POST(request) {
  try {
    // Remove the authentication cookie
    removeAuthCookie();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
