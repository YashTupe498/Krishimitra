import type { Lot } from '../../types/lot';
import type { 
  MarketSnapshot, 
  MarketTrend, 
  MarketPressure as MarketPressureType, 
  SaleWindow as SaleWindowType, 
  MarketHistory 
} from '../../types/market';
import { marketResearchDataset } from '../../data/marketResearchDataset';
import { marketLogisticsDemo } from '../../data/marketLogisticsDemo';
import type { LogisticsDemoData } from '../../data/marketLogisticsDemo';
import { marketStorageDemo } from '../../data/marketStorageDemo';
import type { StorageDemoData } from '../../data/marketStorageDemo';
import { 
  calculateMarketPressure, 
  calculateSellingWindow, 
  calculateOpportunityScore,
  normalizeQuantity,
  calculateGrossValue,
  calculateNetRealization,
  calculateSellVsStore,
  calculateArrivalTrend
} from '../../utils/marketIntelligence';
import type { SellVsStoreResult } from '../../utils/marketIntelligence';

// Define the unified source metadata
export type DataSource = "LIVE" | "PROJECT_DATA" | "SUPPLIED_DATA" | "CURATED_DEMO" | "UNAVAILABLE";

export interface UnifiedMarketIntelligence {
  lot: Lot;
  selectedMarketId: string;
  selectedMarketName: string;
  
  // Market Info
  snapshot: MarketSnapshot;
  nearbyMarkets: MarketReference[];
  highestNearbyPrice: number;
  nearbyNetRealizationPerQuintal: Record<string, number | null>;
  
  // Historical & Computed
  priceHistory: MarketHistory[];
  arrivalHistory: MarketHistory[];
  arrivalTrend: 'INCREASING' | 'DECLINING' | 'STABLE' | 'INSUFFICIENT_DATA';
  
  trend: MarketTrend;
  pressure: MarketPressureType & { level: string; description: string };
  sellingWindow: SaleWindowType & { level: string; description: string };
  
  // Opportunity
  opportunityScore: number | null;
  opportunityStatus: "STRONG" | "GOOD" | "FAIR" | "UNAVAILABLE";
  opportunityReasons: string[];
  
  // Logistics & Storage
  logistics: LogisticsDemoData | null;
  storage: StorageDemoData | null;
  
  // Unified Calculations
  normalizedQuantityKg: number;
  grossValueRs: number | null;
  netRealizationRs: number | null; // Sell now net
  netRealizationPerQuintal: number | null;
  sellVsStore: SellVsStoreResult | null;

  // Metadata
  sources: {
    price: DataSource;
    arrivals: DataSource;
    logistics: DataSource;
    storage: DataSource;
  };
  observationDate: string;
}

export interface MarketReference extends MarketSnapshot { marketId: string; }

const marketReferences: MarketReference[] = [
  { marketId: 'pimpalgaon-baswant', market_name: 'Pimpalgaon Baswant APMC', min_price: 3800, modal_price: 4200, max_price: 4500, price_unit: 'quintals' },
  { marketId: 'lasalgaon-vinchur', market_name: 'Lasalgaon (Vinchur) APMC', min_price: 3600, modal_price: 3650, max_price: 4400, price_unit: 'quintals' },
  { marketId: 'yeola', market_name: 'Yeola APMC', min_price: 3500, modal_price: 3600, max_price: 4200, price_unit: 'quintals' },
  { marketId: 'manmad', market_name: 'Manmad APMC', min_price: 3400, modal_price: 3600, max_price: 4100, price_unit: 'quintals' }
];

