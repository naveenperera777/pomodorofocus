import { query } from '../database/db';
import { Session, CreateSessionDTO, UpdateSessionDTO } from '../types/session.types';
import { format } from 'date-fns';

export const sessionService = {
  async createSession(data: CreateSessionDTO): Promise<Session> {
    const now = new Date();
    const date = format(now, 'yyyy-MM-dd');
    const durationInSeconds = data.duration * 60; // Convert minutes to seconds
    
    const result = await query(
      `INSERT INTO sessions (start_time, duration, status, date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [now, durationInSeconds, 'in_progress', date]
    );
    
    return result.rows[0];
  },

  async updateSession(id: number, data: UpdateSessionDTO): Promise<Session> {
    // Calculate actual duration in seconds
    const session = await this.getSessionById(id);
    let actualDuration = null;
    
    if (session && data.end_time) {
      const startTime = new Date(session.start_time);
      const endTime = new Date(data.end_time);
      actualDuration = Math.round((endTime.getTime() - startTime.getTime()) / 1000); // Convert ms to seconds
    }
    
    const result = await query(
      `UPDATE sessions 
       SET status = $1, end_time = $2, actual_duration = $3 
       WHERE id = $4 
       RETURNING *`,
      [data.status, data.end_time, actualDuration, id]
    );
    
    return result.rows[0];
  },

  async getSessionsByDate(date: string): Promise<Session[]> {
    const result = await query(
      `SELECT * FROM sessions 
       WHERE date = $1 
       ORDER BY start_time ASC`,
      [date]
    );
    
    return result.rows;
  },

  async getSessionById(id: number): Promise<Session | null> {
    const result = await query(
      `SELECT * FROM sessions WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  },

  async getDailyStats(date: string) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE status = 'successful') as successful_sessions,
        COUNT(*) FILTER (WHERE status = 'unsuccessful') as unsuccessful_sessions,
        ROUND(SUM(COALESCE(actual_duration, duration)) FILTER (WHERE status = 'successful') / 60.0) as total_focus_time
       FROM sessions 
       WHERE date = $1`,
      [date]
    );
    
    return result.rows[0];
  },

  async getDateRangeStats(startDate: string, endDate: string) {
    const result = await query(
      `SELECT 
        date,
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE status = 'successful') as successful_sessions,
        ROUND(SUM(COALESCE(actual_duration, duration)) FILTER (WHERE status = 'successful') / 60.0) as focus_minutes
       FROM sessions 
       WHERE date >= $1 AND date <= $2
       GROUP BY date
       ORDER BY date ASC`,
      [startDate, endDate]
    );
    
    return result.rows;
  }
};
