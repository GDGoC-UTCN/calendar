import express from 'express';
import fs from 'node:fs';
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
const ADMIN_CODE = process.env.ADMIN_CODE || 'GDGoCEIMAITARI';
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

function hasValidAdminCode(req) {
  const providedCode = String(req.headers['x-admin-code'] || '').trim();
  return Boolean(ADMIN_CODE) && providedCode === ADMIN_CODE;
}

function requireAdminCode(req, res, next) {
  if (hasValidAdminCode(req)) {
    return next();
  }

  return res.status(403).json({
    error: 'Organizer access code required. View mode is allowed, but creating, editing, deleting, or moving events requires the GDG organizer code.'
  });
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    app: 'GDG UTCN Event Planner 2026-2027',
    databasePath,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/verify', (req, res) => {
  if (!hasValidAdminCode(req)) {
    return res.status(403).json({ ok: false, error: 'Invalid organizer code.' });
  }

  return res.json({ ok: true, role: 'organizer' });
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

app.post('/api/events', requireAdminCode, asyncHandler(async (req, res) => {
  const event = createEvent(req.body);
  emitEventsChanged('created', event);
  res.status(201).json(event);
}));

app.put('/api/events/:id', requireAdminCode, asyncHandler(async (req, res) => {
  const event = updateEvent(req.params.id, req.body);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }
  emitEventsChanged('updated', event);
  res.json(event);
}));

app.delete('/api/events/:id', requireAdminCode, asyncHandler(async (req, res) => {
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
const clientIndexPath = path.join(clientDistPath, 'index.html');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();

  if (fs.existsSync(clientIndexPath)) {
    return res.sendFile(clientIndexPath);
  }

  return res.status(503).send(`
    <h1>Frontend build not found</h1>
    <p>The backend is running, but <code>client/dist/index.html</code> was not generated.</p>
    <p>On Render, set Build Command to: <code>npm install && npm run build</code></p>
    <p>Set Start Command to: <code>npm start</code></p>
  `);
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
