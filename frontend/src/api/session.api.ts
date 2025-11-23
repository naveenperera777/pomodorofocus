import axios from 'axios';
import { 
  Session, 
  DailyStats,
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskWithSessions,
  DateRangeStat
} from '../types/session';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ===== CATEGORY API =====
export const categoryApi = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_BASE}/categories`);
    return response.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await axios.get(`${API_BASE}/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryDTO): Promise<Category> => {
    const response = await axios.post(`${API_BASE}/categories`, data);
    return response.data;
  },

  updateCategory: async (id: number, data: UpdateCategoryDTO): Promise<Category> => {
    const response = await axios.patch(`${API_BASE}/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/categories/${id}`);
  }
};

// ===== TASK API =====
export const taskApi = {
  getActiveTask: async (): Promise<Task | null> => {
    try {
      const response = await axios.get(`${API_BASE}/tasks/active`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getTasksByDate: async (date: string): Promise<Task[]> => {
    const response = await axios.get(`${API_BASE}/tasks/date/${date}`);
    return response.data;
  },

  getTaskById: async (id: number): Promise<Task> => {
    const response = await axios.get(`${API_BASE}/tasks/${id}`);
    return response.data;
  },

  createTask: async (data: CreateTaskDTO): Promise<Task> => {
    const response = await axios.post(`${API_BASE}/tasks`, data);
    return response.data;
  },

  updateTask: async (id: number, data: UpdateTaskDTO): Promise<Task> => {
    const response = await axios.patch(`${API_BASE}/tasks/${id}`, data);
    return response.data;
  },

  completeTask: async (id: number): Promise<Task> => {
    const response = await axios.post(`${API_BASE}/tasks/${id}/complete`);
    return response.data;
  },

  getTasksWithSessions: async (date: string): Promise<TaskWithSessions[]> => {
    const response = await axios.get(`${API_BASE}/tasks/date/${date}/with-sessions`);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/tasks/${id}`);
  }
};

// ===== SESSION API =====
export const sessionApi = {
  createSession: async (taskId: number): Promise<Session> => {
    const response = await axios.post(`${API_BASE}/sessions`, { task_id: taskId });
    return response.data;
  },

  createQuickFocusSession: async (): Promise<{ session: Session; task: Task }> => {
    const response = await axios.post(`${API_BASE}/sessions/quick-focus`, {});
    return response.data;
  },

  endSession: async (id: number, status: 'completed' | 'abandoned'): Promise<Session> => {
    const response = await axios.patch(`${API_BASE}/sessions/${id}/end`, { status });
    return response.data;
  },

  getInProgressSession: async (): Promise<Session | null> => {
    try {
      const response = await axios.get(`${API_BASE}/sessions/in-progress`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getTodaySessions: async (): Promise<Session[]> => {
    const response = await axios.get(`${API_BASE}/sessions/today`);
    return response.data;
  },

  getSessionsByDate: async (date: string): Promise<Session[]> => {
    const response = await axios.get(`${API_BASE}/sessions/date/${date}`);
    return response.data;
  },

  getSessionsByTask: async (taskId: number): Promise<Session[]> => {
    const response = await axios.get(`${API_BASE}/sessions/task/${taskId}`);
    return response.data;
  },

  getDailyStats: async (date: string): Promise<DailyStats> => {
    const response = await axios.get(`${API_BASE}/sessions/stats/${date}`);
    return response.data;
  },

  getDateRangeStats: async (startDate: string, endDate: string): Promise<DateRangeStat[]> => {
    const response = await axios.get(`${API_BASE}/sessions/stats/range`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
};
