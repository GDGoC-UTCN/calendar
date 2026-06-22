import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { EventCard } from './EventCard.jsx';

export function DayCell({ cell, events, onDayClick, onEventClick }) {
  const { isOver, setNodeRef } = useDroppable({
    id: cell.dateKey || cell.key,
    disabled: cell.type !== 'day'
  });

  if (cell.type === 'empty') {
    return <div className="day-cell empty-cell" />;
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onDayClick(cell.dateKey);
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`day-cell ${cell.isWeekend ? 'weekend' : ''} ${cell.isToday ? 'today' : ''} ${isOver ? 'is-over' : ''}`}
      onClick={() => onDayClick(cell.dateKey)}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <span className="day-topline">
        <span className="day-number">{cell.day}</span>
        <span className="add-day"><Plus size={13} /></span>
      </span>

      <span className="events-stack">
        {events.map((event) => (
          <EventCard event={event} key={event.id} onClick={onEventClick} />
        ))}
      </span>
    </div>
  );
}
