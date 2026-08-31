from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.security import verify_supabase_jwt
from app.db.session import get_db
from app.modules.lots.models import Lot
from app.modules.lots.quality_models import QualityAssessment, QualityImage
from app.modules.opportunities.services.matching import match_lot_to_demands

router = APIRouter()


class QualityAssessmentCreate(BaseModel):
    image_paths: List[str] = Field(min_length=1, max_length=2)


class QualityAssessmentOut(BaseModel):
    crop: str
    grade: str
    confidence: None = None
    observations: List[str]
    quality_adjustment_type: str = "NONE"
    quality_adjustment_value: int = 0
    assessment_mode: str = "prototype_demo"


@router.post("/lots/{lot_id}/assessment", response_model=QualityAssessmentOut)
def assess_lot(lot_id: str, payload: QualityAssessmentCreate, db: Session = Depends(get_db), user: dict = Depends(verify_supabase_jwt)):
    user_id = user.get("sub")
    lot = db.query(Lot).filter(Lot.id == lot_id, Lot.farmer_id == user_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    # This is deliberately a deterministic reference assessment until an ML model is deployed.
    grade = "B"
    observation = f"Reference prototype assessment recorded for {lot.crop}. No ML quality score is claimed."
    assessment = db.query(QualityAssessment).filter(QualityAssessment.lot_id == lot.id).first()
    if assessment:
        assessment.grade, assessment.assessment_mode, assessment.reasoning = grade, "REFERENCE_PROTOTYPE", [observation]
        db.query(QualityImage).filter(QualityImage.lot_id == lot.id).delete(synchronize_session=False)
    else:
        assessment = QualityAssessment(lot_id=lot.id, farmer_id=user_id, grade=grade, assessment_mode="REFERENCE_PROTOTYPE", reasoning=[observation])
        db.add(assessment)
        db.flush()
    for index, path in enumerate(payload.image_paths, start=1):
        db.add(QualityImage(assessment_id=assessment.id, lot_id=lot.id, farmer_id=user_id, storage_path=path, image_order=index))
    lot.quality_grade = grade
    lot.status = "MARKET_ANALYSIS_READY"
    db.commit()
    match_lot_to_demands(db, lot.id)
    return QualityAssessmentOut(crop=lot.crop, grade=grade, observations=[observation])
