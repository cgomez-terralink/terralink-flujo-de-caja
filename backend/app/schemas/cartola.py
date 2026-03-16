from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class CartolaEntryBase(BaseModel):
    bank_id: int
    date: date
    document: Optional[str] = None
    description: Optional[str] = None
    debit: Decimal = 0
    credit: Decimal = 0
    balance: Optional[Decimal] = None
    overdraft_line: Optional[Decimal] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    source_file: Optional[str] = None


class CartolaEntryCreate(CartolaEntryBase):
    pass


class CartolaEntryResponse(CartolaEntryBase):
    id: int
    bank_name: Optional[str] = None
    movement_id: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ReconciliationCreate(BaseModel):
    cartola_entry_id: int
    movement_id: int
    match_type: str = "manual"
    confidence: Optional[Decimal] = None
    notes: Optional[str] = None


class ReconciliationResponse(BaseModel):
    id: int
    cartola_entry_id: int
    movement_id: int
    match_type: str
    confidence: Optional[Decimal] = None
    status: str
    matched_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ReconciliationSummary(BaseModel):
    total_entries: int
    reconciled: int
    pending: int
    auto_matched: int
    manual_matched: int
    reconciliation_rate: float
