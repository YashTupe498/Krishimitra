export interface StorageDemoData {
  marketId: string;
  marketName: string;
  sourceType: "CURATED_DEMO";
  centerName: string;
  distanceKm: number;
  availableCapacityTonnes: number;
  costPerTonnePerDayRs: number;
  availability: "AVAILABLE" | "UNAVAILABLE";
  suitableFor: string[];
}

export const marketStorageDemo: Record<string, StorageDemoData> = {
  "pimpalgaon-baswant": {
    marketId: "pimpalgaon-baswant",
    marketName: "Pimpalgaon Baswant APMC",
    sourceType: "CURATED_DEMO",
    centerName: "Pimpalgaon Cold Chain & Warehousing",
    distanceKm: 8,
    availableCapacityTonnes: 120,
    costPerTonnePerDayRs: 15,
    availability: "AVAILABLE",
    suitableFor: ["Onion", "Grapes", "Tomato"]
  },
  "lasalgaon-vinchur": {
    marketId: "lasalgaon-vinchur",
    marketName: "Lasalgaon (Vinchur) APMC",
    sourceType: "CURATED_DEMO",
    centerName: "Vinchur FPO Storage Hub",
    distanceKm: 4,
    availableCapacityTonnes: 450,
    costPerTonnePerDayRs: 12,
    availability: "AVAILABLE",
    suitableFor: ["Onion", "Garlic"]
  }
};
