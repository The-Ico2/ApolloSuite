import { API_BASE } from './config';

export async function fetchUserTimeline(username) {
  const res = await fetch(`${API_BASE}/twitter/timeline/${username}`);
  if (!res.ok) throw new Error("Failed to fetch timeline");
  return res.json();
}

export async function postTweet(text) {
  const res = await fetch(`${API_BASE}/twitter/tweet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to post tweet");
  return res.json();
}
