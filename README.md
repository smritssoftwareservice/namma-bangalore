# FLOODGUARD AI

> *"See the danger before it becomes an accident."*

An AI-powered geospatial hazard intelligence platform for detecting, reporting, and prioritizing road hazards, waterlogging, open manholes, and flood-related risks.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com)
[![MapLibre GL](https://img.shields.io/badge/MapLibre-GL--JS-3b82f6)](https://maplibre.org)
[![PostGIS](https://img.shields.io/badge/PostGIS-Spatial-336791)](https://postgis.net)

---

## Important Product Positioning & Disclaimers

> [!WARNING]
> **FLOODGUARD AI is an assistive platform and NOT an official emergency dispatch service.**
> Reports submitted by citizens remain marked as **"Reported — pending verification"** until confirmed by authorized municipal inspectors. Initial demonstration records and AI classifications are clearly marked as **DEMO DATA**.

---

## Key Features

### For Commuters & Citizens
- **Interactive Full-Screen Map**: MapLibre GL JS engine supporting pan, zoom, pitch, compass reset, and fullscreen modes.
- **Marker Clustering & Dynamic Risk Badges**: Color-coded indicators for `CRITICAL` (red), `HIGH` (orange), `MODERATE` (yellow), and `LOW/RESOLVED` (green).
- **Proximity "Near Me" Detection**: Automatic GPS positioning with configurable radius filters (500m, 1km, 2km, 5km) and sorting.
- **AI-Assisted Photo Reporting**: Instant camera/file upload with server-side AI detection preview (confidence %, suggested hazard class, and severity rating).
- **Route Hazard Intelligence**: Analyzes road safety corridors between origin and destination, breaking down potholes, open manholes, waterlogging, and blockages along the path buffer.
- **Interactive Distance Measurement**: Point-to-point path measurement tool with cumulative distance calculation.
- **Flood Risk & Road Conditions Overlays**: GIS polygon basin layers and color-coded arterial corridor condition lines.
- **Community Verification**: Citizen polling ("Is this hazard still present?") to maintain data freshness.
- **Saved Monitoring Perimeters**: Configure alert zones for Home, Work, or Campus with granular trigger checkboxes.

### For Municipal Administrators & Field Workers
- **Executive GIS Dashboard**: Real-time KPI matrix with Recharts spatial distribution, rainfall-hazard correlation trends, and ward rankings.
- **Report Moderation Queue**: Filterable management table to verify, reject, recalibrate risk scores, or dispatch tasks.
- **Field Worker Maintenance Workflow**:
  - Task assignment to emergency road crews.
  - Turn-by-turn navigation coordinates to hazard sites.
  - Before / After evidence comparison and repair photo sign-off.
- **Configurable Risk Engine**: Live sliders to calibrate scoring weights:
  - Hazard Severity (30%)
  - Rainfall Runoff (20%)
  - Surface Waterlogging (20%)
  - Historical Recurrence (10%)
  - Arterial Road Hierarchy (10%)
  - 24h Report Frequency (10%)
- **Built-in Persona Switcher**: Instant 1-click toggle between Citizen, Municipal Administrator, and Field Worker without manual authentication setup.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 with glassmorphism design tokens
- **Mapping**: MapLibre GL JS with OpenStreetMap/Carto basemap tile layers
- **Charts**: Recharts
- **Icons**: Lucide React
- **Validation**: Zod
- **Database & Geospatial**: Supabase PostgreSQL + PostGIS extension with fallback in-memory store
- **AI Vision**: Pluggable provider abstraction (`VisionAIProvider`, `DemoAIProvider`, YOLOv8/v11 interface)
- **Meteorology**: Open-Meteo High-Resolution GIS API with deterministic simulation fallback
- **PWA**: Installable Progressive Web App with manifest and service worker metadata

---

## Directory Structure

```
floodguard-ai/
├── app/
│   ├── page.tsx                    # Landing page with hero & interactive map preview
│   ├── map/page.tsx                # Full-screen interactive GIS map
│   ├── report/page.tsx             # Mobile-first photo & GPS reporting flow
│   ├── hazard/[id]/page.tsx        # Hazard dossier, timeline & before/after viewer
│   ├── my-reports/page.tsx         # Citizen submission tracking
│   ├── alerts/page.tsx             # Monitored geographic zones & alert feeds
│   ├── login/page.tsx              # Sign in with 1-click demo persona switcher
│   ├── signup/page.tsx             # Citizen registration
│   ├── profile/page.tsx            # Profile & credentials
│   ├── admin/
│   │   ├── layout.tsx              # Municipal sub-navigation header
│   │   ├── page.tsx                # GIS operations dashboard with Recharts
│   │   ├── map/page.tsx            # Full-screen operational dispatch map
│   │   ├── reports/page.tsx        # Moderation table & crew assignment
│   │   ├── maintenance/page.tsx    # Field repairs & before/after evidence audit
│   │   ├── analytics/page.tsx      # Hotspot trends & corridor vulnerability
│   │   ├── users/page.tsx          # Role and crew permissions
│   │   └── settings/page.tsx       # Live risk engine weight calibration
│   └── api/
│       ├── hazards/                # Bounding-box and CRUD endpoints
│       ├── hazards/[id]/           # Single hazard updates & verification
│       ├── hazards/nearby/         # Radius search (500m - 5km)
│       ├── ai/analyze/             # Server-side AI image analysis
│       ├── weather/                # Live precipitation & humidity
│       ├── routes/hazards/         # Route buffer hazard analysis
│       ├── analytics/              # Aggregated metrics for charts
│       ├── maintenance/            # Task dispatch & repair updates
│       ├── community/confirm/      # Citizen verification votes
│       ├── notifications/          # Alert feeds
│       └── admin/settings/         # Dynamic risk weights configuration
├── components/
│   ├── context/                    # AuthContext & NotificationContext
│   ├── map/                        # MapContainer, Controls, Layers, Filters, Search
│   ├── navigation/                 # Navbar & MobileNav
│   ├── admin/                      # AdminCharts
│   └── ui/                         # DemoBadge
├── lib/
│   ├── types/hazard.ts             # TypeScript entity definitions
│   ├── risk/risk-engine.ts         # Multi-factor risk calculation engine (0-100)
│   ├── ai/ai-provider.ts           # AI Vision abstraction & YOLO adapter
│   ├── weather/weather-service.ts  # Open-Meteo & simulated weather provider
│   ├── geocoding/geocoding-service.ts # Bengaluru landmark spatial index
│   ├── routing/routing-service.ts  # Haversine distance & route buffer analysis
│   ├── db/store.ts                 # Unified store adapter (Dual-mode)
│   ├── db/demo-data.ts             # 50+ realistic Bengaluru hazard records
│   └── validation/schemas.ts       # Zod validation schemas
├── supabase/
│   ├── migrations/                 # PostGIS schema, indexes & RLS policies
│   └── seed.sql                    # Realistic demonstration seed records
└── tests/
    └── run-tests.ts                # Automated test suite (14/14 passing)
```

---

## Quick Start & Local Run

### Prerequisites
- Node.js 18.x or higher (Node 20+ recommended)
- npm 9+ or pnpm / yarn

### 1. Installation
```bash
# Clone or navigate to the project directory
cd floodguard-ai

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default `.env.local` contents:
```env
DEMO_MODE=true
NEXT_PUBLIC_MAP_STYLE_URL=https://basemaps.cartocdn.com/gl/positron-gl-style/style.json
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> [!TIP]
> With `DEMO_MODE=true`, **no external API keys or Supabase credentials are required**. The app will immediately load 50+ realistic Bengaluru hazard records, simulated weather, AI image detection, route calculations, and administrative tools!

### 3. Run Automated Tests
```bash
npm test
```
*Expected: 14/14 automated tests pass verifying risk engine calculations, AI classification, geospatial distance, and Zod schemas.*

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Supabase & PostGIS Setup (Production)

If you wish to connect a live Supabase PostgreSQL database with PostGIS:

1. **Create a Supabase Project**: Go to [supabase.com](https://supabase.com) and create a new project.
2. **Run Migrations**:
   - Open the **SQL Editor** in your Supabase dashboard.
   - Execute the SQL script in `supabase/migrations/20260918000001_initial_schema.sql`.
   - (Optional) Execute `supabase/seed.sql` to populate initial demo records.
3. **Storage Buckets**:
   - In Supabase Storage, create two public buckets: `hazard-evidence` and `maintenance-evidence`.
4. **Set Environment Keys** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
   DEMO_MODE=false
   ```

---

## Connecting External APIs (Optional)

The application includes provider abstractions with automatic graceful fallbacks. You can optionally connect:

| Provider | Environment Variable | Description | Default Fallback |
| :--- | :--- | :--- | :--- |
| **Vision AI** | `AI_API_KEY` | Google Cloud Vision or OpenAI Vision API | Built-in YOLOv8 simulated vision |
| **Weather** | `WEATHER_API_KEY` | OpenWeatherMap or Tomorrow.io | Open-Meteo Free GIS API & Simulation |
| **Geocoding** | `GEOCODING_API_KEY` | Google Maps or Mapbox Geocoding | OSM Nominatim & Bengaluru landmark index |
| **Routing** | `ROUTING_API_KEY` | Mapbox Directions or Google Directions | OSRM Public Routing & Geometric buffer |

---

## Vercel Deployment

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete FLOODGUARD AI platform"
   git branch -M main
   git remote add origin https://github.com/your-username/floodguard-ai.git
   git push -u origin main
   ```
2. Import the repository in [Vercel](https://vercel.com).
3. Set Environment Variables in Vercel Project Settings:
   - `DEMO_MODE=true` (or Supabase keys for production)
   - `NEXT_PUBLIC_MAP_STYLE_URL=https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`
4. Click **Deploy**. Next.js App Router will generate all 29 static and dynamic routes.

---

## Testing & Quality Summary

- **TypeScript Typecheck**: Passed cleanly with zero errors (`tsc --noEmit`).
- **Automated Tests**: Passed 14/14 unit & integration test suites (`tsx tests/run-tests.ts`).
- **Production Build**: Built cleanly with Turbopack compiler (`next build`), generating all 29 routes without warnings.
