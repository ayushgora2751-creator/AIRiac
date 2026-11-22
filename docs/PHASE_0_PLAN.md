# AIRiac: Urban Air Quality Assistant (Chandigarh-First)
# Phase 0 Written Plan and Scaffolding Proposal

**Version**: 1.0.0  
**Phase**: Phase 0 — Foundational Architecture & Containerized Scaffolding  
**Status**: APPROVED & ACTIVE  
**Target City**: Chandigarh Union Territory (First Geographic Focus), India  
**Date**: November 2026  

---

## 1. Executive Summary & Objectives

The **Urban Air Quality Assistant (AIRiac)** is a hyper-local, real-time environmental decision-support web platform designed specifically for the Chandigarh capital region (incorporating Chandigarh UT, SAS Nagar/Mohali, and Panchkula — the Tricity).

The primary objective of **Phase 0** is to establish an enterprise-grade, containerized monorepo scaffolding, backend API architecture, and frontend single-page application (SPA) foundation. Phase 0 guarantees:
- **Zero External API Network Dependencies**: Implements a robust data provider abstraction layer with deterministic, time-seeded mock fixtures adhering strictly to Indian National Air Quality Index (NAQI) standards.
- **Full 6-Service Docker Compose Orchestration**: Encapsulates Django 5.1 REST API (`web`), PostgreSQL 16 + PostGIS 3.4 (`db`), Redis 7 (`redis`), Celery 5.4 worker (`worker`), Celery Beat scheduler (`beat`), and Vite React TypeScript dev server (`frontend`).
- **Complete Domain-Driven Architecture**: 13 isolated Django domain applications managing authentication, geospatial sectors, continuous monitoring stations, pollutant records, weather parameters, agricultural fires, forecasting, health impacts, actionable advisories, alert thresholds, administrative reports, clean route planning, and citizen science reporting.
- **Strict Verification Baselines**: Automated test coverage through `pytest`/`pytest-django` on the backend and `vitest`/`@testing-library/react` on the frontend.

---

## 2. Monorepo Repository File Tree

The repository is structured as a clean, unified monorepo separating concerns between backend, frontend, documentation, and tooling.

