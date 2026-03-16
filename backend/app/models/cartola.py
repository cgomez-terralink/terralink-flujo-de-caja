from sqlalchemy import (
    Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class CartolaEntry(Base):
    """Raw bank statement entry — one row per transaction from bank cartola."""
    __tablename__ = "cartola_entries"

    id = Column(Integer, primary_key=True, index=True)

    bank_id = Column(Integer, ForeignKey("banks.id"), nullable=False, index=True)
    bank = relationship("Bank")

    date = Column(Date, nullable=False, index=True)
    document = Column(String(100))
    description = Column(Text)
    debit = Column(Numeric(14, 0), default=0)   # Cargos
    credit = Column(Numeric(14, 0), default=0)   # Abonos
    balance = Column(Numeric(14, 0))              # Saldo Contable
    overdraft_line = Column(Numeric(14, 0))       # Línea Sobregiro

    period_start = Column(Date)
    period_end = Column(Date)

    # Link to reconciled movement (if matched)
    movement_id = Column(Integer, ForeignKey("movements.id"), nullable=True)
    movement = relationship("Movement")

    source_file = Column(String(200))  # filename of imported cartola
    created_at = Column(DateTime, server_default=func.now())
