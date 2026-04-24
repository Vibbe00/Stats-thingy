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

const CHAMPION_NAME_FIXES: Record<string, string> = {
    Fiddlesticks: "FiddleSticks",
};

export function championIconUrl(championName: string, version: string): string {
    const name = CHAMPION_NAME_FIXES[championName] ?? championName;
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`;
}

export function summonerSpellIconUrl(spellId: number, version: string): string | null {
    if (spellId === 0 || !SUMMONER_SPELL_NAMES[spellId]) return null;
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${SUMMONER_SPELL_NAMES[spellId]}.png`;
}

const SUMMONER_SPELL_NAMES: Record<number, string> = {
    1: "SummonerBoost",
    3: "SummonerExhaust",
    4: "SummonerFlash",
    6: "SummonerHaste",
    7: "SummonerHeal",
    11: "SummonerSmite",
    12: "SummonerTeleport",
    13: "SummonerMana",
    14: "SummonerDot",
    21: "SummonerBarrier",
    30: "SummonerPoroRecall",
    31: "SummonerPoroThrow",
    32: "SummonerSnowball",
    39: "SummonerSnowURFSnowball_Mark",
    54: "Summoner_UltBookPlaceholder",
    55: "Summoner_UltBookSmitePlaceholder",
}