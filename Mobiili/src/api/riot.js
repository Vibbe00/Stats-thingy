// riot.js
const API_KEY   = process.env.EXPO_PUBLIC_RIOT_API_KEY;
const DEFAULT_PLATFORM = process.env.EXPO_PUBLIC_RIOT_REGION ?? 'euw1';
const DEFAULT_ROUTING  = process.env.EXPO_PUBLIC_RIOT_REGIONAL ?? 'europe';

const DDRAGON = 'https://ddragon.leagueoflegends.com';

const headers = { 'X-Riot-Token': API_KEY };

/* ====================== REGION MAPPING ====================== */
const getPlatformAndRouting = (tagLine) => {
  const tag = (tagLine || '').toUpperCase();

  const map = {
    // Europe
    'EUW':  { platform: 'euw1',  routing: 'europe' },
    'EUNE': { platform: 'eune1', routing: 'europe' },
    'TR':   { platform: 'tr1',   routing: 'europe' },
    'RU':   { platform: 'ru1',   routing: 'europe' },

    // Americas
    'NA':   { platform: 'na1',   routing: 'americas' },
    'BR':   { platform: 'br1',   routing: 'americas' },
    'LAN':  { platform: 'la1',   routing: 'americas' },
    'LAS':  { platform: 'la2',   routing: 'americas' },

    // Asia
    'KR':   { platform: 'kr',    routing: 'asia' },
    'JP':   { platform: 'jp',    routing: 'asia' },

    // SEA / others
    'OCE':  { platform: 'oc1',   routing: 'sea' },
    'PH':   { platform: 'ph1',   routing: 'sea' },
    'SG':   { platform: 'sg1',   routing: 'sea' },
    'TH':   { platform: 'th1',   routing: 'sea' },
    'TW':   { platform: 'tw1',   routing: 'sea' },
    'VN':   { platform: 'vn1',   routing: 'sea' },
  };

  return map[tag] || { platform: DEFAULT_PLATFORM, routing: DEFAULT_ROUTING };
};

/* ====================== HELPERS ====================== */
async function buildError(res) {
  const messages = {
    400: 'Bad request — check your Riot ID format (Name#TAG)',
    401: 'Invalid API key — check your .env file',
    403: 'Forbidden — wrong endpoint or key has no access',
    404: 'Summoner not found — check the name and region',
    429: 'Rate limit hit — wait a moment and try again',
  };
  const error = new Error(messages[res.status] ?? `API error ${res.status}`);
  error.status = res.status;
  return error;
}

/* ====================== API CALLS ====================== */
async function getAccountByRiotId(gameName, tagLine) {
  const { routing } = getPlatformAndRouting(tagLine);
  const res = await fetch(
    `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    { headers }
  );
  if (!res.ok) throw await buildError(res);
  return res.json();
}

async function getSummonerByPuuid(puuid, platform) {
  const res = await fetch(
    `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
    { headers }
  );
  if (!res.ok) throw await buildError(res);
  return res.json();
}

async function getRankedStats(summonerId, platform) {
  const res = await fetch(
    `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
    { headers }
  );
  if (!res.ok) throw await buildError(res);
  return res.json();
}

async function getLatestVersion() {
  const res = await fetch(`${DDRAGON}/api/versions.json`);
  const versions = await res.json();
  return versions[0];
}

/* ====================== MAIN FUNCTION ====================== */
export async function getSummonerProfile(gameName, tagLine) {
  const { platform, routing } = getPlatformAndRouting(tagLine);

  const account = await getAccountByRiotId(gameName, tagLine);
  const summoner = await getSummonerByPuuid(account.puuid, platform);

  const [rankedEntries, version] = await Promise.all([
    getRankedStats(summoner.id, platform),
    getLatestVersion(),
  ]);

  const toRankedStats = (entry) => entry ? {
    queueType:    entry.queueType,
    tier:         entry.tier,
    rank:         entry.rank,
    leaguePoints: entry.leaguePoints,
    wins:         entry.wins,
    losses:       entry.losses,
    hotStreak:    entry.hotStreak,
    winRate:      Math.round((entry.wins / (entry.wins + entry.losses)) * 100),
  } : null;

  return {
    account: {
      gameName: account.gameName,
      tagLine:  account.tagLine,
      puuid:    account.puuid,
    },
    summoner: {
      level:          summoner.summonerLevel,
      profileIconId:  summoner.profileIconId,
      profileIconUrl: `${DDRAGON}/cdn/${version}/img/profileicon/${summoner.profileIconId}.png`,
    },
    ranked: {
      soloQueue: toRankedStats(rankedEntries.find(e => e.queueType === 'RANKED_SOLO_5x5') ?? null),
      flexQueue:  toRankedStats(rankedEntries.find(e => e.queueType === 'RANKED_FLEX_SR')  ?? null),
    },
  };
}