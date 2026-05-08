import { errorHandler } from "../middleware/errorHandler";
import type { Request, Response, NextFunction } from "express";

// Minimal mock for Express Response
function mockRes() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
}

const mockReq = {} as Request;
const mockNext = jest.fn() as NextFunction;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("errorHandler", () => {
    it("handles Riot API 404 error", () => {
        const err = new Error("Riot API error: 404") as any;
        err.status = 404;
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: "Summoner or resource not found",
        });
    });

    it("handles Riot API 429 rate limit", () => {
        const err = new Error("Riot API error: 429") as any;
        err.status = 429;
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith({
            error: "Rate limit exceeded — try again shortly",
        });
    });

    it("handles Riot API 401 invalid key", () => {
        const err = new Error("Riot API error: 401") as any;
        err.status = 401;
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid Riot API key",
        });
    });

    it("handles unknown Riot API status codes", () => {
        const err = new Error("Riot API error: 502") as any;
        err.status = 502;
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(502);
        expect(res.json).toHaveBeenCalledWith({
            error: "Riot API error",
        });
    });

    it("handles VALIDATION errors", () => {
        const err = new Error("VALIDATION: Invalid queue parameter");
        const res = mockRes();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Invalid queue parameter",
        });
    });

    it("handles generic errors as 500", () => {
        const err = new Error("Something unexpected");
        const res = mockRes();
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();

        errorHandler(err, mockReq, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Internal server error",
        });

        consoleSpy.mockRestore();
    });
});