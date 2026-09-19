import pytest

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_register_and_login(client):
    # Register
    res = await client.post("/api/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"
    
    # Login
    res2 = await client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert res2.status_code == 200
    assert "access_token" in res2.json()
    assert "refresh_token" in res2.cookies
