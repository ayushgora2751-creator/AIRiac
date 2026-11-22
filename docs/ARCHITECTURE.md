# AIRiac: Urban Air Quality & Exposure Platform (Pan-India)
# System Architecture & Technical Specifications

**Document**: `docs/ARCHITECTURE.md`  
**Version**: 2.0.0  
**Status**: Read-Only Architecture Audit Completed  
**Author**: Ayush Gora  
**Geographic Target**: India Pan-City (Chandigarh UT, Delhi NCR, Ludhiana, Amritsar, Jalandhar, Mumbai, Bengaluru, etc.)

---

## 1. Executive Summary & Stack Identification

AIRiac is a full-stack, enterprise-grade environmental intelligence platform designed to monitor air pollution, calculate official Indian National Air Quality Index (NAQI) scores, predict atmospheric trends, plan clean travel routes, track personal respiratory exposure, and provide AI-driven conversational health advisories.

### Identified Technology Stack

| Layer | Technologies & Frameworks | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18.3**, **Vite 5.4**, **TypeScript 5.5** | High-performance Single Page Application (SPA) with strict type safety, HMR, and component modularity. |
| **Styling & Design** | **Tailwind CSS 3.4**, **Lucide React** | Dark-mode, glassmorphic card design system with official CPCB NAQI color coding tokens. |
| **Spatial & Visualization** | **React Leaflet**, **Leaflet 1.9**, **Recharts 2.12** | Interactive CAAQMS station mapping, choropleth overlays, and 24-hour diurnal pollutant concentration curves. |
| **3D Atmospheric Engine** | **@splinetool/react-spline**, **Three.js** | Interactive 3D planetary atmosphere and particulate dispersion visualizer. |
| **State & Data Fetching** | **TanStack Query v5**, **React Context API** | Server state caching, optimistic updates, background polling, and centralized client authentication. |
| **Backend Framework** | **Python 3.14**, **Django 6.0.10**, **Django REST Framework (DRF)** | Modular REST API service with 13 domain applications, JWT authentication, and OpenAPI 3.0 schema generation. |
| **Database & Spatial** | **SQLite (Dev) / PostgreSQL 16 + PostGIS (Prod)** | Native geospatial vector geometries (`PointField`, `PolygonField`, `LineStringField`) with `GIST` indexing. |
| **Async Tasks & Caching** | **Celery**, **Redis 7** (with LocMem fallback) | Background data ingestion, alert dispatch queues, and weather cache. |
| **Real Data Sources** | **OpenAQ v3**, **OpenWeather API**, **CPCB NAQI Engine**, **CartoDB / OpenStreetMap** | Multi-source real-time pollutant observations, surface meteorology, and boundary-layer modeling. |
| **AI Provider** | **Google Gemini API** (`gemini-flash-latest`, `gemma-4-26b-a4b-it`) | Context-aware generative air quality assistant with CPCB health guideline grounding and rule-based safety fallback. |
| **Alerts & Logistics** | **Mailercloud API**, **Shipday API** | Multi-channel email pollution threshold alerts and on-demand emergency N95 mask / air filter delivery coordination. |
| **Hosting & Deployment** | **Render / Vercel** (`airiac-frontend.onrender.com`) | Cloud-native deployment ready with separate static SPA and WSGI application containers. |

---

## 2. System Topology & Data Flow

```
                                  ┌─────────────────────────────────────────────────────┐
                                  │                  Browser Client                     │
                                  │   (React 18 + Vite + Tailwind + Leaflet + 3D)       │
                                  └──────────────────────────┬──────────────────────────┘
                                                             │
                                                  REST JSON / Bearer JWT
                                                             │
                                                             ▼
                                  ┌─────────────────────────────────────────────────────┐
                                  │             Django REST API Gateway                 │
                                  │            (backend/config/urls.py)                 │
                                  └─────┬───────────────────┬─────────────────────┬─────┘
                                        │                   │                     │
                     ┌──────────────────┴──┐         ┌──────┴──────┐        ┌─────┴───────────────┐
                     ▼                     ▼         ▼             ▼        ▼                     ▼
             ┌───────────────┐     ┌───────────────┐   ┌────────────────┐   ┌─────────────────────────┐
             │ Air Quality & │     │ Planning &    │   │ AI Assistant   │   │ Alerts & Logistics      │
             │ CPCB NAQI App │     │ Clean Route   │   │ (Gemini Flash) │   │ (Mailercloud / Shipday) │
             └───────┬───────┘     └───────┬───────┘   └───────┬────────┘   └─────────────┬───────────┘
                     │                     │                   │                          │
                     ▼                     ▼                   ▼                          ▼
      ┌──────────────────────────────────────────────┐ ┌───────────────┐   ┌──────────────────────────┐
      │          Data Ingestion Providers            │ │ Google Gemini │   │ External Delivery &      │
      │ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │ │ API           │   │ Notification Services    │
      │ │ OpenAQ v3    │ │ OpenWeather  │ │ CPCB   │ │ └───────────────┘   └──────────────────────────┘
      │ └──────────────┘ └──────────────┘ └────────┘ │
      └──────────────────────┬───────────────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │  PostgreSQL 16 + PostGIS    │
              │  (Stations, Readings, Geo)  │
              └─────────────────────────────┘
```

