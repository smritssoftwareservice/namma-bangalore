# 🏙️ ನಮ್ಮ Bengaluru 3D | Real Estate Visualization & Development Platform

A high-performance, photorealistic **3D Real Estate Visualization, Architectural Simulation, and Urban Planning Platform** tailored to Bengaluru (Bangalore), Karnataka, India. Built with **Next.js (App Router)** and **CesiumJS**.

---

## 🌟 Core Real Estate & Urban Planning Concept

```
USER SELECTS A REAL ESTATE SITE ON THE 3D MAP
        ↓
SITE BOUNDARY & CADASTRAL METRICS APPEAR
        ↓
USER CAN UPLOAD A 3D BUILDING (.GLB / .GLTF)
        ↓
BUILDING IS PLACED ON THE REAL SITE TERRAIN
        ↓
USER CAN MOVE / ROTATE / SCALE / ELEVATE IT
        ↓
USER CAN ADD VILLAS / APARTMENTS / TOWERS / MASTERPLANS
        ↓
USER CAN WALK / ORBIT 360° / VIEW FIRST-PERSON (WASD)
        ↓
USER CAN TOGGLE SATELLITE / 3D / TERRAIN / CONTOUR
        ↓
USER CAN COMPARE EXISTING VS PROPOSED DEVELOPMENT
```

---

## 🚀 Key Features

### 1. 📍 Prime Bengaluru Development Sites & Cadastral Boundaries
- Curated high-potential land parcels across key development corridors:
  - **Devanahalli Aerotropolis Hub** (18.5 Acres • BIAPPA • High-Density Commercial)
  - **Whitefield Eco-Villa & Tech Parcel** (8.4 Acres • BDA • Luxury Residential R3)
  - **Outer Ring Road Bellandur Site** (6.2 Acres • BBMP • Commercial C4 High-Rise)
  - **Hebbal Lakeview Enclave** (9.6 Acres • BDA/BBMP • Lakeview Luxury Towers)
  - **Sarjapur Mixed-Use Township** (14.2 Acres • BMRDA • Integrated Township)
- Glowing cadastral boundary polygons, setback outlines, corner peg markers, and instant area computations (Acres, Sq.Ft, Sq.M).

### 2. 🏢 3D Building Ingestion & Architectural Catalog
- **Upload Custom 3D Models**: Drag-and-drop or select any `.glb` or `.gltf` 3D architectural model to place directly on the site.
- **Parametric Architectural Prototypes**:
  - **Aura Glass Skyscraper**: 35-storey commercial tower with glass curtain walls, floor bands, and illuminated crown spire.
  - **Skyline Twin Towers**: 28-storey dual towers with illuminated skybridge and rooftop observation decks.
  - **Zenith Contemporary Villa**: G+2 modernist villa with cantilevered decks and plunge pool.
  - **Pavilion Club & Retail**: 3-storey lifestyle amenity clubhouse.
  - **Landscape & Central Park**: Native green lawns, trees, and water fountain plaza.

### 3. 🕹️ Precision Transform Gizmo
- Real-time precision controls for any placed structure:
  - **Position Nudge**: Directional micro-adjustments (North, South, East, West in meters).
  - **Rotation**: 0° to 360° heading dial with live degrees indicator.
  - **Height & Storeys**: Vertical scaling from 6m to 160m with live floor count estimation.
  - **Footprint Scale**: 0.5x to 2.5x footprint multiplier.
  - **Plinth Elevation**: -5m to +25m ground clearance offset for sloping terrain.
  - **Material & Glass Palette**: Oceanic Blue, Amber Gold, Emerald Glaze, Royal Amethyst, Stealth Slate, and Platinum.
  - **Duplicate & Delete**: One-click structure cloning and spacing.

### 4. 🔄 Existing vs Proposed Development Comparison
- Seamless floating toggle:
  - **Existing Site**: View the virgin satellite ground and current baseline conditions without proposed buildings.
  - **Proposed 3D**: Experience the full future masterplan with 3D buildings, boundary polygons, and landscaping.

### 5. ☀️ Real-Time Solar & Shadow Simulation
- Interactive time-of-day slider (06:00 to 18:30) with dynamic Cesium solar illumination and raytraced shadows across building facades and adjacent terrain.

### 6. 🚶 Multi-Perspective Camera Navigation
- **360° Drone Orbit**: Smooth cinematic orbital flight around development sites.
- **Pedestrian Walkthrough Mode**: Ground-level 1.8m eye-height first-person navigation with WASD / Arrow keys.
- **Top-Down Ortho View**: Bird's-eye 90° architectural masterplan site perspective.

### 7. 📊 Urban Planning Feasibility & Yield KPIs
- Live computation of:
  - **Gross Development Value (GDV)** in ₹ Crores.
  - **Total Built-Up Area (BUA)** in Sq.Ft and Sq.M.
  - **Achieved FAR vs Permissible FAR** with compliance indicator.
  - **Ground Coverage Percentage**.

### 8. 🗺️ Preserved Core Explorer Capabilities
- Photorealistic satellite, street grid, dark cartography, and topographic basemaps.
- High-precision distance measurement tool.
- Bengaluru-bounded geocoded search for localities, metro lines, and tech parks.
- Landmarks drawer featuring Vidhana Soudha, UB City, Electronic City, ITPL, Lalbagh, and Kempegowda Airport.

---

## 🛠️ Quick Start

```bash
cd bangalore-3d
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
