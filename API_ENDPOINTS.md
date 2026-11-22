# BreatheWise: REST API Endpoints Specification
## Comprehensive Django REST Framework (DRF) Contract Specifications across All 8 Bounded Context Apps

**Document Identifier**: `API_ENDPOINTS.md`  
**System Name**: BreatheWise Urban Air Quality Assistance Platform  
**Target Region**: Chandigarh Urban Agglomeration (30.65°N–30.80°N, 76.70°E–76.85°E)  
**Standard Compliance**: Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) Standard  
**Base URL**: `https://api.breathewise.in/api/v1` (Local Dev: `http://localhost:8000/api/v1`)  
**Authentication**: SimpleJWT Bearer Authentication (`Authorization: Bearer <access_token>`)  
**Data Serialization**: JSON UTF-8 (`Content-Type: application/json`, `Accept: application/json`)  
**Document Version**: 2.0.0  
**Status**: Authoritative API Contract Baseline  

---

## Table of Contents
1. [Global API Architecture & Protocols](#1-global-api-architecture--protocols)
   - 1.1 HTTP Verbs, Headers & Status Codes
   - 1.2 Global Error Envelope Specification
   - 1.3 SimpleJWT Authentication Lifecycle & Bearer Token Protocol
   - 1.4 Rate Limiting & Throttling Tiers
   - 1.5 Pagination & Ordering Conventions
2. [App 1: `accounts` (Identity, Authentication & Profiles)](#2-app-1-accounts-identity-authentication--profiles)
   - 2.1 `POST /api/v1/auth/register/`
   - 2.2 `POST /api/v1/auth/login/`
   - 2.3 `POST /api/v1/auth/refresh/`
   - 2.4 `POST /api/v1/auth/logout/`
   - 2.5 `GET /api/v1/users/me/`
   - 2.6 `PATCH /api/v1/users/me/`
   - 2.7 `GET /api/v1/users/me/profile/`
   - 2.8 `PUT /api/v1/users/me/profile/`
   - 2.9 `PATCH /api/v1/users/me/profile/`
3. [App 2: `locations` (Stations, Sectors & Reverse Geocoding)](#3-app-2-locations-stations-sectors--reverse-geocoding)
   - 3.1 `GET /api/v1/locations/stations/`
   - 3.2 `GET /api/v1/locations/stations/{id}/`
   - 3.3 `GET /api/v1/locations/sectors/`
   - 3.4 `GET /api/v1/locations/sectors/{id}/`
   - 3.5 `GET /api/v1/locations/saved/`
   - 3.6 `POST /api/v1/locations/saved/`
   - 3.7 `GET /api/v1/locations/saved/{id}/`
   - 3.8 `PUT /api/v1/locations/saved/{id}/`
   - 3.9 `PATCH /api/v1/locations/saved/{id}/`
   - 3.10 `DELETE /api/v1/locations/saved/{id}/`
   - 3.11 `POST /api/v1/locations/reverse-geocode/` (with H3 Cell Resolution & Redis Cache)
4. [App 3: `air_quality` (Readings, H3 Hex Grid & Telemetry)](#4-app-3-air_quality-readings-h3-hex-grid--telemetry)
   - 4.1 `GET /api/v1/air-quality/latest/`
   - 4.2 `GET /api/v1/air-quality/history/`
   - 4.3 `GET /api/v1/air-quality/h3/{h3_index}/`
   - 4.4 `GET /api/v1/air-quality/grid/` (Interpolated Chandigarh H3 Resolution 8 Grid)
5. [App 4: `analytics` (Trends, Diurnal Dynamics & NAAQS Compliance)](#5-app-4-analytics-trends-diurnal-dynamics--naaqs-compliance)
   - 5.1 `GET /api/v1/analytics/trends/`
   - 5.2 `GET /api/v1/analytics/diurnal/`
   - 5.3 `GET /api/v1/analytics/naaqs-compliance/`
   - 5.4 `GET /api/v1/analytics/summary/`
6. [App 5: `forecasting` & `assistant` (Predictive Models & Advisory)](#6-app-5-forecasting--assistant-predictive-models--advisory)
   - 6.1 `GET /api/v1/forecast/hourly/`
   - 6.2 `GET /api/v1/forecast/daily/`
   - 6.3 `GET /api/v1/assistant/conversations/`
   - 6.4 `POST /api/v1/assistant/conversations/`
   - 6.5 `GET /api/v1/assistant/conversations/{id}/messages/`
   - 6.6 `POST /api/v1/assistant/conversations/{id}/messages/`
7. [App 6: `alerts` (Notification Preferences & Active Dispatch)](#7-app-6-alerts-notification-preferences--active-dispatch)
   - 7.1 `GET /api/v1/alerts/preferences/`
   - 7.2 `PUT /api/v1/alerts/preferences/`
   - 7.3 `PATCH /api/v1/alerts/preferences/`
   - 7.4 `GET /api/v1/alerts/active/`
   - 7.5 `POST /api/v1/alerts/{id}/read/`
   - 7.6 `POST /api/v1/alerts/test/`
8. [App 7: `reports` (Citizen Hazard Incidents & Moderation)](#8-app-7-reports-citizen-hazard-incidents--moderation)
   - 8.1 `GET /api/v1/reports/`
   - 8.2 `POST /api/v1/reports/`
   - 8.3 `GET /api/v1/reports/{id}/`
   - 8.4 `PATCH /api/v1/reports/{id}/`
   - 8.5 `DELETE /api/v1/reports/{id}/`
   - 8.6 `POST /api/v1/reports/{id}/upvote/`
   - 8.7 `POST /api/v1/reports/upload-image/` (with EXIF Stripping Gate)
9. [App 8: `exposure` (Physiological Inhalation Dose & Activity Tracking)](#9-app-8-exposure-physiological-inhalation-dose--activity-tracking)
   - 9.1 `POST /api/v1/exposure/log/`
   - 9.2 `GET /api/v1/exposure/daily-summary/`
   - 9.3 `GET /api/v1/exposure/history/`
   - 9.4 `POST /api/v1/exposure/calculate-dose/` (Pure-Python Inhalation Calculator)
10. [Cross-Cutting Validation Rules & Error Code Directory](#10-cross-cutting-validation-rules--error-code-directory)

---

## 1. Global API Architecture & Protocols

### 1.1 HTTP Verbs, Headers & Status Codes
All REST interactions communicate over TLS 1.3. Payloads use standard UTF-8 encoded JSON format (with multipart/form-data for image uploads). Timestamps follow ISO 8601 extended UTC format: `YYYY-MM-DDTHH:MM:SS.sssZ`.

#### Standard Request Headers
| Header | Value | Mandatory | Description |
|---|---|---|---|
| `Content-Type` | `application/json` | Yes (for POST, PUT, PATCH) | Identifies JSON payload format |
| `Accept` | `application/json` | Yes | Client expects JSON response |
| `Authorization` | `Bearer <access_token>` | Conditional | Mandatory for authenticated endpoints |
| `X-Request-ID` | `uuid4` string | Optional | Distributed tracing correlation ID |

#### Standard HTTP Status Codes
- `200 OK`: Request succeeded. Response body contains requested entity.
- `201 Created`: Entity successfully created. `Location` header provided when appropriate.
- `204 No Content`: Request succeeded with no entity to return (e.g. deletion, logout).
- `400 Bad Request`: Payload syntactically invalid or failed validation.
- `401 Unauthorized`: Missing or invalid Bearer token.
- `403 Forbidden`: Authenticated user lacks required RBAC permissions.
- `404 Not Found`: Target resource does not exist.
- `409 Conflict`: Unique constraint violation (e.g. duplicate username/email).
- `422 Unprocessable Entity`: Business logic validation failure (e.g. invalid H3 index, CPCB 3-pollutant breach).
- `429 Too Many Requests`: Client exceeded configured rate limit tier.
- `500 Internal Server Error`: Unhandled server exception.
- `503 Service Unavailable`: Temporary backend outage or maintenance.

---

### 1.2 Global Error Envelope Specification
BreatheWise strictly adheres to a uniform, structured error envelope across all DRF views and middleware exceptions. Naked Django exceptions or raw HTML error pages are completely intercepted by custom exception handlers (`core.exceptions.custom_exception_handler`).

#### Standard Error Envelope JSON Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "GlobalErrorEnvelope",
  "type": "object",
  "required": ["error"],
  "properties": {
    "error": {
      "type": "object",
      "required": ["code", "message", "details", "timestamp", "request_id"],
      "properties": {
        "code": {
          "type": "string",
          "enum": [
            "VALIDATION_ERROR",
            "AUTHENTICATION_FAILED",
            "TOKEN_EXPIRED",
            "PERMISSION_DENIED",
            "NOT_FOUND",
            "CONFLICT",
            "UNPROCESSABLE_ENTITY",
            "RATE_LIMIT_EXCEEDED",
            "INTERNAL_SERVER_ERROR",
            "SERVICE_UNAVAILABLE"
          ],
          "description": "Machine-readable standard error classification"
        },
        "message": {
          "type": "string",
          "description": "High-level human-readable error summary"
        },
        "details": {
          "type": "object",
          "description": "Field-level validation error maps or contextual diagnostic key-value pairs"
        },
        "timestamp": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 UTC timestamp of error generation"
        },
        "request_id": {
          "type": "string",
          "description": "Unique correlation identifier for log auditing"
        }
      }
    }
  }
}
```

#### Error Envelope Example
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted payload failed input validation.",
    "details": {
      "h3_index": [
        "The string '880326442ffffff' is not a valid Uber H3 Resolution 8 index."
      ],
      "duration_minutes": [
        "Duration must be an integer between 1 and 1440 minutes."
      ]
    },
    "timestamp": "2026-11-22T09:12:45.812Z",
    "request_id": "req_01HJ9V5P83KZX8M3YQQ0N41E"
  }
}
```

---

### 1.3 SimpleJWT Authentication Lifecycle & Bearer Token Protocol
BreatheWise utilizes `djangorestframework-simplejwt` with asymmetric token rotation and blacklisting.

#### Token Lifecycle Parameters
- **Access Token**:
  - Algorithm: `HS256` (or `RS256` in enterprise cluster).
  - Lifetime: `15 minutes`.
  - Storage: In-memory state in frontend React client.
  - Claims: `user_id` (UUID), `username`, `email`, `role`, `token_type: "access"`, `exp`, `iat`, `jti`.
- **Refresh Token**:
  - Lifetime: `7 days`.
  - Storage: HTTP-Only Secure SameSite Cookie or encrypted local storage.
  - Claims: `user_id`, `token_type: "refresh"`, `exp`, `iat`, `jti`.
  - Rotation: `ROTATE_REFRESH_TOKENS = True` (Issuing a new refresh token on every refresh call).
  - Blacklisting: `BLACKLIST_AFTER_ROTATION = True` (Old refresh tokens are written to Redis/PostgreSQL blacklist table).

```
[ Client ]                        [ API Gateway / Django ]               [ Redis Token Blacklist ]
    │                                        │                                       │
    │── POST /api/v1/auth/login/ ───────────>│                                       │
    │<── 200 OK (access_token, refresh_token)│                                       │
    │                                        │                                       │
    │── GET /api/v1/users/me/ ──────────────>│                                       │
    │   Authorization: Bearer <access>       │ (Validates JWT signature & expiry)    │
    │<── 200 OK (User Data) ─────────────────│                                       │
    │                                        │                                       │
    │ (15 mins elapse -> access token exp)   │                                       │
    │── GET /api/v1/air-quality/latest/ ────>│                                       │
    │<── 401 Unauthorized (TOKEN_EXPIRED) ───│                                       │
    │                                        │                                       │
    │── POST /api/v1/auth/refresh/ ─────────>│── Check if refresh token blacklisted ─>│
    │   {"refresh": "<refresh_token>"}       │<── Not blacklisted ───────────────────│
    │                                        │── Blacklist old refresh token ───────>│
    │<── 200 OK (new access, new refresh) ───│                                       │
```

---

### 1.4 Rate Limiting & Throttling Tiers
DRF Scoped and User Rate Throttling protects API capacity and prevents Denial of Service (DoS):

| Throttle Tier | Target Endpoints | Rate Limit | Scope Identifier |
|---|---|---|---|
| **AnonRateThrottle** | Public unauthenticated reads | 100 requests / hour | Client Remote IP |
| **UserRateThrottle** | Standard authenticated user queries | 1,000 requests / hour | `user.id` |
| **HighThroughputThrottle**| Map spatial grid and tile polling | 3,000 requests / hour | `user.id` or IP |
| **SensitiveThrottle** | Registration, Login, Token Refresh | 10 requests / minute | Client Remote IP |
| **AlertTestThrottle** | Test notification dispatch | 3 requests / hour | `user.id` |
| **AssistantThrottle** | AI chat conversation completions | 20 requests / hour | `user.id` |

When a throttle threshold is reached, the server returns HTTP `429 Too Many Requests` with header `Retry-After: <seconds>`:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Request rate limit exceeded. Please retry after 42 seconds.",
    "details": {
      "retry_after_seconds": 42
    },
    "timestamp": "2026-11-22T09:14:02.100Z",
    "request_id": "req_01HJ9V7R1M6G8V4B3K1P8Y9X"
  }
}
```

---

### 1.5 Pagination & Ordering Conventions
Endpoints returning collections support cursor-based or standard limit-offset pagination:
- Default page size: `20` records.
- Maximum page size: `100` records.
- Standard pagination query parameters:
  - `page`: Integer (default: 1)
  - `page_size`: Integer (default: 20, max: 100)
- Standard paginated envelope:
```json
{
  "count": 142,
  "next": "https://api.breathewise.in/api/v1/reports/?page=3&page_size=20",
  "previous": "https://api.breathewise.in/api/v1/reports/?page=1&page_size=20",
  "results": []
}
```

---

## 2. App 1: `accounts` (Identity, Authentication & Profiles)

### 2.1 `POST /api/v1/auth/register/`
Registers a new user account and automatically initializes an associated default `UserProfile`.

- **HTTP Method**: `POST`
- **Authentication**: `AllowAny`
- **Rate Limit**: SensitiveThrottle (10 req/min)
- **Request Headers**: `Content-Type: application/json`

#### Request JSON Schema
```json
{
  "type": "object",
  "required": ["username", "email", "password", "confirm_password"],
  "properties": {
    "username": {"type": "string", "minLength": 3, "maxLength": 150, "pattern": "^[a-zA-Z0-9_.-]+$"},
    "email": {"type": "string", "format": "email", "maxLength": 254},
    "password": {"type": "string", "minLength": 8, "maxLength": 128},
    "confirm_password": {"type": "string", "minLength": 8, "maxLength": 128},
    "first_name": {"type": "string", "maxLength": 150},
    "last_name": {"type": "string", "maxLength": 150},
    "role": {
      "type": "string",
      "enum": ["citizen", "sensitive_individual", "outdoor_enthusiast", "official", "admin"],
      "default": "citizen"
    }
  }
}
```

#### Request Example
```json
{
  "username": "priya_chd",
  "email": "priya.verma@example.com",
  "password": "SecurePassword@2026",
  "confirm_password": "SecurePassword@2026",
  "first_name": "Priya",
  "last_name": "Verma",
  "role": "citizen"
}
```

#### Response: `201 Created`
```json
{
  "user": {
    "id": "e0b5f12a-4c8d-4a12-9c32-b7e192a014e5",
    "username": "priya_chd",
    "email": "priya.verma@example.com",
    "first_name": "Priya",
    "last_name": "Verma",
    "role": "citizen",
    "is_active": true,
    "date_joined": "2026-11-22T09:15:00.000Z"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZTBiNWYxMmEtNGM4ZC00YTEyLTljMzItYjdlMTkyYTAxNGU1Iiwicm9sZSI6ImNpdGl6ZW4iLCJleHAiOjE3NjM4MDM4MDB9.sample_signature_access",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZTBiNWYxMmEtNGM4ZC00YTEyLTljMzItYjdlMTkyYTAxNGU1IiwidG9rZW5fdHlwZSI6InJlZnJlc2giLCJleHAiOjE3NjQ0MDg2MDB9.sample_signature_refresh"
  }
}
```

#### Error Responses
- `400 Bad Request`: Password mismatch or weak password.
- `409 Conflict`: Username or email already registered (`code: "USER_ALREADY_EXISTS"`).
- `429 Too Many Requests`: Rate limit exceeded.

---

### 2.2 `POST /api/v1/auth/login/`
Authenticates a user via email or username and issues JWT key pair.

- **HTTP Method**: `POST`
- **Authentication**: `AllowAny`
- **Rate Limit**: SensitiveThrottle (10 req/min)

#### Request JSON Schema
```json
{
  "type": "object",
  "required": ["username_or_email", "password"],
  "properties": {
    "username_or_email": {"type": "string"},
    "password": {"type": "string"}
  }
}
```

#### Request Example
```json
{
  "username_or_email": "priya.verma@example.com",
  "password": "SecurePassword@2026"
}
```

#### Response: `200 OK`
```json
{
  "user": {
    "id": "e0b5f12a-4c8d-4a12-9c32-b7e192a014e5",
    "username": "priya_chd",
    "email": "priya.verma@example.com",
    "first_name": "Priya",
    "last_name": "Verma",
    "role": "citizen",
    "is_staff": false
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses
- `401 Unauthorized`: Invalid credentials (`code: "INVALID_CREDENTIALS"`).
- `403 Forbidden`: Account is inactive or banned (`code: "ACCOUNT_DISABLED"`).

---

### 2.3 `POST /api/v1/auth/refresh/`
Rotates the refresh token and returns a fresh access/refresh token pair.

- **HTTP Method**: `POST`
- **Authentication**: `AllowAny`
- **Request Example**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Response: `200 OK`**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_access_token...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.rotated_refresh_token..."
}
```
- **Error Responses**:
  - `401 Unauthorized`: Token invalid, expired, or already blacklisted (`code: "TOKEN_INVALID_OR_EXPIRED"`).

---

### 2.4 `POST /api/v1/auth/logout/`
Blacklists the provided refresh token, invalidating the session.

- **HTTP Method**: `POST`
- **Authentication**: `IsAuthenticated`
- **Request Example**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Response: `204 No Content`**
- **Error Responses**:
  - `400 Bad Request`: Token missing or malformed.
  - `401 Unauthorized`: Missing or invalid Bearer authorization header.

---

### 2.5 `GET /api/v1/users/me/`
Retrieves account identity metadata for the currently authenticated user.

- **HTTP Method**: `GET`
- **Authentication**: `IsAuthenticated`
- **Response: `200 OK`**:
```json
{
  "id": "e0b5f12a-4c8d-4a12-9c32-b7e192a014e5",
  "username": "priya_chd",
  "email": "priya.verma@example.com",
  "first_name": "Priya",
  "last_name": "Verma",
  "role": "citizen",
  "is_active": true,
  "is_staff": false,
  "date_joined": "2026-11-22T09:15:00.000Z"
}
```

---

### 2.6 `PATCH /api/v1/users/me/`
Updates account-level details (first name, last name, email).

- **HTTP Method**: `PATCH`
- **Authentication**: `IsAuthenticated`
- **Request Example**:
```json
{
  "first_name": "Priya",
  "last_name": "Sharma"
}
```
- **Response: `200 OK`**:
```json
{
  "id": "e0b5f12a-4c8d-4a12-9c32-b7e192a014e5",
  "username": "priya_chd",
  "email": "priya.verma@example.com",
  "first_name": "Priya",
  "last_name": "Sharma",
  "role": "citizen",
  "is_active": true,
  "is_staff": false,
  "date_joined": "2026-11-22T09:15:00.000Z"
}
```

---

### 2.7 `GET /api/v1/users/me/profile/`
Retrieves health sensitivity parameters, baseline activity tier, notification channel preferences, and daily PM2.5 intake targets for the authenticated user, matching `accounts_userprofile`.

> **Note on Spatial Anchors**: Bookmarked spatial anchors (such as Home, Work, Gym) are managed via the dedicated `/api/v1/locations/saved/` endpoint in accordance with the `locations_savedlocation` model (see Section 3.5).

- **HTTP Method**: `GET`
- **Authentication**: `IsAuthenticated`
- **Response: `200 OK`**:
```json
{
  "id": "fa21b980-60a1-42cb-99f2-29707248107c",
  "user_id": "e0b5f12a-4c8d-4a12-9c32-b7e192a014e5",
  "health_sensitivity": "asthma",
  "baseline_activity": "moderate",
  "notification_channels": {
    "email": true,
    "push": true,
    "in_app": true
  },
  "daily_dose_target_ug": 180.0,
  "created_at": "2026-11-22T09:15:00.000Z",
  "updated_at": "2026-11-22T09:15:00.000Z"
}
```

---

### 2.8 `PUT /api/v1/users/me/profile/` & 2.9 `PATCH /api/v1/users/me/profile/`
Updates physiological health sensitivity factors, baseline activity levels, daily target dose, and notification channel dispatch settings.

- **HTTP Method**: `PUT` (full replacement) / `PATCH` (partial update)
- **Authentication**: `IsAuthenticated`
- **Request JSON Schema**:
```json
{
  "type": "object",
  "properties": {
    "health_sensitivity": {
      "type": "string",
      "enum": ["normal", "asthma", "copd", "cardiovascular", "elderly", "child", "pregnant"]
    },
    "baseline_activity": {
      "type": "string",
      "enum": ["sedentary", "moderate", "active", "athlete"]
    },
    "notification_channels": {
      "type": "object",
      "properties": {
        "email": {"type": "boolean"},
        "push": {"type": "boolean"},
        "in_app": {"type": "boolean"}
      }
    },
    "daily_dose_target_ug": {
      "type": "number",
      "minimum": 10.0,
      "maximum": 1000.0
    }
  }
}
```
- **Request Example (`PATCH`)**:
```json
{
  "health_sensitivity": "asthma",
  "baseline_activity": "active",
  "notification_channels": {
    "email": true,
    "push": true,
    "in_app": false
  },
  "daily_dose_target_ug": 150.0
}
```
- **Response: `200 OK`**:
```json
{
  "id": "fa21b980-60a1-42cb-99f2-29707248107c",
  "user_id": "e0b5f12a-4c8d-4a12-9c32-b7e192a014e5",
  "health_sensitivity": "asthma",
  "baseline_activity": "active",
  "notification_channels": {
    "email": true,
    "push": true,
    "in_app": false
  },
  "daily_dose_target_ug": 150.0,
  "created_at": "2026-11-22T09:15:00.000Z",
  "updated_at": "2026-11-22T09:20:10.000Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid `health_sensitivity` or `baseline_activity` enum value, or invalid target dose.

---

## 3. App 2: `locations` (Stations, Sectors & Reverse Geocoding)

### 3.1 `GET /api/v1/locations/stations/`
Retrieves all official ambient air monitoring stations within the Chandigarh urban region.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Query Parameters**:
  - `is_active` (boolean, optional): Filter by operational status.
  - `operator` (string, optional): `CPCB`, `CPCC`, `IMD`, `PPCB`.
- **Response: `200 OK`**:
```json
{
  "count": 4,
  "results": [
    {
      "id": "a1000001-0000-0000-0000-000000000001",
      "station_code": "CHD_SEC22",
      "name": "Sector 22-B, Chandigarh",
      "latitude": 30.7383,
      "longitude": 76.7725,
      "elevation": 321.0,
      "operator": "CPCC",
      "data_source": "CPCB_CAAMS",
      "is_active": true,
      "h3_res8": "8803264427fffff",
      "installed_at": "2020-01-15T00:00:00.000Z"
    },
    {
      "id": "a1000001-0000-0000-0000-000000000002",
      "station_code": "CHD_SEC25",
      "name": "Panjab University, Sector 25, Chandigarh",
      "latitude": 30.7490,
      "longitude": 76.7580,
      "elevation": 325.0,
      "operator": "CPCC",
      "data_source": "CPCB_CAAMS",
      "is_active": true,
      "h3_res8": "8803264465fffff",
      "installed_at": "2021-06-10T00:00:00.000Z"
    },
    {
      "id": "a1000001-0000-0000-0000-000000000003",
      "station_code": "CHD_SEC53",
      "name": "Sector 53 (South), Chandigarh",
      "latitude": 30.7220,
      "longitude": 76.7380,
      "elevation": 318.0,
      "operator": "CPCC",
      "data_source": "CPCB_CAAMS",
      "is_active": true,
      "h3_res8": "8803264441fffff",
      "installed_at": "2022-03-01T00:00:00.000Z"
    },
    {
      "id": "a1000001-0000-0000-0000-000000000004",
      "station_code": "CHD_SEC39",
      "name": "IMD Observatory, Sector 39, Chandigarh",
      "latitude": 30.7280,
      "longitude": 76.7510,
      "elevation": 320.0,
      "operator": "IMD",
      "data_source": "CPCB_CAAMS",
      "is_active": true,
      "h3_res8": "8803264445fffff",
      "installed_at": "2019-11-20T00:00:00.000Z"
    }
  ]
}
```

---

### 3.2 `GET /api/v1/locations/stations/{id}/`
Retrieves detailed operational and sensor capabilities for a single monitoring station.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Path Parameter**: `id` (UUID or station code `CHD_SEC22`)
- **Response: `200 OK`**:
```json
{
  "id": "a1000001-0000-0000-0000-000000000001",
  "station_code": "CHD_SEC22",
  "name": "Sector 22-B, Chandigarh",
  "latitude": 30.7383,
  "longitude": 76.7725,
  "elevation": 321.0,
  "operator": "CPCC",
  "data_source": "CPCB_CAAMS",
  "is_active": true,
  "monitored_pollutants": ["PM2.5", "PM10", "NO2", "SO2", "CO", "O3", "NH3"],
  "last_telemetry_received": "2026-11-22T09:00:00.000Z",
  "h3_res8": "8803264427fffff"
}
```
- **Error Responses**:
  - `404 Not Found`: Station identifier does not exist.

---

### 3.3 `GET /api/v1/locations/sectors/`
Returns Chandigarh sectors with their administrative codes, bounding envelopes, and primary H3 cell identifiers.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Query Parameters**:
  - `search` (string, optional): Search by sector number or name (e.g. `17` or `Sector 17`).
  - `page` (integer, optional): Page number.
  - `page_size` (integer, optional): Items per page (default: 30).
- **Response: `200 OK`**:
```json
{
  "count": 60,
  "next": "https://api.breathewise.in/api/v1/locations/sectors/?page=2",
  "previous": null,
  "results": [
    {
      "id": "b1000001-0000-0000-0000-000000000017",
      "sector_code": "SEC_17",
      "name": "Sector 17 (City Centre)",
      "primary_h3_index": "8803264423fffff",
      "centroid": {
        "latitude": 30.7410,
        "longitude": 76.7820
      },
      "area_sq_km": 0.96
    }
  ]
}
```

---

### 3.4 `GET /api/v1/locations/sectors/{id}/`
Retrieves sector boundaries as GeoJSON Polygon for map overlay rendering.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Response: `200 OK`**:
```json
{
  "id": "b1000001-0000-0000-0000-000000000017",
  "sector_code": "SEC_17",
  "name": "Sector 17 (City Centre)",
  "primary_h3_index": "8803264423fffff",
  "geojson_boundary": {
    "type": "Polygon",
    "coordinates": [
      [
        [76.7760, 30.7380],
        [76.7880, 30.7380],
        [76.7880, 30.7450],
        [76.7760, 30.7450],
        [76.7760, 30.7380]
      ]
    ]
  }
}
```

---

### 3.5 `GET /api/v1/locations/saved/` & 3.6 `POST /api/v1/locations/saved/`
Manages a user's bookmarked spatial anchors (Home, Office, School, Gym). In compliance with Privacy-by-Design, only the H3 index is stored.

#### `GET /api/v1/locations/saved/`
- **HTTP Method**: `GET`
- **Authentication**: `IsAuthenticated`
- **Response: `200 OK`**:
```json
[
  {
    "id": "c1000001-0000-0000-0000-000000000001",
    "label": "Home",
    "h3_index": "8803264427fffff",
    "notification_enabled": true,
    "created_at": "2026-11-22T09:15:00.000Z"
  },
  {
    "id": "c1000001-0000-0000-0000-000000000002",
    "label": "Work",
    "h3_index": "8803264423fffff",
    "notification_enabled": true,
    "created_at": "2026-11-22T09:18:00.000Z"
  }
]
```

#### `POST /api/v1/locations/saved/`
- **HTTP Method**: `POST`
- **Authentication**: `IsAuthenticated`
- **Request JSON Schema**:
```json
{
  "type": "object",
  "required": ["label", "h3_index"],
  "properties": {
    "label": {"type": "string", "maxLength": 50},
    "h3_index": {"type": "string", "pattern": "^[89][0-9a-fA-F]{14}$"},
    "notification_enabled": {"type": "boolean", "default": true}
  }
}
```
- **Request Example**:
```json
{
  "label": "Gym",
  "h3_index": "8803264461fffff",
  "notification_enabled": true
}
```
- **Response: `201 Created`**:
```json
{
  "id": "c1000001-0000-0000-0000-000000000003",
  "label": "Gym",
  "h3_index": "8803264461fffff",
  "notification_enabled": true,
  "created_at": "2026-11-22T09:22:00.000Z"
}
```

---

### 3.7 `GET /api/v1/locations/saved/{id}/`, 3.8 `PUT /api/v1/locations/saved/{id}/`, 3.9 `PATCH`, 3.10 `DELETE`
Standard CRUD operations for a user's individual saved location.

- **HTTP Methods**: `GET`, `PUT`, `PATCH`, `DELETE`
- **Authentication**: `IsAuthenticated` (Guarantees user ownership via object-level permission `IsOwner`)
- **Response on DELETE**: `204 No Content`
- **Error Responses**:
  - `403 Forbidden`: Attempting to modify another user's saved location.
  - `404 Not Found`: Saved location does not exist.

---

### 3.11 `POST /api/v1/locations/reverse-geocode/` (with H3 Resolution & Redis Cache)
Resolves a latitude and longitude into an Uber H3 Resolution 8 cell index, identifies the enclosing Chandigarh sector, and caches the result in Redis with a 24-hour TTL. **Raw GPS coordinates are never persisted to the relational database or logs**.

- **HTTP Method**: `POST`
- **Authentication**: `AllowAny`
- **Request JSON Schema**:
```json
{
  "type": "object",
  "required": ["latitude", "longitude"],
  "properties": {
    "latitude": {"type": "number", "minimum": 30.60, "maximum": 30.90},
    "longitude": {"type": "number", "minimum": 76.60, "maximum": 77.00}
  }
}
```

#### Request Example
```json
{
  "latitude": 30.7383,
  "longitude": 76.7725
}
```

#### Response: `200 OK`
```json
{
  "h3_index": "8803264427fffff",
  "h3_resolution": 8,
  "sector": {
    "id": "b1000001-0000-0000-0000-000000000022",
    "sector_code": "SEC_22",
    "name": "Sector 22-B"
  },
  "city": "Chandigarh",
  "state": "Chandigarh UT",
  "country": "India",
  "cached": true
}
```

#### Error Responses
- `400 Bad Request`: Coordinates outside Chandigarh urban bounding box (30.60°N–30.90°N, 76.60°E–77.00°E).

---

## 4. App 3: `air_quality` (Readings, H3 Hex Grid & Telemetry)

### 4.1 `GET /api/v1/air-quality/latest/`
Returns the most recent air quality readings, primary pollutant, and CPCB NAQI score for a station, sector, or H3 cell.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Query Parameters**:
  - `station_code` (string, optional): E.g. `CHD_SEC22`.
  - `h3_index` (string, optional): Uber H3 Resolution 8 index.
  - `sector_code` (string, optional): E.g. `SEC_17`.
- **Response: `200 OK`**:
```json
{
  "id": "d1000001-0000-0000-0000-000000000099",
  "timestamp": "2026-11-22T09:00:00.000Z",
  "station": {
    "station_code": "CHD_SEC22",
    "name": "Sector 22-B, Chandigarh"
  },
  "h3_index": "8803264427fffff",
  "naqi": 182,
  "category": "MODERATE",
  "category_color": "#FFFF00",
  "primary_pollutant": "PM2.5",
  "pollutants": {
    "pm25": {"concentration": 84.5, "unit": "µg/m³", "sub_index": 182, "naaqs_limit_24h": 60.0},
    "pm10": {"concentration": 142.0, "unit": "µg/m³", "sub_index": 128, "naaqs_limit_24h": 100.0},
    "no2": {"concentration": 42.1, "unit": "µg/m³", "sub_index": 53, "naaqs_limit_24h": 80.0},
    "so2": {"concentration": 14.8, "unit": "µg/m³", "sub_index": 19, "naaqs_limit_24h": 80.0},
    "co": {"concentration": 1.45, "unit": "mg/m³", "sub_index": 73, "naaqs_limit_8h": 2.0},
    "ozone": {"concentration": 48.0, "unit": "µg/m³", "sub_index": 48, "naaqs_limit_8h": 100.0},
    "nh3": {"concentration": 18.2, "unit": "µg/m³", "sub_index": 9, "naaqs_limit_24h": 400.0}
  },
  "meteorology": {
    "temperature_c": 22.4,
    "relative_humidity": 58.0,
    "wind_speed_kmh": 6.8,
    "wind_direction_deg": 315,
    "atmospheric_pressure_hpa": 1014.2
  },
  "data_quality": {
    "is_interpolated": false,
    "is_simulated": true,
    "simulation_label": "Deterministic Diurnal Mock Telemetry (Phase 1)"
  }
}
```

---

### 4.2 `GET /api/v1/air-quality/history/`
Returns historical time-series air quality telemetry aggregated by hourly, 6-hourly, or daily intervals.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Query Parameters**:
  - `station_code` (string, optional): Specific station filter.
  - `h3_index` (string, optional): Specific H3 hex filter.
  - `start_date` (ISO date, required): E.g. `2026-11-15T00:00:00Z`.
  - `end_date` (ISO date, required): E.g. `2026-11-22T00:00:00Z`.
  - `interval` (string, optional): `1h` (default), `6h`, `24h`.
  - `pollutant` (string, optional): `pm25`, `pm10`, `naqi`, `all` (default: `all`).
- **Response: `200 OK`**:
```json
{
  "start_date": "2026-11-15T00:00:00Z",
  "end_date": "2026-11-22T00:00:00Z",
  "interval": "24h",
  "count": 7,
  "series": [
    {
      "timestamp": "2026-11-15T00:00:00Z",
      "naqi": 165,
      "category": "MODERATE",
      "pm25_avg": 78.4,
      "pm10_avg": 132.1,
      "primary_pollutant": "PM2.5"
    },
    {
      "timestamp": "2026-11-16T00:00:00Z",
      "naqi": 218,
      "category": "POOR",
      "pm25_avg": 98.2,
      "pm10_avg": 164.5,
      "primary_pollutant": "PM2.5"
    }
  ]
}
```

---

### 4.3 `GET /api/v1/air-quality/h3/{h3_index}/`
Returns current interpolated atmospheric metrics for a specific Uber H3 cell index computed via Inverse Distance Weighting (IDW) against nearby active stations.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Path Parameter**: `h3_index` (15-character hex string)
- **Response: `200 OK`**:
```json
{
  "h3_index": "8803264423fffff",
  "resolution": 8,
  "timestamp": "2026-11-22T09:00:00.000Z",
  "naqi": 178,
  "category": "MODERATE",
  "category_color": "#FFFF00",
  "primary_pollutant": "PM2.5",
  "pm25": 82.3,
  "pm10": 138.4,
  "no2": 39.8,
  "co": 1.38,
  "is_interpolated": true,
  "interpolation_method": "Inverse Distance Weighting (p=2.0)",
  "reference_stations": [
    {"station_code": "CHD_SEC22", "distance_km": 1.15, "weight": 0.58},
    {"station_code": "CHD_SEC25", "distance_km": 2.42, "weight": 0.42}
  ]
}
```

---

### 4.4 `GET /api/v1/air-quality/grid/` (Interpolated Chandigarh H3 Grid)
Returns a GeoJSON FeatureCollection of hexagonal polygons spanning the Chandigarh bounding box (`30.65°N`–`30.80°N`, `76.70°E`–`76.85°E`) with interpolated NAQI, PM2.5, and PM10 metrics. Optimized with Redis caching (5-minute TTL) and ETag HTTP caching.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Throttle Tier**: HighThroughputThrottle (3,000 req/hr)
- **Query Parameters**:
  - `metric` (string, optional): `naqi` (default), `pm25`, `pm10`, `no2`.
  - `resolution` (integer, optional): `8` (default, ~0.737 km²) or `7` (~5.16 km²).
- **Response: `200 OK`**:
```json
{
  "type": "FeatureCollection",
  "properties": {
    "generated_at": "2026-11-22T09:00:00.000Z",
    "bounding_box": [30.6500, 76.7000, 30.8000, 76.8500],
    "resolution": 8,
    "cell_count": 148,
    "metric": "naqi"
  },
  "features": [
    {
      "type": "Feature",
      "id": "8803264427fffff",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [76.7720, 30.7380],
            [76.7760, 30.7410],
            [76.7800, 30.7390],
            [76.7800, 30.7340],
            [76.7760, 30.7310],
            [76.7720, 30.7330],
            [76.7720, 30.7380]
          ]
        ]
      },
      "properties": {
        "h3_index": "8803264427fffff",
        "naqi": 182,
        "category": "MODERATE",
        "color": "#FFFF00",
        "pm25": 84.5,
        "pm10": 142.0,
        "primary_pollutant": "PM2.5"
      }
    }
  ]
}
```

---

## 5. App 4: `analytics` (Trends, Diurnal Dynamics & NAAQS Compliance)

### 5.1 `GET /api/v1/analytics/trends/`
Calculates rolling historical trends and rate-of-change indicators across all criteria pollutants.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Query Parameters**:
  - `timeframe` (string, optional): `7d` (default), `30d`, `90d`, `1y`.
  - `station_code` (string, optional): Specific station filter.
- **Response: `200 OK`**:
```json
{
  "timeframe": "7d",
  "generated_at": "2026-11-22T09:00:00.000Z",
  "mean_naqi": 174.5,
  "trend_direction": "DETERIORATING",
  "rate_of_change_percent": 14.2,
  "dominant_pollutant": "PM2.5",
  "pollutants": {
    "pm25": {"mean": 81.2, "min": 42.0, "max": 148.5, "exceedance_days": 6},
    "pm10": {"mean": 139.0, "min": 78.0, "max": 230.1, "exceedance_days": 5},
    "no2": {"mean": 38.4, "min": 21.0, "max": 62.0, "exceedance_days": 0}
  }
}
```

---

### 5.2 `GET /api/v1/analytics/diurnal/`
Computes the 24-hour diurnal atmospheric cycle (00:00 to 23:00 IST) averaged over a specified window to reveal nocturnal inversion spikes and afternoon convective clearance.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Query Parameters**:
  - `days` (integer, optional): Historical lookback in days (default: `14`, max: `90`).
  - `pollutant` (string, optional): `pm25` (default), `pm10`, `no2`, `ozone`.
- **Response: `200 OK`**:
```json
{
  "pollutant": "pm25",
  "unit": "µg/m³",
  "lookback_days": 14,
  "diurnal_profile": [
    {"hour_ist": 0, "mean_concentration": 112.4, "p25": 95.0, "p75": 130.0},
    {"hour_ist": 4, "mean_concentration": 138.8, "p25": 118.0, "p75": 162.0},
    {"hour_ist": 8, "mean_concentration": 164.2, "p25": 142.0, "p75": 190.0},
    {"hour_ist": 12, "mean_concentration": 82.5, "p25": 68.0, "p75": 98.0},
    {"hour_ist": 16, "mean_concentration": 64.0, "p25": 51.0, "p75": 78.0},
    {"hour_ist": 20, "mean_concentration": 145.1, "p25": 125.0, "p75": 172.0}
  ],
  "peak_hour_ist": 8,
  "cleanest_hour_ist": 16,
  "diurnal_amplitude": 100.2
}
```

---

### 5.3 `GET /api/v1/analytics/naaqs-compliance/`
Calculates regulatory compliance metrics against National Ambient Air Quality Standards (NAAQS 2009 notification).

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Query Parameters**:
  - `year` (integer, required): E.g. `2026`.
  - `station_code` (string, optional): Station filter.
- **Response: `200 OK`**:
```json
{
  "year": 2026,
  "station": "CHD_SEC22",
  "monitoring_days_total": 326,
  "compliance_summary": {
    "pm25": {
      "standard_24h": 60.0,
      "annual_mean": 76.4,
      "annual_limit": 40.0,
      "annual_status": "NON_COMPLIANT",
      "days_exceeded": 142,
      "compliance_rate_percent": 56.4
    },
    "pm10": {
      "standard_24h": 100.0,
      "annual_mean": 132.8,
      "annual_limit": 60.0,
      "annual_status": "NON_COMPLIANT",
      "days_exceeded": 168,
      "compliance_rate_percent": 48.5
    },
    "no2": {
      "standard_24h": 80.0,
      "annual_mean": 34.2,
      "annual_limit": 40.0,
      "annual_status": "COMPLIANT",
      "days_exceeded": 2,
      "compliance_rate_percent": 99.4
    }
  }
}
```

---

### 5.4 `GET /api/v1/analytics/summary/`
High-level city-wide executive snapshot summarizing all monitoring stations, average NAQI, and alert status for municipal dashboards and home screen widgets.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Response: `200 OK`**:
```json
{
  "city": "Chandigarh",
  "timestamp": "2026-11-22T09:00:00.000Z",
  "city_wide_naqi": 178,
  "overall_category": "MODERATE",
  "primary_driver": "PM2.5",
  "active_stations_count": 4,
  "total_stations_count": 4,
  "cleanest_sector": {"sector_code": "SEC_25", "naqi": 154},
  "most_polluted_sector": {"sector_code": "SEC_53", "naqi": 210},
  "active_hazards_count": 3,
  "weather_snapshot": {
    "temperature_c": 22.4,
    "relative_humidity": 58,
    "wind_speed_kmh": 6.8,
    "wind_direction": "NW"
  }
}
```

---

## 6. App 5: `forecasting` & `assistant` (Predictive Models & Advisory)

### 6.1 `GET /api/v1/forecast/hourly/`
Returns hourly projected NAQI and particulate concentrations for the next 24h, 48h, or 72h with statistical confidence bounds ($CI_{low}, CI_{high}$).

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Query Parameters**:
  - `station_code` (string, optional): Specific station projection.
  - `h3_index` (string, optional): Spatial hex projection.
  - `hours` (integer, optional): Projection horizon: `24`, `48`, or `72` (default: `72`).
- **Response: `200 OK`**:
```json
{
  "generated_at": "2026-11-22T09:00:00.000Z",
  "model_version": "v1.2-ensemble-diurnal",
  "projection_hours": 72,
  "forecast": [
    {
      "target_timestamp": "2026-11-22T10:00:00.000Z",
      "hours_ahead": 1,
      "predicted_naqi": 185,
      "predicted_category": "MODERATE",
      "confidence_interval_low": 170,
      "confidence_interval_high": 200,
      "predicted_pm25": 86.0,
      "predicted_pm10": 145.0,
      "weather_conditions": "Partly Cloudy"
    },
    {
      "target_timestamp": "2026-11-22T11:00:00.000Z",
      "hours_ahead": 2,
      "predicted_naqi": 172,
      "predicted_category": "MODERATE",
      "confidence_interval_low": 155,
      "confidence_interval_high": 190,
      "predicted_pm25": 79.5,
      "predicted_pm10": 136.0,
      "weather_conditions": "Sunny"
    }
  ]
}
```

---

### 6.2 `GET /api/v1/forecast/daily/`
Provides a 7-day multi-day outlook summarizing expected daily average NAQI categories and weather regimes.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Response: `200 OK`**:
```json
{
  "generated_at": "2026-11-22T09:00:00.000Z",
  "daily_projections": [
    {
      "date": "2026-11-22",
      "predicted_naqi": 180,
      "category": "MODERATE",
      "color": "#FFFF00",
      "max_pm25": 115.0,
      "min_pm25": 62.0,
      "advisory_headline": "Moderate air quality. Limit prolonged outdoor exertion during evening hours."
    },
    {
      "date": "2026-11-23",
      "predicted_naqi": 225,
      "category": "POOR",
      "color": "#FF9900",
      "max_pm25": 142.0,
      "min_pm25": 85.0,
      "advisory_headline": "Stagnation anticipated. Sensitive individuals should wear N95 masks outdoors."
    }
  ]
}
```

---

### 6.3 `GET /api/v1/assistant/conversations/` & 6.4 `POST /api/v1/assistant/conversations/`
Manages AI advisory chat conversations for authenticated users.

#### `GET /api/v1/assistant/conversations/`
- **HTTP Method**: `GET`
- **Authentication**: `IsAuthenticated`
- **Response: `200 OK`**:
```json
[
  {
    "id": "e1000001-0000-0000-0000-000000000001",
    "title": "Morning Jogging Advice in Sector 17",
    "created_at": "2026-11-21T18:30:00.000Z",
    "updated_at": "2026-11-21T18:32:15.000Z",
    "message_count": 4
  }
]
```

#### `POST /api/v1/assistant/conversations/`
- **HTTP Method**: `POST`
- **Authentication**: `IsAuthenticated`
- **Request Example**:
```json
{
  "title": "Asthma precautions for Sukhna Lake walk"
}
```
- **Response: `201 Created`**: Returns new conversation object with UUID.

---

### 6.5 `GET /api/v1/assistant/conversations/{id}/messages/`
Retrieves chat history for a specific conversation.

- **HTTP Method**: `GET`
- **Authentication**: `IsAuthenticated` (Enforces conversation ownership)
- **Response: `200 OK`**:
```json
[
  {
    "id": "f1000001-0000-0000-0000-000000000001",
    "sender": "USER",
    "content": "Can I go for a 5 km run around Sukhna Lake tomorrow at 6:30 AM?",
    "created_at": "2026-11-21T18:30:00.000Z"
  },
  {
    "id": "f1000001-0000-0000-0000-000000000002",
    "sender": "ASSISTANT",
    "content": "Tomorrow morning at 6:30 AM, projected PM2.5 at Sukhna Lake is 145 µg/m³ (CPCB NAQI ~315, Very Poor). Given your profile (Asthma), intense outdoor aerobic activity at this hour carries high risk of bronchial irritation. We strongly recommend shifting your workout indoors or delaying outdoor exercise until 3:00 PM when solar convection improves air quality to Moderate (NAQI ~160).",
    "grounding_data": {
      "target_hour": "06:30 IST",
      "projected_naqi": 315,
      "category": "VERY_POOR",
      "pm25": 145.0,
      "user_health_profile": "ASTHMA"
    },
    "created_at": "2026-11-21T18:30:02.500Z"
  }
]
```

---

### 6.6 `POST /api/v1/assistant/conversations/{id}/messages/`
Submits a user query to the guardrailed advisory assistant. The engine injects deterministic CPCB calculations, current telemetry, and user health profile into the LLM context prompt and guarantees deterministic numerical grounding.

- **HTTP Method**: `POST`
- **Authentication**: `IsAuthenticated`
- **Throttle Tier**: AssistantThrottle (20 req/hour)
- **Request Example**:
```json
{
  "content": "What is the best time for my elderly father to take a walk today?",
  "h3_index": "8803264427fffff"
}
```
- **Response: `201 Created`**: Returns assistant response message object.
- **Error Responses**:
  - `429 Too Many Requests`: Chat rate limit reached.

---

## 7. App 6: `alerts` (Notification Preferences & Active Dispatch)

### 7.1 `GET /api/v1/alerts/preferences/` & 7.2 `PUT` / 7.3 `PATCH`
Configures notification thresholds, delivery channels, active hours, and category jump subscriptions matching `alerts_alertpreference`.

#### `GET /api/v1/alerts/preferences/`
- **HTTP Method**: `GET`
- **Authentication**: `IsAuthenticated`
- **Response: `200 OK`**:
```json
{
  "id": "71000001-0000-0000-0000-000000000001",
  "user_id": "e0b5f12a-4c8d-4a12-9c32-b7e192a014e5",
  "saved_location_id": "c1000001-0000-0000-0000-000000000001",
  "h3_index": "8803264427fffff",
  "naqi_threshold": 200,
  "notify_on_category_jump": true,
  "channel_email": true,
  "channel_push": true,
  "channel_in_app": true,
  "active_hours_start": "06:00:00",
  "active_hours_end": "22:00:00",
  "is_active": true
}
```

#### `PATCH /api/v1/alerts/preferences/`
- **HTTP Method**: `PATCH`
- **Authentication**: `IsAuthenticated`
- **Request JSON Schema**:
```json
{
  "type": "object",
  "properties": {
    "saved_location_id": {"type": ["string", "null"], "format": "uuid"},
    "h3_index": {"type": ["string", "null"], "pattern": "^[89][0-9a-fA-F]{14}$"},
    "naqi_threshold": {"type": "integer", "minimum": 0, "maximum": 500},
    "notify_on_category_jump": {"type": "boolean"},
    "channel_email": {"type": "boolean"},
    "channel_push": {"type": "boolean"},
    "channel_in_app": {"type": "boolean"},
    "active_hours_start": {"type": "string", "pattern": "^\\d{2}:\\d{2}:\\d{2}$"},
    "active_hours_end": {"type": "string", "pattern": "^\\d{2}:\\d{2}:\\d{2}$"},
    "is_active": {"type": "boolean"}
  }
}
```
- **Request Example**:
```json
{
  "naqi_threshold": 150,
  "notify_on_category_jump": true,
  "channel_email": false,
  "channel_push": true,
  "channel_in_app": true,
  "active_hours_start": "07:00:00",
  "active_hours_end": "23:00:00",
  "is_active": true
}
```
- **Response: `200 OK`**:
```json
{
  "id": "71000001-0000-0000-0000-000000000001",
  "user_id": "e0b5f12a-4c8d-4a12-9c32-b7e192a014e5",
  "saved_location_id": "c1000001-0000-0000-0000-000000000001",
  "h3_index": "8803264427fffff",
  "naqi_threshold": 150,
  "notify_on_category_jump": true,
  "channel_email": false,
  "channel_push": true,
  "channel_in_app": true,
  "active_hours_start": "07:00:00",
  "active_hours_end": "23:00:00",
  "is_active": true
}
```

---

### 7.4 `GET /api/v1/alerts/active/`
Retrieves unread and recent alert dispatches for the authenticated user, matching `alerts_alert`.

- **HTTP Method**: `GET`
- **Authentication**: `IsAuthenticated`
- **Response: `200 OK`**:
```json
{
  "unread_count": 1,
  "results": [
    {
      "id": "72000001-0000-0000-0000-000000000001",
      "h3_index": "8803264427fffff",
      "severity": "warning",
      "message": "Air quality at Sector 22-B has deteriorated to Poor (NAQI 218). Sensitive groups should reduce prolonged outdoor exertion.",
      "naqi_recorded": 218,
      "sent_at": "2026-11-22T08:30:00.000Z",
      "read_at": null
    }
  ]
}
```

---

### 7.5 `POST /api/v1/alerts/{id}/read/`
Marks a specific alert notification as read.

- **HTTP Method**: `POST`
- **Authentication**: `IsAuthenticated`
- **Response: `200 OK`**:
```json
{
  "id": "72000001-0000-0000-0000-000000000001",
  "read_at": "2026-11-22T09:22:00.000Z"
}
```

---

### 7.6 `POST /api/v1/alerts/test/`
Dispatches an immediate mock notification across the user's selected delivery channel to verify pipeline connectivity.

- **HTTP Method**: `POST`
- **Authentication**: `IsAuthenticated`
- **Throttle Tier**: AlertTestThrottle (3 req/hour)
- **Response: `200 OK`**:
```json
{
  "status": "DISPATCHED",
  "channel": "PUSH",
  "target": "fcm_token_device_abc123",
  "timestamp": "2026-11-22T09:22:15.000Z",
  "message": "[Test Alert] BreatheWise notification pipeline verified successfully."
}
```

---

## 8. App 7: `reports` (Citizen Hazard Incidents & Moderation)

### 8.1 `GET /api/v1/reports/`
Returns crowdsourced pollution incidents with optional spatial and status filters matching `reports_pollutionreport`.

- **HTTP Method**: `GET`
- **Authentication**: `AllowAny`
- **Query Parameters**:
  - `status` (string, optional): Filter by `submitted`, `under_review`, `verified`, `resolved`, `rejected` (default: `verified` for public/citizens, all for municipal officials).
  - `category` (string, optional): Filter by `smoke`, `garbage`, `construction`, `industrial`, `vehicular`, `other`.
  - `h3_index` (string, optional): Filter by local hex.
- **Response: `200 OK`**:
```json
{
  "count": 12,
  "results": [
    {
      "id": "81000001-0000-0000-0000-000000000001",
      "author_username": "priya_chd",
      "category": "garbage",
      "description": "Open leaf and plastic burning near Sector 22 park edge creating thick smoke.",
      "h3_index": "8803264427fffff",
      "status": "verified",
      "upvotes_count": 8,
      "images": [
        {
          "id": "82000001-0000-0000-0000-000000000001",
          "sanitized_image_path": "https://media.breathewise.in/reports/sanitized_82000001.webp",
          "exif_stripped_verification": true,
          "file_size_bytes": 241908,
          "mime_type": "image/webp",
          "created_at": "2026-11-22T08:14:30.000Z"
        }
      ],
      "created_at": "2026-11-22T08:15:00.000Z",
      "resolved_at": null
    }
  ]
}
```

---

### 8.2 `POST /api/v1/reports/`
Submits a new crowdsourced pollution incident. Enforces Privacy-by-Design by requiring H3 Resolution 8 index rather than raw GPS coordinates, and links pre-uploaded sanitized images.

- **HTTP Method**: `POST`
- **Authentication**: `IsAuthenticated`
- **Request JSON Schema**:
```json
{
  "type": "object",
  "required": ["category", "h3_index", "description"],
  "properties": {
    "category": {
      "type": "string",
      "enum": ["smoke", "garbage", "construction", "industrial", "vehicular", "other"]
    },
    "h3_index": {"type": "string", "pattern": "^[89][0-9a-fA-F]{14}$"},
    "description": {"type": "string", "maxLength": 1000},
    "image_ids": {
      "type": "array",
      "items": {"type": "string", "format": "uuid"},
      "description": "Pre-uploaded ReportImage UUIDs to attach to this report"
    }
  }
}
```

#### Request Example
```json
{
  "category": "garbage",
  "h3_index": "8803264427fffff",
  "description": "Open leaf and plastic burning near Sector 22 park edge creating thick smoke.",
  "image_ids": ["82000001-0000-0000-0000-000000000001"]
}
```

#### Response: `201 Created`
```json
{
  "id": "81000001-0000-0000-0000-000000000001",
  "category": "garbage",
  "h3_index": "8803264427fffff",
  "description": "Open leaf and plastic burning near Sector 22 park edge creating thick smoke.",
  "status": "submitted",
  "upvotes_count": 0,
  "created_at": "2026-11-22T09:25:00.000Z",
  "message": "Report submitted successfully and queued for verification."
}
```

---

### 8.3 `GET /api/v1/reports/{id}/`, 8.4 `PATCH`, 8.5 `DELETE`
Retrieval, status update, or removal of a report. Modifying status is restricted to Municipal Officers (`role: "official"` or `is_staff=True`).

- **HTTP Method**: `GET`, `PATCH`, `DELETE`
- **Authentication**: `AllowAny` (for GET), `IsAuthenticated` (for author edits / admin moderation)
- **Error Responses**:
  - `403 Forbidden`: Citizen attempting to change report status.

---

### 8.6 `POST /api/v1/reports/{id}/upvote/`
Increments citizen endorsement for a report. Each authenticated user may upvote a report once (guaranteed by unique constraint).

- **HTTP Method**: `POST`
- **Authentication**: `IsAuthenticated`
- **Response: `200 OK`**:
```json
{
  "report_id": "81000001-0000-0000-0000-000000000001",
  "upvotes_count": 9,
  "user_has_upvoted": true
}
```

---

### 8.7 `POST /api/v1/reports/upload-image/` (with EXIF Stripping Gate & Pre-Upload Lifecycle)
Uploads an image attachment for a report as part of the two-phase report submission process.

- **Standalone Image Pre-Upload Lifecycle**: Ingests multipart image binary, strips EXIF metadata (GPS latitude/longitude, camera model, timestamp, altitude) using Pillow, converts image to WebP format, and persists a `reports_reportimage` database row with `report_id = NULL` and `exif_stripped_verification = True`.
- Returns the assigned `id` (UUID).
- When the citizen subsequently calls `POST /api/v1/reports/` with `"image_ids": ["82000001-..."]`, the backend atomically updates `report_id = report.id`, linking the evidence to the submitted incident.

- **HTTP Method**: `POST`
- **Authentication**: `IsAuthenticated`
- **Request Format**: `multipart/form-data`
  - Field `image`: Binary file (JPEG, PNG, WebP; max 10 MB).
- **Response: `201 Created`**:
```json
{
  "id": "82000001-0000-0000-0000-000000000001",
  "report_id": null,
  "sanitized_image_path": "https://media.breathewise.in/reports/sanitized_82000001.webp",
  "exif_stripped_verification": true,
  "file_size_bytes": 241908,
  "mime_type": "image/webp",
  "created_at": "2026-11-22T09:24:00.000Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Unsupported file format or file size exceeding 10 MB.

---

## 9. App 8: `exposure` (Physiological Inhalation Dose & Activity Tracking)

### 9.1 `POST /api/v1/exposure/log/`
Logs a physical activity episode, queries the ambient PM2.5 concentration at the activity's H3 cell, and computes the physiological inhalation dose ($\text{Dose} = C \times V_E \times t \times (1 - \eta)$) and cigarette equivalence, matching `exposure_exposurerecord`.

- **HTTP Method**: `POST`
- **Authentication**: `IsAuthenticated`
- **Request JSON Schema**:
```json
{
  "type": "object",
  "required": ["h3_index", "activity_type", "duration_minutes"],
  "properties": {
    "h3_index": {"type": "string", "pattern": "^[89][0-9a-fA-F]{14}$"},
    "activity_type": {
      "type": "string",
      "enum": ["indoor_rest", "indoor_active", "walking", "running_cycling", "commuting_transit"]
    },
    "duration_minutes": {"type": "integer", "minimum": 1, "maximum": 1440},
    "mask_type": {
      "type": "string",
      "enum": ["none", "cloth", "surgical", "n95_ffp2"],
      "default": "none"
    },
    "timestamp": {"type": "string", "format": "date-time"}
  }
}
```

#### Request Example
```json
{
  "h3_index": "8803264427fffff",
  "activity_type": "running_cycling",
  "duration_minutes": 45,
  "mask_type": "none"
}
```

#### Response: `201 Created`
```json
{
  "id": "91000001-0000-0000-0000-000000000001",
  "activity_type": "running_cycling",
  "duration_minutes": 45,
  "mask_type": "none",
  "ambient_pm25": 84.5,
  "ventilation_rate_m3_min": 0.035,
  "mask_filtration_efficiency": 0.0,
  "calculated_intake_dose": 133.09,
  "cigarette_equivalent": 6.05,
  "personal_risk_index": 7.2,
  "health_advisory": "High particulate intake detected. With your asthma profile, consider wearing an N95 mask or scheduling runs when PM2.5 drops below 60 µg/m³.",
  "timestamp": "2026-11-22T09:25:00.000Z"
}
```

---

### 9.2 `GET /api/v1/exposure/daily-summary/`
Returns the cumulative particulate inhalation dose, total active minutes, cigarette equivalence, and personalized risk index for a given day.

- **HTTP Method**: `GET`
- **Authentication**: `IsAuthenticated`
- **Query Parameters**:
  - `date` (ISO date string, optional): `YYYY-MM-DD` (default: current day).
- **Response: `200 OK`**:
```json
{
  "date": "2026-11-22",
  "total_activities_count": 3,
  "total_duration_minutes": 115,
  "total_inhaled_dose_micrograms": 218.45,
  "daily_cigarette_equivalent": 9.93,
  "average_ambient_pm25": 78.2,
  "personal_risk_index": 8.1,
  "risk_category": "HIGH_VULNERABILITY",
  "baseline_who_limit_micrograms": 72.0,
  "dose_exceedance_factor": 3.03
}
```

---

### 9.3 `GET /api/v1/exposure/history/`
Returns paginated exposure records over a date range for long-term health tracking.

- **HTTP Method**: `GET`
- **Authentication**: `IsAuthenticated`
- **Query Parameters**:
  - `start_date` (ISO date, optional)
  - `end_date` (ISO date, optional)
  - `page` (integer, optional)
  - `page_size` (integer, optional)
- **Response: `200 OK`**:
```json
{
  "count": 48,
  "next": "https://api.breathewise.in/api/v1/exposure/history/?page=2",
  "previous": null,
  "results": [
    {
      "id": "91000001-0000-0000-0000-000000000001",
      "activity_type": "running_cycling",
      "duration_minutes": 45,
      "mask_type": "none",
      "calculated_intake_dose": 133.09,
      "cigarette_equivalent": 6.05,
      "personal_risk_index": 7.2,
      "timestamp": "2026-11-22T09:25:00.000Z"
    }
  ]
}
```

---

### 9.4 `POST /api/v1/exposure/calculate-dose/` (Pure-Python Inhalation Calculator)
Stateless calculator endpoint that computes physiological dose and cigarette equivalence without persisting records to the database. Useful for real-time frontend sliders, "what-if" activity simulations, and unauthenticated public tools.

- **HTTP Method**: `POST`
- **Authentication**: `AllowAny`
- **Request JSON Schema**:
```json
{
  "type": "object",
  "required": ["pm25_concentration", "activity_type", "duration_minutes"],
  "properties": {
    "pm25_concentration": {"type": "number", "minimum": 0.0},
    "activity_type": {
      "type": "string",
      "enum": ["indoor_rest", "indoor_active", "walking", "running_cycling", "commuting_transit"]
    },
    "duration_minutes": {"type": "integer", "minimum": 1, "maximum": 1440},
    "mask_type": {
      "type": "string",
      "enum": ["none", "cloth", "surgical", "n95_ffp2"],
      "default": "none"
    },
    "health_sensitivity": {
      "type": "string",
      "enum": ["normal", "asthma", "copd", "cardiovascular", "elderly", "child", "pregnant"],
      "default": "normal"
    }
  }
}
```

#### Request Example
```json
{
  "pm25_concentration": 120.0,
  "activity_type": "running_cycling",
  "duration_minutes": 60,
  "mask_type": "n95_ffp2",
  "health_sensitivity": "asthma"
}
```

#### Response: `200 OK`
```json
{
  "calculation_model": "breathewise_impact_engine_v1",
  "inputs": {
    "pm25_concentration": 120.0,
    "activity_type": "running_cycling",
    "duration_minutes": 60,
    "mask_type": "n95_ffp2",
    "health_sensitivity": "asthma"
  },
  "constants_applied": {
    "ventilation_rate_m3_min": 0.030,
    "mask_efficiency_eta": 0.95,
    "cigarette_conversion_ug": 22.0,
    "sensitivity_multiplier": 1.75
  },
  "outputs": {
    "unmasked_dose_micrograms": 216.0,
    "actual_inhaled_dose_micrograms": 10.8,
    "dose_prevented_micrograms": 205.2,
    "cigarette_equivalent": 0.49,
    "unmasked_cigarette_equivalent": 9.82,
    "personal_risk_index": 2.1,
    "safety_verdict": "SAFE_WITH_N95",
    "recommendation": "N95 mask effectively prevents 95% of inhaled particulates. Activity is safe to execute."
  }
}
```

---

## 10. Cross-Cutting Validation Rules & Error Code Directory

| Error Code | HTTP Status | Trigger Condition |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Payload fails serializer validation, regex format, or range checks. |
| `AUTHENTICATION_FAILED` | 401 | Invalid username or password on login. |
| `TOKEN_EXPIRED` | 401 | Access token or refresh token past its expiration timestamp. |
| `TOKEN_BLACKLISTED` | 401 | Refresh token was already rotated or revoked. |
| `PERMISSION_DENIED` | 403 | Attempting an action prohibited by RBAC role or object ownership. |
| `NOT_FOUND` | 404 | Target station, sector, report, or conversation UUID does not exist. |
| `USER_ALREADY_EXISTS` | 409 | Unique constraint violated on `username` or `email`. |
| `ALREADY_UPVOTED` | 409 | Authenticated user has already upvoted the target report. |
| `INVALID_H3_INDEX` | 422 | Supplied string fails Uber H3 validation or is outside Chandigarh bbox. |
| `NAQI_INSUFFICIENT_DATA`| 422 | Reading has fewer than 3 criteria pollutants or lacks particulate matter. |
| `RATE_LIMIT_EXCEEDED` | 429 | Client exceeded scoped throttle quota. |
| `INTERNAL_SERVER_ERROR`| 500 | Unhandled Python exception; logged to Sentry / audit log. |
| `SERVICE_UNAVAILABLE` | 503 | Database or Redis connection failure in circuit breaker state. |

---
*End of API Endpoints Specification (`API_ENDPOINTS.md`)*