```text
AIRiac/
├── .env.example                               # Root environment configuration template across 9 sections
├── .gitignore                                 # Clean root gitignore (ignores virtualenvs, node_modules, temp artifacts)
├── README.md                                  # Monorepo overview, architecture, quickstart, docker & local guides
├── docker-compose.yml                         # 6-service Docker Compose orchestration specification
├── config/                                    # Workspace & monorepo-wide tool configs
│   └── .editorconfig                          # Global code formatting standards (spaces, indent, line endings)
├── docs/                                      # Comprehensive architectural and contract documentation
│   ├── PHASE_0_PLAN.md                        # This document: Phase 0 architecture, services, env vars & plan
│   ├── ARCHITECTURE.md                        # Detailed 13-app backend architecture, PostGIS design & frontend models
│   └── API_CONTRACTS.md                       # OpenAPI specifications, endpoint contracts & CPCB NAQI formats
├── backend/                                   # Django 5.1 REST API Service (Python 3.12)
│   ├── Dockerfile                             # Production-grade Debian Bookworm Dockerfile with PostGIS C-libraries
│   ├── .dockerignore                          # Build context exclusion rules
│   ├── pyproject.toml                         # PEP 518/621 build configuration and dependency specifications
│   ├── requirements.txt                       # Locked dependencies for deterministic container builds
│   ├── pytest.ini                             # Pytest test runner configuration & custom markers
│   ├── manage.py                              # Django administrative execution utility
│   ├── scripts/
│   │   └── entrypoint.sh                      # Database readiness polling and automatic migration runner
│   ├── config/                                # Django Core Project Configuration
│   │   ├── __init__.py                        # Celery app export initialization
│   │   ├── settings.py                        # Unified Django settings (SimpleJWT, PostGIS, Celery, CORS)
│   │   ├── urls.py                            # Root URL routing, versioning, drf-spectacular endpoints
│   │   ├── wsgi.py                            # WSGI entrypoint for production HTTP servers (e.g. Gunicorn)
│   │   ├── asgi.py                            # ASGI entrypoint for asynchronous protocol handling
│   │   └── celery.py                          # Celery application instance and task autodiscovery
│   ├── apps/                                  # 13 Modular Domain Applications
│   │   ├── accounts/                          # Custom User model (UUID pk), SimpleJWT auth, UserProfile
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── locations/                         # Chandigarh Sectors (1-63), CAAQMS Monitoring Stations
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── air_quality/                       # Pollutant observations, CPCB NAQI calculation engine
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── naqi.py                        # Pure Python Indian NAQI calculation & breakpoint engine
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── weather/                           # Meteorological observations (Temp, RH, Wind Speed/Dir, Pressure)
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── fires/                             # Farm fires / Stubble burning incidents (FRP, satellite source)
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── forecasting/                       # 24h/72h AQI forecasts, diurnal rolling statistics
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── impact/                            # Health risk assessment matrix by demographic vulnerability
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── advice/                            # Actionable health advisories (masks, purifiers, outdoor exercise)
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── alerts/                            # Threshold configuration, notification subscriptions, logs
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── reports/                           # Daily/weekly executive summaries and NAAQS compliance
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── planning/                          # Clean route navigation and minimal exposure travel windows
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── community/                         # Citizen science reporting (stubble smoke, garbage fires, dust)
│   │   │   ├── __init__.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   └── geo/                               # Chandigarh BBOX, PostGIS extension creation, spatial utils
│   │       ├── __init__.py
│   │       ├── apps.py
│   │       ├── constants.py
│   │       ├── utils.py
│   │       └── migrations/
│   │           └── 0001_enable_postgis.py     # Initial PostGIS spatial extension migration
│   ├── providers/                             # Data Provider Abstraction Layer (Zero Network Calls)
│   │   ├── __init__.py
│   │   ├── base.py                            # Abstract BaseDataProvider interface
│   │   ├── cpcb.py                            # Mock CPCB Chandigarh CAAQMS provider (time-seeded)
│   │   ├── weather.py                         # Mock IMD Chandigarh weather provider
│   │   ├── fires.py                           # Mock NASA FIRMS stubble burning provider
│   │   └── fixtures/                          # Deterministic JSON/YAML fixtures
│   │       ├── chandigarh_stations.json       # Sector 22, Sector 25 PU, Sector 53, Sector 17, Sukhna Lake
│   │       └── stubble_fire_samples.json      # Border district stubble fire samples
│   └── tests/                                 # Pytest Test Automation Suite
│       ├── __init__.py
│       ├── conftest.py                        # Fixtures: API client, test user, spatial mocks
│       ├── test_health.py                     # Health endpoint diagnostic validation (DB + Cache)
│       ├── test_auth.py                       # User registration, login, token refresh, /me profile
│       ├── test_naqi.py                       # CPCB sub-index math & 3-pollutant validation rules
│       └── test_providers.py                  # Mock provider determinism & zero network assertions
└── frontend/                                  # React 18.3 Vite TypeScript Single Page Application
    ├── Dockerfile                             # Node 20/22 Alpine container specification
    ├── .dockerignore                          # Build context exclusion rules
    ├── package.json                           # Dependencies (React, Leaflet, Recharts, TanStack Query, Tailwind)
    ├── vite.config.ts                         # Vite build, dev server proxy, Vitest configuration
    ├── tsconfig.json                          # TypeScript application compiler configuration
    ├── tsconfig.node.json                     # Node tooling compiler configuration
    ├── tailwind.config.js                     # Custom Indian NAQI color tokens & UI utilities
    ├── postcss.config.js                      # PostCSS plugins (TailwindCSS, Autoprefixer)
    ├── index.html                             # SPA HTML entrypoint
    ├── public/                                # Static assets
    │   ├── favicon.ico
    │   └── placeholder.svg
    └── src/
        ├── main.tsx                           # Root entrypoint with QueryClientProvider & AuthProvider
        ├── App.tsx                            # Root application view (Header, Map, Pollutants, Chart, Advice)
        ├── index.css                          # Global styles & NAQI theme tokens
        ├── api/                               # Typed REST API Client & Interceptors
        │   ├── client.ts                      # Axios instance with Bearer injection & 401 refresh interceptor
        │   ├── health.ts                      # Health check API query
        │   ├── auth.ts                        # Login, registration, token refresh, current profile
        │   ├── airQuality.ts                  # Station readings, NAQI calculation, trend data
        │   └── types.ts                       # OpenAPI TypeScript request/response interfaces
        ├── context/                           # React Context Providers
        │   └── AuthContext.tsx                # Authentication state, login/logout, tokens in localStorage
        ├── hooks/                             # TanStack Query Custom Hooks
        │   ├── useHealthCheck.ts              # Periodic backend connectivity polling
        │   ├── useAirQuality.ts               # Station observations and forecast data query
        │   └── useAuth.ts                     # Auth session hook
        ├── components/                        # UI Components by Domain
        │   ├── common/                        # Reusable foundational UI elements
        │   │   ├── Header.tsx                 # Navigation bar with live backend health status badge
        │   │   ├── Footer.tsx                 # Project attribution and CPCB NAQI methodology disclaimer
        │   │   ├── AQIBadge.tsx               # Color-coded badge rendering NAQI numerical score & band
        │   │   ├── MetricCard.tsx             # Individual pollutant display (PM2.5, PM10, NO2, etc.)
        │   │   └── StatusPill.tsx             # Pulsing server health diagnostic indicator
        │   ├── dashboard/                     # Core Dashboard Views
        │   │   ├── CityOverview.tsx           # Primary Chandigarh city-wide average AQI summary card
        │   │   ├── PollutantGrid.tsx          # 7-card responsive grid of monitored pollutants
        │   │   ├── TrendChart.tsx             # Recharts 24h diurnal trend with NAQI threshold reference lines
        │   │   └── HealthAdvice.tsx           # Demographic-specific health advisory card
        │   ├── map/                           # Spatial Visualization Components
        │   │   ├── ChandigarhMap.tsx          # Leaflet map container (centered at [30.7333, 76.7794])
        │   │   ├── StationMarker.tsx          # Custom SVG map pin color-coded to station AQI
        │   │   ├── StationPopup.tsx           # Leaflet popup displaying station concentrations
        │   │   └── MapLegend.tsx              # 6-band Indian NAQI color legend
        │   └── auth/                          # User Authentication Components
        │       ├── AuthModal.tsx              # Dialog container for Login & Register forms
        │       ├── LoginForm.tsx              # Email/password login with JWT validation
        │       ├── RegisterForm.tsx           # User registration with sector preference
        │       └── UserProfile.tsx            # Authenticated user view and preferences
        ├── types/                             # Shared TypeScript Domain Type Definitions
        │   ├── aqi.ts                         # Pollutant values, sub-indices, NAQI category strings
        │   ├── auth.ts                        # User credentials, JWT tokens, profile types
        │   └── health.ts                      # Health check response contract interfaces
        └── test/                              # Vitest Test Automation Suite
            ├── setup.ts                       # JSDOM polyfills (matchMedia, ResizeObserver, Leaflet mocks)
            ├── mocks/
            │   └── mockData.ts                # Deterministic test fixtures for stations and readings
            ├── components/
            │   ├── Header.test.tsx            # Header rendering and health status badge verification
            │   ├── AQIBadge.test.tsx          # Color band and label mapping test across 6 NAQI bands
            │   └── HealthAdvice.test.tsx      # Advisory text verification per AQI severity
            ├── api/
            │   ├── client.test.ts             # Axios interceptor Bearer token injection and refresh retry
            │   └── auth.test.ts               # Auth API functions unit tests
            └── App.test.tsx                   # End-to-end frontend mount smoke test
```