export async function getMarketIntelligence(lot: Lot, selectedMarket: string): Promise<UnifiedMarketIntelligence> {
  // Normalize market name for matching
  const normalizeMarketName = (name: string) => name.replace(/\(/g, ' (').replace(/  +/g, ' ').trim();
  const selectedReference = marketReferences.find(m => m.marketId === selectedMarket || normalizeMarketName(m.market_name) === normalizeMarketName(selectedMarket)) || marketReferences[0];
  const selectedMarketName = selectedReference.market_name;
  const selectedNormalized = normalizeMarketName(selectedMarketName);

  // 1. Snapshot and Nearby Markets
  const nearbyMarkets = marketReferences;
  const snapshot = selectedReference;
  const highestNearbyPrice = Math.max(...nearbyMarkets.map((m: any) => m.modal_price || 0));

  // 2. Price and Arrival History from Dataset
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getDate() ? d.getMonth() : 0]} ${d.getDate() || ''}`.trim();
  };

  const rawPriceHistory = marketResearchDataset
    .filter(d => d.metric === 'price' && normalizeMarketName(d.market) === selectedNormalized)
    .sort((a, b) => new Date(a.observationDate || '').getTime() - new Date(b.observationDate || '').getTime());
    
  const rawArrivalHistory = marketResearchDataset
    .filter(d => d.metric === 'arrival' && normalizeMarketName(d.market) === selectedNormalized && d.status === 'available')
    .sort((a, b) => new Date(a.observationDate || '').getTime() - new Date(b.observationDate || '').getTime());

  const priceHistory = rawPriceHistory.map(d => ({ date: formatDate(d.observationDate || ''), fullDate: d.observationDate, modal_price: d.value, arrival_quantity: null }));
  const arrivalHistory = rawArrivalHistory.map(d => ({ date: formatDate(d.observationDate || ''), fullDate: d.observationDate, modal_price: null, arrival_quantity: d.value, unit: d.unit }));

  // 3. Computed Trend
  const latestPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].modal_price : snapshot.modal_price;
  const prevPrice = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2].modal_price : null;
  
  let priceDirection: 'UP' | 'DOWN' | 'STABLE' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';
  let computedPct = 0;
  
  if (latestPrice && prevPrice) {
    const diff = latestPrice - prevPrice;
    priceDirection = diff > 0 ? 'UP' : diff < 0 ? 'DOWN' : 'STABLE';
    computedPct = Number((Math.abs(diff) / prevPrice * 100).toFixed(1));
  } else if (latestPrice) {
    priceDirection = 'STABLE';
  }

  const trend: MarketTrend = {
    direction: priceDirection,
    percentage_change: computedPct,
    price_change: latestPrice && prevPrice ? latestPrice - prevPrice : null
  };

  // 4. Pressure and Selling Window
  const recentArrivals = rawArrivalHistory.map(a => a.value).filter((value): value is number => typeof value === 'number').reverse(); // Newest first
  const pressureCalc = calculateMarketPressure(priceDirection, computedPct, recentArrivals);
  const windowCalc = calculateSellingWindow(pressureCalc.level, priceDirection);
  
  const pressure: MarketPressureType & { level: string; description: string } = {
    pressure: pressureCalc.level as any,
    reasons: [pressureCalc.basis],
    level: pressureCalc.level,
    description: pressureCalc.description
  };
  
  const sellingWindow: SaleWindowType & { level: string; description: string } = {
    window: windowCalc.level === 'FAVORABLE' ? 'FAVORABLE_NOW' : windowCalc.level === 'CAUTION' ? 'CONSIDER_WAITING' : windowCalc.level === 'NEUTRAL' ? 'NEUTRAL' : 'INSUFFICIENT_DATA',
    advice: windowCalc.description,
    level: windowCalc.level,
    description: windowCalc.description
  };

  // 5. Opportunity Score
  // Assuming a hardcoded matching buyer exists for the demo
  const hasMatchingBuyer = true; 
  const oppCalc = calculateOpportunityScore(snapshot.modal_price || 0, highestNearbyPrice, pressureCalc.level, hasMatchingBuyer);

  // 6. Logistics & Storage
  const logistics = marketLogisticsDemo[selectedReference.marketId] || null;
  const storage = marketStorageDemo[selectedReference.marketId] || null;

  // 7. Unified Financial Calculations
  const normalizedQuantityKg = normalizeQuantity(Number(lot.quantity) || 0, lot.unit);
  
  let grossValueRs: number | null = null;
  let netRealizationRs: number | null = null;
  let netRealizationPerQuintal: number | null = null;
  let sellVsStore: SellVsStoreResult | null = null;

  if (snapshot.modal_price) {
    grossValueRs = calculateGrossValue(normalizedQuantityKg, snapshot.modal_price);
    
    if (logistics) {
      // Calculate trips based on vehicle capacity
      const capacityKg = logistics.transportType.includes('1.5T') ? 1500 : logistics.transportType.includes('1T') ? 1000 : 1000;
      const tripsNeeded = Math.ceil(normalizedQuantityKg / capacityKg);
      const totalTransportCost = logistics.estimatedCostRs * tripsNeeded;
      
      netRealizationRs = calculateNetRealization(grossValueRs, totalTransportCost);
      netRealizationPerQuintal = netRealizationRs / (normalizedQuantityKg / 100);

      const storageCost = storage ? storage.costPerTonnePerDayRs : null;
      const expectedFuturePrice = snapshot.modal_price * (priceDirection === 'UP' ? 1.025 : priceDirection === 'DOWN' ? 0.985 : 1);
      sellVsStore = calculateSellVsStore(normalizedQuantityKg, snapshot.modal_price, totalTransportCost, storageCost, 30, expectedFuturePrice);
    }
  }

  // 8. Sources Metadata
  const mapSource = (s: string | undefined): DataSource => {
    if (!s) return "UNAVAILABLE";
    if (s === "CURATED_DEMO" || s === "CURATED") return "CURATED_DEMO";
    if (s === "LIVE" || s === "PROJECT_DATA" || s === "SUPPLIED_DATA") return s as DataSource;
    return "PROJECT_DATA";
  };

  const sources = {
    price: mapSource(rawPriceHistory[0]?.sourceType),
    arrivals: mapSource(rawArrivalHistory[0]?.sourceType),
    logistics: logistics ? mapSource(logistics.sourceType) : "UNAVAILABLE" as DataSource,
    storage: storage ? mapSource(storage.sourceType) : "UNAVAILABLE" as DataSource
  };

  const nearbyNetRealizationPerQuintal = Object.fromEntries(nearbyMarkets.map(market => {
    const marketLogistics = marketLogisticsDemo[market.marketId];
    if (!marketLogistics || normalizedQuantityKg <= 0 || !market.modal_price) return [market.marketId, null];
    const capacityKg = marketLogistics.transportType.includes('1.5T') ? 1500 : 1000;
    const cost = marketLogistics.estimatedCostRs * Math.ceil(normalizedQuantityKg / capacityKg);
    return [market.marketId, calculateNetRealization(calculateGrossValue(normalizedQuantityKg, market.modal_price), cost) / (normalizedQuantityKg / 100)];
  }));

  return {
    lot,
    selectedMarketId: selectedReference.marketId,
    selectedMarketName,
    snapshot,
    nearbyMarkets,
    highestNearbyPrice,
    nearbyNetRealizationPerQuintal,
    priceHistory,
    arrivalHistory,
    arrivalTrend: calculateArrivalTrend(rawArrivalHistory.map(item => item.value)),
    trend,
    pressure,
    sellingWindow,
    opportunityScore: oppCalc.score,
    opportunityStatus: oppCalc.status,
    opportunityReasons: oppCalc.reasons,
    logistics,
    storage,
    normalizedQuantityKg,
    grossValueRs,
    netRealizationRs,
    netRealizationPerQuintal,
    sellVsStore,
    sources,
    observationDate: rawPriceHistory[rawPriceHistory.length - 1]?.observationDate || '2026-08-29'
  };
}
