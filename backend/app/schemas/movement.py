from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class MovementBase(BaseModel):
    movement_type: str
    bank_id: int
    provider: Optional[str] = None
    purchase_order: Optional[str] = None
    invoice: Optional[str] = None
    invoice_date: Optional[date] = None
    payment_terms: Optional[str] = None
    date: date
    document: Optional[str] = None
    tax_amount: Decimal = 0
    income_statement_amount: Decimal = 0
    cashflow_amount: Decimal
    status: Optional[str] = None
    concept: Optional[str] = None
    business_center: Optional[str] = None
    operational_expenses_cat1: Optional[str] = None
    admin_expenses_cat: Optional[str] = None
    month_number: Optional[int] = None
    income_statement_month: Optional[str] = None
    cashflow_date: Optional[date] = None
    year: Optional[int] = None
    group1_income_statement: Optional[str] = None
    group2_income_statement: Optional[str] = None
    group3_income_statement: Optional[str] = None
    group1_cashflow: Optional[str] = None
    group2_cashflow: Optional[str] = None
    group3_cashflow: Optional[str] = None
    month_year: Optional[str] = None
    source: str = "manual"


class MovementCreate(MovementBase):
    pass


class MovementUpdate(BaseModel):
    movement_type: Optional[str] = None
    bank_id: Optional[int] = None
    provider: Optional[str] = None
    cashflow_amount: Optional[Decimal] = None
    status: Optional[str] = None
    concept: Optional[str] = None
    business_center: Optional[str] = None
    date: Optional[date] = None


class MovementResponse(MovementBase):
    id: int
    bank_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MovementFilters(BaseModel):
    bank_id: Optional[int] = None
    bank_name: Optional[str] = None
    movement_type: Optional[str] = None
    status: Optional[str] = None
    business_center: Optional[str] = None
    year: Optional[int] = None
    month: Optional[int] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    group1_cashflow: Optional[str] = None


class CashflowSummary(BaseModel):
    period: str
    total_inflows: Decimal
    total_outflows: Decimal
    net: Decimal
    movement_count: int


class BankSummary(BaseModel):
    bank_id: int
    bank_name: str
    total_inflows: Decimal
    total_outflows: Decimal
    net: Decimal
    movement_count: int