---

## 3. Complete 6-Service Docker Compose Architecture

The application runs via a multi-service orchestration configured in `docker-compose.yml`. Each service operates in an isolated container joined by a unified bridge network (`airiac_network`), using explicit health checks and dependency gates.

```
┌────────────────────────────────────────────────────────────────────────┐
│                         airiac_network (Bridge)                        │
│                                                                        │
│   ┌──────────────┐          ┌──────────────┐      ┌────────────────┐   │
│   │   frontend   │ ──(HTTP)─│     web      │ ──── │   db (PostGIS) │   │
│   │  (Port 5173) │          │  (Port 8000) │      │  (Port 5432)   │   │
│   └──────────────┘          └──────┬───────┘      └────────────────┘   │
│                                    │                       ▲           │
│                                    │                       │           │
│                             (Task Dispatch)           (State Sync)     │
│                                    │                       │           │
│                                    ▼                       │           │
│                             ┌──────────────┐               │           │
│                             │    redis     │               │           │
│                             │  (Port 6379) │               │           │
│                             └──────┬───────┘               │           │
│                                    │                       │           │
│                           ┌────────┴────────┐              │           │
│                           ▼                 ▼              │           │
│                     ┌───────────┐     ┌───────────┐        │           │
│                     │  worker   │     │   beat    │────────┘           │
│                     │  (Celery) │     │ (Scheduler│                    │
│                     └───────────┘     └───────────┘                    │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Service Catalog & Configuration Matrix

| Service | Base Image / Context | Internal Port | Host Port | Persistent Volumes | Health Check Command | Dependency Gate |
|---|---|---|---|---|---|---|
| **`db`** | `postgis/postgis:16-3.4-alpine` | `5432` | `5432` | `airiac_db_data:/var/lib/postgresql/data` | `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}` (10s interval, 5s timeout, 5 retries) | None (Foundational Service) |
| **`redis`** | `redis:7-alpine` | `6379` | `6379` | `airiac_redis_data:/data` | `redis-cli ping` (10s interval, 5s timeout, 5 retries) | None (Foundational Cache/Queue) |
| **`web`** | `backend/Dockerfile` (`python:3.12-slim-bookworm`) | `8000` | `8000` | `./backend:/app` (live reload) | `curl -f http://localhost:8000/api/v1/health/ \|\| exit 1` (15s interval, 5s timeout, retries: 5, start_period: 25s) | `db` (healthy), `redis` (healthy) |
| **`worker`** | `backend/Dockerfile` (`celery -A config worker`) | N/A | N/A | `./backend:/app` | Process supervision via Celery event loop | `db` (healthy), `redis` (healthy) |
| **`beat`** | `backend/Dockerfile` (`celery -A config beat`) | N/A | N/A | `./backend:/app` | Process supervision via DatabaseScheduler | `db` (healthy), `redis` (healthy) |
| **`frontend`**| `frontend/Dockerfile` (`node:20-alpine`) | `5173` | `5173` | `./frontend:/app`, `/app/node_modules` (anonymous) | `wget -qO- http://localhost:5173/ \|\| exit 1` (15s interval, 5s timeout, 3 retries) | `web` (healthy) |

