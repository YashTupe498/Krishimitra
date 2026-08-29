from sqlalchemy.orm import Session
from app.modules.opportunities.models import BuyerDemand, Opportunity
from app.modules.lots.models import Lot

def clean_quantity(quantity_str: str) -> float:
    if not quantity_str:
        return 0.0
    cleaned = quantity_str.replace(',', '').strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def match_logic(demand: BuyerDemand, lot: Lot) -> dict:
    # 1. CROP: exact match (case insensitive)
    if not demand.crop or not lot.crop or demand.crop.lower() != lot.crop.lower():
        return {"eligible": False}

    # 2. GRADE: exact match.
    if not demand.required_quality_grade or not lot.quality_grade or demand.required_quality_grade != lot.quality_grade:
        return {"eligible": False}

    # 3. QUANTITY: Compare numeric quantities
    lot_qty = clean_quantity(lot.quantity)
    req_qty = float(demand.required_quantity) if demand.required_quantity else 0.0
    
    if lot_qty >= req_qty:
        match_status = 'FULL_MATCH'
    elif lot_qty > 0:
        match_status = 'PARTIAL_MATCH'
    else:
        # Instruction: Else 'INSUFFICIENT_QUANTITY' but if it's not FULL or PARTIAL we shouldn't create it according to:
        # "Only create Opportunities in the database if they are ELIGIBLE (i.e. 'FULL_MATCH' or 'PARTIAL_MATCH'). Do NOT store 'NOT_ELIGIBLE' matches."
        return {"eligible": False}

    # 4. LOCATION
    location_match = None
    dl = demand.delivery_location
    if dl:
        dl_lower = dl.lower()
        if (lot.district and dl_lower in lot.district.lower()) or \
           (lot.state and dl_lower in lot.state.lower()) or \
           (lot.village and dl_lower in lot.village.lower()) or \
           (lot.location and dl_lower in lot.location.lower()):
            location_match = 'COMPATIBLE'

    # 5. PAYMENT
    payment_match = None
    if demand.payment_terms:
        payment_match = 'COMPATIBLE'

    return {
        "eligible": True,
        "match_status": match_status,
        "quantity_matched": min(lot_qty, req_qty),
        "quantity_unit": lot.unit,
        "quality_match": "COMPATIBLE",
        "location_match": location_match,
        "payment_match": payment_match
    }

def process_match(db: Session, demand: BuyerDemand, lot: Lot):
    result = match_logic(demand, lot)
    if result.get("eligible"):
        # Check if exists
        opp = db.query(Opportunity).filter(
            Opportunity.demand_id == demand.id,
            Opportunity.lot_id == lot.id
        ).first()
        
        if not opp:
            opp = Opportunity(
                farmer_id=lot.farmer_id,
                lot_id=lot.id,
                buyer_id=demand.buyer_id,
                demand_id=demand.id
            )
            db.add(opp)
            
        opp.match_status = result["match_status"]
        opp.quantity_matched = result["quantity_matched"]
        opp.quantity_unit = result["quantity_unit"]
        opp.quality_match = result["quality_match"]
        opp.location_match = result["location_match"]
        opp.payment_match = result["payment_match"]
        opp.status = 'MATCHED'
        db.commit()

def match_demand_to_lots(db: Session, demand_id: str):
    demand = db.query(BuyerDemand).filter(BuyerDemand.id == demand_id).first()
    if not demand:
        return
    lots = db.query(Lot).all()
    for lot in lots:
        process_match(db, demand, lot)

def match_lot_to_demands(db: Session, lot_id: str):
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        return
    demands = db.query(BuyerDemand).all()
    for demand in demands:
        process_match(db, demand, lot)
