import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { generateTokenEdge, verifyTokenEdge } from './jwt-edge';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Use Edge-compatible JWT generation
export const generateToken = async (userId) => {
  return await generateTokenEdge(userId);
};

// Keep the sync version for compatibility
export const generateTokenSync = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

// Use Edge-compatible JWT verification
export const verifyToken = async (token) => {
  try {
    return await verifyTokenEdge(token);
  } catch (error) {
    return null;
  }
};

// Keep the sync version for compatibility
export const verifyTokenSync = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const requireAuth = (handler) => {
  return async (request, ...args) => {
    // Try to get token from Authorization header (fallback)
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.replace('Bearer ', '');

    // Try to get token from HTTP-only cookie (primary method)
    const cookieToken = request.cookies.get('awaken-tk')?.value;

    // Use cookie token first, then header token as fallback
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Add userId to request object
    request.userId = decoded.userId;
    return handler(request, ...args);
  };
};
