from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.bank import Bank
from app.models.cartola import CartolaEntry
from app.models.reconciliation import Reconciliation
from app.schemas.cartola import (
    CartolaEntryCreate,
    CartolaEntryResponse,
    ReconciliationCreate,
    ReconciliationResponse,
    ReconciliationSummary,
)

router = APIRouter(prefix="/cartolas", tags=["cartolas"])


@router.get("/", response_model=list[CartolaEntryResponse])
def list_cartola_entries(
    bank_id: int | None = None,
    year: int | None = None,
    month: int | None = None,
    reconciled: bool | None = None,
    skip: int = 0,
    limit: int = 500,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(CartolaEntry, Bank.name.label("bank_name")).join(Bank)
    if bank_id:
        q = q.filter(CartolaEntry.bank_id == bank_id)
    if year:
        q = q.filter(func.extract("year", CartolaEntry.date) == year)
    if month:
        q = q.filter(func.extract("month", CartolaEntry.date) == month)
    if reconciled is True:
        q = q.filter(CartolaEntry.movement_id.isnot(None))
    elif reconciled is False:
        q = q.filter(CartolaEntry.movement_id.is_(None))
    q = q.order_by(CartolaEntry.date.desc()).offset(skip).limit(limit)
    results = []
    for entry, bname in q.all():
        d = CartolaEntryResponse.model_validate(entry)
        d.bank_name = bname
        results.append(d)
    return results


@router.post("/", response_model=CartolaEntryResponse, status_code=201)
def create_cartola_entry(body: CartolaEntryCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    entry = CartolaEntry(**body.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    bank = db.query(Bank).get(entry.bank_id)
    resp = CartolaEntryResponse.model_validate(entry)
    resp.bank_name = bank.name if bank else None
    return resp


@router.post("/bulk", status_code=201)
def bulk_create_cartola_entries(entries: list[CartolaEntryCreate], db: Session = Depends(get_db), _=Depends(get_current_user)):
    objects = [CartolaEntry(**e.model_dump()) for e in entries]
    db.add_all(objects)
    db.commit()
    return {"created": len(objects)}


@router.get("/reconciliation/summary", response_model=ReconciliationSummary)
def reconciliation_summary(
    bank_id: int | None = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(CartolaEntry)
    if bank_id:
        q = q.filter(CartolaEntry.bank_id == bank_id)
    total = q.count()
    reconciled = q.filter(CartolaEntry.movement_id.isnot(None)).count()
    pending = total - reconciled
    auto = db.query(Reconciliation).filter(Reconciliation.match_type == "auto").count()
    manual = db.query(Reconciliation).filter(Reconciliation.match_type == "manual").count()
    return ReconciliationSummary(
        total_entries=total,
        reconciled=reconciled,
        pending=pending,
        auto_matched=auto,
        manual_matched=manual,
        reconciliation_rate=round(reconciled / total * 100, 1) if total > 0 else 0,
    )


@router.post("/reconcile", response_model=ReconciliationResponse, status_code=201)
def reconcile(body: ReconciliationCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    entry = db.query(CartolaEntry).get(body.cartola_entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entrada de cartola no encontrada")
    rec = Reconciliation(
        **body.model_dump(),
        status="matched",
        matched_by=user.email,
    )
    entry.movement_id = body.movement_id
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec
