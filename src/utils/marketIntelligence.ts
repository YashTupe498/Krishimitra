export interface MarketPressureResult {
  level: "HIGH" | "MODERATE" | "LOW" | "INSUFFICIENT";
  title: string;
  description: string;
  basis: string;
}

export interface SellingWindowResult {
  level: "FAVORABLE" | "NEUTRAL" | "CAUTION" | "INSUFFICIENT";
  title: string;
  description: string;
  basis: string;
}

export function calculateMarketPressure(
  priceDirection: 'UP' | 'DOWN' | 'STABLE' | 'INSUFFICIENT_DATA',
  priceChangePercent: number | null,
  recentArrivals: number[]
): MarketPressureResult {
  if (priceDirection === 'INSUFFICIENT_DATA' && recentArrivals.length === 0) {
    return {
      level: "INSUFFICIENT",
      title: "Not enough data",
      description: "Recent arrival quantity data is unavailable to assess pressure.",
      basis: "Insufficient market observations"
    };
  }

  let arrivalTrend: 'DECREASING' | 'INCREASING' | 'STEADY' | 'UNKNOWN' = 'UNKNOWN';
  
  if (recentArrivals.length >= 2) {
    const current = recentArrivals[0];
    const prev = recentArrivals[1];
    if (current < prev * 0.9) arrivalTrend = 'DECREASING';
    else if (current > prev * 1.1) arrivalTrend = 'INCREASING';
    else arrivalTrend = 'STEADY';
  } else if (recentArrivals.length === 1) {
    // If only one arrival exists, infer tightening if price is significantly up
    if (priceDirection === 'UP' && (priceChangePercent !== null && priceChangePercent > 1)) {
       arrivalTrend = 'DECREASING'; 
    }
  } else if (recentArrivals.length === 0) {
    // If zero arrivals but prices are up, infer pressure from price alone
    if (priceDirection === 'UP') {
       arrivalTrend = 'DECREASING';
    }
  }

  if (priceDirection === 'UP' && (arrivalTrend === 'DECREASING' || arrivalTrend === 'UNKNOWN')) {
    return {
      level: "HIGH",
      title: "High",
      description: "Arrivals are tightening while prices are moving upward, indicating stronger near-term supply pressure.",
      basis: "Based on recent price and arrival observations"
    };
  }
  
  if (priceDirection === 'DOWN' && (arrivalTrend === 'INCREASING' || arrivalTrend === 'UNKNOWN')) {
    return {
      level: "LOW",
      title: "Low",
      description: "Supply appears adequate as prices trend downward.",
      basis: "Based on recent price and arrival observations"
    };
  }
  
  return {
    level: "MODERATE",
    title: "Moderate",
    description: "Market forces appear balanced with mixed or steady price and arrival signals.",
    basis: "Based on recent price and arrival observations"
  };
}

export function calculateSellingWindow(
  pressureLevel: "HIGH" | "MODERATE" | "LOW" | "INSUFFICIENT",
  priceDirection: 'UP' | 'DOWN' | 'STABLE' | 'INSUFFICIENT_DATA'
): SellingWindowResult {
  if (pressureLevel === 'INSUFFICIENT' && priceDirection === 'INSUFFICIENT_DATA') {
    return {
      level: "INSUFFICIENT",
      title: "Not enough data to determine a clear window.",
      description: "Insufficient price trends or arrival data prevents a confident assessment.",
      basis: ""
    };
  }

  if (priceDirection === 'UP' && (pressureLevel === 'HIGH' || pressureLevel === 'MODERATE')) {
    return {
      level: "FAVORABLE",
      title: "Favorable",
      description: "Current price momentum and tighter arrivals indicate a relatively favorable near-term selling window.",
      basis: "Based on recent market pressure"
    };
  }

  if (priceDirection === 'DOWN') {
    return {
      level: "CAUTION",
      title: "Consider waiting",
      description: "Declining prices suggest a cautious approach. Consider waiting if quality allows.",
      basis: "Based on recent price and arrival observations"
    };
  }

  return {
    level: "NEUTRAL",
    title: "Neutral",
    description: "Market conditions are relatively stable. Monitor for future price momentum.",
    basis: "Based on recent observations"
  };
}

