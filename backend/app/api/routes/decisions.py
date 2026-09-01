from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_supabase_jwt
from app.modules.decisions.service import DecisionService
from app.modules.decisions.schemas import DecisionResponse

router = APIRouter()
decision_service = DecisionService()

@router.get("/{lot_id}", response_model=DecisionResponse)
def get_decision(
    lot_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt)
):
    """
    Generate and retrieve a decision for a specific lot.
    The user must be authenticated and own the lot.
    """
    user_id = user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing subject")
        
    return decision_service.get_decision_for_lot(db=db, lot_id=lot_id, farmer_id=user_id)
