import { DailyStats } from '../types/session';
import { format, isSameDay } from 'date-fns';
import { FocusTimeVisual } from './FocusTimeVisual';

interface StatsProps {
  stats: DailyStats | null;
  selectedDate: Date;
}

export const Stats = ({ stats, selectedDate }: StatsProps) => {
  if (!stats) return null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isToday = isSameDay(selectedDate, new Date());
  const statsTitle = isToday ? "Today's Statistics" : `Statistics for ${format(selectedDate, 'MMM d, yyyy')}`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-secondary">
        <h2 className="text-2xl font-bold text-text-primary mb-6">{statsTitle}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-secondary/50 p-4 rounded-lg">
            <div className="text-text-muted text-xs mb-1">Total Focus Time</div>
            <div className="text-3xl font-bold text-primary">
              {formatDuration(stats.total_focus_time)}
            </div>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg">
            <div className="text-text-muted text-xs mb-1">Categories</div>
            <div className="text-3xl font-bold text-text-primary">
              {stats.category_stats.length}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {stats.category_stats.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {stats.category_stats.map((categoryStat) => (
                <div 
                  key={categoryStat.category_id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoryStat.category_color }}
                    />
                    <div>
                      <div className="font-medium text-text-primary">
                        {categoryStat.category_name}
                      </div>
                      <div className="text-xs text-text-muted">
                        {categoryStat.task_count} task{categoryStat.task_count !== 1 ? 's' : ''} • 
                        {' '}{categoryStat.session_count} session{categoryStat.session_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">
                      {formatDuration(categoryStat.total_focus_time)}
                    </div>
                    <div className="text-xs text-text-muted">
                      {Math.round((categoryStat.total_focus_time / stats.total_focus_time) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <FocusTimeVisual stats={stats} />
    </div>
  );
};
