"use client";

import { Layers, X, Sun, Mountain, CloudRain, Check } from "lucide-react";

export const BASEMAP_LAYERS = [
  {
    id: "esri-satellite",
    name: "Photorealistic Satellite",
    desc: "Ultra-sharp satellite imagery across Bengaluru",
    icon: "🛰️",
  },
  {
    id: "osm-streets",
    name: "Bengaluru Street Map",
    desc: "Complete road grid, metro lines, and layout borders",
    icon: "🗺️",
  },
  {
    id: "carto-dark",
    name: "Nightlife Dark Mode",
    desc: "Sleek dark cartography for evening visualization",
    icon: "🌑",
  },
  {
    id: "opentopo",
    name: "Topographic Relief",
    desc: "Bangalore plateau contours & Nandi Hills elevations",
    icon: "🏔️",
  },
];

export default function LayersModal({
  isOpen,
  onClose,
  activeLayer,
  onChangeLayer,
  settings,
  onToggleSetting,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Layers size={22} style={{ color: "var(--accent-gold)" }} />
            Map Layers & Environment
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-section-title">Basemap Styles</div>
        <div className="layers-grid">
          {BASEMAP_LAYERS.map((layer) => (
            <div
              key={layer.id}
              className={`layer-option ${activeLayer === layer.id ? "active" : ""}`}
              onClick={() => onChangeLayer(layer.id)}
            >
              <div className="layer-title">
                <span>{layer.icon} {layer.name}</span>
                {activeLayer === layer.id && (
                  <Check size={16} style={{ color: "var(--accent-gold)" }} />
                )}
              </div>
              <div className="layer-desc">{layer.desc}</div>
            </div>
          ))}
        </div>

        <div className="drawer-section-title">Environment & Terrain FX</div>

        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-label">
              <Mountain size={15} style={{ display: "inline", marginRight: 6, verticalOrigin: "middle" }} />
              3D Elevation Terrain
            </div>
            <div className="toggle-desc">Enable Bangalore plateau and hill terrain elevation</div>
          </div>
          <input
            type="checkbox"
            checked={settings.terrain}
            onChange={() => onToggleSetting("terrain")}
            style={{ cursor: "pointer", width: 18, height: 18, accentColor: "var(--accent-gold)" }}
          />
        </div>

        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-label">
              <Sun size={15} style={{ display: "inline", marginRight: 6, verticalOrigin: "middle" }} />
              Sun Lighting & Shadows
            </div>
            <div className="toggle-desc">Simulate realistic dynamic solar angles</div>
          </div>
          <input
            type="checkbox"
            checked={settings.lighting}
            onChange={() => onToggleSetting("lighting")}
            style={{ cursor: "pointer", width: 18, height: 18, accentColor: "var(--accent-gold)" }}
          />
        </div>

        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-label">
              <CloudRain size={15} style={{ display: "inline", marginRight: 6, verticalOrigin: "middle" }} />
              Atmospheric Glow & Haze
            </div>
            <div className="toggle-desc">Realistic atmospheric haze and distance scattering</div>
          </div>
          <input
            type="checkbox"
            checked={settings.atmosphere}
            onChange={() => onToggleSetting("atmosphere")}
            style={{ cursor: "pointer", width: 18, height: 18, accentColor: "var(--accent-gold)" }}
          />
        </div>
      </div>
    </div>
  );
}
