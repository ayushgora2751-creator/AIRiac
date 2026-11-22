# BreatheWise: Actionable Development Task Tracker
## Granular Implementation Task Backlog Sequenced Across Phase 0 Through Phase 9

**Document Identifier**: `TASK_TRACKER.md`  
**System Name**: BreatheWise Urban Air Quality Assistance Platform  
**Target Region**: Chandigarh Urban Agglomeration (30.65°N–30.80°N, 76.70°E–76.85°E) with Pan-India Scalability  
**Standard Compliance**: Central Pollution Control Board (CPCB) NAQI Standard  
**Document Version**: 2.0.0  
**Status**: Authoritative Actionable Task Backlog  

---

## Progress Overview Dashboard

| Phase | Phase Name | Total Tasks | Completed | In Progress | Pending | Status |
|---|---|---|---|---|---|---|
| **Phase 0** | Infrastructure Scaffolding & Container Topology | 8 | 0 | 0 | 8 | PENDING |
| **Phase 1** | Data Foundation, Spatial Grid & Chandigarh Domain | 10 | 0 | 0 | 10 | PENDING |
| **Phase 2** | Core Identity, Authentication & RBAC | 9 | 0 | 0 | 9 | PENDING |
| **Phase 3** | Interactive Geospatial Visualization & Citizen Dashboard | 10 | 0 | 0 | 10 | PENDING |
| **Phase 4** | Analytics Engine, Diurnal Dynamics & 72h Forecasting | 8 | 0 | 0 | 8 | PENDING |
| **Phase 5** | Crowdsourced Citizen Reporting, EXIF Sanitization & Moderation | 9 | 0 | 0 | 9 | PENDING |
| **Phase 6** | Physiological Exposure Tracking & Personal Risk Index Engine | 10 | 0 | 0 | 10 | PENDING |
| **Phase 7** | Smart Threshold Alerts, Quiet Hours & Multi-Channel Dispatch | 9 | 0 | 0 | 9 | PENDING |
| **Phase 8** | Guardrailed AI Assistant & Contextual Advisory | 8 | 0 | 0 | 8 | PENDING |
| **Phase 9** | Production Hardening, Multi-City Scaling & Deployment | 10 | 0 | 0 | 10 | PENDING |
| **TOTAL** | **Full Platform Implementation Backlog** | **91** | **0** | **0** | **91** | **READY FOR SPRINT 1** |

---

## Phase 0: Infrastructure Scaffolding, Container Topology & Health Checks

- [ ] **TASK-0.1: Docker Compose 6-Service Orchestration Definition**
  - **Description**: Author `docker-compose.yml` declaring all 6 required services: `frontend`, `web`, `db`, `redis`, `worker`, `beat` with isolated bridge networks, healthchecks, and persistent volume definitions (`pgdata`, `redisdata`, `mediadata`).
  - **Mapped Deliverables**: `docker-compose.yml`, `.env.example`, `.dockerignore`
  - **Acceptance Criteria**: `docker compose config` succeeds without syntax errors; all 6 services declare explicit port bindings, restart policies, and healthcheck commands.

- [ ] **TASK-0.2: PostgreSQL 16 + PostGIS 3.4 Spatial Database Container Configuration**
  - **Description**: Configure official `postgis/postgis:16-3.4` container image with automated initialization scripts creating `postgis`, `postgis_raster`, and `"uuid-ossp"` extensions on first boot.
  - **Mapped Deliverables**: `deploy/docker/init-db.sh`, `deploy/docker/postgres.conf`
  - **Acceptance Criteria**: Running `SELECT PostGIS_Full_Version();` against container returns PostGIS 3.4+; UUID generation functions operational.

- [ ] **TASK-0.3: Redis 7.2 Cache & Message Broker Container Setup**
  - **Description**: Configure containerized Redis 7.2 instance with persistence parameters (`appendonly yes`), memory management policies (`maxmemory 512mb`, `maxmemory-policy allkeys-lru`), and password authentication.
  - **Mapped Deliverables**: `deploy/docker/redis.conf`
  - **Acceptance Criteria**: Redis container starts cleanly; `redis-cli ping` returns `PONG`; persistent storage volume verified across container restart.

- [ ] **TASK-0.4: Django 5.1 & GeoDjango Project Initialization**
  - **Description**: Initialize Django 5.1 project skeleton under `backend/` directory; configure GeoDjango spatial engine `django.contrib.gis.db.backends.postgis`, DRF settings, SimpleJWT auth headers, and CORS whitelist.
  - **Mapped Deliverables**: `backend/manage.py`, `backend/config/settings/base.py`, `backend/config/urls.py`, `backend/requirements.txt`
  - **Acceptance Criteria**: `python manage.py check` executes with zero errors; spatial models can import `PointField` and `PolygonField` without library link issues.

- [ ] **TASK-0.5: Celery 5.4 Asynchronous Worker & Beat Scheduler Integration**
  - **Description**: Configure Celery application instance in Django with Redis broker and result backend; establish separate queues for default tasks, periodic polling (`beat`), and image sanitization.
  - **Mapped Deliverables**: `backend/config/celery.py`, `backend/config/__init__.py`
  - **Acceptance Criteria**: Celery worker registers cleanly with Redis; `celery inspect ping` returns pong; Celery beat scheduler initializes without cron errors.

- [ ] **TASK-0.6: React 18 + Vite 5 + TypeScript + Tailwind CSS Frontend Skeleton**
  - **Description**: Scaffold frontend SPA inside `frontend/` using Vite React-TS template; install Tailwind CSS, Lucide React, Axios, and configure path aliases (`@/`).
  - **Mapped Deliverables**: `frontend/vite.config.ts`, `frontend/tailwind.config.js`, `frontend/tsconfig.json`, `frontend/src/App.tsx`
  - **Acceptance Criteria**: `npm run build` compiles clean bundle with zero TypeScript errors; Tailwind utility classes render accurately in browser.

- [ ] **TASK-0.7: Centralized Backend Health & Readiness Check API**
  - **Description**: Implement `GET /api/v1/health/` validating live connectivity to PostgreSQL, PostGIS spatial extensions, Redis cache, and Celery broker with latency timings.
  - **Mapped Deliverables**: `backend/common/views.py`, `backend/common/urls.py`, `tests/integration/test_health_check.py`
  - **Acceptance Criteria**: Endpoint returns HTTP 200 with structured JSON detailing component statuses; returns HTTP 503 if database or Redis becomes unreachable.