### 3.2 Key Orchestration Guarantees
1. **Container Startup Sequence**:
   - `db` and `redis` start first and perform internal initialization.
   - `web`, `worker`, and `beat` defer container readiness until `db` and `redis` report `service_healthy`.
   - `entrypoint.sh` executes in `web` to wait on PostgreSQL port `5432` via `netcat`, runs `python manage.py migrate --noinput`, and then launches the server.
   - `frontend` waits until `web` passes its health check, ensuring zero HTTP 502 / network connection refused errors during initial page load.
2. **Anonymous Volume Isolation**:
   - The frontend volume configuration specifies `/app/node_modules` as an anonymous volume to prevent host Windows node_modules from overwriting or colliding with Linux container binaries.

---

## 4. Comprehensive Environment Variable Catalog

Environment variables are organized into 9 logical sections. Defaults support both containerized Docker Compose execution and local host development.

```text
# =================================================================
# AIRiac: Urban Air Quality Assistant (Chandigarh-First)
# Phase 0 Environment Variable Catalog
# =================================================================
```

### Section 1: Django Core Configuration
- `SECRET_KEY`: Cryptographic signing key. Default: `django-insecure-phase0-airiac-chandigarh-development-key-xyz123`. Production must override with high-entropy 50+ character random string.
- `DEBUG`: Boolean flag controlling verbose error tracebacks. Container/Local Dev: `True`. Production: `False`.
- `ALLOWED_HOSTS`: Comma-separated list of valid Host header hostnames. Default: `localhost,127.0.0.1,web,frontend,0.0.0.0`.

