from sqlalchemy import Column, String, Numeric, Date, Integer, JSON, DateTime, text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from app.db.session import Base

class BuyerDemand(Base):
    __tablename__ = "buyer_demands"
    __table_args__ = {'schema': 'public'}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    buyer_id = Column(UUID(as_uuid=True), nullable=False)
    crop = Column(String, nullable=False)
    required_quantity = Column(Numeric, nullable=False)
    quantity_unit = Column(String, nullable=False, default='kg')
    required_quality_grade = Column(String, nullable=False)
    accepted_quality_grades = Column(ARRAY(String), nullable=False, server_default='{}')
    delivery_location = Column(String, nullable=False)
    required_date = Column(Date)
    payment_terms = Column(String)
    transport_requirement = Column(String)
    storage_requirement = Column(String)
    status = Column(String, nullable=False, default='DRAFT')
    created_at = Column(DateTime(timezone=True), server_default=text('now()'))
    updated_at = Column(DateTime(timezone=True), server_default=text('now()'))

class Opportunity(Base):
    __tablename__ = "opportunities"
    __table_args__ = {'schema': 'public'}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    farmer_id = Column(UUID(as_uuid=True), nullable=False)
    lot_id = Column(String, nullable=False)
    buyer_id = Column(UUID(as_uuid=True), nullable=False)
    demand_id = Column(UUID(as_uuid=True), nullable=False)
    
    match_status = Column(String, nullable=False)
    match_score = Column(Integer)
    match_reasons = Column(JSONB, nullable=False, server_default='[]')
    
    quantity_matched = Column(Numeric)
    quantity_unit = Column(String)
    quality_match = Column(String)
    location_match = Column(String)
    date_match = Column(String)
    payment_match = Column(String)
    transport_status = Column(String)
    storage_status = Column(String)
    
    status = Column(String, nullable=False, default='MATCHED')
    created_at = Column(DateTime(timezone=True), server_default=text('now()'))
    updated_at = Column(DateTime(timezone=True), server_default=text('now()'))
