"use client";

import {
  Layers,
  X,
  Sun,
  Mountain,
  CloudRain,
  Check,
  Compass,
  MapPin,
  Building,
  Droplets,
  Trees,
  Footprints,
  Shield,
  Eye,
} from "lucide-react";

export const BASEMAP_LAYERS = [
  {
    id: "esri-satellite",
    name: "Photorealistic Satellite",
    desc: "Color-graded aerial photography across Bengaluru",
    icon: "🛰️",
  },
  {
    id: "osm-streets",
    name: "Bengaluru Street Map",
    desc: "Vector road grid, metro lines, and layout borders",
    icon: "🗺️",
  },
  {
    id: "carto-dark",
    name: "Nightlife Dark Mode",
    desc: "Sleek dark cartography for architectural visualization",
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
  visLayers,
  onToggleVisLayer,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card layers-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Layers size={22} style={{ color: "var(--accent-gold)" }} />
            Layered Visualization System
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="layers-modal-subtitle">
          Toggle base geographic infrastructure and real-estate masterplan layers with refined architectural visual hierarchy.
        </p>

        {/* SECTION 1: BASE MAP LAYERS */}
        <div className="drawer-section-title">
          <Compass size={14} style={{ display: "inline", marginRight: 6, color: "var(--accent-gold)" }} />
          Base Map Geographic Layers
        </div>

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

        {/* Geographic Base Infrastructure Toggles */}
        <div className="layer-toggles-container">
          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">
                <Footprints size={15} style={{ display: "inline", marginRight: 6 }} />
                Subtle Road & Infrastructure Network
              </div>
              <div className="toggle-desc">Elegantly traces highways, arterial roads, and metro lines</div>
            </div>
            <input
              type="checkbox"
              checked={visLayers?.roadNetwork ?? true}
              onChange={() => onToggleVisLayer("roadNetwork")}
              className="layer-checkbox"
            />
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">
                <Droplets size={15} style={{ display: "inline", marginRight: 6, color: "#38bdf8" }} />
                Bengaluru Water Bodies & Lakes
              </div>
              <div className="toggle-desc">Ulsoor, Bellandur, Hebbal, Sankey & Agara lake perimeters</div>
            </div>
            <input
              type="checkbox"
              checked={visLayers?.waterBodies ?? true}
              onChange={() => onToggleVisLayer("waterBodies")}
              className="layer-checkbox"
            />
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">
                <Trees size={15} style={{ display: "inline", marginRight: 6, color: "#10b981" }} />
                Urban Green Reserves & Public Parks
              </div>
              <div className="toggle-desc">Cubbon Park, Lalbagh Gardens, and botanical buffers</div>
            </div>
            <input
              type="checkbox"
              checked={visLayers?.parks ?? true}
              onChange={() => onToggleVisLayer("parks")}
              className="layer-checkbox"
            />
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">
                <Shield size={15} style={{ display: "inline", marginRight: 6, color: "#818cf8" }} />
                Metropolitan Planning & Admin Boundaries
              </div>
              <div className="toggle-desc">BBMP municipal limits & BDA planning zones</div>
            </div>
            <input
              type="checkbox"
              checked={visLayers?.adminBoundaries ?? true}
              onChange={() => onToggleVisLayer("adminBoundaries")}
              className="layer-checkbox"
            />
          </div>
        </div>

        {/* SECTION 2: REAL ESTATE OVERLAYS */}
        <div className="drawer-section-title" style={{ marginTop: 18 }}>
          <Building size={14} style={{ display: "inline", marginRight: 6, color: "var(--accent-gold)" }} />
          Real Estate & Masterplan Overlays
        </div>

        <div className="layer-toggles-container">
          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">
                <MapPin size={15} style={{ display: "inline", marginRight: 6, color: "var(--accent-gold)" }} />
                Active Site Cadastral Boundary & Fill
              </div>
              <div className="toggle-desc">Subtle glowing edge with 12% transparent architectural fill</div>
            </div>
            <input
              type="checkbox"
              checked={visLayers?.siteBoundary ?? true}
              onChange={() => onToggleVisLayer("siteBoundary")}
              className="layer-checkbox"
            />
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">
                <Shield size={15} style={{ display: "inline", marginRight: 6, color: "#f59e0b" }} />
                Peripheral Setbacks & Mandatory Clearances
              </div>
              <div className="toggle-desc">6m - 9m regulatory fire & setback perimeter line</div>
            </div>
            <input
              type="checkbox"
              checked={visLayers?.setbacks ?? true}
              onChange={() => onToggleVisLayer("setbacks")}
              className="layer-checkbox"
            />
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">
                <Footprints size={15} style={{ display: "inline", marginRight: 6 }} />
                Internal Roads, Driveways & Circulation
              </div>
              <div className="toggle-desc">Site access boulevards and pedestrian walkways</div>
            </div>
            <input
              type="checkbox"
              checked={visLayers?.internalRoads ?? true}
              onChange={() => onToggleVisLayer("internalRoads")}
              className="layer-checkbox"
            />
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">
                <Building size={15} style={{ display: "inline", marginRight: 6, color: "#38bdf8" }} />
                3D Proposed Buildings (Towers, Villas, Club)
              </div>
              <div className="toggle-desc">Multi-tier realistic glass/concrete facades with floor striations</div>
            </div>
            <input
              type="checkbox"
              checked={visLayers?.proposedBuildings ?? true}
              onChange={() => onToggleVisLayer("proposedBuildings")}
              className="layer-checkbox"
            />
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">
                <MapPin size={15} style={{ display: "inline", marginRight: 6, color: "var(--text-muted)" }} />
                Secondary Land Parcels across Bengaluru
              </div>
              <div className="toggle-desc">Subtle architectural dashed parcel outlines</div>
            </div>
            <input
              type="checkbox"
              checked={visLayers?.otherParcels ?? true}
              onChange={() => onToggleVisLayer("otherParcels")}
              className="layer-checkbox"
            />
          </div>
        </div>

        {/* SECTION 3: ENVIRONMENT & LIGHTING FX */}
        <div className="drawer-section-title" style={{ marginTop: 18 }}>
          <Sun size={14} style={{ display: "inline", marginRight: 6, color: "var(--accent-gold)" }} />
          Atmosphere & Natural Lighting
        </div>

        <div className="layer-toggles-container">
          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">
                <Mountain size={15} style={{ display: "inline", marginRight: 6 }} />
                3D Terrain Elevation
              </div>
              <div className="toggle-desc">True topography of Bangalore plateau and ridges</div>
            </div>
            <input
              type="checkbox"
              checked={settings.terrain}
              onChange={() => onToggleSetting("terrain")}
              className="layer-checkbox"
            />
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">
                <Sun size={15} style={{ display: "inline", marginRight: 6 }} />
                Natural Solar Lighting & Soft Shadows
              </div>
              <div className="toggle-desc">Real-time solar shadows across building facades</div>
            </div>
            <input
              type="checkbox"
              checked={settings.lighting}
              onChange={() => onToggleSetting("lighting")}
              className="layer-checkbox"
            />
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">
                <CloudRain size={15} style={{ display: "inline", marginRight: 6 }} />
                Aerial Atmospheric Depth & Soft Fog
              </div>
              <div className="toggle-desc">Subtle haze and distance perspective for realistic scale</div>
            </div>
            <input
              type="checkbox"
              checked={settings.atmosphere}
              onChange={() => onToggleSetting("atmosphere")}
              className="layer-checkbox"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
