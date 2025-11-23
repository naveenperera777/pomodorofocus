// ===== CATEGORY TYPES =====
export interface Category {
  id: number;
  name: string;
  color: string; // hex color code
  is_quick_focus: boolean;
  created_at: Date;
}

export interface CreateCategoryDTO {
  name: string;
  color: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  color?: string;
}

// ===== TASK TYPES =====
export interface Task {
  id: number;
  user_id: string;
  category_id: number;
  name: string | null; // nullable for Quick Focus auto-tasks
  date: Date;
  planned_start_time: string; // TIME format (HH:MM:SS)
  planned_end_time: string; // TIME format (HH:MM:SS)
  status: 'active' | 'completed';
  created_at: Date;
  updated_at: Date;
  // Relations
  category?: Category;
  sessions?: Session[];
}

export interface CreateTaskDTO {
  category_id: number;
  name?: string; // optional for Quick Focus
  date: string; // ISO date string (YYYY-MM-DD)
  planned_start_time: string; // HH:MM format
  planned_end_time: string; // HH:MM format
}

export interface UpdateTaskDTO {
  name?: string;
  planned_start_time?: string;
  planned_end_time?: string;
}

export interface CompleteTaskDTO {
  // No fields needed, just marks task as completed
}

// ===== SESSION TYPES =====
export interface Session {
  id: number;
  task_id: number; // Required - sessions must belong to a task
  start_time: Date;
  end_time: Date | null;
  actual_duration: number | null; // actual duration in seconds
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: Date;
  // Relations
  task?: Task;
}

export interface CreateSessionDTO {
  task_id: number;
}

export interface UpdateSessionDTO {
  status: 'completed' | 'abandoned';
  end_time: Date;
}

// ===== ANALYTICS TYPES =====
export interface TaskWithSessions extends Task {
  sessions: Session[];
  total_focus_time: number; // sum of session durations
  session_count: number;
}

export interface CategoryStats {
  category_id: number;
  category_name: string;
  category_color: string;
  total_focus_time: number; // sum across all tasks in this category
  task_count: number;
  session_count: number;
}

export interface DailyStats {
  date: Date;
  total_focus_time: number;
  categories: CategoryStats[];
  tasks: TaskWithSessions[];
}

