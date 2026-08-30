from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date

class LocationInfo(BaseModel):
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

class MarketSnapshotSchema(BaseModel):
    market_name: str
    min_price: Optional[float]
    modal_price: Optional[float]
    max_price: Optional[float]
    price_unit: str

class MarketTrendSchema(BaseModel):
    direction: str  # UP, DOWN, STABLE, INSUFFICIENT_DATA
    price_change: Optional[float]
    percentage_change: Optional[float]

class MarketPressureSchema(BaseModel):
    pressure: str  # LOW, MODERATE, HIGH, INSUFFICIENT_DATA
    reasons: List[str]

class SaleWindowSchema(BaseModel):
    window: str  # FAVORABLE_NOW, CONSIDER_WAITING, NEUTRAL, INSUFFICIENT_DATA
    advice: str

class MarketHistorySchema(BaseModel):
    date: date
    modal_price: Optional[float]
    arrival_quantity: Optional[float]

class MarketObservationSchema(MarketSnapshotSchema):
    observation_date: date
    freshness: str
    source_type: str
    source_name: str

class MarketIntelligenceResponse(BaseModel):
    lot_id: str
    crop: str
    location: LocationInfo
    
    snapshot: Optional[MarketSnapshotSchema]
    markets: List[MarketObservationSchema] = []
    selected_market: Optional[str] = None
    trend: MarketTrendSchema
    pressure: MarketPressureSchema
    sale_window: SaleWindowSchema
    history: List[MarketHistorySchema] = []
    
    data_freshness: str  # CURRENT, STALE, OUTDATED
    source_type: str
    source_name: str
    observation_date: Optional[date]

    model_config = ConfigDict(from_attributes=True)
