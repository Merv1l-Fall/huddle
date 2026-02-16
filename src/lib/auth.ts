import { auth } from './firebase-admin';

export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7); // Remove Bearer
}

export async function verifyRequest(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new Error('No token provided');
  }
  return verifyIdToken(token);
}
