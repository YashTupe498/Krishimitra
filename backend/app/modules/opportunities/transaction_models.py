from sqlalchemy import Column, DateTime, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class MarketplaceTransaction(Base):
    __tablename__ = "marketplace_transactions"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    offer_id = Column(String, nullable=False, unique=True)
    lot_id = Column(String, nullable=False)
    demand_id = Column(UUID(as_uuid=True), nullable=False)
    farmer_id = Column(UUID(as_uuid=True), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), nullable=False)
    quantity = Column(Numeric, nullable=False)
    agreed_price_per_quintal = Column(Numeric, nullable=False)
    total_value = Column(Numeric, nullable=False)
    payment_timeline_days = Column(Integer, nullable=False)
    transaction_status = Column(String, nullable=False, default="CREATED")
    logistics_status = Column(String, nullable=False, default="NOT_PLANNED")
    payment_status = Column(String, nullable=False, default="PENDING")
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"))
