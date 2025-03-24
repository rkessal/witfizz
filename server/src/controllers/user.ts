import { Request, Response } from "express";
import camelcaseKeys from "camelcase-keys";
import pool from "../db/dbConfig";
import bcrypt from "bcrypt";

interface User {
  id: number;
  name: string;
  avatar: string;
  role: string;
  [key: string]: any;
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, avatar, role, lat, lng, total_experience FROM users'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, email, role, avatar } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3, avatar = $4 WHERE id = $5 RETURNING id, name, email, avatar, role, lat, lng, total_experience',
      [name, email, role, avatar, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const updateUserPassword = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { password } = req.body;

  try {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, name, email, avatar, role, lat, lng, total_experience',
      [hashedPassword, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

export const getUsersByProjectID = async (req: Request, res: Response) => {
  const { projectID } = req.params;
  try {
    const queryResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar, u.role, u.lat, u.lng, u.total_experience 
       FROM users u
       JOIN users_projects up ON u.id = up.user_id
       WHERE up.project_id = $1`,
      [projectID]
    );
    res.send(queryResult.rows.map((row: User) => camelcaseKeys(row)));
  } catch (error) {
    console.error('Error fetching users by project:', error);
    res.status(500).json({ error: 'Failed to fetch users by project' });
  }
};