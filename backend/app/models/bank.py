from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base


class Bank(Base):
    __tablename__ = "banks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # BICE, Scotiabank, BCI, Itau, Security, Global66
    short_name = Column(String(20), nullable=False)
    account_number = Column(String(50))
    currency = Column(String(10), default="CLP")
    is_active = Column(Boolean, default=True)
