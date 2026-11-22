"""
Unit and integration tests for SimpleJWT authentication and user lifecycle.
Verifies registration, login, token refresh, protected profile, and permission enforcement.
"""
import pytest
from rest_framework import status
from apps.accounts.models import User, UserProfile


@pytest.mark.django_db
def test_user_registration_success(api_client):
    """POST /api/v1/auth/register/ creates user, profile, and returns JWT tokens."""
    payload = {
        'email': 'sukhwinder.singh@chandigarh.gov.in',
        'password': 'SecurePassword123!',
        'first_name': 'Sukhwinder',
        'last_name': 'Singh',
        'preferred_sector': 'Sector 17',
    }
    response = api_client.post('/api/v1/auth/register/', data=payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    assert 'user' in data
    assert data['user']['email'] == 'sukhwinder.singh@chandigarh.gov.in'
    assert data['user']['role'] == 'citizen'
    assert 'tokens' in data
    assert 'access' in data['tokens']
    assert 'refresh' in data['tokens']

    # Confirm database persistence
    user = User.objects.get(email='sukhwinder.singh@chandigarh.gov.in')
    assert user.check_password('SecurePassword123!')
    assert UserProfile.objects.filter(user=user).exists()


@pytest.mark.django_db
def test_user_registration_duplicate_email(api_client, test_user):
    """Registration fails with HTTP 400 when email is already registered."""
    payload = {
        'email': test_user.email,
        'password': 'AnotherPassword123!',
        'first_name': 'Duplicate',
        'last_name': 'User',
    }
    response = api_client.post('/api/v1/auth/register/', data=payload, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'email' in response.json()


@pytest.mark.django_db
def test_user_registration_short_password(api_client):
    """Registration fails with HTTP 400 when password is under 8 characters."""
    payload = {
        'email': 'new_user@example.com',
        'password': 'short',
    }
    response = api_client.post('/api/v1/auth/register/', data=payload, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'password' in response.json()


@pytest.mark.django_db
def test_user_login_success(api_client, test_user):
    """POST /api/v1/auth/login/ with valid credentials returns JWT pair."""
    payload = {
        'email': test_user.email,
        'password': 'SecureTestPassword123!',
    }
    response = api_client.post('/api/v1/auth/login/', data=payload, format='json')
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert 'access' in data
    assert 'refresh' in data


@pytest.mark.django_db
def test_user_login_invalid_password(api_client, test_user):
    """Login fails with HTTP 401 when password does not match."""
    payload = {
        'email': test_user.email,
        'password': 'WrongPassword999!',
    }
    response = api_client.post('/api/v1/auth/login/', data=payload, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_token_refresh_lifecycle(api_client, test_user):
    """POST /api/v1/auth/token/refresh/ issues a new access token from refresh token."""
    login_resp = api_client.post('/api/v1/auth/login/', {
        'email': test_user.email,
        'password': 'SecureTestPassword123!',
    }, format='json')
    refresh_token = login_resp.json()['refresh']

    refresh_resp = api_client.post('/api/v1/auth/token/refresh/', {
        'refresh': refresh_token,
    }, format='json')
    assert refresh_resp.status_code == status.HTTP_200_OK
    assert 'access' in refresh_resp.json()


@pytest.mark.django_db
def test_protected_profile_unauthorized(api_client):
    """GET /api/v1/auth/me/ returns HTTP 401 without Bearer token."""
    response = api_client.get('/api/v1/auth/me/')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_protected_profile_authorized(api_client, test_user):
    """GET /api/v1/auth/me/ returns user profile when Bearer token is provided."""
    login_resp = api_client.post('/api/v1/auth/login/', {
        'email': test_user.email,
        'password': 'SecureTestPassword123!',
    }, format='json')
    access_token = login_resp.json()['access']

    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    response = api_client.get('/api/v1/auth/me/')
    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    assert data['email'] == test_user.email
    assert data['role'] == 'citizen'
    assert data['preferred_sector'] == 'Sector 17'


@pytest.mark.django_db
def test_update_profile_preferences(api_client, test_user):
    """PATCH /api/v1/auth/me/ updates vulnerability status and preferences."""
    login_resp = api_client.post('/api/v1/auth/login/', {
        'email': test_user.email,
        'password': 'SecureTestPassword123!',
    }, format='json')
    access_token = login_resp.json()['access']

    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    update_payload = {
        'is_vulnerable': True,
        'vulnerability_types': ['asthma', 'elderly'],
    }
    response = api_client.patch('/api/v1/auth/me/', data=update_payload, format='json')
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['is_vulnerable'] is True
    assert 'asthma' in data['vulnerability_types']
