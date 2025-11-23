import { Router } from 'express';
import { sessionController } from '../controllers/session.controller';

const router = Router();

// POST /sessions/quick-focus - Create Quick Focus session (must come before /:id routes)
router.post('/sessions/quick-focus', sessionController.createQuickFocusSession);

// POST /sessions - Create a new session
router.post('/sessions', sessionController.createSession);

// PATCH /sessions/:id/end - End a session
router.patch('/sessions/:id/end', sessionController.endSession);

// GET /sessions/in-progress - Get in-progress session
router.get('/sessions/in-progress', sessionController.getInProgressSession);

// GET /sessions/today - Get today's sessions
router.get('/sessions/today', sessionController.getTodaySessions);

// GET /sessions/task/:taskId - Get sessions by task
router.get('/sessions/task/:taskId', sessionController.getSessionsByTask);

// GET /sessions/date/:date - Get sessions by date
router.get('/sessions/date/:date', sessionController.getSessionsByDate);

// GET /sessions/stats/range - Get date range stats (must come before /stats/:date)
router.get('/sessions/stats/range', sessionController.getDateRangeStats);

// GET /sessions/stats/:date - Get daily stats
router.get('/sessions/stats/:date', sessionController.getDailyStats);

export default router;
