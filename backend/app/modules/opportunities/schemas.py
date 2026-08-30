from pydantic import BaseModel, UUID4
from typing import Optional, List, Any
from datetime import datetime, date

class BuyerDemandBase(BaseModel):
    crop: str
    required_quantity: float
    quantity_unit: str = 'kg'
    required_quality_grade: str
    accepted_quality_grades: List[str] = []
    delivery_location: str
    required_date: Optional[date] = None
    payment_terms: Optional[str] = None
    transport_requirement: Optional[str] = None
    storage_requirement: Optional[str] = None
    status: str = 'DRAFT'

class BuyerDemandCreate(BuyerDemandBase):
    pass

class BuyerDemandUpdate(BuyerDemandBase):
    crop: Optional[str] = None
    required_quantity: Optional[float] = None
    required_quality_grade: Optional[str] = None
    delivery_location: Optional[str] = None
    accepted_quality_grades: Optional[List[str]] = None

class BuyerDemandOut(BuyerDemandBase):
    id: UUID4
    buyer_id: UUID4
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

class BuyerMatchLotOut(BaseModel):
    id: str
    crop: str
    quantity: str
    unit: str
    location: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    quality_grade: Optional[str] = None

class BuyerMatchOut(BaseModel):
    id: UUID4
    demand_id: UUID4
    match_status: str
    quantity_matched: Optional[float] = None
    quantity_unit: Optional[str] = None
    quality_match: Optional[str] = None
    location_match: Optional[str] = None
    payment_match: Optional[str] = None
    lot: BuyerMatchLotOut

class OpportunityBase(BaseModel):
    match_status: str
    match_score: Optional[int] = None
    match_reasons: List[Any] = []
    quantity_matched: Optional[float] = None
    quantity_unit: Optional[str] = None
    quality_match: Optional[str] = None
    location_match: Optional[str] = None
    date_match: Optional[str] = None
    payment_match: Optional[str] = None
    transport_status: Optional[str] = None
    storage_status: Optional[str] = None
    status: str = 'MATCHED'

class OpportunityOut(OpportunityBase):
    id: UUID4
    farmer_id: UUID4
    lot_id: str
    buyer_id: UUID4
    demand_id: UUID4
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
