import { Session, Task } from '../types/session';
import { format } from 'date-fns';

interface ProductivityProps {
  sessions: Session[];
  tasks: Task[];
  selectedDate: Date;
}

export const Productivity = ({ sessions, tasks, selectedDate }: ProductivityProps) => {
  // Calculate total planned time from tasks directly
  const calculatePlannedTime = () => {
    let totalMinutes = 0;
    
    tasks.forEach(task => {
      if (task.planned_start_time && task.planned_end_time) {
        const startParts = task.planned_start_time.split(':');
        const endParts = task.planned_end_time.split(':');
        
        if (startParts.length >= 2 && endParts.length >= 2) {
          const startHours = parseInt(startParts[0], 10);
          const startMinutes = parseInt(startParts[1], 10);
          const endHours = parseInt(endParts[0], 10);
          const endMinutes = parseInt(endParts[1], 10);
          
          const startMinutesTotal = startHours * 60 + startMinutes;
          const endMinutesTotal = endHours * 60 + endMinutes;
          const plannedMinutes = endMinutesTotal - startMinutesTotal;
          
          if (plannedMinutes > 0) {
            totalMinutes += plannedMinutes;
          }
        }
      }
    });
    
    console.log('Planned time calculation:', { tasks: tasks.length, totalMinutes });
    
    return totalMinutes;
  };

  // Calculate actual focus time from completed sessions
  const calculateActualTime = () => {
    let totalSeconds = 0;
    
    sessions.forEach(session => {
      if (session.status === 'completed' && session.actual_duration) {
        totalSeconds += session.actual_duration;
      }
    });
    
    return Math.floor(totalSeconds / 60); // Convert to minutes
  };

  const plannedMinutes = calculatePlannedTime();
  const actualMinutes = calculateActualTime();
  
  const plannedHours = Math.floor(plannedMinutes / 60);
  const plannedMins = plannedMinutes % 60;
  
  const actualHours = Math.floor(actualMinutes / 60);
  const actualMins = actualMinutes % 60;
  
  const productivityRate = plannedMinutes > 0 
    ? Math.round((actualMinutes / plannedMinutes) * 100) 
    : 0;

  return (
    <div className="bg-background rounded-lg shadow-md p-6 border border-secondary">
      <h3 className="text-xl font-semibold text-text-primary mb-4">
        Productivity - {format(selectedDate, 'MMM dd, yyyy')}
      </h3>
      
      <div className="space-y-4">
        {/* Planned Time */}
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-tertiary">
          <div>
            <p className="text-sm text-text-muted mb-1">Total Planned Time</p>
            <p className="text-2xl font-bold text-primary">
              {plannedHours}h {plannedMins}m
            </p>
          </div>
          <div className="text-primary">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        {/* Actual Focus Time */}
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-tertiary">
          <div>
            <p className="text-sm text-text-muted mb-1">Actual Focus Time</p>
            <p className="text-2xl font-bold text-sage">
              {actualHours}h {actualMins}m
            </p>
          </div>
          <div className="text-sage">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Productivity Rate */}
        <div className="p-4 bg-secondary rounded-lg border border-tertiary">
          <p className="text-sm text-text-muted mb-2">Productivity Rate</p>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="w-full bg-tertiary rounded-full h-3">
                <div 
                  className="bg-accent h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(productivityRate, 100)}%` }}
                ></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-accent ml-4">
              {productivityRate}%
            </span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            {productivityRate >= 100 ? '🎉 Exceeded your plan!' : 
             productivityRate >= 80 ? '💪 Great productivity!' : 
             productivityRate >= 50 ? '👍 Good progress!' : 
             '⚡ Keep going!'}
          </p>
        </div>
      </div>
    </div>
  );
};
