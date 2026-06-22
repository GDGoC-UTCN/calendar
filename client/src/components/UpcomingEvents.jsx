import { CalendarClock, MapPin } from 'lucide-react';
import { TYPE_ICONS } from '../lib/constants.js';
import { isFutureOrToday, prettyDate } from '../lib/date.js';

export function UpcomingEvents({ events, onEventClick }) {
  const upcoming = events
    .filter((event) => isFutureOrToday(event.date))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 7);

  return (
    <aside className="upcoming-card">
      <div className="panel-heading">
        <div>
          <span className="mini-eyebrow">Next on stage</span>
          <h2>Upcoming Events</h2>
        </div>
        <CalendarClock size={22} />
      </div>

      {upcoming.length === 0 ? (
        <div className="empty-state compact">
          <span>🌈</span>
          <p>No upcoming events match your filters.</p>
        </div>
      ) : (
        <div className="upcoming-list">
          {upcoming.map((event) => (
            <button
              type="button"
              className="upcoming-item"
              key={event.id}
              onClick={() => onEventClick(event)}
              style={{ '--event-color': event.color }}
            >
              <span className="upcoming-icon">{TYPE_ICONS[event.type] || '✨'}</span>
              <span className="upcoming-copy">
                <strong>{event.title}</strong>
                <small>{prettyDate(event.date)} {event.time ? `• ${event.time}` : ''}</small>
                {event.location && <em><MapPin size={13} /> {event.location}</em>}
              </span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
