# AIRiac: Urban Air Quality Assistant (Chandigarh-First)
# Detailed Architectural Blueprint & Domain Specifications

**Document**: `docs/ARCHITECTURE.md`  
**Version**: 1.0.0  
**Phase**: Phase 0 Scaffolding & Foundational Architecture  
**Geographic Target**: Chandigarh Capital Region (Chandigarh UT, SAS Nagar/Mohali, Panchkula)  

---

## 1. System Overview & Component Topology

The **AIRiac** architecture is built as a high-performance, containerized, domain-driven system designed to handle real-time geospatial air quality data, complex atmospheric calculations, and intuitive citizen decision-support interfaces.

```
                      ┌─────────────────────────────────────────┐
                      │              Web Client                 │
                      │  (React 18 + Vite + Leaflet + Recharts) │
                      └────────────────────┬────────────────────┘
                                           │
                                  HTTP / REST (JSON)
                                  Bearer JWT Tokens
                                           │
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │          Django REST API Service        │
                      │      (Python 3.12 / DRF / PostGIS)      │
                      │                                         │
                      │  ┌───────────────────────────────────┐  │
                      │  │       13 Modular Domain Apps      │  │
                      │  └───────────────────────────────────┘  │
                      │  ┌───────────────────────────────────┐  │
                      │  │     Data Provider Abstraction     │  │
                      │  │  (Zero-Network Mock Engine Layer) │  │
                      │  └───────────────────────────────────┘  │
                      └─────────────┬───────────────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               │                                         │
               ▼                                         ▼
┌─────────────────────────────┐           ┌─────────────────────────────┐
│    PostgreSQL 16 + PostGIS  │           │           Redis 7           │
│   Spatial Database (GeoDB)  │           │  Shared Cache & Task Broker │
└─────────────────────────────┘           └──────────────┬──────────────┘
                                                         │
                                        ┌────────────────┴────────────────┐
                                        ▼                                 ▼
                         ┌─────────────────────────────┐   ┌─────────────────────────────┐
                         │    Celery Background Worker │   │     Celery Beat Scheduler   │
                         │    (Async Processing Engine)│   │    (Database Task Scheduler)│
                         └─────────────────────────────┘   └─────────────────────────────┘
```

### 1.1 Architectural Principles
1. **Domain Isolation**: Each of the 13 backend apps represents a cohesive, bounded domain context with strict foreign key boundaries and self-contained business logic.
2. **Spatial-First Design**: Native PostGIS geometry columns (`PointField`, `PolygonField`, `LineStringField`) with `GIST` spatial indexes to support sub-millisecond radius, bounding-box, and containment queries.
3. **Deterministic Provider Decoupling**: Complete isolation from third-party networks in Phase 0 via an abstract provider interface with realistic, time-seeded mock generation.
4. **Optimistic & Resilient Client**: React SPA with centralized JWT token refresh interceptors, TanStack Query caching and deduplication, and responsive Leaflet map controls.

---

## 2. Deep Dive: 13 Modular Django Domain Applications

The backend is decomposed into 13 modular applications organized inside `backend/apps/`.

```
backend/apps/
├── accounts/      # Identity, roles, JWT authentication, user preferences
├── locations/     # Chandigarh sectors, CAAQMS monitoring stations
├── air_quality/   # Raw pollutant records, CPCB NAQI calculation engine
├── weather/       # Surface meteorology (Temp, Humidity, Wind, Pressure)
├── fires/         # Agricultural stubble burning & thermal anomalies
├── forecasting/   # 24h/72h predictive models & rolling trend statistics
├── impact/        # Health risk assessment matrix by demographic group
├── advice/        # Human-actionable advisories (N95, purifiers, outdoor exercise)
├── alerts/        # Threshold triggers, notification subscriptions, logs
├── reports/       # Daily/weekly executive summaries and NAAQS compliance
├── planning/      # Clean route navigation & minimal exposure windows
├── community/     # Crowdsourced citizen science observations
└── geo/           # Spatial bounds, PostGIS extensions, distance calculations
```

---

