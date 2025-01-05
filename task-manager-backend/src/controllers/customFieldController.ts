import { NextFunction, Request, Response } from 'express';
import { pool } from '../config/database';
import { getWebSocketManager } from '../websocket/websocketServer';

export const customFieldController = {
  // Get all custom fields
  async getAllCustomFields(req: Request, res: Response) {
    try {
      const result = await pool.query('SELECT * FROM custom_fields ORDER BY name');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching custom fields' });
    }
  },

  // Create custom field
  async createCustomField(req: Request, res: Response) {
    const { name, field_type, options } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO custom_fields (name, field_type, options) VALUES ($1, $2, $3) RETURNING *',
        [name, field_type, options]
      );

      const newField = result.rows[0];
      
      // Broadcast new custom field
      getWebSocketManager().broadcast({
        type: 'CUSTOM_FIELD_CREATED',
        payload: newField
      });

      res.status(201).json(newField);
    } catch (error) {
      res.status(500).json({ error: 'Error creating custom field' });
    }
  },

  // Update custom field
  async updateCustomField(req: Request, res: Response) {
    const { id } = req.params;
    const { name, field_type, options } = req.body;
    try {
      const result = await pool.query(
        `UPDATE custom_fields 
         SET name = $1, field_type = $2, options = $3 
         WHERE id = $4 
         RETURNING *`,
        [name, field_type, options, id]
      );

      if (result.rows.length === 0) {
         res.status(404).json({ error: 'Custom field not found' });
         return;
      }

      const updatedField = result.rows[0];
      
      // Broadcast update
      getWebSocketManager().broadcast({
        type: 'CUSTOM_FIELD_UPDATED',
        payload: updatedField
      });

      res.json(updatedField);
    } catch (error) {
      res.status(500).json({ error: 'Error updating custom field' });
    }
  },

  // Delete custom field
  async deleteCustomField(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'DELETE FROM custom_fields WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
         res.status(404).json({ error: 'Custom field not found' });
         return;
      }

      // Broadcast deletion
      getWebSocketManager().broadcast({
        type: 'CUSTOM_FIELD_DELETED',
        payload: { id }
      });

      res.json({ message: 'Custom field deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting custom field' });
    }
  }
};