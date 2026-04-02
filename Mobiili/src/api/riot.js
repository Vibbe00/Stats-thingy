
const API_KEY    = process.env.EXPO_PUBLIC_RIOT_API_KEY;
const REGION     = process.env.EXPO_PUBLIC_RIOT_REGION    ?? 'euw1';
const REGIONAL   = process.env.EXPO_PUBLIC_RIOT_REGIONAL  ?? 'europe';

const PLATFORM   = `https://${REGION}.api.riotgames.com`;
const ROUTING    = `https://${REGIONAL}.api.riotgames.com`;
const DDRAGON    = 'https://ddragon.leagueoflegends.com';

const headers = { 'X-Riot-Token': API_KEY };


async function getAccountByRiotId(gameName, tagLine) {
  const url = `${ROUTING}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw await buildError(res);
  return res.json();
}


async function getSummonerByPuuid(puuid) {
  const url = `${PLATFORM}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw await buildError(res);
  return res.json();
}


async function getRankedStats(summonerId) {
  const url = `${PLATFORM}/lol/league/v4/entries/by-summoner/${summonerId}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw await buildError(res);
  return res.json();
}


async function getLatestVersion() {
  const res = await fetch(`${DDRAGON}/api/versions.json`);
  const versions = await res.json();
  return versions[0];
}


export async function getSummonerProfile(gameName, tagLine) {

  const account = await getAccountByRiotId(gameName, tagLine);


  const [summoner, rankedEntries, version] = await Promise.all([
    getSummonerByPuuid(account.puuid),
    getRankedStats(account.puuid),
    getLatestVersion(),
  ]);


  const soloEntry = rankedEntries.find(e => e.queueType === 'RANKED_SOLO_5x5') ?? null;
  const flexEntry = rankedEntries.find(e => e.queueType === 'RANKED_FLEX_SR')  ?? null;

  const toRankedStats = (entry) => entry ? {
    queueType:     entry.queueType,
    tier:          entry.tier,
    rank:          entry.rank,
    leaguePoints:  entry.leaguePoints,
    wins:          entry.wins,
    losses:        entry.losses,
    hotStreak:     entry.hotStreak,
    winRate:       Math.round((entry.wins / (entry.wins + entry.losses)) * 100),
  } : null;


  const profile = {
    account: {
      gameName:  account.gameName,
      tagLine:   account.tagLine,
      puuid:     account.puuid,
    },
    summoner: {
      level:          summoner.summonerLevel,
      profileIconId:  summoner.profileIconId,

      profileIconUrl: `${DDRAGON}/cdn/${version}/img/profileicon/${summoner.profileIconId}.png`,
    },
    ranked: {
      soloQueue: toRankedStats(soloEntry),
      flexQueue: toRankedStats(flexEntry),
    },
  };

  return profile; 
}


async function buildError(res) {
  const messages = {
    400: 'Bad request — check your Riot ID format (Name#TAG)',
    401: 'Invalid API key — check your .env file',
    403: 'Forbidden — your API key may have expired',
    404: 'Summoner not found — check the name and region',
    429: 'Rate limit hit — wait a moment and try again',
    500: 'Riot API server error — try again later',
  };
  const error = new Error(messages[res.status] ?? `API error ${res.status}`);
  error.status = res.status;
  return error;
}