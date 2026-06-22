import Database from 'better-sqlite3';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const databasePath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(dataDir, 'database.sqlite');

const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const EVENT_TYPES = ['Workshop', 'Hackathon', 'Community', 'Social', 'Meeting', 'Deadline', 'Other'];
const EVENT_STATUSES = ['Idea', 'Planned', 'Confirmed', 'Done'];

const demoEvents = [
  {
    title: 'Opening Community Meetup',
    description: 'Kick-off pentru anul academic, cu planuri, idei și vibe GDG.',
    date: '2026-09-24',
    time: '18:00',
    location: 'UTCN Hub, Baritiu',
    type: 'Community',
    status: 'Confirmed',
    color: '#4285F4',
    notes: 'Include intro pentru boboci, prezentare echipă și mini networking.'
  },
  {
    title: 'Intro to Git & GitHub',
    description: 'Workshop beginner-friendly despre Git, GitHub, branches și pull requests.',
    date: '2026-10-08',
    time: '18:30',
    location: 'Campus UTCN',
    type: 'Workshop',
    status: 'Planned',
    color: '#0F9D58',
    notes: 'Pregătim repository demo și exerciții scurte.'
  },
  {
    title: 'CV & LinkedIn Workshop',
    description: 'Sesiune aplicată pentru CV-uri, LinkedIn și internship readiness.',
    date: '2026-10-22',
    time: '18:00',
    location: 'F14',
    type: 'Workshop',
    status: 'Idea',
    color: '#4285F4',
    notes: 'Poate include feedback individual pe CV.'
  },
  {
    title: 'Google Cloud Study Jam',
    description: 'Hands-on labs pentru Google Cloud și cloud fundamentals.',
    date: '2026-11-05',
    time: '17:30',
    location: 'UTCN Lab',
    type: 'Workshop',
    status: 'Planned',
    color: '#F4B400',
    notes: 'Verifică accesul la conturi și materiale înainte de eveniment.'
  },
  {
    title: 'GDG Hackathon',
    description: 'Weekend de hacking, idei, prototipuri și demo-uri pentru studenți.',
    date: '2026-11-21',
    time: '10:00',
    location: 'UTCN / Partner venue',
    type: 'Hackathon',
    status: 'Idea',
    color: '#DB4437',
    notes: 'Necesită sponsori, mentori, premii și logistică.'
  },
  {
    title: 'Women in Tech Night',
    description: 'Panel + networking despre cariere, research și leadership în tech.',
    date: '2027-03-11',
    time: '18:00',
    location: 'UTCN Hub',
    type: 'Community',
    status: 'Idea',
    color: '#AB47BC',
    notes: 'Invitate din industrie și comunitate.'
  },
  {
    title: 'Product Weekend',
    description: 'Mini sprint pentru product thinking, user flows și prototipare rapidă.',
    date: '2027-04-17',
    time: '11:00',
    location: 'Cluj-Napoca',
    type: 'Hackathon',
    status: 'Planned',
    color: '#F4B400',
    notes: 'Poate fi organizat cu mentori de product și design.'
  },
  {
    title: 'AI Workshop',
    description: 'Workshop practic despre AI tools, prompt engineering și prototipuri rapide.',
    date: '2027-05-06',
    time: '18:30',
    location: 'UTCN Lab',
    type: 'Workshop',
    status: 'Planned',
    color: '#0F9D58',
    notes: 'Pregătim exemple utile pentru studenți.'
  },
  {
    title: 'End of Semester Community Party',
    description: 'Eveniment social pentru comunitate, voluntari și prieteni GDG.',
    date: '2027-06-17',
    time: '19:00',
    location: 'Cluj-Napoca',
    type: 'Social',
    status: 'Idea',
    color: '#DB4437',
    notes: 'Good vibes, poze, recap și planuri pentru vară.'
  }
];

function nowIso() {
  return new Date().toISOString();
}

