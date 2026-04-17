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
    },

    databaseUrl: required("DATABASE_URL"),
    redisURL: required("REDIS_URL"),
};