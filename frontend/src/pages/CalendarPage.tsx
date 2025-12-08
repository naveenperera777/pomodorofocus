import { useState, useEffect } from 'react';
import { Calendar } from '../components/Calendar';
import { Stats } from '../components/Stats';
import { SuccessVisualization } from '../components/SuccessVisualization';
import { DailyView } from '../components/DailyView';
import { Productivity } from '../components/Productivity';
import { sessionApi, taskApi } from '../api/session.api';
import { useSessionStore } from '../store/sessionStore';
import { Task } from '../types/session';
import { format } from 'date-fns';

export const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sessionsCountMap, setSessionsCountMap] = useState<Record<string, number>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const { sessions, stats, setSessions, setStats } = useSessionStore();

  useEffect(() => {
    loadDateData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    loadMonthSessionCounts(selectedDate);
  }, [selectedDate]);

  const loadDateData = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const [sessionsData, statsData, tasksData] = await Promise.all([
        sessionApi.getSessionsByDate(dateStr),
        sessionApi.getDailyStats(dateStr),
        taskApi.getTasksByDate(dateStr)
      ]);
      setSessions(sessionsData);
      setStats(statsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading date data:', error);
    }
  };

  const loadMonthSessionCounts = async (_date: Date) => {
    try {
      // Load sessions for the entire month to show indicators on calendar
      // We'll need to fetch day by day or add a new API endpoint
      // For now, let's just load the current month's data
      const counts: Record<string, number> = {};
      
      // You could optimize this by adding a new API endpoint that returns session counts per day
      // For now, this will work but could be improved
      setSessionsCountMap(counts);
    } catch (error) {
      console.error('Error loading month data:', error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Calendar View</h1>
          <p className="text-text-muted">Navigate through dates and view your focus history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Calendar */}
          <div>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              sessionsData={sessionsCountMap}
            />
          </div>

          {/* Stats and Visualizations */}
          <div className="space-y-6">
            <Productivity sessions={sessions} tasks={tasks} selectedDate={selectedDate} />
            <Stats stats={stats} selectedDate={selectedDate} />
            {stats && <SuccessVisualization stats={stats} />}
          </div>
        </div>

        {/* Daily Sessions */}
        <div>
          <DailyView sessions={sessions} selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
};
