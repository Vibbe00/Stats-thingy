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
    totalMinionsKilled: number;
    neutralMinionsKilled: number;
    item0: number;
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
    item6: number; // trinket
}

export interface Match {
    metadata: MatchMetadata;
    info: {
        gameId: number;
        gameMode: string;
        queueId: number;
        gameDuration: number; // seconds
        gameStartTimestamp: number;
        participants: MatchParticipant[];
    };
}
