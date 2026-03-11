import { Router } from 'express';

import {
  createTask,
  deleteTask,
  getTasks,
  reorderTasks,
  updateTask,
} from '../controllers/taskController';
import ctrlWrapper from '../middleware/ctrlWrapper';
import { writeLimiter } from '../middleware/rateLimit';
import validateBody from '../middleware/validateBody';
import { createTaskSchema, reorderSchema, updateTaskSchema } from '../schemas/taskSchemas';

const tasksRouter = Router();

tasksRouter.get('/', ctrlWrapper(getTasks));

tasksRouter.post('/', writeLimiter, validateBody(createTaskSchema), ctrlWrapper(createTask));

tasksRouter.put('/reorder', writeLimiter, validateBody(reorderSchema), ctrlWrapper(reorderTasks));

tasksRouter.patch('/:id', writeLimiter, validateBody(updateTaskSchema), ctrlWrapper(updateTask));

tasksRouter.delete('/:id', writeLimiter, ctrlWrapper(deleteTask));

export default tasksRouter;
