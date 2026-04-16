import { Router } from 'express';
import { riotClient } from '../riot/client';

const router = Router();

// GET /summoner/:gameName/:tagLine/ranked
// Returns ranked stats for soloq and flexq
router.get("/:gameName/:tagLine/ranked", async (req, res, next) => {
    try {
        const { gameName, tagLine } = req.params;

<<<<<<< HEAD
        const account = await riotClient.getAccountByRiotId(gameName, tagLine);
        const entries = await riotClient.getLeagueEntries(account.puuid);
=======
        const region = res.locals.region;
        const account = await riotClient.getAccountByRiotId(gameName, tagLine, region);
        const entries = await riotClient.getLeagueEntries(account.puuid, region);
>>>>>>> origin/main

        const soloQueue = entries.find((e) => e.queueType === "RANKED_SOLO_5x5") ?? null;
        const flexQueue = entries.find((e) => e.queueType === "RANKED_FLEX_SR") ?? null;

        const format = (entry: typeof soloQueue) => {
            if (!entry) return null;
            const games = entry.wins + entry.losses;
            return {
                tier: entry.tier,
                rank: entry.rank,
                leaguePoints: entry.leaguePoints,
                wins: entry.wins,
                losses: entry.losses,
                winRate: games > 0 ? parseFloat((entry.wins / games).toFixed(4)) : 0,
                hotStreak: entry.hotStreak,
            };
        };

        res.json({
            soloQueue: format(soloQueue),
            flexQueue: format(flexQueue),
        });
    } catch (err) {
        next(err);
    }
});

export default router;