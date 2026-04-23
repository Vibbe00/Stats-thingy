import { config } from "../config";
import { redis } from "../cache/redis";
import type { RegionConfig } from "../middleware/regions";
import type { RiotAccount, Summoner, LeagueEntry, Match } from "./types";

// Dev key limits: 20 req/s, 100 req/2min
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

    async getAccountByRiotId(gameName: string, tagLine: string, region: RegionConfig): Promise<RiotAccount> {
        const cacheKey = `account:${region.regional}:${gameName}:${tagLine}`.toLowerCase();
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const data = await this.riotFetch<RiotAccount>(
            `https://${region.regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
        );

        await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
        return data;
    }

    async getSummonerByPuuid(puuid: string, region: RegionConfig): Promise<Summoner> {
        const cacheKey = `summoner:${region.platform}:${puuid}`;
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const data = await this.riotFetch<Summoner>(
            `https://${region.platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`
        );

        await redis.set(cacheKey, JSON.stringify(data), "EX", 300);
        return data;
    }

    async getLeagueEntries(puuid: string, region: RegionConfig): Promise<LeagueEntry[]> {
        const cacheKey = `league:${region.platform}:${puuid}`;
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const data = await this.riotFetch<LeagueEntry[]>(
            `https://${region.platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`
        );

        await redis.set(cacheKey, JSON.stringify(data), "EX", 120);
        return data;
    }

    async getMatchIds(puuid: string, region: RegionConfig, count = 20, queues?: number[]): Promise<string[]> {
        const queueParams = queues?.map(q => `queue=${q}`).join("&") ?? "";
        const cacheKey = `matchids:${region.regional}:${puuid}:${count}:${queueParams}`;
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const queryString = [`count=${count}`, queueParams].filter(Boolean).join("&");
        const data = await this.riotFetch<string[]>(
            `https://${region.regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?${queryString}`
        );

        await redis.set(cacheKey, JSON.stringify(data), "EX", 60);
        return data;
    }

    async getMatch(matchId: string, region: RegionConfig): Promise<Match> {
        const cacheKey = `match:${matchId}`;
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const data = await this.riotFetch<Match>(
            `https://${region.regional}.api.riotgames.com/lol/match/v5/matches/${matchId}`
        );

        await redis.set(cacheKey, JSON.stringify(data), "EX", 3600);
        return data;
    }

    async getMatchIdsBatch(
        puuid: string,
        region: RegionConfig,
        start: number,
        count: number,
        queues?: number[],
        startTime?: number
    ): Promise<string[]> {
        const params = [`start=${start}`, `count=${count}`];
        if (queues) params.push(...queues.map(q => `queue=${q}`));
        if (startTime) params.push(`startTime=${startTime}`);

        return this.riotFetch<string[]>(`https://${region.regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?${params.join("&")}`);
    }
}

export const riotClient = new RiotClient();