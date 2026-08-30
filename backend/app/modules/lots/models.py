from sqlalchemy import Column, String, JSON, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base
from datetime import datetime

class Lot(Base):
    __tablename__ = "lots"
    __table_args__ = {'schema': 'public'}

    id = Column(String, primary_key=True)
    farmer_id = Column(UUID(as_uuid=True), nullable=False)
    crop = Column(String, nullable=False)
    quantity = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    location = Column(String)
    village = Column(String)
    taluka = Column(String)
    district = Column(String)
    state = Column(String)
    status = Column(String, nullable=False, default='DRAFT')
    quality_grade = Column(String)
    constraints = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=text('now()'))
    updated_at = Column(DateTime(timezone=True), server_default=text('now()'))
