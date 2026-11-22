"""
Shared pytest fixtures and configurations for AIRiac backend test suite.
"""
import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User, UserProfile
from apps.locations.models import Sector


@pytest.fixture
def api_client():
    """Returns an unauthenticated REST API client."""
    return APIClient()


@pytest.fixture
def sector(db):
    """Creates a default Chandigarh test sector."""
    return Sector.objects.create(
        sector_number="Sector 17",
        name="City Centre Plaza",
        zone="central",
    )


@pytest.fixture
def test_user(db, sector):
    """Creates a standard citizen test user with profile."""
    user = User.objects.create_user(
        email="test_citizen@chandigarh.gov.in",
        password="SecureTestPassword123!",
        first_name="Sukhwinder",
        last_name="Singh",
        role="citizen",
    )
    UserProfile.objects.create(
        user=user,
        preferred_sector=sector,
        is_vulnerable=False,
        vulnerability_types=[],
    )
    return user


@pytest.fixture
def authenticated_client(test_user):
    """Returns a client authenticated as test_user."""
    client = APIClient()
    client.force_authenticate(user=test_user)
    return client
