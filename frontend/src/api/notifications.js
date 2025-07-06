import { API_BASE } from './config';

export async function addNotification(app, message) {
  const res = await fetch(`${API_BASE}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app, message }),
  });
  if (!res.ok) throw new Error('Failed to add notification');
  return res.json();
}
