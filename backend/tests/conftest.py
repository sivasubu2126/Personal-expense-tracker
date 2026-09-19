import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.db.database import get_db
from app.db.models.base import Base
from app.core.config import settings

from sqlalchemy.pool import NullPool

import os

# Test database URL: use TEST_DATABASE_URL env var, or fall back to app settings
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL", settings.database_url)

engine_test = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
TestingSessionLocal = async_sessionmaker(engine_test, class_=AsyncSession, expire_on_commit=False)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest_asyncio.fixture(scope="session", autouse=True)
async def create_test_database():
    import sqlalchemy
    import asyncio
    # Create the db if it doesn't exist. Easiest way is to connect to the main db and issue a CREATE DATABASE
    try:
        tmp_engine = create_async_engine(settings.database_url.replace('/spendwise', '/mysql'), isolation_level="AUTOCOMMIT")
        async with tmp_engine.connect() as conn:
            await conn.execute(sqlalchemy.text("CREATE DATABASE IF NOT EXISTS spendwise_test"))
        await tmp_engine.dispose()
    except Exception:
        pass

    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine_test.dispose()

@pytest_asyncio.fixture()
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest_asyncio.fixture()
async def db_session():
    async with TestingSessionLocal() as session:
        yield session
