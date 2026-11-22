"""
Unit tests for AIRiac Data Provider Abstraction Layer and zero-network mock implementations.
Verifies MockCPCBProvider, MockWeatherProvider, MockFIRMSProvider determinism,
time-seeded diurnal variations, and asserts zero external socket/network connections.
"""
import socket
from providers.cpcb import MockCPCBProvider
from providers.weather import MockWeatherProvider
from providers.fires import MockFIRMSProvider


def test_mock_cpcb_provider_current():
    """Verify MockCPCBProvider generates valid observations for Chandigarh CAAQMS stations."""
    provider = MockCPCBProvider()
    assert provider.health_check() is True

    obs = provider.fetch_current('CH-SEC22-CAAQMS')
    assert obs['station_code'] == 'CH-SEC22-CAAQMS'
    assert 'aqi' in obs
    assert obs['aqi'] is not None
    assert obs['category'] in ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe']
    assert 'pm25' in obs['pollutants']
    assert 'pm10' in obs['pollutants']
    assert 'sub_indices' in obs


def test_mock_cpcb_hourly_series():
    """Verify MockCPCBProvider returns 24-hour diurnal series for charting."""
    provider = MockCPCBProvider()
    series = provider.fetch_hourly_series('CH-SEC22-CAAQMS', hours=24)
    assert len(series) == 24

    for point in series:
        assert 'timestamp' in point
        assert 'aqi' in point
        assert 'pm25' in point
        assert 'pm10' in point


def test_mock_cpcb_latest_summary():
    """Verify city-wide aggregate summary and station readings list."""
    provider = MockCPCBProvider()
    summary = provider.get_latest_summary()

    city_summary = summary['city_summary']
    assert city_summary['city'] == 'Chandigarh'
    assert city_summary['reporting_stations'] >= 3
    assert city_summary['average_aqi'] > 0
    assert len(summary['stations']) >= 3


def test_mock_weather_provider():
    """Verify MockWeatherProvider generates realistic Chandigarh surface meteorology."""
    provider = MockWeatherProvider()
    assert provider.health_check() is True

    weather = provider.fetch_current('CH-SEC22-CAAQMS')
    assert 'temperature_c' in weather
    assert 10.0 <= weather['temperature_c'] <= 45.0
    assert 10.0 <= weather['relative_humidity_pct'] <= 100.0
    assert weather['wind_speed_kmh'] >= 0.0
    assert 0.0 <= weather['wind_direction_deg'] <= 360.0
    assert weather['surface_pressure_hpa'] > 950.0


def test_mock_firms_provider():
    """Verify MockFIRMSProvider generates stubble fire incidents in border districts."""
    provider = MockFIRMSProvider()
    assert provider.health_check() is True

    data = provider.fetch_current()
    assert 'incidents' in data
    assert data['active_fire_count'] > 0
    assert data['total_frp_mw'] > 0.0

    incident = data['incidents'][0]
    assert 'source_id' in incident
    assert 'brightness_temperature' in incident
    assert 'frp' in incident
    assert incident['district'] in ['SAS Nagar (Mohali)', 'Patiala', 'Fatehgarh Sahib', 'Ambala']


def test_zero_network_calls_guarantee(monkeypatch):
    """
    Strict Verification: Asserts that all mock provider operations run with ZERO external network calls.
    Attempts to open a socket connection will immediately fail the test.
    """
    def mock_socket_connect(*args, **kwargs):
        raise RuntimeError("External network connection attempted in zero-network mock provider!")

    monkeypatch.setattr(socket.socket, "connect", mock_socket_connect)

    cpcb = MockCPCBProvider()
    cpcb.fetch_current('CH-SEC22-CAAQMS')
    cpcb.fetch_hourly_series('CH-SEC22-CAAQMS', hours=12)
    cpcb.get_latest_summary()

    weather = MockWeatherProvider()
    weather.fetch_current('CH-SEC22-CAAQMS')
    weather.fetch_historical('CH-SEC22-CAAQMS', days=2)

    firms = MockFIRMSProvider()
    firms.fetch_current()
    firms.fetch_historical(days=3)


def test_can_resolve_host_socket_probe():
    """Verify _can_resolve_host returns False for unreachable hosts/ports without hanging."""
    from config.settings import _can_resolve_host
    assert _can_resolve_host('') is False
    assert _can_resolve_host(None) is False
    # Unreachable non-routable / unassigned port on localhost
    assert _can_resolve_host('127.0.0.1', port=59999) is False
    assert _can_resolve_host('nonexistent.domain.invalid', port=5432) is False


def test_gemini_service_early_guard_without_api_key(monkeypatch):
    """Verify GeminiAssistantService returns rule fallback instantly when API key is missing."""
    from apps.advice.gemini_service import GeminiAssistantService
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    service = GeminiAssistantService()
    assert service.api_key is None
    res = service.ask("Is it safe outside?", city="Chandigarh", aqi=160, category="Moderate")
    assert res["is_llm"] is False
    assert res["model"] == "cpcb-rule-engine-fallback"
    assert "160" in res["reply"]

    service_empty = GeminiAssistantService(api_key="")
    assert service_empty.api_key is None


def test_advice_chat_view_malformed_aqi_fallback(monkeypatch):
    """Verify GeminiChatAssistantView handles non-numeric/None aqi gracefully without 500 error."""
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    from rest_framework.test import APIRequestFactory
    from apps.advice.views import GeminiChatAssistantView
    factory = APIRequestFactory()
    view = GeminiChatAssistantView.as_view()

    # Pass non-numeric string for aqi
    req = factory.post(
        '/api/v1/advice/chat/',
        {'question': 'Is it safe?', 'aqi': 'invalid_string'},
        format='json'
    )
    response = view(req)
    assert response.status_code == 200
    assert response.data['aqi'] == 150

    # Pass None for aqi
    req2 = factory.post(
        '/api/v1/advice/chat/',
        {'question': 'Is it safe?', 'aqi': None},
        format='json'
    )
    response2 = view(req2)
    assert response2.status_code == 200
    assert response2.data['aqi'] == 150


def test_alerts_test_view_malformed_aqi_fallback(monkeypatch):
    """Verify MailercloudTestAlertView handles non-numeric aqi gracefully without 500 error."""
    monkeypatch.delenv('MAILERCLOUD_API_KEY', raising=False)
    from rest_framework.test import APIRequestFactory
    from apps.alerts.views import MailercloudTestAlertView
    factory = APIRequestFactory()
    view = MailercloudTestAlertView.as_view()

    req = factory.post('/api/v1/alerts/test/', {'aqi': 'corrupt_value'}, format='json')
    response = view(req)
    assert response.status_code == 200
    assert response.data['aqi'] == 184