### 2.1 `apps.accounts` (Identity & User Profile)
- **Bounded Context**: Manages user identity, secure authentication via SimpleJWT, RBAC roles, and environmental vulnerability profiles.
- **Data Models**:
  - `User(AbstractBaseUser, PermissionsMixin)`:
    - `id`: UUID primary key (`default=uuid.uuid4, editable=False`).
    - `email`: `EmailField(unique=True, db_index=True)`. Primary credential.
    - `username`: `CharField(max_length=150, blank=True)`.
    - `first_name`, `last_name`: `CharField(max_length=150, blank=True)`.
    - `role`: `CharField(max_length=20, choices=[('citizen', 'Citizen'), ('researcher', 'Researcher'), ('official', 'City Official'), ('admin', 'System Administrator')], default='citizen')`.
    - `is_active`: `BooleanField(default=True)`.
    - `is_staff`: `BooleanField(default=False)`.
    - `date_joined`: `DateTimeField(auto_now_add=True)`.
  - `UserProfile(models.Model)`:
    - `user`: `OneToOneField(User, on_delete=models.CASCADE, related_name='profile')`.
    - `preferred_sector`: `ForeignKey('locations.Sector', on_delete=models.SET_NULL, null=True, blank=True)`.
    - `is_vulnerable`: `BooleanField(default=False)`.
    - `vulnerability_types`: `JSONField(default=list, blank=True)`. Example: `["asthma", "elderly", "cardiovascular"]`.
    - `notify_via_email`: `BooleanField(default=True)`.
    - `notify_via_sms`: `BooleanField(default=False)`.
- **Key Endpoints**:
  - `POST /api/v1/auth/register/` (User registration with auto-login)
  - `POST /api/v1/auth/login/` (JWT token issuance)
  - `POST /api/v1/auth/token/refresh/` (Access token rotation)
  - `GET /api/v1/auth/me/` (Protected user profile)
  - `PATCH /api/v1/auth/me/` (Profile preferences update)

---

### 2.2 `apps.locations` (Chandigarh Spatial Entities & Monitoring Stations)
- **Bounded Context**: Models the structured spatial layout of Chandigarh (Le Corbusier grid: Sectors 1 through 60+, Industrial Areas) and Continuous Ambient Air Quality Monitoring Stations (CAAQMS).
- **Data Models**:
  - `Sector(models.Model)`:
    - `sector_number`: `CharField(max_length=30, unique=True)`. e.g., `"Sector 17"`, `"Sector 22"`, `"Industrial Area Phase 1"`.
    - `name`: `CharField(max_length=100)`.
    - `zone`: `CharField(max_length=30, choices=[('north', 'North Zone'), ('south', 'South Zone'), ('east', 'East Zone'), ('west', 'West Zone'), ('industrial', 'Industrial Zone'), ('peripheral', 'Peripheral Tricity')])`.
    - `center_point`: `PointField(srid=4326)`. Spatial center coordinates.
    - `boundary`: `PolygonField(srid=4326, null=True, blank=True)`. GeoJSON boundary polygon.
  - `MonitoringStation(models.Model)`:
    - `code`: `CharField(max_length=50, unique=True)`. e.g., `"CH-SEC22-CAAQMS"`, `"CH-PU-SEC25"`.
    - `name`: `CharField(max_length=150)`. e.g., `"Sector 22 CAAQMS"`.
    - `station_type`: `CharField(max_length=30, choices=[('CAAQMS', 'Continuous Ambient'), ('NAMP', 'National Air Quality Monitoring Manual'), ('LOW_COST', 'Low Cost Sensor Mesh')])`.
    - `operator`: `CharField(max_length=100, default='CPCC / CPCB')`.
    - `location`: `PointField(srid=4326)`. Exact geographic coordinates.
    - `sector`: `ForeignKey(Sector, on_delete=models.SET_NULL, null=True, related_name='stations')`.
    - `elevation_m`: `FloatField(default=321.0)`. Elevation in meters.
    - `is_active`: `BooleanField(default=True)`.
- **Spatial Indexes**:
  - `GIST` indexes on `center_point`, `boundary`, and `location`.
- **Key Endpoints**:
  - `GET /api/v1/locations/sectors/`
  - `GET /api/v1/locations/stations/`
  - `GET /api/v1/locations/stations/{id}/`

---

