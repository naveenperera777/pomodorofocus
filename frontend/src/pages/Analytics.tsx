import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import { sessionApi } from '../api/session.api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DateRangeStat {
  date: string;
  total_sessions: number;
  successful_sessions: number;
  focus_minutes: number;
}

export default function Analytics() {
  const [stats, setStats] = useState<DateRangeStat[]>([]);
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

  const totalFocusMinutes = stats.reduce((sum, day) => sum + (day.focus_minutes || 0), 0);
  const totalSessions = stats.reduce((sum, day) => sum + day.total_sessions, 0);
  const totalSuccessful = stats.reduce((sum, day) => sum + day.successful_sessions, 0);
  const avgFocusPerDay = stats.length > 0 ? Math.round(totalFocusMinutes / stats.length) : 0;

  const chartData = stats.map(stat => ({
    date: format(new Date(stat.date), 'MMM dd'),
    minutes: stat.focus_minutes || 0
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary">
                <div className="text-sm text-text-muted mb-1">Total Focus Time</div>
                <div className="text-3xl font-bold text-primary">
                  {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
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

              <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary">
                <div className="text-sm text-text-muted mb-1">Success Rate</div>
                <div className="text-3xl font-bold text-primary">
                  {totalSessions > 0 ? Math.round((totalSuccessful / totalSessions) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary">
              <h2 className="text-xl font-semibold text-text-primary mb-6">Focus Minutes Trend</h2>
              
              {stats.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  No data available for this period. Start some sessions to see your progress!
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E5D4" />
                    <XAxis 
                      dataKey="date" 
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
                    <Line 
                      type="monotone" 
                      dataKey="minutes" 
                      stroke="#A8B8A5" 
                      strokeWidth={3}
                      dot={{ fill: '#A8B8A5', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Insights */}
            {stats.length > 0 && (
              <div className="mt-8 bg-gradient-to-r from-primary/10 to-secondary rounded-xl p-6 border border-primary/20">
                <h3 className="text-lg font-semibold text-text-primary mb-2">📈 Insights</h3>
                <ul className="space-y-2 text-text-primary">
                  {avgFocusPerDay >= 60 && (
                    <li>• Amazing! You're averaging over an hour of focused work per day! 🎉</li>
                  )}
                  {avgFocusPerDay >= 30 && avgFocusPerDay < 60 && (
                    <li>• Great progress! You're building a solid focus habit. Keep it up! 💪</li>
                  )}
                  {totalSuccessful / totalSessions >= 0.8 && totalSessions >= 5 && (
                    <li>• Excellent success rate! You're staying committed to your sessions. 🌟</li>
                  )}
                  {stats.filter(s => s.focus_minutes > 0).length >= period - 2 && (
                    <li>• Fantastic consistency! You've been active almost every day. 🔥</li>
                  )}
                  {avgFocusPerDay < 30 && totalSessions > 0 && (
                    <li>• Try to aim for at least 30 minutes per day to build stronger focus habits. 🎯</li>
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
