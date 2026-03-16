from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.bank import Bank
from app.models.movement import Movement
from app.schemas.movement import (
    BankSummary,
    CashflowSummary,
    MovementCreate,
    MovementResponse,
    MovementUpdate,
)

router = APIRouter(prefix="/movements", tags=["movements"])


def _apply_filters(query, **kwargs):
    if kwargs.get("bank_id"):
        query = query.filter(Movement.bank_id == kwargs["bank_id"])
    if kwargs.get("movement_type"):
        query = query.filter(Movement.movement_type == kwargs["movement_type"])
    if kwargs.get("status"):
        query = query.filter(Movement.status == kwargs["status"])
    if kwargs.get("business_center"):
        query = query.filter(Movement.business_center == kwargs["business_center"])
    if kwargs.get("year"):
        query = query.filter(Movement.year == kwargs["year"])
    if kwargs.get("month"):
        query = query.filter(Movement.month_number == kwargs["month"])
    if kwargs.get("date_from"):
        query = query.filter(Movement.date >= kwargs["date_from"])
    if kwargs.get("date_to"):
        query = query.filter(Movement.date <= kwargs["date_to"])
    if kwargs.get("group1_cashflow"):
        query = query.filter(Movement.group1_cashflow == kwargs["group1_cashflow"])
    return query


@router.get("/", response_model=list[MovementResponse])
def list_movements(
    bank_id: Optional[int] = None,
    movement_type: Optional[str] = None,
    status: Optional[str] = None,
    business_center: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    group1_cashflow: Optional[str] = None,
    skip: int = 0,
    limit: int = 500,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Movement, Bank.name.label("bank_name")).join(Bank)
    q = _apply_filters(
        q, bank_id=bank_id, movement_type=movement_type, status=status,
        business_center=business_center, year=year, month=month,
        date_from=date_from, date_to=date_to, group1_cashflow=group1_cashflow,
    )
    q = q.order_by(Movement.date.desc()).offset(skip).limit(limit)
    results = []
    for mov, bname in q.all():
        d = MovementResponse.model_validate(mov)
        d.bank_name = bname
        results.append(d)
    return results


@router.get("/summary/by-period", response_model=list[CashflowSummary])
def cashflow_by_period(
    year: Optional[int] = None,
    bank_id: Optional[int] = None,
    business_center: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Cashflow summary grouped by month — like FC TL Total view."""
    q = db.query(
        Movement.month_year.label("period"),
        func.sum(case((Movement.movement_type == "Ingreso", Movement.cashflow_amount), else_=0)).label("inflows"),
        func.sum(case((Movement.movement_type == "Egreso", Movement.cashflow_amount), else_=0)).label("outflows"),
        func.count(Movement.id).label("count"),
    )
    q = _apply_filters(q, bank_id=bank_id, year=year, business_center=business_center, status=status)
    q = q.group_by(Movement.month_year).order_by(Movement.month_year)
    return [
        CashflowSummary(
            period=row.period or "Sin periodo",
            total_inflows=row.inflows or 0,
            total_outflows=abs(row.outflows or 0),
            net=(row.inflows or 0) + (row.outflows or 0),
            movement_count=row.count,
        )
        for row in q.all()
    ]


@router.get("/summary/by-bank", response_model=list[BankSummary])
def cashflow_by_bank(
    year: Optional[int] = None,
    month: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(
        Movement.bank_id,
        Bank.name.label("bank_name"),
        func.sum(case((Movement.movement_type == "Ingreso", Movement.cashflow_amount), else_=0)).label("inflows"),
        func.sum(case((Movement.movement_type == "Egreso", Movement.cashflow_amount), else_=0)).label("outflows"),
        func.count(Movement.id).label("count"),
    ).join(Bank)
    q = _apply_filters(q, year=year, month=month, status=status)
    q = q.group_by(Movement.bank_id, Bank.name)
    return [
        BankSummary(
            bank_id=row.bank_id, bank_name=row.bank_name,
            total_inflows=row.inflows or 0,
            total_outflows=abs(row.outflows or 0),
            net=(row.inflows or 0) + (row.outflows or 0),
            movement_count=row.count,
        )
        for row in q.all()
    ]


@router.get("/filters")
def get_filter_options(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Return unique values for filter dropdowns."""
    return {
        "banks": [{"id": b.id, "name": b.name} for b in db.query(Bank).filter(Bank.is_active == True).all()],
        "years": sorted({r[0] for r in db.query(Movement.year).distinct().all() if r[0]}),
        "statuses": sorted({r[0] for r in db.query(Movement.status).distinct().all() if r[0]}),
        "business_centers": sorted({r[0] for r in db.query(Movement.business_center).distinct().all() if r[0]}),
        "groups_cashflow": sorted({r[0] for r in db.query(Movement.group1_cashflow).distinct().all() if r[0]}),
    }


@router.post("/", response_model=MovementResponse, status_code=201)
def create_movement(body: MovementCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    mov = Movement(**body.model_dump())
    db.add(mov)
    db.commit()
    db.refresh(mov)
    bank = db.query(Bank).get(mov.bank_id)
    resp = MovementResponse.model_validate(mov)
    resp.bank_name = bank.name if bank else None
    return resp


@router.put("/{movement_id}", response_model=MovementResponse)
def update_movement(movement_id: int, body: MovementUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    mov = db.query(Movement).get(movement_id)
    if not mov:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(mov, k, v)
    db.commit()
    db.refresh(mov)
    bank = db.query(Bank).get(mov.bank_id)
    resp = MovementResponse.model_validate(mov)
    resp.bank_name = bank.name if bank else None
    return resp
