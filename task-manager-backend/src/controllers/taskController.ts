import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { getWebSocketManager } from '../websocket/websocketServer';

export const taskController = {
  // Get all tasks
   async getAllTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await pool.query(`
        SELECT t.*, o.name as owner_name 
        FROM tasks t 
        LEFT JOIN owners o ON t.owner_id = o.id
        ORDER BY t.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Get task by ID
  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // Create task
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    const {
      name,
      description,
      owner_id,
      start_date,
      completion_percentage,
      parent_id,
      custom_fields
    } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO tasks (
          name, description, owner_id, start_date,
          completion_percentage, parent_id, custom_fields
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [name, description, owner_id, start_date, 
         completion_percentage, parent_id, custom_fields]
      );

      const newTask = result.rows[0];
      
      // Broadcast the new task to all connected clients
      getWebSocketManager().broadcast({
        type: 'TASK_CREATED',
        payload: newTask
      });

      res.status(201).json(newTask);
    } catch (error) {
      next(error);
    }
  },
  // Update task
  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const updates = req.body;

    try {
      // Create dynamic update query
      const keys = Object.keys(updates);
      const values = Object.values(updates);
      
      const setClause = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
      
      const query = `
        UPDATE tasks 
        SET ${setClause} 
        WHERE id = $${keys.length + 1}
        RETURNING *
      `;

      const result = await pool.query(query, [...values, id]);

      if (result.rows.length === 0) {
         res.status(404).json({ error: 'Task not found' });
         return;
      }

      const updatedTask = result.rows[0];
      
      // Broadcast the update to all connected clients
      getWebSocketManager().broadcast({
        type: 'TASK_UPDATED',
        payload: updatedTask
      });

      res.json(updatedTask);
    } catch (error) {
      next(error);
    }
  },

  // Get subtasks
  async getSubtasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'SELECT * FROM tasks WHERE parent_id = $1',
        [id]
      );
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }
};