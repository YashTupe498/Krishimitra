from sqlalchemy import Column, DateTime, String, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True)
    role = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    district = Column(String)
    state = Column(String)
    avatar_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
