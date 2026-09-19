import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.db.database import get_db, engine
from app.db.models.base import Base

# Import all models so Base.metadata knows about them
from app.db.models.user import User, RefreshToken  # noqa: F401
from app.db.models.finance import Transaction, Budget  # noqa: F401

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup if they don't exist."""
    logger.info("Starting up — ensuring database tables exist...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables ready.")
    except Exception as e:
        logger.error("Failed to create database tables: %s", str(e), exc_info=True)
    yield
    logger.info("Shutting down...")


# Conditionally disable docs in production
docs_kwargs = {}
if settings.is_production:
    docs_kwargs = {"docs_url": None, "redoc_url": None}

app = FastAPI(
    title=settings.app_name,
    description="Backend API for SpendWise Personal Expense Tracker",
    version="1.0.0",
    lifespan=lifespan,
    **docs_kwargs,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    messages = []
    for err in exc.errors():
        msg = err.get("msg", "Invalid value")
        loc = " -> ".join([str(x) for x in err.get("loc", []) if x != "body"])
        messages.append(f"{loc}: {msg}" if loc else msg)
    return JSONResponse(
        status_code=422,
        content={"detail": ", ".join(messages)},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    # Never leak internal error details in production
    if settings.is_production:
        logger.error("Unhandled exception: %s", str(exc), exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )


from app.api.routes import auth, transactions, budgets, analytics, backup, data

app.include_router(auth.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(budgets.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(backup.router, prefix="/api")
app.include_router(data.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "environment": settings.app_env}


@app.get("/api/health/db")
async def health_check_db(db: AsyncSession = Depends(get_db)):
    await db.execute(text("SELECT 1"))
    return {"status": "ok"}
