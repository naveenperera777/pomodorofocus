import { Task } from '../types/session';

interface SessionSelectorProps {
  activeTask: Task | null;
  onStartSession: () => void;
  onStartQuickFocus: () => void;
  onCreateTask: () => void;
  disabled?: boolean;
}

export const SessionSelector = ({ 
  activeTask,
  onStartSession, 
  onStartQuickFocus,
  onCreateTask,
  disabled = false 
}: SessionSelectorProps) => {
  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      <h2 className="text-3xl font-bold text-text-primary mb-4">Start a Focus Session</h2>
      
      {activeTask ? (
        <div className="w-full max-w-md space-y-4">
          <p className="text-center text-text-muted mb-6">
            Start a session for your active task: <span className="font-semibold text-text-primary">{activeTask.name || 'Untitled Task'}</span>
          </p>
          <button
            onClick={onStartSession}
            disabled={disabled}
            className="w-full px-8 py-6 bg-primary text-white rounded-lg font-semibold text-xl hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Start Session</span>
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-text-muted">or</span>
            </div>
          </div>
          
          <button
            onClick={onStartQuickFocus}
            disabled={disabled}
            className="w-full px-6 py-4 bg-accent text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Quick Focus (No Task)</span>
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4">
          <p className="text-center text-text-muted mb-6">
            Create a task to start tracking your focus time
          </p>
          <button
            onClick={onCreateTask}
            disabled={disabled}
            className="w-full px-8 py-6 bg-primary text-white rounded-lg font-semibold text-xl hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Task</span>
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-text-muted">or</span>
            </div>
          </div>
          
          <button
            onClick={onStartQuickFocus}
            disabled={disabled}
            className="w-full px-6 py-4 bg-accent text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Quick Focus</span>
          </button>
          <p className="text-center text-sm text-text-muted mt-2">
            Quick Focus creates a task automatically
          </p>
        </div>
      )}
    </div>
  );
};
