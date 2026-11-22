"""
Unit tests for Central Pollution Control Board (CPCB) NAQI calculation engine.
Verifies piecewise linear interpolation math, 6 health categories, breakpoint boundaries,
3-pollutant validation rule, prominent pollutant determination, and Severe category capping.
"""
import pytest
from rest_framework import status
from apps.air_quality.naqi import (
    calculate_naqi,
    calculate_sub_index,
    get_category_and_color,
)


def test_sub_index_calculation_good_band():
    """Verify sub-index calculation in Good category (0-50)."""
    # PM2.5: [0, 30] -> [0, 50]
    # Concentration 15 is exact midpoint -> Sub-index 25
    idx = calculate_sub_index('pm25', 15.0)
    assert idx == 25


def test_sub_index_calculation_moderate_band():
    """Verify sub-index calculation in Moderate category (101-200)."""
    # PM2.5: 84.6 falls in [60, 90] -> sub-index ~ 182
    idx = calculate_sub_index('pm25', 84.6)
    assert idx == 182


def test_severe_category_breakpoints_and_capping():
    """
    Verify Challenger 1 guidance:
    Upper breakpoints for Severe category: B_HI = 380 for PM2.5, 500 for PM10, capped at 500 AQI.
    """
    # PM2.5 = 380.0 should hit the upper boundary of 500
    assert calculate_sub_index('pm25', 380.0) == 500

    # PM2.5 exceeding 380.0 (e.g. 450.0) must be capped at 500
    assert calculate_sub_index('pm25', 450.0) == 500

    # PM10 = 500.0 should hit 500
    assert calculate_sub_index('pm10', 500.0) == 500

    # PM10 exceeding 500.0 (e.g. 620.0) must be capped at 500
    assert calculate_sub_index('pm10', 620.0) == 500


def test_category_and_color_mapping():
    """Verify official CPCB 6-band color and category mappings."""
    assert get_category_and_color(35) == ('Good', '#00B050')
    assert get_category_and_color(80) == ('Satisfactory', '#92D050')
    assert get_category_and_color(165) == ('Moderate', '#E5B800')
    assert get_category_and_color(240) == ('Poor', '#FF7C80')
    assert get_category_and_color(350) == ('Very Poor', '#C00000')
    assert get_category_and_color(450) == ('Severe', '#7030A0')
    assert get_category_and_color(500) == ('Severe', '#7030A0')


def test_three_pollutant_minimum_rule():
    """NAQI requires at least 3 valid pollutants. Fewer than 3 returns is_valid=False."""
    # 2 pollutants only
    res = calculate_naqi({'pm25': 45.0, 'no2': 30.0})
    assert res['is_valid'] is False
    assert res['aqi'] is None
    assert 'insufficient pollutants' in res['error']

    # 1 pollutant only
    res_single = calculate_naqi({'pm25': 50.0})
    assert res_single['is_valid'] is False
    assert res_single['aqi'] is None

    # Empty pollutants
    res_empty = calculate_naqi({})
    assert res_empty['is_valid'] is False


def test_mandatory_particulate_presence():
    """At least one of PM2.5 or PM10 must be present. 3 non-particulate pollutants fail."""
    # 3 pollutants (NO2, SO2, CO) but neither PM2.5 nor PM10
    res = calculate_naqi({'no2': 45.0, 'so2': 25.0, 'co': 1.2})
    assert res['is_valid'] is False
    assert 'neither PM2.5 nor PM10' in res['error']

    # 3 pollutants including PM10 -> valid
    res_pm10 = calculate_naqi({'pm10': 110.0, 'no2': 45.0, 'so2': 25.0})
    assert res_pm10['is_valid'] is True
    assert res_pm10['aqi'] is not None

    # 3 pollutants including PM2.5 -> valid
    res_pm25 = calculate_naqi({'pm25': 65.0, 'no2': 45.0, 'so2': 25.0})
    assert res_pm25['is_valid'] is True
    assert res_pm25['aqi'] is not None


def test_prominent_pollutant_determination():
    """Prominent pollutant must be the one with the maximum computed sub-index."""
    # Case 1: PM2.5 is worst
    res1 = calculate_naqi({'pm25': 140.0, 'pm10': 60.0, 'no2': 30.0})
    assert res1['is_valid'] is True
    assert res1['prominent_pollutant'] == 'PM2.5'

    # Case 2: PM10 is worst
    res2 = calculate_naqi({'pm25': 20.0, 'pm10': 280.0, 'no2': 30.0})
    assert res2['is_valid'] is True
    assert res2['prominent_pollutant'] == 'PM10'

    # Case 3: NO2 is worst
    res3 = calculate_naqi({'pm25': 15.0, 'pm10': 35.0, 'no2': 220.0})
    assert res3['is_valid'] is True
    assert res3['prominent_pollutant'] == 'NO2'


@pytest.mark.django_db
def test_calculate_endpoint_valid(api_client):
    """POST /api/v1/air-quality/calculate/ returns HTTP 200 with calculated NAQI."""
    payload = {
        'pm25': 84.6,
        'pm10': 152.3,
        'no2': 49.8,
        'so2': 14.2,
        'co': 0.9,
    }
    response = api_client.post('/api/v1/air-quality/calculate/', data=payload, format='json')
    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    assert data['is_valid'] is True
    assert data['aqi'] == 182
    assert data['category'] == 'Moderate'
    assert data['prominent_pollutant'] == 'PM2.5'
    assert 'sub_indices' in data


@pytest.mark.django_db
def test_calculate_endpoint_unprocessable(api_client):
    """POST /api/v1/air-quality/calculate/ returns HTTP 422 when rules not satisfied."""
    payload = {
        'no2': 40.0,
        'so2': 20.0,
    }
    response = api_client.post('/api/v1/air-quality/calculate/', data=payload, format='json')
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    data = response.json()
    assert data['is_valid'] is False
    assert data['aqi'] is None
    assert 'error' in data
