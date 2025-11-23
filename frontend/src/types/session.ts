export interface Session {
  id: number;
  start_time: string;
  end_time: string | null;
  duration: number; // planned duration
  actual_duration: number | null; // actual duration based on timestamps
  status: 'in_progress' | 'successful' | 'unsuccessful';
  date: string;
  created_at: string;
}

export interface DailyStats {
  total_sessions: number;
  successful_sessions: number;
  unsuccessful_sessions: number;
  total_focus_time: number;
}

export interface CreateSessionDTO {
  duration: number;
}

export interface UpdateSessionDTO {
  status: 'successful' | 'unsuccessful';
}