- [ ] **TASK-0.8: Phase 0 Verification Script & Automated Smoke Tests**
  - **Description**: Author end-to-end shell verification script (`scripts/verify_phase_0.sh`) that spins up Docker Compose, waits for health checks, tests API ping, and exits with 0 on success.
  - **Mapped Deliverables**: `scripts/verify_phase_0.sh`, `tests/smoke/test_docker_topology.py`
  - **Acceptance Criteria**: Automated script runs to completion and logs green status for all 6 containers.

---

## Phase 1: Data Foundation, Spatial Grid & Chandigarh Domain Setup

- [ ] **TASK-1.1: MonitoringStation & Location Spatial Schema Implementation**
  - **Description**: Author Django models for `MonitoringStation` (with PostGIS `PointField(srid=4326)`) and `Location` (administrative boundary sectors and metadata).
  - **Mapped Deliverables**: `backend/apps/locations/models.py`, `backend/apps/locations/migrations/0001_initial.py`
  - **Acceptance Criteria**: Migration applies cleanly to PostGIS; GIST spatial index created on station coordinates; UUID primary keys assigned.

- [ ] **TASK-1.2: Deterministic Chandigarh CAAQMS Station Fixtures**
  - **Description**: Author JSON seed fixtures containing accurate spatial and operational metadata for all 4 Chandigarh CAAQMS monitoring stations (Sector 22, Sector 25, Sector 53, Sector 39).
  - **Mapped Deliverables**: `backend/fixtures/chandigarh_stations.json`
  - **Acceptance Criteria**: `python manage.py loaddata chandigarh_stations.json` loads exactly 4 stations; spatial coordinates align precisely with official CPCC/CPCB coordinates.

- [ ] **TASK-1.3: AirQualityReading Telemetry Model Implementation**
  - **Description**: Create `AirQualityReading` model recording timestamped criteria pollutant concentrations ($PM_{2.5}, PM_{10}, NO_2, SO_2, CO, O_3, NH_3, Pb$), computed sub-indices, overall NAQI, and prominent pollutant.
  - **Mapped Deliverables**: `backend/apps/air_quality/models.py`, `backend/apps/air_quality/migrations/0001_initial.py`
  - **Acceptance Criteria**: Composite B-Tree index on `(station_id, timestamp DESC)` created; nullability permitted for optional pollutants ($NH_3, Pb$).

- [ ] **TASK-1.4: Pure-Python Piecewise Linear CPCB NAQI Calculation Engine**
  - **Description**: Build standalone, dependency-free calculation module implementing exact Indian CPCB mathematical sub-index interpolation formulas across all 8 criteria pollutants.
  - **Mapped Deliverables**: `backend/breathewise_core/engines/naqi.py`, `backend/breathewise_core/engines/breakpoints.py`
  - **Acceptance Criteria**: Unit tests verify sub-index calculations against CPCB manual tables to within $\pm 0.1$ index units across all concentration bands.

- [ ] **TASK-1.5: CPCB 3-Pollutant Minimum & Particulate Mandate Enforcement**
  - **Description**: Implement strict validation rule requiring at least three ($k \ge 3$) monitored pollutants with at least one particulate matter pollutant ($PM_{2.5}$ or $PM_{10}$) before calculating composite NAQI; else return `NAQI_INSUFFICIENT_DATA`.
  - **Mapped Deliverables**: `backend/breathewise_core/engines/naqi.py`, `backend/breathewise_core/engines/exceptions.py`
  - **Acceptance Criteria**: Test cases pass for valid 3-pollutant combinations; raises typed `NAQIInsufficientDataError` when criteria are violated; applies $PM_{2.5}$ precedence on sub-index ties.

- [ ] **TASK-1.6: Pluggable Base Provider Interfaces & Canonical DTOs**
  - **Description**: Author abstract base classes `BaseAirQualityProvider` and `BaseWeatherProvider` returning typed, immutable dataclasses (`RawPollutantReading`, `WeatherSnapshot`).
  - **Mapped Deliverables**: `backend/breathewise_core/providers/base.py`
  - **Acceptance Criteria**: Abstract interfaces cannot be instantiated directly; enforces type hints and standard concentration units ($\mu\text{g/m}^3$ and $\text{mg/m}^3$ for CO).

- [ ] **TASK-1.7: Deterministic MockAirQualityProvider with Diurnal Boundary Layer Physics**
  - **Description**: Implement zero-network `MockAirQualityProvider` generating realistic sinusoidal atmospheric variations (morning traffic peaks, nocturnal winter boundary layer compression, afternoon thermal venting).
  - **Mapped Deliverables**: `backend/breathewise_core/providers/mock_air_quality.py`
  - **Acceptance Criteria**: Provider returns repeatable, deterministic values when supplied with fixed random seed; produces realistic peak/trough curves matching Chandigarh winter/summer regimes.

- [ ] **TASK-1.8: Uber H3 Discrete Global Grid Generation (Resolution 7 & 8)**
  - **Description**: Implement hexagonal grid generator covering Chandigarh bounding box (`30.65°N–30.80°N, 76.70°E–76.85°E`), producing ~65 Resolution 8 cells with boundary GeoJSON geometries.
  - **Mapped Deliverables**: `backend/breathewise_core/spatial/h3_grid.py`
  - **Acceptance Criteria**: Grid covers entire municipal area without spatial holes; returns valid 15-character H3 index strings and GeoJSON closed Polygon coordinates.

- [ ] **TASK-1.9: Inverse Distance Weighting (IDW) Spatial Interpolation Engine**
  - **Description**: Implement 2D IDW spatial interpolation engine computing estimated pollutant concentrations and NAQI for each H3 cell centroid based on great-circle distances to the 4 ground stations with power decay $p=2.0$.
  - **Mapped Deliverables**: `backend/breathewise_core/spatial/idw.py`
  - **Acceptance Criteria**: Exact station locations yield the station's exact concentration; intermediate cells interpolate smoothly without negative numbers or division-by-zero errors.

- [ ] **TASK-1.10: Air Quality Grid & Station REST Endpoints**
  - **Description**: Expose DRF endpoints `GET /api/v1/locations/stations/`, `GET /api/v1/air-quality/latest/`, and `GET /api/v1/air-quality/grid/` with 15-minute Redis caching.
  - **Mapped Deliverables**: `backend/apps/air_quality/views.py`, `backend/apps/air_quality/serializers.py`, `backend/apps/air_quality/urls.py`
  - **Acceptance Criteria**: Endpoints return standard JSON responses; Redis cache hit header verified; response times $< 50\text{ ms}$ on warm cache.

---

## Phase 2: Core Identity, Authentication & Role-Based Access Control

