# 🏙️ ನಮ್ಮ Bengaluru 3D Explorer (Silicon Valley of India)

An interactive, high-performance 3D City Explorer built with **Next.js (App Router)** and **CesiumJS**, tailored and bounded strictly to **Bengaluru (Bangalore), Karnataka, India**.

---

## 🌟 Key Features

- 📍 **City-Bounded Extents & Constraints**:
  - Camera navigation is bounded to the Greater Bengaluru Metropolitan Area (`12.70°N – 13.40°N`, `77.25°E – 77.95°E`).
  - Strict maximum zoom altitude ceiling prevents zooming out to the whole Earth, keeping the user immersed in Bangalore.
- 🏛️ **Iconic Bengaluru Landmarks & IT Corridors**:
  - **Heritage**: Vidhana Soudha, Bangalore Palace, Tipu Sultan's Summer Palace.
  - **Tech Corridors**: Electronic City (Infosys/Wipro), ITPL Whitefield, Manyata Embassy Business Park, Outer Ring Road.
  - **Nature & Parks**: Lalbagh Glass House, Cubbon Park, Sankey Tank, Nandi Hills.
  - **Commercial & Lifestyle**: UB City, MG Road, Church Street, Koramangala 80ft Road, Indiranagar 100ft Road.
  - **Transit**: Kempegowda International Airport (BLR T2).
- 🔎 **Bengaluru-Bounded Geocoding Search**:
  - Real-time OpenStreetMap Nominatim search pre-filtered specifically to Bangalore localities, metro stations, tech parks, and streets.
- 🧭 **Real-Time Neighborhood Zone HUD**:
  - Live indicator tracks which zone of Bangalore the camera is viewing (*CBD, Indiranagar, Koramangala, Whitefield, Electronic City, Hebbal, etc.*).
- 🔄 **360° Drone Orbit & Camera Flight**:
  - Cinematic orbital rotation around any Bangalore landmark or skyscraper.
- 📐 **City Measurement Tool**:
  - Point-to-point and path distance calculation across Bangalore roads and neighborhoods.
- ⚡ **Lightweight & High Performance**:
  - Standalone CDN Cesium engine (no SWC minifier errors, instant load times, under 90 KB initial bundle).

---

## 🚀 Quick Start

```bash
cd bangalore-3d
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the assigned port) in your browser.
