import { db, connectDB } from "../db";
import { riotClient } from "../riot/client";

async function backfill() {
    await connectDB();

    // Get all matches without items
    const { rows } = await db.query(
        `SELECT DISTINCT match_id FROM match_participants
        WHERE item0 = 0 AND item1 = 0 AND item2 = 0 AND item3 = 0 AND item4 = 0 AND item5 = 0 AND item6 = 0`
    );

    console.log(`Found ${rows.length} matches to backfill.`);

    for (let i = 0; i < rows.length; i++) {
        const matchId = rows[i].match_id;
        try {
            const match = await riotClient.getMatch(matchId);

            for (const p of match.info.participants) {
                await db.query(
                    `UPDATE match_participants
                    SET item0 = $1, item1 = $2, item2 = $3, item3 = $4, item4 = $5, item5 = $6, item6 = $7
                    WHERE match_id = $8 AND puuid = $9`,
                    [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6, matchId, p.puuid]
                );
            }

            console.log(`[${i + 1}/${rows.length}] ${matchId} done`);
        } catch (err) {
            console.error(`[${i + 1}/${rows.length}] ${matchId} failed`, err);
        }
    }

    console.log("Backfill complete.");
    process.exit(0);
}

backfill();