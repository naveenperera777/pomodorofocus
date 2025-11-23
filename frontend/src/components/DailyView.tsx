import { Session } from '../types/session';
import { format, parseISO, isSameDay } from 'date-fns';

interface DailyViewProps {
  sessions: Session[];
  selectedDate: Date;
}

export const DailyView = ({ sessions, selectedDate }: DailyViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'border-success';
      case 'unsuccessful':
        return 'border-accent';
      case 'in_progress':
        return 'border-yellow-500';
      default:
        return 'border-text-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'successful':
        return 'Completed';
      case 'unsuccessful':
        return 'Stopped';
      case 'in_progress':
        return 'In Progress';
      default:
        return status;
    }
  };

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
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-lg border-l-4 ${getStatusColor(session.status)} bg-white shadow-sm`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <div className="text-lg font-semibold text-text-primary">
                      {session.actual_duration !== null && session.status !== 'in_progress'
                        ? `${session.actual_duration} min`
                        : `${session.duration} min`}
                    </div>
                    {session.actual_duration !== null && session.actual_duration !== session.duration && session.status !== 'in_progress' && (
                      <div className="text-xs text-text-muted">
                        Planned: {session.duration} min
                      </div>
                    )}
                  </div>
                  <div className="text-text-muted">
                    {format(parseISO(session.start_time), 'h:mm a')}
                    {session.end_time && ` - ${format(parseISO(session.end_time), 'h:mm a')}`}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  session.status === 'successful' ? 'bg-primary/20 text-primary' :
                  session.status === 'unsuccessful' ? 'bg-accent/20 text-accent' :
                  'bg-yellow-500/20 text-yellow-600'
                }`}>
                  {getStatusText(session.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
