from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.core.security import verify_supabase_jwt
from app.modules.opportunities.models import BuyerDemand
from app.modules.opportunities.models import Opportunity
from app.modules.opportunities.schemas import BuyerDemandCreate, BuyerDemandOut, BuyerMatchOut
from app.modules.opportunities.services.matching import match_demand_to_lots
from app.modules.lots.models import Lot
from app.core.crops import normalize_crop

router = APIRouter()

@router.post("/", response_model=BuyerDemandOut)
def create_demand(
    demand: BuyerDemandCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt)
):
    user_id = user.get("sub")
    try:
        crop = normalize_crop(demand.crop)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    accepted_grades = [grade.strip().upper() for grade in demand.accepted_quality_grades if grade and grade.strip()]
    if not accepted_grades:
        accepted_grades = [demand.required_quality_grade.strip().upper()]
    db_demand = BuyerDemand(
        **demand.dict(exclude={"crop", "required_quality_grade", "accepted_quality_grades"}),
        crop=crop,
        required_quality_grade=accepted_grades[0],
        accepted_quality_grades=accepted_grades,
        buyer_id=user_id,
    )
    db.add(db_demand)
    db.commit()
    db.refresh(db_demand)
    
    # Run matching
    match_demand_to_lots(db, str(db_demand.id))
    
    return db_demand

@router.get("/", response_model=List[BuyerDemandOut])
def get_demands(
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt)
):
    user_id = user.get("sub")
    demands = (
        db.query(BuyerDemand)
        .filter(BuyerDemand.buyer_id == user_id)
        .order_by(BuyerDemand.created_at.desc())
        .all()
    )
    return demands

@router.get("/{demand_id}", response_model=BuyerDemandOut)
def get_demand(
    demand_id: UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt)
):
    user_id = user.get("sub")
    demand = db.query(BuyerDemand).filter(BuyerDemand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    if str(demand.buyer_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return demand

@router.patch("/{demand_id}", response_model=BuyerDemandOut)
def update_demand(
    demand_id: UUID,
    changes: dict,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt),
):
    user_id = user.get("sub")
    demand = db.query(BuyerDemand).filter(BuyerDemand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    if str(demand.buyer_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if "status" in changes:
        demand.status = changes["status"]
    db.commit()
    db.refresh(demand)
    if demand.status == "ACTIVE":
        match_demand_to_lots(db, str(demand.id))
    return demand

@router.get("/{demand_id}/matches", response_model=List[BuyerMatchOut])
def get_demand_matches(
    demand_id: UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt)
):
    user_id = user.get("sub")
    demand = db.query(BuyerDemand).filter(BuyerDemand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    if str(demand.buyer_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    rows = (
        db.query(Opportunity, Lot)
        .join(Lot, Lot.id == Opportunity.lot_id)
        .filter(Opportunity.demand_id == demand.id)
        .all()
    )
    return [
        {
            "id": opportunity.id,
            "demand_id": opportunity.demand_id,
            "match_status": opportunity.match_status,
            "quantity_matched": opportunity.quantity_matched,
            "quantity_unit": opportunity.quantity_unit,
            "quality_match": opportunity.quality_match,
            "location_match": opportunity.location_match,
            "payment_match": opportunity.payment_match,
            "lot": {
                "id": lot.id,
                "crop": lot.crop,
                "quantity": lot.quantity,
                "unit": lot.unit,
                "location": lot.location,
                "village": lot.village,
                "district": lot.district,
                "state": lot.state,
                "quality_grade": lot.quality_grade,
            },
        }
        for opportunity, lot in rows
    ]

@router.get("/matched-lots/{lot_id}")
def get_matched_lot(
    lot_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt),
):
    user_id = user.get("sub")
    lot = (
        db.query(Lot)
        .join(Opportunity, Opportunity.lot_id == Lot.id)
        .filter(Opportunity.lot_id == lot_id, Opportunity.buyer_id == user_id)
        .first()
    )
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    return {
        "id": lot.id,
        "farmer_id": str(lot.farmer_id),
        "crop": lot.crop,
        "quantity": lot.quantity,
        "unit": lot.unit,
        "district": lot.district,
        "state": lot.state,
        "quality_grade": lot.quality_grade,
    }

@router.post("/{demand_id}/publish", response_model=BuyerDemandOut)
def publish_demand(
    demand_id: UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt)
):
    user_id = user.get("sub")
    demand = db.query(BuyerDemand).filter(BuyerDemand.id == demand_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    if str(demand.buyer_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    demand.status = 'ACTIVE'
    db.commit()
    db.refresh(demand)
    
    # Trigger matching
    match_demand_to_lots(db, str(demand.id))
    
    return demand

