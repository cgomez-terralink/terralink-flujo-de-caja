from sqlalchemy import (
    Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Movement(Base):
    """Mirrors BBDD sheet from MCF — each row is a financial movement."""
    __tablename__ = "movements"

    id = Column(Integer, primary_key=True, index=True)

    # Col A: Tipo de movimiento (Ingreso / Egreso)
    movement_type = Column(String(20), nullable=False, index=True)

    # Col B: Banco
    bank_id = Column(Integer, ForeignKey("banks.id"), nullable=False, index=True)
    bank = relationship("Bank")

    # Col C: Proveedor / Cliente
    provider = Column(String(200))

    # Col D: OC (Orden de Compra)
    purchase_order = Column(String(50))

    # Col E: Factura
    invoice = Column(String(50))

    # Col F: Fecha Factura
    invoice_date = Column(Date)

    # Col G: Condición de pago
    payment_terms = Column(String(100))

    # Col H: FECHA (fecha del movimiento)
    date = Column(Date, nullable=False, index=True)

    # Col I: Documento
    document = Column(String(100))

    # Col J: IVA
    tax_amount = Column(Numeric(14, 0), default=0)

    # Col K: MONTO EE.RR (Estado de Resultados)
    income_statement_amount = Column(Numeric(14, 0), default=0)

    # Col L: Monto Flujo de caja
    cashflow_amount = Column(Numeric(14, 0), nullable=False)

    # Col M: Estado del ingreso/egreso
    status = Column(String(30), index=True)  # Real, Proyectado

    # Col N: Concepto
    concept = Column(String(200))

    # Col O: Centro de negocio
    business_center = Column(String(100), index=True)

    # Col P: Gastos_Op_y_Admin1
    operational_expenses_cat1 = Column(String(200))

    # Col Q: Egresos - Gastos_Administrativos
    admin_expenses_cat = Column(String(200))

    # Col R: Mes N
    month_number = Column(Integer)

    # Col S: MES EERR
    income_statement_month = Column(String(20))

    # Col T: FECHA FC (Fecha Flujo de Caja)
    cashflow_date = Column(Date)

    # Col U: Año
    year = Column(Integer, index=True)

    # Col V: AGRUPADOR 1 EERR
    group1_income_statement = Column(String(100))

    # Col W: AGRUPADOR 2 EERR
    group2_income_statement = Column(String(100))

    # Col X: AGRUPADOR 3 EERR
    group3_income_statement = Column(String(100))

    # Col Y: AGRUPADOR 1 FC
    group1_cashflow = Column(String(100))

    # Col Z: AGRUPADOR 2 FC
    group2_cashflow = Column(String(100))

    # Col AA: AGRUPADOR 3 FC
    group3_cashflow = Column(String(100))

    # Col AB: Mes/año (formula column)
    month_year = Column(String(20))

    # Metadata
    source = Column(String(20), default="manual")  # cartola, manual, import
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
