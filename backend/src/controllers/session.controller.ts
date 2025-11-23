import { Request, Response } from 'express';
import { sessionService } from '../services/session.service';
import { format } from 'date-fns';

export const sessionController = {
  async createSession(req: Request, res: Response) {
    try {
      const { duration } = req.body;
      
      if (![5, 10].includes(duration)) {
        return res.status(400).json({ error: 'Duration must be 5 or 10 minutes' });
      }

      const session = await sessionService.createSession({ duration });
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  },

  async completeSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['successful', 'unsuccessful'].includes(status)) {
        return res.status(400).json({ error: 'Status must be successful or unsuccessful' });
      }

      const session = await sessionService.updateSession(Number(id), {
        status,
        end_time: new Date()
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Error completing session:', error);
      res.status(500).json({ error: 'Failed to complete session' });
    }
  },

  async getSessionsByDate(req: Request, res: Response) {
    try {
      const { date } = req.params;
      const sessions = await sessionService.getSessionsByDate(date);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  },

  async getTodaySessions(req: Request, res: Response) {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const sessions = await sessionService.getSessionsByDate(today);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching today sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  },

  async getDailyStats(req: Request, res: Response) {
    try {
      const { date } = req.params;
      const stats = await sessionService.getDailyStats(date);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  },

  async getDateRangeStats(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const stats = await sessionService.getDateRangeStats(startDate as string, endDate as string);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching date range stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
};
