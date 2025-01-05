import { Request, Response, NextFunction } from 'express';

export const validateTask = (req: Request, res: Response, next: NextFunction) => {
  const { name, owner_id } = req.body;

  if (!name || name.trim().length === 0) {
     res.status(400).json({ error: 'Task name is required' });
     return;
  }

  if (!owner_id) {
     res.status(400).json({ error: 'Owner ID is required' });
     return;
  }

  next();
};

export const validateOwner = (req: Request, res: Response, next: NextFunction) => {
  const { name, email } = req.body;

  if (!name || name.trim().length === 0) {
     res.status(400).json({ error: 'Owner name is required' });
     return;
  }

  if (!email || !email.includes('@')) {
     res.status(400).json({ error: 'Valid email is required' });
     return;
  }

  next();
};


export const validateCustomField = (req: Request, res: Response, next: NextFunction) => {
    const { name, field_type } = req.body;
  
    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: 'Field name is required' });
      return;
    }
  
    const validFieldTypes = ['text', 'number', 'date', 'select', 'multiselect'];
    if (!field_type || !validFieldTypes.includes(field_type)) {
      res.status(400).json({ 
        error: 'Valid field type is required',
        validTypes: validFieldTypes
      });
      return;
    }
  
    if (['select', 'multiselect'].includes(field_type)) {
      const { options } = req.body;
      if (!options || !Array.isArray(options) || options.length === 0) {
         res.status(400).json({ 
          error: 'Options array is required for select/multiselect fields' 
        });
        return;
      }
    }
  
    next();
  };