- [ ] **TASK-2.1: Custom User Model with UUID Primary Keys**
  - **Description**: Implement custom `User` model extending Django's `AbstractUser` with UUIDv4 `id`, email-based authentication (`USERNAME_FIELD = 'email'`), and role attribute (`CITIZEN`, `OFFICER`, `ADMIN`).
  - **Mapped Deliverables**: `backend/apps/accounts/models.py`, `backend/apps/accounts/migrations/0001_initial.py`
  - **Acceptance Criteria**: Default username requirement removed; email uniqueness enforced; database primary keys generate valid UUIDs.

- [ ] **TASK-2.2: UserProfile Health Sensitivity & Vulnerability Schema**
  - **Description**: Implement `UserProfile` model containing demographic vulnerability fields (`sensitivity_profile`, `asthma_diagnosed`, `copd_diagnosed`, `cardiac_diagnosed`, `daily_activity_level`).
  - **Mapped Deliverables**: `backend/apps/accounts/models.py`
  - **Acceptance Criteria**: OneToOne relationship to `User` established; automated post-save signal generates blank `UserProfile` upon user creation.

- [ ] **TASK-2.3: SimpleJWT Token Authentication Lifecycle & Blacklisting**
  - **Description**: Configure `djangorestframework-simplejwt` with 15-minute access tokens, 7-day refresh tokens, custom token claims (`role`, `sensitivity_profile`), and token blacklisting on logout.
  - **Mapped Deliverables**: `backend/config/settings/base.py`, `backend/apps/accounts/tokens.py`, `backend/apps/accounts/views.py`
  - **Acceptance Criteria**: Successful login returns access & refresh tokens; logging out blacklists token; blacklisted token rejected on subsequent requests.

- [ ] **TASK-2.4: Registration, Login & Profile REST Endpoints**
  - **Description**: Build DRF views for `POST /api/v1/auth/register/`, `POST /api/v1/auth/login/`, `POST /api/v1/auth/refresh/`, `POST /api/v1/auth/logout/`, `GET /api/v1/users/me/`, and `PATCH /api/v1/users/me/profile/`.
  - **Mapped Deliverables**: `backend/apps/accounts/serializers.py`, `backend/apps/accounts/views.py`, `backend/apps/accounts/urls.py`
  - **Acceptance Criteria**: Serializers enforce password strength rules; profile updates accurately alter sensitivity profile; returns standardized error envelopes on validation failure.

- [ ] **TASK-2.5: Role-Based Access Control (RBAC) Permission Classes**
  - **Description**: Author custom DRF permissions: `IsCitizenUser`, `IsOfficerUser`, `IsAdminUser`, and `IsOwnerOrReadOnly`.
  - **Mapped Deliverables**: `backend/common/permissions.py`
  - **Acceptance Criteria**: Unit tests verify 403 Forbidden when a `CITIZEN` attempts administrative or moderation actions.

- [ ] **TASK-2.6: SavedLocation Model with Zero-Raw-GPS Privacy Enforcement**
  - **Description**: Implement `SavedLocation` model storing user-designated favorite places (`Home`, `Work`, `School`) exclusively via 15-character H3 Resolution 8 index strings with zero coordinate columns.
  - **Mapped Deliverables**: `backend/apps/locations/models.py`, `backend/apps/locations/serializers.py`, `backend/apps/locations/views.py`
  - **Acceptance Criteria**: Attempts to add latitude/longitude fields fail model validation; user can save, retrieve, and delete up to 10 favorite H3 locations.

- [ ] **TASK-2.7: Frontend Zustand Auth Store & Session Persistence**
  - **Description**: Build `useAuthStore` in TypeScript using Zustand with memory-based token storage and local storage refresh token persistence.
  - **Mapped Deliverables**: `frontend/src/store/useAuthStore.ts`
  - **Acceptance Criteria**: State tracks `user`, `accessToken`, `isAuthenticated`; reloads restore active session; logout clears state completely.

- [ ] **TASK-2.8: Axios HTTP Interceptors for Automatic Token Refresh**
  - **Description**: Configure global Axios client with request interceptor attaching Bearer JWT and response interceptor catching HTTP 401 to silently refresh tokens.
  - **Mapped Deliverables**: `frontend/src/api/client.ts`
  - **Acceptance Criteria**: Expired access token triggers seamless background refresh without interrupting user flow; redirects to login if refresh fails.

- [ ] **TASK-2.9: React Authentication & Profile Views**
  - **Description**: Implement responsive UI pages for User Registration, Login, and Profile Settings with health vulnerability questionnaire.
  - **Mapped Deliverables**: `frontend/src/pages/auth/LoginPage.tsx`, `frontend/src/pages/auth/RegisterPage.tsx`, `frontend/src/pages/profile/ProfilePage.tsx`
  - **Acceptance Criteria**: Form validation with React Hook Form + Zod; renders sensitivity toggles with accessible screen-reader descriptions.

---

## Phase 3: Interactive Geospatial Visualization & Citizen Dashboard

- [ ] **TASK-3.1: Leaflet 1.9 Map Initialization & Chandigarh Bounding Box Restrictions**
  - **Description**: Integrate Leaflet 1.9 into React using `react-leaflet`; initialize centered on Chandigarh (`30.7333°N, 76.7794°E`) with strict pan bounds preventing navigation away from the Tricity region.
  - **Mapped Deliverables**: `frontend/src/components/map/LeafletMap.tsx`, `frontend/src/components/map/mapConfig.ts`
  - **Acceptance Criteria**: Map loads with CartoDB Positron tiles; bounce-back behavior triggers when panning outside `[[30.60, 76.65], [30.85, 76.90]]`.

- [ ] **TASK-3.2: Uber H3 Hexagonal Choropleth Layer Rendering**
  - **Description**: Build custom GeoJSON layer converting H3 Resolution 8 cell indices into SVG polygon features with dynamic CPCB NAQI color fills.
  - **Mapped Deliverables**: `frontend/src/components/map/H3HexagonLayer.tsx`, `frontend/src/utils/h3GeoJson.ts`
  - **Acceptance Criteria**: Hexagons render seamlessly across Chandigarh; polygon fill opacity set to 0.45; hover interaction elevates opacity to 0.75 and displays tooltips.

- [ ] **TASK-3.3: Official CPCB NAQI 6-Band Design Tokens & Color System**
  - **Description**: Configure Tailwind CSS theme tokens for all 6 official Indian CPCB NAQI categories (Good `#00B050`, Satisfactory `#92D050`, Moderate `#FFFF00`, Poor `#FF9900`, Very Poor `#FF0000`, Severe `#C00000`).
  - **Mapped Deliverables**: `frontend/src/theme/naqiColors.ts`, `frontend/tailwind.config.js`
  - **Acceptance Criteria**: CSS variables declared; utility classes (`bg-naqi-good`, `text-naqi-severe`, etc.) available across all components.

