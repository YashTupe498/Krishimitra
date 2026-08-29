from abc import ABC, abstractmethod
from typing import List, Optional
from sqlalchemy.orm import Session
from app.modules.market_intelligence.models import MarketObservation
from sqlalchemy import desc

class MarketDataProvider(ABC):
    @abstractmethod
    def get_latest_observations(self, db: Session, crop: str, district: str, state: str, limit: int = 5) -> List[MarketObservation]:
        pass

class DatasetMarketDataProvider(MarketDataProvider):
    """
    Retrieves data ingested from the static market dataset.
    """
    def get_latest_observations(self, db: Session, crop: str, district: str, state: str, limit: int = 5) -> List[MarketObservation]:
        # Simple exact match for district/state to find relevant market observations
        # In a future phase, a more sophisticated spatial or fallback query can be implemented.
        query = db.query(MarketObservation).filter(
            MarketObservation.crop.ilike(crop),
            MarketObservation.district.ilike(district),
            MarketObservation.state.ilike(state)
        ).order_by(desc(MarketObservation.observation_date)).limit(limit)
        
        return query.all()
