import { Router } from 'express';

import {
  createTask,
  deleteTask,
  getTasks,
  reorderTasks,
  updateTask,
} from '../controllers/taskController';
import ctrlWrapper from '../middleware/ctrlWrapper';
import validateBody from '../middleware/validateBody';
import { createTaskSchema, reorderSchema, updateTaskSchema } from '../schemas/taskSchemas';

const tasksRouter = Router();

tasksRouter.get('/', ctrlWrapper(getTasks));

tasksRouter.post('/', validateBody(createTaskSchema), ctrlWrapper(createTask));

tasksRouter.put('/reorder', validateBody(reorderSchema), ctrlWrapper(reorderTasks));

tasksRouter.patch('/:id', validateBody(updateTaskSchema), ctrlWrapper(updateTask));

tasksRouter.delete('/:id', ctrlWrapper(deleteTask));

export default tasksRouter;