- [ ] **TASK-3.4: WCAG 2.1 AA Contrast Validation & Yellow Band Rule Implementation**
  - **Description**: Implement color utility ensuring that the Moderate yellow band (`#FFFF00`) always pairs with dark slate text (`#1F2937`), never white, maintaining a contrast ratio $\ge 4.5:1$.
  - **Mapped Deliverables**: `frontend/src/utils/contrastChecker.ts`, `frontend/src/components/common/AqiBadge.tsx`
  - **Acceptance Criteria**: Automated test with `jest-axe` passes without color contrast violations on all 6 category badges.

- [ ] **TASK-3.5: CAAQMS Station Markers with Pulsing CSS Animation Rings**
  - **Description**: Build custom SVG Leaflet `DivIcon` markers displaying live station status with CSS radial pulsing animation colored according to the station's prominent NAQI score.
  - **Mapped Deliverables**: `frontend/src/components/map/StationMarker.tsx`, `frontend/src/styles/mapMarkers.css`
  - **Acceptance Criteria**: Markers pulse smoothly; markers remain sharp on high-DPI displays; click listener triggers station detail modal.

- [ ] **TASK-3.6: Station Detail Modal & Multi-Pollutant Breakdown View**
  - **Description**: Create interactive modal dialog showing complete 8-pollutant concentrations, individual sub-indices, prominent pollutant indicator, and 24h trend sparkline for selected station.
  - **Mapped Deliverables**: `frontend/src/components/map/StationModal.tsx`, `frontend/src/components/map/PollutantSubIndexTable.tsx`
  - **Acceptance Criteria**: Displays all available criteria pollutants; flags primary driver; supports keyboard navigation (Escape key to dismiss).

- [ ] **TASK-3.7: Dashboard Command Center Real-Time NAQI Summary Card**
  - **Description**: Implement primary citizen dashboard card featuring circular NAQI gauge, health status descriptor, prominent pollutant badge, and last-updated relative timestamp.
  - **Mapped Deliverables**: `frontend/src/components/dashboard/AqiSummaryCard.tsx`, `frontend/src/components/dashboard/CircularGauge.tsx`
  - **Acceptance Criteria**: Gauge animates to current value; displays localized health impact statement based on active NAQI category.

- [ ] **TASK-3.8: Personalized Health Advisory Recommendation Card**
  - **Description**: Implement dashboard advisory card that combines the current NAQI category with the user's registered health sensitivity profile to provide concrete behavioral recommendations.
  - **Mapped Deliverables**: `frontend/src/components/dashboard/HealthAdvisoryCard.tsx`, `frontend/src/utils/advisoryRules.ts`
  - **Acceptance Criteria**: Asthmatic user viewing "Poor" air receives explicit N95 and outdoor exercise warning; general user receives standard outdoor caution.

- [ ] **TASK-3.9: Saved Locations Quick Ticker Widget**
  - **Description**: Build horizontal carousel/ticker component displaying real-time NAQI and trend arrows for all user-saved favorite H3 locations (Home, Work, School).
  - **Mapped Deliverables**: `frontend/src/components/dashboard/SavedLocationsTicker.tsx`
  - **Acceptance Criteria**: Ticker renders saved location cards; clicking a card zooms the interactive map to that specific H3 hexagonal cell.

- [ ] **TASK-3.10: TanStack Query v5 Server-State Hooks & Polling**
  - **Description**: Author custom React Query hooks (`useAirQualityGrid`, `useStations`, `useLatestReading`) with 60-second background polling, window focus refetching, and error boundary handling.
  - **Mapped Deliverables**: `frontend/src/api/queries/useAirQuality.ts`, `frontend/src/api/queries/useStations.ts`
  - **Acceptance Criteria**: Map and dashboard refresh automatically every 60 seconds without full component re-mounts or visual stutter.

---

## Phase 4: Analytics Engine, Diurnal Dynamics & 72-Hour Forecasting

- [ ] **TASK-4.1: Historical Trends Telemetry Aggregation Service**
  - **Description**: Build backend service querying time-series `AirQualityReading` records and computing hourly and daily rolling averages for all 8 criteria pollutants over configurable windows (24h, 7d, 30d, 90d).
  - **Mapped Deliverables**: `backend/apps/analytics/services.py`, `backend/apps/analytics/views.py`
  - **Acceptance Criteria**: Handles missing readings via linear interpolation; aggregates cleanly across multi-station selections; response times $< 100\text{ ms}$.

- [ ] **TASK-4.2: 24-Hour Diurnal Cycle Analytics Calculator**
  - **Description**: Implement calculation engine analyzing diurnal patterns by grouping hourly readings across a 30-day window to derive mean hourly concentrations, variance, and standard deviations for morning/evening rush hour modeling.
  - **Mapped Deliverables**: `backend/apps/analytics/diurnal.py`, `tests/unit/test_diurnal_engine.py`
  - **Acceptance Criteria**: Returns 24 data points (00:00 to 23:00) with mean and standard deviation; unit tests verify peak traffic detection.

- [ ] **TASK-4.3: NAAQS Regulatory Compliance & Exceedance Calculator**
  - **Description**: Build compliance engine evaluating station telemetry against India's National Ambient Air Quality Standards (NAAQS 24h limits: $PM_{2.5} = 60 \mu\text{g/m}^3, PM_{10} = 100 \mu\text{g/m}^3, NO_2 = 80 \mu\text{g/m}^3$).
  - **Mapped Deliverables**: `backend/apps/analytics/compliance.py`, `backend/apps/analytics/views.py`
  - **Acceptance Criteria**: Calculates annual/monthly percentage compliance rates and counts total exceedance days per pollutant.

- [ ] **TASK-4.4: 72-Hour Predictive Forecast Model with Confidence Bands**
  - **Description**: Implement predictive forecasting engine combining persistence, sinusoidal diurnal cycles, and boundary layer dispersion physics to generate hourly NAQI predictions for 72 hours with expanding confidence intervals ($CI_{low}, CI_{high}$).
  - **Mapped Deliverables**: `backend/apps/forecasting/models.py`, `backend/apps/forecasting/services.py`, `backend/apps/forecasting/views.py`
  - **Acceptance Criteria**: Forecast generates 72 hourly points; confidence interval envelope widens monotonically with forecast horizon.

- [ ] **TASK-4.5: Recharts Multi-Pollutant Historical Line Chart Component**
  - **Description**: Build interactive Recharts multi-line chart supporting toggleable series ($PM_{2.5}, PM_{10}, NO_2, SO_2, CO, O_3$), zoom/pan brushes, and synchronized tooltip formatting.
  - **Mapped Deliverables**: `frontend/src/components/analytics/HistoricalTrendChart.tsx`
  - **Acceptance Criteria**: Users can toggle individual pollutant lines on/off; tooltips show concentrations with unit labels; responsive down to mobile screens.

