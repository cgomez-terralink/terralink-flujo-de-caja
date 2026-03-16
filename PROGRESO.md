# Plataforma Tesorería Terralink — Progreso

## Estado: V1 Creada (2026-03-15)

---

## Arquitectura

```
┌─────────────────────────┐      ┌─────────────────────────┐
│   FRONTEND (Vercel)     │      │   BACKEND (Render)      │
│                         │      │                         │
│  React 19 + TypeScript  │ ←──→ │  FastAPI (Python)       │
│  Tailwind CSS 3         │ HTTP │  SQLAlchemy 2.0         │
│  Recharts (gráficos)    │ JSON │  PostgreSQL (Render)    │
│  TanStack Query         │      │  Alembic (migraciones)  │
│  Vite 6                 │      │                         │
└─────────────────────────┘      └─────────────────────────┘
```

## Backend (`/code/backend/`)

### Estructura
```
backend/
├── app/
│   ├── api/           # Endpoints REST
│   │   ├── auth.py    # Login, registro
│   │   ├── banks.py   # CRUD bancos + seed
│   │   ├── movements.py  # CRUD movimientos + resúmenes
│   │   ├── cartolas.py   # CRUD cartolas + conciliación
│   │   └── deps.py    # Auth dependency
│   ├── core/
│   │   ├── config.py  # Settings (env vars)
│   │   ├── database.py # SQLAlchemy engine
│   │   └── security.py # JWT, bcrypt
│   ├── models/        # SQLAlchemy models
│   │   ├── user.py
│   │   ├── bank.py
│   │   ├── movement.py    # Espejo de BBDD del MCF
│   │   ├── cartola.py     # Entradas de cartola bancaria
│   │   └── reconciliation.py
│   ├── schemas/       # Pydantic validation
│   │   ├── user.py
│   │   ├── movement.py
│   │   └── cartola.py
│   └── main.py        # App FastAPI
├── alembic/           # Migraciones DB
├── requirements.txt
├── render.yaml        # Deploy config Render
└── .env.example
```

### Modelos de datos
| Modelo | Descripción | Columnas clave |
|--------|-------------|----------------|
| **Movement** | Espejo de BBDD del MCF (29 cols) | movement_type, bank_id, date, cashflow_amount, status, business_center, year, group1_cashflow |
| **CartolaEntry** | Movimientos de cartola bancaria | bank_id, date, debit, credit, balance, movement_id |
| **Bank** | 6 bancos de Terralink | BICE, Scotiabank, BCI, Itau, Security, Global66 |
| **Reconciliation** | Conciliación cartola↔movimiento | match_type (auto/manual), confidence, status |
| **User** | Usuarios del sistema | email, name, initials, role |

### Endpoints API
| Método | Path | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Login → JWT token |
| POST | `/api/v1/auth/register` | Registrar usuario |
| GET | `/api/v1/banks/` | Listar bancos |
| POST | `/api/v1/banks/seed` | Seed 6 bancos Terralink |
| GET | `/api/v1/movements/` | Listar movimientos (filtros: banco, año, mes, centro, estado) |
| GET | `/api/v1/movements/summary/by-period` | Resumen FC por período (tipo FC TL Total) |
| GET | `/api/v1/movements/summary/by-bank` | Resumen FC por banco |
| GET | `/api/v1/movements/filters` | Valores únicos para filtros |
| POST | `/api/v1/movements/` | Crear movimiento |
| PUT | `/api/v1/movements/{id}` | Actualizar movimiento |
| GET | `/api/v1/cartolas/` | Listar cartolas (filtros: banco, conciliado) |
| POST | `/api/v1/cartolas/bulk` | Carga masiva cartolas |
| GET | `/api/v1/cartolas/reconciliation/summary` | Resumen conciliación |
| POST | `/api/v1/cartolas/reconcile` | Conciliar entrada↔movimiento |

## Frontend (`/code/frontend/`)

### Estructura
```
frontend/
├── src/
│   ├── api/client.ts      # API client + tipos
│   ├── hooks/useAuth.tsx   # Contexto autenticación
│   ├── components/
│   │   ├── Nav.tsx         # Barra navegación (mockup)
│   │   ├── KPI.tsx         # Tarjeta KPI
│   │   ├── Card.tsx        # Card contenedor
│   │   └── FilterBar.tsx   # Barra filtros
│   ├── pages/
│   │   ├── Login.tsx       # Login
│   │   ├── Panel.tsx       # Dashboard con KPIs + gráficos
│   │   ├── FlujoCaja.tsx   # FC con filtros, gráficos, tabla tipo FC TL Total
│   │   ├── Movimientos.tsx # Tabla BBDD con todos los filtros
│   │   ├── Cartolas.tsx    # Entradas de cartola por banco
│   │   └── Conciliacion.tsx # Dashboard conciliación
│   ├── styles/index.css
│   └── App.tsx
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── vercel.json
└── .env.example
```

### Pestañas (basado en mockup)
1. **Panel** — KPIs + gráfico de barras FC + resumen por banco
2. **Flujo de Caja** — Filtros (año, banco, centro, estado Real/Proyectado) + gráficos + tabla tipo FC TL Total
3. **Movimientos** — Tabla completa BBDD con todos los filtros
4. **Cartolas** — Entradas bancarias por banco
5. **Conciliación** — Tasa conciliación, pendientes, auto-match

### Design System
- Colores del mockup: `--pri:#37ADE3`, `--ok:#34A853`, `--warn:#F59E0B`, `--err:#E85D5D`
- Fonts: DM Sans (UI), JetBrains Mono (números)
- Componentes: KPI cards, Cards, FilterBar, tablas con hover

## Deployment

### Backend → Render
- `render.yaml` configurado
- PostgreSQL free tier incluido
- Variables de entorno: DATABASE_URL (auto), SECRET_KEY (auto), CORS_ORIGINS

### Frontend → Vercel
- `vercel.json` con SPA rewrites
- Variable: `VITE_API_URL` apunta al backend en Render

## Usuarios iniciales
1. **Cristian Gómez** — cristian.gomez@terralink.cl (admin)
2. **Felipe Silva** — felipe.silva@terralink.cl (user)

## Bancos configurados
1. BICE (cuenta 01-32834-4)
2. Scotiabank
3. BCI
4. Itau (cuenta 221287697)
5. Security
6. Global66

---

## Próximos pasos
- [ ] Instalar Node.js en la máquina
- [ ] `cd frontend && npm install && npm run dev` para desarrollo local
- [ ] `cd backend && pip install -r requirements.txt` y configurar PostgreSQL local
- [ ] Crear migración inicial: `alembic revision --autogenerate -m "initial"`
- [ ] Seed de bancos: `POST /api/v1/banks/seed`
- [ ] Registrar usuarios: `POST /api/v1/auth/register`
- [ ] Cargar cartolas históricas de los 6 bancos
- [ ] Cargar movimientos BBDD desde MCF
- [ ] Deploy backend a Render
- [ ] Deploy frontend a Vercel
- [ ] Conectar variables de entorno
