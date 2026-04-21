import { Router } from "express";
import { riotClient } from "../riot/client";
import { storeMatch, getMatchDetails } from "../db/queries";
import { getDDragonVersion, championIconUrl, itemIconUrl, summonerSpellIconUrl } from "../middleware/dataDragon";

const router = Router();

const ROLE_ORDER: Record<string, number> = {
    TOP: 0,
    JUNGLE: 1,
    MIDDLE: 2,
    BOTTOM: 3,
    UTILITY: 4,
};

// GET /summoner/:gameName/:tagLine/matches/:matchId
router.get("/:gameName/:tagLine/matches/:matchId", async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const region = res.locals.region;

        // Fetch and store if we don't have it yet
        const match = await riotClient.getMatch(matchId, region);
        await storeMatch(match);

        const nameLookup = new Map<string, { gameName: string; tagLine: string }>();
        for (const p of match.info.participants) {
            nameLookup.set(p.puuid, {
                gameName: p.riotIdGameName,
                tagLine: p.riotIdTagline,
            });
        }

        const version = await getDDragonVersion();
        const rows = await getMatchDetails(matchId);

        if (rows.length === 0) {
            res.status(404).json({ error: "Match not found" });
            return;
        }

        const formatPlayer = (row: any) => {
            const name = nameLookup.get(row.puuid);
            return {
                puuid: row.puuid,
                gameName: name?.gameName ?? row.game_name ?? null,
                tagLine: name?.tagLine ?? row.tag_line ?? null,
                championName: row.champion_name,
                championId: row.champion_id,
                championIcon: championIconUrl(row.champion_name, version),
                teamPosition: row.team_position,
                kills: row.kills,
                deaths: row.deaths,
                assists: row.assists,
                kda: parseFloat(
                    ((row.kills + row.assists) / Math.max(1, row.deaths)).toFixed(2)),
                win: row.win,
                damageDealt: row.damage_dealt,
                goldEarned: row.gold_earned,
                visionScore: row.vision_score,
                cs: row.cs,
                items: [row.item0, row.item1, row.item2, row.item3, row.item4, row.item5, row.item6]
                    .map((id: number) => ({ id, icon: itemIconUrl(id, version) })),
                summonerSpells: [
                    { id: row.summoner1_id, icon: summonerSpellIconUrl(row.summoner1_id, version) },
                    { id: row.summoner2_id, icon: summonerSpellIconUrl(row.summoner2_id, version) },
                ],
            };
        };

        const sortByRole = (a: any, b: any) =>
            (ROLE_ORDER[a.team_position] ?? 5) - (ROLE_ORDER[b.team_position] ?? 5);

        const team100 = rows.filter(r => r.team_id === 100).sort(sortByRole).map(formatPlayer);
        const team200 = rows.filter(r => r.team_id === 200).sort(sortByRole).map(formatPlayer);

        const first = rows[0];

        res.json({
            matchId: first.match_id,
            gameMode: first.game_mode,
            queueId: first.queue_id,
            gameDuration: first.game_duration,
            gameStart: first.game_start,
            teams: {
                blue: team100,
                red: team200,
            },
        });
    } catch (err) {
        next(err);
    }
});

export default router;