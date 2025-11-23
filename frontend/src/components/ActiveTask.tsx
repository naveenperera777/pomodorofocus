import React, { useState } from 'react';
import { Task } from '../types/session';
import { taskApi } from '../api/session.api';
import { useSessionStore } from '../store/sessionStore';
import { format } from 'date-fns';

interface ActiveTaskProps {
  task: Task;
  onTaskCompleted?: () => void;
}

export const ActiveTask: React.FC<ActiveTaskProps> = ({ task, onTaskCompleted }) => {
  const { setActiveTask, updateTask } = useSessionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompleteTask = async () => {
    if (!confirm('Are you sure you want to complete this task? You won\'t be able to add more sessions to it.')) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const completedTask = await taskApi.completeTask(task.id);
      updateTask(completedTask);
      setActiveTask(null);
      onTaskCompleted?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete task');
      setLoading(false);
    }
  };

  // Format time for display (HH:MM:SS -> HH:MM)
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  // Get category color or default
  const categoryColor = task.category_color || '#A8B8A5';
  const categoryName = task.category_name || 'Unknown';

  return (
    <div className="bg-background-dark rounded-lg p-6 border-2 border-primary">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span 
              className="inline-block w-3 h-3 rounded-full" 
              style={{ backgroundColor: categoryColor }}
            />
            <span className="text-sm font-medium text-text-muted">{categoryName}</span>
            <span className="px-2 py-1 bg-primary bg-opacity-20 text-primary text-xs rounded-full">
              Active
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-text-primary mb-1">
            {task.name || 'Untitled Task'}
          </h3>
          
          <div className="flex items-center space-x-4 text-sm text-text-muted">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {formatTime(task.planned_start_time)} - {formatTime(task.planned_end_time)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{format(new Date(task.date), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCompleteTask}
          disabled={loading}
          className="ml-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{loading ? 'Completing...' : 'Complete Task'}</span>
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 p-4 bg-background rounded-lg">
        <p className="text-sm text-text-muted">
          <span className="font-medium text-text-primary">Note:</span> This is your active task. 
          Start a session to track your focus time within this task block. The task will automatically 
          extend if your sessions run past the planned end time.
        </p>
      </div>
    </div>
  );
};
