import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';

export const ownerController = {
  // Get all owners
  async getAllOwners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await pool.query('SELECT * FROM owners ORDER BY name');
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Create owner
  async createOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { name, email } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO owners (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // Update owner
  async updateOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
      const result = await pool.query(
        'UPDATE owners SET name = $1, email = $2 WHERE id = $3 RETURNING *',
        [name, email, id]
      );
      
      if (result.rows.length === 0) {
         res.status(404).json({ error: 'Owner not found' });
         return;
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
};