import { DailyStats } from '../types/session';

interface SuccessVisualizationProps {
  stats: DailyStats;
}

export const SuccessVisualization = ({ stats }: SuccessVisualizationProps) => {
  // Calculate totals from category stats
  const totalSessions = stats.category_stats.reduce((sum, cat) => sum + cat.session_count, 0);
  const totalTasks = stats.category_stats.reduce((sum, cat) => sum + cat.task_count, 0);
  
  // Find most productive category
  const mostProductiveCategory = stats.category_stats.length > 0
    ? stats.category_stats.reduce((prev, current) => 
        prev.total_focus_time > current.total_focus_time ? prev : current
      )
    : null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.floor((seconds / 60) % 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-secondary">
      <h3 className="text-xl font-bold text-text-primary mb-4">Daily Overview</h3>
      
      {totalSessions > 0 ? (
        <>
          {/* Category Distribution */}
          <div className="mb-6">
            <div className="text-sm text-text-muted mb-3">Focus Distribution by Category</div>
            <div className="space-y-2">
              {stats.category_stats.map((categoryStat) => {
                const percentage = stats.total_focus_time > 0
                  ? (categoryStat.total_focus_time / stats.total_focus_time) * 100
                  : 0;
                
                return (
                  <div key={categoryStat.category_id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-text-primary">
                        {categoryStat.category_name}
                      </span>
                      <span className="text-text-muted">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: categoryStat.category_color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 p-4 rounded-lg">
              <div className="text-text-muted text-xs mb-1">Total Sessions</div>
              <div className="text-2xl font-bold text-text-primary">{totalSessions}</div>
            </div>

            <div className="bg-secondary/50 p-4 rounded-lg">
              <div className="text-text-muted text-xs mb-1">Total Tasks</div>
              <div className="text-2xl font-bold text-text-primary">{totalTasks}</div>
            </div>
          </div>

          {/* Most Productive Category */}
          {mostProductiveCategory && (
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
              <div className="text-sm text-text-muted mb-1">Most Productive Category</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: mostProductiveCategory.category_color }}
                  />
                  <span className="font-semibold text-text-primary text-lg">
                    {mostProductiveCategory.category_name}
                  </span>
                </div>
                <span className="text-primary font-bold text-lg">
                  {formatDuration(mostProductiveCategory.total_focus_time)}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <div className="text-text-muted">No sessions yet today</div>
          <div className="text-sm text-text-muted mt-2">Start your first focus session!</div>
        </div>
      )}
    </div>
  );
};
