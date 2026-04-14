import { redis } from "../cache/redis";

const VERSION_URL = "https://ddragon.leagueoflegends.com/api/versions.json";
const CACHE_KEY = "ddragon:version";
const CACHE_TTL = 60 * 60 * 24;

let cachedVersion: string | null = null;

export async function getDDragonVersion(): Promise<string> {
    // Check in-memory cache first
    if (cachedVersion) return cachedVersion;

    // Check Redis cache
    const redisVal = await redis.get(CACHE_KEY);
    if (redisVal) {
        cachedVersion = redisVal;
        return cachedVersion;
    }

    // Fetch from Data Dragon
    const res = await fetch(VERSION_URL);
    if (!res.ok) throw new Error("Failed to fetch Data Dragon version");

    const version: string[] = await res.json();
    const latest = version[0];

    await redis.set(CACHE_KEY, latest, "EX", CACHE_TTL);
    cachedVersion = latest;

    console.log(`Fetched and cached Data Dragon version: ${latest}`);
    return latest;
}

export function profileIconUrl(iconId: number, version: string) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`;
}

export function itemIconUrl(itemId: number, version: string) {
    if (itemId === 0) return null; // no item
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`;
}

export function championIconUrl(championName: string, version: string): string {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`;
}