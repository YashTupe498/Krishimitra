from sqlalchemy.orm import Session
from app.modules.opportunities.models import BuyerDemand, Opportunity
from app.modules.lots.models import Lot
from app.core.crops import crop_key
from app.core.locations import location_matches, quantity_to_kg

def clean_quantity(quantity_str: str) -> float:
    if not quantity_str:
        return 0.0
    cleaned = quantity_str.replace(',', '').strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def match_logic(demand: BuyerDemand, lot: Lot) -> dict:
    # 1. CROP: compare shared canonical keys, not presentation strings.
    if not demand.crop or not lot.crop or crop_key(demand.crop) != crop_key(lot.crop):
        return {"eligible": False}

    # 2. GRADE: a newly listed lot can be discovered before assessment, but is
    # explicitly marked pending rather than claimed as quality-compatible.
    accepted_grades = {grade.strip().upper() for grade in (demand.accepted_quality_grades or [demand.required_quality_grade]) if grade}
    if lot.quality_grade and lot.quality_grade.strip().upper() not in accepted_grades:
        return {"eligible": False}
    quality_match = "COMPATIBLE" if lot.quality_grade else "PENDING"

    # 3. QUANTITY: Compare numeric quantities
    lot_qty = quantity_to_kg(clean_quantity(lot.quantity), lot.unit)
    req_qty = quantity_to_kg(float(demand.required_quantity) if demand.required_quantity else 0.0, demand.quantity_unit)
    
    if lot_qty >= req_qty:
        match_status = 'FULL_MATCH'
    elif lot_qty > 0:
        match_status = 'PARTIAL_MATCH'
    else:
        # Instruction: Else 'INSUFFICIENT_QUANTITY' but if it's not FULL or PARTIAL we shouldn't create it according to:
        # "Only create Opportunities in the database if they are ELIGIBLE (i.e. 'FULL_MATCH' or 'PARTIAL_MATCH'). Do NOT store 'NOT_ELIGIBLE' matches."
        return {"eligible": False}

    # 4. LOCATION
    location_match = 'COMPATIBLE' if location_matches(
        demand.delivery_location, lot.district, lot.village, lot.location, lot.state
    ) else None

    # 5. PAYMENT
    payment_match = None
    if demand.payment_terms:
        payment_match = 'COMPATIBLE'

    return {
        "eligible": True,
        "match_status": match_status,
        "quantity_matched": min(lot_qty, req_qty),
        "quantity_unit": "KG",
        "quality_match": quality_match,
        "location_match": location_match,
        "payment_match": payment_match
    }

def process_match(db: Session, demand: BuyerDemand, lot: Lot):
    result = match_logic(demand, lot)
    existing = db.query(Opportunity).filter(
        Opportunity.demand_id == demand.id,
        Opportunity.lot_id == lot.id
    ).first()
    if result.get("eligible"):
        opp = existing
        
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
    elif existing:
        # A later quality assessment or edit can invalidate an earlier match.
        db.delete(existing)
        db.commit()

def match_demand_to_lots(db: Session, demand_id: str):
    demand = db.query(BuyerDemand).filter(BuyerDemand.id == demand_id).first()
    if not demand or demand.status != 'ACTIVE':
        return
    lots = db.query(Lot).filter(Lot.status != 'DRAFT').all()
    for lot in lots:
        process_match(db, demand, lot)

def match_lot_to_demands(db: Session, lot_id: str):
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        return
    demands = db.query(BuyerDemand).filter(BuyerDemand.status == 'ACTIVE').all()
    for demand in demands:
        process_match(db, demand, lot)
