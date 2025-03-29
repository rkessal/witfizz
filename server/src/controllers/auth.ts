require('dotenv').config();
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/dbConfig';
import crypto from 'crypto';

function generateAccessToken(user: any) {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '48h' } 
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

async function saveRefreshToken(userId: number, token: string, expiresAt: Date) {
  try {
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw error;
  }
}

async function invalidateRefreshToken(token: string) {
  try {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE token = $1',
      [token]
    );
  } catch (error) {
    console.error('Error invalidating refresh token:', error);
    throw error;
  }
}

function loginSuccess(req: Request, res: Response) {
  if (req.user) {
    res.json({
      success: true,
      message: 'user has successfully authenticated',
      user: (req as any).user,
      cookies: req.cookies,
    });
  }
}

function loginFail(req: Request, res: Response) {
  res.status(401).json({
    success: false,
    message: 'user failed to authenticate.',
  });
}

async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save refresh token
    await saveRefreshToken(user.id, refreshToken, refreshTokenExpires);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
    });
  }
}

async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, avatar',
      [name, email, hashedPassword, role || 'student']
    );

    const token = generateAccessToken(result.rows[0]);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.rows[0],
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
    });
  }
}

async function githubCallback(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const token = generateAccessToken(user);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Error in GitHub callback:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=github_auth_failed`);
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

// Function to blacklist a token
async function blacklistToken(token: string, expiresAt: Date): Promise<void> {
  try {
    await pool.query(
      'INSERT INTO blacklisted_tokens (token, expires_at) VALUES ($1, $2)',
      [token, expiresAt]
    );
  } catch (error) {
    console.error('Error blacklisting token:', error);
  }
}

async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token required'
    });
  }

  try {
    // Find the refresh token in the database
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const refreshTokenData = result.rows[0];

    // Get user data
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [refreshTokenData.user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Invalidate old refresh token
    await invalidateRefreshToken(refreshToken);

    // Save new refresh token
    await saveRefreshToken(user.id, newRefreshToken, newRefreshTokenExpires);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing token'
    });
  }
}

async function logout(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // Decode the token to get its expiration time
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Blacklist the access token
    await blacklistToken(token, new Date(decoded.exp * 1000));

    // If refresh token is provided in the request body, invalidate it
    const { refreshToken } = req.body;
    if (refreshToken) {
      await invalidateRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
}

export { loginSuccess, loginFail, login, register, githubCallback, logout, refreshToken };
