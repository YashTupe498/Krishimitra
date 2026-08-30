export interface MarketLocation {
  village: string | null;
  taluka: string | null;
  district: string;
  state: string;
}

export interface MarketSnapshot {
  market_name: string;
  min_price: number | null;
  modal_price: number | null;
  max_price: number | null;
  price_unit: string;
}

export interface MarketTrend {
  direction: 'UP' | 'DOWN' | 'STABLE' | 'INSUFFICIENT_DATA';
  price_change: number | null;
  percentage_change: number | null;
}

export interface MarketPressure {
  pressure: 'LOW' | 'MODERATE' | 'HIGH' | 'INSUFFICIENT_DATA';
  reasons: string[];
}

export interface SaleWindow {
  window: 'FAVORABLE_NOW' | 'CONSIDER_WAITING' | 'NEUTRAL' | 'INSUFFICIENT_DATA';
  advice: string;
}

export interface MarketHistory {
  date: string;
  modal_price: number | null;
  arrival_quantity: number | null;
}
export interface NearbyMarket extends MarketSnapshot {
  observation_date: string;
  freshness: string;
  source_type: string;
  source_name: string;
}

export interface MarketIntelligenceData {
  lot_id: string;
  crop: string;
  location: MarketLocation;
  snapshot: MarketSnapshot | null;
  markets: NearbyMarket[];
  selected_market: string | null;
  trend: MarketTrend;
  pressure: MarketPressure;
  sale_window: SaleWindow;
  history: MarketHistory[];
  data_freshness: 'CURRENT' | 'STALE' | 'OUTDATED';
  source_type: string;
  source_name: string;
  observation_date: string | null;
}
