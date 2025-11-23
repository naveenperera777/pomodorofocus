import { Session } from '../types/session';
import { format, parseISO, isSameDay } from 'date-fns';

interface DailyViewProps {
  sessions: Session[];
  selectedDate: Date;
}

export const DailyView = ({ sessions, selectedDate }: DailyViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-primary';
      case 'abandoned':
        return 'border-accent';
      case 'in_progress':
        return 'border-yellow-500';
      default:
        return 'border-text-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'abandoned':
        return 'Abandoned';
      case 'in_progress':
        return 'In Progress';
      default:
        return status;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '-';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  // Group sessions by task
  const sessionsByTask = sessions.reduce((acc, session) => {
    const taskId = session.task_id;
    if (!acc[taskId]) {
      acc[taskId] = [];
    }
    acc[taskId].push(session);
    return acc;
  }, {} as Record<number, Session[]>);

  const isToday = isSameDay(selectedDate, new Date());
  const dateTitle = isToday ? "Today's Sessions" : `Sessions for ${format(selectedDate, 'MMMM d, yyyy')}`;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-text-primary mb-6">{dateTitle}</h2>
      
      {sessions.length === 0 ? (
        <div className="text-center text-text-muted py-12">
          No sessions recorded today. Start your first focus session!
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(sessionsByTask).map(([taskId, taskSessions]) => {
            const task = taskSessions[0].task;
            const totalDuration = taskSessions
              .filter(s => s.actual_duration !== null)
              .reduce((sum, s) => sum + (s.actual_duration || 0), 0);

            return (
              <div key={taskId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Task Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {task?.category && (
                        <span 
                          className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                          style={{ 
                            backgroundColor: `${task.category.color}20`, 
                            color: task.category.color 
                          }}
                        >
                          {task.category.name}
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-text-primary">
                        {task?.name || 'Unnamed Task'}
                      </h3>
                    </div>
                    <div className="text-sm text-text-muted">
                      {task && (
                        <>
                          {task.planned_start_time.substring(0, 5)} - {task.planned_end_time.substring(0, 5)}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-text-muted">
                    {taskSessions.length} session{taskSessions.length !== 1 ? 's' : ''} • 
                    Total: {formatDuration(totalDuration)}
                  </div>
                </div>

                {/* Sessions List */}
                <div className="divide-y divide-gray-100">
                  {taskSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 border-l-4 ${getStatusColor(session.status)}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col">
                            <div className="text-base font-medium text-text-primary">
                              {formatDuration(session.actual_duration)}
                            </div>
                          </div>
                          <div className="text-text-muted text-sm">
                            {format(parseISO(session.start_time), 'h:mm a')}
                            {session.end_time && ` - ${format(parseISO(session.end_time), 'h:mm a')}`}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          session.status === 'completed' ? 'bg-primary/20 text-primary' :
                          session.status === 'abandoned' ? 'bg-accent/20 text-accent' :
                          'bg-yellow-500/20 text-yellow-600'
                        }`}>
                          {getStatusText(session.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
