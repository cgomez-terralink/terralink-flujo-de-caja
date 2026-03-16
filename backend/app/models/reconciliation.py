from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Reconciliation(Base):
    """Tracks reconciliation between cartola entries and BBDD movements."""
    __tablename__ = "reconciliations"

    id = Column(Integer, primary_key=True, index=True)

    cartola_entry_id = Column(Integer, ForeignKey("cartola_entries.id"), nullable=False)
    cartola_entry = relationship("CartolaEntry")

    movement_id = Column(Integer, ForeignKey("movements.id"), nullable=False)
    movement = relationship("Movement")

    match_type = Column(String(20), nullable=False)  # auto, manual
    confidence = Column(Numeric(5, 2))  # 0-100%
    status = Column(String(20), default="matched")  # matched, disputed, pending

    matched_by = Column(String(100))  # user or "system"
    notes = Column(Text)

    created_at = Column(DateTime, server_default=func.now())