### 2.3 `apps.air_quality` (Pollutant Readings & CPCB NAQI Engine)
- **Bounded Context**: Ingests, processes, and stores observations for the 8 criterion pollutants and runs the Central Pollution Control Board (CPCB) NAQI calculation engine.
- **Data Models**:
  - `PollutantReading(models.Model)`:
    - `station`: `ForeignKey('locations.MonitoringStation', on_delete=models.CASCADE, related_name='readings')`.
    - `timestamp`: `DateTimeField(db_index=True)`. Observation time.
    - `pm25`: `FloatField(null=True, blank=True)`. Particulate Matter $\le 2.5\mu m$ (24h average in $\mu g/m^3$).
    - `pm10`: `FloatField(null=True, blank=True)`. Particulate Matter $\le 10\mu m$ (24h average in $\mu g/m^3$).
    - `no2`: `FloatField(null=True, blank=True)`. Nitrogen Dioxide (24h average in $\mu g/m^3$).
    - `so2`: `FloatField(null=True, blank=True)`. Sulfur Dioxide (24h average in $\mu g/m^3$).
    - `co`: `FloatField(null=True, blank=True)`. Carbon Monoxide (8h average in $mg/m^3$).
    - `o3`: `FloatField(null=True, blank=True)`. Ozone (8h average in $\mu g/m^3$).
    - `nh3`: `FloatField(null=True, blank=True)`. Ammonia (24h average in $\mu g/m^3$).
    - `pb`: `FloatField(null=True, blank=True)`. Lead (24h average in $\mu g/m^3$).
    - `aqi`: `IntegerField(null=True, blank=True)`. Computed aggregate NAQI score (0 to 500+).
    - `aqi_category`: `CharField(max_length=30, blank=True)`. One of: `"Good"`, `"Satisfactory"`, `"Moderate"`, `"Poor"`, `"Very Poor"`, `"Severe"`.
    - `prominent_pollutant`: `CharField(max_length=20, blank=True)`. Pollutant with maximum sub-index (e.g. `"PM2.5"`).
    - `sub_indices`: `JSONField(default=dict)`. Sub-indices mapping (e.g. `{"pm25": 182, "pm10": 135, "no2": 62}`).
- **CPCB NAQI Engine (`backend/apps/air_quality/naqi.py`)**:
  - Implements the official piecewise linear interpolation algorithm.
  - Enforces the **3-pollutant validation rule** and requires that either $PM_{2.5}$ or $PM_{10}$ is present.
- **Key Endpoints**:
  - `GET /api/v1/air-quality/latest/` (Latest observations across all active stations)
  - `GET /api/v1/air-quality/history/` (Time-series query filtered by station and date range)
  - `POST /api/v1/air-quality/calculate/` (Ad-hoc NAQI calculator endpoint)

---

### 2.4 `apps.weather` (Surface Meteorology & Atmospheric Dispersion)
- **Bounded Context**: Captures surface meteorological conditions affecting pollutant dispersion, thermal inversions, and ventilation indices.
- **Data Models**:
  - `WeatherObservation(models.Model)`:
    - `station`: `ForeignKey('locations.MonitoringStation', on_delete=models.CASCADE, related_name='weather')`.
    - `timestamp`: `DateTimeField(db_index=True)`.
    - `temperature`: `FloatField()`. Ambient temperature in $^\circ C$.
    - `relative_humidity`: `FloatField()`. Relative humidity percentage ($0-100\%$).
    - `wind_speed`: `FloatField()`. Wind speed in $km/h$ or $m/s$.
    - `wind_direction`: `FloatField()`. Wind direction in azimuth degrees ($0^\circ - 360^\circ$).
    - `surface_pressure`: `FloatField()`. Atmospheric pressure in $hPa$.
    - `solar_radiation`: `FloatField(null=True, blank=True)`. Global solar irradiance in $W/m^2$.
    - `precipitation`: `FloatField(default=0.0)`. Precipitation depth in $mm$.
- **Key Endpoints**:
  - `GET /api/v1/weather/current/`
  - `GET /api/v1/weather/history/`

---

