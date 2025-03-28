import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../db/dbConfig';

// Define types
interface JwtPayload {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  role: string;
  avatar?: string;
}

// Extend Express types
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name: string;
      password: string;
      role: string;
      avatar?: string;
    }
    interface Request {
      user?: User;
    }
  }
}

const router = express.Router();

// JWT secret key - should be in .env
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded as User;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Local authentication routes
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, hashedPassword, name, 'user']
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, {
      expiresIn: '48h'
    });

    res.json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Error registering user" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Get user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '48h' }
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Protected route example
router.get("/user", verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const result = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: "Error getting user" });
  }
});

// Logout route
router.post("/logout", verifyToken, (req: Request, res: Response) => {
  // Since we're using JWT, we don't need to do anything server-side
  // The client should remove the token
  res.json({ message: "Logged out successfully" });
});

export default router;
