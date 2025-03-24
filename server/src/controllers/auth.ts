require('dotenv').config();
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db/dbConfig';

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

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
    });
  }
}

export { loginSuccess, loginFail, register };
