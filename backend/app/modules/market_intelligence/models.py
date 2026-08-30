from sqlalchemy import Column, String, Date, Numeric, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class MarketObservation(Base):
    __tablename__ = "market_observations"
    __table_args__ = {'schema': 'public'}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    crop = Column(String, nullable=False)
    market_name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)
    observation_date = Column(Date, nullable=False)
    
    min_price = Column(Numeric)
    modal_price = Column(Numeric)
    max_price = Column(Numeric)
    price_unit = Column(String, nullable=False)
    
    arrival_quantity = Column(Numeric)
    arrival_unit = Column(String)
    
    source_name = Column(String, nullable=False)
    source_type = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=text('now()'))
    updated_at = Column(DateTime(timezone=True), server_default=text('now()'))
