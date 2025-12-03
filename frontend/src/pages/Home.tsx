import { useState, useEffect } from 'react';
import { SessionSelector } from '../components/SessionSelector';
import { Timer } from '../components/Timer';
import { DailyView } from '../components/DailyView';
import { Stats } from '../components/Stats';
import { TaskForm } from '../components/TaskForm';
import { ActiveTask } from '../components/ActiveTask';
import { sessionApi, taskApi, categoryApi } from '../api/session.api';
import { useSessionStore } from '../store/sessionStore';
import { format } from 'date-fns';

export const Home = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const { 
    currentSession, 
    sessions, 
    stats, 
    activeTask,
    categories,
    addSession, 
    updateSession, 
    setSessions, 
    setStats,
    setActiveTask,
    setCategories,
    setCurrentSession
  } = useSessionStore();

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const todayStr = format(today, 'yyyy-MM-dd');
      const [sessionsData, statsData, activeTaskData, categoriesData, inProgressSession] = await Promise.all([
        sessionApi.getSessionsByDate(todayStr),
        sessionApi.getDailyStats(todayStr),
        taskApi.getActiveTask(),
        categories.length > 0 ? Promise.resolve(categories) : categoryApi.getAllCategories(),
        sessionApi.getInProgressSession()
      ]);
      
      setSessions(sessionsData);
      setStats(statsData);
      setActiveTask(activeTaskData);
      if (categories.length === 0) setCategories(categoriesData);
      setCurrentSession(inProgressSession);
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (duration?: number) => {
    if (!activeTask) {
      alert('No active task found! Please create a task first.');
      return;
    }
    
    try {
      // If duration is provided, update the task's planned_end_time first
      if (duration) {
        const now = new Date();
        const endTime = new Date(now.getTime() + duration * 60 * 1000);
        const endTimeStr = endTime.toTimeString().slice(0, 8); // HH:MM:SS format
        
        // Update the task with new end time
        await taskApi.updateTask(activeTask.id, {
          category_id: activeTask.category_id,
          name: activeTask.name || 'Untitled',
          date: activeTask.date,
          planned_start_time: activeTask.planned_start_time,
          planned_end_time: endTimeStr
        });
        
        // Refresh active task
        const updatedTask = await taskApi.getActiveTask();
        setActiveTask(updatedTask);
      }
      
      const session = await sessionApi.createSession(activeTask.id);
      addSession(session);
      setCurrentSession(session);
    } catch (error: any) {
      console.error('Error starting session:', error);
      alert(error.response?.data?.error || 'Failed to start session');
    }
  };

  const handleStartQuickFocus = async () => {
    try {
      const { session, task } = await sessionApi.createQuickFocusSession();
      addSession(session);
      setCurrentSession(session);
      setActiveTask(task);
    } catch (error: any) {
      console.error('Error starting Quick Focus:', error);
      alert(error.response?.data?.error || 'Failed to start Quick Focus');
    }
  };

  const handleCompleteSession = async () => {
    if (!currentSession) return;
    try {
      const updated = await sessionApi.endSession(currentSession.id, 'completed');
      updateSession(updated);
      setCurrentSession(null);
      loadTodayData();
    } catch (error: any) {
      console.error('Error completing session:', error);
      alert(error.response?.data?.error || 'Failed to complete session');
    }
  };

  const handleAbandonSession = async () => {
    if (!currentSession) return;
    if (!confirm('Are you sure you want to abandon this session?')) return;
    
    try {
      const updated = await sessionApi.endSession(currentSession.id, 'abandoned');
      updateSession(updated);
      setCurrentSession(null);
      loadTodayData();
    } catch (error: any) {
      console.error('Error abandoning session:', error);
      alert(error.response?.data?.error || 'Failed to abandon session');
    }
  };

  const handleTaskCreated = () => {
    console.log('Task created, reloading data...');
    setShowTaskForm(false);
    loadTodayData();
  };

  const handleTaskCompleted = () => {
    loadTodayData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome Back!</h1>
          <p className="text-text-muted">Plan your day and track your focus sessions</p>
        </div>

        {/* Active Task Display */}
        {activeTask && !currentSession && (
          <div className="mb-8">
            <ActiveTask task={activeTask} onTaskCompleted={handleTaskCompleted} />
          </div>
        )}

        {/* Timer or Session Selector */}
        <div className="mb-8">
          {currentSession ? (
            <Timer
              session={currentSession}
              onComplete={handleCompleteSession}
              onAbandon={handleAbandonSession}
            />
          ) : (
            <SessionSelector
              activeTask={activeTask}
              onStartSession={handleStartSession}
              onStartQuickFocus={handleStartQuickFocus}
              onCreateTask={() => setShowTaskForm(true)}
              disabled={false}
            />
          )}
        </div>

        {/* Today's Stats */}
        <div className="mb-8">
          <Stats stats={stats} selectedDate={today} />
        </div>

        {/* Today's Sessions */}
        <div>
          <DailyView sessions={sessions} selectedDate={today} />
        </div>

        {/* Task Form Modal */}
        {showTaskForm && (
          <TaskForm
            onClose={() => setShowTaskForm(false)}
            onTaskCreated={handleTaskCreated}
          />
        )}
      </div>
    </div>
  );
};
