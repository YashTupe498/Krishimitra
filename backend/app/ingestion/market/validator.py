from pydantic import BaseModel, field_validator, ValidationInfo
from typing import Optional
from datetime import date

class RawMarketRecord(BaseModel):
    crop: str
    market_name: str
    district: str
    state: str
    observation_date: date
    
    min_price: Optional[float] = None
    modal_price: Optional[float] = None
    max_price: Optional[float] = None
    price_unit: str
    
    arrival_quantity: Optional[float] = None
    arrival_unit: Optional[str] = None
    
    source_name: str

    @field_validator('min_price', 'modal_price', 'max_price', 'arrival_quantity')
    @classmethod
    def check_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("Values must be non-negative")
        return v

    @field_validator('max_price')
    @classmethod
    def check_max_price(cls, v: Optional[float], info: ValidationInfo) -> Optional[float]:
        if v is not None:
            min_p = info.data.get('min_price')
            if min_p is not None and v < min_p:
                raise ValueError("max_price cannot be less than min_price")
        return v
