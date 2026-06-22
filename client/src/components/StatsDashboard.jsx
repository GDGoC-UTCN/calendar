import { CalendarDays, CheckCircle2, Rocket, Trophy } from 'lucide-react';
import { isFutureOrToday } from '../lib/date.js';

export function StatsDashboard({ events }) {
  const total = events.length;
  const confirmed = events.filter((event) => event.status === 'Confirmed').length;
  const upcoming = events.filter((event) => isFutureOrToday(event.date)).length;
  const builderEvents = events.filter((event) => ['Hackathon', 'Workshop'].includes(event.type)).length;

  const stats = [
    { label: 'Total events', value: total, icon: CalendarDays },
    { label: 'Confirmed', value: confirmed, icon: CheckCircle2 },
    { label: 'Upcoming', value: upcoming, icon: Rocket },
    { label: 'Hackathons + workshops', value: builderEvents, icon: Trophy }
  ];

  return (
    <section className="stats-grid" aria-label="Event statistics">
      {stats.map(({ label, value, icon: Icon }) => (
        <article className="stat-card" key={label}>
          <div className="stat-icon"><Icon size={20} /></div>
          <div>
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}
