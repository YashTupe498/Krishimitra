from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
import uuid

from app.modules.lots.models import Lot
from app.modules.opportunities.models import Opportunity, BuyerDemand
from app.modules.market_intelligence.services.service import MarketIntelligenceService
from app.modules.market_intelligence.providers import DatasetMarketDataProvider

from .schemas import DecisionResponse, MarketContext, OpportunityDetail, Evidence
from .feasibility import evaluate_feasibility
from .calculations import calculate_net_realization
from .recommendation import generate_recommendation

market_provider = DatasetMarketDataProvider()
market_service = MarketIntelligenceService(provider=market_provider)

class DecisionService:
    def get_decision_for_lot(self, db: Session, lot_id: str, farmer_id: str) -> DecisionResponse:
        lot = db.query(Lot).filter(Lot.id == lot_id, Lot.farmer_id == farmer_id).first()
        if not lot:
            raise HTTPException(status_code=404, detail="Lot not found or access denied")
            
        # 1. Fetch Market Intelligence
        try:
            mi = market_service.get_intelligence_for_lot(db=db, lot_id=lot_id, farmer_id=farmer_id)
            market_signals = MarketContext(
                modal_price=mi.market_snapshot.modal_price if mi.market_snapshot else None,
                low_price=mi.market_snapshot.min_price if mi.market_snapshot else None,
                high_price=mi.market_snapshot.max_price if mi.market_snapshot else None,
                price_movement=mi.market_trend.price_direction if mi.market_trend else None,
                pressure=mi.market_pressure.level if mi.market_pressure else "INSUFFICIENT",
                selling_window=mi.sale_window.status if mi.sale_window else "INSUFFICIENT",
                nearby_markets=[mi.location.primary_market] if mi.location.primary_market else []
            )
        except HTTPException:
            market_signals = MarketContext()
            mi = None

        # 2. Fetch Opportunities
        # Active matched opportunities for this lot
        opportunities = db.query(Opportunity).filter(Opportunity.lot_id == lot_id).all()
        
        evaluated_opps = []
        for opp in opportunities:
            demand = db.query(BuyerDemand).filter(BuyerDemand.id == opp.demand_id).first()
            if not demand: continue
            
            # Use demand price or modal price? BuyerDemand doesn't have price directly in standard schema,
            # Let's assume it uses market modal price as reference if missing.
            # In the prompt: Buyer A 4500, Buyer B 4200. We will mock a price if missing or use modal.
            price = mi.market_snapshot.modal_price if mi and mi.market_snapshot else 2500
            
            detail = OpportunityDetail(
                opportunity_id=opp.id,
                buyer_id=opp.buyer_id,
                buyer_name=f"Buyer {str(opp.buyer_id)[:4]}", # Fake name for prototype
                price=price,
                quantity=float(demand.required_quantity),
                quantity_unit=demand.quantity_unit,
                payment_terms=demand.payment_terms or "Not specified",
                expected_realization=None
            )
            
            feasibility, constraints = evaluate_feasibility(lot, demand, opp)
            
            lot_qty_kg = float(str(lot.quantity).replace(',', '')) if lot.quantity else 0
            gross, transport, handling, storage, net = calculate_net_realization(lot_qty_kg, price, distance_km=50) # Fake 50km
            detail.expected_realization = net
            
            evaluated_opps.append((demand, detail, net, feasibility, constraints, gross, transport, handling, storage))
            
        # 3. Generate Recommendation
        # Sort and select best
        rec_input_opps = [(e[0], e[1], e[2], e[3]) for e in evaluated_opps]
        recommendation, confidence, reasons, best_detail, alternatives, resolution = generate_recommendation(
            market_signals, rec_input_opps
        )
        
        # Build evidence
        evidence = [
            {"factor": "LOT", "text": f"{lot.quantity} {lot.crop}", "source": "Farmer Lot Data"},
        ]
        if mi and mi.market_snapshot:
            evidence.append({"factor": "PRICE", "text": f"₹{mi.market_snapshot.modal_price}/q", "source": "Market Intelligence"})
        if best_detail:
            evidence.append({"factor": "BUYER", "text": best_detail.buyer_name, "source": "Buyer Opportunity"})

        # Get best constraints and costs
        best_constraints = []
        best_net = best_gross = best_transport = best_handling = best_storage = None
        best_feasibility = "INFEASIBLE"
        if best_detail:
            for e in evaluated_opps:
                if e[1].opportunity_id == best_detail.opportunity_id:
                    best_feasibility = e[3]
                    best_constraints = e[4]
                    best_gross = e[5]
                    best_transport = e[6]
                    best_handling = e[7]
                    best_storage = e[8]
                    best_net = e[2]
                    break

        # 4. Construct Response
        response = DecisionResponse(
            id=str(uuid.uuid4()),
            generated_at=datetime.utcnow(),
            lot_id=lot_id,
            farmer_id=farmer_id,
            recommendation=recommendation,
            confidence=confidence,
            reasons=reasons,
            market_signals=market_signals,
            best_opportunity=best_detail,
            net_realization=best_net,
            gross_value=best_gross,
            transport_cost=best_transport,
            handling_cost=best_handling,
            storage_cost=best_storage,
            feasibility=best_feasibility,
            constraints=best_constraints,
            alternatives=alternatives,
            resolution_guidance=resolution,
            evidence=evidence
        )
        
        # 5. Snapshot Persistence
        try:
            from app.modules.decisions.models import Decision
            new_decision = Decision(
                id=response.id,
                lot_id=response.lot_id,
                farmer_id=response.farmer_id,
                recommendation=response.recommendation,
                snapshot=response.dict()
            )
            db.add(new_decision)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Failed to save decision snapshot: {e}")
        
        return response