export interface BuyerMatchResult {
  requirementId: string;
  buyerId: string;
  matchPercentage: number;
  cropCompatible: boolean;
  quantityCompatible: 'FULL' | 'PARTIAL' | 'NONE';
  gradeCompatible: boolean;
  locationCompatible: boolean;
  reasons: string[];
}

// Compare farmer lot with buyer requirements
export function calculateBuyerMatch(lot: any, requirement: any): BuyerMatchResult {
  const isCropMatch = lot.crop.toLowerCase() === requirement.crop.toLowerCase();
  
  let quantityMatch: 'FULL' | 'PARTIAL' | 'NONE' = 'NONE';
  if (lot.quantity >= requirement.quantityRequired) {
    quantityMatch = 'FULL';
  } else if (lot.quantity >= requirement.minimumAcceptableLotQuantity) {
    quantityMatch = 'PARTIAL';
  }

  const isGradeMatch = requirement.acceptedQualityGrades.includes(lot.qualityGrade) || requirement.acceptedQualityGrades.includes('PENDING');
  const isLocationMatch = requirement.district.toLowerCase() === lot.district.toLowerCase();

  let score = 0;
  let maxScore = 4;
  const reasons: string[] = [];

  if (isCropMatch) { score++; reasons.push("Crop match"); }
  if (quantityMatch === 'FULL') { score++; reasons.push("Quantity fully met"); }
  else if (quantityMatch === 'PARTIAL') { score += 0.5; reasons.push("Quantity partially met"); }
  
  if (isGradeMatch) { score++; reasons.push("Quality grade match"); }
  if (isLocationMatch) { score++; reasons.push("Location match"); }

  return {
    requirementId: requirement.id,
    buyerId: requirement.buyerId,
    matchPercentage: Math.round((score / maxScore) * 100),
    cropCompatible: isCropMatch,
    quantityCompatible: quantityMatch,
    gradeCompatible: isGradeMatch,
    locationCompatible: isLocationMatch,
    reasons
  };
}

export interface OpportunityScoreResult {
  score: number | null;
  status: "STRONG" | "GOOD" | "FAIR" | "UNAVAILABLE";
  reasons: string[];
}

export function calculateOpportunityScore(
  targetMarketPrice: number,
  highestMarketPrice: number,
  pressure: "HIGH" | "MODERATE" | "LOW" | "INSUFFICIENT",
  hasMatchingBuyer: boolean
): OpportunityScoreResult {
  if (!targetMarketPrice) return { score: null, status: "UNAVAILABLE", reasons: [] };

  let score = 50; // Base score
  const reasons: string[] = [];

  // Price component (up to +30)
  if (targetMarketPrice >= highestMarketPrice) {
    score += 30;
    reasons.push("Highest reported regional price");
  } else if (targetMarketPrice >= highestMarketPrice * 0.95) {
    score += 15;
    reasons.push("Highly competitive price");
  } else {
    // Add proportional points for prices above 70% of the maximum
    const ratio = targetMarketPrice / highestMarketPrice;
    if (ratio > 0.70) {
       score += Math.floor(((ratio - 0.70) / 0.25) * 14);
    }
    reasons.push("Price is below regional maximum");
  }

  // Pressure component (up to +20)
  if (pressure === "HIGH") {
    score += 20;
    reasons.push("Strong market demand pressure");
  } else if (pressure === "MODERATE") {
    score += 10;
  }

  // Buyer component
  if (hasMatchingBuyer) {
    score += 10;
    reasons.push("Verified buyer demand available");
  }

  // Cap at 98 for realism
  score = Math.min(score, 98);

  let status: "STRONG" | "GOOD" | "FAIR" = "FAIR";
  if (score >= 80) status = "STRONG";
  else if (score >= 60) status = "GOOD";

  return { score, status, reasons };
}