---

## 3. Backend Architecture: 13 Domain Applications

The Django backend is modularized under `backend/apps/`:

1. **`accounts`**: User management, custom roles (citizen, official, researcher), JWT authentication (`rest_framework_simplejwt`), and health vulnerability profiles.
2. **`locations`**: Geo-spatial registry of Indian cities, municipal wards, and Continuous Ambient Air Quality Monitoring Stations (CAAQMS).
3. **`air_quality`**: Pollutant records ($PM_{2.5}, PM_{10}, NO_2, SO_2, CO, O_3, NH_3$), sub-index generators, and official CPCB NAQI piecewise linear interpolation.
4. **`weather`**: Surface meteorology (temperature, relative humidity, wind speed, wind direction, boundary layer inversion depth).
5. **`fires`**: Thermal anomalies and agricultural stubble fire detection (MODIS / VIIRS FRP data).
6. **`forecasting`**: 24h, 48h, and 72h predictive AQI curves, diurnal variation profiles, and confidence intervals.
7. **`impact`**: Physiological health impact evaluation matrices mapped across vulnerable groups (asthma, children, elderly, cardiac patients).
8. **`advice`**: Rule-based health precautions and integration with **Google Gemini API** for personalized, natural-language Q&A.
9. **`alerts`**: User-defined AQI threshold alarms with multi-channel dispatch via **Mailercloud**.
10. **`reports`**: Daily and weekly NAAQS regulatory compliance audits and executive summaries.
11. **`planning`**: CleanRoute exposure minimization algorithms computing lowest-pollution paths between two coordinates.
12. **`community`**: Citizen pollution incident reporting (stubble burning, trash fires, industrial emissions) with community upvoting and verification.
13. **`geo`**: Spatial bounding boxes, haversine and PostGIS distance calculations, and IP geolocation resolver via **IPStack**.

---

## 4. Frontend Architecture & Current Inconsistencies (Part 1 Audit)

### 4.1 Identified Inconsistencies & Root Causes

1. **AQI Value Discrepancies across Components**:
   - *Symptom*: Header shows 301 (Very Poor), CityOverview shows 184 (Moderate), Hourly strip references 299, and the AI Assistant replies with conflicting data.
   - *Root Cause*: Components currently query distinct endpoints or fallback to hardcoded mock states independently without a unified parent store.
   - *Solution*: Introduce `AirQualityContext` (`frontend/src/context/AirQualityContext.tsx`) as the single source of truth. Every card, chart, map marker, and the AI prompt will consume data from this store.

2. **City State Not Propagated Globally**:
   - *Symptom*: Selecting "Ludhiana" updates the overview, but the footer displays "Chandigarh-First" and the header dropdown resets to Chandigarh.
   - *Root Cause*: City state is kept in local component state rather than top-level shared context, and footer strings are hardcoded.
   - *Solution*: Elevate city selection into the global context with automatic persistence to `localStorage` and fallback to IPStack geolocation. Make all UI labels, footer notes, and station filters read from this state.

3. **Development Artifacts in UI**:
   - *Symptom*: Strings like `"Phase 0 Integration Baseline · Zero External News"` appear in the footer.
   - *Root Cause*: Initial project scaffolding labels were never removed or gated.
   - *Solution*: Remove obsolete scaffolding labels and gate any diagnostic badges behind `import.meta.env.DEV`.

4. **3D Atmosphere View Blank Modal**:
   - *Symptom*: The 3D Earth modal renders a blank black canvas or axis lines.
   - *Root Cause*: Spline scene URL dependency failed to load or WebGL context was not properly initialized with fallback handling.
   - *Solution*: Build a resilient Three.js / Canvas-based particulate globe with a loading spinner and graceful WebGL compatibility fallback.

5. **City Dropdown Overlay Issue**:
   - *Symptom*: City selector menu remains open when clicking outside, obstructing the community feed.
   - *Root Cause*: Missing outside-click listener (`mousedown` on `document`) and keyboard `Escape` handler.
   - *Solution*: Add clean click-outside and Escape key hooks to auto-dismiss the dropdown.

6. **CPCB NAQI Breakpoint Standardization**:
   - *Symptom*: PM10 and PM2.5 thresholds are evaluated slightly differently across components.
   - *Solution*: Centralize official CPCB breakpoints in `frontend/src/constants/aqi.ts` and use them across all components.

---

## 5. Next Steps & Execution Roadmap

- [x] Read-Only Codebase Audit & Stack Identification
- [x] Update `docs/ARCHITECTURE.md`
- [ ] **Part 1**: Fix existing bugs and inconsistencies (Single source of truth, City state, Development artifacts, 3D globe, Dropdown behavior, NAQI breakpoints)
- [ ] **Part 2**: Implement Feature Gaps P1 through P6 (Trends, Alerts, Heatmap, Community Moderation, Review System, i18n, PWA, Tests)
