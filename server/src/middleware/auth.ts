import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }

  next();
}; 