### 2.5 `apps.fires` (Agricultural Stubble Fires & Thermal Anomalies)
- **Bounded Context**: Tracks stubble burning incidents in the agricultural hinterland (Punjab and Haryana border districts) that produce massive seasonal smoke plumes affecting Chandigarh.
- **Data Models**:
  - `FireIncident(models.Model)`:
    - `source_id`: `CharField(max_length=100, unique=True)`. Satellite observation ID.
    - `location`: `PointField(srid=4326)`. Spatial coordinate.
    - `brightness_temperature`: `FloatField()`. Brightness in Kelvin.
    - `frp`: `FloatField(help_text="Fire Radiative Power in MegaWatts")`.
    - `confidence`: `CharField(max_length=20)`. Confidence category (`"low"`, `"nominal"`, `"high"`).
    - `satellite`: `CharField(max_length=30, choices=[('MODIS', 'Terra/Aqua MODIS'), ('VIIRS_SNPP', 'Suomi NPP VIIRS'), ('VIIRS_NOAA20', 'NOAA-20 VIIRS')])`.
    - `district`: `CharField(max_length=100, blank=True)`. e.g. `"SAS Nagar"`, `"Patiala"`, `"Fatehgarh Sahib"`, `"Ambala"`.
    - `state`: `CharField(max_length=50, default='Punjab')`.
    - `detected_at`: `DateTimeField(db_index=True)`.
- **Key Endpoints**:
  - `GET /api/v1/fires/active/` (Active fires in bounding box / date window)
  - `GET /api/v1/fires/summary/` (District-wise incident counts and total FRP)

---

### 2.6 `apps.forecasting` (Predictive AQI & Diurnal Trend Models)
- **Bounded Context**: Manages short-term air quality forecasting (24-hour, 48-hour, and 72-hour intervals) and diurnal trend analytics.
- **Data Models**:
  - `AQIForecast(models.Model)`:
    - `station`: `ForeignKey('locations.MonitoringStation', on_delete=models.CASCADE, related_name='forecasts')`.
    - `forecast_generated_at`: `DateTimeField(auto_now_add=True)`.
    - `target_timestamp`: `DateTimeField(db_index=True)`. Future timestamp.
    - `predicted_aqi`: `IntegerField()`. Projected NAQI score.
    - `predicted_category`: `CharField(max_length=30)`.
    - `confidence_interval_low`: `IntegerField()`.
    - `confidence_interval_high`: `IntegerField()`.
    - `primary_pollutant`: `CharField(max_length=20, default='PM2.5')`.
    - `model_version`: `CharField(max_length=50, default='v1.0-mock-baseline')`.
  - `TrendAnalysis(models.Model)`:
    - `station`: `ForeignKey('locations.MonitoringStation', on_delete=models.CASCADE)`.
    - `period`: `CharField(max_length=20, choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly')])`.
    - `date`: `DateField()`.
    - `avg_aqi`: `FloatField()`.
    - `dominant_pollutant`: `CharField(max_length=20)`.
    - `peak_hour`: `IntegerField()`. Hour of maximum diurnal exposure.
- **Key Endpoints**:
  - `GET /api/v1/forecasting/stations/{id}/`
  - `GET /api/v1/forecasting/trends/`

---

### 2.7 `apps.impact` (Demographic Health Risk Assessment)
- **Bounded Context**: Evaluates physiological risk levels across susceptible cohorts (infants/children, elderly, chronic asthma, cardiovascular patients, pregnant individuals, and outdoor workers).
- **Data Models**:
  - `VulnerableGroup(models.Model)`:
    - `code`: `CharField(max_length=30, unique=True)`. e.g. `"children"`, `"elderly"`, `"asthma"`, `"cardiovascular"`, `"outdoor_workers"`.
    - `name`: `CharField(max_length=100)`.
    - `description`: `TextField()`.
  - `HealthImpactMatrix(models.Model)`:
    - `aqi_category`: `CharField(max_length=30)`. CPCB Category (`"Good"`, `"Satisfactory"`, `"Moderate"`, `"Poor"`, `"Very Poor"`, `"Severe"`).
    - `vulnerable_group`: `ForeignKey(VulnerableGroup, on_delete=models.CASCADE)`.
    - `risk_level`: `CharField(max_length=20, choices=[('low', 'Low Risk'), ('moderate', 'Moderate Risk'), ('high', 'High Risk'), ('severe', 'Severe Risk'), ('critical', 'Critical Risk')])`.
    - `symptoms`: `TextField()`. Anticipated physiological symptoms (e.g. bronchial constriction, eye irritation, cardiac strain).
    - `recommended_precautions`: `TextField()`.
- **Key Endpoints**:
  - `GET /api/v1/impact/vulnerable-groups/`
  - `GET /api/v1/impact/assessment/?aqi={val}&group={code}`

