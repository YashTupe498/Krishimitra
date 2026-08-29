from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.core.security import verify_supabase_jwt
from app.modules.opportunities.models import BuyerDemand
from app.modules.opportunities.schemas import BuyerDemandCreate, BuyerDemandOut
from app.modules.opportunities.services.matching import match_demand_to_lots

router = APIRouter()

@router.post("/", response_model=BuyerDemandOut)
def create_demand(
    demand: BuyerDemandCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt)
):
    user_id = user.get("sub")
    db_demand = BuyerDemand(**demand.dict(), buyer_id=user_id)
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
    demands = db.query(BuyerDemand).filter(BuyerDemand.buyer_id == user_id).all()
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

