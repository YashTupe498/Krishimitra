from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import verify_supabase_jwt
from app.db.session import get_db
from app.modules.lots.models import Lot
from app.modules.opportunities.models import BuyerDemand, Opportunity
from app.modules.opportunities.offer_models import BuyerOffer

router = APIRouter()


class OfferCreate(BaseModel):
    id: str
    lot_id: str
    requirement_id: str
    quantity: float
    price_per_quintal: float
    estimated_total_value: float
    payment_timeline_days: int
    delivery_preference: str


class OfferOut(OfferCreate):
    buyer_id: str
    farmer_id: str
    status: str
    created_at: str | None = None


@router.post("/", response_model=OfferOut, status_code=status.HTTP_201_CREATED)
def create_offer(
    payload: OfferCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt),
):
    buyer_id = user.get("sub")
    demand = db.query(BuyerDemand).filter(BuyerDemand.id == payload.requirement_id, BuyerDemand.buyer_id == buyer_id).first()
    if not demand:
        raise HTTPException(status_code=404, detail="Requirement not found")
    lot = db.query(Lot).filter(Lot.id == payload.lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    eligible = db.query(Opportunity).filter(Opportunity.demand_id == demand.id, Opportunity.lot_id == lot.id).first()
    if not eligible:
        raise HTTPException(status_code=422, detail="This lot is not a current match for the requirement")
    if payload.quantity <= 0 or payload.quantity > float(lot.quantity.replace(',', '')):
        raise HTTPException(status_code=422, detail="Offer quantity must be available in the lot")
    if db.query(BuyerOffer).filter(BuyerOffer.id == payload.id).first():
        raise HTTPException(status_code=409, detail="Offer already exists")

    offer = BuyerOffer(
        id=payload.id,
        lot_id=lot.id,
        demand_id=demand.id,
        buyer_id=buyer_id,
        farmer_id=lot.farmer_id,
        quantity=payload.quantity,
        price_per_quintal=payload.price_per_quintal,
        estimated_total_value=payload.estimated_total_value,
        payment_timeline_days=payload.payment_timeline_days,
        delivery_preference=payload.delivery_preference,
        status="SENT",
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return _out(offer)


@router.get("/", response_model=List[OfferOut])
def list_buyer_offers(
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt),
):
    offers = db.query(BuyerOffer).filter(BuyerOffer.buyer_id == user.get("sub")).order_by(BuyerOffer.created_at.desc()).all()
    return [_out(offer) for offer in offers]


@router.get("/received/", response_model=List[OfferOut])
def list_farmer_offers(
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt),
):
    offers = (
        db.query(BuyerOffer)
        .filter(BuyerOffer.farmer_id == user.get("sub"))
        .order_by(BuyerOffer.created_at.desc())
        .all()
    )
    return [_out(offer) for offer in offers]


@router.patch("/received/{offer_id}", response_model=OfferOut)
def respond_to_offer(
    offer_id: str,
    response: str,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt),
):
    status_value = response.strip().upper()
    if status_value not in {"ACCEPTED", "REJECTED"}:
        raise HTTPException(status_code=422, detail="Response must be ACCEPTED or REJECTED")
    offer = db.query(BuyerOffer).filter(
        BuyerOffer.id == offer_id,
        BuyerOffer.farmer_id == user.get("sub"),
    ).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    if offer.status != "SENT":
        raise HTTPException(status_code=409, detail="This offer has already been responded to")
    offer.status = status_value
    db.commit()
    db.refresh(offer)
    return _out(offer)


def _out(offer: BuyerOffer) -> dict:
    return {
        "id": offer.id,
        "lot_id": offer.lot_id,
        "requirement_id": str(offer.demand_id),
        "quantity": float(offer.quantity),
        "price_per_quintal": float(offer.price_per_quintal),
        "estimated_total_value": float(offer.estimated_total_value),
        "payment_timeline_days": offer.payment_timeline_days,
        "delivery_preference": offer.delivery_preference,
        "buyer_id": str(offer.buyer_id),
        "farmer_id": str(offer.farmer_id),
        "status": offer.status,
        "created_at": offer.created_at.isoformat() if offer.created_at else None,
    }
