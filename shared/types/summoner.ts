// Shared API response types
// Import these in website and mobile instead of defining your own.
// import type { SummonerProfileResponse, ApiError } from "../../shared/types"; // Example import //

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

// WORKING BITS ARE ABOVE, BELOW IS NEW STUFF COMING LATER



export interface ApiError {
    error: string;
}