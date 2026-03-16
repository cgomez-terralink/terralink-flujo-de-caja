from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Terralink Tesorería"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "sqlite:///./terralink.db"

    SECRET_KEY: str = "change-me-in-production-use-env-var"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    ALGORITHM: str = "HS256"

    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://terralink-tesoreria.vercel.app",
        "https://terralink-flujo-de-caja.vercel.app",
    ]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
