from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.lots.models import Lot
from app.modules.market_intelligence.providers import MarketDataProvider
from app.modules.market_intelligence.schemas import (
    MarketIntelligenceResponse, LocationInfo, MarketSnapshotSchema,
    MarketTrendSchema, MarketPressureSchema, SaleWindowSchema, MarketObservationSchema
)
from app.modules.market_intelligence.services.analytics import (
    analyze_trend, analyze_pressure, analyze_sale_window
)
from app.modules.market_intelligence.services.freshness import calculate_freshness

class MarketIntelligenceService:
    def __init__(self, provider: MarketDataProvider):
        self.provider = provider

    @staticmethod
    def _market_label(name: str) -> str:
        # Historical source uses the legacy label while the current dataset
        # identifies the same comparison market as Lasalgaon(Vinchur).
        return "Lasalgaon(Vinchur) APMC" if name == "Lasalgaon APMC" else name

    def get_intelligence_for_lot(
        self, db: Session, lot_id: str, farmer_id: str, market: str | None = None,
    ) -> MarketIntelligenceResponse:
        # 1. Verify Lot Ownership
        lot = db.query(Lot).filter(Lot.id == lot_id, Lot.farmer_id == farmer_id).first()
        
        if not lot:
            raise HTTPException(status_code=404, detail="Lot not found or access denied")
        crop = lot.crop
        district = lot.district
        state = lot.state
            
        # 2. Retrieve Market Observations
        # We need state and district to find a relevant market
        if not district or not state:
            raise HTTPException(status_code=400, detail="Lot location (district/state) is required for market intelligence")
            
        all_observations = self.provider.get_latest_observations(db, crop, district, state, limit=100)
        latest_by_market = {}
        for observation in all_observations:
            latest_by_market.setdefault(self._market_label(observation.market_name), observation)
        markets = list(latest_by_market.values())
        latest = next((item for item in markets if self._market_label(item.market_name) == market), None) if market else None
        latest = latest or (max(markets, key=lambda item: item.modal_price or 0) if markets else None)
        observations = [item for item in all_observations if latest and self._market_label(item.market_name) == self._market_label(latest.market_name)][:10]
        
        location_info = LocationInfo(
            village=lot.village if lot else "",
            taluka=lot.taluka if lot else "",
            district=lot.district if lot else district,
            state=lot.state if lot else state
        )

        if not markets:
            # Handle DATA_UNAVAILABLE
            return MarketIntelligenceResponse(
                lot_id=lot_id,
                crop=crop,
                location=location_info,
                snapshot=None,
                markets=[], selected_market=None,
                trend=MarketTrendSchema(direction="INSUFFICIENT_DATA", price_change=None, percentage_change=None),
                pressure=MarketPressureSchema(pressure="INSUFFICIENT_DATA", reasons=["No market data available for this location."]),
                sale_window=SaleWindowSchema(window="INSUFFICIENT_DATA", advice="Cannot determine sale window without market data."),
                data_freshness="OUTDATED",
                source_type="NONE",
                source_name="Unavailable",
                observation_date=None
            )

        # 3. Process Latest Observation (Snapshot)
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
            markets=[MarketObservationSchema(market_name=self._market_label(item.market_name), min_price=float(item.min_price) if item.min_price else None, modal_price=float(item.modal_price) if item.modal_price else None, max_price=float(item.max_price) if item.max_price else None, price_unit=item.price_unit, observation_date=item.observation_date, freshness=calculate_freshness(item.observation_date), source_type=item.source_type, source_name=item.source_name) for item in markets],
            selected_market=self._market_label(latest.market_name),
            trend=trend,
            pressure=pressure,
            sale_window=sale_window,
            history=history,
            data_freshness=freshness,
            source_type=latest.source_type,
            source_name=latest.source_name,
            observation_date=latest.observation_date
        )
