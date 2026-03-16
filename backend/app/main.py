from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, banks, cartolas, movements
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(banks.router, prefix=settings.API_V1_PREFIX)
app.include_router(movements.router, prefix=settings.API_V1_PREFIX)
app.include_router(cartolas.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {"app": settings.PROJECT_NAME, "status": "running"}


@app.get("/health")
def health():
    return {"status": "ok"}
