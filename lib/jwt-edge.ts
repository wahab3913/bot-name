// Edge Runtime compatible JWT utilities
import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload as JoseJWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload extends JoseJWTPayload {
  userId: string;
  type?: string;
}

function isAppJWTPayload(payload: JoseJWTPayload): payload is JWTPayload {
  const maybeUserId = (payload as Record<string, unknown>)['userId'];
  return typeof maybeUserId === 'string';
}

// Generate JWT token (Edge Runtime compatible)
export async function generateTokenEdge(userId: string): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

// Verify JWT token (Edge Runtime compatible)
export async function verifyTokenEdge(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (isAppJWTPayload(payload)) {
      return payload;
    }
    return null;
  } catch (error) {
    return null;
  }
}
