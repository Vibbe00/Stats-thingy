import { Router } from "express";
import { riotClient } from "../riot/client";
import { storeMatch, getStoredMatches } from "../db/queries";

const router = Router();

const QUEUE_MAP: Record <string, number> = {
    draft: 400,
    solo: 420,
    flex: 440,
};

const ALL_QUEUES = [400, 420, 440];

// get /summoner/:gameName/:tagLine/matches?count=20
router.get("/:gameName/:tagLine/matches", async (req, res, next) => {
    try {
        const { gameName, tagLine } = req.params;
        const count = Math.min(parseInt(req.query.count as string) || 20, 50);

        const queueParam = req.query.queue as string | undefined;
        const queues = queueParam && QUEUE_MAP[queueParam]
            ? [QUEUE_MAP[queueParam]]
            : ALL_QUEUES;

        // Resolve puuid
        const account = await riotClient.getAccountByRiotId(gameName, tagLine);
        const { puuid } = account;

        // Fetch latest matches from Riot, filtered to only include draft, solo/duo, and flex.
        const matchIds = await riotClient.getMatchIds(puuid, count, queues);

        // Fetch and store any new matches
        for (const matchId of matchIds) {
            const match = await riotClient.getMatch(matchId);
            await storeMatch(match);
        }

        // Return stored matches
        const rows = await getStoredMatches(puuid, count, queues);

        const matches = rows.map((row) => ({
            matchId: row.match_id,
            gameMode: row.game_mode,
            queueId: row.queue_id,
            gameDuration: row.game_duration,
            gameStart: row.game_start,
            player: {
                championName: row.champion_name,
                championId: row.champion_id,
                kills: row.kills,
                deaths: row.deaths,
                assists: row.assists,
                kda: parseFloat(
                    ((row.kills + row.assists) / Math.max(1, row.deaths)).toFixed(2)
                ),
                win: row.win,
                damageDealt: row.damage_dealt,
                goldEarned: row.gold_earned,
                visionScore: row.vision_score,
                cs: row.cs,
            },
        }));

        res.json({ matches });
    } catch (err) {
        next(err);
    }
});

export default router;