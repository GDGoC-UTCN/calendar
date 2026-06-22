import { getMonthCells } from '../lib/date.js';
import { DayCell } from './DayCell.jsx';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarMonth({ month, eventsByDate, onDayClick, onEventClick, canEdit }) {
  const cells = getMonthCells(month.year, month.month);

  return (
    <section className="month-card">
      <div className="month-header">
        <h2>{month.label}</h2>
        <span>{Object.values(eventsByDate).flat().filter((event) => {
          const [year, monthNumber] = event.date.split('-').map(Number);
          return year === month.year && monthNumber === month.month + 1;
        }).length} events</span>
      </div>

      <div className="weekday-row">
        {weekdays.map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="month-grid">
        {cells.map((cell) => (
          <DayCell
            key={cell.key}
            cell={cell}
            events={cell.type === 'day' ? eventsByDate[cell.dateKey] || [] : []}
            onDayClick={onDayClick}
            onEventClick={onEventClick}
            canEdit={canEdit}
          />
        ))}
      </div>
    </section>
  );
}
