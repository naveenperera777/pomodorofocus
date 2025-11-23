import { Request, Response } from 'express';
import { taskService } from '../services/task.service';

export const taskController = {
  // GET /tasks/active - Get the active task
  async getActiveTask(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string || 'default_user';
      const task = await taskService.getActiveTask(userId);
      
      if (!task) {
        return res.status(404).json({ error: 'No active task found' });
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error fetching active task:', error);
      res.status(500).json({ error: 'Failed to fetch active task' });
    }
  },

  // GET /tasks/date/:date - Get tasks by date
  async getTasksByDate(req: Request, res: Response) {
    try {
      const date = req.params.date;
      const userId = req.query.userId as string || 'default_user';
      const tasks = await taskService.getTasksByDate(date, userId);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  },

  // GET /tasks/:id - Get task by ID
  async getTaskById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const task = await taskService.getTaskById(id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  },

  // POST /tasks - Create a new task
  async createTask(req: Request, res: Response) {
    try {
      const { category_id, name, date, planned_start_time, planned_end_time } = req.body;
      const userId = req.body.userId || 'default_user';
      
      if (!category_id || !date || !planned_start_time || !planned_end_time) {
        return res.status(400).json({ 
          error: 'category_id, date, planned_start_time, and planned_end_time are required' 
        });
      }
      
      const task = await taskService.createTask({
        category_id,
        name,
        date,
        planned_start_time,
        planned_end_time,
      }, userId);
      
      res.status(201).json(task);
    } catch (error: any) {
      console.error('Error creating task:', error);
      if (error.message.includes('active')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create task' });
    }
  },

  // PATCH /tasks/:id - Update a task
  async updateTask(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name, planned_start_time, planned_end_time } = req.body;
      
      const task = await taskService.updateTask(id, {
        name,
        planned_start_time,
        planned_end_time,
      });
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  },

  // POST /tasks/:id/complete - Complete a task
  async completeTask(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const task = await taskService.completeTask(id);
      res.json(task);
    } catch (error: any) {
      console.error('Error completing task:', error);
      if (error.message.includes('in progress')) {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === 'Task not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to complete task' });
    }
  },

  // GET /tasks/date/:date/with-sessions - Get tasks with sessions (for analytics)
  async getTasksWithSessions(req: Request, res: Response) {
    try {
      const date = req.params.date;
      const userId = req.query.userId as string || 'default_user';
      const tasks = await taskService.getTasksWithSessions(date, userId);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks with sessions:', error);
      res.status(500).json({ error: 'Failed to fetch tasks with sessions' });
    }
  },

  // DELETE /tasks/:id - Delete a task
  async deleteTask(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const deleted = await taskService.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  },
};
