import { Request, Response } from 'express';
import { sessionService } from '../services/session.service';
import { format } from 'date-fns';

export const sessionController = {
  // POST /sessions - Create a new session (requires task_id)
  async createSession(req: Request, res: Response) {
    try {
      const { task_id } = req.body;
      
      if (!task_id) {
        return res.status(400).json({ error: 'task_id is required' });
      }

      const session = await sessionService.createSession({ task_id });
      res.status(201).json(session);
    } catch (error: any) {
      console.error('Error creating session:', error);
      if (error.message.includes('Task not found') || error.message.includes('completed task')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('already an in-progress')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create session' });
    }
  },

  // POST /sessions/quick-focus - Create Quick Focus session (auto-creates task)
  async createQuickFocusSession(req: Request, res: Response) {
    try {
      const userId = req.body.userId || 'default_user';
      const result = await sessionService.createQuickFocusSession(userId);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Error creating Quick Focus session:', error);
      if (error.message.includes('active')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create Quick Focus session' });
    }
  },

  // PATCH /sessions/:id/end - End a session
  async endSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['completed', 'abandoned'].includes(status)) {
        return res.status(400).json({ error: 'Status must be completed or abandoned' });
      }

      const session = await sessionService.endSession(Number(id), status);
      res.json(session);
    } catch (error: any) {
      console.error('Error ending session:', error);
      if (error.message === 'Session not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('not in progress')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to end session' });
    }
  },

  // GET /sessions/in-progress - Get current in-progress session
  async getInProgressSession(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string || 'default_user';
      const session = await sessionService.getInProgressSession(userId);
      
      if (!session) {
        return res.status(404).json({ error: 'No in-progress session found' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error fetching in-progress session:', error);
      res.status(500).json({ error: 'Failed to fetch in-progress session' });
    }
  },

  // GET /sessions/date/:date - Get sessions by date
  async getSessionsByDate(req: Request, res: Response) {
    try {
      const { date } = req.params;
      const userId = req.query.userId as string || 'default_user';
      const sessions = await sessionService.getSessionsByDate(date, userId);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  },

  // GET /sessions/task/:taskId - Get sessions by task
  async getSessionsByTask(req: Request, res: Response) {
    try {
      const taskId = parseInt(req.params.taskId);
      const sessions = await sessionService.getSessionsByTask(taskId);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  },

  // GET /sessions/today - Get today's sessions
  async getTodaySessions(req: Request, res: Response) {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const userId = req.query.userId as string || 'default_user';
      const sessions = await sessionService.getSessionsByDate(today, userId);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching today sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  },

  // GET /sessions/stats/:date - Get daily stats (category aggregation)
  async getDailyStats(req: Request, res: Response) {
    try {
      const { date } = req.params;
      const userId = req.query.userId as string || 'default_user';
      const stats = await sessionService.getDailyStats(date, userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  },

  // GET /sessions/stats/range - Get date range stats
  async getDateRangeStats(req: Request, res: Response) {
    try {
      const { startDate, endDate, userId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const stats = await sessionService.getDateRangeStats(
        startDate as string, 
        endDate as string,
        (userId as string) || 'default_user'
      );
      res.json(stats);
    } catch (error) {
      console.error('Error fetching date range stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
};
