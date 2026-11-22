"""
Unit and integration tests for external API providers:
- OpenWeather
- OpenAQ
- Gemini Assistant
- Mailercloud Transactional Alerts
- Shipday Delivery Logistics
- IPStack Geolocation
"""
import pytest
from rest_framework.test import APIClient
from providers.openweather import OpenWeatherProvider
from providers.openaq import OpenAQProvider
from apps.advice.gemini_service import GeminiAssistantService
from apps.alerts.mailercloud import MailercloudService
from apps.alerts.shipday import ShipdayService


@pytest.fixture
def api_client():
    return APIClient()


def test_openweather_provider_initialization_and_fallback():
    provider = OpenWeatherProvider()
    assert provider.health_check() is True

    # Test fallback behavior with invalid/empty key
    provider_fallback = OpenWeatherProvider(api_key="")
    obs = provider_fallback.fetch_current('CH-SEC22-CAAQMS')
    assert 'temperature_c' in obs
    assert obs['temperature_c'] > 0


def test_openaq_provider_initialization_and_fallback():
    provider = OpenAQProvider()
    assert provider.health_check() is True

    provider_fallback = OpenAQProvider(api_key="")
    obs = provider_fallback.fetch_current('CH-SEC22-CAAQMS')
    assert 'station_code' in obs
    assert 'aqi' in obs


def test_gemini_assistant_service_rule_fallback():
    service = GeminiAssistantService(api_key="mock_key")
    res = service._generate_rule_fallback(
        question="Is it safe to go outside?",
        city="Chandigarh",
        aqi=145,
        category="Moderate"
    )
    assert "reply" in res
    assert "145" in res["reply"]
    assert res["is_llm"] is False
    assert res["rule_id"] == "RULE-OUTDOOR-SAFETY"


def test_mailercloud_service_dispatch():
    mailer = MailercloudService(api_key="mock_key")
    result = mailer.send_pollution_alert(
        recipient_email="test@airiac.org",
        recipient_name="Tester",
        city="Chandigarh",
        current_aqi=184,
        category="Moderate"
    )
    assert result["status"] in ["SENT", "QUEUED_AND_DISPATCHED"]
    assert result["recipient"] == "test@airiac.org"
    assert "message_id" in result


def test_shipday_service_order_creation():
    shipday = ShipdayService(api_key="mock_key")
    result = shipday.create_order(
        order_number="ORD-TEST-101",
        customer_name="Citizen",
        customer_address="Sector 17, Chandigarh",
        customer_phone="+919876543210",
        city="Chandigarh"
    )
    assert result["status"] in ["DISPATCHED", "ORDER_REGISTERED"]
    assert result["order_id"] == "ORD-TEST-101"


def test_gemini_chat_endpoint(api_client):
    response = api_client.post('/api/v1/advice/chat/', {
        'question': 'Can I jog outside today?',
        'city': 'Chandigarh',
        'aqi': 85,
        'category': 'Satisfactory',
    })
    assert response.status_code == 200
    assert 'reply' in response.data
    assert response.data['aqi'] == 85


def test_geo_locate_endpoint(api_client):
    response = api_client.get('/api/v1/geo/locate/')
    assert response.status_code == 200
    assert 'city' in response.data
    assert 'latitude' in response.data
    assert 'longitude' in response.data


def test_alerts_test_send_endpoint(api_client):
    response = api_client.post('/api/v1/alerts/test-send/', {
        'email': 'citizen@airiac.org',
        'name': 'Test Citizen',
        'city': 'Chandigarh',
        'aqi': 210,
        'category': 'Poor',
    })
    assert response.status_code == 200
    assert 'message_id' in response.data
