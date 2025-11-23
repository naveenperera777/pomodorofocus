import { DailyStats } from '../types/session';

interface SuccessVisualizationProps {
  stats: DailyStats;
}

export const SuccessVisualization = ({ stats }: SuccessVisualizationProps) => {
  const totalSessions = stats.total_sessions || 0;
  const successfulSessions = stats.successful_sessions || 0;
  const unsuccessfulSessions = stats.unsuccessful_sessions || 0;
  
  const successRate = totalSessions > 0 
    ? (successfulSessions / totalSessions) * 100 
    : 0;
  
  const unsuccessRate = totalSessions > 0
    ? (unsuccessfulSessions / totalSessions) * 100
    : 0;

  // Create visual blocks for each session
  const sessionBlocks = Array.from({ length: Math.max(totalSessions, 1) }, (_, i) => {
    if (i < successfulSessions) return 'success';
    if (i < successfulSessions + unsuccessfulSessions) return 'unsuccessful';
    return 'pending';
  });

  // Calculate streak (consecutive successful sessions from end)
  let currentStreak = 0;
  for (let i = sessionBlocks.length - 1; i >= 0; i--) {
    if (sessionBlocks[i] === 'success') {
      currentStreak++;
    } else if (sessionBlocks[i] !== 'pending') {
      break;
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-secondary">
      <h3 className="text-xl font-bold text-text-primary mb-4">Session Success Rate</h3>
      
      {/* Success/Fail Overview */}
      {totalSessions > 0 ? (
        <>
          {/* Circular Progress */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              {/* Background circle */}
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  className="text-secondary"
                />
                {/* Unsuccessful sessions arc */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - (successRate + unsuccessRate) / 100)}
                  className="text-accent transition-all duration-1000"
                  strokeLinecap="round"
                />
                {/* Successful sessions arc */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - successRate / 100)}
                  className="text-primary transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-text-primary">{Math.round(successRate)}%</div>
                <div className="text-sm text-text-muted mt-1">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Session Blocks */}
          <div className="mb-6">
            <div className="text-sm text-text-muted mb-3">Sessions Today ({totalSessions})</div>
            <div className="flex flex-wrap gap-2">
              {sessionBlocks.map((status, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white transition-all ${
                    status === 'success' 
                      ? 'bg-primary shadow-lg shadow-primary/30' 
                      : status === 'unsuccessful'
                      ? 'bg-accent shadow-lg shadow-accent/30'
                      : 'bg-secondary border-2 border-dashed border-text-muted'
                  }`}
                  title={
                    status === 'success' 
                      ? 'Successful session' 
                      : status === 'unsuccessful'
                      ? 'Stopped session'
                      : 'Pending'
                  }
                >
                  {status === 'success' ? '✓' : status === 'unsuccessful' ? '✗' : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{successfulSessions}</div>
              <div className="text-xs text-text-muted mt-1">Completed</div>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-accent">{unsuccessfulSessions}</div>
              <div className="text-xs text-text-muted mt-1">Stopped</div>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{currentStreak}</div>
              <div className="text-xs text-text-muted mt-1">Current Streak</div>
            </div>
          </div>

          {/* Progress Bar Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Successful</span>
              <span className="text-primary font-semibold">{successfulSessions} ({Math.round(successRate)}%)</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${successRate}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Stopped</span>
              <span className="text-accent font-semibold">{unsuccessfulSessions} ({Math.round(unsuccessRate)}%)</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-500"
                style={{ width: `${unsuccessRate}%` }}
              />
            </div>
          </div>

          {/* Motivational Message */}
          {successRate === 100 && totalSessions > 0 && (
            <div className="mt-4 p-3 bg-primary/20 border border-primary/40 rounded-lg text-center">
              <span className="text-primary font-semibold">🎉 Perfect day! All sessions completed!</span>
            </div>
          )}
          {successRate >= 80 && successRate < 100 && totalSessions > 0 && (
            <div className="mt-4 p-3 bg-primary/20 border border-primary/40 rounded-lg text-center">
              <span className="text-primary font-semibold">💪 Great job! Keep up the momentum!</span>
            </div>
          )}
          {currentStreak >= 3 && (
            <div className="mt-4 p-3 bg-accent/20 border border-accent/40 rounded-lg text-center">
              <span className="text-accent font-semibold">🔥 {currentStreak} session streak!</span>
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
