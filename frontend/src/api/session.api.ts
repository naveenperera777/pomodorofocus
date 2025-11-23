import axios from 'axios';
import { Session, CreateSessionDTO, UpdateSessionDTO, DailyStats } from '../types/session';

const API_BASE = '/api';

export const sessionApi = {
  createSession: async (data: CreateSessionDTO): Promise<Session> => {
    const response = await axios.post(`${API_BASE}/sessions`, data);
    return response.data;
  },

  completeSession: async (id: number, data: UpdateSessionDTO): Promise<Session> => {
    const response = await axios.patch(`${API_BASE}/sessions/${id}/complete`, data);
    return response.data;
  },

  getTodaySessions: async (): Promise<Session[]> => {
    const response = await axios.get(`${API_BASE}/sessions/today`);
    return response.data;
  },

  getSessionsByDate: async (date: string): Promise<Session[]> => {
    const response = await axios.get(`${API_BASE}/sessions/date/${date}`);
    return response.data;
  },

  getDailyStats: async (date: string): Promise<DailyStats> => {
    const response = await axios.get(`${API_BASE}/sessions/stats/${date}`);
    return response.data;
  },

  getDateRangeStats: async (startDate: string, endDate: string) => {
    const response = await axios.get(`${API_BASE}/sessions/stats/range`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
};
