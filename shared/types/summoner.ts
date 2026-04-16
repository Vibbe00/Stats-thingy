// Shared API response types
// I misunderstood the compatability and this won't actually be shared between frontend and backend, so it's just documentation
// No need to import anything no more, you'll call straight from the backend route handlers and return these shapes as JSON responses.
// EXAMPLE USAGE:
// const [summoner, setSummoner] = useState(null);
//
//  async function searchSummoner(region, gameName, tagLine) {
//  const res = await fetch(`http://localhost:3000/${region}/summoner/${gameName}/${tagLine}`);
//  const data = await res.json();
//  setSummoner(data);
//}

export type Tier =
    | "IRON" | "BRONZE" | "SILVER" | "GOLD"
    | "PLATINUM" | "EMERALD" | "DIAMOND"
    | "MASTER" | "GRANDMASTER" | "CHALLENGER";

export type Rank = "I" | "II" | "III" | "IV";

export type QueueType = "RANKED_SOLO_5x5" | "RANKED_FLEX_SR";

// Supported queue IDs:
// 400 = draft
// 420 = ranked solo/duo
// 440 = ranked flex
export type QueueId = 400 | 420 | 440;

export interface RankedStats {
    queueType: QueueType;
    tier: Tier;
    rank: Rank;
    leaguePoints: number;
    wins: number;
    losses: number;
    hotStreak: boolean;
    winRate: number;
}

export interface ItemSlot {
    id: number;
    icon: string | null;
}

// This is the shape of the response from GET /summoner/:gameName/:tagLine
export interface SummonerProfileResponse {
    account: {
        gameName: string;
        tagLine: string;
        puuid: string;
    };
    summoner: {
        level: number;
        profileIconId: number;
        // Full URL ready to use in an <img> tag //
        profileIconUrl: string;
    };
    ranked: {
        soloQueue: RankedStats | null;
        flexQueue: RankedStats | null;
    };
}

export interface MatchPlayerSummary {
    championName: string;
    championId: number;
    championIcon: string;
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
    win: boolean;
    damageDealt: number;
    goldEarned: number;
    visionScore: number;
    cs: number;
    items: ItemSlot[];
}

export interface MatchSummary {
    matchId: string;
    gameMode: string;
    queueId: QueueId;
    // Duration in seconds //
    gameDuration: number;
    // ISO timestamp string //
    gameStart: string;
    // The queried player's stats in this match //
    player: MatchPlayerSummary;
}

export interface MatchHistoryResponse {
    matches: MatchSummary[];
}

export interface RankedQueueStats {
  tier: Tier;
  rank: Rank;
  leaguePoints: number;
  wins: number;
  losses: number;
  /** Computed by backend: wins / (wins + losses) */
  winRate: number;
  hotStreak: boolean;
}
 
export interface RankedResponse {
  soloQueue: RankedQueueStats | null;
  flexQueue: RankedQueueStats | null;
}

export interface ChampionStats {
  championName: string;
  championId: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKda: number;
  avgCs: number;
  avgDamage: number;
}
 
export interface ChampionStatsResponse {
  champions: ChampionStats[];
}

export interface ApiError {
    error: string;
}

export interface MatchPlayer {
    puuid: string;
    // was previously null if the account hadn't been searched manually, now is null only if riot data is missing
    gameName: string | null;
    tagLine: string | null;
    championName: string;
    championId: number;
    championIcon: string;
    teamPosition: "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY" | "";
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
    win: boolean;
    damageDealt: number;
    goldEarned: number;
    visionScore: number;
    cs: number;
    items: ItemSlot[];
}

export interface MatchDetailsResponse {
    matchId: string;
    gameMode: string;
    queueId: QueueId;
    gameDuration: number;
    gameStart: string;
    teams: {
        // Team 100 = Blue, Team 200 = Red, sorted: TOP → JGL → MID → BOT → SUP
        blue: MatchPlayer[];
        red: MatchPlayer[];
    };
}