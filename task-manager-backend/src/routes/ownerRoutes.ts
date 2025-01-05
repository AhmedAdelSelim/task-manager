import { Router } from 'express';
import { ownerController } from '../controllers/ownerController';
import { validateOwner } from '../middleware/validation';

const router = Router();

router.get('/', ownerController.getAllOwners);
router.post('/', validateOwner, ownerController.createOwner);
router.put('/:id', validateOwner, ownerController.updateOwner);

export default router;