---

### 2.8 `apps.advice` (Actionable Health Advisories & Activity Guidelines)
- **Bounded Context**: Translates technical AQI levels into clear, actionable, everyday guidance for Chandigarh residents.
- **Data Models**:
  - `Advisory(models.Model)`:
    - `aqi_category`: `CharField(max_length=30, unique=True)`.
    - `headline`: `CharField(max_length=200)`.
    - `general_public_advice`: `TextField()`.
    - `vulnerable_group_advice`: `TextField()`.
    - `mask_guidance`: `CharField(max_length=100)`. e.g. `"N95 / FFP2 mask recommended for outdoor activity"`.
    - `indoor_air_guidance`: `CharField(max_length=200)`. e.g. `"Run HEPA purifiers, keep windows closed during morning/evening peaks"`.
    - `exercise_guidance`: `CharField(max_length=200)`. e.g. `"Avoid strenuous outdoor morning jogs at Sukhna Lake"`.
- **Key Endpoints**:
  - `GET /api/v1/advice/current/` (Advisory based on current city-average AQI)
  - `GET /api/v1/advice/categories/`

---

### 2.9 `apps.alerts` (Threshold Triggers & Notification Logs)
- **Bounded Context**: User-customized alerting thresholds, multi-channel dispatch triggers (email/SMS/web push), and notification history.
- **Data Models**:
  - `AlertThreshold(models.Model)`:
    - `user`: `ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='alerts')`.
    - `sector`: `ForeignKey('locations.Sector', on_delete=models.CASCADE, null=True, blank=True)`.
    - `threshold_aqi`: `IntegerField(default=200)`. NAQI threshold for dispatch.
    - `notify_email`: `BooleanField(default=True)`.
    - `is_active`: `BooleanField(default=True)`.
  - `AlertNotification(models.Model)`:
    - `user`: `ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='notifications')`.
    - `threshold`: `ForeignKey(AlertThreshold, on_delete=models.SET_NULL, null=True)`.
    - `aqi_recorded`: `IntegerField()`.
    - `message`: `TextField()`.
    - `sent_at`: `DateTimeField(auto_now_add=True)`.
    - `read`: `BooleanField(default=False)`.
- **Key Endpoints**:
  - `GET /api/v1/alerts/subscriptions/`
  - `POST /api/v1/alerts/subscriptions/`
  - `GET /api/v1/alerts/notifications/`

---

### 2.10 `apps.reports` (Executive Summaries & Compliance Reporting)
- **Bounded Context**: Aggregates spatial air quality statistics into daily, weekly, and monthly compliance records evaluated against Indian National Ambient Air Quality Standards (NAAQS).
- **Data Models**:
  - `DailyReport(models.Model)`:
    - `report_date`: `DateField(unique=True)`.
    - `city_avg_aqi`: `FloatField()`.
    - `max_station`: `ForeignKey('locations.MonitoringStation', on_delete=models.SET_NULL, null=True)`.
    - `max_aqi`: `IntegerField()`.
    - `min_aqi`: `IntegerField()`.
    - `primary_pollutant`: `CharField(max_length=20)`.
    - `compliance_status`: `CharField(max_length=50)`. e.g. `"Within NAAQS Limits"` vs `"Exceeded NAAQS (PM2.5)"`.
    - `summary_text`: `TextField()`.
- **Key Endpoints**:
  - `GET /api/v1/reports/daily/`
  - `GET /api/v1/reports/daily/{date}/`

---

### 2.11 `apps.planning` (Clean Route & Exposure Minimization)
- **Bounded Context**: Spatial routing algorithms computing exposure along transit paths between origin and destination points across the Chandigarh grid.
- **Data Models**:
  - `CleanRouteQuery(models.Model)`:
    - `origin`: `PointField(srid=4326)`.
    - `destination`: `PointField(srid=4326)`.
    - `departure_time`: `DateTimeField()`.
    - `created_at`: `DateTimeField(auto_now_add=True)`.
  - `RouteOption(models.Model)`:
    - `query`: `ForeignKey(CleanRouteQuery, on_delete=models.CASCADE, related_name='options')`.
    - `route_type`: `CharField(max_length=30, choices=[('fastest', 'Fastest Route'), ('cleanest', 'Lowest Cumulative Exposure')])`.
    - `route_geometry`: `LineStringField(srid=4326, null=True, blank=True)`. Path geometry.
    - `estimated_duration_mins`: `IntegerField()`.
    - `average_aqi_exposure`: `FloatField()`. Path-integrated average AQI.
