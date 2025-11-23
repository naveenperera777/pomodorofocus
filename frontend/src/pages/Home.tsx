import { useState, useEffect } from 'react';
import { SessionSelector } from '../components/SessionSelector';
import { Timer } from '../components/Timer';
import { DailyView } from '../components/DailyView';
import { Stats } from '../components/Stats';
import { sessionApi } from '../api/session.api';
import { useSessionStore } from '../store/sessionStore';
import { format } from 'date-fns';

export const Home = () => {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const today = new Date();
  const { currentSession, sessions, stats, addSession, updateSession, setSessions, setStats } = useSessionStore();

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const todayStr = format(today, 'yyyy-MM-dd');
      const [sessionsData, statsData] = await Promise.all([
        sessionApi.getSessionsByDate(todayStr),
        sessionApi.getDailyStats(todayStr)
      ]);
      setSessions(sessionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading today data:', error);
    }
  };

  const handleStartSession = async (duration: number) => {
    try {
      const session = await sessionApi.createSession({ duration });
      addSession(session);
      setSelectedDuration(duration);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleCompleteSession = async () => {
    if (!currentSession) return;
    try {
      const updated = await sessionApi.completeSession(currentSession.id, { status: 'successful' });
      updateSession(updated);
      setSelectedDuration(null);
      loadTodayData();
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const handleStopSession = async () => {
    if (!currentSession) return;
    try {
      const updated = await sessionApi.completeSession(currentSession.id, { status: 'unsuccessful' });
      updateSession(updated);
      setSelectedDuration(null);
      loadTodayData();
    } catch (error) {
      console.error('Error stopping session:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome Back!</h1>
          <p className="text-text-muted">Start a focus session and track your progress</p>
        </div>

        {/* Timer or Session Selector */}
        <div className="mb-8">
          {selectedDuration && currentSession ? (
            <Timer
              duration={selectedDuration}
              onComplete={handleCompleteSession}
              onStop={handleStopSession}
            />
          ) : (
            <SessionSelector
              onSelectDuration={handleStartSession}
              disabled={currentSession?.status === 'in_progress'}
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
      </div>
    </div>
  );
};
