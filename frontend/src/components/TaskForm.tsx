import React, { useState, useEffect } from 'react';
import { CreateTaskDTO } from '../types/session';
import { categoryApi, taskApi } from '../api/session.api';
import { useSessionStore } from '../store/sessionStore';
import { format } from 'date-fns';

interface TaskFormProps {
  onClose: () => void;
  onTaskCreated?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onClose, onTaskCreated }) => {
  const { categories, setCategories, addTask } = useSessionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateTaskDTO>({
    category_id: 0,
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    planned_start_time: '09:00',
    planned_end_time: '10:00',
  });

  useEffect(() => {
    // Load categories if not already loaded
    if (categories.length === 0) {
      categoryApi.getAllCategories()
        .then(setCategories)
        .catch(console.error);
    }
  }, [categories.length, setCategories]);

  // Set default category once categories are loaded
  useEffect(() => {
    if (categories.length > 0 && formData.category_id === 0) {
      // Don't select Quick Focus by default
      const defaultCategory = categories.find(c => !c.is_quick_focus);
      if (defaultCategory) {
        setFormData(prev => ({ ...prev, category_id: defaultCategory.id }));
      }
    }
  }, [categories, formData.category_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate times
      if (formData.planned_start_time >= formData.planned_end_time) {
        setError('End time must be after start time');
        setLoading(false);
        return;
      }

      const task = await taskApi.createTask(formData);
      addTask(task);
      onTaskCreated?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task');
      setLoading(false);
    }
  };

  const availableCategories = categories.filter(c => !c.is_quick_focus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              Task Name (Optional)
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
              placeholder="e.g., Review code, Write article"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-text-primary mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
              required
              className="w-full px-4 py-2 bg-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
            >
              <option value={0} className="text-text-primary">Select a category</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id} className="text-text-primary">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-text-primary mb-2">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-4 py-2 bg-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-text-primary mb-2">
                Start Time *
              </label>
              <input
                type="time"
                id="start_time"
                value={formData.planned_start_time}
                onChange={(e) => setFormData({ ...formData, planned_start_time: e.target.value })}
                required
                className="w-full px-4 py-2 bg-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
              />
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-text-primary mb-2">
                End Time *
              </label>
              <input
                type="time"
                id="end_time"
                value={formData.planned_end_time}
                onChange={(e) => setFormData({ ...formData, planned_end_time: e.target.value })}
                required
                className="w-full px-4 py-2 bg-white border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.category_id === 0}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
