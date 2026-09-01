from sqlalchemy import Column, String, JSON, DateTime, text
from app.db.session import Base
from datetime import datetime

class Decision(Base):
    __tablename__ = "decisions"
    __table_args__ = {'schema': 'public'}

    id = Column(String, primary_key=True)
    lot_id = Column(String, nullable=False, index=True)
    farmer_id = Column(String, nullable=False)
    recommendation = Column(String, nullable=False)
    snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text('now()'))
