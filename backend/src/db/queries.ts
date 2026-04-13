import { db } from "./index";
import type { Match } from "../riot/types";

// Updates if already exists
export async function upsertSummoner(
    puuid: string,
    gameName: string,
    tagLine: string,
    summonerLevel: number,
    profileIconId: number
): Promise<void> {
    await db.query(
        `INSERT INTO summoners (puuid, game_name, tag_line, summoner_level, profile_icon_id, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (puuid) DO UPDATE SET
        game_name = EXCLUDED.game_name,
        tag_line = EXCLUDED.tag_line,
        summoner_level = EXCLUDED.summoner_level,
        profile_icon_id = EXCLUDED.profile_icon_id,
        updated_at = NOW()`,
        [puuid, gameName, tagLine, summonerLevel, profileIconId]
    );
}

// Store match and participants, ignore if match already exists
export async function storeMatch(match: Match): Promise<void> {
    const { metadata, info } = match;

    // Skip
    const existing = await db.query(
        "SELECT match_id FROM matches WHERE match_id = $1",
        [metadata.matchId]
    );
    if (existing.rows.length > 0) return;

    // Insert match
    await db.query(
        `INSERT INTO matches (match_id, game_mode, queue_id, game_duration, game_start)
        VALUES ($1, $2, $3, $4, TO_TIMESTAMP($5 / 1000.0))`,
        [metadata.matchId, info.gameMode, info.queueId, info.gameDuration, info.gameStartTimestamp]
    );

    // Insert participants
    for (const p of info.participants) {
        const cs = p.totalMinionsKilled + p.neutralMinionsKilled;
        await db.query(
            `INSERT INTO match_participants (match_id, puuid, champion_name, champion_id, team_id, kills, deaths, assists, win, damage_dealt, gold_earned, vision_score, cs)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (match_id, puuid) DO NOTHING`,
            [
                metadata.matchId,
                p.puuid,
                p.championName,
                p.championId,
                p.teamId,
                p.kills,
                p.deaths,
                p.assists,
                p.win,
                p.totalDamageDealtToChampions,
                p.goldEarned,
                p.visionScore,
                cs
            ]
        );
    }
}

// 400 = Draft, 420 = Solo/duo, 440 = Flex
const SUPPORTED_QUEUES = [400, 420, 440];

// Get stored matches
export async function getStoredMatches(puuid: string, count: number, queues = SUPPORTED_QUEUES) {
    const result = await db.query(
        `SELECT
            m.match_id,
            m.game_mode,
            m.queue_id,
            m.game_duration,
            m.game_start,
            mp.champion_name,
            mp.champion_id,
            mp.kills,
            mp.deaths,
            mp.assists,
            mp.win,
            mp.damage_dealt,
            mp.gold_earned,
            mp.vision_score,
            mp.cs
        FROM matches m
        JOIN match_participants mp
            ON m.match_id = mp.match_id AND mp.puuid = $1
        WHERE m.queue_id = ANY($2)
        ORDER BY m.game_start DESC
        LIMIT $3`,
        [puuid, queues, count]
    );
    return result.rows;
}

// Get champion stats for a summoner
export async function getChampionStats(puuid: string) {
    const result = await db.query(
        `SELECT
            mp.champion_name,
            mp.champion_id,
            COUNT(*) AS games_played,
            SUM(CASE WHEN mp.win THEN 1 ELSE 0 END) AS wins,
            SUM(CASE WHEN mp.win THEN 0 ELSE 1 END) AS losses,
            ROUND(AVG(mp.kills)::numeric, 2) AS avg_kills,
            ROUND(AVG(mp.deaths)::numeric, 2) AS avg_deaths,
            ROUND(AVG(mp.assists)::numeric, 2) AS avg_assists,
            ROUND(AVG(mp.cs)::numeric, 1) AS avg_cs,
            ROUND(AVG(mp.damage_dealt)::numeric, 0) AS avg_damage
        FROM match_participants mp
        JOIN matches m ON m.match_id = mp.match_id
        WHERE mp.puuid = $1
        AND m.queue_id = ANY($2)
        GROUP BY mp.champion_name, mp.champion_id
        ORDER BY games_played DESC`,
        [puuid, SUPPORTED_QUEUES]
  );
  return result.rows;
}