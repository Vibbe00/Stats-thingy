import { config } from "../config";
import { redis } from "../cache/redis";
import type { RiotAccount, Summoner, LeagueEntry, Match } from "./types";

// Dev key limits: 20 req/s, 100 req/2min
// We stay conservative: 1 request per 60ms (~16/s)
const REQUEST_INTERVAL_MS = 60;

class RiotClient {
    private lastRequestTime = 0;

    private async throttle(): Promise<void> {
        const now = Date.now();
        const wait = REQUEST_INTERVAL_MS - (now - this.lastRequestTime);
        if (wait > 0) await new Promise((res) => setTimeout(res, wait));
        this.lastRequestTime = Date.now();
    }

    private async riotFetch<T>(url: string): Promise<T> {
        await this.throttle();

        const res = await fetch(url, {
            headers: { "X-Riot-Token": config.riot.apiKey },
        });

        if (!res.ok) {
            const err = new Error(`Riot API error: ${res.status}`) as any;
            err.status = res.status;
            throw err;
        }

        return res.json() as Promise<T>;
    }

    async getAccountByRiotId(gameName: string, tagLine: string): Promise<RiotAccount> {
        const cacheKey = `account:${gameName}:${tagLine}`.toLowerCase();
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const data = await this.riotFetch<RiotAccount>(
            `https://${config.riot.regionGroup}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
        );

        await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
        return data;
    }

    async getSummonerByPuuid(puuid: string): Promise<Summoner> {
        const cacheKey = `summoner:puuid:${puuid}`;
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const data = await this.riotFetch<Summoner>(
            `https://${config.riot.region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`
        );

        await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
        return data;
    }

    async getLeagueEntries(puuid: string): Promise<LeagueEntry[]> {
        const cacheKey = `league:${puuid}`;
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const data = await this.riotFetch<LeagueEntry[]>(
            `https://${config.riot.region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`
        );

        await redis.set(cacheKey, JSON.stringify(data), "EX", 120);
        return data;
    }

    async getMatchIds(puuid: string, count = 10): Promise<string[]> {
        const cacheKey = `matchids:${puuid}:${count}`;
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const data = await this.riotFetch<string[]>(
            `https://${config.riot.regionGroup}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`
        );

        await redis.set(cacheKey, JSON.stringify(data), "EX", 60);
        return data;
    }

    async getMatch(matchId: string): Promise<Match> {
        const cacheKey = `match:${matchId}`;
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const data = await this.riotFetch<Match>(
            `https://${config.riot.regionGroup}.api.riotgames.com/lol/match/v5/matches/${matchId}`
        );

        await redis.set(cacheKey, JSON.stringify(data), "EX", 3600);
        return data;
    }
}

export const riotClient = new RiotClient();