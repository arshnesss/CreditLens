import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "CreditLens AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Database: SQLite fallback for local development without Docker, or PostgreSQL
    DATABASE_URL: str = "sqlite:///./creditlens.db"

    # Paths
    DATA_DIR: str = "./data"
    MODEL_DIR: str = "./models"

    # Risk thresholds (Configurable)
    # Predicted Probability of Default (PD) cutoffs:
    # Low Risk: PD < LOW_RISK_THRESHOLD
    # Medium Risk: LOW_RISK_THRESHOLD <= PD < HIGH_RISK_THRESHOLD
    # High Risk: PD >= HIGH_RISK_THRESHOLD
    LOW_RISK_THRESHOLD: float = 0.20
    HIGH_RISK_THRESHOLD: float = 0.45

    # Optional LLM Key
    OPENAI_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Ensure directories exist
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.MODEL_DIR, exist_ok=True)
