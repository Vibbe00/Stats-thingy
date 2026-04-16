import { Router } from "express";
import { riotClient } from "../riot/client";
import { LeagueEntry } from "../riot/types";
<<<<<<< HEAD
=======
import { getDDragonVersion, profileIconUrl } from "../middleware/dataDragon";
import { upsertSummoner } from "../db/queries";
>>>>>>> origin/main

const router = Router();

function rankedStats(entry: LeagueEntry) {
    return {
        ...entry,
        winRate: entry.wins / (entry.wins + entry.losses)
    }
}

// GET /summoner/:gameName/:tagLine
// Example: /summoner/Faker/KR1
// Returns summoner profile + ranked stats
router.get("/:gameName/:tagLine", async (req, res, next) => {
    try {
        const { gameName, tagLine } = req.params;
        const version = await getDDragonVersion();

        const region = res.locals.region;
        // Resolve Riot account (gives us puuid)
        const account = await riotClient.getAccountByRiotId(gameName, tagLine, region);
        // Get summoner details (level, icon, etc.)
        const summoner = await riotClient.getSummonerByPuuid(account.puuid, region);
        // Get ranked entries
        const leagueEntries = await riotClient.getLeagueEntries(account.puuid, region);

        // Store/update summoner in DB
        await upsertSummoner(
            account.puuid,
            account.gameName,
            account.tagLine,
            summoner.summonerLevel,
            summoner.profileIconId
        );

        const soloQueue = leagueEntries.find(
            (e) => e.queueType === "RANKED_SOLO_5x5"
        ) ?? null;
        const flexQueue = leagueEntries.find(
            (e) => e.queueType === "RANKED_FLEX_SR"
        ) ?? null;

        res.json({
            account: {
                gameName: account.gameName,
                tagLine: account.tagLine,
                puuid: account.puuid,
            },
            summoner: {
                level: summoner.summonerLevel,
                profileIconId: summoner.profileIconId,
<<<<<<< HEAD
                profileIconUrl: `https://ddragon.leagueoflegends.com/cdn/16.7.1/img/profileicon/${summoner.profileIconId}.png`,
=======
                profileIconUrl: profileIconUrl(summoner.profileIconId, version),
>>>>>>> origin/main
            },
            ranked: {
                soloQueue: soloQueue ? rankedStats(soloQueue) : null,
                flexQueue: flexQueue ? rankedStats(flexQueue) : null,
            },
        });
    } catch (err) {
        next(err);
    }
});

export default router;
