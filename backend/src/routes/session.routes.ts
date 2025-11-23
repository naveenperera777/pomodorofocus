import { Router } from 'express';
import { sessionController } from '../controllers/session.controller';

const router = Router();

router.post('/sessions', sessionController.createSession);
router.patch('/sessions/:id/complete', sessionController.completeSession);
router.get('/sessions/today', sessionController.getTodaySessions);
router.get('/sessions/date/:date', sessionController.getSessionsByDate);
router.get('/sessions/stats/range', sessionController.getDateRangeStats);
router.get('/sessions/stats/:date', sessionController.getDailyStats);

export default router;
