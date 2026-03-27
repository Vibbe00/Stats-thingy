// Shared API response types
// I misunderstood the compatability and this won't actually be shared between frontend and backend, so it's just documentation
// No need to import anything no more, you'll call straight from the backend route handlers and return these shapes as JSON responses.
// EXAMPLE USAGE:
// const [summoner, setSummoner] = useState(null);
//
//async function searchSummoner(gameName, tagLine) {
//  const res = await fetch(`http://localhost:3000/summoner/${gameName}/${tagLine}`);
//  const data = await res.json();
//  setSummoner(data);
//}

export type Tier =
    | "IRON" | "BRONZE" | "SILVER" | "GOLD"
    | "PLATINUM" | "EMERALD" | "DIAMOND"
    | "MASTER" | "GRANDMASTER" | "CHALLENGER";

export type Rank = "I" | "II" | "III" | "IV";

export type QueueType = "RANKED_SOLO_5x5" | "RANKED_FLEX_SR";

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
        profileIconUrl: string;     // missing from route response, will fix later //
    };
    ranked: {
        soloQueue: RankedStats | null;
        flexQueue: RankedStats | null;
    };
}

// WORKING BITS ARE ABOVE, BELOW IS NEW STUFF COMING LATER



export interface ApiError {
    error: string;
}