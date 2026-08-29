from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.lots.models import Lot
from app.modules.market_intelligence.providers import MarketDataProvider
from app.modules.market_intelligence.schemas import (
    MarketIntelligenceResponse, LocationInfo, MarketSnapshotSchema,
    MarketTrendSchema, MarketPressureSchema, SaleWindowSchema
)
from app.modules.market_intelligence.services.analytics import (
    analyze_trend, analyze_pressure, analyze_sale_window
)
from app.modules.market_intelligence.services.freshness import calculate_freshness

class MarketIntelligenceService:
    def __init__(self, provider: MarketDataProvider):
        self.provider = provider

    def get_intelligence_for_lot(
        self, db: Session, lot_id: str, farmer_id: str,
        mock_crop: str = None, mock_district: str = None, mock_state: str = None
    ) -> MarketIntelligenceResponse:
        # 1. Verify Lot Ownership
        lot = db.query(Lot).filter(Lot.id == lot_id, Lot.farmer_id == farmer_id).first()
        
        if lot:
            crop = lot.crop
            district = lot.district
            state = lot.state
        elif mock_crop and mock_district and mock_state:
            # Transitional fallback for Phase 0 frontend mock lots
            crop = mock_crop
            district = mock_district
            state = mock_state
        else:
            raise HTTPException(status_code=404, detail="Lot not found or access denied")
            
        # 2. Retrieve Market Observations
        # We need state and district to find a relevant market
        if not district or not state:
            raise HTTPException(status_code=400, detail="Lot location (district/state) is required for market intelligence")
            
        observations = self.provider.get_latest_observations(db, crop, district, state, limit=10)
        
        location_info = LocationInfo(
            village=lot.village if lot else "",
            taluka=lot.taluka if lot else "",
            district=lot.district if lot else district,
            state=lot.state if lot else state
        )

        if not observations:
            # Handle DATA_UNAVAILABLE
            return MarketIntelligenceResponse(
                lot_id=lot_id,
                crop=crop,
                location=location_info,
                snapshot=None,
                trend=MarketTrendSchema(direction="INSUFFICIENT_DATA", price_change=None, percentage_change=None),
                pressure=MarketPressureSchema(pressure="INSUFFICIENT_DATA", reasons=["No market data available for this location."]),
                sale_window=SaleWindowSchema(window="INSUFFICIENT_DATA", advice="Cannot determine sale window without market data."),
                data_freshness="OUTDATED",
                source_type="NONE",
                source_name="Unavailable",
                observation_date=None
            )

        # 3. Process Latest Observation (Snapshot)
        latest = observations[0]
        snapshot = MarketSnapshotSchema(
            market_name=latest.market_name,
            min_price=float(latest.min_price) if latest.min_price else None,
            modal_price=float(latest.modal_price) if latest.modal_price else None,
            max_price=float(latest.max_price) if latest.max_price else None,
            price_unit=latest.price_unit
        )
        
        # 4. Analytics
        trend = analyze_trend(observations)
        pressure = analyze_pressure(observations, trend)
        sale_window = analyze_sale_window(trend, pressure)
        freshness = calculate_freshness(latest.observation_date)
        
        history = [
            {
                "date": obs.observation_date,
                "modal_price": float(obs.modal_price) if obs.modal_price else None,
                "arrival_quantity": float(obs.arrival_quantity) if obs.arrival_quantity else None
            }
            for obs in observations
        ]

        # 5. Return Response
        return MarketIntelligenceResponse(
            lot_id=lot_id,
            crop=crop,
            location=location_info,
            snapshot=snapshot,
            trend=trend,
            pressure=pressure,
            sale_window=sale_window,
            history=history,
            data_freshness=freshness,
            source_type=latest.source_type,
            source_name=latest.source_name,
            observation_date=latest.observation_date
        )