- [ ] **TASK-4.6: Recharts 24-Hour Diurnal Profile Area Chart**
  - **Description**: Implement area chart visualizing 24-hour diurnal cycle with shaded peak exposure zones (08:00–10:00 morning rush, 20:00–23:00 winter inversion).
  - **Mapped Deliverables**: `frontend/src/components/analytics/DiurnalProfileChart.tsx`
  - **Acceptance Criteria**: Highlights optimal low-pollution outdoor exercise windows (e.g. 13:00–16:00 during winter months).

- [ ] **TASK-4.7: Recharts 72-Hour Forecast Chart with Shaded Confidence Envelopes**
  - **Description**: Build composed line and area chart rendering predicted NAQI trajectory alongside a translucent confidence interval band between $CI_{low}$ and $CI_{high}$, with CPCB category threshold reference lines.
  - **Mapped Deliverables**: `frontend/src/components/analytics/ForecastConfidenceChart.tsx`
  - **Acceptance Criteria**: Shaded area accurately bounds the prediction line; horizontal reference lines mark Moderate (100), Poor (200), Very Poor (300), Severe (400).

- [ ] **TASK-4.8: Analytics & Forecasting Comprehensive Page Views**
  - **Description**: Assemble complete frontend pages for `/analytics` and `/forecast` with station selector dropdowns, date range pickers, and export-to-CSV capabilities.
  - **Mapped Deliverables**: `frontend/src/pages/AnalyticsPage.tsx`, `frontend/src/pages/ForecastPage.tsx`
  - **Acceptance Criteria**: CSV export downloads verified clean CSV data; switching stations smoothly triggers React Query re-fetch.

---

## Phase 5: Crowdsourced Citizen Reporting, EXIF Sanitization & Moderation

- [ ] **TASK-5.1: PollutionReport & ReportImage Relational Schema**
  - **Description**: Author Django models for `PollutionReport` (with hazard type choices, status enum, H3 index) and `ReportImage` (sanitized flag, uploaded image file field).
  - **Mapped Deliverables**: `backend/apps/reports/models.py`, `backend/apps/reports/migrations/0001_initial.py`
  - **Acceptance Criteria**: Foreign keys to User configured with nullability for anonymous reports; status defaults to `PENDING`; zero coordinate fields.

- [ ] **TASK-5.2: Asynchronous Celery EXIF Sanitization Task**
  - **Description**: Implement Celery task opening uploaded images with Pillow, stripping all EXIF tags, GPS metadata, and device serial numbers, re-encoding as compressed JPEG/PNG, and marking `sanitized=True`.
  - **Mapped Deliverables**: `backend/apps/reports/tasks.py`, `tests/unit/test_image_sanitizer.py`
  - **Acceptance Criteria**: Uploaded test image with GPS tags completely purged; image filesize optimized; original EXIF cannot be recovered from storage.

- [ ] **TASK-5.3: Citizen Hazard Report Submission REST API**
  - **Description**: Implement `POST /api/v1/reports/` accepting multipart/form-data with hazard type, text description, optional image upload, and location fuzzing to H3 Resolution 8 index.
  - **Mapped Deliverables**: `backend/apps/reports/serializers.py`, `backend/apps/reports/views.py`, `backend/apps/reports/urls.py`
  - **Acceptance Criteria**: Serializer automatically converts incoming coordinates to H3 index; coordinates are discarded from memory; triggers Celery sanitization task.

- [ ] **TASK-5.4: Municipal Environmental Officer Moderation API**
  - **Description**: Build `PATCH /api/v1/reports/{id}/moderate/` endpoint restricted to `OFFICER` and `ADMIN` roles to transition report status (`VERIFIED`, `RESOLVED`, `REJECTED`) and record audit timestamps.
  - **Mapped Deliverables**: `backend/apps/reports/views.py`, `backend/apps/reports/permissions.py`
  - **Acceptance Criteria**: Unauthorized citizens receive 403 Forbidden; status transitions update `moderated_by` and `moderated_at` fields.

- [ ] **TASK-5.5: Public Reports Feed & Geospatial Filter API**
  - **Description**: Implement `GET /api/v1/reports/` allowing citizens to view verified community reports filtered by H3 cell, hazard type, and date range.
  - **Mapped Deliverables**: `backend/apps/reports/views.py`, `backend/apps/reports/filters.py`
  - **Acceptance Criteria**: Only reports with `VERIFIED` or `RESOLVED` status appear in public feed; unmoderated pending reports excluded.

- [ ] **TASK-5.6: Frontend Citizen Hazard Submission Modal**
  - **Description**: Build responsive modal dialog with drag-and-drop image uploader, hazard category selector (Biomass Burning, Industrial Smoke, Construction Dust, etc.), and map pin location picker.
  - **Mapped Deliverables**: `frontend/src/components/reports/SubmitReportModal.tsx`, `frontend/src/components/common/ImageDropzone.tsx`
  - **Acceptance Criteria**: Form validates required fields; provides upload progress bar; automatically converts map click to H3 index before payload submission.

- [ ] **TASK-5.7: Leaflet Hazard Incident Map Overlay**
  - **Description**: Add toggleable hazard layer to the interactive Leaflet map displaying categorized incident pins with status badges and sanitized photo modals.
  - **Mapped Deliverables**: `frontend/src/components/map/HazardIncidentLayer.tsx`
  - **Acceptance Criteria**: Clicking an incident pin opens popup with sanitized image preview, incident timestamp, and verification status.

- [ ] **TASK-5.8: Municipal Officer Moderation Dashboard Table**
  - **Description**: Build administrative moderation table view allowing officers to review pending citizen submissions, inspect sanitized photos, and approve or reject reports in one click.
  - **Mapped Deliverables**: `frontend/src/pages/admin/ModerationPage.tsx`, `frontend/src/components/admin/ReportModerationTable.tsx`
  - **Acceptance Criteria**: Role-gated route; provides instant optimistic UI updates on status changes; supports filtering by status.

- [ ] **TASK-5.9: Automated EXIF Stripping Smoke Test**
  - **Description**: Create automated test uploading a known test image with embedded GPS coordinates, waiting for Celery task completion, and asserting zero EXIF tags in persisted media.
  - **Mapped Deliverables**: `tests/integration/test_exif_pipeline.py`
  - **Acceptance Criteria**: Test passes consistently in CI environment with Celery eager mode enabled.

---

## Phase 6: Physiological Exposure Tracking & Personal Risk Index Engine

