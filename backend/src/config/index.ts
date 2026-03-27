import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
    const val = process.env[key];
    if (!val) throw new Error(`Missing required env var: ${key}`);
    return val;
}

export const config = {
    port: parseInt(process.env.PORT ?? "3000"),

    riot: {
        apiKey: required("RIOT_API_KEY"),
        // Platform route | used for league, mastery endpoints (na1, euw1, eun1, kr, etc.)
        region: required("RIOT_REGION"),
        // Regional route | used for match-v5 (americas, europe, asia, sea)
        regionGroup: required("RIOT_REGION_GROUP"),
    },

    databaseUrl: required("DATABASE_URL"),
    redisURL: required("REDIS_URL"),
};