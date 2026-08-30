from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, UUID4


class LotBase(BaseModel):
    crop: str
    quantity: str
    unit: str
    location: Optional[str] = None
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    status: str = "DRAFT"
    quality_grade: Optional[str] = None
    constraints: Dict[str, Any] = Field(default_factory=dict)


class LotCreate(LotBase):
    id: str


class LotUpdate(BaseModel):
    crop: Optional[str] = None
    quantity: Optional[str] = None
    unit: Optional[str] = None
    location: Optional[str] = None
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None
    quality_grade: Optional[str] = None
    constraints: Optional[Dict[str, Any]] = None


class LotOut(LotBase):
    id: str
    farmer_id: UUID4
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
