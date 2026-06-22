import { Sparkles, Wifi, WifiOff, Loader2 } from 'lucide-react';

export function Header({ syncStatus }) {
  const isLive = syncStatus === 'live' || syncStatus === 'synced';
  const isSyncing = syncStatus === 'syncing' || syncStatus === 'connecting';

  return (
    <header className="hero-card">
      <div className="hero-grid"></div>
      <div className="hero-content">
        <div>
          <div className="brand-row">
            <div className="gdg-mark" aria-hidden="true">
              <span className="mark-blue"></span>
              <span className="mark-red"></span>
              <span className="mark-yellow"></span>
              <span className="mark-green"></span>
            </div>
            <span className="eyebrow">Google Developer Groups on Campus UTCN</span>
          </div>
          <h1>GDG UTCN Event Planner 2026-2027</h1>
          <p className="hero-copy">
            Planifică workshopuri, hackathoane, community nights și toate ideile faine ale comunității într-un calendar live, colaborativ și super vizual.
          </p>
        </div>

        <div className="hero-actions">
          <div className={`sync-pill ${isLive ? 'is-live' : ''} ${isSyncing ? 'is-syncing' : ''}`}>
            {isSyncing ? <Loader2 size={16} className="spin" /> : isLive ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{isSyncing ? 'Syncing' : isLive ? 'Live sync' : 'Offline'}</span>
          </div>
          <div className="spark-pill">
            <Sparkles size={16} />
            Sept 2026 - Aug 2027
          </div>
        </div>
      </div>
    </header>
  );
}
