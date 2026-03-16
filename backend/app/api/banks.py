from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.bank import Bank

router = APIRouter(prefix="/banks", tags=["banks"])


class BankResponse(BaseModel):
    id: int
    name: str
    short_name: str
    account_number: Optional[str] = None
    currency: str
    is_active: bool

    model_config = {"from_attributes": True}


@router.get("/", response_model=list[BankResponse])
def list_banks(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Bank).filter(Bank.is_active == True).all()


@router.post("/seed")
def seed_banks(db: Session = Depends(get_db)):
    """Seed initial bank data for Terralink."""
    banks = [
        {"name": "BICE", "short_name": "BICE", "account_number": "01-32834-4"},
        {"name": "Scotiabank", "short_name": "Scotia", "account_number": None},
        {"name": "BCI", "short_name": "BCI", "account_number": None},
        {"name": "Itau", "short_name": "Itau", "account_number": "221287697"},
        {"name": "Security", "short_name": "Security", "account_number": None},
        {"name": "Global66", "short_name": "G66", "account_number": None},
    ]
    created = 0
    for b in banks:
        if not db.query(Bank).filter(Bank.name == b["name"]).first():
            db.add(Bank(**b, currency="CLP"))
            created += 1
    db.commit()
    return {"message": f"{created} bancos creados"}
