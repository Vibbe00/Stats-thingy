import { getRegion, VALID_REGIONS } from "../middleware/regions";

describe("getRegion", () => {
    it("returns correct config for EUW", () => {
        const region = getRegion("euw");
        expect(region).toEqual({ platform: "euw1", regional: "europe" });
    });

    it("returns correct config for NA", () => {
        const region = getRegion("na");
        expect(region).toEqual({ platform: "na1", regional: "americas" });
    });

    it("returns correct config for KR", () => {
        const region = getRegion("kr");
        expect(region).toEqual({ platform: "kr", regional: "asia" });
    });

    it("returns correct config for OCE (SEA regional)", () => {
        const region = getRegion("oce");
        expect(region).toEqual({ platform: "oc1", regional: "sea" });
    });

    it("is case-insensitive", () => {
        expect(getRegion("EUW")).toEqual(getRegion("euw"));
        expect(getRegion("Na")).toEqual(getRegion("na"));
        expect(getRegion("KR")).toEqual(getRegion("kr"));
    });

    it("returns null for invalid region", () => {
        expect(getRegion("invalid")).toBeNull();
        expect(getRegion("")).toBeNull();
        expect(getRegion("us")).toBeNull();
    });
});

describe("VALID_REGIONS", () => {
    it("contains 16 regions", () => {
        expect(VALID_REGIONS).toHaveLength(16);
    });

    it("includes all major regions", () => {
        const expected = ["euw", "eune", "na", "kr", "jp", "br", "oce"];
        for (const r of expected) {
            expect(VALID_REGIONS).toContain(r);
        }
    });
});

describe("region groupings", () => {
    it("maps all European regions to europe", () => {
        const europeRegions = ["euw", "eune", "tr", "ru"];
        for (const r of europeRegions) {
            expect(getRegion(r)?.regional).toBe("europe");
        }
    });

    it("maps all American regions to americas", () => {
        const americasRegions = ["na", "br", "lan", "las"];
        for (const r of americasRegions) {
            expect(getRegion(r)?.regional).toBe("americas");
        }
    });

    it("maps Asian regions to asia", () => {
        const asiaRegions = ["kr", "jp"];
        for (const r of asiaRegions) {
            expect(getRegion(r)?.regional).toBe("asia");
        }
    });

    it("maps SEA regions to sea", () => {
        const seaRegions = ["oce", "ph", "sg", "th", "tw", "vn"];
        for (const r of seaRegions) {
            expect(getRegion(r)?.regional).toBe("sea");
        }
    });
});