- **Key Endpoints**:
  - `POST /api/v1/planning/clean-route/`

---

### 2.12 `apps.community` (Citizen Science & Hyper-Local Hazard Reports)
- **Bounded Context**: Crowdsourced reporting of hyper-local pollution incidents (e.g. municipal solid waste burning, leaf litter fires, construction dust, diesel generator smoke) with community upvoting.
- **Data Models**:
  - `CitizenReport(models.Model)`:
    - `user`: `ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)`.
    - `report_type`: `CharField(max_length=50, choices=[('stubble', 'Stubble Burning'), ('garbage', 'Garbage Burning'), ('industrial', 'Industrial Smoke'), ('dust', 'Road / Construction Dust'), ('odor', 'Severe Odor')])`.
    - `sector`: `ForeignKey('locations.Sector', on_delete=models.SET_NULL, null=True)`.
    - `location`: `PointField(srid=4326)`. Incident GPS coordinate.
    - `description`: `TextField()`.
    - `image_url`: `URLField(blank=True)`. Evidence photo link.
    - `status`: `CharField(max_length=20, choices=[('pending', 'Pending Verification'), ('verified', 'Verified Incident'), ('resolved', 'Resolved')], default='pending')`.
    - `upvotes`: `PositiveIntegerField(default=0)`.
    - `created_at`: `DateTimeField(auto_now_add=True)`.
- **Key Endpoints**:
  - `GET /api/v1/community/reports/`
  - `POST /api/v1/community/reports/`
  - `POST /api/v1/community/reports/{id}/upvote/`

---

### 2.13 `apps.geo` (Spatial Primitives, Bounding Boxes & PostGIS Setup)
- **Bounded Context**: Spatial utilities, Coordinate Reference System (CRS) transformations, bounding box filtering, spatial distance calculations, and the initial PostGIS extension creation.
- **Chandigarh Spatial Constants (`apps.geo.constants`)**:
  ```python
  CHANDIGARH_BBOX = {
      'min_lat': 30.6500,
      'max_lat': 30.8200,
      'min_lng': 76.6800,
      'max_lng': 76.8800,
      'center_lat': 30.7333,
      'center_lng': 76.7794,
      'srid': 4326,
  }
  ```
- **Spatial Utility Functions**:
  - `is_within_chandigarh(lat: float, lng: float) -> bool`: Verifies whether coordinates fall inside the Tricity bounding box.
  - `get_nearest_station(lat: float, lng: float) -> MonitoringStation`: Executes PostGIS spatial distance order (`Distance('location', point)`) to find the nearest CAAQMS station.
  - `filter_by_bbox(queryset, min_lat, min_lng, max_lat, max_lng)`: Applies PostGIS polygon containment filter.
- **PostGIS Migration (`0001_enable_postgis.py`)**:
  - Executes `CreateExtension('postgis')` cleanly in PostgreSQL.

---

## 3. Frontend Architecture (React 18 + Vite + TypeScript)

The frontend is a modern, responsive Single Page Application (SPA) designed to present complex air quality data through clear visual hierarchies.

```
frontend/src/
├── api/             # Typed API client, Axios interceptors, endpoint wrappers
├── components/      # UI components (Header, Map, Pollutants, Charts, Advice, Auth)
├── context/         # AuthContext (JWT management, profile state)
├── hooks/           # Custom React hooks (TanStack Query integrations)
├── test/            # Vitest unit and integration test suites
└── types/           # Domain type contracts (AQI, Stations, Pollutants, Auth)
```

### 3.1 State Management & Server Synchronization
- **TanStack Query (`@tanstack/react-query@5`)**:
  - Manages asynchronous server state (monitoring stations, current AQI, historical trend arrays, health status).
  - Handles automated background refetching (stale-while-revalidate), caching, deduplication, and loading/error states.
