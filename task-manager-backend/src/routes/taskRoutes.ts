import { Router } from 'express';
import { validateTask } from '../middleware/validation';
import {taskController} from '../controllers/taskController';

const router = Router();

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', validateTask, taskController.createTask);
router.put('/:id', validateTask, async (req, res, next) => {
    await taskController.updateTask(req, res, next);
});
router.get('/:id/subtasks', taskController.getSubtasks);

export default router;