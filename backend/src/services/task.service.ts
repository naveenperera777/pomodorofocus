import { query } from '../database/db';
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskWithSessions } from '../types/session.types';
import { format, parse } from 'date-fns';

export const taskService = {
  // Get active task for user
  async getActiveTask(userId: string = 'default_user'): Promise<Task | null> {
    const result = await query(
      `SELECT t.*, c.name as category_name, c.color as category_color
       FROM tasks t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.status = 'active'
       LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  // Get tasks by date
  async getTasksByDate(date: string, userId: string = 'default_user'): Promise<Task[]> {
    const result = await query(
      `SELECT t.*, c.name as category_name, c.color as category_color
       FROM tasks t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.date = $2
       ORDER BY t.planned_start_time ASC`,
      [userId, date]
    );
    return result.rows;
  },

  // Get task by ID
  async getTaskById(id: number): Promise<Task | null> {
    const result = await query(
      `SELECT t.*, c.name as category_name, c.color as category_color
       FROM tasks t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Create a new task
  async createTask(data: CreateTaskDTO, userId: string = 'default_user'): Promise<Task> {
    // Check if there's already an active task
    const activeTask = await this.getActiveTask(userId);
    if (activeTask) {
      throw new Error('Cannot create a new task while another task is active. Please complete the current task first.');
    }

    const result = await query(
      `INSERT INTO tasks (user_id, category_id, name, date, planned_start_time, planned_end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING *`,
      [userId, data.category_id, data.name || null, data.date, data.planned_start_time, data.planned_end_time]
    );

    return result.rows[0];
  },

  // Update a task (typically to extend planned_end_time)
  async updateTask(id: number, data: UpdateTaskDTO): Promise<Task | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCounter++}`);
      values.push(data.name);
    }

    if (data.planned_start_time !== undefined) {
      updates.push(`planned_start_time = $${paramCounter++}`);
      values.push(data.planned_start_time);
    }

    if (data.planned_end_time !== undefined) {
      updates.push(`planned_end_time = $${paramCounter++}`);
      values.push(data.planned_end_time);
    }

    if (updates.length === 0) {
      return this.getTaskById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE tasks 
       SET ${updates.join(', ')}
       WHERE id = $${paramCounter}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  },

  // Extend task end time (called when session would exceed planned end)
  async extendTaskEndTime(taskId: number, newEndTime: string): Promise<Task> {
    const result = await query(
      `UPDATE tasks 
       SET planned_end_time = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [newEndTime, taskId]
    );

    if (!result.rows[0]) {
      throw new Error('Task not found');
    }

    return result.rows[0];
  },

  // Complete a task
  async completeTask(id: number): Promise<Task> {
    // First check if there's an in-progress session
    const sessionCheck = await query(
      `SELECT id FROM sessions WHERE task_id = $1 AND status = 'in_progress' LIMIT 1`,
      [id]
    );

    if (sessionCheck.rows.length > 0) {
      throw new Error('Cannot complete task while a session is in progress. End the session first.');
    }

    const result = await query(
      `UPDATE tasks 
       SET status = 'completed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (!result.rows[0]) {
      throw new Error('Task not found');
    }

    return result.rows[0];
  },

  // Get tasks with their sessions (for analytics)
  async getTasksWithSessions(date: string, userId: string = 'default_user'): Promise<TaskWithSessions[]> {
    const tasksResult = await query(
      `SELECT t.*, c.name as category_name, c.color as category_color
       FROM tasks t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.date = $2
       ORDER BY t.planned_start_time ASC`,
      [userId, date]
    );

    const tasks = tasksResult.rows;

    // Get sessions for each task
    const tasksWithSessions = await Promise.all(
      tasks.map(async (task) => {
        const sessionsResult = await query(
          `SELECT * FROM sessions 
           WHERE task_id = $1 
           ORDER BY start_time ASC`,
          [task.id]
        );

        const sessions = sessionsResult.rows;
        const totalFocusTime = sessions.reduce((sum, session) => {
          return sum + (session.actual_duration || 0);
        }, 0);

        return {
          ...task,
          sessions,
          total_focus_time: totalFocusTime,
          session_count: sessions.length,
        };
      })
    );

    return tasksWithSessions;
  },

  // Delete a task (will cascade delete sessions)
  async deleteTask(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  },
};
