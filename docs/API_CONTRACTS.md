# AIRiac: Urban Air Quality Assistant (Chandigarh-First)
# REST API Contracts & OpenAPI Specifications

**Document**: `docs/API_CONTRACTS.md`  
**Version**: 1.0.0  
**Phase**: Phase 0 Scaffolding  
**Base Path**: `/api/v1`  
**Schema Standard**: OpenAPI 3.0 / JSON Schema  

---

## 1. Global Conventions & Standards

### 1.1 Content Negotiation
- **Request Format**: All mutating requests (`POST`, `PUT`, `PATCH`) must include `Content-Type: application/json`.
- **Response Format**: Responses return `Content-Type: application/json; charset=utf-8`.
- **Date/Time Formatting**: ISO-8601 extended format with UTC offset (e.g. `2026-11-22T08:00:00Z` or `2026-11-22T13:30:00+05:30`).

### 1.2 Authentication & Authorization Headers
- Endpoints marked **[Protected]** require an HTTP `Authorization` header containing an active SimpleJWT bearer token:
  ```http
  Authorization: Bearer <access_token>
  ```
- Endpoints marked **[Public]** require no authorization header.

### 1.3 Standard Error Format
When an operation fails, the API returns a structured error object with an appropriate HTTP status code:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid pollutant concentrations supplied.",
    "details": {
      "pm25": ["Ensure this value is greater than or equal to 0."]
    },
    "timestamp": "2026-11-22T08:00:00Z"
  }
}
```

---

## 2. Health & System Diagnostic Contracts

### 2.1 System Health Check
- **Route**: `GET /api/v1/health/` (and `/api/health/`)
- **Access**: [Public]
- **Purpose**: Liveness and readiness probe for Docker orchestration, Kubernetes, and frontend status bar.

#### Response: HTTP 200 OK (Healthy)
```json
{
  "status": "healthy",
  "timestamp": "2026-11-22T08:00:00Z",
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

#### Response: HTTP 503 Service Unavailable (Degraded/Unhealthy)
```json
{
  "status": "unhealthy",
  "timestamp": "2026-11-22T08:00:00Z",
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

---

## 3. Authentication & User Management Contracts

### 3.1 User Registration
- **Route**: `POST /api/v1/auth/register/`
- **Access**: [Public]
- **Purpose**: Creates a new user account with citizen role and returns initial JWT tokens.

#### Request Body
```json
{
  "email": "citizen@chandigarh.gov.in",
  "password": "SecurePassword123!",
  "first_name": "Sukhwinder",
  "last_name": "Singh",
  "preferred_sector": "Sector 17"
}
```

#### Response: HTTP 201 Created
```json
{
  "user": {
    "id": "7f3e82d1-21a4-4a25-9a84-63df5e97b102",
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

#### Response: HTTP 400 Bad Request
```json
{
  "email": ["A user with that email already exists."],
  "password": ["This password is too short. It must contain at least 8 characters."]
}
```

---

### 3.2 User Login (Token Obtain)
- **Route**: `POST /api/v1/auth/login/`
- **Access**: [Public]
- **Purpose**: Exchanges valid email and password credentials for an access and refresh JWT.

#### Request Body
```json
{
  "email": "citizen@chandigarh.gov.in",
  "password": "SecurePassword123!"
}
```

#### Response: HTTP 200 OK
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzczNjUyODAwLCJqdGkiOiJmZjY3ODkwMSIsInVzZXJfaWQiOiI3ZjNlODJkMS0yMWE0LTRhMjUtOWE4NC02M2RmNWU5N2IxMDIifQ...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3NDI1NzYwMCwianRpIjoiYWIxMjM0NTYiLCJ1c2VyX2lkIjoiN2YzZTgyZDEtMjFhNC00YTI1LTlhODQtNjNkZjVlOTdiMTAyIn0..."
}
```

#### Response: HTTP 401 Unauthorized
```json
{
  "detail": "No active account found with the given credentials"
}
```

---

### 3.3 Token Refresh
- **Route**: `POST /api/v1/auth/token/refresh/`
- **Access**: [Public]
- **Purpose**: Exchanges an unexpired refresh token for a new access token.

#### Request Body
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCI..."
}
```

#### Response: HTTP 200 OK
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIi..."
}
```

#### Response: HTTP 401 Unauthorized
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

---

### 3.4 Current User Profile
- **Route**: `GET /api/v1/auth/me/`
- **Access**: [Protected]
- **Purpose**: Retrieves identity and vulnerability profile of the authenticated user.

#### Response: HTTP 200 OK
```json
{
  "id": "7f3e82d1-21a4-4a25-9a84-63df5e97b102",
  "email": "citizen@chandigarh.gov.in",
  "first_name": "Sukhwinder",
  "last_name": "Singh",
  "role": "citizen",
  "preferred_sector": "Sector 17",
  "is_vulnerable": true,
  "vulnerability_types": ["asthma", "elderly"],
  "notify_via_email": true,
  "notify_via_sms": false
}
```

---

## 4. Locations & Monitoring Stations Contracts

### 4.1 List Sectors
- **Route**: `GET /api/v1/locations/sectors/`
- **Access**: [Public]
- **Purpose**: Returns sectors across Chandigarh UT with boundary polygons and center coordinates.

#### Response: HTTP 200 OK
```json
[
  {
    "id": 1,
    "sector_number": "Sector 17",
    "name": "City Centre Plaza",
    "zone": "central",
    "center_point": {
      "type": "Point",
      "coordinates": [76.7850, 30.7410]
    }
  },
  {
    "id": 2,
    "sector_number": "Sector 22",
    "name": "Sector 22 Market",
    "zone": "south",
    "center_point": {
      "type": "Point",
      "coordinates": [76.7744, 30.7259]
    }
  }
]
```

---

### 4.2 List Monitoring Stations
- **Route**: `GET /api/v1/locations/stations/`
- **Access**: [Public]
- **Purpose**: Returns all continuous monitoring stations (CAAQMS) with spatial coordinates.

#### Response: HTTP 200 OK
```json
[
  {
    "id": 1,
    "code": "CH-SEC22-CAAQMS",
    "name": "Sector 22 CAAQMS",
    "station_type": "CAAQMS",
    "operator": "CPCC",
    "location": {
      "type": "Point",
      "coordinates": [76.7744, 30.7259]
    },
    "sector_number": "Sector 22",
    "elevation_m": 321.0,
    "is_active": true
  },
  {
    "id": 2,
    "code": "CH-PU-SEC25",
    "name": "Panjab University, Sector 25",
    "station_type": "CAAQMS",
    "operator": "CPCC",
    "location": {
      "type": "Point",
      "coordinates": [76.7620, 30.7510]
    },
    "sector_number": "Sector 25",
    "elevation_m": 325.0,
    "is_active": true
  },
  {
    "id": 3,
    "code": "CH-SEC53-CAAQMS",
    "name": "Sector 53 (Mohali Border)",
    "station_type": "CAAQMS",
    "operator": "CPCC",
    "location": {
      "type": "Point",
      "coordinates": [76.7320, 30.7180]
    },
    "sector_number": "Sector 53",
    "elevation_m": 318.0,
    "is_active": true
  }
]
```

---

## 5. Air Quality & CPCB NAQI Contracts

### 5.1 Latest Air Quality Observations
- **Route**: `GET /api/v1/air-quality/latest/`
- **Access**: [Public]
- **Query Parameters**:
  - `station_code` (optional, string): Filter by station identifier.
- **Purpose**: Returns latest real-time observations and computed NAQI for all stations.

#### Response: HTTP 200 OK
```json
{
  "city_summary": {
    "city": "Chandigarh",
    "average_aqi": 182,
    "category": "Moderate",
    "category_color": "#E5B800",
    "prominent_pollutant": "PM2.5",
    "reporting_stations": 3,
    "last_updated": "2026-11-22T08:00:00Z"
  },
  "stations": [
    {
      "station_code": "CH-SEC22-CAAQMS",
      "station_name": "Sector 22 CAAQMS",
      "location": {
        "latitude": 30.7259,
        "longitude": 76.7744
      },
      "timestamp": "2026-11-22T08:00:00Z",
      "aqi": 182,
      "category": "Moderate",
      "category_color": "#E5B800",
      "prominent_pollutant": "PM2.5",
      "sub_indices": {
        "pm25": 182,
        "pm10": 135,
        "no2": 62,
        "so2": 18,
        "co": 45,
        "o3": 38,
        "nh3": 25
      },
      "pollutants": {
        "pm25": { "concentration": 84.6, "unit": "µg/m³", "sub_index": 182 },
        "pm10": { "concentration": 152.3, "unit": "µg/m³", "sub_index": 135 },
        "no2": { "concentration": 49.8, "unit": "µg/m³", "sub_index": 62 },
        "so2": { "concentration": 14.2, "unit": "µg/m³", "sub_index": 18 },
        "co": { "concentration": 0.9, "unit": "mg/m³", "sub_index": 45 },
        "o3": { "concentration": 38.1, "unit": "µg/m³", "sub_index": 38 },
        "nh3": { "concentration": 50.4, "unit": "µg/m³", "sub_index": 25 }
      }
    }
  ]
}
```

---

### 5.2 Historical Air Quality Series
- **Route**: `GET /api/v1/air-quality/history/`
- **Access**: [Public]
- **Query Parameters**:
  - `station_code` (required, string): Station code (e.g. `CH-SEC22-CAAQMS`).
  - `hours` (optional, integer, default: 24, max: 168): Hours of hourly history to return.
- **Purpose**: Supplies 24-hour diurnal trend data for chart rendering.

#### Response: HTTP 200 OK
```json
{
  "station_code": "CH-SEC22-CAAQMS",
  "series": [
    {
      "timestamp": "2026-11-21T09:00:00Z",
      "aqi": 145,
      "pm25": 73.2,
      "pm10": 128.5,
      "no2": 42.1
    },
    {
      "timestamp": "2026-11-21T10:00:00Z",
      "aqi": 138,
      "pm25": 70.1,
      "pm10": 120.4,
      "no2": 39.5
    }
  ]
}
```

---

### 5.3 Ad-Hoc NAQI Calculator
- **Route**: `POST /api/v1/air-quality/calculate/`
- **Access**: [Public]
- **Purpose**: Computes exact CPCB NAQI and sub-indices from custom pollutant concentrations.

#### Request Body
```json
{
  "pm25": 84.6,
  "pm10": 152.3,
  "no2": 49.8,
  "so2": 14.2,
  "co": 0.9,
  "o3": 38.1,
  "nh3": 50.4
}
```

#### Response: HTTP 200 OK (Valid Calculation)
```json
{
  "aqi": 182,
  "category": "Moderate",
  "category_color": "#E5B800",
  "prominent_pollutant": "PM2.5",
  "is_valid": true,
  "sub_indices": {
    "pm25": 182,
    "pm10": 135,
    "no2": 62,
    "so2": 18,
    "co": 45,
    "o3": 38,
    "nh3": 25
  }
}
```

#### Response: HTTP 422 Unprocessable Entity (Insufficient Pollutants)
```json
{
  "is_valid": false,
  "aqi": null,
  "error": "NAQI calculation requires at least 3 valid pollutants, including PM2.5 or PM10."
}
```

---

## 6. Weather & Agricultural Fires Contracts

### 6.1 Current Weather Observation
- **Route**: `GET /api/v1/weather/current/`
- **Access**: [Public]

#### Response: HTTP 200 OK
```json
{
  "station_code": "CH-SEC22-CAAQMS",
  "timestamp": "2026-11-22T08:00:00Z",
  "temperature_c": 22.4,
  "relative_humidity_pct": 58.0,
  "wind_speed_kmh": 4.5,
  "wind_direction_deg": 315.0,
  "wind_direction_cardinal": "NW",
  "surface_pressure_hpa": 1012.3,
  "solar_radiation_wm2": 480.0
}
```

---

### 6.2 Active Agricultural Stubble Fires
- **Route**: `GET /api/v1/fires/active/`
- **Access**: [Public]
- **Query Parameters**:
  - `min_frp` (optional, float): Minimum Fire Radiative Power (MW).
  - `hours` (optional, integer, default: 24): Lookback duration.

#### Response: HTTP 200 OK
```json
{
  "count": 2,
  "results": [
    {
      "source_id": "VIIRS_N20_20261122_01",
      "latitude": 30.6840,
      "longitude": 76.6210,
      "district": "SAS Nagar (Mohali)",
      "state": "Punjab",
      "frp_mw": 34.2,
      "confidence": "high",
      "satellite": "VIIRS_NOAA20",
      "detected_at": "2026-11-22T06:45:00Z"
    },
    {
      "source_id": "VIIRS_SNPP_20261122_02",
      "latitude": 30.5120,
      "longitude": 76.5410,
      "district": "Fatehgarh Sahib",
      "state": "Punjab",
      "frp_mw": 52.8,
      "confidence": "high",
      "satellite": "VIIRS_SNPP",
      "detected_at": "2026-11-22T07:12:00Z"
    }
  ]
}
```

---

## 7. Actionable Advice & Health Impact Contracts

### 7.1 Current Health Advisory
- **Route**: `GET /api/v1/advice/current/`
- **Access**: [Public]

#### Response: HTTP 200 OK
```json
{
  "aqi": 182,
  "category": "Moderate",
  "headline": "Air quality is moderately polluted. Vulnerable individuals may experience slight respiratory discomfort.",
  "general_public_advice": "Healthy individuals can continue normal outdoor activities. Consider reducing prolonged vigorous exertion.",
  "vulnerable_group_advice": "People with respiratory or cardiac conditions, children, and elderly should take frequent breaks during outdoor exertion.",
  "mask_guidance": "N95 / FFP2 mask optional for general public; recommended for asthma patients outdoors.",
  "indoor_guidance": "Keep windows closed during early morning peak traffic hours. Run air purifiers on medium setting.",
  "exercise_guidance": "Schedule strenuous outdoor workouts during afternoon hours (12:00 PM – 4:00 PM) when boundary layer mixing reduces ground concentrations."
}
```

---

### 7.2 Demographic Health Impact Assessment
- **Route**: `GET /api/v1/impact/assessment/`
- **Access**: [Public]
- **Query Parameters**:
  - `aqi` (required, integer): Target NAQI value.
  - `group` (required, string): Vulnerability code (`asthma`, `elderly`, `children`, `outdoor_workers`).

#### Response: HTTP 200 OK
```json
{
  "aqi": 182,
  "category": "Moderate",
  "vulnerable_group": {
    "code": "asthma",
    "name": "Individuals with Asthma or Reactive Airway Disease"
  },
  "risk_level": "moderate",
  "symptoms": "Potential mild bronchospasm, dry coughing, and throat irritation after extended outdoor activity.",
  "recommended_precautions": "Keep rapid-relief inhaler readily accessible. Minimize prolonged aerobic exertion along arterial corridors (e.g. Madhya Marg)."
}
```

---

## 8. OpenAPI Interactive Documentation Endpoints

The API automatically exposes OpenAPI 3.0 schema and interactive interfaces via `drf-spectacular`:

| URL Path | Content / Interface | Access |
|---|---|---|
| `GET /api/schema/` | Raw OpenAPI 3.0 YAML / JSON Schema Definition | [Public] |
| `GET /api/docs/` | Interactive Swagger UI Explorer | [Public] |
| `GET /api/redoc/` | ReDoc Visual Documentation Interface | [Public] |
