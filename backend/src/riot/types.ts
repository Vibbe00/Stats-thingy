// Riot API response shapes

export interface RiotAccount {
    puuid: string;
    gameName: string;
    tagLine: string;
}

export interface Summoner {
    puuid: string;
    profileIconId: number;
    summonerLevel: number;
    revisionDate: number;
}

export interface LeagueEntry {
    leagueId: string;
    puuid: string;
    queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR";
    tier: string;       // IRON, BRONZE, ... CHALLENGER
    rank: string;       // I, II, III, IV
    leaguePoints: number;
    wins: number;
    losses: number;
    hotStreak: boolean;
}

export interface MatchMetadata {
    matchId: string;
    participants: string[]; // puuids
}

export interface MatchParticipant {
    puuid: string;
    summonerName: string;
    championName: string;
    championId: number;
    teamId: number;
    kills: number;
    deaths: number;
    assists: number;
    win: boolean;
    totalDamageDealtToChampions: number;
    goldEarned: number;
    visionScore: number;
    cs: number; // totalMinionsKilled + neutralMinionsKilled
}

export interface Match {
    metadata: MatchMetadata;
    info: {
        gameId: number;
        gameMode: string;
        gameDuration: number; // seconds
        gameStartTimestamp: number;
        participants: MatchParticipant[];
    };
}
