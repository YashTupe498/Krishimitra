from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import verify_supabase_jwt
from app.db.session import get_db
from app.modules.opportunities.transaction_models import MarketplaceTransaction

router = APIRouter()

_ALLOWED_TRANSITIONS = {
    "CREATED": {"LOGISTICS_PLANNED", "CANCELLED"},
    "LOGISTICS_PLANNED": {"IN_TRANSIT", "CANCELLED"},
    "IN_TRANSIT": {"DELIVERED"},
    "DELIVERED": {"PAYMENT_PENDING", "PAYMENT_CONFIRMED"},
    "PAYMENT_PENDING": {"PAYMENT_CONFIRMED"},
    "PAYMENT_CONFIRMED": {"COMPLETED"},
    "COMPLETED": set(),
    "CANCELLED": set(),
}


class TransactionOut(BaseModel):
    id: str
    offerId: str
    lotId: str
    requirementId: str
    farmerId: str
    buyerId: str
    quantity: float
    agreedPricePerQuintal: float
    totalValue: float
    paymentTimelineDays: int
    transactionStatus: str
    logisticsStatus: str
    paymentStatus: str
    createdAt: str


class TransactionUpdate(BaseModel):
    transaction_status: str


def _out(item: MarketplaceTransaction) -> TransactionOut:
    return TransactionOut(
        id=str(item.id), offerId=item.offer_id, lotId=item.lot_id, requirementId=str(item.demand_id),
        farmerId=str(item.farmer_id), buyerId=str(item.buyer_id), quantity=float(item.quantity),
        agreedPricePerQuintal=float(item.agreed_price_per_quintal), totalValue=float(item.total_value),
        paymentTimelineDays=item.payment_timeline_days, transactionStatus=item.transaction_status,
        logisticsStatus=item.logistics_status, paymentStatus=item.payment_status,
        createdAt=item.created_at.isoformat() if item.created_at else "",
    )


@router.get("/", response_model=List[TransactionOut])
def list_transactions(db: Session = Depends(get_db), user: dict = Depends(verify_supabase_jwt)):
    user_id = user.get("sub")
    rows = db.query(MarketplaceTransaction).filter(
        (MarketplaceTransaction.buyer_id == user_id) | (MarketplaceTransaction.farmer_id == user_id)
    ).order_by(MarketplaceTransaction.created_at.desc()).all()
    return [_out(item) for item in rows]


@router.patch("/{transaction_id}", response_model=TransactionOut)
def update_transaction(transaction_id: str, payload: TransactionUpdate, db: Session = Depends(get_db), user: dict = Depends(verify_supabase_jwt)):
    user_id = user.get("sub")
    transaction = db.query(MarketplaceTransaction).filter(MarketplaceTransaction.id == transaction_id).first()
    if not transaction or user_id not in {str(transaction.buyer_id), str(transaction.farmer_id)}:
        raise HTTPException(status_code=404, detail="Transaction not found")
    target = payload.transaction_status.strip().upper()
    if target not in _ALLOWED_TRANSITIONS.get(transaction.transaction_status, set()):
        raise HTTPException(status_code=409, detail="Invalid transaction status transition")
    transaction.transaction_status = target
    if target == "LOGISTICS_PLANNED": transaction.logistics_status = "PLANNED"
    elif target == "IN_TRANSIT": transaction.logistics_status = "IN_TRANSIT"
    elif target == "DELIVERED": transaction.logistics_status = "DELIVERED"
    elif target in {"PAYMENT_CONFIRMED", "COMPLETED"}: transaction.payment_status = "CONFIRMED"
    db.commit()
    db.refresh(transaction)
    return _out(transaction)