### Section 2: PostgreSQL with PostGIS Configuration
- `POSTGRES_DB`: PostgreSQL database name. Default: `airiac_db`.
- `POSTGRES_USER`: Database superuser name. Default: `airiac`.
- `POSTGRES_PASSWORD`: Database user password. Default: `airiac_secure_password`.
- `DB_NAME`: Django database binding name. Default: `airiac_db`.
- `DB_USER`: Django database user. Default: `airiac`.
- `DB_PASSWORD`: Django database password. Default: `airiac_secure_password`.
- `DB_HOST`: Hostname of PostgreSQL service. In Docker Compose: `db`. In Local Host Dev: `localhost`.
- `DB_PORT`: Database port. Default: `5432`.

### Section 3: Redis & Caching Configuration
- `REDIS_URL`: Redis connection URI for general caching. In Docker: `redis://redis:6379/0`. In Local Dev: `redis://localhost:6379/0`.
- `CACHE_URL`: Redis URI for Django cache backend. Default: `redis://redis:6379/1` (or localhost).
- `REDIS_PORT`: Port exposed by Redis. Default: `6379`.

### Section 4: Celery Task Queue & Scheduler Configuration
- `CELERY_BROKER_URL`: Redis URL used by Celery for message passing. Default: `redis://redis:6379/0`.
- `CELERY_RESULT_BACKEND`: Redis URL used for storing asynchronous task outputs. Default: `redis://redis:6379/0`.
- `CELERY_TIMEZONE`: Timezone for periodic task scheduling. Default: `Asia/Kolkata`.

### Section 5: Security & CORS Configuration
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of origins permitted to make cross-origin REST requests. Default: `http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000`.
- `CORS_ALLOW_ALL_ORIGINS`: Disables strict CORS origin validation if True. Default: `False`.

### Section 6: SimpleJWT Authentication Settings
- `SIMPLE_JWT_ACCESS_TOKEN_LIFETIME_MINUTES`: Expiration time for access JWT. Default: `60` (1 hour).
- `SIMPLE_JWT_REFRESH_TOKEN_LIFETIME_DAYS`: Expiration time for refresh JWT. Default: `7` (7 days).

### Section 7: Frontend Vite Configuration
- `VITE_API_BASE_URL`: Base URL used by Axios frontend client. In Docker / Local Host: `http://localhost:8000/api/v1`.
- `VITE_APP_TITLE`: Application title in browser title bar. Default: `Urban Air Quality Assistant (AIRiac Chandigarh)`.
- `VITE_DEFAULT_LAT`: Default latitude for map center. Default: `30.7333` (Chandigarh Sector 17).
- `VITE_DEFAULT_LNG`: Default longitude for map center. Default: `76.7794`.
- `VITE_DEFAULT_ZOOM`: Default initial Leaflet zoom level. Default: `12`.
- `FRONTEND_PORT`: Host port bound to frontend dev server. Default: `5173`.
- `WEB_PORT`: Host port bound to Django API server. Default: `8000`.

### Section 8: Geographic & Regional Settings (Chandigarh UT)
- `TIME_ZONE`: Standard regional timezone. Default: `Asia/Kolkata`.
- `DEFAULT_CITY`: Primary focus city. Default: `Chandigarh`.
- `CHANDIGARH_BBOX_MIN_LAT`: Southern bounding box latitude. Default: `30.6500`.
- `CHANDIGARH_BBOX_MAX_LAT`: Northern bounding box latitude. Default: `30.8200`.
- `CHANDIGARH_BBOX_MIN_LNG`: Western bounding box longitude. Default: `76.6800`.
- `CHANDIGARH_BBOX_MAX_LNG`: Eastern bounding box longitude. Default: `76.8800`.

