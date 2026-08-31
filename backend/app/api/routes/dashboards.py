from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import verify_supabase_jwt
from app.db.session import get_db
from app.modules.lots.models import Lot
from app.modules.opportunities.models import BuyerDemand, Opportunity
from app.modules.opportunities.offer_models import BuyerOffer
from app.modules.opportunities.transaction_models import MarketplaceTransaction

router = APIRouter()


@router.get("/farmer")
def farmer_dashboard(db: Session = Depends(get_db), user: dict = Depends(verify_supabase_jwt)):
    user_id = user.get("sub")
    lots = db.query(Lot).filter(Lot.farmer_id == user_id).all()
    opportunities = db.query(Opportunity).filter(Opportunity.farmer_id == user_id).count()
    offers = db.query(BuyerOffer).filter(BuyerOffer.farmer_id == user_id, BuyerOffer.status == "SENT").count()
    transactions = db.query(MarketplaceTransaction).filter(MarketplaceTransaction.farmer_id == user_id).count()
    return {"lots": len(lots), "quality_pending": sum(1 for lot in lots if lot.status == "QUALITY_PENDING"),
            "opportunities": opportunities, "offers_awaiting_response": offers, "transactions": transactions}


@router.get("/buyer")
def buyer_dashboard(db: Session = Depends(get_db), user: dict = Depends(verify_supabase_jwt)):
    user_id = user.get("sub")
    demands = db.query(BuyerDemand).filter(BuyerDemand.buyer_id == user_id).all()
    active_ids = [item.id for item in demands if item.status == "ACTIVE"]
    matches = db.query(Opportunity).filter(Opportunity.demand_id.in_(active_ids)).count() if active_ids else 0
    offers = db.query(BuyerOffer).filter(BuyerOffer.buyer_id == user_id, BuyerOffer.status == "SENT").count()
    transactions = db.query(MarketplaceTransaction).filter(MarketplaceTransaction.buyer_id == user_id).count()
    return {"demands": len(demands), "active_demands": len(active_ids), "matching_lots": matches,
            "offers_awaiting_response": offers, "transactions": transactions}
