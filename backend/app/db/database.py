import os
import ssl
import logging

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings
from typing import AsyncGenerator

logger = logging.getLogger(__name__)


def _build_ssl_context():
    """Build SSL context for database connection if SSL is required."""
    if not settings.database_ssl_required:
        return None

    ssl_ctx = ssl.create_default_context()

    ca_cert = settings.database_ca_cert.strip() if settings.database_ca_cert else ""

    if ca_cert and os.path.isfile(ca_cert):
        # Load CA certificate from file path
        ssl_ctx.load_verify_locations(cafile=ca_cert)
        logger.info("SSL: Loaded CA certificate from %s", ca_cert)
    else:
        # No CA cert provided — still use SSL but skip server cert verification
        # This is acceptable for initial setup; for full security, provide the CA cert
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        logger.warning(
            "SSL: No valid CA certificate found at '%s'. "
            "Connecting with SSL but without certificate verification. "
            "Download the CA cert from Aiven and set DATABASE_CA_CERT for full security.",
            ca_cert,
        )

    return ssl_ctx


# Build SSL context
_ssl_context = _build_ssl_context()

# Build connect_args based on SSL configuration
_connect_args = {"ssl": _ssl_context} if _ssl_context else {}

# Configure the async engine
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    connect_args=_connect_args,
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
