"""
Unit and integration tests for AIRiac health check endpoints.
Verifies active database and cache diagnostics, HTTP 200 healthy status, and HTTP 503 degradation.
"""
import pytest
from rest_framework import status
from django.db import connection
from django.core.cache import cache


@pytest.mark.django_db
def test_health_check_healthy_v1(api_client):
    """GET /api/v1/health/ returns HTTP 200 with healthy database and cache."""
    response = api_client.get('/api/v1/health/')
    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    assert data['status'] == 'healthy'
    assert 'timestamp' in data
    assert data['version'] == '1.0.0'
    assert data['services']['database']['status'] == 'up'
    assert 'engine' in data['services']['database']
    assert data['services']['cache']['status'] == 'up'
    assert 'backend' in data['services']['cache']


@pytest.mark.django_db
def test_health_check_healthy_root(api_client):
    """GET /api/health/ root probe returns HTTP 200 matching contract."""
    response = api_client.get('/api/health/')
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['status'] == 'healthy'
    assert data['services']['database']['status'] == 'up'
    assert data['services']['cache']['status'] == 'up'


@pytest.mark.django_db
def test_health_check_database_degraded(api_client, monkeypatch):
    """Simulates database failure and verifies HTTP 503 unhealthy response."""
    def mock_cursor():
        raise Exception("could not connect to server: Connection refused")

    monkeypatch.setattr(connection, "cursor", mock_cursor)

    response = api_client.get('/api/v1/health/')
    assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    data = response.json()

    assert data['status'] == 'unhealthy'
    assert data['services']['database']['status'] == 'down'
    assert 'Connection refused' in data['services']['database']['error']
    # Cache should still report operational
    assert data['services']['cache']['status'] == 'up'


@pytest.mark.django_db
def test_health_check_cache_degraded(api_client, monkeypatch):
    """Simulates cache failure and verifies HTTP 503 unhealthy response."""
    def mock_cache_set(*args, **kwargs):
        raise Exception("Redis timeout: Connection closed by server")

    monkeypatch.setattr(cache, "set", mock_cache_set)

    response = api_client.get('/api/v1/health/')
    assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    data = response.json()

    assert data['status'] == 'unhealthy'
    assert data['services']['cache']['status'] == 'down'
    assert 'Redis timeout' in data['services']['cache']['error']
    # Database should still report operational
    assert data['services']['database']['status'] == 'up'
