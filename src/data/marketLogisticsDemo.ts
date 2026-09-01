export interface LogisticsDemoData {
  marketId: string;
  marketName: string;
  sourceType: "CURATED_DEMO";
  route: {
    origin: string;
    destination: string;
  };
  distanceKm: number;
  transportType: string;
  estimatedCostRs: number;
  estimatedTimeMin: number;
  availability: "AVAILABLE" | "UNAVAILABLE";
}

export const marketLogisticsDemo: Record<string, LogisticsDemoData> = {
  "pimpalgaon-baswant": {
    marketId: "pimpalgaon-baswant",
    marketName: "Pimpalgaon Baswant APMC",
    sourceType: "CURATED_DEMO",
    route: {
      origin: "Nashik Farm",
      destination: "Pimpalgaon Baswant APMC"
    },
    distanceKm: 32,
    transportType: "Mini Truck (1.5T)",
    estimatedCostRs: 1200,
    estimatedTimeMin: 45,
    availability: "AVAILABLE"
  },
  "lasalgaon-vinchur": {
    marketId: "lasalgaon-vinchur",
    marketName: "Lasalgaon (Vinchur) APMC",
    sourceType: "CURATED_DEMO",
    route: {
      origin: "Nashik Farm",
      destination: "Lasalgaon (Vinchur) APMC"
    },
    distanceKm: 58,
    transportType: "Pickup (1T)",
    estimatedCostRs: 1800,
    estimatedTimeMin: 75,
    availability: "AVAILABLE"
  },
  "yeola": {
    marketId: "yeola", marketName: "Yeola APMC", sourceType: "CURATED_DEMO",
    route: { origin: "Nashik Farm", destination: "Yeola APMC" }, distanceKm: 82,
    transportType: "Mini Truck (1.5T)", estimatedCostRs: 2300, estimatedTimeMin: 110, availability: "AVAILABLE"
  },
  "manmad": {
    marketId: "manmad", marketName: "Manmad APMC", sourceType: "CURATED_DEMO",
    route: { origin: "Nashik Farm", destination: "Manmad APMC" }, distanceKm: 96,
    transportType: "Mini Truck (1.5T)", estimatedCostRs: 2700, estimatedTimeMin: 130, availability: "AVAILABLE"
  }
};
