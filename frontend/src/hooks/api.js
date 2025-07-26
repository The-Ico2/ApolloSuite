export async function startApolloApp({ source, category, folder }) {
  const response = await fetch('http://localhost:5500/api/supervisor/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ source, category, folder })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start app');
  }

  const data = await response.json();
  return data.port;
}
