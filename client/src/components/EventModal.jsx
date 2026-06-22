import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, MapPin, Trash2, X } from 'lucide-react';
import { EVENT_STATUSES, EVENT_TYPES, TYPE_COLORS } from '../lib/constants.js';
import { prettyDate } from '../lib/date.js';

const editableTypes = EVENT_TYPES.filter((type) => type !== 'All');
const editableStatuses = EVENT_STATUSES.filter((status) => status !== 'All');

function buildInitialForm(initialDate) {
  return {
    title: '',
    description: '',
    date: initialDate,
    time: '18:00',
    location: '',
    type: 'Workshop',
    status: 'Idea',
    color: TYPE_COLORS.Workshop,
    notes: ''
  };
}

export function EventModal({ event, initialDate, saving, readOnly = false, onClose, onSave, onAskDelete }) {
  const [form, setForm] = useState(() => event || buildInitialForm(initialDate));
  const [localError, setLocalError] = useState('');
  const isEditing = Boolean(event?.id);
  const isDetailsOnly = readOnly && isEditing;

  useEffect(() => {
    setForm(event || buildInitialForm(initialDate));
    setLocalError('');
  }, [event, initialDate]);

  const headerDate = useMemo(() => form.date ? prettyDate(form.date) : 'Choose a date', [form.date]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    setLocalError('');

    if (!form.title.trim()) {
      setLocalError('Please add an event title.');
      return;
    }

    try {
      await onSave(form);
    } catch (err) {
      setLocalError(err.message || 'Could not save event.');
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="event-modal" role="dialog" aria-modal="true" aria-label={isEditing ? 'Edit event' : 'Create event'} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="mini-eyebrow">{isDetailsOnly ? 'Event details' : isEditing ? 'Edit event' : 'New event'}</span>
            <h2><CalendarPlus size={22} /> {isDetailsOnly ? 'View GDG event' : isEditing ? 'Update GDG event' : 'Create GDG event'}</h2>
            <p>{headerDate}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close modal"><X size={20} /></button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="full-field">
            Title
            <input disabled={readOnly} value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="e.g. Google Cloud Study Jam" autoFocus />
          </label>

          <label className="full-field">
            Description
            <textarea disabled={readOnly} value={form.description || ''} onChange={(event) => updateField('description', event.target.value)} placeholder="Short description for the team and community" />
          </label>

          <div className="form-grid">
            <label>
              Date
              <input disabled={readOnly} type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} />
            </label>
            <label>
              Time
              <input disabled={readOnly} type="time" value={form.time || ''} onChange={(event) => updateField('time', event.target.value)} />
            </label>
            <label>
              Type
              <select
                disabled={readOnly}
                value={form.type}
                onChange={(event) => {
                  const type = event.target.value;
                  setForm((current) => ({
                    ...current,
                    type,
                    color: TYPE_COLORS[type] || current.color
                  }));
                }}
              >
                {editableTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label>
              Status
              <select disabled={readOnly} value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                {editableStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label className="location-field">
              Location
              <span className="input-with-icon">
                <MapPin size={15} />
                <input disabled={readOnly} value={form.location || ''} onChange={(event) => updateField('location', event.target.value)} placeholder="UTCN Hub, F14, online..." />
              </span>
            </label>
            <label>
              Color / tag
              <input disabled={readOnly} type="color" value={form.color || '#4285F4'} onChange={(event) => updateField('color', event.target.value)} />
            </label>
          </div>

          <label className="full-field">
            Notes / details
            <textarea disabled={readOnly} value={form.notes || ''} onChange={(event) => updateField('notes', event.target.value)} placeholder="Logistics, sponsors, speakers, links, ideas..." />
          </label>

          {localError && <div className="form-error">{localError}</div>}

          <div className="modal-actions">
            {isEditing && !readOnly && (
              <button className="danger-button" type="button" onClick={() => onAskDelete(form)}>
                <Trash2 size={16} /> Delete
              </button>
            )}
            <div className="right-actions">
              <button className="ghost-button" type="button" onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</button>
              {!readOnly && (
                <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create event'}</button>
              )}
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