### Section 9: Mock Data & External Provider Settings (Phase 0 Zero Network)
- `USE_MOCK_DATA`: Global toggle enforcing deterministic mock fixtures. Default: `True`.
- `AIR_QUALITY_DATA_PROVIDER`: Active air quality provider implementation. Default: `mock_cpcb`.
- `WEATHER_DATA_PROVIDER`: Active weather data provider implementation. Default: `mock_imd`.
- `FIRMS_DATA_PROVIDER`: Active stubble fire data provider implementation. Default: `mock_firms`.

---

## 5. Initial Database Migrations Plan & Dependency Graph

Because spatial geometries (`PointField`, `PolygonField`) depend on PostGIS C-extensions inside PostgreSQL, migrations must follow a strict topological order.

### 5.1 Migration Execution Sequence

```text
[01. geo.0001_enable_postgis] 
          │ (Creates PostGIS extension)
          ├─────────────────────────────────────────────────┐
          ▼                                                 ▼
[02. accounts.0001_initial]                       [03. geo.0002_initial_bbox]
          │ (Custom User model)                             │
          ├─────────────────────────┬───────────────────────┤
          ▼                         ▼                       ▼
[04. locations.0001_initial] (Sectors & CAAQMS Stations with PointField/PolygonField)
          │
          ├─────────────────────────┬───────────────────────┬───────────────────────┐
          ▼                         ▼                       ▼                       ▼
[05. air_quality.0001]   [06. weather.0001]     [07. fires.0001]       [08. forecasting.0001]
 (PollutantReadings)      (Observations)         (Thermal Anomalies)    (AQIForecasts)
          │                         │                       │                       │
          └─────────────────────────┴───────────┬───────────┴───────────────────────┘
                                                ▼
          ┌─────────────────────────────────────┼───────────────────────────────────┐
          ▼                                     ▼                                   ▼
[09. impact.0001]                     [10. advice.0001]                   [11. alerts.0001]
(Vulnerability Matrix)                 (Health Advisories)                 (Thresholds & Logs)
          │                                     │                                   │
          └─────────────────────────────────────┼───────────────────────────────────┘
                                                ▼
          ┌─────────────────────────────────────┴───────────────────────────────────┐
          ▼                                                                         ▼
[12. reports.0001]                                                        [13. planning.0001]
(Daily/Weekly Summaries)                                                   (Clean Route Queries)
          │
          ▼
[14. community.0001]
(Citizen Science Reports)
```

### 5.2 Extension Migration Implementation
Migration `backend/apps/geo/migrations/0001_enable_postgis.py`:
```python
from django.contrib.gis.db.operations import CreateExtension
from django.db import migrations

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        CreateExtension('postgis'),
    ]
```

### 5.3 Local Development & Testing Accommodation
For environments lacking native OSGeo/GDAL C-libraries (such as Windows host environments without OSGeo4W), Django's settings support a graceful local mock engine or SQLite fallback for non-spatial unit testing, while the Docker container (`postgis/postgis:16-3.4` + Debian `libgdal-dev`) provides full native PostGIS execution.

---

## 6. Data Contract Specifications

