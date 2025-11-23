import { DailyStats } from '../types/session';
import { format, isSameDay } from 'date-fns';
import { FocusTimeVisual } from './FocusTimeVisual';

interface StatsProps {
  stats: DailyStats | null;
  selectedDate: Date;
}

export const Stats = ({ stats, selectedDate }: StatsProps) => {
  if (!stats) return null;

  const successRate = stats.total_sessions > 0
    ? Math.round((stats.successful_sessions / stats.total_sessions) * 100)
    : 0;

  const isToday = isSameDay(selectedDate, new Date());
  const statsTitle = isToday ? "Today's Statistics" : `Statistics for ${format(selectedDate, 'MMM d, yyyy')}`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-secondary">
        <h2 className="text-2xl font-bold text-text-primary mb-6">{statsTitle}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-secondary/50 p-4 rounded-lg">
            <div className="text-text-muted text-xs mb-1">Total Sessions</div>
            <div className="text-2xl font-bold text-text-primary">{stats.total_sessions}</div>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg">
            <div className="text-text-muted text-xs mb-1">Successful</div>
            <div className="text-2xl font-bold text-primary">{stats.successful_sessions}</div>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg">
            <div className="text-text-muted text-xs mb-1">Success Rate</div>
            <div className="text-2xl font-bold text-text-primary">{successRate}%</div>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg">
            <div className="text-text-muted text-xs mb-1">Focus Time</div>
            <div className="text-2xl font-bold text-primary">
              {stats.total_focus_time || 0} min
            </div>
          </div>
        </div>
      </div>

      <FocusTimeVisual stats={stats} />
    </div>
  );
};
