import { Request, Response, NextFunction } from "express";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    // Riot API errors thrown by riotFetch
    if (err instanceof Error && "status" in err) {
        const status = (err as any).status as number;
        const messages: Record<number, string> = {
            400: "Bad request - check summoner name and tag",
            401: "Invalid Riot API key",
            403: "Forbidden — check your API key",
            404: "Summoner or resource not found",
            429: "Rate limit exceeded — try again shortly",
            500: "Riot API server error - try again later",
            503: "Riot API is unavailable - try again later",
        };
        res.status(status).json({ error: messages[status] ?? "Riot API error" });
        return;
    }

    // Validation errors thrown manually in routes
    if (err instanceof Error && err.message.startsWith("VALIDATION")) {
        res.status(400).json({ error: err.message.replace("VALIDATION: ", "") });
        return;
    }

    console.error("[Error]", err);
    res.status(500).json({ error: "Internal server error" });
}