- **Auth Context (`src/context/AuthContext.tsx`)**:
  - Manages client-side identity: `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `login`, `logout`.
  - Securely persists tokens in `localStorage` with automated memory hydration on app mount.

### 3.2 Leaflet Spatial Visualization (`ChandigarhMap.tsx`)
- Built with `react-leaflet` and Leaflet 1.9.
- Centered on Chandigarh Sector 17 (`[30.7333, 76.7794]`, zoom level 12).
- Renders custom SVG markers for each CAAQMS station dynamically colored using the 6 CPCB NAQI hex tokens.
- Interactive popups display real-time sub-indices, prominent pollutant, and station operator.

### 3.3 Recharts Diurnal Trend Visualization (`TrendChart.tsx`)
- Plots 24-hour diurnal concentrations of $PM_{2.5}$ and $PM_{10}$.
- Displays horizontal reference lines matching the official CPCB breakpoints:
  - Good ($30 \mu g/m^3$)
  - Satisfactory ($60 \mu g/m^3$)
  - Moderate ($90 \mu g/m^3$)
  - Poor ($120 \mu g/m^3$)
  - Very Poor ($250 \mu g/m^3$)
- Styled with responsive tooltips and custom axis formatters.

### 3.4 Tailwind CSS NAQI Color Palette
Configured in `frontend/tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        naqi: {
          good: '#00B050',         // 0 - 50 (Good)
          satisfactory: '#92D050', // 51 - 100 (Satisfactory)
          moderate: '#E5B800',     // 101 - 200 (Moderate)
          poor: '#FF7C80',         // 201 - 300 (Poor)
          verypoor: '#C00000',     // 301 - 400 (Very Poor)
          severe: '#7030A0',       // 401 - 500+ (Severe)
        }
      }
    }
  }
}
```

---

## 4. API Client & Authentication Lifecycle

The API client (`frontend/src/api/client.ts`) provides robust HTTP transport over Axios with automated Bearer token attachment and transparent 401 refresh token handling:

```text
[User Request]
       │
       ▼
[Axios Request Interceptor] ── Attaches 'Authorization: Bearer <access_token>'
       │
       ▼
[Backend Django API]
       │
   ┌───┴────────────────────────┐
   ▼                            ▼
[HTTP 200 OK]            [HTTP 401 Unauthorized]
   │                            │
   ▼                            ▼
[Return Response]        [Axios Response Interceptor]
                                │
                                ├── Calls 'POST /api/v1/auth/token/refresh/' with refresh token
                                │
                       ┌────────┴────────┐
                       ▼                 ▼
                 [Refresh Success]  [Refresh Failure]
                       │                 │
                       ├── Save new      └── Clear tokens & redirect
                       │   access token      to login
                       │
                       └── Re-issue original queued request
```

---

## 5. Zero-External Network Isolation & Mock Provider System

To satisfy Phase 0 constraints and ensure 100% deterministic, offline-capable operation:
1. **Abstract Base Class (`backend/providers/base.py`)**:
   Enforces uniform signatures across all current and future data providers.
2. **Deterministic Mock Implementations**:
   - `MockCPCBProvider`: Implements a reproducible diurnal variation generator using a deterministic seed (`random.Random(42)`). Generates hourly values reflecting Chandigarh's atmospheric boundary layer behavior (morning temperature inversion trap, afternoon wind dilution, evening smoke accumulation).
   - `MockWeatherProvider`: Emits plausible local microclimate conditions (winter haze vs summer pre-monsoon convective patterns).
   - `MockFIRMSProvider`: Emits stubble fire locations concentrated in surrounding agricultural districts (SAS Nagar, Patiala, Ambala) to simulate transboundary particulate transport.
3. **Zero Network Guarantee**:
   Unit tests explicitly verify that mock provider methods do not open external network sockets (`urllib`, `requests`, `httpx`).

---

## 6. Security, Permissions, and Data Integrity

1. **Password Hashing**: Django's default PBKDF2 with SHA-256 (390,000+ iterations) for user credentials.
2. **JWT Security**: Access tokens have a 60-minute lifetime; refresh tokens have a 7-day lifetime. Tokens are signed using HMAC-SHA256 with the server's `SECRET_KEY`.
3. **CORS Restrictions**: Explicit allowed origins configured in Django (`CORS_ALLOWED_ORIGINS`), preventing arbitrary cross-origin script execution.
4. **Input Sanitization**: DRF Serializers rigorously validate pollutant ranges (e.g. non-negative concentrations, coordinate bounds).
5. **Spatial Geometry Validation**: Coordinates are validated against WGS84 bounds prior to database insertion.
