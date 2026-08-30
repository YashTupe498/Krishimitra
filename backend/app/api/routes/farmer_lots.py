from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.crops import normalize_crop
from app.core.security import verify_supabase_jwt
from app.db.session import get_db
from app.modules.lots.models import Lot
from app.modules.lots.schemas import LotCreate, LotOut, LotUpdate
from app.modules.opportunities.services.matching import match_lot_to_demands

router = APIRouter()


def _owned_lot(db: Session, lot_id: str, user_id: str) -> Lot:
    lot = db.query(Lot).filter(Lot.id == lot_id, Lot.farmer_id == user_id).first()
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")
    return lot


@router.post("/", response_model=LotOut, status_code=status.HTTP_201_CREATED)
def create_lot(
    payload: LotCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt),
):
    user_id = user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user session")
    if db.query(Lot).filter(Lot.id == payload.id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A lot with this id already exists")

    try:
        crop = normalize_crop(payload.crop)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    lot = Lot(**payload.dict(exclude={"crop"}), crop=crop, farmer_id=user_id)
    db.add(lot)
    db.commit()
    db.refresh(lot)
    match_lot_to_demands(db, lot.id)
    return lot


@router.get("/", response_model=List[LotOut])
def list_lots(
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt),
):
    user_id = user.get("sub")
    return (
        db.query(Lot)
        .filter(Lot.farmer_id == user_id)
        .order_by(Lot.updated_at.desc())
        .all()
    )


@router.get("/{lot_id}", response_model=LotOut)
def get_lot(
    lot_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt),
):
    return _owned_lot(db, lot_id, user.get("sub"))


@router.patch("/{lot_id}", response_model=LotOut)
def update_lot(
    lot_id: str,
    payload: LotUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_supabase_jwt),
):
    lot = _owned_lot(db, lot_id, user.get("sub"))
    updates = payload.dict(exclude_unset=True)
    if "crop" in updates:
        try:
            updates["crop"] = normalize_crop(updates["crop"])
        except ValueError as error:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error
    for field, value in updates.items():
        setattr(lot, field, value)
    db.commit()
    db.refresh(lot)
    match_lot_to_demands(db, lot.id)
    return lot
