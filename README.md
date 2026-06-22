# GDG UTCN Event Planner 2026-2027

A full-stack interactive calendar for **GDG on Campus UTCN** event planning across the academic year **September 2026 - August 2027**.

The app includes:

- React + Vite frontend
- Node.js + Express backend
- SQLite database persistence
- Socket.IO realtime sync
- Drag and drop event moving with `@dnd-kit/core`
- Search, filters, dashboard stats, upcoming events
- Event create, edit, delete, and live updates
- Demo GDG events automatically seeded on first run

---

## Project structure

```txt
gdg-utcn-event-planner-2026-2027/
├── package.json
├── README.md
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── components/
│       ├── hooks/
│       └── lib/
└── server/
    ├── package.json
    ├── index.js
    ├── db.js
    ├── seed.js
    └── data/
        └── .gitkeep
```

---

## Requirements

Install:

- Node.js 20+ recommended
- npm 10+ recommended

---

## Install dependencies

From the project root:

```bash
npm run install-all
```

This installs dependencies for:

1. the root workspace helper scripts;
2. the Express backend in `/server`;
3. the React frontend in `/client`.

---

## Run the app in development

From the project root:

```bash
npm run dev
```

This starts both apps:

- backend: `http://localhost:4000`
- frontend: `http://localhost:5173`

Open the frontend URL in your browser.

---

## Run only the backend

```bash
npm run server
```

or:

```bash
cd server
npm run dev
```

---

## Run only the frontend

```bash
npm run client
```

or:

```bash
cd client
npm run dev
```

---

## How SQLite persistence works

The backend creates a SQLite database automatically on first start at:

```txt
server/data/database.sqlite
```

The database stores all events globally. This means events are **not saved in localStorage**. When someone opens the app from another browser or laptop and connects to the same backend server, they see the same events.

On the first run, the backend seeds demo GDG events such as:

- Opening Community Meetup
- Intro to Git & GitHub
- CV & LinkedIn Workshop
- Google Cloud Study Jam
- GDG Hackathon
- Women in Tech Night
- Product Weekend
- AI Workshop
- End of Semester Community Party

If the database already has events, demo data is not inserted again.

---

## API routes

Base URL:

```txt
http://localhost:4000/api
```

Routes:

```txt
GET    /api/health
GET    /api/events
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
```

Event fields:

```json
{
  "title": "AI Workshop",
  "description": "Hands-on intro to AI tools",
  "date": "2026-11-18",
  "time": "18:00",
  "location": "UTCN Hub",
  "type": "Workshop",
  "status": "Planned",
  "color": "#4285F4",
  "notes": "Bring laptops"
}
```

---

## Realtime sync with Socket.IO

Whenever an event is created, edited, moved by drag and drop, or deleted, the backend emits a Socket.IO event called:

```txt
events:changed
```

All connected browsers listen for this event and refresh their event list automatically. This is what makes changes appear live for everyone who is on the site.

---

## Drag and drop behavior

The frontend uses `@dnd-kit/core`.

- Drag an event card from one day to another.
- Drop it on the new date.
- The frontend sends a `PUT /api/events/:id` request with the updated date.
- The backend saves the new date in SQLite.
- Socket.IO broadcasts the update to all connected users.

---

## Deploy notes

You can deploy this as two services:

1. Backend service: Node.js + Express + SQLite
2. Frontend service: static Vite build

For the frontend production build:

```bash
cd client
npm run build
```

The build output is created in:

```txt
client/dist
```

The Express backend can also serve this folder in production if `client/dist` exists.

---

## Important: keeping the database persistent on a server

SQLite is a file-based database. In production, make sure `server/data/database.sqlite` is stored on a **persistent disk/volume**, not on temporary deployment storage.

Examples:

- On a VPS: keep `/server/data` as a normal folder and back it up.
- On Docker: mount a volume to `/app/server/data`.
- On Render/Fly/Railway-like platforms: configure a persistent volume if available.

Without persistent storage, the database may reset when the server redeploys.

---

## Environment variables

Backend:

```bash
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/database.sqlite
```

Frontend:

```bash
VITE_API_URL=http://localhost:4000/api
```

If these are not set, the app uses the local defaults above.

---

## Production start

After installing dependencies:

```bash
cd server
npm start
```

The backend will run on `PORT` or `4000` by default.

---

## Main features checklist

- Academic calendar: September 2026 to August 2027
- All months and days visible
- Weekend styling
- Add event by clicking a day
- Edit event by clicking an event card
- Delete with confirmation modal
- Drag and drop to move events between days
- SQLite persistence
- Socket.IO live updates
- Filters by type and status
- Search by title, description, notes, location
- Upcoming events panel
- Dashboard stats
- GDG-inspired UI with Google colors, cards, gradients, badges, micro-animations
