import { useState } from 'react';
import { Lock, LogOut, ShieldCheck, Unlock } from 'lucide-react';

export function AccessPanel({ isEditor, accessStatus, onUnlock, onLock }) {
  const [code, setCode] = useState('');
  const isChecking = accessStatus === 'checking';

  async function handleSubmit(event) {
    event.preventDefault();
    if (!code.trim()) return;
    const ok = await onUnlock(code.trim());
    if (ok) setCode('');
  }

  return (
    <section className={`access-card ${isEditor ? 'unlocked' : ''}`}>
      <div className="access-heading">
        <div className="access-icon">
          {isEditor ? <ShieldCheck size={20} /> : <Lock size={20} />}
        </div>
        <div>
          <span className="mini-eyebrow">Access mode</span>
          <h2>{isEditor ? 'Organizer mode' : 'Viewer mode'}</h2>
        </div>
      </div>

      {isEditor ? (
        <div className="access-copy">
          <p>Poți adăuga, edita, șterge și muta evenimentele prin drag and drop.</p>
          <button className="ghost-button" type="button" onClick={onLock}>
            <LogOut size={16} /> Lock editing
          </button>
        </div>
      ) : (
        <form className="access-form" onSubmit={handleSubmit}>
          <p>Toată lumea poate vedea calendarul. Doar organizatorii cu cod pot modifica evenimente.</p>
          <label>
            Organizer code
            <input
              type="password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter GDG code"
              autoComplete="off"
            />
          </label>
          <button className="primary-button" type="submit" disabled={isChecking || !code.trim()}>
            <Unlock size={16} /> {isChecking ? 'Checking...' : 'Unlock editing'}
          </button>
        </form>
      )}
    </section>
  );
}
