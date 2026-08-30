from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class BuyerOffer(Base):
    __tablename__ = "buyer_offers"
    __table_args__ = {"schema": "public"}

    id = Column(String, primary_key=True)
    lot_id = Column(String, ForeignKey("public.lots.id", ondelete="CASCADE"), nullable=False)
    demand_id = Column(UUID(as_uuid=True), ForeignKey("public.buyer_demands.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), nullable=False)
    farmer_id = Column(UUID(as_uuid=True), nullable=False)
    quantity = Column(Numeric, nullable=False)
    price_per_quintal = Column(Numeric, nullable=False)
    estimated_total_value = Column(Numeric, nullable=False)
    payment_timeline_days = Column(Integer, nullable=False)
    delivery_preference = Column(String, nullable=False)
    status = Column(String, nullable=False, default="SENT")
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
