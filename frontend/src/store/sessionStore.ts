import { create } from 'zustand';
import { Session, DailyStats } from '../types/session';

interface SessionState {
  currentSession: Session | null;
  sessions: Session[];
  stats: DailyStats | null;
  setCurrentSession: (session: Session | null) => void;
  setSessions: (sessions: Session[]) => void;
  setStats: (stats: DailyStats) => void;
  addSession: (session: Session) => void;
  updateSession: (session: Session) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentSession: null,
  sessions: [],
  stats: null,
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
}));