export function normalizeQuantity(quantity: number, unit: string): number {
  const qUnit = unit.toLowerCase();
  if (qUnit === 'quintal' || qUnit === 'quintals' || qUnit === 'q') return quantity * 100;
  if (qUnit === 'tonne' || qUnit === 'tonnes' || qUnit === 't' || qUnit === 'mt') return quantity * 1000;
  if (qUnit === 'kg' || qUnit === 'kilogram' || qUnit === 'kilograms') return quantity;
  return quantity; // Default to assuming it's kg or pre-normalized if unknown
}

export function calculateGrossValue(quantityKg: number, pricePerQuintal: number): number {
  return pricePerQuintal * (quantityKg / 100);
}

export function calculateNetRealization(grossValue: number, transportCost: number, storageCost: number = 0, handlingCost: number = 0): number {
  return grossValue - transportCost - storageCost - handlingCost;
}

export interface SellVsStoreResult {
  sellNowNetRs: number;
  storeNetRs: number;
  storeCostRs: number;
  expectedFuturePricePerQuintal: number;
  differenceRs: number;
  signal: 'SELL_NOW' | 'CONSIDER_STORAGE' | 'STORE' | 'UNAVAILABLE';
  isFavorable: boolean;
}

export type ArrivalTrend = 'INCREASING' | 'DECLINING' | 'STABLE' | 'INSUFFICIENT_DATA';

/** Compares the earliest and latest valid observations without inventing data. */
export function calculateArrivalTrend(arrivals: Array<number | null | undefined>): ArrivalTrend {
  const values = arrivals.filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0);
  if (values.length < 2 || values[0] === 0) return 'INSUFFICIENT_DATA';
  const change = (values[values.length - 1] - values[0]) / values[0];
  if (change > 0.1) return 'INCREASING';
  if (change < -0.1) return 'DECLINING';
  return 'STABLE';
}

export function calculateSellVsStore(
  quantityKg: number,
  pricePerQuintal: number | null,
  totalTransportCost: number | null,
  costPerTonnePerDayRs: number | null,
  days: number = 30,
  expectedFuturePricePerQuintal?: number | null,
  handlingCostRs: number = 0
): SellVsStoreResult {
  if (!pricePerQuintal || totalTransportCost === null || quantityKg <= 0) {
    return { sellNowNetRs: 0, storeNetRs: 0, storeCostRs: 0, expectedFuturePricePerQuintal: 0, differenceRs: 0, signal: 'UNAVAILABLE', isFavorable: false };
  }

  const grossValue = calculateGrossValue(quantityKg, pricePerQuintal);
  const sellNowNetRs = calculateNetRealization(grossValue, totalTransportCost, 0, handlingCostRs);

  if (costPerTonnePerDayRs === null) {
    return { sellNowNetRs, storeNetRs: sellNowNetRs, storeCostRs: 0, expectedFuturePricePerQuintal: pricePerQuintal, differenceRs: 0, signal: 'UNAVAILABLE', isFavorable: false };
  }

  const storeCostRs = costPerTonnePerDayRs * days * (quantityKg / 1000);
  const futurePrice = expectedFuturePricePerQuintal && expectedFuturePricePerQuintal > 0 ? expectedFuturePricePerQuintal : pricePerQuintal;
  const storeNetRs = calculateNetRealization(calculateGrossValue(quantityKg, futurePrice), totalTransportCost, storeCostRs, handlingCostRs);
  const differenceRs = storeNetRs - sellNowNetRs;
  const perQuintalDifference = differenceRs / (quantityKg / 100);
  const signal = differenceRs > Math.max(50, sellNowNetRs * 0.02) ? 'STORE' : perQuintalDifference >= -25 ? 'CONSIDER_STORAGE' : 'SELL_NOW';
  return { sellNowNetRs, storeNetRs, storeCostRs, expectedFuturePricePerQuintal: futurePrice, differenceRs, signal, isFavorable: signal !== 'SELL_NOW' };
}
