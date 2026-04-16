import { Request, Response, NextFunction } from "express";
import { getRegion, RegionConfig } from "./regions";

declare global {
    namespace Express {
        interface Locals {
            region: RegionConfig;
        }
    }
}

export function regionResolver(req: Request, res: Response, next: NextFunction): void {
    const region = getRegion(req.params.region);
    if (!region) {
        res.status(400).json({ error: "Invalid region" });
        return;
    }
    res.locals.region = region;
    next();
}