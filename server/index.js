import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { Server } from 'socket.io';
import {
  databasePath,
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:4000';
const allowedOrigins = CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

function emitEventsChanged(action, event = null) {
  io.emit('events:changed', {
    action,
    event,
    updatedAt: new Date().toISOString()
  });
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    app: 'GDG UTCN Event Planner 2026-2027',
    databasePath,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/events', asyncHandler(async (req, res) => {
  res.json(listEvents());
}));

app.get('/api/events/:id', asyncHandler(async (req, res) => {
  const event = getEvent(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }
  res.json(event);
}));

app.post('/api/events', asyncHandler(async (req, res) => {
  const event = createEvent(req.body);
  emitEventsChanged('created', event);
  res.status(201).json(event);
}));

app.put('/api/events/:id', asyncHandler(async (req, res) => {
  const event = updateEvent(req.params.id, req.body);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }
  emitEventsChanged('updated', event);
  res.json(event);
}));

app.delete('/api/events/:id', asyncHandler(async (req, res) => {
  const deleted = deleteEvent(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Event not found.' });
  }
  emitEventsChanged('deleted', { id: req.params.id });
  res.status(204).send();
}));

io.on('connection', (socket) => {
  socket.emit('events:hello', {
    message: 'Connected to GDG UTCN Event Planner realtime sync.',
    connectedAt: new Date().toISOString()
  });
});

const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (error) => {
    if (error) next();
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({
    error: err.message || 'Something went wrong.'
  });
});

server.listen(PORT, () => {
  console.log(`GDG UTCN Event Planner API running on http://localhost:${PORT}`);
  console.log(`SQLite database: ${databasePath}`);
});
