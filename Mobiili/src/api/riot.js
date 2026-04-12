const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export async function getSummonerProfile(gameName, tagLine) {
  const url = `${BACKEND_URL}/summoner/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  console.log('[riot.js] fetching:', url); 

  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const messages = {
      404: 'Summoner not found — check the name and tag',
      429: 'Rate limit hit — wait a moment and try again',
      500: 'Server error — make sure the backend is running',
    };
    throw new Error(messages[res.status] ?? body.message ?? `Error ${res.status}`);
  }

  return res.json();
}

export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${BACKEND_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const json = await res.json();
    console.log('[riot.js] health:', json); // debug
    return json.status === 'ok';
  } catch (err) {
    console.log('[riot.js] health check failed:', err.message); // debug
    return false;
  }
}