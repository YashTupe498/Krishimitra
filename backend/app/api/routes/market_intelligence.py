from fastapi import APIRouter, Depends, Security, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_supabase_jwt
from app.modules.market_intelligence.schemas import MarketIntelligenceResponse
from app.modules.market_intelligence.services.service import MarketIntelligenceService
from app.modules.market_intelligence.providers import DatasetMarketDataProvider

router = APIRouter()

# Instantiate the service with the dataset provider
market_provider = DatasetMarketDataProvider()
market_service = MarketIntelligenceService(provider=market_provider)

@router.get("/{lot_id}", response_model=MarketIntelligenceResponse)
def get_market_intelligence_for_lot(
    lot_id: str,
    crop: str = None,
    district: str = None,
    state: str = None,
    db: Session = Depends(get_db),
    jwt_payload: dict = Security(verify_supabase_jwt)
):
    """
    Retrieves Market Intelligence for a specific Lot.
    The user must be authenticated and own the lot.
    """
    user_id = jwt_payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing subject (user_id)")
        
    # The service itself handles the 404/403 check by filtering on farmer_id == user_id
    return market_service.get_intelligence_for_lot(
        db=db, lot_id=lot_id, farmer_id=user_id,
        mock_crop=crop, mock_district=district, mock_state=state
    )
