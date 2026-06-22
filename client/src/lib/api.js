const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : `${window.location.origin}/api`);
export const SOCKET_BASE = API_BASE.replace(/\/api\/?$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

export const api = {
  getEvents: () => request('/events'),
  createEvent: (event) => request('/events', {
    method: 'POST',
    body: JSON.stringify(event)
  }),
  updateEvent: (id, event) => request(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(event)
  }),
  deleteEvent: (id) => request(`/events/${id}`, {
    method: 'DELETE'
  })
};
