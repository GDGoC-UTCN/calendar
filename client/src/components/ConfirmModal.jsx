import { AlertTriangle } from 'lucide-react';

export function ConfirmModal({ event, saving, onCancel, onConfirm }) {
  if (!event) return null;

  return (
    <div className="modal-backdrop top-layer" role="presentation" onMouseDown={onCancel}>
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-label="Delete confirmation" onMouseDown={(event) => event.stopPropagation()}>
        <div className="confirm-icon"><AlertTriangle size={26} /></div>
        <h2>Delete this event?</h2>
        <p>
          This will permanently remove <strong>{event.title}</strong> from the shared GDG planner database.
        </p>
        <div className="confirm-actions">
          <button className="ghost-button" type="button" onClick={onCancel}>Cancel</button>
          <button className="danger-button" type="button" onClick={onConfirm} disabled={saving}>{saving ? 'Deleting...' : 'Delete event'}</button>
        </div>
      </section>
    </div>
  );
}
