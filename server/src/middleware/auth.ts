import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/dbConfig';

// Define the User interface that matches your database schema
interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
  avatar?: string;
  oauth_id?: string;
}

// Define the JWT payload interface
interface JwtPayload {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  oauth_id?: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;  // Use the User interface instead of JwtPayload
    }
  }
}

// Function to check if a token is blacklisted
async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'SELECT * FROM blacklisted_tokens WHERE token = $1',
      [token]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking blacklisted token:', error);
    return false;
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token has been invalidated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }

  next();
}; 