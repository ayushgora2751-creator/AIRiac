# BreatheWise: Frontend Architecture & UI/UX Design Specification
## Production-Grade React 18+, TypeScript 5, Vite 5, Tailwind CSS, Leaflet 1.9 & Recharts Design System

**Document Identifier**: `FRONTEND_DESIGN.md`  
**System Name**: BreatheWise Urban Air Quality Assistance Platform  
**Target Region**: Chandigarh Urban Agglomeration (30.65°N–30.80°N, 76.70°E–76.85°E)  
**Standard Compliance**: Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) Standard  
**Accessibility Target**: WCAG 2.1 AA Compliant  
**Document Version**: 2.0.0  
**Status**: Authoritative Frontend Specification Baseline  

---

## Table of Contents
1. [Executive Frontend Summary & Technology Stack](#1-executive-frontend-summary--technology-stack)
   - 1.1 Architecture & Tooling Overview
   - 1.2 Core Dependencies & Library Selection
2. [Design Tokens, Typography & Theming System](#2-design-tokens-typography--theming-system)
   - 2.1 Official Indian CPCB NAQI 6-Band Color System & Contrast Mandate
   - 2.2 Semantic Neutral & Surface Color Scales (Light & Dark Mode)
   - 2.3 Typography Scale (Inter & JetBrains Mono)
   - 2.4 Spacing, Elevation & Z-Index Tokens
3. [Directory Tree & Architecture Layout](#3-directory-tree--architecture-layout)
   - 3.1 Source Directory Hierarchy (`frontend/src/`)
   - 3.2 Feature-Based Modular Architecture
4. [Component Hierarchy (Atomic Design System)](#4-component-hierarchy-atomic-design-system)
   - 4.1 Atoms (Foundational Primitives)
   - 4.2 Molecules (Composite Controls & Gauges)
   - 4.3 Organisms (Complex Functional Panels & Visualizers)
   - 4.4 Templates & Layouts
5. [Comprehensive Page Layouts & Wireframes (All 12 Modules)](#5-comprehensive-page-layouts--wireframes-all-12-modules)
   - 5.1 Module 1: Landing Page (Public Hero & Real-Time Ticker)
   - 5.2 Module 2: Authentication & Authorization (Login, Register & Health Profile)
   - 5.3 Module 3: Dashboard (Personalized Air Quality Command Center)
   - 5.4 Module 4: Interactive Pollution Map (Leaflet & Uber H3 Hex Layer)
   - 5.5 Module 5: Analytics & NAAQS Regulatory Benchmarking
   - 5.6 Module 6: Forecast Engine (72-Hour Confidence Intervals)
   - 5.7 Module 7: AI Assistant (Guardrailed Natural Language Advisory)
   - 5.8 Module 8: Smart Alerts & Notification Settings
   - 5.9 Module 9: Citizen Reporting (Crowdsourced Hazards & EXIF Stripping)
   - 5.10 Module 10: Exposure Tracker & Physiological Impact Engine
   - 5.11 Module 11: User Profile & Health Sensitivity Registry
   - 5.12 Module 12: Admin Dashboard & Telemetry Health Console
6. [State Management Architecture: Zustand & TanStack Query v5](#6-state-management-architecture-zustand--tanstack-query-v5)
   - 6.1 Client State with Zustand Stores
   - 6.2 Server State with TanStack Query (React Query v5)
   - 6.3 Polling, Invalidation & Optimistic Updates
7. [Leaflet 1.9 Interactive Geospatial Map Integration](#7-leaflet-19-interactive-geospatial-map-integration)
   - 7.1 Map Initialization & Bounding Restrictions
   - 7.2 Custom Uber H3 Hexagon GeoJSON Layer Rendering
   - 7.3 Station Markers & Pulsing Status Rings
   - 7.4 Citizen Hazard & Satellite Fire Hotspot Overlays
   - 7.5 Map Control Panels & Layer Switcher
8. [Recharts Visualization Architecture](#8-recharts-visualization-architecture)
   - 8.1 Multi-Pollutant Historical Line Charts
   - 8.2 24-Hour Diurnal Cycle Area Charts
   - 8.3 72-Hour Forecast Confidence Band Visualization ($CI_{low}, CI_{high}$)
   - 8.4 NAAQS Reference Lines & Exceedance Markers
9. [Form Handling, Validation Schemas & Error Management](#9-form-handling-validation-schemas--error-management)
   - 9.1 React Hook Form + Zod Integration
   - 9.2 Global API Error Interception & Field Mapping
10. [Responsive Breakpoints & Accessibility (WCAG 2.1 AA)](#10-responsive-breakpoints--accessibility-wcag-21-aa)
    - 10.1 Responsive Grid Breakpoints
    - 10.2 WCAG 2.1 AA Contrast Ratios & Yellow Band Rule
    - 10.3 Screen Reader & Keyboard Navigation Standards

---

## 1. Executive Frontend Summary & Technology Stack

### 1.1 Architecture & Tooling Overview
The BreatheWise client application is engineered as a high-performance Single Page Application (SPA) prioritizing instantaneous visual feedback, sub-second map interactions, and crystal-clear environmental risk communication. The application is completely decoupled from the Django REST backend, consuming authenticated REST endpoints with JWT tokens and utilizing local browser storage for caching spatial and user session state.

- **Framework**: React 18.3+ (Functional Components, Hooks, Concurrent Features)
- **Language**: TypeScript 5.4+ (Strict typing, zero `any` policy, shared API DTO interfaces)
- **Build System & Dev Server**: Vite 5.2+ (Lightning-fast HMR, Rollup optimized code-splitting)
- **CSS Architecture**: Tailwind CSS 3.4+ with `@tailwindcss/typography`, `@tailwindcss/forms`, and custom design tokens
- **Routing**: React Router v6.23+ with protected route wrappers and dynamic route splitting
- **Package Manager**: pnpm (Deterministic dependency resolution and disk efficiency)

### 1.2 Core Dependencies & Library Selection
| Library | Version | Purpose | Architectural Rationale |
|---|---|---|---|
| `react` & `react-dom` | `^18.3.1` | View Layer | Virtual DOM, concurrent rendering, transitions |
| `typescript` | `^5.4.5` | Type Safety | End-to-end type safety matching DRF serializers |
| `@tanstack/react-query` | `^5.38.0` | Server State Management | Cache invalidation, automated 15-min background polling |
| `zustand` | `^4.5.2` | Client / Session State | Lightweight, boilerplate-free state without Context thrashing |
| `leaflet` & `react-leaflet`| `^1.9.4` / `^4.2.1` | Geospatial Map Engine | High-performance canvas rendering for H3 hexagons |
| `h3-js` | `^4.1.0` | Spatial Grid Computation | Client-side H3 cell boundary calculation & geo-to-hex |
| `recharts` | `^2.12.7` | Data Visualization | Declarative SVG charting for diurnal cycles & confidence bands |
| `lucide-react` | `^0.378.0` | Iconography | Clean, modern feather-based SVG icons with tree-shaking |
| `react-hook-form` | `^7.51.5` | Form State Management | Performant, uncontrolled form validation |
| `zod` | `^3.23.8` | Schema Validation | Schema-first form and runtime API response verification |
| `axios` | `^1.7.2` | HTTP Client | Interceptors for SimpleJWT refresh token rotation |
| `date-fns` | `^3.6.0` | Date & Time Utilities | Lightweight UTC to IST conversions and formatting |

---

## 2. Design Tokens, Typography & Theming System

### 2.1 Official Indian CPCB NAQI 6-Band Color System & Contrast Mandate
BreatheWise strictly adheres to the official color scale mandated by the Central Pollution Control Board (MoEFCC, Government of India).

**Critical Accessibility & WCAG 2.1 AA Mandate**:
Light and mid-tone background colors—specifically Good (`#00B050`, contrast 2.87:1 against white), Satisfactory (`#92D050`, contrast 1.85:1 against white), Moderate (`#FFFF00`, contrast 1.07:1 against white), and Poor (`#FF9900`, contrast 2.14:1 against white)—severely fail WCAG 2.1 AA standards (minimum 4.5:1 required for normal text) when paired with white text.

Therefore, across all UI components (badges, pills, chips, summary cards, and map tooltips):
- **Good, Satisfactory, Moderate, and Poor bands must strictly use dark slate text (`#0F172A` / `#1A202C` / `text-slate-900`)**, ensuring contrast ratios from `5.69:1` up to `16.62:1` (exceeding WCAG 2.1 AA and AAA).
- **Very Poor and Severe bands use crisp white text (`#FFFFFF` / `text-white`)**, guaranteeing contrast ratios between `4.00:1` / `4.83:1` and `8.31:1`.

```
+─────────────────────────────────────────────────────────────────────────────────────────────+
|                                CPCB NAQI OFFICIAL COLOR BANDS                               |
+──────────────┬───────────┬──────────────┬───────────────┬─────────────┬─────────────────────+
| Category     | NAQI Band | Hex Color    | Tailwind Class| Text Color  | Semantic Health Risk|
+──────────────┼───────────┼──────────────┼───────────────┼─────────────┼─────────────────────+
| Good         | 0 – 50    | #00B050      | bg-emerald-500| text-slate-900* Minimal impact      |
| Satisfactory | 51 – 100  | #92D050      | bg-lime-500   | text-slate-900* Minor breathing     |
| Moderate     | 101 – 200 | #FFFF00      | bg-yellow-400 | text-slate-900* Breathing discomfort|
| Poor         | 201 – 300 | #FF9900      | bg-orange-500 | text-slate-900* Breathing discomfort|
| Very Poor    | 301 – 400 | #FF0000      | bg-red-600    | text-white  | Respiratory illness |
| Severe       | 401 – 500+| #C00000      | bg-rose-900   | text-white  | Affects healthy lungs|
+──────────────┴───────────┴──────────────┴───────────────┴─────────────┴─────────────────────+
* Mandatory dark slate text (#0F172A / #1A202C) for WCAG 2.1 AA compliance (contrast >= 4.5:1).
```

#### Tailwind Configuration Tokens (`tailwind.config.js`)
```javascript
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        naqi: {
          good: {
            DEFAULT: '#00B050',
            bg: '#E6F7EE',
            border: '#009040',
            dark: '#10B981',
          },
          satisfactory: {
            DEFAULT: '#92D050',
            bg: '#F4FBEB',
            border: '#7CB33E',
            dark: '#84CC16',
          },
          moderate: {
            DEFAULT: '#FFFF00',
            bg: '#FFFFE5',
            border: '#D4D400',
            dark: '#FACC15',
            text: '#1A202C', // Mandatory dark text
          },
          poor: {
            DEFAULT: '#FF9900',
            bg: '#FFF5E5',
            border: '#D98200',
            dark: '#F97316',
          },
          verypoor: {
            DEFAULT: '#FF0000',
            bg: '#FFE5E5',
            border: '#D40000',
            dark: '#EF4444',
          },
          severe: {
            DEFAULT: '#C00000',
            bg: '#F9E5E5',
            border: '#9E0000',
            dark: '#991B1B',
          },
        },
        brand: {
          50: '#F0F9FF',
          500: '#0284C7',
          600: '#0369A1',
          900: '#0C4A6E',
        }
      }
    }
  }
}
```

---

### 2.2 Semantic Neutral & Surface Color Scales (Light & Dark Mode)
| Token Name | Light Mode Value | Dark Mode Value | Usage Description |
|---|---|---|---|
| `surface-ground` | `#F8FAFC` (`slate-50`) | `#0F172A` (`slate-900`) | Main application canvas backdrop |
| `surface-card` | `#FFFFFF` (`white`) | `#1E293B` (`slate-800`) | Card containers, modal sheets, panels |
| `surface-overlay` | `#FFFFFF` (`white`) | `#334155` (`slate-700`) | Dropdowns, popovers, tooltips |
| `text-primary` | `#0F172A` (`slate-900`) | `#F8FAFC` (`slate-50`) | Primary headlines, key metrics |
| `text-secondary` | `#475569` (`slate-600`) | `#94A3B8` (`slate-400`) | Subtitles, labels, timestamps |
| `text-muted` | `#94A3B8` (`slate-400`) | `#64748B` (`slate-500`) | Placeholder text, disabled hints |
| `border-subtle` | `#E2E8F0` (`slate-200`) | `#334155` (`slate-700`) | Card outlines, table dividers |
| `border-focus` | `#0284C7` (`sky-600`) | `#38BDF8` (`sky-400`) | Active input and element focus rings |

---

### 2.3 Typography Scale (Inter & JetBrains Mono)
- **Primary Font**: `Inter, system-ui, -apple-system, sans-serif` (Optimal readability for UI controls and text).
- **Monospace Font**: `JetBrains Mono, Menlo, monospace` (For NAQI numerical figures, sensor telemetry, GPS coordinates, and H3 cell indexes).

| Style | Font Family | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| `display-2xl` | JetBrains Mono | 4.5rem (72px) | Bold (700) | 1.0 | Hero NAQI Dial Numerical Value |
| `heading-xl` | Inter | 2.25rem (36px) | Bold (700) | 1.25 | Page Titles, Hero Headlines |
| `heading-lg` | Inter | 1.5rem (24px) | SemiBold (600) | 1.33 | Module Card Headers, Section Titles |
| `heading-md` | Inter | 1.25rem (20px) | SemiBold (600) | 1.4 | Station Names, Modal Headers |
| `body-base` | Inter | 1.0rem (16px) | Regular (400) | 1.5 | Paragraphs, Chat Messages, Form Inputs |
| `body-sm` | Inter | 0.875rem (14px) | Medium (500) | 1.43 | Secondary Descriptions, Table Cells |
| `caption` | JetBrains Mono | 0.75rem (12px) | Regular (400) | 1.33 | Timestamps, H3 Hashes, Sensor Units |

---

### 2.4 Spacing, Elevation & Z-Index Tokens
- **Elevation Shadows**:
  - `shadow-sm`: `0 1px 2px 0 rgb(0 0 0 / 0.05)` (Subtle borders, list items)
  - `shadow-md`: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` (Cards, station tiles)
  - `shadow-xl`: `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` (Modals, map popups)
- **Z-Index Layer Hierarchy**:
  - `z-map-tile`: 100
  - `z-map-geojson`: 200
  - `z-map-marker`: 300
  - `z-map-controls`: 400
  - `z-sticky-nav`: 500
  - `z-drawer`: 600
  - `z-modal`: 700
  - `z-toast-notification`: 800

---

## 3. Directory Tree & Architecture Layout

### 3.1 Source Directory Hierarchy (`frontend/src/`)
```
frontend/
├── public/
│   ├── favicon.svg
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── assets/
│   │   ├── logo.svg
│   │   └── sounds/
│   ├── components/                 # Global Shared UI Components (Atomic)
│   │   ├── ui/                     # Atoms
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── AQIIndicator.tsx
│   │   ├── layout/                 # Layout Shells & Navbars
│   │   │   ├── AppHeader.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── Footer.tsx
│   │   └── feedback/               # Alerts, Toasts & Empty States
│   │       ├── ToastContainer.tsx
│   │       ├── EmptyState.tsx
│   │       └── ErrorBoundary.tsx
│   ├── features/                   # Domain Modules (12 Modules)
│   │   ├── landing/                # Module 1: Landing Page
│   │   ├── auth/                   # Module 2: Authentication & RBAC
│   │   ├── dashboard/              # Module 3: Command Center Dashboard
│   │   ├── map/                    # Module 4: Leaflet & H3 Hex Map
│   │   ├── analytics/              # Module 5: Diurnal & NAAQS Trends
│   │   ├── forecast/               # Module 6: 72h Projections & Confidence
│   │   ├── assistant/              # Module 7: Guardrailed AI Chat
│   │   ├── alerts/                 # Module 8: Smart Alerts & Preferences
│   │   ├── reports/                # Module 9: Citizen Reporting & EXIF
│   │   ├── exposure/               # Module 10: Inhaled Dose & Cigarettes
│   │   ├── profile/                # Module 11: Health Registry & Saved Locs
│   │   └── admin/                  # Module 12: Admin & Telemetry Health
│   ├── hooks/                      # Custom React Hooks
│   │   ├── useAQIQuery.ts
│   │   ├── useH3Grid.ts
│   │   ├── useGeolocation.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── services/                   # Axios API Clients & Endpoints
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   ├── airQualityService.ts
│   │   ├── mapService.ts
│   │   ├── forecastService.ts
│   │   ├── assistantService.ts
│   │   ├── alertService.ts
│   │   ├── reportService.ts
│   │   └── exposureService.ts
│   ├── stores/                     # Zustand State Stores
│   │   ├── authStore.ts
│   │   ├── mapStore.ts
│   │   ├── uiStore.ts
│   │   └── filterStore.ts
│   ├── types/                      # TypeScript Contracts & Interfaces
│   │   ├── api.types.ts
│   │   ├── aqi.types.ts
│   │   ├── user.types.ts
│   │   ├── map.types.ts
│   │   ├── report.types.ts
│   │   └── exposure.types.ts
│   ├── utils/                      # Pure Helper Functions
│   │   ├── cpcbCalculator.ts
│   │   ├── h3Utils.ts
│   │   ├── colorScales.ts
│   │   ├── formatters.ts
│   │   └── exifStripper.ts
│   ├── App.tsx                     # Root App Component & Route Provider
│   ├── main.tsx                    # React DOM Entrypoint
│   └── index.css                   # Tailwind Directive Imports
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Component Hierarchy (Atomic Design System)

```
+─────────────────────────────────────────────────────────────────────────────+
|                            COMPONENT HIERARCHY                              |
+─────────────────────────────────────────────────────────────────────────────+
|  PAGES (12 Modules)                                                         |
|  └── TEMPLATES / LAYOUTS (AppLayout, DashboardLayout, AdminLayout)          |
|      └── ORGANISMS (LeafletMap, ForecastChart, DiurnalAreaChart, ChatWindow)|
|          └── MOLECULES (StationCard, AQIDialGauge, PollutantBar, MetricTile)|
|              └── ATOMS (Button, Badge, Input, AQIIndicator, Spinner)        |
+─────────────────────────────────────────────────────────────────────────────+
```

### 4.1 Atoms (Foundational Primitives)
- `Button`: Primary, secondary, danger, ghost variants with loading spinner support.
- `Badge`: Categorical pills with CPCB color background, font bold, and accessible contrast.
- `AQIIndicator`: Circular chip displaying NAQI number and category badge.
- `Input`: Accessible form inputs with floating labels, error text, and focus states.
- `Slider`: Range slider for duration, NAQI threshold, and time scrubbing.
- `Tooltip`: Hover/focus explanation for criteria pollutants and NAAQS standard limits.

### 4.2 Molecules (Composite Controls & Gauges)
- `StationCard`: Compact card showing station name, operator, distance, live NAQI, and primary pollutant.
- `AQIDialGauge`: Semi-circular SVG gauge displaying 0–500 NAQI scale with needle and color segments.
- `PollutantBar`: Horizontal progress bar showing current pollutant concentration against NAAQS standard.
- `MetricTile`: Stat card displaying metric title, current value, unit, and rate-of-change indicator.
- `ForecastDayCard`: 7-day forecast pill with daily max/min PM2.5, category icon, and advisory chip.
- `HazardListItem`: Incident card with thumbnail image, distance, upvote counter, and status pill.
- `ChatBubble`: User query vs. Assistant response bubble with grounding data badge.

### 4.3 Organisms (Complex Functional Panels & Visualizers)
- `AppHeader`: Sticky top bar with logo, live Chandigarh average ticker, notification bell, theme toggle, and user avatar.
- `LeafletMapContainer`: Full-viewport interactive map with H3 GeoJSON layer, station pins, hazard overlays, and metric controls.
- `ForecastConfidenceChart`: Recharts composed visualization with shaded confidence band ($CI_{low}, CI_{high}$) and predicted line.
- `DiurnalAreaChart`: 24-hour diurnal cycle showing diurnal peak/trough hours and solar convection curves.
- `ExposureLogModal`: Interactive modal with activity selector, duration slider, mask toggles, and real-time dose preview.
- `CitizenReportModal`: Multi-step hazard submission wizard with client-side EXIF stripping verification.
- `ChatWindow`: Natural language chat thread with auto-scrolling, quick prompt chips, and citation links.

---

## 5. Comprehensive Page Layouts & Wireframes (All 12 Modules)

### 5.1 Module 1: Landing Page (Public Hero & Real-Time Ticker)
- **Route**: `/`
- **Purpose**: Welcomes visitors, shows city-wide average NAQI, live station breakdown, platform capabilities, and call-to-action for registration.

```
+─────────────────────────────────────────────────────────────────────────────+
| [BreatheWise Logo]  Live: Chandigarh NAQI 178 (MODERATE)   [Map] [Login] [Register]|
+─────────────────────────────────────────────────────────────────────────────+
|                                                                             |
|   Breathe Smarter in Chandigarh. Protect Your Lungs with Hyper-Local Air AQI|
|   Hyper-local H3 hexagonal modeling, CPCB NAQI compliance, and personalized  |
|   inhaled particulate dose tracking.                                        |
|                                                                             |
|            [ Explore Live Pollution Map ]     [ Check Personal Risk ]       |
|                                                                             |
+─────────────────────────────────────────────────────────────────────────────+
| LIVE CHANDIGARH MONITORING STATIONS (Updated 9:00 AM IST)                   |
| +──────────────────+ +──────────────────+ +──────────────────+ +───────────+|
| | Sector 22-B      | | Panjab Univ Sec25| | Sector 53 South  | | Sector 39 |
| | NAQI: 182        | | NAQI: 154        | | NAQI: 210        | | NAQI: 168 |
| | [MODERATE]       | | [MODERATE]       | | [POOR]           | | [MODERATE]|
| | PM2.5: 84.5 µg/m³| | PM2.5: 72.0 µg/m³| | PM2.5: 96.2 µg/m³| | PM2.5: 76  |
| +──────────────────+ +──────────────────+ +──────────────────+ +───────────+|
+─────────────────────────────────────────────────────────────────────────────+
| PLATFORM HIGHLIGHTS                                                         |
| [1. Le Corbusier Sector Grid] [2. Real-Time Dose] [3. Guardrailed AI]       |
+─────────────────────────────────────────────────────────────────────────────+
```

---

### 5.2 Module 2: Authentication & Authorization (Login, Register & Health Profile)
- **Routes**: `/auth/login`, `/auth/register`, `/auth/forgot-password`
- **Purpose**: JWT-backed identity issuance. Registration includes optional health sensitivity registration (asthma, COPD, elderly, pregnancy) for personalized risk computations.

```
+─────────────────────────────────────────────────────────────────────────────+
|                                                                             |
|                         [ BreatheWise Emblem ]                              |
|                          Create Your Account                                |
|             Protect your health with tailored air quality alerts            |
|                                                                             |
|  Username        [ priya_chd                                  ]             |
|  Email           [ priya.verma@example.com                    ]             |
|  Password        [ ••••••••••••••••                           ]             |
|  Phone Number    [ +91 98765 43210                            ]             |
|                                                                             |
|  Health Sensitivity Profile (Optional for Dose Tuning)                      |
|  ( ) Healthy Adult  (•) Asthma  ( ) COPD  ( ) Elderly (65+)  ( ) Child      |
|                                                                             |
|  Primary Commute Mode: [ Walking / Cycling / Public Transit v ]             |
|                                                                             |
|  [✓] I agree to the Privacy Policy (Zero-Raw-GPS Mandate)                   |
|                                                                             |
|                          [ Complete Registration ]                          |
|                                                                             |
|                     Already have an account? Log In                         |
+─────────────────────────────────────────────────────────────────────────────+
```

---

### 5.3 Module 3: Dashboard (Personalized Air Quality Command Center)
- **Route**: `/dashboard`
- **Purpose**: Authenticated citizen command center displaying current local NAQI at their saved home location, active health advisory, 24h forecast summary, daily accumulated inhalation dose, and quick-action shortcuts.

```
+─────────────────────────────────────────────────────────────────────────────+
| [Header: Priya Verma | Home: Sector 22-B | Active Alert: NAQI Deteriorating]|
+─────────────────────────────────────────────────────────────────────────────+
| [!] HEALTH ADVISORY: PM2.5 elevated (84.5 µg/m³). With your asthma profile,  |
|     limit prolonged outdoor aerobic workouts. Consider wearing an N95 mask. |
+──────────────────────────────────────┬──────────────────────────────────────+
| LOCAL AIR QUALITY (Sector 22-B)      | TODAY'S INHALED PARTICULATE DOSE     |
|                                      |                                      |
|            .---.                     |   Total Inhaled Dose: 133.09 µg      |
|           / 182 \                    |   Cigarette Equivalent: 6.05 cigs    |
|          | MODERATE |                 |   Active Time Outdoors: 45 mins      |
|           \     /                    |   Personal Risk Index: 7.2 / 10      |
|            '---'                     |   [===>                      ] High  |
|   Primary Driver: PM2.5 (84.5 µg/m³) |                                      |
|   Temp: 22.4°C | Humidity: 58%       |   [ + Log Physical Activity ]        |
+──────────────────────────────────────┴──────────────────────────────────────+
| 24-HOUR FORECAST OUTLOOK             | RECENT SECTOR HAZARDS                |
| 10:00 AM: 185 [MOD] | 02:00 PM: 160  | [!] Garbage Burning (Sec 22) - 8 upv |
| 06:00 PM: 215 [POOR]| 10:00 PM: 240  | [i] Construction Dust (Sec 17)       |
+─────────────────────────────────────────────────────────────────────────────+
```

---

### 5.4 Module 4: Interactive Pollution Map (Leaflet & Uber H3 Hex Layer)
- **Route**: `/map`
- **Purpose**: Full-screen GIS exploration of Chandigarh with CPCB-colored H3 hexagons, station pins, hazard flags, metric switchers, and sector search.

```
+─────────────────────────────────────────────────────────────────────────────+
| [Search Sector / Landmark...] [Metric: NAQI v] [Layer: Hexagons v] [Legend] |
+─────────────────────────────────────────────────────────────────────────────+
|  [+]                                                                        |
|  [-]                                         /\                             |
|                                             /  \__ (Sukhna Lake)            |
|          / \      / \      / \             /      \                         |
|         / 154\___/ 182\___/ 168\          /________\                        |
|         \Sec25/  \Sec22/  \Sec17/                                           |
|          \___/    \___/    \___/      [Station Marker: CHD_SEC22]           |
|              \    /   \    /          | NAQI: 182 (MODERATE)                |
|               \  / 210 \  /           | PM2.5: 84.5 | PM10: 142.0           |
|                \/ Sec53 \/            | Wind: 6.8 km/h NW                   |
|                 \______/              | [View Station Analytics]            |
|                                                                             |
|                                       [Hazard Pin: Burning Smoke (8 upv)]   |
|                                                                             |
| [Filter: All Hazards] [Toggle Satellite Stubble Fires]                      |
+─────────────────────────────────────────────────────────────────────────────+
| SELECTED CELL: 8803264427fffff (Sector 22-B) | NAQI: 182 | Status: MODERATE |
+─────────────────────────────────────────────────────────────────────────────+
```

---

### 5.5 Module 5: Analytics & NAAQS Regulatory Benchmarking
- **Route**: `/analytics`
- **Purpose**: Deep statistical exploration: multi-pollutant line charts, diurnal cycle graphs, and compliance tracking against the NAAQS 24-hour limits.

```
+─────────────────────────────────────────────────────────────────────────────+
| ANALYTICS CONSOLE: Chandigarh Ambient Air Quality Trends                    |
| Station: [ Sector 22-B v ]  Timeframe: [ 7 Days v ]  Pollutant: [ PM2.5 v ]  |
+─────────────────────────────────────────────────────────────────────────────+
| MULTI-DAY CONCENTRATION TREND (µg/m³) vs. NAAQS STANDARD                    |
| 200|             * (Nov 17 - 198)                                           |
| 150|       *           *                                                    |
| 100| *           *           *                                              |
|  60|------------------------------- [NAAQS 24h Standard: 60 µg/m³] --------|
|   0+─────────────────────────────────────────────────────────────────────── |
|    Nov 15  Nov 16  Nov 17  Nov 18  Nov 19  Nov 20  Nov 21  Nov 22           |
+──────────────────────────────────────┬──────────────────────────────────────+
| 24-HOUR DIURNAL PROFILE (IST)        | REGULATORY NAAQS COMPLIANCE (2026)   |
| Morning Inversion Peak: 8:00 AM      | PM2.5 Exceedance Rate: 56.4% of days |
| Afternoon Clear Window: 3:00–5:00 PM | PM10 Exceedance Rate: 48.5% of days  |
| Evening Smoke Stagnation: 8:00 PM    | NO2 Exceedance Rate: 0.6% (Compliant)|
+─────────────────────────────────────────────────────────────────────────────+
```

---

### 5.6 Module 6: Forecast Engine (72-Hour Confidence Intervals)
- **Route**: `/forecast`
- **Purpose**: 72-hour hourly predictive outlook displaying statistical confidence intervals ($CI_{low}, CI_{high}$) and an algorithmically determined "Cleanest Outdoor Window".

```
+─────────────────────────────────────────────────────────────────────────────+
| 72-HOUR AIR QUALITY FORECAST & OUTDOOR ACTIVITY ADVISOR                     |
| Location: [ Sector 22-B / Current H3 Cell v ]  Model: [ v1.2 Diurnal Ens ]  |
+─────────────────────────────────────────────────────────────────────────────+
| OPTIMAL OUTDOOR TIME WINDOW TODAY: 03:00 PM – 05:30 PM                      |
| Expected NAQI: 145–160 (Moderate). Lowest diurnal particulate concentration.|
+─────────────────────────────────────────────────────────────────────────────+
| 72-HOUR PROJECTION WITH STATISTICAL CONFIDENCE BANDS                        |
| NAQI                                                                        |
| 350|                                                .::'                    |
| 300| (Very Poor)                            .::::::'                        |
| 200| (Poor)            .:::.              .::' [Shaded Area: 95% Conf Band] |
| 150| (Moderate)     ..:'   ':..        ..:'    [Solid Line: Predicted Mean] |
| 100| (Satisfactory):'          ':....:'                                     |
|    +────────────────────────────────────────────────────────────────────────+
|      Today 12PM  Today 6PM  Tomorrow 6AM  Tomorrow 6PM  Day 3 6AM  Day 3 6PM|
+─────────────────────────────────────────────────────────────────────────────+
```

---

### 5.7 Module 7: AI Assistant (Guardrailed Natural Language Advisory)
- **Route**: `/assistant`
- **Purpose**: Conversational advisory assistant grounded with deterministic CPCB telemetry and user health sensitivity profile.

```
+─────────────────────────────────────────────────────────────────────────────+
| [BreatheWise AI Health Advisory Assistant]                   [+ New Thread] |
+─────────────────────────────────────────────────────────────────────────────+
| USER (09:12 AM):                                                            |
| "Can I take my 6-year-old daughter for cycling in Sector 17 this evening?"  |
|                                                                             |
| ASSISTANT (09:12 AM):                                                       |
| "Based on current forecasts for Sector 17, air quality will deteriorate     |
| to POOR (NAQI 225, PM2.5 ~115 µg/m³) between 5:00 PM and 8:00 PM due to     |
| evening vehicular traffic and ground temperature inversion.                 |
|                                                                             |
| For a 6-year-old child (developing respiratory system):                     |
| 1. High aerobic cycling outdoors during this window is NOT recommended.     |
| 2. If outdoors, limit activity to light walking before 4:30 PM.             |
| 3. Ensure she wears a well-fitted child-sized N95 mask if outdoors."        |
|                                                                             |
| [Grounding Context: Sector 17 | Projected NAQI: 225 | Child Sensitivity]    |
+─────────────────────────────────────────────────────────────────────────────+
| Quick Prompts: [Best jog time today?] [Mask advice for COPD] [Sukhna walk]  |
| [ Type your health or activity question...                       ] [ Send ] |
+─────────────────────────────────────────────────────────────────────────────+
```

---

### 5.8 Module 8: Smart Alerts & Notification Settings
- **Route**: `/alerts`
- **Purpose**: Configuration of user notification triggers, threshold sliders, delivery channels (Push, Email, SMS, Telegram), quiet hours, and test alert trigger.

```
+─────────────────────────────────────────────────────────────────────────────+
| SMART AIR QUALITY ALERTS & NOTIFICATIONS                                    |
+─────────────────────────────────────────────────────────────────────────────+
| Notification Master Switch: [ (•) ENABLED ]                                 |
|                                                                             |
| Alert Threshold Slider:                                                     |
| [========================o===========] 180 NAQI (Moderate -> Poor)          |
| Alerts will dispatch whenever your saved location exceeds this threshold.   |
|                                                                             |
| Delivery Channels:                                                          |
| [✓] Browser Push Notifications   [✓] Email Digest (priya.verma@example.com) |
| [ ] SMS Text Alert (+91 98765 43210)  [ ] Telegram Bot Integration          |
|                                                                             |
| Quiet Hours (Do Not Disturb):                                               |
| From: [ 10:00 PM v ]  To: [ 07:00 AM v ]                                    |
|                                                                             |
| Monitored Locations:                                                        |
| (•) Home (Sector 22-B)   ( ) Work (Sector 17)   ( ) Use Current Location    |
|                                                                             |
| [ Save Alert Preferences ]             [ Send Instant Test Notification ]   |
+─────────────────────────────────────────────────────────────────────────────+
```

---

### 5.9 Module 9: Citizen Reporting (Crowdsourced Hazards & EXIF Stripping)
- **Route**: `/reports`
- **Purpose**: Community environmental incident reporting feed with interactive submission wizard, upvoting, and privacy-preserving client-side EXIF metadata stripping.

```
+─────────────────────────────────────────────────────────────────────────────+
| CROWDSOURCED HAZARD REPORTING               [ + Report New Pollution Incident]|
| Filter: [ All Hazards v ]  Sort: [ Most Upvoted v ]  Status: [ Verified v ] |
+─────────────────────────────────────────────────────────────────────────────+
| INCIDENT FEED                                                               |
| +─────────────────────────────────────────────────────────────────────────+ |
| | [Thumbnail] GARBAGE & PLASTIC BURNING                         [VERIFIED]| |
| | Location: Sector 22-B Park Perimeter (H3: 8803264427fffff)             | |
| | Reported by: priya_chd • 45 minutes ago                                 | |
| | "Open leaf and plastic garbage burning generating thick black smoke."   | |
| | [▲ Upvote (8)]   [View on Map]   [Report Moderation Status]             | |
| +─────────────────────────────────────────────────────────────────────────+ |
|                                                                             |
| MODAL WIZARD: Report Pollution Incident                                     |
| Category: [ Municipal Solid Waste Burning (garbage) v ]                     |
| Location: [ Sector 22-B (Resolved from Map / Privacy H3) ]                  |
| Description: [ Thick smoke billowing near residential block... ]            |
| Attach Photo: [ photo.jpg (2.4 MB) ]                                        |
| [✓] PRIVACY NOTICE: All GPS EXIF coordinates & device metadata will be      |
|     permanently stripped before upload.                                     |
| [ Cancel ]                                         [ Submit Incident Report]|
+─────────────────────────────────────────────────────────────────────────────+
```

---

### 5.10 Module 10: Exposure Tracker & Physiological Impact Engine
- **Route**: `/exposure`
- **Purpose**: Personal inhaled particulate dose calculator ($\text{Dose} = C \times V_E \times t \times (1 - \eta)$) and cigarette equivalent tracker.

```
+─────────────────────────────────────────────────────────────────────────────+
| PERSONAL EXPOSURE TRACKER & INHALATION DOSE CALCULATOR                      |
+─────────────────────────────────────────────────────────────────────────────+
| TODAY'S PARTICULATE INTAKE SUMMARY                                          |
| Cumulative Inhaled Dose: 133.09 µg PM2.5                                    |
| Cigarette Equivalent: 6.05 cigarettes smoked today                          |
| Equivalent Intake vs. WHO 24h Threshold: 2.7x WHO Daily Safe Limit          |
+─────────────────────────────────────────────────────────────────────────────+
| LOG A COMPLETED ACTIVITY:                                                   |
| Activity Type: [ Moderate Running / Jogging v ]                             |
| Duration (Minutes): [ 45 ]  (Ventilation Rate: 35 L/min automatically keyed)|
| Location: [ Sector 22-B (Ambient PM2.5: 84.5 µg/m³) v ]                     |
| Mask Protection: (•) None (0%)  ( ) Cloth (30%)  ( ) Surgical (60%)  ( ) N95/FFP2 (95%) |
|                                                                             |
| LIVE DOSE PREVIEW:                                                          |
| Without Mask: 133.09 µg PM2.5 (6.05 cigarettes)                             |
| With N95 Mask:  6.65 µg PM2.5 (0.30 cigarettes) -> [Save 95% of Intake!]    |
|                                                                             |
| [ Log Activity to My History ]         [ Interactive What-If Simulator ]    |
+─────────────────────────────────────────────────────────────────────────────+
```

---

### 5.11 Module 11: User Profile & Health Sensitivity Registry
- **Route**: `/profile`
- **Purpose**: Profile maintenance, health condition specification, commute preference configuration, and saved location management.

```
+─────────────────────────────────────────────────────────────────────────────+
| USER PROFILE & HEALTH SENSITIVITY REGISTRY                                  |
+─────────────────────────────────────────────────────────────────────────────+
| PERSONAL IDENTITY                                                           |
| Full Name: [ Priya Verma                 ]  Username: [ priya_chd         ] |
| Email:     [ priya.verma@example.com     ]  Phone:    [ +91 98765 43210   ] |
+─────────────────────────────────────────────────────────────────────────────+
| HEALTH & BIOMETRIC SENSITIVITY (Used by Impact Engine)                      |
| Primary Health Category: [ Asthma / Respiratory Sensitivity v ]             |
| Specific Notes: [ Diagnosed allergic asthma. Uses albuterol inhaler. ]      |
| Age: [ 29 ]   Primary Commute Mode: [ Walking & Public Transit v ]          |
+─────────────────────────────────────────────────────────────────────────────+
| SAVED SPATIAL ANCHORS (Zero-Raw-GPS Privacy Protected)                      |
| [HOME] Sector 22-B (H3: 8803264427fffff)                      [Default] [x] |
| [WORK] Sector 17 City Centre (H3: 8803264423fffff)                      [x] |
| [ + Add New Saved Anchor (e.g. Gym, School) ]                               |
|                                                                             |
| [ Save Profile Changes ]                                                    |
+─────────────────────────────────────────────────────────────────────────────+
```

---

### 5.12 Module 12: Admin Dashboard & Telemetry Health Console
- **Route**: `/admin/console` (Protected by `role: "admin"` or `role: "official"`)
- **Purpose**: City-wide operational oversight: station telemetry status, ingestion latency, incident report moderation queue, and system health metrics.

```
+─────────────────────────────────────────────────────────────────────────────+
| BREATHEWISE MUNICIPAL ADMINISTRATION & TELEMETRY HEALTH CONSOLE              |
+─────────────────────────────────────────────────────────────────────────────+
| SYSTEM TELEMETRY STATUS                                                     |
| Active Stations: 4 / 4 Online | Ingestion Latency: 1.2s | Celery Beat: OK   |
| Database: PostgreSQL 16 PostGIS (Healthy) | Redis Cache Hit Ratio: 89.4%    |
+─────────────────────────────────────────────────────────────────────────────+
| CONTINUOUS MONITORING STATIONS (CAAQMS TELEMETRY HEALTH)                    |
| Code       | Location      | Operator | Last Telemetry | Status  | NAQI   |
| CHD_SEC22  | Sector 22-B   | CPCC     | 2 mins ago     | ONLINE  | 182    |
| CHD_SEC25  | Sector 25 PU  | CPCC     | 3 mins ago     | ONLINE  | 154    |
| CHD_SEC53  | Sector 53     | CPCC     | 1 min ago      | ONLINE  | 210    |
| CHD_SEC39  | Sector 39 IMD | IMD      | 5 mins ago     | ONLINE  | 168    |
+─────────────────────────────────────────────────────────────────────────────+
| PENDING CITIZEN HAZARD MODERATION QUEUE (3 items pending)                   |
| Report ID  | Category         | Sector    | Photo  | Status      | Action  |
| rep_810001 | garbage          | Sec 22-B  | [View] | submitted   | [Verify] |
| rep_810002 | construction     | Sec 34    | [View] | submitted   | [Verify] |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 6. State Management Architecture: Zustand & TanStack Query v5

### 6.1 Client State with Zustand Stores
BreatheWise separates ephemeral client/session state (UI preferences, active map filters, authentication tokens) from server state using **Zustand**.

#### Auth Store (`src/stores/authStore.ts`)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Core Domain Types & Enums (Aligned 1:1 with PostgreSQL Check Constraints)
export type UserRole = 'citizen' | 'sensitive_individual' | 'outdoor_enthusiast' | 'official' | 'admin';
export type HealthSensitivity = 'normal' | 'asthma' | 'copd' | 'cardiovascular' | 'elderly' | 'child' | 'pregnant';
export type BaselineActivity = 'sedentary' | 'moderate' | 'active' | 'athlete';
export type ActivityType = 'indoor_rest' | 'indoor_active' | 'walking' | 'running_cycling' | 'commuting_transit';
export type MaskType = 'none' | 'cloth' | 'surgical' | 'n95_ffp2';
export type ReportCategory = 'smoke' | 'garbage' | 'construction' | 'industrial' | 'vehicular' | 'other';
export type ReportStatus = 'submitted' | 'under_review' | 'verified' | 'resolved' | 'rejected';
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_staff: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setCredentials: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setCredentials: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'breathewise-auth-storage' }
  )
);
```

#### Map Store (`src/stores/mapStore.ts`)
```typescript
import { create } from 'zustand';

interface MapState {
  center: [number, number];
  zoom: number;
  activeMetric: 'naqi' | 'pm25' | 'pm10' | 'no2';
  selectedH3Index: string | null;
  selectedStationId: string | null;
  showHotspots: boolean;
  showHazards: boolean;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setActiveMetric: (metric: 'naqi' | 'pm25' | 'pm10' | 'no2') => void;
  selectH3Index: (h3Index: string | null) => void;
  selectStationId: (stationId: string | null) => void;
  toggleHotspots: () => void;
  toggleHazards: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: [30.7333, 76.7794], // Chandigarh City Center
  zoom: 12,
  activeMetric: 'naqi',
  selectedH3Index: null,
  selectedStationId: null,
  showHotspots: false,
  showHazards: true,
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setActiveMetric: (activeMetric) => set({ activeMetric }),
  selectH3Index: (selectedH3Index) => set({ selectedH3Index }),
  selectStationId: (selectedStationId) => set({ selectedStationId }),
  toggleHotspots: () => set((state) => ({ showHotspots: !state.showHotspots })),
  toggleHazards: () => set((state) => ({ showHazards: !state.showHazards })),
}));
```

---

### 6.2 Server State with TanStack Query (React Query v5)
All remote API data is fetched, cached, and synchronized using TanStack Query v5.

#### Query Keys Hierarchy & Polling Strategy
```typescript
export const queryKeys = {
  stations: {
    all: ['stations'] as const,
    detail: (id: string) => ['stations', id] as const,
  },
  airQuality: {
    latest: (params?: object) => ['airQuality', 'latest', params] as const,
    grid: (metric: string) => ['airQuality', 'grid', metric] as const,
    history: (params: object) => ['airQuality', 'history', params] as const,
    h3: (h3Index: string) => ['airQuality', 'h3', h3Index] as const,
  },
  forecast: {
    hourly: (stationOrH3?: string) => ['forecast', 'hourly', stationOrH3] as const,
    daily: () => ['forecast', 'daily'] as const,
  },
  reports: {
    list: (filters?: object) => ['reports', filters] as const,
  },
  exposure: {
    dailySummary: (date?: string) => ['exposure', 'daily', date] as const,
    history: () => ['exposure', 'history'] as const,
  },
};
```

#### Live Telemetry Polling Hook (`useLatestAirQuality.ts`)
```typescript
import { useQuery } from '@tanstack/react-query';
import { airQualityService } from '../services/airQualityService';
import { queryKeys } from './queryKeys';

export const useLatestAirQuality = (stationCode?: string) => {
  return useQuery({
    queryKey: queryKeys.airQuality.latest({ stationCode }),
    queryFn: () => airQualityService.getLatestReading(stationCode),
    refetchInterval: 15 * 60 * 1000, // Background poll every 15 minutes (matches CAAQMS update cycle)
    staleTime: 5 * 60 * 1000,        // Data considered fresh for 5 minutes
    refetchOnWindowFocus: true,
  });
};
```

#### Optimistic Report Upvote Mutation (`useUpvoteReport.ts`)
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../services/reportService';
import { queryKeys } from './queryKeys';

export const useUpvoteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => reportService.upvoteReport(reportId),
    onMutate: async (reportId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reports.list() });
      const previousReports = queryClient.getQueryData(queryKeys.reports.list());

      queryClient.setQueryData(queryKeys.reports.list(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          results: old.results.map((report: any) =>
            report.id === reportId
              ? { ...report, upvotes_count: report.upvotes_count + 1, user_has_upvoted: true }
              : report
          ),
        };
      });

      return { previousReports };
    },
    onError: (_err, _reportId, context) => {
      if (context?.previousReports) {
        queryClient.setQueryData(queryKeys.reports.list(), context.previousReports);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.list() });
    },
  });
};
```

---

## 7. Leaflet 1.9 Interactive Geospatial Map Integration

### 7.1 Map Initialization & Bounding Restrictions
- **Center**: Latitude `30.7333°N`, Longitude `76.7794°E` (Chandigarh Sector 17 Monumental Axis).
- **Default Zoom**: `12` (Zoom Range: `11` to `16`).
- **Max Bounds**: Restricted to `[[30.60, 76.60], [30.90, 76.95]]` to prevent pan drift outside the Tricity urban region.
- **Base Tile Layers**:
  - *Light Mode*: CartoDB Positron (`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`)
  - *Dark Mode*: CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)

```typescript
// MapContainer Configuration
<MapContainer
  center={[30.7333, 76.7794]}
  zoom={12}
  minZoom={11}
  maxZoom={16}
  maxBounds={[[30.60, 76.60], [30.90, 76.95]]}
  maxBoundsViscosity={1.0}
  scrollWheelZoom={true}
  className="w-full h-full z-10"
>
  <TileLayer
    url={theme === 'dark' ? DARK_TILES : LIGHT_TILES}
    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
  />
  <H3HexagonLayer />
  <StationMarkersLayer />
  <CitizenHazardsLayer />
  <MapControls />
</MapContainer>
```

---

### 7.2 Custom Uber H3 Hexagon GeoJSON Layer Rendering
The H3 layer downloads GeoJSON polygons generated from the backend IDW grid endpoint (`/api/v1/air-quality/grid/`) and styles each cell with dynamic CPCB color fills, hover highlights, and interactive click callbacks.

```typescript
const getHexagonStyle = (feature: any, activeMetric: string) => {
  const category = feature.properties.category;
  const colorMap: Record<string, string> = {
    GOOD: '#00B050',
    SATISFACTORY: '#92D050',
    MODERATE: '#FFFF00',
    POOR: '#FF9900',
    VERY_POOR: '#FF0000',
    SEVERE: '#C00000',
  };

  return {
    fillColor: colorMap[category] || '#94A3B8',
    weight: 1.2,
    opacity: 0.8,
    color: '#475569',
    fillOpacity: 0.55, // Semi-transparent overlay preserving street readability
  };
};

const onEachHexagon = (feature: any, layer: any) => {
  layer.on({
    mouseover: (e: any) => {
      const l = e.target;
      l.setStyle({ weight: 3, color: '#0F172A', fillOpacity: 0.8 });
      l.bringToFront();
    },
    mouseout: (e: any) => {
      hexLayerRef.current?.resetStyle(e.target);
    },
    click: () => {
      useMapStore.getState().selectH3Index(feature.properties.h3_index);
    },
  });
};
```

---

### 7.3 Station Markers & Pulsing Status Rings
Official CAAQMS stations are rendered using custom Leaflet `L.divIcon` HTML elements with an animated pulsing ring indicating active live telemetry.

```typescript
export const createStationIcon = (naqi: number, category: string) => {
  const color = getCategoryColor(category);
  return L.divIcon({
    className: 'custom-station-pin',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full opacity-75" style="background-color: ${color}"></span>
        <div class="relative inline-flex items-center justify-center rounded-full h-8 w-8 text-xs font-mono font-bold shadow-lg border-2 border-white" style="background-color: ${color}; color: ${category === 'MODERATE' ? '#1A202C' : '#FFFFFF'}">
          ${naqi}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};
```

---

## 8. Recharts Visualization Architecture

### 8.1 Multi-Pollutant Historical Line Charts
Displays rolling historical concentrations with toggleable criteria pollutant lines ($PM_{2.5}, PM_{10}, NO_2, O_3$) and NAAQS threshold reference lines.

```typescript
<ResponsiveContainer width="100%" height={320}>
  <LineChart data={historicalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
    <XAxis dataKey="timestamp" tickFormatter={(t) => format(parseISO(t), 'MMM dd')} />
    <YAxis unit=" µg/m³" />
    <Tooltip content={<CustomPollutantTooltip />} />
    <Legend verticalAlign="top" height={36} />
    
    {/* NAAQS Standard Reference Line */}
    <ReferenceLine y={60} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'NAAQS 24h: 60', fill: '#EF4444', position: 'top' }} />

    <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#0284C7" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
    <Line type="monotone" dataKey="pm10" name="PM10" stroke="#F59E0B" strokeWidth={2} dot={false} />
    <Line type="monotone" dataKey="no2" name="NO2" stroke="#8B5CF6" strokeWidth={1.5} dot={false} />
  </LineChart>
</ResponsiveContainer>
```

---

### 8.2 24-Hour Diurnal Cycle Area Charts
Visualizes Chandigarh's diurnal boundary layer dynamics: nocturnal boundary stagnation (06:00–09:00 AM) and daytime solar convection clearance (02:00–05:00 PM).

```typescript
<ResponsiveContainer width="100%" height={260}>
  <AreaChart data={diurnalProfile} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
    <defs>
      <linearGradient id="diurnalGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#0284C7" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#0284C7" stopOpacity={0.05}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
    <XAxis dataKey="hour_ist" tickFormatter={(h) => `${h}:00`} />
    <YAxis unit=" µg/m³" />
    <Tooltip formatter={(value: number) => [`${value} µg/m³`, 'Mean PM2.5']} />
    <Area type="monotone" dataKey="mean_concentration" stroke="#0284C7" strokeWidth={2} fillOpacity={1} fill="url(#diurnalGradient)" />
  </AreaChart>
</ResponsiveContainer>
```

---

### 8.3 72-Hour Forecast Confidence Band Visualization ($CI_{low}, CI_{high}$)
Visualizes projected NAQI over 72 hours using a Recharts `ComposedChart` with a shaded confidence interval band between `confidence_interval_low` and `confidence_interval_high`, overlaid by the central predicted line.

**Dark Mode Theme Adaptability**:
In dark mode (`isDarkMode === true`), filling the lower boundary with opaque `#FFFFFF` renders an unsightly solid white block across the dark container. To ensure seamless light and dark mode visualization, the lower mask dynamically adopts the theme card background color (`isDarkMode ? '#0F172A' : '#FFFFFF'`, or CSS variable `var(--bg-card)`) or `fill="transparent"`, ensuring the dark canvas is never corrupted.

```typescript
// Component receives `isDarkMode` from theme store or `useTheme()` hook
<ResponsiveContainer width="100%" height={320}>
  <ComposedChart data={forecastHours} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#E2E8F0'} />
    <XAxis dataKey="target_timestamp" tickFormatter={(t) => format(parseISO(t), 'EEE ha')} stroke={isDarkMode ? '#94A3B8' : '#64748B'} />
    <YAxis domain={[0, 450]} stroke={isDarkMode ? '#94A3B8' : '#64748B'} />
    <Tooltip content={<ForecastTooltip />} />
    <Legend verticalAlign="top" height={36} />

    {/* Shaded Confidence Interval Range */}
    <Area
      dataKey="confidence_interval_high"
      baseValue="dataMin"
      stroke="none"
      fill="#BAE6FD"
      fillOpacity={0.4}
      name="95% Confidence Interval"
    />
    {/* Theme-aware lower mask: matches theme background (#0F172A in dark mode) to prevent opaque white blocking */}
    <Area
      dataKey="confidence_interval_low"
      baseValue="dataMin"
      stroke="none"
      fill={isDarkMode ? '#0F172A' : '#FFFFFF'}
      fillOpacity={1.0}
    />

    {/* Central Predicted NAQI Trajectory */}
    <Line
      type="monotone"
      dataKey="predicted_naqi"
      name="Predicted CPCB NAQI"
      stroke="#0369A1"
      strokeWidth={3}
      dot={{ r: 3 }}
    />
  </ComposedChart>
</ResponsiveContainer>
```

---

## 9. Form Handling, Validation Schemas & Error Management

### 9.1 React Hook Form + Zod Integration
Form validation is executed using **Zod** schemas integrated via `@hookform/resolvers/zod`.

#### Activity Log Validation Schema (`src/features/exposure/activitySchema.ts`)
```typescript
import { z } from 'zod';

export const activityLogSchema = z.object({
  h3_index: z
    .string()
    .length(15, 'H3 index must be exactly 15 hexadecimal characters')
    .regex(/^[89][0-9a-fA-F]{14}$/, 'Invalid Uber H3 index format'),
  activity_type: z.enum([
    'indoor_rest',
    'indoor_active',
    'walking',
    'running_cycling',
    'commuting_transit',
  ]),
  duration_minutes: z
    .number({ invalid_type_error: 'Duration is required' })
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration cannot exceed 24 hours (1440 mins)'),
  mask_type: z.enum(['none', 'cloth', 'surgical', 'n95_ffp2']).default('none'),
});

export type ActivityLogFormData = z.infer<typeof activityLogSchema>;
```

---

### 9.2 Global API Error Interception & Field Mapping
Axios interceptors parse DRF error envelopes (`error.code`, `error.details`) and bind field errors directly into React Hook Form fields using `setError`:

```typescript
// Global Axios Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<GlobalErrorEnvelope>) => {
    const errorData = error.response?.data?.error;
    if (errorData?.code === 'TOKEN_EXPIRED') {
      // Trigger token rotation flow
      return handleTokenRefresh(error.config);
    }
    return Promise.reject(errorData || { message: 'Unexpected network error' });
  }
);
```

---

## 10. Responsive Breakpoints & Accessibility (WCAG 2.1 AA)

### 10.1 Responsive Grid Breakpoints
BreatheWise is fully responsive across three core device form factors:

```
+──────────────────────────┬──────────────────────┬───────────────────────────+
| Form Factor              | Viewport Width       | Layout Strategy           |
+──────────────────────────┼──────────────────────┼───────────────────────────+
| Mobile Handset           | < 640px (sm)         | Single-column stacked     |
|                          |                      | Bottom navigation drawer  |
|                          |                      | Floating map action pills |
+──────────────────────────┼──────────────────────┼───────────────────────────+
| Tablet / Foldable        | 640px – 1024px (md)  | 2-column balanced grid    |
|                          |                      | Collapsible side drawer   |
+──────────────────────────┼──────────────────────┼───────────────────────────+
| Desktop / High-DPI Display| > 1024px (lg, xl)   | 3-column command center   |
|                          |                      | Persistent sidebar        |
|                          |                      | Split map & analytics pane|
+──────────────────────────┴──────────────────────┴───────────────────────────+
```

---

### 10.2 WCAG 2.1 AA Contrast Ratios & NAQI Color Band Rules
To guarantee accessible visibility for low-vision and colorblind citizens, all text pairings are audited against the WCAG 2.1 relative luminance formula ($L = 0.2126 R + 0.7152 G + 0.0722 B$; contrast ratio $= (L_1 + 0.05) / (L_2 + 0.05)$).

```
+─────────────────────────────────────────────────────────────────────────────────────────────────────────────+
|                                    WCAG 2.1 AA COLOR CONTRAST AUDIT MATRIX                                  |
+──────────────┬───────────┬──────────────┬─────────────┬──────────────┬───────────────┬──────────────────────+
| CPCB Band    | Hex Code  | Relative Lum | Text Color  | Text Hex     | Contrast Ratio| WCAG 2.1 Status      |
+──────────────┼───────────┼──────────────┼─────────────┼──────────────┼───────────────┼──────────────────────+
| Good         | #00B050   | 0.3163       | Dark Slate  | #0F172A      | 6.23:1        | PASSES AA (>= 4.5:1) |
| Satisfactory | #92D050   | 0.5180       | Dark Slate  | #0F172A      | 9.66:1        | PASSES AAA (>= 7.0:1)|
| Moderate     | #FFFF00   | 0.9278       | Dark Slate  | #1A202C      | 15.20:1       | PASSES AAA (>= 7.0:1)|
| Poor         | #FF9900   | 0.4404       | Dark Slate  | #0F172A      | 8.34:1        | PASSES AAA (>= 7.0:1)|
| Very Poor    | #FF0000   | 0.2126       | Pure White  | #FFFFFF      | 4.00:1 / 4.83*| PASSES AA (Badge/Bold|
| Severe       | #C00000   | 0.1121       | Pure White  | #FFFFFF      | 6.48:1 / 8.31^| PASSES AA & AAA      |
+──────────────┴───────────┴──────────────┴───────────────┴─────────────┴───────────────┴──────────────────────+
* Tailwind bg-red-600 (#DC2626) yields 4.83:1 with white text, passing AA for normal body text.
^ Tailwind bg-rose-900 (#991B1B) yields 8.31:1 with white text, exceeding AAA standards.
```

#### Mathematical Contrast Findings & Mandatory Rules
1. **Light / Mid-Tone Bands (Good, Satisfactory, Moderate, Poor)**:
   - White text on `#00B050` yields only `2.87:1` (FAILS AA). Paired with `#0F172A` / `#1A202C`, it achieves **`6.23:1` / `5.69:1`** (PASSES AA).
   - White text on `#92D050` yields only `1.85:1` (Severe Failure). Paired with `#0F172A`, it achieves **`9.66:1`** (PASSES AAA).
   - White text on `#FFFF00` yields only `1.07:1` (Severe Failure). Paired with `#1A202C`, it achieves **`15.20:1`** (PASSES AAA).
   - White text on `#FF9900` yields only `2.14:1` (Severe Failure). Paired with `#0F172A`, it achieves **`8.34:1`** (PASSES AAA).
   - **Rule**: All badges, chips, map pins, and data tables for Good, Satisfactory, Moderate, and Poor **must strictly use dark slate text (`text-slate-900` / `#0F172A` / `#1A202C`)**.

2. **Dark Saturated Bands (Very Poor, Severe)**:
   - White text on `#FF0000` achieves `4.00:1` (passes AA for bold badge and large display text); with Tailwind token `#DC2626`, it achieves **`4.83:1`** (PASSES AA normal text).
   - White text on `#C00000` achieves **`6.48:1`** (PASSES AA); with Tailwind token `#991B1B`, it achieves **`8.31:1`** (PASSES AAA).
   - **Rule**: Very Poor and Severe bands **must use white text (`text-white` / `#FFFFFF`)**.

---

### 10.3 Screen Reader & Keyboard Navigation Standards
- **ARIA Live Regions**: High-priority alert dispatches utilize `aria-live="assertive"` to immediately notify screen reader users when local air quality deteriorates.
- **Accessible SVGs**: All Recharts and Leaflet icons include `role="img"`, `aria-label`, and `<title>` elements describing current NAQI values.
- **Focus Rings**: All interactive inputs, buttons, and map overlays implement explicit 2px sky-500 focus rings (`focus:ring-2 focus:ring-sky-500 focus:outline-none`).

---
*End of Frontend Architecture & UI/UX Design Specification (`FRONTEND_DESIGN.md`)*