- [ ] **TASK-6.1: Physiological Impact Engine Configuration & Minute Ventilation Baselines**
  - **Description**: Author versioned configuration module `impact_config_v1.py` defining minute ventilation rates ($V_E$ in $m^3/\text{min}$) for activity tiers (Sedentary: 0.008, Walking: 0.020, Cycling: 0.040, Running: 0.060).
  - **Mapped Deliverables**: `backend/breathewise_core/engines/impact_config_v1.py`
  - **Acceptance Criteria**: Config is frozen and versioned; verified against human pulmonary physiology literature.

- [ ] **TASK-6.2: Mask Penetration & Filtration Efficiency Ratings**
  - **Description**: Define standardized particulate penetration efficiencies ($\eta$) in configuration: None (0%), Cloth (20%), Surgical (50%), N95/FFP2 (95%), N99 (99%).
  - **Mapped Deliverables**: `backend/breathewise_core/engines/impact_config_v1.py`
  - **Acceptance Criteria**: Coefficients correctly calculate inhaled particulate reduction: $\text{Penetration} = 1 - \eta$.

- [ ] **TASK-6.3: Pure-Python Inhaled Particulate Dose Formulation**
  - **Description**: Implement standalone dose calculation function: $\text{Dose} (\mu\text{g}) = C_{PM2.5} \times V_E \times t \times (1 - \eta)$ with strict boundary validation and unit safety.
  - **Mapped Deliverables**: `backend/breathewise_core/engines/impact.py`
  - **Acceptance Criteria**: Unit tests verify exact mathematical outputs across all combinations of activity, duration, and mask types; zero duration yields zero dose.

- [ ] **TASK-6.4: Standardized Cigarette Smoke Equivalence Formulation**
  - **Description**: Implement cigarette equivalence calculator mapping total inhaled $PM_{2.5}$ microgram mass to equivalent smoked cigarettes using the standardized benchmark: $1 \text{ cigarette} \equiv 216.0 \mu\text{g } PM_{2.5}$.
  - **Mapped Deliverables**: `backend/breathewise_core/engines/impact.py`
  - **Acceptance Criteria**: $216.0 \mu\text{g}$ equals exactly 1.0 cigarette; fractional values rounded to 1 decimal place; verified with test suite.

- [ ] **TASK-6.5: Demographic Sensitivity Multipliers & Personal Risk Index ($PRI$) Formula**
  - **Description**: Implement $PRI$ formula: $PRI = \min\left(100.0, \frac{\text{Dose}}{D_{ref}} \times S \times 50.0\right)$ where $D_{ref} = 300.0 \mu\text{g}$ and $S$ scales from 1.0 (General) to 2.20 (COPD).
  - **Mapped Deliverables**: `backend/breathewise_core/engines/impact.py`
  - **Acceptance Criteria**: Vulnerable profiles receive proportionally higher PRI scores; PRI strictly capped at 100.0 under extreme exposure scenarios.

- [ ] **TASK-6.6: ExposureRecord Model & Activity Logging REST API**
  - **Description**: Author `ExposureRecord` model and DRF endpoints `POST /api/v1/exposure/activities/` and `GET /api/v1/exposure/daily/` to record and fetch user activities.
  - **Mapped Deliverables**: `backend/apps/exposure/models.py`, `backend/apps/exposure/serializers.py`, `backend/apps/exposure/views.py`
  - **Acceptance Criteria**: Endpoint auto-computes dose, cigarette equivalent, and PRI before saving; accepts H3 cell index for exposure location.

- [ ] **TASK-6.7: Daily Cumulative Exposure Rollup Celery Task**
  - **Description**: Author periodic Celery task executing nightly at 23:59 UTC aggregating all logged activities per user into a daily exposure summary record.
  - **Mapped Deliverables**: `backend/apps/exposure/tasks.py`
  - **Acceptance Criteria**: Sums daily microgram dose; records peak PRI and total cigarette equivalents; generates summary archive table entry.

- [ ] **TASK-6.8: Frontend Activity Logging Modal Dialog**
  - **Description**: Build user modal in React for logging physical activities: activity type selector, duration slider, mask type dropdown, and sector/H3 location picker.
  - **Mapped Deliverables**: `frontend/src/components/exposure/LogActivityModal.tsx`
  - **Acceptance Criteria**: Form provides real-time live preview of estimated inhaled dose and cigarette equivalence as the user moves the duration slider.

