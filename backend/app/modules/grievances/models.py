from sqlalchemy import Column, DateTime, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.session import Base


class Grievance(Base):
    __tablename__ = "grievances"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    farmer_id = Column(UUID(as_uuid=True), nullable=False)
    category = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    status = Column(String, nullable=False, default="SUBMITTED")
    location = Column(String)
    evidence = Column(JSONB, nullable=False, server_default="[]")
    classification_summary = Column(String)
    classification_reasons = Column(JSONB, nullable=False, server_default="[]")
    details = Column(JSONB, nullable=False, server_default="{}")
    resolution_guidance = Column(JSONB, nullable=False, server_default="{}")
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"))
