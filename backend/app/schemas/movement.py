from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class MovementBase(BaseModel):
    movement_type: str
    bank_id: int
    provider: str | None = None
    purchase_order: str | None = None
    invoice: str | None = None
    invoice_date: date | None = None
    payment_terms: str | None = None
    date: date
    document: str | None = None
    tax_amount: Decimal = 0
    income_statement_amount: Decimal = 0
    cashflow_amount: Decimal
    status: str | None = None
    concept: str | None = None
    business_center: str | None = None
    operational_expenses_cat1: str | None = None
    admin_expenses_cat: str | None = None
    month_number: int | None = None
    income_statement_month: str | None = None
    cashflow_date: date | None = None
    year: int | None = None
    group1_income_statement: str | None = None
    group2_income_statement: str | None = None
    group3_income_statement: str | None = None
    group1_cashflow: str | None = None
    group2_cashflow: str | None = None
    group3_cashflow: str | None = None
    month_year: str | None = None
    source: str = "manual"


class MovementCreate(MovementBase):
    pass


class MovementUpdate(BaseModel):
    movement_type: str | None = None
    bank_id: int | None = None
    provider: str | None = None
    cashflow_amount: Decimal | None = None
    status: str | None = None
    concept: str | None = None
    business_center: str | None = None
    date: date | None = None


class MovementResponse(MovementBase):
    id: int
    bank_name: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class MovementFilters(BaseModel):
    bank_id: int | None = None
    bank_name: str | None = None
    movement_type: str | None = None
    status: str | None = None
    business_center: str | None = None
    year: int | None = None
    month: int | None = None
    date_from: date | None = None
    date_to: date | None = None
    group1_cashflow: str | None = None


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