- [ ] **TASK-6.9: Cigarette Equivalence & Personal Risk Gauge Widgets**
  - **Description**: Build dashboard widgets: cigarette counter icon with fractional animation and circular speedometer-style Personal Risk Index gauge colored by risk tier.
  - **Mapped Deliverables**: `frontend/src/components/exposure/CigaretteCounter.tsx`, `frontend/src/components/exposure/PersonalRiskGauge.tsx`
  - **Acceptance Criteria**: Smooth gauge animation; displays contextual risk badge (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`) matching PRI score bands.

- [ ] **TASK-6.10: Exposure History & Cumulative Analytics Page**
  - **Description**: Assemble `/exposure` page featuring 7-day bar chart of daily cigarette equivalence, cumulative particulate dose vs. WHO daily guideline line, and activity breakdown list.
  - **Mapped Deliverables**: `frontend/src/pages/ExposurePage.tsx`, `frontend/src/components/exposure/WeeklyDoseBarChart.tsx`
  - **Acceptance Criteria**: Visualizes daily intake clearly; flags days exceeding safe physiological thresholds.

---

## Phase 7: Smart Threshold Alerts, Quiet Hours & Multi-Channel Dispatch

- [ ] **TASK-7.1: AlertPreference & Alert Relational Schema Implementation**
  - **Description**: Author models for `AlertPreference` (target H3 index, threshold category, quiet hours start/end, channel toggles) and `Alert` (persisted notification log).
  - **Mapped Deliverables**: `backend/apps/alerts/models.py`, `backend/apps/alerts/migrations/0001_initial.py`
  - **Acceptance Criteria**: OneToOne relationship between `AlertPreference` and `User`; channel enums for `TELEGRAM`, `WEBPUSH`, `EMAIL`, `IN_APP`.

- [ ] **TASK-7.2: Periodic 15-Minute Celery Beat Alert Evaluation Loop**
  - **Description**: Implement Celery Beat periodic task running every 15 minutes checking latest H3 grid readings against active user alert preferences.
  - **Mapped Deliverables**: `backend/apps/alerts/tasks.py`, `backend/apps/alerts/services.py`
  - **Acceptance Criteria**: Identifies users whose target location has crossed their configured NAQI threshold; queues notification dispatch tasks.

- [ ] **TASK-7.3: Quiet-Hours Suppression & Severe Emergency Override Engine**
  - **Description**: Build logic checking user's local timezone (Asia/Kolkata): suppresses non-critical alerts during quiet hours (e.g. 22:00–07:00) unless current air reaches `Severe` ($NAQI \ge 401$) and `emergency_override=True`.
  - **Mapped Deliverables**: `backend/apps/alerts/rules.py`, `tests/unit/test_alert_rules.py`
  - **Acceptance Criteria**: Unit tests verify silent suppression during quiet window for Moderate/Poor; verifies immediate override dispatch on Severe conditions.

- [ ] **TASK-7.4: Alert Anti-Flapping & Deduplication Architecture**
  - **Description**: Implement deduplication cache preventing duplicate alert dispatches to the same user for the same NAQI category within a 3-hour sliding window unless the air deteriorates further.
  - **Mapped Deliverables**: `backend/apps/alerts/dedup.py`
  - **Acceptance Criteria**: Redis key `alert_sent:{user_id}:{category}` enforces 3-hour TTL; immediate alert sent if air deteriorates from Poor to Very Poor within window.

- [ ] **TASK-7.5: Telegram Bot Notification Dispatcher Adapter**
  - **Description**: Implement Telegram Bot dispatcher formatting alerts with category color emoji (🟢, 🟡, 🟠, 🔴, 🟣, 🟤), prominent pollutant, and personalized health action advice.
  - **Mapped Deliverables**: `backend/breathewise_core/notifications/telegram.py`
  - **Acceptance Criteria**: Formats clean MarkdownV2 messages; logs mock dispatch in development environment; verifies Telegram chat ID handshake.

- [ ] **TASK-7.6: Web Push Notification Dispatcher (VAPID)**
  - **Description**: Build Web Push dispatcher utilizing `pywebpush` with VAPID application server keys to dispatch browser notifications to subscribed devices.
  - **Mapped Deliverables**: `backend/breathewise_core/notifications/webpush.py`
  - **Acceptance Criteria**: Handles JSON Web Push subscription objects; handles expired subscriptions gracefully by removing invalid endpoints.

- [ ] **TASK-7.7: Alert Preferences & In-App Notification Center REST APIs**
  - **Description**: Expose DRF endpoints: `GET/PUT /api/v1/alerts/preferences/`, `GET /api/v1/alerts/active/`, `POST /api/v1/alerts/{id}/read/`, and `POST /api/v1/alerts/test/`.
  - **Mapped Deliverables**: `backend/apps/alerts/views.py`, `backend/apps/alerts/serializers.py`, `backend/apps/alerts/urls.py`
  - **Acceptance Criteria**: Users can update threshold category and quiet hours; test alert endpoint triggers immediate test notification.

- [ ] **TASK-7.8: Frontend Alert Preferences Configuration View**
  - **Description**: Build settings page allowing citizens to configure alert threshold sliders, toggle delivery channels (Telegram, Push), set quiet hours, and trigger test alerts.
  - **Mapped Deliverables**: `frontend/src/pages/alerts/AlertPreferencesPage.tsx`
  - **Acceptance Criteria**: Clean UI with toggle switches and time pickers; provides Telegram bot linking button (`tg://resolve?domain=BreatheWiseBot&start=token`).

- [ ] **TASK-7.9: Frontend In-App Notification Bell & Dropdown Component**
  - **Description**: Implement navigation bar notification bell icon with unread count badge and animated dropdown displaying recent alerts with "Mark as Read" buttons.
  - **Mapped Deliverables**: `frontend/src/components/layout/NotificationDropdown.tsx`
  - **Acceptance Criteria**: Displays unread badge; clicking alert marks it as read via optimistic API update; updates bell badge counter.

---

## Phase 8: Guardrailed AI Assistant & Contextual Natural Language Advisory

- [ ] **TASK-8.1: ChatConversation & ChatMessage Schema Implementation**
  - **Description**: Author Django models for `ChatConversation` (user FK, title) and `ChatMessage` (role, content, JSON context snapshot storing NAQI, dose, station telemetry at time of query).
  - **Mapped Deliverables**: `backend/apps/assistant/models.py`, `backend/apps/assistant/migrations/0001_initial.py`
  - **Acceptance Criteria**: Cascade delete on user; context snapshot preserves ground-truth environmental state for legal auditability.

- [ ] **TASK-8.2: Deterministic Telemetry Context Payload Builder**
  - **Description**: Build service aggregating current station NAQI, prominent pollutant, 24h forecast curve, user health vulnerability profile, and daily inhaled dose into a structured ground-truth JSON payload.
  - **Mapped Deliverables**: `backend/breathewise_core/assistant/context_builder.py`
  - **Acceptance Criteria**: Gathers all environmental metrics into an immutable dictionary; handles anonymous users with default general profile.

- [ ] **TASK-8.3: Strict Non-Calculation Guardrail System Prompt Blueprint**
  - **Description**: Author immutable system prompt framing the assistant as an urban air quality advisor; mandates verbatim quotation of pre-calculated numbers and strictly prohibits generating or altering numerical values.
  - **Mapped Deliverables**: `backend/breathewise_core/assistant/prompts.py`
  - **Acceptance Criteria**: System prompt enforces CPCB standard, forbids US EPA terminology, and sets tone as empathetic, authoritative, and cautious.

- [ ] **TASK-8.4: Post-Generation Hallucination & Numerical Parity Scanner**
  - **Description**: Implement regex validator scanning LLM responses for AQI numbers; if extracted numbers disagree with injected ground truth, discards response and falls back to deterministic template.
  - **Mapped Deliverables**: `backend/breathewise_core/assistant/guardrails.py`, `tests/unit/test_assistant_guardrails.py`
  - **Acceptance Criteria**: Unit tests verify that any hallucinated AQI integer triggers immediate replacement with deterministic advisory template.

- [ ] **TASK-8.5: Biomedical Prescription Rejection & Legal Disclaimer Appender**
  - **Description**: Implement safety filter blocking pharmaceutical advice (e.g. drug dosage, prescription recommendations) and appending mandatory legal/medical disclaimer to all responses.
  - **Mapped Deliverables**: `backend/breathewise_core/assistant/guardrails.py`
  - **Acceptance Criteria**: Rejects medication queries with emergency medical referral; verifies disclaimer is present in every output payload.

- [ ] **TASK-8.6: Google Gemini LLM Adapter & Deterministic Mock Provider**
  - **Description**: Build LLM adapter supporting Google Gemini 1.5 Flash API alongside deterministic `MockLLMProvider` returning pre-baked conversational fixtures for offline CI test suites.
  - **Mapped Deliverables**: `backend/breathewise_core/assistant/llm_adapter.py`
  - **Acceptance Criteria**: Gracefully catches rate limits and network errors; falls back seamlessly to deterministic rule-based template advisory.

- [ ] **TASK-8.7: AI Assistant Conversation REST APIs**
  - **Description**: Expose DRF endpoints: `GET/POST /api/v1/assistant/conversations/` and `GET/POST /api/v1/assistant/conversations/{id}/messages/`.
  - **Mapped Deliverables**: `backend/apps/assistant/views.py`, `backend/apps/assistant/serializers.py`, `backend/apps/assistant/urls.py`
  - **Acceptance Criteria**: Persists message exchange; returns assistant response along with structured precautions array and exercise advice.

- [ ] **TASK-8.8: Frontend Floating AI Assistant Drawer & Prompt Chips**
  - **Description**: Implement expandable sliding drawer in React featuring message history, typing indicator, markdown rendering, and contextual quick prompt chips ("Can I run outdoors?", "Should my child wear a mask?").
  - **Mapped Deliverables**: `frontend/src/components/assistant/AIAssistantDrawer.tsx`, `frontend/src/components/assistant/PromptChips.tsx`
  - **Acceptance Criteria**: Mobile-friendly sliding animation; renders sanitized markdown with disclaimers styled in subdued contrast.

---

## Phase 9: Production Hardening, Multi-City Scaling & Deployment

- [ ] **TASK-9.1: Multi-City Spatial Registry & Partitioning Architecture**
  - **Description**: Refactor spatial grid generator and station models into a multi-city registry supporting arbitrary Indian urban bounding boxes (e.g. Delhi NCR, Mumbai, Bengaluru) with city-level database partitioning.
  - **Mapped Deliverables**: `backend/breathewise_core/spatial/city_registry.py`
  - **Acceptance Criteria**: Bounding box and H3 grid dynamically generated from city configuration without code modifications.

- [ ] **TASK-9.2: Multi-Stage Production Dockerfiles with Non-Root Execution**
  - **Description**: Author production Dockerfiles for `web` (Python 3.12 slim, non-root user `appuser:10001`, Gunicorn with gevent workers) and `frontend` (multi-stage Vite build to Nginx Alpine with Brotli compression).
  - **Mapped Deliverables**: `backend/Dockerfile.prod`, `frontend/Dockerfile.prod`
  - **Acceptance Criteria**: Image sizes optimized (<250MB backend, <35MB frontend); containers execute without root privileges; vulnerability scan clean.

- [ ] **TASK-9.3: Production Nginx Reverse Proxy & Security Headers**
  - **Description**: Configure Nginx ingress with TLS 1.3 termination, HTTP/2, Brotli compression, strict Content Security Policy (CSP), HSTS (2 years), X-Frame-Options `DENY`, and CORS boundaries.
  - **Mapped Deliverables**: `deploy/nginx/breathewise.conf`
  - **Acceptance Criteria**: SSL Labs configuration benchmarks to A+; security scanning verifies all required OWASP security headers present.

- [ ] **TASK-9.4: DRF Tiered Rate Limiting & Throttling Configuration**
  - **Description**: Implement Redis-backed tiered rate throttling: 100 req/min for anonymous public map views, 600 req/min for authenticated citizens, 1,200 req/min for municipal officers.
  - **Mapped Deliverables**: `backend/config/settings/production.py`, `backend/common/throttling.py`
  - **Acceptance Criteria**: Requests exceeding rate quotas receive standard HTTP 429 Too Many Requests with `Retry-After` header.

- [ ] **TASK-9.5: Kubernetes Deployment & Horizontal Pod Autoscaler (HPA) Manifests**
  - **Description**: Author complete Kubernetes manifests: Deployments, ClusterIP Services, Ingress with cert-manager annotations, ConfigMaps, Secrets, and HPA scaling pods based on CPU/memory utilization.
  - **Mapped Deliverables**: `deploy/k8s/deployment.yaml`, `deploy/k8s/ingress.yaml`, `deploy/k8s/hpa.yaml`
  - **Acceptance Criteria**: `kubectl apply --dry-run=client` validates cleanly; HPA targets 70% CPU threshold for backend scaling.

- [ ] **TASK-9.6: Automated Database Backup & Point-in-Time Recovery (PITR) Scripts**
  - **Description**: Author automated backup scripts performing daily compressed PostgreSQL/PostGIS database dumps, encrypting with GPG, and uploading to S3-compatible object storage with 30-day retention policies.
  - **Mapped Deliverables**: `deploy/scripts/backup_db.sh`, `deploy/scripts/restore_db.sh`
  - **Acceptance Criteria**: Backup script runs cleanly; automated restore test restores database into test instance and verifies table row counts.

- [ ] **TASK-9.7: Prometheus Metrics Exporter & Grafana Dashboards**
  - **Description**: Configure Prometheus metric endpoints in Django (`django-prometheus`) tracking request latency, PostGIS spatial query timing, Celery queue depth, and Redis hit ratios.
  - **Mapped Deliverables**: `deploy/monitoring/prometheus.yml`, `deploy/monitoring/grafana_dashboard.json`
  - **Acceptance Criteria**: Metrics scraped at `/metrics`; Grafana visualizes real-time throughput, p95 latency, and system memory.

- [ ] **TASK-9.8: Distributed Load Testing Execution with Locust (500 Concurrent Users)**
  - **Description**: Execute distributed load test simulating 500 concurrent virtual users exercising grid fetches, station telemetry, and exposure logging over 10 minutes.
  - **Mapped Deliverables**: `tests/load/locustfile.py`, `tests/load/load_test_report.md`
  - **Acceptance Criteria**: Sustains $\ge 250\text{ req/s}$ with zero HTTP 5xx errors; $p95$ response latency remains $< 200\text{ ms}$; Redis cache hit ratio exceeds $95\%$.

- [ ] **TASK-9.9: Static Security Analysis & Vulnerability Remediation**
  - **Description**: Execute Bandit static security scanner against Python codebase, Trivy container image scanner, and npm audit against frontend dependencies; remediate all flagged issues.
  - **Mapped Deliverables**: `reports/security_audit_report.md`
  - **Acceptance Criteria**: Bandit reports zero high/medium issues; Trivy reports zero critical/high CVEs in base images.

- [ ] **TASK-9.10: Digital Personal Data Protection (DPDP Act 2023) Compliance Audit**
  - **Description**: Conduct comprehensive compliance audit verifying zero raw GPS coordinates stored in relational tables, automated EXIF purging verified, user data export/deletion endpoints functional.
  - **Mapped Deliverables**: `reports/dpdp_compliance_attestation.md`
  - **Acceptance Criteria**: Audit passes all privacy gates; data deletion endpoint (`DELETE /api/v1/users/me/`) purges user records and cascades cleanly.
