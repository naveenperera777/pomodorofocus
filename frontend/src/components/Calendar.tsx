import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  sessionsData?: Record<string, number>; // date string -> session count
}

export const Calendar = ({ selectedDate, onDateSelect, sessionsData = {} }: CalendarProps) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const handlePrevMonth = () => {
    onDateSelect(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    onDateSelect(addMonths(selectedDate, 1));
  };

  const handleToday = () => {
    onDateSelect(new Date());
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEEEEE'; // Short day names (Mo, Tu, etc.)
    let day = startDate;

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-text-muted text-sm font-semibold py-2">
          {format(day, dateFormat)}
        </div>
      );
      day = addDays(day, 1);
    }

    return <div className="grid grid-cols-7 gap-1">{days}</div>;
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dateKey = format(day, 'yyyy-MM-dd');
        const sessionCount = sessionsData[dateKey] || 0;
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <button
            key={day.toString()}
            onClick={() => onDateSelect(cloneDay)}
            className={`
              relative p-2 h-14 rounded-lg transition-all
              ${isSelected ? 'bg-primary text-background-dark font-bold' : ''}
              ${!isSelected && isToday ? 'border-2 border-primary text-text-primary' : ''}
              ${!isSelected && !isToday && isCurrentMonth ? 'text-text-primary hover:bg-secondary' : ''}
              ${!isCurrentMonth ? 'text-text-muted' : ''}
            `}
          >
            <span className="text-sm">{format(day, 'd')}</span>
            {sessionCount > 0 && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                {Array.from({ length: Math.min(sessionCount, 5) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-primary'
                    }`}
                  />
                ))}
              </div>
            )}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-secondary">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-secondary text-text-primary rounded-lg hover:bg-secondary/70 transition text-sm"
          >
            Today
          </button>
          <button
            onClick={handlePrevMonth}
            className="px-3 py-2 bg-secondary text-text-primary rounded-lg hover:bg-secondary/70 transition"
          >
            ←
          </button>
          <button
            onClick={handleNextMonth}
            className="px-3 py-2 bg-secondary text-text-primary rounded-lg hover:bg-secondary/70 transition"
          >
            →
          </button>
        </div>
      </div>

      {renderDays()}
      {renderCells()}

      <div className="mt-4 text-sm text-text-muted flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <span>Has sessions</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded border-2 border-primary"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};
