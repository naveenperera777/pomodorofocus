import { create } from 'zustand';
import { Session, DailyStats, Category, Task, TaskWithSessions } from '../types/session';

interface SessionState {
  // Session state
  currentSession: Session | null;
  sessions: Session[];
  stats: DailyStats | null;
  
  // Category state
  categories: Category[];
  
  // Task state
  activeTask: Task | null;
  tasks: Task[];
  tasksWithSessions: TaskWithSessions[];
  
  // Session actions
  setCurrentSession: (session: Session | null) => void;
  setSessions: (sessions: Session[]) => void;
  setStats: (stats: DailyStats) => void;
  addSession: (session: Session) => void;
  updateSession: (session: Session) => void;
  
  // Category actions
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  removeCategory: (id: number) => void;
  
  // Task actions
  setActiveTask: (task: Task | null) => void;
  setTasks: (tasks: Task[]) => void;
  setTasksWithSessions: (tasks: TaskWithSessions[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: number) => void;
  completeActiveTask: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  // Initial state
  currentSession: null,
  sessions: [],
  stats: null,
  categories: [],
  activeTask: null,
  tasks: [],
  tasksWithSessions: [],
  
  // Session actions
  setCurrentSession: (session) => set({ currentSession: session }),
  setSessions: (sessions) => set({ sessions }),
  setStats: (stats) => set({ stats }),
  addSession: (session) => set((state) => ({ 
    sessions: [...state.sessions, session],
    currentSession: session 
  })),
  updateSession: (session) => set((state) => ({
    sessions: state.sessions.map((s) => s.id === session.id ? session : s),
    currentSession: state.currentSession?.id === session.id ? session : state.currentSession
  })),
  
  // Category actions
  setCategories: (categories) => set({ categories }),
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category]
  })),
  updateCategory: (category) => set((state) => ({
    categories: state.categories.map((c) => c.id === category.id ? category : c)
  })),
  removeCategory: (id) => set((state) => ({
    categories: state.categories.filter((c) => c.id !== id)
  })),
  
  // Task actions
  setActiveTask: (task) => set({ activeTask: task }),
  setTasks: (tasks) => set({ tasks }),
  setTasksWithSessions: (tasksWithSessions) => set({ tasksWithSessions }),
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task],
    activeTask: task.status === 'active' ? task : state.activeTask
  })),
  updateTask: (task) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === task.id ? task : t),
    activeTask: state.activeTask?.id === task.id ? task : state.activeTask
  })),
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
    activeTask: state.activeTask?.id === id ? null : state.activeTask
  })),
  completeActiveTask: () => set((state) => {
    if (state.activeTask) {
      const completedTask = { ...state.activeTask, status: 'completed' as const };
      return {
        activeTask: null,
        tasks: state.tasks.map((t) => t.id === completedTask.id ? completedTask : t)
      };
    }
    return state;
  }),
}));
