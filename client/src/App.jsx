import { useMemo, useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CalendarMonth } from './components/CalendarMonth.jsx';
import { ConfirmModal } from './components/ConfirmModal.jsx';
import { EventModal } from './components/EventModal.jsx';
import { Filters } from './components/Filters.jsx';
import { Header } from './components/Header.jsx';
import { StatsDashboard } from './components/StatsDashboard.jsx';
import { Toast } from './components/Toast.jsx';
import { UpcomingEvents } from './components/UpcomingEvents.jsx';
import { ACADEMIC_MONTHS } from './lib/constants.js';
import { useEvents } from './hooks/useEvents.js';

const defaultFilters = {
  search: '',
  type: 'All',
  status: 'All'
};

export default function App() {
  const {
    events,
    loading,
    saving,
    error,
    syncStatus,
    createEvent,
    updateEvent,
    deleteEvent,
    setError
  } = useEvents();

  const [filters, setFilters] = useState(defaultFilters);
  const [modalState, setModalState] = useState({ open: false, event: null, initialDate: '2026-09-01' });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  );

  const filteredEvents = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesType = filters.type === 'All' || event.type === filters.type;
      const matchesStatus = filters.status === 'All' || event.status === filters.status;
      const searchable = [event.title, event.description, event.location, event.notes]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !search || searchable.includes(search);
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [events, filters]);

  const filteredEventsByDate = useMemo(() => {
    return filteredEvents.reduce((acc, event) => {
      acc[event.date] = acc[event.date] || [];
      acc[event.date].push(event);
      acc[event.date].sort((a, b) => `${a.time} ${a.title}`.localeCompare(`${b.time} ${b.title}`));
      return acc;
    }, {});
  }, [filteredEvents]);

  function openCreateModal(dateKey) {
    setModalState({ open: true, event: null, initialDate: dateKey });
  }

  function openEditModal(event) {
    setModalState({ open: true, event, initialDate: event.date });
  }

  function closeModal() {
    setModalState((current) => ({ ...current, open: false }));
  }

  async function handleSaveEvent(form) {
    const payload = {
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      location: form.location,
      type: form.type,
      status: form.status,
      color: form.color,
      notes: form.notes
    };

    if (form.id) {
      await updateEvent(form.id, payload);
      setToast({ type: 'success', message: 'Event updated and synced live.' });
    } else {
      await createEvent(payload);
      setToast({ type: 'success', message: 'Event created and saved in SQLite.' });
    }

    closeModal();
  }

  async function handleDeleteEvent() {
    if (!pendingDelete) return;
    try {
      await deleteEvent(pendingDelete.id);
      setPendingDelete(null);
      closeModal();
      setToast({ type: 'success', message: 'Event deleted from the shared planner.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Could not delete event.' });
    }
  }

  async function handleDragEnd({ active, over }) {
    if (!over) return;

    const draggedEvent = active.data.current?.event;
    const targetDate = over.id;

    if (!draggedEvent || !targetDate || draggedEvent.date === targetDate) return;

    try {
      await updateEvent(draggedEvent.id, {
        ...draggedEvent,
        date: targetDate
      });
      setToast({ type: 'success', message: `${draggedEvent.title} moved to ${targetDate}.` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Could not move event.' });
    }
  }

  return (
    <div className="app-shell">
      <div className="background-orb orb-blue"></div>
      <div className="background-orb orb-yellow"></div>
      <div className="background-orb orb-green"></div>

      <Header syncStatus={syncStatus} />
      <StatsDashboard events={events} />

      <main className="planner-layout">
        <div className="sidebar-stack">
          <Filters
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters(defaultFilters)}
          />
          <UpcomingEvents events={filteredEvents} onEventClick={openEditModal} />
        </div>

        <section className="calendar-panel">
          <div className="calendar-toolbar">
            <div>
              <span className="mini-eyebrow">Academic calendar</span>
              <h2>September 2026 - August 2027</h2>
            </div>
            <button className="primary-button" type="button" onClick={() => openCreateModal('2026-09-01')}>
              + Add event
            </button>
          </div>

          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')}>Dismiss</button>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="loader-ring"></div>
              <p>Loading the GDG planner...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="empty-state calendar-empty">
              <span>🗓️</span>
              <h3>No events found</h3>
              <p>Try clearing filters or add a new GDG idea to the calendar.</p>
              <button className="primary-button" type="button" onClick={() => openCreateModal('2026-09-01')}>Create first event</button>
            </div>
          ) : null}

          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="months-stack">
              {ACADEMIC_MONTHS.map((month) => (
                <CalendarMonth
                  key={`${month.year}-${month.month}`}
                  month={month}
                  eventsByDate={filteredEventsByDate}
                  onDayClick={openCreateModal}
                  onEventClick={openEditModal}
                />
              ))}
            </div>
          </DndContext>
        </section>
      </main>

      {modalState.open && (
        <EventModal
          event={modalState.event}
          initialDate={modalState.initialDate}
          saving={saving}
          onClose={closeModal}
          onSave={handleSaveEvent}
          onAskDelete={setPendingDelete}
        />
      )}

      <ConfirmModal
        event={pendingDelete}
        saving={saving}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDeleteEvent}
      />

      <Toast
        message={toast?.message}
        type={toast?.type}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
