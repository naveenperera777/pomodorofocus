import { query } from '../database/db';
import { Session, CreateSessionDTO, UpdateSessionDTO, CategoryStats } from '../types/session.types';
import { format, parse, addMinutes } from 'date-fns';
import { taskService } from './task.service';
import { categoryService } from './category.service';

export const sessionService = {
  // Create a new session (must belong to a task)
  async createSession(data: CreateSessionDTO): Promise<Session> {
    const now = new Date();
    
    // Verify task exists and is active
    const task = await taskService.getTaskById(data.task_id);
    if (!task) {
      throw new Error('Task not found');
    }
    if (task.status !== 'active') {
      throw new Error('Cannot start a session on a completed task');
    }

    // Check if there's already an in-progress session for this task
    const existingSession = await query(
      `SELECT id FROM sessions WHERE task_id = $1 AND status = 'in_progress' LIMIT 1`,
      [data.task_id]
    );
    if (existingSession.rows.length > 0) {
      throw new Error('There is already an in-progress session for this task');
    }

    const result = await query(
      `INSERT INTO sessions (task_id, start_time, status) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [data.task_id, now, 'in_progress']
    );
    
    const session = result.rows[0];
    
    // Fetch the session with task data populated
    const sessionWithTask = await query(
      `SELECT s.*, 
        json_build_object(
          'id', t.id,
          'name', t.name,
          'date', t.date,
          'planned_start_time', t.planned_start_time,
          'planned_end_time', t.planned_end_time,
          'status', t.status,
          'category', json_build_object(
            'id', c.id,
            'name', c.name,
            'color', c.color
          )
        ) as task
       FROM sessions s
       JOIN tasks t ON s.task_id = t.id
       JOIN categories c ON t.category_id = c.id
       WHERE s.id = $1`,
      [session.id]
    );
    
    return sessionWithTask.rows[0];
  },

  // Create Quick Focus session (auto-creates task)
  async createQuickFocusSession(userId: string = 'default_user'): Promise<{ session: Session; task: any }> {
    // Get Quick Focus category
    const quickFocusCategory = await categoryService.getQuickFocusCategory();
    if (!quickFocusCategory) {
      throw new Error('Quick Focus category not found');
    }

    // Check if there's already an active task
    const activeTask = await taskService.getActiveTask(userId);
    if (activeTask) {
      throw new Error('Cannot start Quick Focus while another task is active. Please complete the current task first.');
    }

    const now = new Date();
    const date = format(now, 'yyyy-MM-dd');
    const startTime = format(now, 'HH:mm:ss');
    // For Quick Focus, set end time to 5 minutes from now
    const endTime = format(addMinutes(now, 5), 'HH:mm:ss');

    // Create task
    const task = await taskService.createTask({
      category_id: quickFocusCategory.id,
      date,
      planned_start_time: startTime,
      planned_end_time: endTime,
    }, userId);

    // Create session
    const session = await this.createSession({ task_id: task.id });

    return { session, task };
  },

  // End a session
  async endSession(id: number, status: 'completed' | 'abandoned'): Promise<Session> {
    const session = await this.getSessionById(id);
    if (!session) {
      throw new Error('Session not found');
    }
    
    // If session is already ended, just return it (idempotent)
    if (session.status !== 'in_progress') {
      console.log(`Session ${id} already ended with status: ${session.status}`);
      return session;
    }

    const endTime = new Date();
    const startTime = new Date(session.start_time);
    const actualDuration = Math.round((endTime.getTime() - startTime.getTime()) / 1000); // Convert ms to seconds
    
    // Check if session would exceed task's planned end time
    const task = await taskService.getTaskById(session.task_id);
    if (task) {
      const taskEndDateTime = parse(
        `${task.date} ${task.planned_end_time}`,
        'yyyy-MM-dd HH:mm:ss',
        new Date()
      );
      
      // If session end time exceeds task end time, extend the task
      if (endTime > taskEndDateTime) {
        const newEndTime = format(endTime, 'HH:mm:ss');
        await taskService.extendTaskEndTime(task.id, newEndTime);
      }
    }

    const result = await query(
      `UPDATE sessions 
       SET status = $1, end_time = $2, actual_duration = $3 
       WHERE id = $4 
       RETURNING *`,
      [status, endTime, actualDuration, id]
    );
    
    return result.rows[0];
  },

  // Get in-progress session
  async getInProgressSession(userId: string = 'default_user'): Promise<Session | null> {
    const result = await query(
      `SELECT s.*, 
        json_build_object(
          'id', t.id,
          'name', t.name,
          'date', t.date,
          'planned_start_time', t.planned_start_time,
          'planned_end_time', t.planned_end_time,
          'status', t.status,
          'category', json_build_object(
            'id', c.id,
            'name', c.name,
            'color', c.color
          )
        ) as task
       FROM sessions s
       JOIN tasks t ON s.task_id = t.id
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND s.status = 'in_progress'
       LIMIT 1`,
      [userId]
    );
    
    return result.rows[0] || null;
  },

  // Get sessions by task
  async getSessionsByTask(taskId: number): Promise<Session[]> {
    const result = await query(
      `SELECT * FROM sessions 
       WHERE task_id = $1 
       ORDER BY start_time ASC`,
      [taskId]
    );
    
    return result.rows;
  },

  // Get sessions by date (joins with tasks)
  async getSessionsByDate(date: string, userId: string = 'default_user'): Promise<Session[]> {
    const result = await query(
      `SELECT s.* FROM sessions s
       JOIN tasks t ON s.task_id = t.id
       WHERE t.user_id = $1 AND t.date = $2
       ORDER BY s.start_time ASC`,
      [userId, date]
    );
    
    return result.rows;
  },

  // Get session by ID
  async getSessionById(id: number): Promise<Session | null> {
    const result = await query(
      `SELECT * FROM sessions WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  },

  // Get daily stats (aggregated by category)
  async getDailyStats(date: string, userId: string = 'default_user') {
    // Get category-level aggregation
    const categoryStatsResult = await query(
      `SELECT 
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        COUNT(DISTINCT t.id) as task_count,
        COUNT(s.id) as session_count,
        COALESCE(SUM(s.actual_duration), 0) as total_focus_time
       FROM categories c
       LEFT JOIN tasks t ON c.id = t.category_id AND t.user_id = $1 AND t.date = $2
       LEFT JOIN sessions s ON t.id = s.task_id AND s.status = 'completed'
       GROUP BY c.id, c.name, c.color
       HAVING COUNT(t.id) > 0
       ORDER BY total_focus_time DESC`,
      [userId, date]
    );

    const categoryStats: CategoryStats[] = categoryStatsResult.rows;

    const totalFocusTime = categoryStats.reduce((sum, cat) => sum + Number(cat.total_focus_time), 0);

    return {
      date,
      total_focus_time: totalFocusTime,
      category_stats: categoryStats,
    };
  },

  // Get date range stats
  async getDateRangeStats(startDate: string, endDate: string, userId: string = 'default_user') {
    const result = await query(
      `SELECT 
        t.date,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        COUNT(DISTINCT t.id) as task_count,
        COUNT(s.id) as session_count,
        COALESCE(SUM(s.actual_duration), 0) as total_focus_time
       FROM tasks t
       JOIN categories c ON t.category_id = c.id
       LEFT JOIN sessions s ON t.id = s.task_id AND s.status = 'completed'
       WHERE t.user_id = $1 AND t.date >= $2 AND t.date <= $3
       GROUP BY t.date, c.id, c.name, c.color
       ORDER BY t.date ASC, total_focus_time DESC`,
      [userId, startDate, endDate]
    );
    
    return result.rows;
  },
};
