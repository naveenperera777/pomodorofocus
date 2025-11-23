import { DailyStats } from '../types/session';

interface FocusTimeVisualProps {
  stats: DailyStats;
}

export const FocusTimeVisual = ({ stats }: FocusTimeVisualProps) => {
  const totalMinutesInDay = 24 * 60; // 1440 minutes
  const focusMinutes = Math.floor(stats.total_focus_time / 60); // Convert seconds to minutes
  const nonFocusMinutes = totalMinutesInDay - focusMinutes;
  const focusPercentage = (focusMinutes / totalMinutesInDay) * 100;
  
  // Convert minutes to hours and minutes for display
  const focusHours = Math.floor(focusMinutes / 60);
  const focusRemainingMinutes = focusMinutes % 60;
  
  const nonFocusHours = Math.floor(nonFocusMinutes / 60);
  const nonFocusRemainingMinutes = nonFocusMinutes % 60;

  // Calculate the circle properties
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const focusStrokeDashoffset = circumference * (1 - focusPercentage / 100);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-secondary">
      <h3 className="text-xl font-bold text-text-primary mb-6">Daily Focus Time</h3>
      
      {/* Circular Visualization */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-80 h-80">
          <svg className="transform -rotate-90 w-80 h-80">
            {/* Background circle (non-focused time) */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
              strokeWidth="24"
              fill="none"
              className="text-secondary"
            />
            {/* Focused time arc */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
              strokeWidth="24"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={focusStrokeDashoffset}
              className="text-primary transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-bold text-primary mb-2">
              {focusHours}h {focusRemainingMinutes}m
            </div>
            <div className="text-sm text-text-muted mb-1">Focus Time</div>
            <div className="text-3xl font-bold text-text-primary">
              {focusPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-text-muted mt-1">of 24 hours</div>
          </div>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm text-text-muted">Focused</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {focusHours}h {focusRemainingMinutes}m
          </div>
          <div className="text-xs text-text-muted mt-1">
            {focusMinutes} minutes
          </div>
        </div>

        <div className="bg-secondary border border-secondary rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-text-muted"></div>
            <span className="text-sm text-text-muted">Not Focused</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">
            {nonFocusHours}h {nonFocusRemainingMinutes}m
          </div>
          <div className="text-xs text-text-muted mt-1">
            {nonFocusMinutes} minutes
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-muted">Daily Progress</span>
          <span className="text-text-primary font-semibold">{focusPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-primary/70 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(focusPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Motivational Messages */}
      {focusPercentage >= 10 && (
        <div className="mt-4 p-3 bg-primary/20 border border-primary/40 rounded-lg text-center">
          <span className="text-primary font-semibold">
            {focusPercentage >= 20 ? '🔥 Excellent focus today!' : '💪 Great start! Keep going!'}
          </span>
        </div>
      )}
      {focusPercentage < 5 && focusMinutes > 0 && (
        <div className="mt-4 p-3 bg-primary/20 border border-primary/40 rounded-lg text-center">
          <span className="text-primary font-semibold">🎯 Every minute counts!</span>
        </div>
      )}
    </div>
  );
};
