import { Request, Response } from "express";
import pool from "../db/dbConfig";

interface Resource {
  id: number;
  label: string;
  link: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

const getAllResources = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM resources ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
};

const createResource = async (req: Request, res: Response) => {
  const { label, link } = req.body;
  const userId = (req.user as any).id;

  try {
    const result = await pool.query(
      'INSERT INTO resources (label, link, created_by) VALUES ($1, $2, $3) RETURNING *',
      [label, link, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
};

const updateResource = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { label, link } = req.body;
  const userId = (req.user as any).id;

  try {
    const result = await pool.query(
      'UPDATE resources SET label = $1, link = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND created_by = $4 RETURNING *',
      [label, link, id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found or unauthorized' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
};

const deleteResource = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as any).id;

  try {
    const result = await pool.query(
      'DELETE FROM resources WHERE id = $1 AND created_by = $2 RETURNING *',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found or unauthorized' });
    }
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
}; 

export { getAllResources, createResource, updateResource, deleteResource };