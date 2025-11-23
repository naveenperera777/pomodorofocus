import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import { sessionApi } from '../api/session.api';
import { CategoryStats } from '../types/session';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function Analytics() {
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [period, setPeriod] = useState<7 | 14 | 30>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), period - 1), 'yyyy-MM-dd');
      const data = await sessionApi.getDateRangeStats(startDate, endDate);
      setStats(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalFocusTime = stats.reduce((sum, cat) => sum + cat.total_focus_time, 0);
  const totalSessions = stats.reduce((sum, cat) => sum + cat.session_count, 0);
  const totalTasks = stats.reduce((sum, cat) => sum + cat.task_count, 0);
  const avgFocusPerDay = stats.length > 0 ? Math.round(totalFocusTime / period / 60) : 0;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const chartData = stats.map(stat => ({
    category: stat.category_name,
    minutes: Math.round(stat.total_focus_time / 60),
    sessions: stat.session_count,
    color: stat.category_color
  }));

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-6">📊 Analytics</h1>

        {/* Period Selector */}
        <div className="flex gap-3 mb-8">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days as 7 | 14 | 30)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors shadow-sm ${
                period === days
                  ? 'bg-primary text-background-dark'
                  : 'bg-white text-text-primary hover:bg-secondary border border-secondary'
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-text-muted">Loading analytics...</div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary">
                <div className="text-sm text-text-muted mb-1">Total Focus Time</div>
                <div className="text-3xl font-bold text-primary">
                  {formatDuration(totalFocusTime)}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary">
                <div className="text-sm text-text-muted mb-1">Avg per Day</div>
                <div className="text-3xl font-bold text-text-primary">{avgFocusPerDay}m</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary">
                <div className="text-sm text-text-muted mb-1">Total Sessions</div>
                <div className="text-3xl font-bold text-text-primary">{totalSessions}</div>
              </div>
            </div>

            {/* Category Breakdown Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-6">Focus Time by Category</h2>
              
              {stats.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  No data available for this period. Start some sessions to see your progress!
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E5D4" />
                      <XAxis 
                        dataKey="category" 
                        stroke="#8C8E8A"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#8C8E8A"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FAF9F7', 
                          border: '1px solid #E0E5D4',
                          borderRadius: '8px',
                          color: '#2F302F'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="minutes" 
                        fill="#A8B8A5"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar 
                        dataKey="sessions" 
                        fill="#C27C4A"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Category Details */}
                  <div className="mt-6 space-y-3">
                    {stats.map((stat) => (
                      <div 
                        key={stat.category_id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: stat.category_color }}
                          />
                          <div>
                            <div className="font-medium text-text-primary">
                              {stat.category_name}
                            </div>
                            <div className="text-xs text-text-muted">
                              {stat.task_count} task{stat.task_count !== 1 ? 's' : ''} • 
                              {' '}{stat.session_count} session{stat.session_count !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">
                            {formatDuration(stat.total_focus_time)}
                          </div>
                          <div className="text-xs text-text-muted">
                            {Math.round((stat.total_focus_time / totalFocusTime) * 100)}% of total
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Insights */}
            {stats.length > 0 && (
              <div className="bg-gradient-to-r from-primary/10 to-secondary rounded-xl p-6 border border-primary/20">
                <h3 className="text-lg font-semibold text-text-primary mb-2">📈 Insights</h3>
                <ul className="space-y-2 text-text-primary">
                  {avgFocusPerDay >= 60 && (
                    <li>• Amazing! You're averaging over an hour of focused work per day! 🎉</li>
                  )}
                  {avgFocusPerDay >= 30 && avgFocusPerDay < 60 && (
                    <li>• Great progress! You're building a solid focus habit. Keep it up! 💪</li>
                  )}
                  {totalSessions >= 20 && (
                    <li>• Excellent commitment! You've completed {totalSessions} sessions in {period} days. 🌟</li>
                  )}
                  {totalTasks >= 10 && (
                    <li>• Fantastic productivity! You've worked on {totalTasks} different tasks. 🎯</li>
                  )}
                  {avgFocusPerDay < 30 && totalSessions > 0 && (
                    <li>• Try to aim for at least 30 minutes per day to build stronger focus habits. 🎯</li>
                  )}
                  {stats.length > 1 && (
                    <li>• You're diversifying your focus across {stats.length} different categories! 🌈</li>
                  )}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
