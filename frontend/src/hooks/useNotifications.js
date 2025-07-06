import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../api/config';
import { addNotification } from '../api/notifications';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/notifications`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
  });
}

async function handleNewNotification() {
  try {
    const result = await addNotification('twitter', 'New tweet received');
    console.log('Notification added:', result);
  } catch (err) {
    console.error(err);
  }
}