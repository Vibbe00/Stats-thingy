import { Router } from "express";
import { riotClient } from "../riot/client";
import { getChampionStats } from "../db/queries";

const router = Router();

// GET /summoner/:gameName/:tagLine/champions
// Returns aggregated stats per champion sorted by most played
router.get("/:gameName/:tagLine/champions", async (req, res, next) => {
    try {
        const { gameName, tagLine } = req.params;

        const region = res.locals.region;
        const account = await riotClient.getAccountByRiotId(gameName, tagLine, region);
        const rows = await getChampionStats(account.puuid);

        if (rows.length === 0) {
            res.json({ champions: [] });
            return;
        }

        const champions = rows.map((row) => {
            const gamesPlayed = parseInt(row.games_played);
            const wins = parseInt(row.wins);
            const avgKills = parseFloat(row.avg_kills);
            const avgDeaths = parseFloat(row.avg_deaths);
            const avgAssists = parseFloat(row.avg_assists);

            return {
                championName: row.champion_name,
                championId: row.champion_id,
                gamesPlayed,
                wins,
                losses: parseInt(row.losses),
                winRate: parseFloat((wins / gamesPlayed).toFixed(4)),
                avgKills,
                avgDeaths,
                avgAssists,
                avgKda: parseFloat(
                    ((avgKills + avgAssists) / Math.max(1, avgDeaths)).toFixed(2)
                ),
                avgCs: parseFloat(row.avg_cs),
                avgDamage: parseInt(row.avg_damage),
            };
        });

        res.json({ champions });
    } catch (err) {
        next(err);
    }
});

export default router;