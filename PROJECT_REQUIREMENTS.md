# BreatheWise: Comprehensive Project Requirements Specification
## Core Requirements, System Capabilities, User Personas, and Module Specifications (Chandigarh-First Pilot)

**Document Identifier**: `PROJECT_REQUIREMENTS.md`  
**System Name**: BreatheWise Urban Air Quality Assistance Platform  
**Target Region**: Chandigarh Urban Agglomeration (30.65°N–30.80°N, 76.70°E–76.85°E)  
**Standard Compliance**: Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) Standard  
**Document Version**: 2.0.0  
**Status**: Production-Grade Planning Specification  

---

## Table of Contents
1. [Executive Summary & Domain Foundation](#1-executive-summary--domain-foundation)
   - 1.1 Mission & Vision
   - 1.2 Geographic & Meteorological Context of Chandigarh
   - 1.3 Official Indian CPCB NAQI Standard & Breakpoints
   - 1.4 Spatial Grid Foundation (Uber H3 Discrete Global Grid)
   - 1.5 Privacy by Design & Zero-Raw-GPS Mandate
   - 1.6 Simulation & Demo Data Explicit Labeling Policy
2. [Non-Functional Requirements (NFRs)](#2-non-functional-requirements-nfrs)
   - 2.1 Performance & Latency Budgets
   - 2.2 Scalability & Resource Utilization
   - 2.3 Reliability, Availability & Fault Tolerance
   - 2.4 Security, Identity & Cryptographic Standards
   - 2.5 Privacy-by-Design & Data Protection (DPDP Act 2023)
   - 2.6 Accessibility (WCAG 2.1 AA) & Responsive Usability
3. [User Personas](#3-user-personas)
   - 3.1 Persona 1: General Citizen (Priya, IT Professional, Sector 17)
   - 3.2 Persona 2: Sensitive Health Individual (Mr. Sharma, 68, COPD / Ananya, 6, Pediatric Asthma)
   - 3.3 Persona 3: Outdoor Enthusiast / Commuter (Kabir, 24, Distance Runner & Cyclist)
   - 3.4 Persona 4: Municipal Environmental Officer (Harpreet Singh, CPCC / Municipal Corporation)
4. [Module-by-Module Feature Specifications (12 Modules)](#4-module-by-module-feature-specifications-12-modules)
   - 4.1 Module 1: Landing Page
   - 4.2 Module 2: Authentication & Authorization (JWT & RBAC)
   - 4.3 Module 3: Dashboard (Personalized Command Center)
   - 4.4 Module 4: Interactive Pollution Map (Leaflet & Uber H3)
   - 4.5 Module 5: Analytics & NAAQS Regulatory Benchmarking
   - 4.6 Module 6: Forecast Engine (24h/48h/72h Confidence Bands)
   - 4.7 Module 7: AI Assistant (Guardrailed Natural Language Advisory)
   - 4.8 Module 8: Smart Alerts & Notification Dispatcher
   - 4.9 Module 9: Citizen Reporting (Crowdsourced Hazards & EXIF Sanitization)
   - 4.10 Module 10: Exposure Tracker & Physiological Impact Engine
   - 4.11 Module 11: User Profile & Health Sensitivity Registry
   - 4.12 Module 12: Admin Dashboard & Telemetry Health Console
5. [Cross-Cutting Technical Concerns & Data Dictionaries](#5-cross-cutting-technical-concerns--data-dictionaries)
   - 5.1 Standardized API Request/Response Formats
   - 5.2 Error Envelopes & Validation Codes
   - 5.3 Audit Trails & Telemetry Logging

---

## 1. Executive Summary & Domain Foundation

### 1.1 Mission & Vision
**BreatheWise** is an advanced, hyper-local, privacy-centric urban air quality decision-support platform designed to protect public health, optimize personal activity scheduling, and assist municipal environmental governance. While engineered from the ground up for scalable deployment across Indian cities, the pilot phase exclusively targets the **Chandigarh Urban Agglomeration** (Chandigarh UT, SAS Nagar/Mohali, and Panchkula).

BreatheWise bridges the gap between raw atmospheric monitoring telemetry and personal health decision-making. By synthesizing ground-level Continuous Ambient Air Quality Monitoring Station (CAAQMS) telemetry, micro-meteorology, planetary boundary layer dynamics, and individual biometric vulnerabilities, the platform provides actionable, deterministic health advisories, dynamic route hazard avoidance, and accurate inhalation dose tracking.

### 1.2 Geographic & Meteorological Context of Chandigarh
Chandigarh presents a structured urban geography and microclimate that dictates spatial modeling requirements:
- **Geographic Bounding Box**: Latitude `30.6500°N` to `30.8200°N`, Longitude `76.6800°E` to `76.8800°E`.
- **Elevation**: 321 meters above Mean Sea Level.
- **Topography**: Situated in the Indo-Gangetic basin against the Shivalik foothills to the northeast. Thermal catchments around Sukhna Lake and wide, linear boulevard corridors (Madhya Marg, Dakshin Marg, Jan Marg) channel localized vehicular exhaust.
- **Micro-Meteorological Regimes**:
  - *Post-Monsoon & Winter Stagnation (October–February)*: Ground nocturnal temperature inversions compress the Planetary Boundary Layer (PBL) to 100–250 meters. Transboundary paddy residue burning plumes from adjoining Punjab and Haryana districts (Patiala, Fatehgarh Sahib, Ambala) converge with calm surface winds ($< 1.5 \text{ m/s}$), creating severe particulate stagnation ($PM_{2.5} > 250 \mu\text{g/m}^3$).
  - *Summer Dust & Thermal Dispersion (March–June)*: High daytime thermal convection expands the boundary layer ($> 1,500 \text{ m}$), but western disturbances advect coarse crustal dust ($PM_{10} > 400 \mu\text{g/m}^3$) from Rajasthan.
  - *Monsoon Scavenging (July–September)*: Strong precipitation wash-out clears suspended particulates, yielding Good to Satisfactory baseline air quality.

### 1.3 Official Indian CPCB NAQI Standard & Breakpoints
The platform strictly computes and displays the **Central Pollution Control Board (CPCB) National Air Quality Index (NAQI)** as formalized by the Ministry of Environment, Forest and Climate Change (MoEFCC, 2014/2015). Under no circumstances does BreatheWise display US EPA AQI or proprietary vendor aggregations without explicit disclaimers.

#### 1.3.1 Mathematical Formulation
The sub-index $I_p$ for pollutant $p$ with concentration $C_p$ is calculated using piecewise linear interpolation between defined concentration breakpoints $[B_{lo}, B_{hi}]$ corresponding to index breakpoints $[I_{lo}, I_{hi}]$:

$$I_p = I_{lo} + \left(\frac{I_{hi} - I_{lo}}{B_{hi} - B_{lo}}\right) \times (C_p - B_{lo})$$

The composite NAQI score is determined by the maximum sub-index:
$$\text{NAQI} = \max\left(I_1, I_2, \dots, I_k\right)$$

#### 1.3.2 Breakpoint Table for All 8 Criteria Pollutants
All concentrations are in $\mu\text{g/m}^3$ (24-hour average), except $CO$ which is in $\text{mg/m}^3$ (8-hour average) and $O_3$ which is in $\mu\text{g/m}^3$ (8-hour average).

| NAQI Category | Sub-Index Range ($I_{lo}-I_{hi}$) | $PM_{2.5}$ (24h) | $PM_{10}$ (24h) | $NO_2$ (24h) | $SO_2$ (24h) | $CO$ (8h) | $O_3$ (8h) | $NH_3$ (24h) | $Pb$ (24h) | Color Hex |
|---|---|---|---|---|---|---|---|---|---|---|
| **Good** | 0 – 50 | 0 – 30 | 0 – 50 | 0 – 40 | 0 – 40 | 0.0 – 1.0 | 0 – 50 | 0 – 200 | 0.0 – 0.5 | `#00B050` |
| **Satisfactory** | 51 – 100 | 31 – 60 | 51 – 100 | 41 – 80 | 41 – 80 | 1.1 – 2.0 | 51 – 100 | 201 – 400 | 0.6 – 1.0 | `#92D050` |
| **Moderate** | 101 – 200 | 61 – 90 | 101 – 250 | 81 – 180 | 81 – 380 | 2.1 – 10.0 | 101 – 168 | 401 – 800 | 1.1 – 2.0 | `#FFFF00` |
| **Poor** | 201 – 300 | 91 – 120 | 251 – 350 | 181 – 280 | 381 – 800 | 10.1 – 17.0 | 169 – 208 | 801 – 1200 | 2.1 – 3.0 | `#FF9900` |
| **Very Poor** | 301 – 400 | 121 – 250 | 351 – 430 | 281 – 400 | 801 – 1600 | 17.1 – 34.0 | 209 – 748 | 1201 – 1800 | 3.1 – 4.0 | `#FF0000` |
| **Severe** | 401 – 500+ | 250+ | 430+ | 400+ | 1600+ | 34.0+ | 748+ | 1800+ | 4.0+ | `#C00000` |

#### 1.3.3 Mandatory CPCB Validation Rules
1. **Three-Pollutant Minimum**: A composite NAQI can only be declared valid if data for at least three ($k \ge 3$) criteria pollutants are monitored.
2. **Particulate Matter Mandate**: At least one of the monitored pollutants **must** be particulate matter ($PM_{2.5}$ or $PM_{10}$). If neither $PM_{2.5}$ nor $PM_{10}$ is available, the system returns `NAQI_INSUFFICIENT_DATA`.
3. **Primary/Prominent Pollutant**: The pollutant yielding the highest sub-index $I_p = \text{NAQI}$ is declared the primary driver. If two pollutants tie, $PM_{2.5}$ takes precedence due to its higher relative health hazard.

### 1.4 Spatial Grid Foundation (Uber H3 Discrete Global Grid)
To achieve uniform spatial modeling across the city while decoupling operations from variable administrative boundaries:
- **Primary Grid (Resolution 8)**: Average hexagon area is $0.737 \text{ km}^2$ (edge length $\approx 461 \text{ meters}$). This precisely corresponds to Chandigarh's iconic Le Corbusier Sector dimensions ($800\text{ m} \times 1,200\text{ m}$ per sector).
- **Macro Grid (Resolution 7)**: Average hexagon area is $5.16 \text{ km}^2$ (edge length $\approx 1.22 \text{ km}$). Utilized for city-wide thematic rendering, regional plume dispersion, and cross-border transport analysis.
- **Coverage**: The Chandigarh bounding box is represented by exactly 168 Resolution 8 hexagons.

### 1.5 Privacy by Design & Zero-Raw-GPS Mandate
In strict compliance with India's **Digital Personal Data Protection Act (DPDP Act 2023)** and international privacy-by-design standards:
1. **Zero Raw Geolocation Logging**: Raw user GPS coordinates (`latitude`, `longitude`) are processed solely within transient memory (client-side or single-cycle API serialization) to resolve the corresponding Uber H3 index. Raw coordinates are **never** committed to the database, logged in application logs, or cached in Redis.
2. **H3 Spatial Hashing**: All user locations, saved places, citizen reports, and exposure activity segments are persisted strictly as `h3_index` strings (e.g. `'8860822607fffff'`).
3. **Automated Image EXIF Stripping**: All citizen report imagery uploaded to the system is sanitized via an asynchronous Celery task before storage. All EXIF metadata (specifically GPSInfo tags, device IMEI/make, exposure timestamps) is completely removed using lossless image recoding.

### 1.6 Simulation & Demo Data Explicit Labeling Policy
During Phase 0 and Phase 1 development, BreatheWise operates using deterministic mock data generators. To ensure absolute transparency:
- Every API response containing simulated or interpolated data must include:
  ```json
  "data_provenance": {
    "is_simulated": true,
    "provider": "MockAirQualityProvider",
    "disclaimer": "Simulated data for development and testing. Not for official regulatory use."
  }
  ```
- The frontend UI displays a distinct amber badge (`[DEMO MODE: DETERMINISTIC FIXTURES]`) across all map and dashboard screens whenever mock providers are active.

---

## 2. Non-Functional Requirements (NFRs)

### 2.1 Performance & Latency Budgets
- **NFR-1.1 (API Response Time)**: 95th percentile response time ($p95$) for all cached air quality queries (`/api/v1/air-quality/latest/`, `/api/v1/locations/h3-grid/`) shall be $< 80 \text{ ms}$.
- **NFR-1.2 (Spatial Interpolation Latency)**: Real-time Inverse Distance Weighting (IDW) interpolation across the 168 Chandigarh H3 cells shall complete in $< 150 \text{ ms}$ on the Celery background worker.
- **NFR-1.3 (Frontend Rendering)**: Map tile and H3 hexagonal layer updates shall maintain a steady 60 frames per second ($FPS$) during pan/zoom operations on modern desktop and mobile browsers. First Contentful Paint (FCP) must be $< 1.2 \text{ s}$ on standard 4G connections.
- **NFR-1.4 (Database Query Performance)**: Spatial indexing via PostGIS `GIST` on `boundary_polygon` and B-tree indexes on `h3_index` shall ensure spatial query execution time $< 20 \text{ ms}$ under 500 concurrent connections.

### 2.2 Scalability & Resource Utilization
- **NFR-2.1 (Horizontal API Scalability)**: The Django REST API service (`web`) must be fully stateless, permitting horizontal scaling across multiple container replicas behind a round-robin reverse proxy (NGINX/Traefik).
- **NFR-2.2 (Concurrent User Capacity)**: Architecture must support a minimum of 10,000 concurrent active users and 1,000 requests per second (RPS) without thread pool starvation or database connection exhaustion.
- **NFR-2.3 (Cache Hit Ratio)**: Redis 7 caching tier must maintain a cache hit ratio $\ge 90\%$ for public air quality and spatial endpoints.
- **NFR-2.4 (Memory Footprint)**: Worker tasks handling EXIF stripping and interpolation must maintain a bounded memory ceiling $< 256 \text{ MB}$ per Celery process.

### 2.3 Reliability, Availability & Fault Tolerance
- **NFR-3.1 (High Availability Target)**: 99.9% uptime during operational deployment (planned maintenance windows $< 4 \text{ hours/month}$).
- **NFR-3.2 (Circuit Breakers & Graceful Degradation)**: If external CAAQMS data feeds fail, the ingestion engine must transition to historical rolling averages and notify users with an explicit "STALE TELEMETRY" indicator rather than failing with 500 errors.
- **NFR-3.3 (Data Integrity)**: PostgreSQL WAL (Write-Ahead Logging) with automated daily snapshot backups. Zero data loss for authenticated user profiles and citizen report submissions.
- **NFR-3.4 (PWA / Offline Capability)**: The React frontend shall register a Service Worker caching core UI shells, station locations, and the last-known H3 grid snapshot for offline accessibility.

### 2.4 Security, Identity & Cryptographic Standards
- **NFR-4.1 (Authentication & Tokens)**: JSON Web Token (JWT) authentication using SimpleJWT with RS256 or HS256 signing. Short-lived Access Tokens (60-minute TTL) paired with rotatable Refresh Tokens (7-day TTL).
- **NFR-4.2 (Role-Based Access Control - RBAC)**: Strict authorization barriers separating `citizen`, `sensitive_individual`, `outdoor_enthusiast`, `official`, and `admin` roles across all protected API routes.
- **NFR-4.3 (Transport Security)**: Mandatory TLS 1.3 encryption across all client-to-server and inter-service communications in production. Strict HSTS headers (`max-age=31536000; includeSubDomains`).
- **NFR-4.4 (Injection & OWASP Mitigations)**: Complete parameterized SQL queries via Django ORM to eliminate SQL injection; Content Security Policy (CSP) headers to prevent Cross-Site Scripting (XSS); strict CORS policies restricting API access to validated client domains.

### 2.5 Privacy-by-Design & Data Protection (DPDP Act 2023)
- **NFR-5.1 (No Raw Coordinate Persistence)**: Neither database tables nor disk logs shall record precise latitude/longitude for user-generated actions.
- **NFR-5.2 (Irreversible Metadata Cleansing)**: Citizen report images must have all EXIF data permanently expunged before being written to persistent media storage or S3 buckets.
- **NFR-5.3 (Right to Erasure)**: Users must be able to delete their account and associated exposure logs via an authenticated self-service API, purging all relational rows within 24 hours.

### 2.6 Accessibility (WCAG 2.1 AA) & Responsive Usability
- **NFR-6.1 (Contrast & Color Independence)**: All air quality category badges must pair the CPCB color code with unambiguous text labels, numeric values, and icon glyphs to ensure 100% intelligibility for color-blind individuals (protanopia, deuteranopia).
- **NFR-6.2 (Screen Reader Compatibility)**: All interactive elements, charts (Recharts), and map markers must include explicit `aria-label`, `role`, and keyboard focus indicators (`Tab` navigation compliant).
- **NFR-6.3 (Responsive Breakpoints)**: Fluid layout adaptation across Mobile (320px–639px), Tablet (640px–1023px), and Desktop (1024px+).

---

## 3. User Personas

### 3.1 Persona 1: General Citizen
```
┌────────────────────────────────────────────────────────────────────────┐
│ PERSONA: Priya Sharma (Age: 28)                                        │
│ Role: IT Consultant, Sector 17 Commercial Complex, Chandigarh         │
│ Tech Literacy: High | Primary Device: iPhone 14 & MacBook Pro          │
└────────────────────────────────────────────────────────────────────────┘
```
- **Profile & Context**: Priya lives in Sector 43 and commutes daily across Madhya Marg to Sector 17. She has no chronic respiratory illnesses but suffers from eye irritation, fatigue, and dry coughs during October–December smog episodes.
- **Goals**:
  - Quickly check the daily air quality verdict before leaving home at 08:30 IST.
  - Understand whether it is safe to open apartment windows in the evening.
  - Receive actionable, jargon-free notifications (e.g. "Air is Poor today: keep windows shut and wear an N95 on your scooter commute").
- **Frustrations**: Confusing US EPA numbers on commercial weather apps that contradict local news; complex scientific charts with no practical recommendations; battery-draining apps that continuously track exact GPS coordinates.
- **Key Modules Used**: Landing Page, Dashboard, Smart Alerts, Interactive Pollution Map.

### 3.2 Persona 2: Sensitive Health Individual
```
┌────────────────────────────────────────────────────────────────────────┐
│ PERSONA: Mr. Om Prakash Sharma (Age: 68) & Ananya Sharma (Age: 6)      │
│ Role: Retired Civil Servant (COPD) & Granddaughter (Pediatric Asthma)  │
│ Location: Sector 22-B, Chandigarh | Caregiver: Sunita Sharma (Daughter)│
└────────────────────────────────────────────────────────────────────────┘
```
- **Profile & Context**: Mr. Sharma has Chronic Obstructive Pulmonary Disease (Stage II) with reduced forced expiratory volume. His granddaughter Ananya suffers from allergic bronchial asthma triggered by particulate spikes ($PM_{2.5} > 60 \mu\text{g/m}^3$).
- **Goals**:
  - Configure ultra-sensitive alert thresholds that trigger warnings when NAQI transitions into "Moderate" ($> 100$), rather than waiting for "Poor" ($> 200$).
  - Review 24-hour hourly forecasts to identify the safest outdoor walking window in Sector 22 neighborhood parks.
  - Track cumulative weekly particulate dose to share with their pulmonologist at PGIMER Chandigarh.
- **Frustrations**: Generalized city-wide averages that miss localized morning inversion spikes; medical advice that is either too generic or dangerously unvetted; lack of pediatric and senior-specific risk scoring.
- **Key Modules Used**: Dashboard, User Profile (Health Sensitivity), Smart Alerts, Forecast, Exposure Tracker, AI Assistant.

### 3.3 Persona 3: Outdoor Enthusiast / Commuter
```
┌────────────────────────────────────────────────────────────────────────┐
│ PERSONA: Kabir Bedi (Age: 24)                                          │
│ Role: Distance Runner, Cyclist & Masters Student at Panjab University  │
│ Location: Sector 15 / Sector 25 Panjab University Campus               │
│ Tech Literacy: Very High | Primary Device: Android & Garmin Smartwatch │
└────────────────────────────────────────────────────────────────────────┘
```
- **Profile & Context**: Kabir runs 10–15 km four days a week around Sukhna Lake and Sector 10 Leisure Valley. During high-intensity aerobic exercise, his ventilation rate increases five-fold ($V_E \approx 0.050 \text{ m}^3/\text{min}$), drastically amplifying particulate deposition in his alveolar lung tissue.
- **Goals**:
  - Identify optimal training time windows (e.g. afternoon convective dilution vs. early morning inversion traps).
  - Calculate exact inhaled particulate dose ($\mu\text{g}$) and cigarette equivalents for every workout session based on exercise intensity and mask usage.
  - Plan running routes avoiding high-emission arterial transit corridors.
- **Frustrations**: Standard fitness trackers treat all outdoor miles equally without accounting for toxic atmospheric dose; lack of minute-by-minute diurnal curve insights.
- **Key Modules Used**: Interactive Map, Exposure Tracker, Analytics, Forecast.

### 3.4 Persona 4: Municipal Environmental Officer
```
┌────────────────────────────────────────────────────────────────────────┐
│ PERSONA: Er. Harpreet Singh (Age: 46)                                  │
│ Role: Senior Environmental Engineer, Chandigarh Pollution Control      │
│       Committee (CPCC) & Municipal Corporation Chandigarh              │
│ Location: Paryavaran Bhawan, Sector 19, Chandigarh                     │
└────────────────────────────────────────────────────────────────────────┘
```
- **Profile & Context**: Harpreet oversees ambient air quality monitoring compliance, manages emergency Graded Response Action Plan (GRAP) enforcement, and dispatches field inspectors to mitigate illegal garbage burning and construction dust.
- **Goals**:
  - Monitor the operational telemetry health and data freshness of all 4 Chandigarh CAAQMS stations in real time.
  - Review, verify, and escalate geolocated citizen incident reports (stubble smoke, industrial stack discharge, leaf burning).
  - Generate automated CPCB NAAQS regulatory compliance reports and diurnal distribution statistics for municipal stakeholders.
  - Broadcast emergency civic health advisories across specific H3 sectors during hazardous inversion events.
- **Frustrations**: Fragmented public complaint channels (Twitter/X, paper complaints, phone calls) lacking photographic proof and standardized spatial coordinates; delayed data feeds from stations.
- **Key Modules Used**: Admin Dashboard, Citizen Reporting Moderation Queue, Analytics, Interactive Map.

---

## 4. Module-by-Module Feature Specifications (12 Modules)

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                   BREATHEWISE PLATFORM MODULES                            │
│                                                                                           │
│  [1. Landing Page]          [2. Authentication]         [3. Dashboard]                    │
│  Public Showcase & Promo    JWT + RBAC Access Control   Personalized Command Center       │
│                                                                                           │
│  [4. Interactive Map]       [5. Analytics]              [6. Forecast Engine]              │
│  Leaflet + Uber H3 Grid     Recharts Diurnal Trends     24h/48h/72h Predictive Curves     │
│                                                                                           │
│  [7. AI Assistant]          [8. Smart Alerts]           [9. Citizen Reporting]            │
│  Guardrailed Advisory       Multi-Channel Triggers      Crowdsourced Hazards + EXIF Strip │
│                                                                                           │
│  [10. Exposure Tracker]     [11. User Profile]          [12. Admin Dashboard]             │
│  Inhaled Dose Equation      Health & Sensitivity Setup  Sensor Telemetry & Moderation     │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.1 Module 1: Landing Page
- **Bounded Context**: Public Portal & Atmospheric Awareness (`apps.air_quality`, `apps.advice`).
- **User Stories**:
  - *As an unauthenticated citizen*, I want to see the immediate city-wide average CPCB NAQI and color-coded status badge for Chandigarh, so that I instantly understand the general air quality without logging in.
  - *As a curious visitor*, I want to see an interactive preview of the CPCB scale and platform features, so that I am motivated to create an account.
- **Detailed Functional Requirements**:
  1. Display a prominent **Hero Real-Time NAQI Widget** showing:
     - Real-time city-average NAQI value (e.g. `142`).
     - CPCB Category badge (`Moderate`, `#FFFF00` with dark high-contrast text).
     - Prominent Pollutant tag (`Primary: PM2.5 (68 µg/m³)`).
     - Timestamp of last CAAQMS telemetry synchronization.
     - Simulation status disclaimer banner if mock fixtures are active.
  2. Provide a **Quick Sector Lookup** dropdown allowing visitors to view the latest readings from the 4 primary Chandigarh monitoring stations (Sector 22, Sector 25 PU, Sector 53, Sector 39 IMTECH).
  3. Interactive **CPCB NAQI Educational Spectrum**: visual slider showing all 6 categories, sub-index ranges, and high-level health guidance.
  4. Feature showcase cards highlighting Personal Exposure Dose Tracking, Citizen Incident Reporting, and AI Health Advisory.
  5. Clear Call-to-Action (CTA) triggers: "Explore Live Map", "Create Free Account", "Sign In".
- **Input Parameters**:
  - Optional `station_code` filter for quick station lookup.
- **Output Parameters**:
  ```json
  {
    "city": "Chandigarh",
    "composite_naqi": 142,
    "category": "Moderate",
    "color_hex": "#FFFF00",
    "primary_pollutant": "PM2.5",
    "telemetry_timestamp": "2026-11-22T08:00:00Z",
    "stations_reporting": 4,
    "stations_total": 4,
    "data_provenance": {
      "is_simulated": true,
      "provider": "MockAirQualityProvider"
    }
  }
  ```
- **Acceptance Criteria**:
  - *Given* an unauthenticated user loads `/`, *When* the page mounts, *Then* the Hero NAQI widget displays the current Chandigarh average within 800ms.
  - *Given* mock telemetry is active, *When* any user views the landing page, *Then* the demo disclaimer badge is clearly visible in the header.

---

### 4.2 Module 2: Authentication & Authorization (JWT & RBAC)
- **Bounded Context**: Identity & Access Management (`apps.accounts`).
- **User Stories**:
  - *As a new user*, I want to register using my email, password, and full name, so that I can personalize my air quality monitoring.
  - *As an existing user*, I want to sign in securely with email and password to receive a JWT token, so that I can access my protected data.
  - *As a municipal official*, I want my account role verified automatically, so that I can access administrative moderation features.
- **Detailed Functional Requirements**:
  1. **User Registration**:
     - Captures `email` (unique, lowercase normalized), `password` (min 8 chars, mixed case, number, symbol), `first_name`, `last_name`, and optional `role` (`citizen`, `sensitive_individual`, `outdoor_enthusiast`). Role defaults to `citizen`.
     - Automatically provisions an associated `UserProfile` instance upon successful registration.
     - Automatically issues initial JWT access and refresh token pair upon registration (auto-login).
  2. **JWT Issuance & Rotation**:
     - Endpoint `/api/v1/auth/login/` returns `access` token (60-minute lifetime) and `refresh` token (7-day lifetime).
     - Endpoint `/api/v1/auth/token/refresh/` validates refresh token and returns new access token with sliding expiration.
  3. **Role-Based Access Control (RBAC)**:
     - 5 distinct user roles: `citizen`, `sensitive_individual`, `outdoor_enthusiast`, `official`, `admin`.
     - Permission decorators protect sensitive endpoints (e.g. report verification restricted to `official` and `admin`).
- **Input Parameters (Registration)**:
  ```json
  {
    "email": "priya.sharma@example.com",
    "password": "SecurePassword123!",
    "first_name": "Priya",
    "last_name": "Sharma",
    "role": "citizen"
  }
  ```
- **Output Parameters (Auth Success)**:
  ```json
  {
    "user": {
      "id": "e4b3c2a1-0000-4000-a000-000000000001",
      "email": "priya.sharma@example.com",
      "first_name": "Priya",
      "last_name": "Sharma",
      "role": "citizen"
    },
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "access_expires_in_seconds": 3600
    }
  }
  ```
- **Acceptance Criteria**:
  - *Given* an email already in use, *When* registration is attempted, *Then* the API returns HTTP 400 with `{"error": {"code": "EMAIL_ALREADY_EXISTS"}}`.
  - *Given* valid credentials, *When* `/api/v1/auth/login/` is invoked, *Then* valid JWT tokens are issued and user profile data is returned.

---

### 4.3 Module 3: Dashboard (Personalized Command Center)
- **Bounded Context**: User Aggregations & Decision Support (`apps.air_quality`, `apps.impact`, `apps.advice`).
- **User Stories**:
  - *As an authenticated user*, I want to see my primary location's current NAQI, personal risk verdict, and hourly timeline on a single dashboard, so that I can plan my immediate day.
  - *As a sensitive individual*, I want prominent warnings about upcoming diurnal pollution spikes, so that I can schedule medication and indoor rest.
- **Detailed Functional Requirements**:
  1. **Current Location AQI Card**:
     - Resolves user's default saved location or active H3 cell.
     - Displays NAQI number, category badge, and dominant pollutant.
     - Displays weather snapshot: ambient temperature (°C), relative humidity (%), wind speed (km/h) and direction.
  2. **Personalized Health Verdict Widget**:
     - Evaluates current air quality against user's specific health sensitivity profile (`normal`, `asthma`, `copd`, `cardiovascular`, `elderly`, `child`, `pregnant`).
     - Emits tailored action items:
       - Window ventilation recommendation (`KEEP SHUT` / `SAFE TO VENTILATE`).
       - Outdoor exercise recommendation (`AVOID OUTDOOR CARDIO` / `SAFE`).
       - Mask recommendation (`N95 RECOMMENDED` / `NO MASK NEEDED`).
       - Indoor air purifier guidance (`RUN AT HIGH SPEED` / `OFF`).
  3. **24-Hour Diurnal Forecast Sparkline**:
     - Visualizes anticipated hourly AQI fluctuations with marked morning and evening peak hazard windows.
  4. **Quick Action Bar**:
     - Triggers modal dialogs for: "Log Exposure Activity", "Submit Citizen Incident", "Consult AI Assistant".
- **Input Parameters**:
  - Query parameter `?location_id=<uuid>` (optional, defaults to primary saved location).
- **Output Parameters**:
  ```json
  {
    "location": {
      "label": "Home (Sector 22)",
      "h3_index": "8860822607fffff"
    },
    "current_aqi": {
      "naqi": 185,
      "category": "Moderate",
      "color_hex": "#FFFF00",
      "primary_pollutant": "PM2.5",
      "pm25_concentration": 82.4
    },
    "weather": {
      "temperature_c": 22.4,
      "humidity_pct": 58.0,
      "wind_speed_kmh": 4.2,
      "wind_direction_deg": 315.0
    },
    "personal_verdict": {
      "sensitivity_profile": "asthma",
      "risk_level": "High Caution",
      "action_items": [
        "Avoid prolonged outdoor exertion",
        "Keep rapid-relief inhaler accessible",
        "Run indoor HEPA air purifier on medium/high",
        "Wear an N95 respirator if stepping outdoors"
      ]
    },
    "hourly_summary": [
      {"hour": "09:00", "predicted_naqi": 195, "category": "Moderate"},
      {"hour": "12:00", "predicted_naqi": 130, "category": "Moderate"},
      {"hour": "15:00", "predicted_naqi": 105, "category": "Moderate"},
      {"hour": "18:00", "predicted_naqi": 210, "category": "Poor"}
    ]
  }
  ```
- **Acceptance Criteria**:
  - *Given* an authenticated user with profile `asthma`, *When* ambient NAQI is 185, *Then* the personal verdict returns risk level "High Caution" with tailored asthma action items.

---

### 4.4 Module 4: Interactive Pollution Map (Leaflet & Uber H3)
- **Bounded Context**: Geospatial Intelligence & Spatial Interpolation (`apps.locations`, `apps.air_quality`, `apps.geo`).
- **User Stories**:
  - *As an urban commuter or citizen*, I want to view a real-time hexagonal heatmap of Chandigarh colored by CPCB NAQI, so that I can see which sectors have cleaner air.
  - *As a researcher or municipal official*, I want to toggle between station pins, H3 grid polygons, and active citizen hazard reports, so that I can inspect spatial correlations.
- **Detailed Functional Requirements**:
  1. **Leaflet Map Canvas**:
     - Centered on Chandigarh coordinates (`30.7333°N, 76.7794°E`) with zoom limits 11 to 16.
     - Dark-mode and light-mode CartoDB/OpenStreetMap base tile layers.
  2. **Uber H3 Hexagonal Grid Layer**:
     - Displays 168 Resolution 8 hexagons covering Chandigarh.
     - Polygons filled with CPCB category colors at 45% opacity, with border outlines.
     - Clicking any hexagon opens a popup showing: Sector name, estimated NAQI, $PM_{2.5}$, $PM_{10}$, and confidence score based on distance to nearest CAAQMS.
  3. **Monitoring Station Markers**:
     - Visual pins for the 4 Chandigarh CAAQMS stations.
     - Marker color matches the station's latest recorded NAQI.
     - Clicking a marker opens a station detail card showing all 8 criteria pollutants, station operator, and last telemetry update timestamp.
  4. **Citizen Hazard Pins Layer**:
     - Visual markers displaying crowdsourced incident reports (smoke, garbage burning, construction dust) submitted within the last 24 hours.
  5. **Layer Switcher Control**:
     - Toggles: `[x] H3 Grid Layer`, `[x] CAAQMS Stations`, `[x] Citizen Reports`, `[ ] Satellite Fire Hotspots`.
- **Input Parameters (GeoJSON Endpoint)**:
  - Query parameters: `resolution=8`, `pollutant=naqi` (or `pm25`, `pm10`).
- **Output Parameters**:
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[76.772, 30.732], [76.776, 30.735], "..."]]
        },
        "properties": {
          "h3_index": "8860822607fffff",
          "sector_name": "Sector 22",
          "naqi": 164,
          "category": "Moderate",
          "color_hex": "#FFFF00",
          "pm25": 74.2,
          "pm10": 142.1,
          "confidence_pct": 94
        }
      }
    ]
  }
  ```
- **Acceptance Criteria**:
  - *Given* the user navigates to `/map`, *When* the Leaflet map loads, *Then* all 168 H3 polygons render within 1.0 second without frame drops.

---

### 4.5 Module 5: Analytics & NAAQS Regulatory Benchmarking
- **Bounded Context**: Statistical Modeling & Regulatory Auditing (`apps.analytics`, `apps.air_quality`).
- **User Stories**:
  - *As an environmental researcher*, I want to analyze diurnal cycle trends across morning and evening peaks, so that I can study boundary layer dynamics and traffic emissions.
  - *As a municipal official*, I want to compare recorded pollutant levels against CPCB National Ambient Air Quality Standards (NAAQS), so that I can identify non-attainment sectors.
- **Detailed Functional Requirements**:
  1. **Diurnal Cycle Analysis (24-Hour Average Profile)**:
     - Aggregates multi-day hourly data to show typical 24-hour diurnal curves for $PM_{2.5}$ and $NO_2$.
     - Highlights morning inversion peaks (07:00–10:00 IST) and evening traffic/cooking peaks (18:00–22:00 IST) vs. afternoon convective minimums (13:00–16:00 IST).
  2. **Multi-Pollutant Correlation Chart**:
     - Dual-axis time-series chart (Recharts) plotting $PM_{2.5}$ against $NO_2$ and surface wind speed to illustrate dispersion relationships.
  3. **CPCB NAAQS Regulatory Compliance Gauge**:
     - Visualizes compliance against statutory 24-hour limits:
       - $PM_{2.5}$: $60 \mu\text{g/m}^3$ standard.
       - $PM_{10}$: $100 \mu\text{g/m}^3$ standard.
       - $NO_2$: $80 \mu\text{g/m}^3$ standard.
       - $SO_2$: $80 \mu\text{g/m}^3$ standard.
     - Computes non-attainment percentage (% of days exceeding statutory limits).
  4. **Station Inter-Comparison Matrix**:
     - Compares average NAQI and peak particulate concentrations across Sector 22 (commercial), Sector 25 (institutional), Sector 53 (transit border), and Sector 39 (green scientific).
- **Input Parameters**:
  - `station_code` (e.g. `'CH-SEC22-CAAQMS'`), `start_date`, `end_date`, `metrics` (`["pm25", "pm10", "no2"]`).
- **Output Parameters**:
  ```json
  {
    "station_code": "CH-SEC22-CAAQMS",
    "period": {"start": "2026-11-01", "end": "2026-11-21"},
    "days_analyzed": 21,
    "naaqs_compliance": {
      "pm25": {"limit": 60.0, "mean": 118.4, "exceedance_pct": 85.7},
      "pm10": {"limit": 100.0, "mean": 194.2, "exceedance_pct": 90.5},
      "no2": {"limit": 80.0, "mean": 42.1, "exceedance_pct": 0.0}
    },
    "diurnal_cycle": [
      {"hour": 0, "avg_pm25": 112.5, "avg_no2": 38.0},
      {"hour": 8, "avg_pm25": 168.2, "avg_no2": 54.2},
      {"hour": 14, "avg_pm25": 72.4, "avg_no2": 26.1},
      {"hour": 20, "avg_pm25": 154.0, "avg_no2": 49.8}
    ]
  }
  ```
- **Acceptance Criteria**:
  - *Given* a 30-day date range, *When* the analytics API is called, *Then* exceedance percentages are calculated accurately according to CPCB NAAQS limits.

---

### 4.6 Module 6: Forecast Engine (24h/48h/72h Confidence Bands)
- **Bounded Context**: Predictive Atmospheric Modeling (`apps.forecasting`).
- **User Stories**:
  - *As Kabir, the runner*, I want to view a 48-hour hourly forecast with confidence intervals, so that I can schedule tomorrow's training run during the cleanest window.
  - *As a school administrator*, I want advance 72-hour warnings of severe smog events, so that I can shift physical education classes indoors.
- **Detailed Functional Requirements**:
  1. **Multi-Horizon Projections**:
     - Generates hourly projections for 24 hours, 48 hours, and 72 hours forward.
     - Projects composite NAQI, primary pollutant, and expected category.
  2. **Confidence Intervals**:
     - Every forecasted hour includes lower ($CI_{low}$) and upper ($CI_{high}$) bounds (e.g. 90% confidence envelope), reflecting meteorological dispersion uncertainty.
  3. **Optimal Outdoor Window Detection**:
     - Algorithms automatically detect and flag the cleanest contiguous 2-hour window during daylight hours (e.g., "Best outdoor window tomorrow: 13:30 to 15:30 IST, predicted NAQI: 110").
  4. **Meteorological Dispersion Modifiers**:
     - Integrates forecasted wind speed, thermal inversion strength, and relative humidity to predict air mass stagnation.
- **Input Parameters**:
  - `h3_index` or `station_code`, `horizon_hours` (default `72`, options: `24`, `48`, `72`).
- **Output Parameters**:
  ```json
  {
    "h3_index": "8860822607fffff",
    "model_version": "breathewise-v1.0",
    "forecast": [
      {
        "target_timestamp": "2026-11-23T06:00:00Z",
        "predicted_naqi": 245,
        "predicted_category": "Poor",
        "ci_low": 210,
        "ci_high": 280,
        "dispersion_risk": "High Inversion Risk"
      },
      {
        "target_timestamp": "2026-11-23T14:00:00Z",
        "predicted_naqi": 115,
        "predicted_category": "Moderate",
        "ci_low": 95,
        "ci_high": 135,
        "dispersion_risk": "Favorable Convective Dilution"
      }
    ],
    "cleanest_window": {
      "start": "2026-11-23T13:30:00Z",
      "end": "2026-11-23T15:30:00Z",
      "avg_naqi": 112
    }
  }
  ```
- **Acceptance Criteria**:
  - *Given* any valid H3 cell, *When* forecast is requested, *Then* all 72 hourly points are returned with monotonic timestamps and valid $CI_{low} \le \text{predicted} \le CI_{high}$.

---

### 4.7 Module 7: AI Assistant (Guardrailed Natural Language Advisory)
- **Bounded Context**: Conversational Air Intelligence (`apps.assistant`).
- **User Stories**:
  - *As an anxious parent*, I want to ask: "My 6-year-old has asthma and wants to play outside today in Sector 22, is it safe?", so that I get immediate, personalized, medically-responsible guidance.
  - *As a commuter*, I want to ask: "Which mask should I buy for cycling in Chandigarh during November?", so that I get an evidence-based recommendation.
- **Detailed Functional Requirements**:
  1. **Conversational Chat Interface**:
     - Multi-turn conversation sessions persisted via `ChatConversation` and `ChatMessage` models.
  2. **Context Injection & System Guardrails**:
     - System prompt automatically injects: Current NAQI in user's H3 cell, dominant pollutant, user's health sensitivity profile, and weather conditions.
     - **Medical Safety Guardrail**: AI assistant **must never** diagnose clinical conditions or alter medical prescriptions. It must explicitly append: *"This advice is for environmental decision support only. Consult your physician for medical guidance."*
     - **Deterministic Guardrail**: AI must cite the exact computed CPCB NAQI and cannot contradict the rule-based safety verdict engine.
  3. **Structured Response Formatting**:
     - Responses formatted in Markdown with bullet points, highlighted risk levels, and concrete action steps.
- **Input Parameters (Chat Post)**:
  ```json
  {
    "conversation_id": "a1b2c3d4-1111-4000-a000-000000000001",
    "message": "Can I go for a 5km run at Sukhna Lake this morning?"
  }
  ```
- **Output Parameters**:
  ```json
  {
    "message_id": "b2c3d4e5-2222-4000-a000-000000000002",
    "sender": "assistant",
    "content": "### 🏃 Morning Running Advisory for Sukhna Lake\n\n- **Current Air Quality**: **Poor (NAQI 228)**, driven by $PM_{2.5}$ ($102 \\,\\mu\\text{g/m}^3$).\n- **Safety Verdict**: **Not Recommended** for vigorous outdoor aerobic activity.\n- **Why?** During intense running, your inhalation rate increases five-fold ($V_E \\approx 0.050\\,\\text{m}^3/\\text{min}$), depositing approximately **$306\\,\\mu\\text{g}$** of fine particulate matter into your lungs during a 60-minute workout—equivalent to smoking nearly **1.4 cigarettes** in one session.\n- **Recommended Action**: Postpone your run until **14:00–16:00 IST** when solar heating will disperse the morning inversion layer, or move your workout to an indoor gym with active air filtration.",
    "context_snapshot": {
      "naqi": 228,
      "category": "Poor",
      "h3_index": "8860822607fffff",
      "sensitivity": "normal"
    }
  }
  ```
- **Acceptance Criteria**:
  - *Given* any user prompt asking for medical advice (e.g. "Should I stop taking my steroid inhaler?"), *When* the AI responds, *Then* the safety guardrail enforces a strict refusal to modify clinical treatments and directs the user to a medical doctor.

---

### 4.8 Module 8: Smart Alerts & Notification Dispatcher
- **Bounded Context**: Automated Triggers & Multi-Channel Dispatch (`apps.alerts`).
- **User Stories**:
  - *As Mr. Sharma's caregiver*, I want to receive an immediate email and web-push alert if NAQI exceeds 150 in Sector 22, so that I can bring him indoors.
  - *As any user*, I want to set Quiet Hours between 22:00 and 06:00 IST, so that I am not awakened by non-emergency alerts.
- **Detailed Functional Requirements**:
  1. **Configurable Alert Triggers**:
     - **Threshold Trigger**: NAQI crosses user-defined threshold (default 200 for general citizens, 100 for sensitive individuals).
     - **Category Jump Trigger**: Alert triggered whenever the CPCB category escalates (e.g. from Moderate to Poor).
     - **Rapid Spike Trigger**: Hourly concentration increase $> 50 \mu\text{g/m}^3$.
  2. **Multi-Channel Dispatching**:
     - Dispatch options: In-App notification, Web Push (VAPID / Service Worker), Email (HTML formatted).
  3. **Quiet Hours Enforcement**:
     - Configurable active window (e.g. `06:00` to `22:00`). Alerts generated during quiet hours are suppressed unless classified as `EMERGENCY` (NAQI $> 400$, Severe).
  4. **Deduplication & Anti-Spam Frequency Capping**:
     - Minimum 3-hour suppression window for identical threshold triggers at the same location to avoid alert fatigue.
- **Input Parameters (Alert Preference Update)**:
  ```json
  {
    "naqi_threshold": 120,
    "notify_on_category_jump": true,
    "channel_email": true,
    "channel_push": true,
    "channel_in_app": true,
    "active_hours_start": "06:30:00",
    "active_hours_end": "21:30:00"
  }
  ```
- **Output Parameters (Triggered Alert Entity)**:
  ```json
  {
    "id": "c3d4e5f6-3333-4000-a000-000000000003",
    "severity": "warning",
    "h3_index": "8860822607fffff",
    "message": "Air quality in Sector 22 has escalated to Poor (NAQI 218). Sensitive individuals should avoid outdoor exposure.",
    "naqi_recorded": 218,
    "sent_at": "2026-11-22T08:15:00Z",
    "read_at": null
  }
  ```
- **Acceptance Criteria**:
  - *Given* a user has quiet hours from 22:00 to 06:00, *When* an AQI spike to 220 occurs at 23:30, *Then* non-emergency push notifications are suppressed until 06:00.

---

### 4.9 Module 9: Citizen Reporting (Crowdsourced Hazards & EXIF Sanitization)
- **Bounded Context**: Civic Science & Participatory Sensing (`apps.reports`).
- **User Stories**:
  - *As a resident*, I want to report an open municipal garbage fire with a photo and description without revealing my home address, so that authorities can extinguish it while preserving my privacy.
  - *As Municipal Officer Harpreet*, I want to inspect crowdsourced reports with verified sanitized evidence in a moderation queue, so that I can dispatch enforcement teams.
- **Detailed Functional Requirements**:
  1. **Hazard Submission Workflow**:
     - Category selection: `smoke` (stubble burning), `garbage` (trash/leaf burning), `construction` (unregulated dust), `industrial` (illegal emissions), `vehicular` (smoking vehicle), `other`.
     - Description field (up to 1,000 characters).
     - Geolocation: Automatically mapped to the user's current Resolution 8 H3 cell. Exact latitude/longitude are discarded immediately.
  2. **Image Upload & Automated EXIF Sanitization**:
     - Accepts JPEG/PNG/WebP images up to 10 MB.
     - Asynchronous Celery sanitization task executes Pillow / `piexif` to completely scrub all EXIF tags (`GPSInfo`, device make/model, camera serial, datetime stamps).
     - Image is recoded to WebP/JPEG before storage.
     - Sets `exif_stripped_verification = True` upon verification.
  3. **Verification Lifecycle**:
     - Status values: `submitted` $\to$ `under_review` $\to$ `verified` $\to$ `resolved` (or `rejected`).
     - Community upvoting: authenticated users in the same or neighboring H3 cells can upvote reports to confirm ongoing incidents.
- **Input Parameters (Multipart Form)**:
  - `category`: `"garbage"`
  - `description`: `"Heavy open burning of leaves and plastic waste behind Sector 22 market."`
  - `h3_index`: `"8860822607fffff"`
  - `image`: Binary file (image/jpeg)
- **Output Parameters**:
  ```json
  {
    "id": "d4e5f6a7-4444-4000-a000-000000000004",
    "h3_index": "8860822607fffff",
    "category": "garbage",
    "description": "Heavy open burning of leaves and plastic waste behind Sector 22 market.",
    "status": "submitted",
    "upvotes_count": 1,
    "images": [
      {
        "id": "e5f6a7b8-5555-4000-a000-000000000005",
        "url": "/media/reports/sanitized_20261122_001.webp",
        "exif_stripped_verification": true
      }
    ],
    "created_at": "2026-11-22T08:30:00Z"
  }
  ```
- **Acceptance Criteria**:
  - *Given* an image containing GPS EXIF tags, *When* processed by the sanitization task, *Then* the stored image contains zero EXIF metadata tags and `exif_stripped_verification` is `true`.

---

### 4.10 Module 10: Exposure Tracker & Physiological Impact Engine
- **Bounded Context**: Biometric Inhalation Dose Modeling (`apps.exposure`, `apps.impact`).
- **User Stories**:
  - *As Kabir, the runner*, I want to log my 45-minute outdoor run and calculate my inhaled particulate dose in micrograms, so that I can monitor my cumulative lung burden.
  - *As Priya, the commuter*, I want to see how wearing an N95 mask reduced my inhaled toxic dose compared to no mask, so that I stay motivated to protect myself.
- **Detailed Functional Requirements**:
  1. **Deterministic Inhalation Dose Formula**:
     $$\text{Dose } (\mu\text{g}) = C_{\text{PM2.5}} \times V_E \times t \times (1 - \eta_{\text{mask}})$$
     Where:
     - $C_{\text{PM2.5}}$: Ambient $PM_{2.5}$ concentration in $\mu\text{g/m}^3$ at user's H3 cell.
     - $V_E$: Minute ventilation rate in $\text{m}^3/\text{minute}$ based on activity:
       - `indoor_rest` / Sedentary: $0.00833 \text{ m}^3/\text{min}$ ($0.5 \text{ m}^3/\text{h}$)
       - `commuting_transit`: $0.0133 \text{ m}^3/\text{min}$ ($0.8 \text{ m}^3/\text{h}$)
       - `walking`: $0.0200 \text{ m}^3/\text{min}$ ($1.2 \text{ m}^3/\text{h}$)
       - `indoor_active`: $0.0250 \text{ m}^3/\text{min}$ ($1.5 \text{ m}^3/\text{h}$)
       - `running_cycling`: $0.0500 \text{ m}^3/\text{min}$ ($3.0 \text{ m}^3/\text{h}$)
     - $t$: Duration in minutes.
     - $\eta_{\text{mask}}$: Filtration efficiency:
       - `none`: $\eta = 0.00$
       - `cloth`: $\eta = 0.20$
       - `surgical`: $\eta = 0.45$
       - `n95_ffp2`: $\eta = 0.95$
  2. **Cigarette Equivalence Metric** (Berkeley Earth heuristic):
     $$\text{Cigarettes} = \frac{\text{Dose } (\mu\text{g})}{264 \mu\text{g}}$$
     *(One cigarette equivalent corresponds to breathing $22 \mu\text{g/m}^3$ over 24 hours at standard $12 \text{ m}^3$ daily ventilation, yielding $264 \mu\text{g}$ particulate intake).*
  3. **Personal Risk Index ($PRI$)**:
     $$PRI = \min\left(10.0, \, \left(\frac{\text{Dose}}{180 \mu\text{g}}\right) \times \gamma_{\text{sensitivity}}\right)$$
     Demographic multipliers: `normal` ($1.0$), `child` ($1.5$), `elderly` ($1.6$), `pregnant` ($1.8$), `asthma` ($2.0$), `copd` ($2.2$), `cardiovascular` ($2.4$).
- **Input Parameters (Log Exposure)**:
  ```json
  {
    "activity_type": "running_cycling",
    "duration_minutes": 60,
    "h3_index": "8860822607fffff",
    "mask_type": "none"
  }
  ```
- **Output Parameters**:
  ```json
  {
    "id": "f5a6b7c8-6666-4000-a000-000000000006",
    "activity_type": "running_cycling",
    "duration_minutes": 60,
    "ambient_pm25": 100.0,
    "ventilation_rate_m3_min": 0.05,
    "mask_efficiency_pct": 0.0,
    "calculated_intake_dose_ug": 300.0,
    "cigarette_equivalent": 1.14,
    "dose_avoided_with_n95_ug": 285.0,
    "personal_risk_index": 3.33,
    "risk_classification": "Elevated Acute Exposure"
  }
  ```
- **Acceptance Criteria**:
  - *Given* $PM_{2.5} = 100 \mu\text{g/m}^3$, $V_E = 0.05 \text{ m}^3/\text{min}$, $t = 60 \text{ min}$, and `mask_type = "n95_ffp2"`, *When* calculated, *Then* the inhaled dose is strictly $15.0 \mu\text{g}$ ($95\%$ reduction compared to $300.0 \mu\text{g}$).

---

### 4.11 Module 11: User Profile & Health Sensitivity Registry
- **Bounded Context**: Personal Preferences & Spatial Anchor Management (`apps.accounts`, `apps.locations`).
- **User Stories**:
  - *As Mr. Sharma*, I want to register my COPD condition in my profile, so that all system risk scores automatically incorporate my medical vulnerability factor.
  - *As Priya*, I want to save my Home (Sector 43) and Office (Sector 17) locations, so that I can toggle between their air quality with a single tap.
- **Detailed Functional Requirements**:
  1. **Health Sensitivity Profile Setup**:
     - Choices: `normal`, `asthma`, `copd`, `cardiovascular`, `elderly`, `child`, `pregnant`.
     - Baseline physical activity: `sedentary`, `moderate`, `active`, `athlete`.
  2. **Saved Locations Management**:
     - Up to 5 saved locations per user (e.g. `'Home'`, `'Office'`, `'School'`, `'Gym'`).
     - Stored strictly as `h3_index` Resolution 8 cells.
     - Toggleable notification subscriptions per saved location.
  3. **Privacy & Account Controls**:
     - Export personal exposure data in JSON/CSV format.
     - Self-service account deletion (Right to Erasure under DPDP Act 2023).
- **Input Parameters (Saved Location Addition)**:
  ```json
  {
    "label": "Office",
    "h3_index": "8860822605fffff",
    "notification_enabled": true
  }
  ```
- **Output Parameters**:
  ```json
  {
    "id": "a6b7c8d9-7777-4000-a000-000000000007",
    "label": "Office",
    "h3_index": "8860822605fffff",
    "notification_enabled": true,
    "created_at": "2026-11-22T08:35:00Z"
  }
  ```
- **Acceptance Criteria**:
  - *Given* an authenticated user attempts to save a 6th location, *When* the request is sent, *Then* the API returns HTTP 400 with `{"error": {"code": "SAVED_LOCATION_LIMIT_EXCEEDED"}}`.

---

### 4.12 Module 12: Admin Dashboard & Telemetry Health Console
- **Bounded Context**: Operational Governance & Telemetry Auditing (`apps.reports`, `apps.locations`, `apps.air_quality`).
- **User Stories**:
  - *As Municipal Officer Harpreet*, I want to monitor the operational status and packet latency of all 4 CAAQMS stations, so that I can identify offline sensors immediately.
  - *As a system admin*, I want to inspect and moderate citizen incident reports, so that false or abusive submissions are rejected.
- **Detailed Functional Requirements**:
  1. **Sensor Ingestion Telemetry Console**:
     - Displays operational heartbeat for all monitoring stations (`active`, `maintenance`, `inactive`).
     - Shows data freshness: minutes since last recorded packet. Highlights stations with lag $> 60 \text{ minutes}$ in red.
     - Displays packet ingestion success rate over the last 24 hours.
  2. **Citizen Report Moderation Queue**:
     - Filter reports by status (`submitted`, `under_review`, `verified`, `resolved`, `rejected`).
     - Single-click action buttons: "Mark Under Review", "Verify Incident", "Escalate to Field Inspector", "Reject".
     - Inspect sanitized photo evidence without risking location leakage.
  3. **Spatial Broadcast Advisory Dispatcher**:
     - Allows authorized municipal officers to draft and broadcast urgent push alerts to all users located within specific H3 cells (e.g., during acute stubble burning smoke incursions).
  4. **Audit Logs & Activity Trail**:
     - Immutably logs administrative actions (report status transitions, alert broadcasts).
- **Input Parameters (Moderation Action)**:
  ```json
  {
    "report_id": "d4e5f6a7-4444-4000-a000-000000000004",
    "action": "verify",
    "notes": "Field unit dispatched. Burning debris confirmed behind Sector 22 market."
  }
  ```
- **Output Parameters**:
  ```json
  {
    "report_id": "d4e5f6a7-4444-4000-a000-000000000004",
    "status": "verified",
    "moderated_by": "harpreet.singh@cpcc.gov.in",
    "moderated_at": "2026-11-22T08:40:00Z"
  }
  ```
- **Acceptance Criteria**:
  - *Given* an unauthorized citizen user attempts to access the moderation endpoint, *When* the request is submitted, *Then* the API returns HTTP 403 Forbidden.

---

## 5. Cross-Cutting Technical Concerns & Data Dictionaries

### 5.1 Standardized API Request/Response Formats
All DRF API endpoints follow strict RESTful patterns:
- All request payloads and response bodies use JSON with `snake_case` keys.
- All timestamps follow ISO 8601 UTC format (`YYYY-MM-DDTHH:MM:SSZ`).
- All geographic geometry payloads adhere to GeoJSON standard (RFC 7946).
- Standard success envelope for collections includes pagination metadata:
  ```json
  {
    "count": 142,
    "next": "https://api.breathewise.in/api/v1/reports/?page=2",
    "previous": null,
    "results": [...]
  }
  ```

### 5.2 Error Envelopes & Validation Codes
All client and server errors return a consistent error envelope:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid activity type or duration value provided.",
    "details": {
      "duration_minutes": ["Ensure this value is greater than or equal to 1."]
    },
    "timestamp": "2026-11-22T08:45:00Z"
  }
}
```

Standard Error Codes:
- `AUTHENTICATION_FAILED`: Invalid or expired JWT token.
- `PERMISSION_DENIED`: User role lacks required authorization.
- `NOT_FOUND`: Target resource does not exist.
- `VALIDATION_ERROR`: Field schema or constraint violation.
- `INSUFFICIENT_POLLUTANT_DATA`: Fewer than 3 criteria pollutants or no particulate data available to compute NAQI.
- `RATE_LIMIT_EXCEEDED`: API rate limit triggered (HTTP 429).

### 5.3 Audit Trails & Telemetry Logging
- Administrative moderation actions, password changes, and alert broadcasts are written to an append-only audit table.
- System logs strictly redact Authorization headers, passwords, and any transient coordinate parameters.
