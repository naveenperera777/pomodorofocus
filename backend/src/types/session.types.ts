export interface Session {
  id: number;
  start_time: Date;
  end_time: Date | null;
  duration: number; // planned duration in seconds
  actual_duration: number | null; // actual duration in seconds based on timestamps
  status: 'in_progress' | 'successful' | 'unsuccessful';
  date: Date;
  created_at: Date;
}

export interface CreateSessionDTO {
  duration: number;
}

export interface UpdateSessionDTO {
  status: 'successful' | 'unsuccessful';
  end_time: Date;
}
