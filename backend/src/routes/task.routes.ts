import { Router } from 'express';
import { taskController } from '../controllers/task.controller';

const router = Router();

// GET /api/tasks/active - Get active task (must come before /:id)
router.get('/active', taskController.getActiveTask);

// GET /api/tasks/date/:date/with-sessions - Get tasks with sessions for analytics
router.get('/date/:date/with-sessions', taskController.getTasksWithSessions);

// GET /api/tasks/date/:date - Get tasks by date
router.get('/date/:date', taskController.getTasksByDate);

// GET /api/tasks/:id - Get task by ID
router.get('/:id', taskController.getTaskById);

// POST /api/tasks - Create a new task
router.post('/', taskController.createTask);

// PATCH /api/tasks/:id - Update a task
router.patch('/:id', taskController.updateTask);

// POST /api/tasks/:id/complete - Complete a task
router.post('/:id/complete', taskController.completeTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', taskController.deleteTask);

export default router;
