import { db, connectDB } from "../db";
import { riotClient } from "../riot/client";
import { storeMatch, getExistingMatchIds } from "../db/queries";
import { getRegion } from "../middleware/regions"

const REGION_KEY = process.argv[2];
const GAME_NAME = process.argv[3];
const TAG_LINE = process.argv[4];

if (!REGION_KEY || !GAME_NAME || !TAG_LINE) {
    console.error("Usage: npx ts-node-dev src/scripts/season_sync.ts <region> <gameName> <tagLine>");
    process.exit(1);
}

const region = getRegion(REGION_KEY);
if (!region) {
    console.error(`Invalid region: ${REGION_KEY}`);
    process.exit(1);
}

const ALL_QUEUES = [400, 420, 440];
const BATCH_SIZE = 100;
const SEASON_START = Math.floor(new Date("2026-01-08T00:00:00Z").getTime() / 1000);

async function sync() {
    await connectDB();

    const account = await riotClient.getAccountByRiotId(GAME_NAME, TAG_LINE, region!);
    const { puuid } = account;

    console.log(`Syncing ${GAME_NAME}#${TAG_LINE} (${REGION_KEY})`);

    let start = 0;
    let newStored = 0;
    let skipped = 0;

    while (true) {
        const matchIds = await riotClient.getMatchIdsBatch(
            puuid, region!, start, BATCH_SIZE, undefined, SEASON_START
        );


        if (matchIds.length === 0) break;

        const existing = await getExistingMatchIds(matchIds);

        for (const matchId of matchIds) {
            if (existing.has(matchId)) {
                skipped++;
                continue;
            }

            try {
                const match = await riotClient.getMatch(matchId, region!);
                await storeMatch(match);
                newStored++;
                console.log(`[${newStored + skipped}] Stored ${matchId}`);
            } catch (err) {
                console.error(`[${newStored + skipped}] Failed ${matchId}:`, err);
            }
        }

        if (matchIds.length < BATCH_SIZE) break;
        start += BATCH_SIZE;
    }

    console.log(`Done. New: ${newStored}, Skipped: ${skipped}`);
    process.exit(0);
}

sync();