import { Router } from "express";
import { getRecentSummoners } from "../db/queries";
import { getDDragonVersion, profileIconUrl } from "../middleware/dataDragon";

const router = Router();

// GET /summoners/recent?limit=10
router.get("/recent", async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
        const version = await getDDragonVersion();
        const rows = await getRecentSummoners(limit);

        const summoners = rows.map((row) => ({
            gameName: row.game_name,
            tagLine: row.tag_line,
            level: row.summoner_level,
            profileIconId: row.profile_icon_id,
            profileIconUrl: profileIconUrl(row.profile_icon_id, version),
            lastSearched: row.updated_at,
        }));

        res.json({ summoners });
    } catch (err) {
        next(err);
    }
});

export default router;