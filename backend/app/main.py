import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import Base, engine
from backend.app.api import (
    health,
    datasets,
    customers,
    predictions,
    model,
    analytics,
    reports
)

# Setup logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("creditlens")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
    yield
    logger.info("Application shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="CreditLens AI — Full-Stack Credit Risk Intelligence & Explainability Platform",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["System Health"])
app.include_router(datasets.router, prefix=settings.API_V1_STR, tags=["Dataset Operations"])
app.include_router(customers.router, prefix=settings.API_V1_STR, tags=["Customer Management"])
app.include_router(predictions.router, prefix=settings.API_V1_STR, tags=["Risk Predictions & Explainability"])
app.include_router(model.router, prefix=settings.API_V1_STR, tags=["Model Operations & Metadata"])
app.include_router(analytics.router, prefix=settings.API_V1_STR, tags=["Portfolio Analytics"])
app.include_router(reports.router, prefix=settings.API_V1_STR, tags=["Report Generation"])


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "health_url": f"{settings.API_V1_STR}/health"
    }
