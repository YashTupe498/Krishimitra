from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import verify_supabase_jwt
from app.db.session import get_db
from app.modules.profiles.models import Profile

router = APIRouter()


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None


class ProfileOut(BaseModel):
    id: str
    role: str
    full_name: str
    phone: str | None
    district: str | None
    state: str | None
    avatar_url: str | None


def _out(profile: Profile) -> ProfileOut:
    return ProfileOut(id=str(profile.id), role=profile.role, full_name=profile.full_name, phone=profile.phone,
                      district=profile.district, state=profile.state, avatar_url=profile.avatar_url)


@router.get("/me", response_model=ProfileOut)
def get_profile(db: Session = Depends(get_db), user: dict = Depends(verify_supabase_jwt)):
    profile = db.query(Profile).filter(Profile.id == user.get("sub")).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _out(profile)


@router.patch("/me", response_model=ProfileOut)
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user: dict = Depends(verify_supabase_jwt)):
    profile = db.query(Profile).filter(Profile.id == user.get("sub")).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        if key == "full_name" and not value.strip():
            raise HTTPException(status_code=422, detail="Full name cannot be empty")
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return _out(profile)
