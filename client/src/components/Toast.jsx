import { CheckCircle2, XCircle } from 'lucide-react';

export function Toast({ message, type = 'success', onDismiss }) {
  if (!message) return null;
  const Icon = type === 'error' ? XCircle : CheckCircle2;

  return (
    <button type="button" className={`toast toast-${type}`} onClick={onDismiss}>
      <Icon size={18} />
      <span>{message}</span>
    </button>
  );
}
