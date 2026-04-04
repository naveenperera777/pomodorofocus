import { useEffect, useState, useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { sessionApi } from '../api/session.api';
import { DateRangeStat } from '../types/session';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';

type ChartType = 'bar' | 'line';

export default function Analytics() {
  const [stats, setStats] = useState<DateRangeStat[]>([]);
  const [period, setPeriod] = useState<7 | 14 | 30 | 60>(7);
  const [loading, setLoading] = useState(true);
  const [dailyChartType, setDailyChartType] = useState<ChartType>('bar');
  const [showPlanned, setShowPlanned] = useState(true);
  const [showActual, setShowActual] = useState(true);

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

  // PostgreSQL returns COUNT/SUM as strings, so ensure proper number parsing
  const totalFocusTime = stats.reduce((sum, cat) => sum + Number(cat.total_focus_time), 0);
  const totalSessions = stats.reduce((sum, cat) => sum + Number(cat.session_count), 0);
  const totalTasks = stats.reduce((sum, cat) => sum + Number(cat.task_count), 0);
  const avgFocusPerDay = stats.length > 0 ? Math.round(totalFocusTime / period / 60) : 0;

  // Aggregate stats by category (since raw data is grouped by date + category)
  const aggregatedByCategory = useMemo(() => {
    const categoryMap = new Map<number, {
      category_id: number;
      category_name: string;
      category_color: string;
      total_focus_time: number;
      task_count: number;
      session_count: number;
    }>();

    stats.forEach(stat => {
      const existing = categoryMap.get(stat.category_id);
      if (existing) {
        existing.total_focus_time += Number(stat.total_focus_time);
        existing.task_count += Number(stat.task_count);
        existing.session_count += Number(stat.session_count);
      } else {
        categoryMap.set(stat.category_id, {
          category_id: stat.category_id,
          category_name: stat.category_name,
          category_color: stat.category_color,
          total_focus_time: Number(stat.total_focus_time),
          task_count: Number(stat.task_count),
          session_count: Number(stat.session_count),
        });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.total_focus_time - a.total_focus_time);
  }, [stats]);

  // Aggregate stats by day for the daily chart
  const dailyChartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, period - 1);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Create a map of date -> aggregated stats
    const dateMap = new Map<string, { actual: number; planned: number }>();
    
    stats.forEach(stat => {
      // Handle date that might come as Date object or ISO string from PostgreSQL
      const rawDate = stat.date;
      const dateKey = typeof rawDate === 'string' 
        ? rawDate.substring(0, 10) // Get YYYY-MM-DD from ISO string
        : format(new Date(rawDate), 'yyyy-MM-dd');
      
      const existing = dateMap.get(dateKey);
      if (existing) {
        existing.actual += Number(stat.total_focus_time);
        existing.planned += Number(stat.planned_focus_time || 0);
      } else {
        dateMap.set(dateKey, {
          actual: Number(stat.total_focus_time),
          planned: Number(stat.planned_focus_time || 0),
        });
      }
    });
    
    // Create chart data for all days in the period
    return allDays.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const data = dateMap.get(dateKey) || { actual: 0, planned: 0 };
      return {
        date: format(day, period <= 14 ? 'MMM dd' : 'MM/dd'),
        fullDate: dateKey,
        'Actual Focus': Math.round(data.actual / 60), // Convert to minutes
        'Planned Focus': Math.round(data.planned / 60), // Convert to minutes
      };
    });
  }, [stats, period]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const chartData = aggregatedByCategory.map(stat => ({
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
          {[7, 14, 30, 60].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days as 7 | 14 | 30 | 60)}
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

            {/* Daily Focus Time Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">Daily Focus Time</h2>
                <div className="flex items-center gap-4">
                  {/* Data visibility toggles */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPlanned(!showPlanned)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        showPlanned
                          ? 'bg-[#D4B896] text-white'
                          : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${showPlanned ? 'bg-white' : 'bg-[#D4B896]'}`} />
                      Planned
                    </button>
                    <button
                      onClick={() => setShowActual(!showActual)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        showActual
                          ? 'bg-[#A8B8A5] text-white'
                          : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${showActual ? 'bg-white' : 'bg-[#A8B8A5]'}`} />
                      Actual
                    </button>
                  </div>
                  {/* Chart type toggle */}
                  <div className="flex gap-2 border-l border-gray-200 pl-4">
                    <button
                      onClick={() => setDailyChartType('bar')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        dailyChartType === 'bar'
                          ? 'bg-primary text-background-dark'
                          : 'bg-secondary text-text-primary hover:bg-tertiary'
                      }`}
                    >
                      Bar
                    </button>
                    <button
                      onClick={() => setDailyChartType('line')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        dailyChartType === 'line'
                          ? 'bg-primary text-background-dark'
                          : 'bg-secondary text-text-primary hover:bg-tertiary'
                      }`}
                    >
                      Line
                    </button>
                  </div>
                </div>
              </div>
              
              {dailyChartData.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  No data available for this period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  {dailyChartType === 'bar' ? (
                    <BarChart data={dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E5D4" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#8C8E8A"
                        style={{ fontSize: '11px' }}
                        angle={period > 14 ? -45 : 0}
                        textAnchor={period > 14 ? 'end' : 'middle'}
                        height={period > 14 ? 60 : 30}
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
                        formatter={(value: number, name: string) => [`${value}m`, name]}
                      />
                      <Legend />
                      {showPlanned && (
                        <Bar 
                          dataKey="Planned Focus" 
                          fill="#D4B896"
                          radius={[4, 4, 0, 0]}
                        />
                      )}
                      {showActual && (
                        <Bar 
                          dataKey="Actual Focus" 
                          fill="#A8B8A5"
                          radius={[4, 4, 0, 0]}
                        />
                      )}
                    </BarChart>
                  ) : (
                    <LineChart data={dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E5D4" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#8C8E8A"
                        style={{ fontSize: '11px' }}
                        angle={period > 14 ? -45 : 0}
                        textAnchor={period > 14 ? 'end' : 'middle'}
                        height={period > 14 ? 60 : 30}
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
                        formatter={(value: number, name: string) => [`${value}m`, name]}
                      />
                      <Legend />
                      {showPlanned && (
                        <Line 
                          type="monotone"
                          dataKey="Planned Focus" 
                          stroke="#D4B896"
                          strokeWidth={2}
                          dot={{ fill: '#D4B896', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      )}
                      {showActual && (
                        <Line 
                          type="monotone"
                          dataKey="Actual Focus" 
                          stroke="#A8B8A5"
                          strokeWidth={2}
                          dot={{ fill: '#A8B8A5', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      )}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>

            {/* Category Breakdown Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-secondary mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-6">Focus Time by Category</h2>
              
              {aggregatedByCategory.length === 0 ? (
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
                    {aggregatedByCategory.map((stat) => (
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
                            {totalFocusTime > 0 ? Math.round((stat.total_focus_time / totalFocusTime) * 100) : 0}% of total
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Insights */}
            {aggregatedByCategory.length > 0 && (
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
                  {aggregatedByCategory.length > 1 && (
                    <li>• You're diversifying your focus across {aggregatedByCategory.length} different categories! 🌈</li>
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
