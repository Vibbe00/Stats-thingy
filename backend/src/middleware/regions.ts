export interface RegionConfig {
    platform: string;
    regional: string;
}

const REGIONS: Record<string, RegionConfig> = {
    euw: { platform: "euw1", regional: "europe" },
    eune: { platform: "eun1", regional: "europe" },
    tr: { platform: "tr1", regional: "europe" },
    ru: { platform: "ru", regional: "europe" },
    na: { platform: "na1", regional: "americas" },
    br: { platform: "br1", regional: "americas" },
    lan: { platform: "la1", regional: "americas" },
    las: { platform: "la2", regional: "americas" },
    kr: { platform: "kr", regional: "asia" },
    jp: { platform: "jp1", regional: "asia" },
    oce: { platform: "oc1", regional: "sea" },
    ph: { platform: "ph2", regional: "sea" },
    sg: { platform: "sg2", regional: "sea" },
    th: { platform: "th2", regional: "sea" },
    tw: { platform: "tw2", regional: "sea" },
    vn: { platform: "vn2", regional: "sea" },
};

export function getRegion(key: string): RegionConfig | null {
    return REGIONS[key.toLowerCase()] ?? null;
}

export const VALID_REGIONS = Object.keys(REGIONS);