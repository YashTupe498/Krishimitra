from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.security import verify_supabase_jwt
from app.db.session import get_db
from app.modules.grievances.models import Grievance

router = APIRouter()


class GrievanceCreate(BaseModel):
    category: str
    title: str
    description: str
    priority: str
    location: str = ""
    evidence: List[str] = Field(default_factory=list)
    classification_summary: str = ""
    classification_reasons: List[str] = Field(default_factory=list)
    details: dict[str, Any] = Field(default_factory=dict)
    resolution_guidance: dict[str, str] = Field(default_factory=dict)


class GrievanceOut(GrievanceCreate):
    id: str
    farmer_id: str
    status: str
    created_at: str
    updated_at: str


def _out(item: Grievance) -> GrievanceOut:
    return GrievanceOut(id=str(item.id), farmer_id=str(item.farmer_id), category=item.category, title=item.title,
        description=item.description, priority=item.priority, status=item.status, location=item.location or "",
        evidence=item.evidence or [], classification_summary=item.classification_summary or "",
        classification_reasons=item.classification_reasons or [], details=item.details or {},
        resolution_guidance=item.resolution_guidance or {}, created_at=item.created_at.isoformat() if item.created_at else "",
        updated_at=item.updated_at.isoformat() if item.updated_at else "")


@router.get("/", response_model=List[GrievanceOut])
def list_grievances(db: Session = Depends(get_db), user: dict = Depends(verify_supabase_jwt)):
    return [_out(item) for item in db.query(Grievance).filter(Grievance.farmer_id == user.get("sub")).order_by(Grievance.created_at.desc()).all()]


@router.post("/", response_model=GrievanceOut)
def create_grievance(payload: GrievanceCreate, db: Session = Depends(get_db), user: dict = Depends(verify_supabase_jwt)):
    if payload.priority not in {"HIGH", "MEDIUM", "LOW"}:
        raise HTTPException(status_code=422, detail="Invalid grievance priority")
    item = Grievance(**payload.model_dump(), farmer_id=user.get("sub"), status="SUBMITTED")
    db.add(item)
    db.commit()
    db.refresh(item)
    return _out(item)


@router.get("/{grievance_id}", response_model=GrievanceOut)
def get_grievance(grievance_id: str, db: Session = Depends(get_db), user: dict = Depends(verify_supabase_jwt)):
    item = db.query(Grievance).filter(Grievance.id == grievance_id, Grievance.farmer_id == user.get("sub")).first()
    if not item:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return _out(item)
