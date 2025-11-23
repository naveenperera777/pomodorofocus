import { useState, useEffect, useRef } from 'react';
import { Session } from '../types/session';

interface TimerProps {
  session: Session;
  onComplete: () => void;
  onAbandon: () => void;
}

export const Timer = ({ session, onComplete, onAbandon }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const hasCompleted = useRef(false);

  useEffect(() => {
    // Calculate total duration and time left from session timestamps
    const startTime = new Date(session.start_time).getTime();
    
    // Get planned end time from task or estimate from start time
    let endTime: number;
    if (session.task) {
      // Combine task date with planned_end_time
      const taskDate = session.task.date;
      const endTimeStr = session.task.planned_end_time;
      endTime = new Date(`${taskDate}T${endTimeStr}`).getTime();
    } else {
      // Fallback: assume 25 minute session
      endTime = startTime + (25 * 60 * 1000);
    }
    
    const now = Date.now();
    
    const total = Math.floor((endTime - startTime) / 1000); // in seconds
    const remaining = Math.floor((endTime - now) / 1000);
    
    setTotalDuration(total);
    setTimeLeft(Math.max(0, remaining));
  }, [session]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && !hasCompleted.current) {
        hasCompleted.current = true;
        onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = totalDuration > 0 
    ? ((totalDuration - timeLeft) / totalDuration) * 100 
    : 0;

  const handleComplete = () => {
    if (!hasCompleted.current) {
      hasCompleted.current = true;
      setIsRunning(false);
      onComplete();
    }
  };

  const handleAbandon = () => {
    if (confirm('Are you sure you want to abandon this session?')) {
      setIsRunning(false);
      onAbandon();
    }
  };

  const durationMinutes = Math.round(totalDuration / 60);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-text-primary mb-1">
          {session.task?.name || 'Focus Session'}
        </h3>
        {session.task?.category && (
          <span 
            className="inline-block px-3 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: `${session.task.category.color}20`, 
              color: session.task.category.color 
            }}
          >
            {session.task.category.name}
          </span>
        )}
      </div>

      <div className="relative w-64 h-64">
        <svg className="transform -rotate-90 w-64 h-64">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-secondary"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            className="text-primary transition-all duration-1000"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl font-bold text-text-primary">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleComplete}
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition shadow-lg"
        >
          Complete Session
        </button>
        <button
          onClick={handleAbandon}
          className="px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/80 transition shadow-lg"
        >
          Abandon
        </button>
      </div>

      <div className="text-text-muted text-sm">
        {durationMinutes} minute focus session
      </div>
    </div>
  );
};
