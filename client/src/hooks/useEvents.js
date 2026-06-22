import { useCallback, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { api, SOCKET_BASE } from '../lib/api.js';

export function useEvents(adminCode = '') {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [syncStatus, setSyncStatus] = useState('connecting');

  const loadEvents = useCallback(async () => {
    try {
      setError('');
      const data = await api.getEvents();
      setEvents(data);
      setSyncStatus('synced');
    } catch (err) {
      setError(err.message || 'Could not load events.');
      setSyncStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const socket = io(SOCKET_BASE, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => setSyncStatus('live'));
    socket.on('disconnect', () => setSyncStatus('offline'));
    socket.on('events:changed', () => {
      setSyncStatus('syncing');
      loadEvents();
    });

    return () => socket.disconnect();
  }, [loadEvents]);

  const createEvent = useCallback(async (event) => {
    setSaving(true);
    try {
      const saved = await api.createEvent(event, adminCode);
      setEvents((current) => [...current, saved].sort(sortEvents));
      return saved;
    } finally {
      setSaving(false);
    }
  }, [adminCode]);

  const updateEvent = useCallback(async (id, event) => {
    setSaving(true);
    const previousEvents = events;
    setEvents((current) => current.map((item) => item.id === id ? { ...item, ...event } : item).sort(sortEvents));

    try {
      const saved = await api.updateEvent(id, event, adminCode);
      setEvents((current) => current.map((item) => item.id === id ? saved : item).sort(sortEvents));
      return saved;
    } catch (err) {
      setEvents(previousEvents);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [events, adminCode]);

  const deleteEvent = useCallback(async (id) => {
    setSaving(true);
    const previousEvents = events;
    setEvents((current) => current.filter((item) => item.id !== id));

    try {
      await api.deleteEvent(id, adminCode);
      return true;
    } catch (err) {
      setEvents(previousEvents);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [events, adminCode]);

  const eventsByDate = useMemo(() => {
    return events.reduce((acc, event) => {
      acc[event.date] = acc[event.date] || [];
      acc[event.date].push(event);
      acc[event.date].sort(sortEvents);
      return acc;
    }, {});
  }, [events]);

  return {
    events,
    eventsByDate,
    loading,
    saving,
    error,
    syncStatus,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    setError
  };
}

function sortEvents(a, b) {
  return `${a.date} ${a.time || '99:99'} ${a.title}`.localeCompare(`${b.date} ${b.time || '99:99'} ${b.title}`);
}
