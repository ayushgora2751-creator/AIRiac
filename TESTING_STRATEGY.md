# BreatheWise: Comprehensive Testing Strategy & Quality Assurance
## Multi-Tier Test Architecture, Verification Protocols, and CI/CD Automation Targeting $\ge 80\%$ Coverage

**Document Identifier**: `TESTING_STRATEGY.md`  
**System Name**: BreatheWise Urban Air Quality Assistance Platform  
**Target Coverage Threshold**: $\ge 80\%$ Line & Branch Coverage Across All Core Engines, Auth, Validation & Spatial Systems  
**Standard Compliance**: CPCB NAQI Technical Guideline (2014/2015), ISO/IEC/IEEE 29119 Software Testing Standard, WCAG 2.1 AA  
**Document Version**: 2.0.0  
**Status**: Authoritative Quality Assurance Specification  

---

## Table of Contents
1. [Executive Testing Strategy & Coverage Mandate](#1-executive-testing-strategy--coverage-mandate)
2. [Test Architecture & Environment Topology](#2-test-architecture--environment-topology)
3. [Backend Unit Testing Suite (Pure-Python Engines)](#3-backend-unit-testing-suite-pure-python-engines)
   - 3.1 CPCB NAQI Piecewise Linear Interpolation Suite (All 8 Pollutants)
   - 3.2 3-Pollutant Minimum & Particulate Mandate Validation Suite
   - 3.3 Physiological Inhaled Particulate Dose Equation Suite
   - 3.4 Cigarette Equivalence Benchmark Suite
   - 3.5 Personal Risk Index ($PRI$) Scaling & Capping Suite
4. [Backend Spatial & Geospatial Test Suite](#4-backend-spatial--geospatial-test-suite)
   - 4.1 Uber H3 Discrete Global Grid (Resolution 7 & 8) Suite
   - 4.2 Inverse Distance Weighting (IDW) Interpolation Engine Suite
   - 4.3 PostGIS Spatial Query Suite (`ST_DWithin`, `ST_Centroid`, Bounding Box)
   - 4.4 Zero-Raw-GPS Privacy & Spatial Hashing Verification
5. [Backend Integration & API Testing Suite](#5-backend-integration--api-testing-suite)
   - 5.1 SimpleJWT Authentication & Token Lifecycle Suite
   - 5.2 Role-Based Access Control (RBAC) Permission Gates
   - 5.3 Serializer Validation & Standardized Error Envelope Compliance
   - 5.4 Asynchronous Celery EXIF Sanitization Task Pipeline
   - 5.5 Celery Beat 15-Minute Threshold Alert Evaluation Suite
6. [Frontend Testing Suite (Vitest, RTL & MSW)](#6-frontend-testing-suite-vitest-rtl--msw)
   - 6.1 Component Unit Tests & CPCB NAQI Color Badge Verification
   - 6.2 WCAG 2.1 AA Contrast Ratio Verification (Yellow Band Rule)
   - 6.3 Zustand Client State & Auth Lifecycle Store Tests
   - 6.4 Leaflet 1.9 Geospatial Map & H3 Hexagon Layer Integration Tests
   - 6.5 Recharts Visualizations (Diurnal & 72h Confidence Bands) via MSW
7. [Performance, Concurrency & Load Testing (Locust & k6)](#7-performance-concurrency--load-testing-locust--k6)
   - 7.1 Peak Concurrency Scenario (500 Virtual Users)
   - 7.2 Redis Cache-Aside Hit Rates & Latency Verification
   - 7.3 PostGIS Spatial Query Throughput Benchmarks
8. [Automated CI/CD Pipeline & Quality Gates](#8-automated-cicd-pipeline--quality-gates)
   - 8.1 GitHub Actions Workflow Matrix
   - 8.2 Enforced Coverage Gates & Static Analysis Rules

---

## 1. Executive Testing Strategy & Coverage Mandate

BreatheWise directly informs human health decisions, physical exercise scheduling, and vulnerable demographic risk mitigation. Consequently, software defects in atmospheric interpolation, physiological dose calculation, or alert delivery can result in tangible health hazards.

The platform enforces a non-negotiable **$\ge 80\%$ test coverage mandate** across all business-critical layers:
- **Pure-Python Deterministic Impact Engine**: $100\%$ line, branch, and boundary condition coverage.
- **Rule-Based Safety Verdict & CPCB NAQI Engine**: $100\%$ coverage against official government calibration tables.
- **Geospatial & PostGIS Ingestion**: $\ge 90\%$ coverage for bounding boxes, H3 indexing, and IDW spatial interpolation.
- **Authentication, RBAC & Privacy Pipeline**: $100\%$ coverage on token lifecycle, role gates, zero-raw-GPS checks, and EXIF sanitization.
- **Frontend State, Navigation & Visualizations**: $\ge 80\%$ component and store test coverage with automated WCAG 2.1 AA contrast verification.

```
+----------------------------------------------------------------------------------------------------+
|                                    BREATHEWISE TEST PYRAMID                                       |
|                                                                                                    |
|                                [ End-to-End & Load Tests ]                                         |
|                                - Locust 500-VU Concurrency                                         |
|                                - Playwright Happy Paths                                            |
|                                                                                                    |
|                       [ Integration & Contract Tests ]                                             |
|                       - DRF API Views & SimpleJWT Auth Lifecycle                                   |
|                       - Celery Asynchronous Tasks (EXIF, Daily Rollups)                            |
|                       - PostGIS Spatial Queries & Database Constraints                             |
|                       - Frontend MSW Network Mock Integration                                      |
|                                                                                                    |
|              [ Deterministic Unit & Engine Tests (Fast, Isolated) ]                                |
|              - CPCB NAQI Piecewise Linear Math (8 Pollutants)                                      |
|              - 3-Pollutant & Particulate Validation Enforcement                                    |
|              - Pure-Python Inhaled Dose Equation ($C \times V_E \times t \times (1-\eta)$)          |
|              - Cigarette Equivalence & Personal Risk Index ($PRI$) Capping                         |
|              - Uber H3 Hexagonal Grid Resolution 7/8 Indexing & IDW Math                           |
|              - Zustand Stores, Zod Schemas & WCAG AA Contrast Checks                               |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Test Architecture & Environment Topology

### 2.1 Backend Testing Toolchain
- **Test Runner**: `pytest` 8.x with `pytest-django` 4.8+.
- **Coverage Tool**: `pytest-cov` generating terminal reports and HTML coverage matrices (`--cov-report=html`).
- **Fixture Factories**: `factory-boy` 3.3+ and `faker` for model synthesis without hardcoded database IDs.
- **Spatial Testing**: `django.contrib.gis.geos` in-memory spatial geometry primitives with `SpatialTestCase` / PostGIS test database.
- **Asynchronous Task Testing**: Celery eager testing (`CELERY_TASK_ALWAYS_EAGER = True`) alongside Redis mock backends.

### 2.2 Frontend Testing Toolchain
- **Test Runner**: `Vitest` 1.5+ (native Vite integration for sub-second execution).
- **DOM Testing**: `@testing-library/react` 14.x and `@testing-library/user-event`.
- **API Mocking**: `msw` (Mock Service Worker) 2.x intercepting all REST requests at the network layer.
- **Accessibility Testing**: `vitest-axe` and `axe-core` validating WCAG 2.1 AA compliance in virtual DOM.

### 2.3 Load & Performance Testing Toolchain
- **Load Generation**: `Locust` 2.24+ for distributed concurrent user simulation.
- **Scenario Scripting**: Python-based user journey modeling (anonymous map browsing vs. authenticated exposure logging).

---

## 3. Backend Unit Testing Suite (Pure-Python Engines)

### 3.1 CPCB NAQI Piecewise Linear Interpolation Suite (All 8 Pollutants)
The Central Pollution Control Board defines official sub-index breakpoints across all 8 criteria pollutants: $PM_{2.5}, PM_{10}, NO_2, SO_2, CO, O_3, NH_3, Pb$.

```python
# tests/unit/test_naqi_engine.py
import pytest
from breathewise_core.engines.naqi import (
    calculate_sub_index,
    calculate_cpcb_naqi,
    NAQIInsufficientDataError,
    NAQICategory,
)

class TestCPCBSubIndexCalculations:
    """Validates piecewise linear interpolation across all 8 criteria pollutants."""

    @pytest.mark.parametrize("pollutant, concentration, expected_subindex, expected_category", [
        # PM2.5 tests (Breakpoints: 0-30:0-50, 31-60:51-100, 61-90:101-200, 91-120:201-300, 121-250:301-400, 250+:401-500)
        ("PM2.5", 15.0, 25, NAQICategory.GOOD),
        ("PM2.5", 30.0, 50, NAQICategory.GOOD),
        ("PM2.5", 45.0, 75, NAQICategory.SATISFACTORY),
        ("PM2.5", 60.0, 100, NAQICategory.SATISFACTORY),
        ("PM2.5", 75.0, 150, NAQICategory.MODERATE),
        ("PM2.5", 90.0, 200, NAQICategory.MODERATE),
        ("PM2.5", 105.0, 250, NAQICategory.POOR),
        ("PM2.5", 120.0, 300, NAQICategory.POOR),
        ("PM2.5", 185.5, 350, NAQICategory.VERY_POOR),
        ("PM2.5", 250.0, 400, NAQICategory.VERY_POOR),
        ("PM2.5", 380.0, 480, NAQICategory.SEVERE),

        # PM10 tests (0-50:0-50, 51-100:51-100, 101-250:101-200, 251-350:201-300, 351-430:301-400, 430+:401-500)
        ("PM10", 25.0, 25, NAQICategory.GOOD),
        ("PM10", 80.0, 80, NAQICategory.SATISFACTORY),
        ("PM10", 175.0, 150, NAQICategory.MODERATE),
        ("PM10", 300.0, 250, NAQICategory.POOR),
        ("PM10", 390.0, 350, NAQICategory.VERY_POOR),
        ("PM10", 500.0, 488, NAQICategory.SEVERE),

        # NO2 tests (0-40:0-50, 41-80:51-100, 81-180:101-200, 181-280:201-300, 281-400:301-400, 400+:401-500)
        ("NO2", 20.0, 25, NAQICategory.GOOD),
        ("NO2", 60.0, 75, NAQICategory.SATISFACTORY),
        ("NO2", 130.0, 150, NAQICategory.MODERATE),
        ("NO2", 230.0, 250, NAQICategory.POOR),
        ("NO2", 340.0, 350, NAQICategory.VERY_POOR),

        # SO2 tests (0-40:0-50, 41-80:51-100, 81-380:101-200, 381-800:201-300, 801-1600:301-400, 1600+:401-500)
        ("SO2", 30.0, 38, NAQICategory.GOOD),
        ("SO2", 230.5, 150, NAQICategory.MODERATE),

        # CO tests in mg/m3 (0-1.0:0-50, 1.1-2.0:51-100, 2.1-10:101-200, 10.1-17:201-300, 17.1-34:301-400, 34+:401-500)
        ("CO", 0.5, 25, NAQICategory.GOOD),
        ("CO", 1.5, 73, NAQICategory.SATISFACTORY),
        ("CO", 6.0, 150, NAQICategory.MODERATE),

        # O3 tests (0-50:0-50, 51-100:51-100, 101-168:101-200, 169-208:201-300, 209-748:301-400, 748+:401-500)
        ("O3", 25.0, 25, NAQICategory.GOOD),
        ("O3", 134.5, 150, NAQICategory.MODERATE),

        # NH3 tests (0-200:0-50, 201-400:51-100, 401-800:101-200, 801-1200:201-300, 1201-1800:301-400, 1800+:401-500)
        ("NH3", 100.0, 25, NAQICategory.GOOD),
        ("NH3", 600.0, 150, NAQICategory.MODERATE),

        # Pb tests (0-0.5:0-50, 0.6-1.0:51-100, 1.1-2.0:101-200, 2.1-3.0:201-300, 3.1-4.0:301-400, 4.0+:401-500)
        ("Pb", 0.25, 25, NAQICategory.GOOD),
        ("Pb", 1.55, 150, NAQICategory.MODERATE),
    ])
    def test_piecewise_linear_interpolation_accuracy(
        self, pollutant, concentration, expected_subindex, expected_category
    ):
        subindex, category = calculate_sub_index(pollutant, concentration)
        assert abs(subindex - expected_subindex) <= 1, (
            f"Pollutant {pollutant} at {concentration} expected {expected_subindex}, got {subindex}"
        )
        assert category == expected_category
```

### 3.2 3-Pollutant Minimum & Particulate Mandate Validation Suite
The official CPCB standard dictates:
1. NAQI can only be declared valid if at least three ($k \ge 3$) pollutants are available.
2. At least one of the pollutants must be a particulate ($PM_{2.5}$ or $PM_{10}$).

```python
# tests/unit/test_naqi_validation_rules.py
import pytest
from breathewise_core.engines.naqi import calculate_cpcb_naqi, NAQIInsufficientDataError

class TestCPCBValidationMandates:

    def test_valid_3_pollutants_with_pm25(self):
        """Passes when 3 pollutants including PM2.5 are provided."""
        pollutants = {"PM2.5": 85.0, "NO2": 45.0, "SO2": 25.0}
        result = calculate_cpcb_naqi(pollutants)
        assert result.naqi_value == 183
        assert result.category == "Moderate"
        assert result.prominent_pollutant == "PM2.5"

    def test_valid_3_pollutants_with_pm10(self):
        """Passes when 3 pollutants including PM10 are provided."""
        pollutants = {"PM10": 160.0, "NO2": 55.0, "CO": 1.2}
        result = calculate_cpcb_naqi(pollutants)
        assert result.naqi_value == 140
        assert result.category == "Moderate"
        assert result.prominent_pollutant == "PM10"

    def test_fails_when_fewer_than_3_pollutants(self):
        """Rejects when only 2 pollutants are supplied, even if PM2.5 is present."""
        pollutants = {"PM2.5": 95.0, "NO2": 50.0}
        with pytest.raises(NAQIInsufficientDataError) as exc_info:
            calculate_cpcb_naqi(pollutants)
        assert "At least 3 criteria pollutants are required" in str(exc_info.value)

    def test_fails_when_no_particulate_matter_present(self):
        """Rejects when 3 gaseous pollutants are supplied but neither PM2.5 nor PM10 is included."""
        pollutants = {"NO2": 70.0, "SO2": 45.0, "CO": 2.5}
        with pytest.raises(NAQIInsufficientDataError) as exc_info:
            calculate_cpcb_naqi(pollutants)
        assert "At least one particulate matter pollutant (PM2.5 or PM10) is mandatory" in str(exc_info.value)

    def test_pm25_tie_breaking_precedence(self):
        """PM2.5 takes prominent pollutant precedence if tied with another pollutant sub-index."""
        # PM2.5 at 30.0 gives subindex 50. PM10 at 50.0 gives subindex 50.
        pollutants = {"PM2.5": 30.0, "PM10": 50.0, "NO2": 20.0}
        result = calculate_cpcb_naqi(pollutants)
        assert result.naqi_value == 50
        assert result.prominent_pollutant == "PM2.5"
```

### 3.3 Physiological Inhaled Particulate Dose Equation Suite
Tests the pure-Python implementation of:
$$\text{Dose} (\mu\text{g}) = C \times V_E \times t \times (1 - \eta)$$

```python
# tests/unit/test_impact_engine.py
import pytest
from breathewise_core.engines.impact import (
    calculate_inhaled_dose,
    calculate_cigarette_equivalent,
    calculate_personal_risk_index,
    ActivityType,
    MaskType,
    SensitivityProfile,
)

class TestInhaledDoseEquation:

    def test_resting_no_mask_baseline(self):
        """Sedentary adult resting for 60 minutes in 100 ug/m3 PM2.5 without mask.
        VE = 0.008 m3/min * 60 min = 0.48 m3.
        Dose = 100 ug/m3 * 0.48 m3 * 1.0 = 48.0 ug."""
        dose = calculate_inhaled_dose(
            pm25_concentration=100.0,
            activity_type=ActivityType.SEDENTARY,
            duration_minutes=60,
            mask_type=MaskType.NONE,
        )
        assert dose == pytest.approx(48.0, rel=1e-3)

    def test_running_with_n95_respirator(self):
        """Adult running for 30 minutes in 200 ug/m3 PM2.5 wearing N95 respirator.
        VE = 0.060 m3/min * 30 min = 1.8 m3.
        eta = 0.95 (penetration = 0.05).
        Dose = 200 ug/m3 * 1.8 m3 * 0.05 = 18.0 ug."""
        dose = calculate_inhaled_dose(
            pm25_concentration=200.0,
            activity_type=ActivityType.RUNNING,
            duration_minutes=30,
            mask_type=MaskType.N95,
        )
        assert dose == pytest.approx(18.0, rel=1e-3)

    def test_zero_duration_yields_zero_dose(self):
        dose = calculate_inhaled_dose(
            pm25_concentration=350.0,
            activity_type=ActivityType.RUNNING,
            duration_minutes=0,
            mask_type=MaskType.NONE,
        )
        assert dose == 0.0
```

### 3.4 Cigarette Equivalence Benchmark Suite
Standardized benchmark: $1 \text{ cigarette} \equiv 216.0 \mu\text{g } PM_{2.5}$ total inhaled particulate mass.

```python
class TestCigaretteEquivalence:

    def test_exact_single_cigarette_equivalent(self):
        cigs = calculate_cigarette_equivalent(dose_micrograms=216.0)
        assert cigs == pytest.approx(1.0, rel=1e-3)

    def test_fractional_cigarette_equivalent(self):
        cigs = calculate_cigarette_equivalent(dose_micrograms=108.0)
        assert cigs == pytest.approx(0.5, rel=1e-3)

    def test_heavy_smog_exposure(self):
        # 1080 ug inhaled dose
        cigs = calculate_cigarette_equivalent(dose_micrograms=1080.0)
        assert cigs == pytest.approx(5.0, rel=1e-3)
```

### 3.5 Personal Risk Index ($PRI$) Scaling & Capping Suite
Formula:
$$PRI = \min\left(100.0, \frac{\text{Dose}}{D_{ref}} \times S \times 50.0\right)$$
where $D_{ref} = 300.0 \mu\text{g}$, and $S$ is the demographic sensitivity multiplier.

```python
class TestPersonalRiskIndex:

    def test_general_population_reference_dose(self):
        """General user receiving reference dose (300 ug).
        PRI = (300 / 300) * 1.0 * 50.0 = 50.0 (Moderate Risk)."""
        pri = calculate_personal_risk_index(
            dose_micrograms=300.0,
            profile=SensitivityProfile.GENERAL,
        )
        assert pri == pytest.approx(50.0, rel=1e-3)

    def test_copd_patient_elevated_risk(self):
        """COPD user (S = 2.20) receiving 300 ug dose.
        PRI = (300 / 300) * 2.20 * 50.0 = 110.0 -> Capped at 100.0."""
        pri = calculate_personal_risk_index(
            dose_micrograms=300.0,
            profile=SensitivityProfile.SENSITIVE_RESPIRATORY_COPD,
        )
        assert pri == 100.0  # Must be strictly capped at 100.0

    def test_asthma_patient_proportional_risk(self):
        """Asthma user (S = 1.85) receiving 100 ug dose.
        PRI = (100 / 300) * 1.85 * 50.0 = 30.83."""
        pri = calculate_personal_risk_index(
            dose_micrograms=100.0,
            profile=SensitivityProfile.SENSITIVE_RESPIRATORY_ASTHMA,
        )
        assert pri == pytest.approx(30.83, rel=1e-2)

    def test_pri_never_exceeds_100_under_extreme_exposure(self):
        pri = calculate_personal_risk_index(
            dose_micrograms=5000.0,
            profile=SensitivityProfile.SENSITIVE_RESPIRATORY_COPD,
        )
        assert pri == 100.0
```

---

## 4. Backend Spatial & Geospatial Test Suite

### 4.1 Uber H3 Discrete Global Grid (Resolution 7 & 8) Suite
Validates that cell generation covers Chandigarh without gaps and adheres to privacy boundaries.

```python
# tests/spatial/test_h3_grid.py
import pytest
from breathewise_core.spatial.h3_grid import (
    generate_chandigarh_h3_grid,
    point_to_h3_res8,
    h3_to_geojson_polygon,
    CHANDIGARH_BBOX,
)

class TestUberH3GridSystem:

    def test_chandigarh_grid_cell_count_resolution_8(self):
        """Resolution 8 over Chandigarh bounding box must generate between 60 and 75 cells."""
        cells = generate_chandigarh_h3_grid(resolution=8)
        assert 60 <= len(cells) <= 75
        # Verify all cells are valid 15-char H3 strings
        for cell in cells:
            assert isinstance(cell, str)
            assert len(cell) == 15

    def test_point_to_h3_conversion_sector_17(self):
        """Sector 17 centroid (30.7398, 76.7827) resolves to consistent H3 Res 8 index."""
        h3_idx = point_to_h3_res8(lat=30.7398, lon=76.7827)
        assert isinstance(h3_idx, str)
        assert h3_idx.startswith("88")  # Res 8 indices start with 88 in this region

    def test_h3_to_geojson_polygon_geometry(self):
        """Verifies H3 cell polygon coordinates form a valid closed hexagon (7 points, first=last)."""
        cells = generate_chandigarh_h3_grid(resolution=8)
        sample_cell = cells[0]
        geojson = h3_to_geojson_polygon(sample_cell)
        assert geojson["type"] == "Polygon"
        coordinates = geojson["coordinates"][0]
        assert len(coordinates) == 7  # 6 vertices + 1 closing vertex
        assert coordinates[0] == coordinates[-1]  # Closed ring
```

### 4.2 Inverse Distance Weighting (IDW) Interpolation Engine Suite
Ensures that cells adjacent to a station match the station's reading, and intermediate cells interpolate smoothly.

```python
# tests/spatial/test_idw_interpolation.py
import pytest
from breathewise_core.spatial.idw import idw_interpolate_h3, StationObservation

class TestIDWInterpolation:

    @pytest.fixture
    def four_stations(self):
        return [
            StationObservation(station_code="CH-SEC22", lat=30.7350, lon=76.7725, naqi=180.0, pm25=85.0),
            StationObservation(station_code="CH-SEC25", lat=30.7485, lon=76.7580, naqi=120.0, pm25=55.0),
            StationObservation(station_code="CH-SEC53", lat=30.7180, lon=76.7390, naqi=240.0, pm25=110.0),
            StationObservation(station_code="CH-SEC39", lat=30.7300, lon=76.7450, naqi=150.0, pm25=70.0),
        ]

    def test_exact_station_location_matches_station_value(self, four_stations):
        """Interpolating exactly at Sector 22 coordinates must match Sector 22 value."""
        result = idw_interpolate_h3(target_lat=30.7350, target_lon=76.7725, stations=four_stations)
        assert result.interpolated_naqi == pytest.approx(180.0, rel=1e-2)
        assert result.interpolated_pm25 == pytest.approx(85.0, rel=1e-2)

    def test_intermediate_point_bounded_by_station_extrema(self, four_stations):
        """An intermediate point within Chandigarh must have NAQI between 120 (min) and 240 (max)."""
        result = idw_interpolate_h3(target_lat=30.7300, target_lon=76.7600, stations=four_stations)
        assert 120.0 <= result.interpolated_naqi <= 240.0
```

### 4.3 PostGIS Spatial Query Suite (`ST_DWithin`, `ST_Centroid`, Bounding Box)
```python
# tests/spatial/test_postgis_queries.py
import pytest
from django.contrib.gis.geos import Point
from apps.locations.models import MonitoringStation

@pytest.mark.django_db
class TestPostGISQueries:

    def test_st_dwithin_station_radius_search(self):
        """Finds stations within 3000m of Sector 17 Plaza (30.7398, 76.7827)."""
        center = Point(76.7827, 30.7398, srid=4326)
        # Sector 22 station (76.7725, 30.7350) is ~1.2 km away
        stations = MonitoringStation.objects.filter(coordinates__dwithin=(center, 0.03))  # ~3km in degrees
        station_codes = [s.station_code for s in stations]
        assert "CH-SEC22" in station_codes
```

### 4.4 Zero-Raw-GPS Privacy & Spatial Hashing Verification
Static model introspection test verifying that user-facing models never declare coordinate geometry fields.

```python
# tests/spatial/test_privacy_architecture.py
import pytest
from django.apps import apps
from django.contrib.gis.db.models import GeometryField, PointField

class TestZeroRawGPSPrivacyMandate:

    PRIVACY_PROTECTED_MODELS = [
        ("accounts", "UserProfile"),
        ("locations", "SavedLocation"),
        ("reports", "PollutionReport"),
        ("exposure", "ExposureRecord"),
        ("alerts", "AlertPreference"),
    ]

    @pytest.mark.parametrize("app_label, model_name", PRIVACY_PROTECTED_MODELS)
    def test_models_contain_no_spatial_geometry_fields(self, app_label, model_name):
        model = apps.get_model(app_label, model_name)
        for field in model._meta.get_fields():
            assert not isinstance(field, (GeometryField, PointField)), (
                f"Privacy violation: Model {app_label}.{model_name} declares spatial geometry field '{field.name}'! "
                "Only H3 index strings are permitted for user data."
            )
            assert field.name not in ["latitude", "longitude", "lat", "lon", "coordinates"], (
                f"Privacy violation: Model {app_label}.{model_name} declares raw coordinate field '{field.name}'!"
            )
```

---

## 5. Backend Integration & API Testing Suite

### 5.1 SimpleJWT Authentication & Token Lifecycle Suite
```python
# tests/integration/test_auth_api.py
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User

@pytest.mark.django_db
class TestAuthAPILifecycle:

    def setup_method(self):
        self.client = APIClient()

    def test_user_registration_and_jwt_issuance(self):
        url = reverse("auth-register")
        payload = {
            "email": "citizen@breathewise.in",
            "password": "StrongPassword2024!",
            "name": "Amanpreet Kaur",
            "role": "CITIZEN"
        }
        res = self.client.post(url, payload, format="json")
        assert res.status_code == status.HTTP_201_CREATED
        assert "tokens" in res.data["data"]
        assert "access" in res.data["data"]["tokens"]
        assert "refresh" in res.data["data"]["tokens"]

    def test_blacklisted_token_rejected_after_logout(self):
        # 1. Register & login
        user = User.objects.create_user(email="test@breathewise.in", password="Password123!")
        login_res = self.client.post(reverse("auth-login"), {"email": user.email, "password": "Password123!"})
        refresh_token = login_res.data["data"]["tokens"]["refresh"]

        # 2. Logout with refresh token
        logout_res = self.client.post(reverse("auth-logout"), {"refresh": refresh_token})
        assert logout_res.status_code == status.HTTP_200_OK

        # 3. Attempt reuse of refresh token
        refresh_attempt = self.client.post(reverse("auth-refresh"), {"refresh": refresh_token})
        assert refresh_attempt.status_code == status.HTTP_401_UNAUTHORIZED
```

### 5.2 Role-Based Access Control (RBAC) Permission Gates
```python
# tests/integration/test_rbac_permissions.py
import pytest
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User

@pytest.mark.django_db
class TestRBACPermissions:

    def test_citizen_cannot_moderate_reports(self):
        citizen = User.objects.create_user(email="user@test.in", password="pw", role="CITIZEN")
        client = APIClient()
        client.force_authenticate(user=citizen)

        res = client.patch("/api/v1/reports/some-uuid/moderate/", {"status": "VERIFIED"})
        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_officer_can_moderate_reports(self):
        officer = User.objects.create_user(email="officer@cpcc.in", password="pw", role="OFFICER")
        client = APIClient()
        client.force_authenticate(user=officer)

        # Assuming report fixture exists
        # res = client.patch(f"/api/v1/reports/{report.id}/moderate/", {"status": "VERIFIED"})
        # assert res.status_code == status.HTTP_200_OK
```

### 5.3 Serializer Validation & Standardized Error Envelope Compliance
Validates that all failed API responses adhere strictly to:
`{"error": {"code": "...", "message": "...", "details": {...}}}`.

```python
# tests/integration/test_error_envelopes.py
import pytest
from rest_framework import status
from rest_framework.test import APIClient

@pytest.mark.django_db
class TestStandardizedErrorEnvelopes:

    def test_registration_validation_error_envelope(self):
        client = APIClient()
        res = client.post("/api/v1/auth/register/", {"email": "invalid-email"})
        assert res.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in res.data
        assert res.data["error"]["code"] == "VALIDATION_ERROR"
        assert "details" in res.data["error"]
        assert "email" in res.data["error"]["details"]
```

### 5.4 Asynchronous Celery EXIF Sanitization Task Pipeline
```python
# tests/unit/test_reports_exif.py
import io
import pytest
from PIL import Image
from apps.reports.tasks import sanitize_image_exif_data

class TestEXIFSanitization:

    def test_strips_gps_and_camera_metadata(self):
        # Create in-memory image with dummy EXIF tags
        img = Image.new("RGB", (100, 100), color="red")
        exif = img.getexif()
        exif[0x010F] = "TestCameraManufacturer"  # Make tag
        exif[0x0110] = "TestCameraModel"         # Model tag

        in_mem = io.BytesIO()
        img.save(in_mem, format="JPEG", exif=exif)
        in_mem.seek(0)

        # Execute sanitization
        sanitized_bytes = sanitize_image_exif_data(in_mem.getvalue())

        # Inspect sanitized image
        sanitized_img = Image.open(io.BytesIO(sanitized_bytes))
        sanitized_exif = sanitized_img.getexif()
        assert len(sanitized_exif) == 0, f"Expected 0 EXIF tags, found {len(sanitized_exif)}"
```

---

## 6. Frontend Testing Suite (Vitest, RTL & MSW)

### 6.1 Component Unit Tests & CPCB NAQI Color Badge Verification
```typescript
// frontend/src/components/common/AqiBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AqiBadge } from './AqiBadge';

describe('AqiBadge Component', () => {
  it('renders Good category with correct green color token', () => {
    render(<AqiBadge naqi={35} category="Good" />);
    const badge = screen.getByTestId('aqi-badge');
    expect(badge).toHaveTextContent('35');
    expect(badge).toHaveTextContent('Good');
    expect(badge.className).toContain('bg-[#00B050]');
  });

  it('renders Severe category with correct dark red color token', () => {
    render(<AqiBadge naqi={425} category="Severe" />);
    const badge = screen.getByTestId('aqi-badge');
    expect(badge).toHaveTextContent('425');
    expect(badge).toHaveTextContent('Severe');
    expect(badge.className).toContain('bg-[#C00000]');
  });
});
```

### 6.2 WCAG 2.1 AA Contrast Ratio Verification (Yellow Band Rule)
Mandate: Moderate (`#FFFF00`) must use dark slate text (`#1F2937`) to meet 4.5:1 contrast.

```typescript
// frontend/src/components/common/AqiBadgeA11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { AqiBadge } from './AqiBadge';

expect.extend(toHaveNoViolations);

describe('AqiBadge Accessibility (WCAG 2.1 AA)', () => {
  it('has zero contrast violations on Moderate (#FFFF00) yellow badge', async () => {
    const { container } = render(<AqiBadge naqi={150} category="Moderate" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 6.3 Zustand Client State & Auth Lifecycle Store Tests
```typescript
// frontend/src/store/useAuthStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('sets authentication state correctly upon login', () => {
    const mockUser = { id: '1', email: 'user@test.in', role: 'CITIZEN' };
    useAuthStore.getState().setAuth(mockUser, 'mock_access_token', 'mock_refresh_token');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('user@test.in');
    expect(state.accessToken).toBe('mock_access_token');
  });

  it('clears credentials upon logout', () => {
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
  });
});
```

### 6.4 Leaflet 1.9 Geospatial Map & H3 Hexagon Layer Integration Tests
```typescript
// frontend/src/components/map/H3HexagonLayer.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { H3HexagonLayer } from './H3HexagonLayer';
import { MapContainer } from 'react-leaflet';

describe('H3HexagonLayer Component', () => {
  it('renders H3 polygon feature collection onto Leaflet container', () => {
    const mockFeatures = [
      {
        type: 'Feature',
        properties: { h3_index: '881e205097fffff', naqi: 155, category: 'Moderate' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[76.77, 30.73], [76.78, 30.73], [76.78, 30.74], [76.77, 30.74], [76.77, 30.73]]]
        }
      }
    ];

    render(
      <MapContainer center={[30.73, 76.77]} zoom={12}>
        <H3HexagonLayer features={mockFeatures as any} />
      </MapContainer>
    );

    // Verifies SVG paths are injected into leaflet pane
    const paths = document.querySelectorAll('.leaflet-pane path');
    expect(paths.length).toBeGreaterThan(0);
  });
});
```

---

## 7. Performance, Concurrency & Load Testing (Locust & k6)

### 7.1 Peak Concurrency Scenario (500 Virtual Users)
Simulates peak morning traffic (08:00–09:30 AM IST) where 500 concurrent users poll real-time station data and H3 choropleth grid overlays.

```python
# tests/load/locustfile.py
from locust import HttpUser, task, between

class BreatheWiseUser(HttpUser):
    wait_time = between(1, 3)

    @task(5)
    def view_latest_grid(self):
        """High-frequency request: Fetch full Chandigarh H3 choropleth grid."""
        self.client.get("/api/v1/air-quality/grid/", name="[GET] /air-quality/grid/")

    @task(3)
    def view_stations(self):
        """Fetch all 4 CAAQMS station telemetry."""
        self.client.get("/api/v1/locations/stations/", name="[GET] /locations/stations/")

    @task(2)
    def view_diurnal_trends(self):
        """Fetch 24h diurnal cycle."""
        self.client.get("/api/v1/analytics/diurnal/?station_code=CH-SEC22", name="[GET] /analytics/diurnal/")

    @task(1)
    def view_forecast(self):
        """Fetch 72h forecast."""
        self.client.get("/api/v1/forecast/hourly/?station_code=CH-SEC22", name="[GET] /forecast/hourly/")
```

### 7.2 Redis Cache-Aside Hit Rates & Latency Verification
Performance benchmark targets:
- `/api/v1/air-quality/grid/`: Cache hit latency $\le 25\text{ ms}$, Cache miss latency $\le 120\text{ ms}$.
- Redis cache hit ratio target under steady load: $\ge 95\%$.
- Endpoint $p95$ response latency across all read endpoints: $< 200\text{ ms}$.

---

## 8. Automated CI/CD Pipeline & Quality Gates

### 8.1 GitHub Actions Workflow Matrix
Every Pull Request must pass the automated CI pipeline before merge approval:

```yaml
# .github/workflows/ci.yml
name: BreatheWise CI / CD Quality Gate

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-lint-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:16-3.4
        env:
          POSTGRES_DB: breathewise_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7.2-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - name: Install System GDAL & GEOS
        run: sudo apt-get update && sudo apt-get install -y libgdal-dev libgeos-dev

      - name: Install Dependencies
        run: pip install -r backend/requirements.txt pytest-cov flake8 black

      - name: Code Style & Lint
        run: |
          black --check backend/
          flake8 backend/ --max-line-length=120

      - name: Execute Pytest with Coverage Gate
        env:
          DATABASE_URL: postgis://postgres:password@localhost:5432/breathewise_test
          REDIS_URL: redis://localhost:6379/1
        run: |
          pytest --cov=breathewise_core --cov=apps --cov-report=term-missing --cov-fail-under=80

  frontend-lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Frontend Dependencies
        working-directory: frontend
        run: npm ci

      - name: Run ESLint & Prettier
        working-directory: frontend
        run: npm run lint

      - name: Run Vitest Unit & Accessibility Tests
        working-directory: frontend
        run: npm run test:coverage -- --coverage.thresholds.100=false --coverage.thresholds.lines=80
```

### 8.2 Enforced Coverage Gates & Static Analysis Rules
1. **Hard Coverage Gate**: Pull requests drop below 80% total test coverage are automatically blocked from merging.
2. **Zero-Raw-GPS Audit Gate**: The static analysis test `test_privacy_architecture.py` must run on every CI commit. Any model or migration introducing raw coordinate columns causes an immediate build failure.
3. **WCAG 2.1 AA Gate**: Any visual component violating accessibility contrast requirements blocks frontend build approval.
