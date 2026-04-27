const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

async function get(path) {
  console.log('[api] GET', `${BACKEND_URL}${path}`);
  const res = await fetch(`${BACKEND_URL}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const messages = {
      404: 'Summoner not found — check the name and tag',
      429: 'Rate limit hit — wait a moment and try again',
      500: 'Server error — make sure the backend is running',
    };
    throw new Error(messages[res.status] ?? body.error ?? `Error ${res.status}`);
  }
  return res.json();
}

export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${BACKEND_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

// GET /:region/summoner/:gameName/:tagLine → SummonerProfileResponse
export async function getSummonerProfile(region, gameName, tagLine) {
  return get(`/${region}/summoner/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
}

// GET /:region/summoner/:gameName/:tagLine/matches → MatchHistoryResponse
export async function getSummonerMatches(region, gameName, tagLine, count = 20, queue) {
  const params = new URLSearchParams({ count: String(count) });
  if (queue) params.set('queue', queue);
  return get(`/${region}/summoner/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}/matches?${params}`);
}

// GET /:region/summoner/:gameName/:tagLine/champions → ChampionStatsResponse
export async function getSummonerChampions(region, gameName, tagLine) {
  return get(`/${region}/summoner/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}/champions`);
}

// GET /:region/summoner/:gameName/:tagLine/ranked → RankedResponse
export async function getSummonerRanked(region, gameName, tagLine) {
  return get(`/${region}/summoner/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}/ranked`);
}

// GET /:region/summoner/:gameName/:tagLine/matches/:matchId → MatchDetailsResponse
export async function getMatchDetails(region, gameName, tagLine, matchId) {
  return get(`/${region}/summoner/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}/matches/${matchId}`);
}

// GET /summoner/recent → RecentSummonersResponse
export async function getRecentSummoners() {
  return get(`/summoner/recent`);
}