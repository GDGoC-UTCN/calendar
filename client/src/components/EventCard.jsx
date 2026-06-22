import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical } from 'lucide-react';
import { TYPE_ICONS } from '../lib/constants.js';

export function EventCard({ event, onClick, canEdit }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { event },
    disabled: !canEdit
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    '--event-color': event.color,
    zIndex: isDragging ? 40 : 1
  };

  return (
    <button
      ref={setNodeRef}
      className={`event-card ${isDragging ? 'is-dragging' : ''} ${!canEdit ? 'read-only' : ''}`}
      type="button"
      style={style}
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        onClick(event);
      }}
      {...attributes}
      {...listeners}
    >
      <span className="event-card-accent" aria-hidden="true"></span>
      <span className="event-main">
        <span className="event-title-row">
          <span>{TYPE_ICONS[event.type] || '✨'}</span>
          <strong>{event.title}</strong>
        </span>
        <span className="event-meta-row">
          {event.time && <span><Clock size={12} /> {event.time}</span>}
          <span className={`status-dot status-${event.status.toLowerCase()}`}>{event.status}</span>
        </span>
      </span>
      <GripVertical className="drag-icon" size={15} />
    </button>
  );
}
