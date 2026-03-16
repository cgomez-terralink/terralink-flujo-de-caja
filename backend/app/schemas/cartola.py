from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class CartolaEntryBase(BaseModel):
    bank_id: int
    date: date
    document: str | None = None
    description: str | None = None
    debit: Decimal = 0
    credit: Decimal = 0
    balance: Decimal | None = None
    overdraft_line: Decimal | None = None
    period_start: date | None = None
    period_end: date | None = None
    source_file: str | None = None


class CartolaEntryCreate(CartolaEntryBase):
    pass


class CartolaEntryResponse(CartolaEntryBase):
    id: int
    bank_name: str | None = None
    movement_id: int | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class ReconciliationCreate(BaseModel):
    cartola_entry_id: int
    movement_id: int
    match_type: str = "manual"
    confidence: Decimal | None = None
    notes: str | None = None


class ReconciliationResponse(BaseModel):
    id: int
    cartola_entry_id: int
    movement_id: int
    match_type: str
    confidence: Decimal | None = None
    status: str
    matched_by: str | None = None
    notes: str | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class ReconciliationSummary(BaseModel):
    total_entries: int
    reconciled: int
    pending: int
    auto_matched: int
    manual_matched: int
    reconciliation_rate: float
