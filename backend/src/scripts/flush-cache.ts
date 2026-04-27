import { redis } from "../cache/redis";

redis.flushdb().then((res) => {
    console.log("Flushed:", res);
    process.exit();
});

//// USAGE: npx ts-node-dev src/scripts/flush-cache.ts