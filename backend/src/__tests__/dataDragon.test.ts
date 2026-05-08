jest.mock("../cache/redis", () => ({ redis: {} }));

import {
    profileIconUrl,
    itemIconUrl,
    championIconUrl,
    summonerSpellIconUrl,
} from "../middleware/dataDragon";

const VERSION = "16.8.1";

describe("profileIconUrl", () => {
    it("returns correct URL", () => {
        expect(profileIconUrl(4862, VERSION)).toBe(
            "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/4862.png"
        );
    });
});

describe("itemIconUrl", () => {
    it("returns correct URL for a valid item", () => {
        expect(itemIconUrl(3031, VERSION)).toBe(
            "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/item/3031.png"
        );
    });

    it("returns null for empty item slot (id 0)", () => {
        expect(itemIconUrl(0, VERSION)).toBeNull();
    });
});

describe("championIconUrl", () => {
    it("returns correct URL for a normal champion", () => {
        expect(championIconUrl("Jinx", VERSION)).toBe(
            "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Jinx.png"
        );
    });

    it("corrects Fiddlesticks to FiddleSticks", () => {
        expect(championIconUrl("Fiddlesticks", VERSION)).toBe(
            "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/FiddleSticks.png"
        );
    });

    it("does not alter champions that don't need fixing", () => {
        expect(championIconUrl("Ahri", VERSION)).toContain("/Ahri.png");
        expect(championIconUrl("DrMundo", VERSION)).toContain("/DrMundo.png");
        expect(championIconUrl("Leblanc", VERSION)).toContain("/Leblanc.png");
    });
});

describe("summonerSpellIconUrl", () => {
    it("returns correct URL for Flash", () => {
        expect(summonerSpellIconUrl(4, VERSION)).toBe(
            "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/spell/SummonerFlash.png"
        );
    });

    it("returns correct URL for Ignite", () => {
        expect(summonerSpellIconUrl(14, VERSION)).toBe(
            "https://ddragon.leagueoflegends.com/cdn/16.8.1/img/spell/SummonerDot.png"
        );
    });

    it("returns null for empty spell (id 0)", () => {
        expect(summonerSpellIconUrl(0, VERSION)).toBeNull();
    });

    it("returns null for unknown spell id", () => {
        expect(summonerSpellIconUrl(9999, VERSION)).toBeNull();
    });
});