function normalizeEventPayload(payload, existing = {}) {
  const cleaned = {
    title: String(payload.title ?? existing.title ?? '').trim(),
    description: String(payload.description ?? existing.description ?? '').trim(),
    date: String(payload.date ?? existing.date ?? '').trim(),
    time: String(payload.time ?? existing.time ?? '').trim(),
    location: String(payload.location ?? existing.location ?? '').trim(),
    type: String(payload.type ?? existing.type ?? 'Other').trim(),
    status: String(payload.status ?? existing.status ?? 'Idea').trim(),
    color: String(payload.color ?? existing.color ?? '#4285F4').trim(),
    notes: String(payload.notes ?? existing.notes ?? '').trim()
  };

  if (!cleaned.title) {
    throw new Error('Title is required.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleaned.date)) {
    throw new Error('Date must use YYYY-MM-DD format.');
  }

  if (cleaned.time && !/^\d{2}:\d{2}$/.test(cleaned.time)) {
    throw new Error('Time must use HH:MM format.');
  }

  if (!EVENT_TYPES.includes(cleaned.type)) {
    throw new Error(`Type must be one of: ${EVENT_TYPES.join(', ')}.`);
  }

  if (!EVENT_STATUSES.includes(cleaned.status)) {
    throw new Error(`Status must be one of: ${EVENT_STATUSES.join(', ')}.`);
  }

  if (!/^#([0-9A-Fa-f]{3}){1,2}$/.test(cleaned.color)) {
    cleaned.color = '#4285F4';
  }

  return cleaned;
}

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      date TEXT NOT NULL,
      time TEXT DEFAULT '',
      location TEXT DEFAULT '',
      type TEXT NOT NULL DEFAULT 'Other',
      status TEXT NOT NULL DEFAULT 'Idea',
      color TEXT NOT NULL DEFAULT '#4285F4',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
  `);
}

function seedDemoEvents() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM events').get().count;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO events (
      id, title, description, date, time, location, type, status, color, notes, created_at, updated_at
    ) VALUES (
      @id, @title, @description, @date, @time, @location, @type, @status, @color, @notes, @created_at, @updated_at
    )
  `);

  const insertMany = db.transaction((events) => {
    for (const event of events) {
      const timestamp = nowIso();
      insert.run({
        id: randomUUID(),
        ...event,
        created_at: timestamp,
        updated_at: timestamp
      });
    }
  });

  insertMany(demoEvents);
}

function listEvents() {
  return db.prepare('SELECT * FROM events ORDER BY date ASC, time ASC, created_at ASC').all();
}

function getEvent(id) {
  return db.prepare('SELECT * FROM events WHERE id = ?').get(id);
}

function createEvent(payload) {
  const event = normalizeEventPayload(payload);
  const timestamp = nowIso();
  const record = {
    id: randomUUID(),
    ...event,
    created_at: timestamp,
    updated_at: timestamp
  };

  db.prepare(`
    INSERT INTO events (
      id, title, description, date, time, location, type, status, color, notes, created_at, updated_at
    ) VALUES (
      @id, @title, @description, @date, @time, @location, @type, @status, @color, @notes, @created_at, @updated_at
    )
  `).run(record);

  return getEvent(record.id);
}

function updateEvent(id, payload) {
  const existing = getEvent(id);
  if (!existing) return null;

  const event = normalizeEventPayload(payload, existing);
  const timestamp = nowIso();

  db.prepare(`
    UPDATE events
    SET
      title = @title,
      description = @description,
      date = @date,
      time = @time,
      location = @location,
      type = @type,
      status = @status,
      color = @color,
      notes = @notes,
      updated_at = @updated_at
    WHERE id = @id
  `).run({
    id,
    ...event,
    updated_at: timestamp
  });

  return getEvent(id);
}

function deleteEvent(id) {
  const existing = getEvent(id);
  if (!existing) return false;
  db.prepare('DELETE FROM events WHERE id = ?').run(id);
  return true;
}

initDatabase();
seedDemoEvents();

export {
  db,
  databasePath,
  EVENT_TYPES,
  EVENT_STATUSES,
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  seedDemoEvents
};
