from sqlalchemy import Column, DateTime, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.session import Base


class QualityAssessment(Base):
    __tablename__ = "quality_assessments"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    lot_id = Column(String, nullable=False, unique=True)
    farmer_id = Column(UUID(as_uuid=True), nullable=False)
    grade = Column(String, nullable=False)
    assessment_mode = Column(String, nullable=False)
    reasoning = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"))


class QualityImage(Base):
    __tablename__ = "quality_images"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    assessment_id = Column(UUID(as_uuid=True), nullable=True)
    lot_id = Column(String, nullable=False)
    farmer_id = Column(UUID(as_uuid=True), nullable=False)
    storage_path = Column(String, nullable=False)
    image_order = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
