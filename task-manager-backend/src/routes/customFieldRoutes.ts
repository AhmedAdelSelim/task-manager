import { Router } from 'express';
import { customFieldController } from '../controllers/customFieldController';
import { validateCustomField } from '../middleware/validation';

const router = Router();

router.get('/', customFieldController.getAllCustomFields);
router.post('/', validateCustomField, customFieldController.createCustomField);
router.put('/:id', validateCustomField, customFieldController.updateCustomField);
router.delete('/:id', customFieldController.deleteCustomField);

export default router;