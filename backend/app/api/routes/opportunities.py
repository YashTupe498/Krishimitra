from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.core.security import verify_supabase_jwt
from app.modules.opportunities.models import Opportunity
from app.modules.opportunities.schemas import OpportunityOut

router = APIRouter()

@router.get("/", response_model=List[OpportunityOut])
def get_opportunities(
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt)
):
    user_id = user.get("sub")
    # Return opportunities where user is either farmer or buyer
    opportunities = db.query(Opportunity).filter(
        (Opportunity.farmer_id == user_id) | (Opportunity.buyer_id == user_id)
    ).all()
    return opportunities


@router.get("/{opportunity_id}", response_model=OpportunityOut)
def get_opportunity(
    opportunity_id: UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt),
):
    user_id = user.get("sub")
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id,
        Opportunity.farmer_id == user_id,
    ).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opportunity
