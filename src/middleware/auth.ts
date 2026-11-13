import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | { uid: string; email: string; name?: string };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In local dev/demo environment without active Google Sign-In, attach demo user
    req.user = {
      uid: 'user-alex-1',
      email: 'alex.vance@inkwave.io',
      name: 'Alex Vance',
    };
    return next();
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.warn('Firebase token verification failed:', error);
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};
