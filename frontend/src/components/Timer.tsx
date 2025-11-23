import { useState, useEffect } from 'react';

interface TimerProps {
  duration: number;
  onComplete: () => void;
  onStop: () => void;
}

export const Timer = ({ duration, onComplete, onStop }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0) {
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
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  const handleStop = () => {
    setIsRunning(false);
    onStop();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
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
          onClick={handleStop}
          className="px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/80 transition shadow-lg"
        >
          Stop Session
        </button>
      </div>

      <div className="text-text-muted text-sm">
        {duration} minute focus session
      </div>
    </div>
  );
};