### 6.1 Diagnostic Health Check Contract
- **Endpoint**: `GET /api/v1/health/` (and `/api/health/`)
- **Authentication**: None required (Public probe)
- **Success Response (HTTP 200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-11-22T08:00:00.000Z",
  "services": {
    "database": {
      "status": "up",
      "engine": "django.contrib.gis.db.backends.postgis"
    },
    "cache": {
      "status": "up",
      "backend": "django_redis.cache.RedisCache"
    }
  },
  "version": "1.0.0"
}
```
- **Failure Response (HTTP 503 Service Unavailable)**:
```json
{
  "status": "unhealthy",
  "timestamp": "2026-11-22T08:00:00.000Z",
  "services": {
    "database": {
      "status": "down",
      "error": "could not connect to server: Connection refused"
    },
    "cache": {
      "status": "up",
      "backend": "django_redis.cache.RedisCache"
    }
  },
  "version": "1.0.0"
}
```

### 6.2 Authentication Contracts (SimpleJWT)
All token endpoints follow standard OAuth2 Bearer JSON format:
1. **User Registration**:
   - `POST /api/v1/auth/register/`
   - Request Body:
     ```json
     {
       "email": "citizen@chandigarh.gov.in",
       "password": "SecurePassword123!",
       "first_name": "Sukhwinder",
       "last_name": "Singh",
       "preferred_sector": "Sector 17"
     }
     ```
   - Response (HTTP 201 Created):
     ```json
     {
       "user": {
         "id": "c3b9b4f4-5b7c-482a-9e12-8d76d45e1234",
         "email": "citizen@chandigarh.gov.in",
         "first_name": "Sukhwinder",
         "last_name": "Singh",
         "role": "citizen"
       },
       "tokens": {
         "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
         "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
       }
     }
     ```
2. **User Login**:
   - `POST /api/v1/auth/login/`
   - Request Body: `{"email": "citizen@chandigarh.gov.in", "password": "SecurePassword123!"}`
   - Response (HTTP 200 OK): `{"access": "...", "refresh": "..."}`
3. **Token Refresh**:
   - `POST /api/v1/auth/token/refresh/`
   - Request Body: `{"refresh": "..."}`
   - Response (HTTP 200 OK): `{"access": "..."}`
4. **Current User Profile**:
   - `GET /api/v1/auth/me/`
   - Header: `Authorization: Bearer <access_token>`
   - Response (HTTP 200 OK):
     ```json
     {
       "id": "c3b9b4f4-5b7c-482a-9e12-8d76d45e1234",
       "email": "citizen@chandigarh.gov.in",
       "first_name": "Sukhwinder",
       "last_name": "Singh",
       "role": "citizen",
       "preferred_sector": "Sector 17",
       "is_vulnerable": false,
       "vulnerability_types": []
     }
     ```

### 6.3 Central Pollution Control Board (CPCB) NAQI Calculation Engine Contract

The Indian NAQI standard (CPCB 2014) defines 6 health categories and 8 monitored pollutants.

#### Breakpoint Table
| Index Range | Category | Color Hex | PM2.5 (24h) | PM10 (24h) | NO2 (24h) | SO2 (24h) | CO (8h) [mg/m³] | O3 (8h) | NH3 (24h) | Pb (24h) |
|---|---|---|---|---|---|---|---|---|---|---|
| **0 – 50** | Good | `#00B050` | 0 – 30 | 0 – 50 | 0 – 40 | 0 – 40 | 0 – 1.0 | 0 – 50 | 0 – 200 | 0 – 0.5 |
| **51 – 100** | Satisfactory | `#92D050` | 31 – 60 | 51 – 100 | 41 – 80 | 41 – 80 | 1.1 – 2.0 | 51 – 100 | 201 – 400 | 0.5 – 1.0 |
| **101 – 200** | Moderate | `#E5B800` | 61 – 90 | 101 – 250 | 81 – 180 | 81 – 380 | 2.1 – 10.0 | 101 – 168 | 401 – 800 | 1.1 – 2.0 |
| **201 – 300** | Poor | `#FF7C80` | 91 – 120 | 251 – 350 | 181 – 280 | 381 – 800 | 10.1 – 17.0 | 169 – 208 | 801 – 1200 | 2.1 – 3.0 |
| **301 – 400** | Very Poor | `#C00000` | 121 – 250 | 351 – 430 | 281 – 400 | 801 – 1600 | 17.1 – 34.0 | 209 – 748 | 1201 – 1800 | 3.1 – 3.5 |
| **401 – 500** | Severe | `#7030A0` | 250+ | 430+ | 400+ | 1600+ | 34.0+ | 748+ | 1800+ | 3.5+ |

*(Concentrations in $\mu g/m^3$, except CO in $mg/m^3$)*

#### Linear Interpolation Mathematical Formula
For any pollutant concentration $C_p$ falling within breakpoint range $[B_{LO}, B_{HI}]$ corresponding to sub-index range $[I_{LO}, I_{HI}]$:
$$I_p = I_{LO} + \frac{I_{HI} - I_{LO}}{B_{HI} - B_{LO}} \times (C_p - B_{LO})$$

