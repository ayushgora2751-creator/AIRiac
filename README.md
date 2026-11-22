# AIRiac: Urban Air Quality Assistant (Chandigarh-First)

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![Django 5.1](https://img.shields.io/badge/django-5.1-green.svg)](https://www.djangoproject.com/)
[![React 18.3](https://img.shields.io/badge/react-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-5.4-purple.svg)](https://vitejs.dev/)
[![Docker Compose](https://img.shields.io/badge/docker--compose-6%20services-blue.svg)](https://docs.docker.com/compose/)
[![CPCB NAQI](https://img.shields.io/badge/standard-CPCB%20NAQI-orange.svg)](https://cpcb.nic.in/)

> **Hyper-local, real-time air quality intelligence, health advisories, and clean route decision-support platform designed for the Chandigarh Capital Region (Chandigarh UT, SAS Nagar/Mohali, Panchkula).**

---

## 1. System Architecture Overview

AIRiac is organized as an enterprise-grade monorepo featuring a 13-app modular Django REST Framework backend with PostGIS spatial storage, Celery background workers, Redis caching, and a modern React 18 TypeScript frontend with interactive Leaflet mapping and Recharts diurnal trend visualization.

```
                          ┌───────────────────────────┐
                          │   Frontend SPA (Vite/TS)  │
                          │   Port 5173 / Leaflet Map │
                          └─────────────┬─────────────┘
                                        │
                               REST API │ Bearer JWT
                                        ▼
                          ┌───────────────────────────┐
                          │   Django REST API Service │
                          │   Port 8000 / Python 3.12 │
                          └──────┬─────────────┬──────┘
                                 │             │
                ┌────────────────┴───┐     ┌───┴────────────────┐
                ▼                    ▼     ▼                    ▼
     ┌────────────────────┐   ┌───────────────┐   ┌────────────────────┐
     │ PostgreSQL/PostGIS │   │    Redis 7    │   │ Celery Beat & Tasks│
     │     Port 5432      │   │   Port 6379   │   │  Worker Processes  │
     └────────────────────┘   └───────────────┘   └────────────────────┘
```

### Key Architectural Highlights
- **13 Modular Domain Apps**: `accounts`, `locations`, `air_quality`, `weather`, `fires`, `forecasting`, `impact`, `advice`, `alerts`, `reports`, `planning`, `community`, and `geo`.
- **Zero-External Network Reliance in Phase 0**: Abstract data provider layer with deterministic, time-seeded mock fixtures adhering to CPCB NAQI calculation rules.
- **Geospatial Intelligence**: PostGIS spatial indexing on Chandigarh sectors and continuous ambient air quality monitoring stations (CAAQMS).
- **Interactive Documentation**: OpenAPI 3.0 specification auto-generated via `drf-spectacular` at `/api/docs/` and `/api/redoc/`.

---

## 2. Monorepo Repository Structure

```text
AIRiac/
├── .env.example                     # Environment template (9 configuration sections)
├── .gitignore                       # Git ignore rules for Python, Node, OS, & secrets
├── README.md                        # Project documentation & developer quickstart
├── docker-compose.yml               # 6-service orchestration specification
├── config/                          # Monorepo configuration
│   └── .editorconfig                # Global formatting standards
├── docs/                            # Architectural & technical design specifications
│   ├── PHASE_0_PLAN.md              # Written Phase 0 plan & scaffolding proposal
│   ├── ARCHITECTURE.md              # 13-app backend architecture & data models
│   └── API_CONTRACTS.md             # REST API contracts & OpenAPI schemas
├── backend/                         # Django 5.1 REST API Service
│   ├── Dockerfile                   # Python 3.12 container with PostGIS C-libraries
│   ├── manage.py                    # Django management utility
│   ├── pyproject.toml               # Python project configuration & dependencies
│   ├── requirements.txt             # Locked Python dependencies
│   ├── pytest.ini                   # Pytest runner configuration
│   ├── scripts/entrypoint.sh        # Container database readiness & migration runner
│   ├── config/                      # Core Django settings, URLs, Celery setup
│   ├── apps/                        # 13 Modular domain applications
│   ├── providers/                   # Data provider abstraction & mock generators
│   └── tests/                       # Automated pytest test suites
└── frontend/                        # Vite React TypeScript SPA
    ├── Dockerfile                   # Node.js Alpine container
    ├── package.json                 # React, Leaflet, Recharts, TanStack Query
    ├── vite.config.ts               # Vite build & test configuration
    ├── tsconfig.json                # TypeScript compiler configuration
    ├── tailwind.config.js           # Tailwind theme with Indian NAQI color palette
    └── src/                         # Application source (components, api, context)
```

---

## 3. Quickstart: Development Modes

AIRiac supports two development modes: **Containerized (Docker Compose)** and **Local Host Development**.

### Prerequisites

| Tool | Recommended Version | Purpose |
|---|---|---|
| **Docker & Docker Compose** | Docker 24+ / Compose v2.20+ | Multi-service container orchestration |
| **Python** | 3.12 (via `uv` or python.org) | Backend API development & pytest execution |
| **Node.js & npm** | Node v20+ / npm 10+ | Frontend React SPA development & Vitest |
| **uv** (Optional) | Latest | Fast Python package management |

---

### Option A: Containerized Mode (Docker Compose) — Recommended

Docker Compose runs all 6 services with zero manual database or Redis configuration:

1. **Clone and Configure Environment**:
   ```bash
   cp .env.example .env
   ```

2. **Build and Launch All Services**:
   ```bash
   docker compose up --build
   ```

3. **Verify Service Health**:
   - Frontend Application: [http://localhost:5173](http://localhost:5173)
   - Django REST API: [http://localhost:8000](http://localhost:8000)
   - Health Diagnostic: [http://localhost:8000/api/v1/health/](http://localhost:8000/api/v1/health/)
   - Interactive Swagger API Docs: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
   - Redoc API Documentation: [http://localhost:8000/api/redoc/](http://localhost:8000/api/redoc/)

4. **Stop Services**:
   ```bash
   docker compose down
   ```

---

### Option B: Local Host Development Mode

#### 1. Backend Setup (Python 3.12)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment with Python 3.12
uv venv --python 3.12 .venv
# or: python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start Django development server
python manage.py runserver 127.0.0.1:8000
```

#### 2. Frontend Setup (Node.js 20+)
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend dev server launches at `http://localhost:5173` with Hot Module Replacement (HMR) and an automatic proxy to `http://localhost:8000`.

---

## 4. Testing & Verification

AIRiac maintains rigorous automated testing baselines on both backend and frontend.

### Backend Pytest Suite
```bash
cd backend
pytest -v
```
Tests cover:
- Health check endpoint verifying database cursor execution and cache round-trips.
- User registration, JWT login, token rotation, and protected `/api/v1/auth/me/` endpoint.
- Pure Python CPCB NAQI calculation math against official government test vectors.
- Minimum 3-pollutant rule, mandatory PM2.5/PM10 requirement, and prominent pollutant logic.
- Mock provider determinism with zero external network socket access.

### Frontend Vitest Suite
```bash
cd frontend
npm run test
```
Tests cover:
- Top bar and live backend connectivity status pill.
- Indian NAQI 6-band color badge and severity label mapping.
- Health advisory card rendering based on current AQI categories.
- Axios API client bearer token injection and transparent 401 token refresh retry logic.
- Application mount and TanStack Query provider smoke test.

---

## 5. Indian National Air Quality Index (NAQI) Scale

AIRiac strictly adheres to the Central Pollution Control Board (CPCB) 6-band standard:

| AQI Band | Health Category | Color Code | Indicative Symptoms & Impact |
|---|---|---|---|
| **0 – 50** | **Good** | `#00B050` (Green) | Minimal health impact; ideal for all outdoor activities. |
| **51 – 100** | **Satisfactory** | `#92D050` (Light Green) | Minor breathing discomfort to sensitive people. |
| **101 – 200** | **Moderate** | `#E5B800` (Yellow) | Breathing discomfort to people with asthma, lungs, and heart diseases. |
| **201 – 300** | **Poor** | `#FF7C80` (Orange) | Breathing discomfort to most people on prolonged exposure. |
| **301 – 400** | **Very Poor** | `#C00000` (Red) | Respiratory illness on prolonged exposure; severe impact on sensitive groups. |
| **401 – 500** | **Severe** | `#7030A0` (Purple) | Affects healthy people and seriously impacts those with existing diseases. |

---

## 6. Monorepo Documentation Index

Detailed architectural blueprints, design contracts, and planning specifications are available in `docs/`:
- [`docs/PHASE_0_PLAN.md`](docs/PHASE_0_PLAN.md): Complete Phase 0 written plan, service specifications, environment variables catalog, and migration order.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): Detailed 13-app modular architecture, PostGIS geospatial design, and frontend component models.
- [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md): Comprehensive REST API endpoint contracts, request/response JSON schemas, and CPCB NAQI formats.

---

## 7. License & Credits

- Developed for the **Chandigarh Clean Air Initiative**.
- Standards based on Central Pollution Control Board (CPCB) India Guidelines (2014).
