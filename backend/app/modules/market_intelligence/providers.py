from abc import ABC, abstractmethod
from typing import List, Optional
from sqlalchemy.orm import Session
from app.modules.market_intelligence.models import MarketObservation
from sqlalchemy import desc, func
from app.core.locations import location_key

class MarketDataProvider(ABC):
    @abstractmethod
    def get_latest_observations(self, db: Session, crop: str, district: str, state: str, limit: int = 5) -> List[MarketObservation]:
        pass

class DatasetMarketDataProvider(MarketDataProvider):
    """
    Retrieves data ingested from the static market dataset.
    """
    def get_latest_observations(self, db: Session, crop: str, district: str, state: str, limit: int = 5) -> List[MarketObservation]:
        district_key = location_key(district)
        state_key = location_key(state)
        district_candidates = {district.casefold().strip(), district_key}
        state_candidates = {state.casefold().strip(), state_key}

        if not district_key or not state_key:
            return []

        # Compare canonical administrative-area forms. This keeps a genuine
        # "Nashik District" lot compatible with "Nashik" market records,
        # without broadening the lookup to a different district or state.
        query = db.query(MarketObservation).filter(
            MarketObservation.crop.ilike(crop),
            func.lower(MarketObservation.district).in_(district_candidates),
            func.lower(MarketObservation.state).in_(state_candidates)
        ).order_by(desc(MarketObservation.observation_date)).limit(limit)
        
        return query.all()