#### Core Calculation Rules
1. **Minimum 3 Pollutants Rule**: At least three pollutants must have valid observations.
2. **Mandatory Particulate Rule**: At least one of the monitored pollutants MUST be either $PM_{2.5}$ or $PM_{10}$. If both are absent, NAQI cannot be calculated.
3. **Overall NAQI & Prominent Pollutant**:
   $$NAQI = \max(I_{PM2.5}, I_{PM10}, I_{NO2}, I_{SO2}, I_{CO}, I_{O3}, I_{NH3}, I_{Pb})$$
   The pollutant producing the highest sub-index is designated the **Prominent Pollutant**.

#### Calculation Service Method Signature:
```python
def calculate_naqi(pollutants: Dict[str, Optional[float]]) -> Dict[str, Any]:
    """
    Computes Indian NAQI according to CPCB guidelines.
    Returns:
    {
        "aqi": int,
        "category": str,
        "category_color": str,
        "prominent_pollutant": str,
        "sub_indices": Dict[str, int],
        "is_valid": bool,
        "error_message": Optional[str]
    }
    """
```

### 6.4 Data Provider Abstraction & Zero-Network Mock System

To ensure completely isolated, deterministic testing and reproducible development without depending on external network access:

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseDataProvider(ABC):
    """Abstract interface defining the contract for all air quality data providers."""
    
    @abstractmethod
    def fetch_current(self, station_code: str) -> Dict[str, Any]:
        """Fetch latest pollutant observations for a specific CAAQMS station."""
        pass
        
    @abstractmethod
    def fetch_historical(self, station_code: str, days: int = 7) -> List[Dict[str, Any]]:
        """Fetch historical time-series pollutant observations."""
        pass
        
    @abstractmethod
    def health_check(self) -> bool:
        """Verify provider operational status."""
        pass
```

Deterministic Mock Providers:
1. `MockCPCBProvider`: Emits simulated readings for Chandigarh stations (Sector 22, Sector 25, Sector 53, Sector 17, Industrial Area, Sukhna Lake) using hour-of-day mathematical diurnal curves ($PM_{2.5}$ peaks at 08:00 and 20:00, dips in afternoon due to boundary layer expansion).
2. `MockWeatherProvider`: Emits realistic ambient temperature ($15^\circ C - 35^\circ C$), humidity ($30\% - 85\%$), and calm wind speeds typical of the Indo-Gangetic plain.
3. `MockFIRMSProvider`: Emits agricultural fire anomaly coordinates positioned in neighboring districts (SAS Nagar/Mohali, Patiala, Fatehgarh Sahib, Ambala) to simulate stubble burning transport.

---

## 7. Milestone Roadmap & Implementation Breakdown

| Milestone | Scope | Key Deliverables | Verification Strategy |
|---|---|---|---|
| **M1** | Written Architecture Plan & Scaffolding Proposal | `docs/PHASE_0_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, `README.md`, `.gitignore`, `config/.editorconfig` | Markdown syntax validation, clean git status, EditorConfig compliance |
| **M2** | Containerized Infrastructure & Dev Environment | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `backend/scripts/entrypoint.sh`, `.env.example` | Docker Compose config validation, YAML schema check, shell script permissions |
| **M3** | Backend Scaffolding, Auth, & Architecture Foundation | Django 5.1 project, 13 modular apps, PostGIS migrations, SimpleJWT auth, drf-spectacular OpenAPI docs, CPCB NAQI engine, mock providers, pytest suite | `pytest` test suite execution, OpenAPI schema generation, mock provider assertions |
| **M4** | Frontend Scaffolding & Verification Baseline | Vite React 18 TS app, Tailwind NAQI theme, React-Leaflet Chandigarh map, Recharts 24h trend, Axios client, Vitest suite | `npm run test` (Vitest), `npm run build` (TypeScript compilation & bundling) |
| **M5** | Dual-Track Integration & Acceptance Gate | Full end-to-end integration verification, contract testing, health check validation, documentation audit | Simultaneous execution of backend pytest and frontend vitest, audit against Phase 0 acceptance criteria |

---

## 8. Conclusion

This written plan establishes the definitive architectural contract for Phase 0 of the AIRiac platform. All subsequent implementation milestones (M2 through M5) will build directly on these specifications with zero ambiguity, ensuring a clean, scalable, containerized system ready for production deployment.
