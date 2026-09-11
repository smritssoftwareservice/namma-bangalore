"use client";

import { useState, useRef, useEffect } from "react";
import {
  Building2,
  Plus,
  Upload,
  RotateCw,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Trash2,
  Copy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileCode,
  MapPin,
  TrendingUp,
  Layers,
  Home,
  Compass,
  Eye,
  Ghost,
  Grid,
  PenTool,
} from "lucide-react";
import {
  REAL_ESTATE_SITES,
  ARCHITECTURAL_BUILDING_TYPES,
  ARCHITECTURAL_MATERIALS,
  FACADE_STYLES,
  normalizeBuilding,
  calculatePolygonAreaSqFt,
} from "./RealEstateSites";

export default function BuildingConfigurator({
  isOpen,
  onToggleOpen,
  activeSite,
  onSelectSite,
  placedBuildings,
  selectedBuildingId,
  onSelectBuilding,
  onAddBuilding,
  onUploadModel,
  onUpdateBuilding,
  onDeleteBuilding,
  onDuplicateBuilding,
  onGenerateMasterplan,
  onClearAllBuildings,
  onNudgeSiteVertex,
  onOpenUploadModal,
  isDraggingBuilding,
  onToggleDragMode,
  proposedRenderMode = "realistic",
  onChangeProposedRenderMode,
  proposedOpacity = 0.85,
  onChangeProposedOpacity,
  existingBuildingsEnabled = true,
  onToggleExistingBuildings,
  isEditingBoundary = false,
  onToggleEditBoundary,
  onStartDrawBoundary,
  onAddSiteVertex,
  onDeleteSiteVertex,
}) {
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' | 'transform' | 'proposed' | 'sites' | 'kpis'
  const fileInputRef = useRef(null);

  // Auto-switch to properties tab whenever a building is selected
  useEffect(() => {
    if (selectedBuildingId) {
      setActiveTab("properties");
    }
  }, [selectedBuildingId]);

  // Find currently selected building object
  const selectedBuilding = placedBuildings.find(
    (b) => b.id === selectedBuildingId
  );

  // Calculate Real-time Development Metrics
  const totalFootprintSqFt = placedBuildings.reduce((sum, b) => {
    const typeDef = ARCHITECTURAL_BUILDING_TYPES.find((t) => t.id === b.typeId);
    const w = b.width || typeDef?.defaultWidth || 34;
    const l = b.length || b.depth || typeDef?.defaultLength || 32;
    return sum + Math.round(w * l * 10.7639);
  }, 0);

  const totalBUASqFt = placedBuildings.reduce((sum, b) => {
    const typeDef = ARCHITECTURAL_BUILDING_TYPES.find((t) => t.id === b.typeId);
    if (typeDef?.isLandscape) return sum;
    if (b.buaSqFt) return sum + b.buaSqFt;
    const w = b.width || typeDef?.defaultWidth || 34;
    const l = b.length || b.depth || typeDef?.defaultLength || 32;
    const floors = b.floors || Math.max(1, Math.round((b.height || 50) / 3.2));
    return sum + Math.round(w * l * 10.7639 * floors);
  }, 0);

  const siteAreaSqFt = activeSite?.areaSqFt || 500000;
  const permissibleFAR = activeSite?.permissibleFAR || 3.0;
  const achievedFAR = siteAreaSqFt > 0 ? parseFloat((totalBUASqFt / siteAreaSqFt).toFixed(2)) : 0;
  const groundCoveragePct = siteAreaSqFt > 0 ? Math.min(100, parseFloat(((totalFootprintSqFt / siteAreaSqFt) * 100).toFixed(1))) : 0;

  // Approximate GDV estimate (₹ 10,000 / sq.ft BUA average Bengaluru prime real estate)
  const estimatedGDVCrores = Math.round((totalBUASqFt * 10500) / 10000000);

  // Handle custom 3D model file upload (.glb / .gltf)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    if (extension !== "glb" && extension !== "gltf") {
      alert("Please upload a 3D model in .glb or .gltf format.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    onUploadModel({
      name: file.name.replace(/\.[^/.]+$/, ""),
      uri: objectUrl,
      file: file,
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Nudge Building in coordinates (offset in meters approx)
  const nudgeBuilding = (dNorth, dEast) => {
    if (!selectedBuilding) return;
    const dLat = (dNorth / 111000);
    const dLng = (dEast / (111000 * Math.cos((selectedBuilding.lat * Math.PI) / 180)));
    onUpdateBuilding(selectedBuilding.id, {
      lat: selectedBuilding.lat + dLat,
      lng: selectedBuilding.lng + dLng,
    });
  };

  return (
    <div className={`arch-configurator-dock ${isOpen ? "open" : "collapsed"}`}>
      {/* Dock Header & Toggle */}
      <div className="dock-header" onClick={onToggleOpen}>
        <div className="dock-header-left">
          <div className="dock-icon-box">
            <Building2 size={18} color="#f59e0b" />
          </div>
          <div>
            <h3 className="dock-title">Apartment & Tower Planner</h3>
            <span className="dock-subtitle">
              {activeSite ? `${activeSite.name} • ${placedBuildings.length} Placed` : "Select a Land Parcel"}
            </span>
          </div>
        </div>

        <button className="dock-toggle-btn" title={isOpen ? "Collapse Dock" : "Expand Dock"}>
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {/* Dock Body */}
      {isOpen && (
        <div className="dock-body">
          {/* Top Navigation Tabs */}
          <div className="dock-tabs">
            <button
              className={`dock-tab ${activeTab === "catalog" ? "active" : ""}`}
              onClick={() => setActiveTab("catalog")}
            >
              <Building2 size={14} />
              <span>Add Tower / Block</span>
            </button>
            <button
              className={`dock-tab ${activeTab === "properties" || activeTab === "transform" ? "active" : ""}`}
              onClick={() => setActiveTab("properties")}
            >
              <Sliders size={14} />
              <span>Building Properties Panel {selectedBuilding ? "★" : ""}</span>
            </button>
            <button
              className={`dock-tab ${activeTab === "proposed" ? "active" : ""}`}
              onClick={() => setActiveTab("proposed")}
            >
              <Sparkles size={14} style={{ color: "var(--accent-gold)" }} />
              <span>Proposed Layer</span>
            </button>
            <button
              className={`dock-tab ${activeTab === "sites" ? "active" : ""}`}
              onClick={() => setActiveTab("sites")}
            >
              <MapPin size={14} />
              <span>Boundary & Sites</span>
            </button>
            <button
              className={`dock-tab ${activeTab === "kpis" ? "active" : ""}`}
              onClick={() => setActiveTab("kpis")}
            >
              <TrendingUp size={14} />
              <span>KPIs & Yield</span>
            </button>
          </div>

          {/* TAB 1: CATALOG & 3D UPLOAD */}
          {activeTab === "catalog" && (
            <div className="dock-panel">
              {/* Custom 3D Model Upload Banner */}
              <div
                className="upload-box"
                onClick={() => {
                  if (onOpenUploadModal) onOpenUploadModal();
                  else fileInputRef.current?.click();
                }}
              >
                <Upload size={22} style={{ color: "var(--accent-gold)" }} />
                <div className="upload-texts">
                  <strong>+ Add 3D Building</strong>
                  <span>Supports .GLB, .GLTF, .OBJ, .FBX & .ZIP models</span>
                </div>
              </div>

              {/* Masterplan Quick Action */}
              <div className="masterplan-actions-bar">
                <button
                  className="action-btn-primary"
                  onClick={onGenerateMasterplan}
                  title="Generate optimal masterplan layout for this site"
                >
                  <Sparkles size={15} />
                  Auto-Deploy Masterplan
                </button>
                {placedBuildings.length > 0 && (
                  <button
                    className="action-btn-danger"
                    onClick={onClearAllBuildings}
                    title="Remove all placed structures"
                  >
                    <Trash2 size={14} />
                    Clear ({placedBuildings.length})
                  </button>
                )}
              </div>

              {/* Architectural Building Prototypes */}
              <div className="section-label">Apartment & Tower Typologies (6 Types)</div>
              <div className="building-cards-grid">
                {ARCHITECTURAL_BUILDING_TYPES.map((bld) => (
                  <div
                    key={bld.id}
                    className="building-card"
                    onClick={() => onAddBuilding(bld.id)}
                  >
                    <div className="bld-card-icon">{bld.thumbIcon}</div>
                    <div className="bld-card-info">
                      <div className="bld-card-name">{bld.name}</div>
                      <div className="bld-card-meta">
                        {bld.category} • {bld.defaultFloors || bld.floors} Storeys • {bld.defaultHeight || bld.height}m
                      </div>
                    </div>
                    <button className="bld-add-btn" title="Add to Site">
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BUILDING PROPERTIES PANEL (APARTMENT & TOWER PLANNER) */}
          {(activeTab === "properties" || activeTab === "transform") && (
            <div className="dock-panel">
              {/* Placed Building Picker */}
              <div className="section-label">Select Placed Structure ({placedBuildings.length})</div>
              {placedBuildings.length === 0 ? (
                <div className="empty-msg">
                  No buildings on site yet. Add an Apartment Block, Residential Tower, Commercial Building, Clubhouse, or Parking Structure from "Catalog & Add".
                </div>
              ) : (
                <div className="placed-chips-scroll">
                  {placedBuildings.map((b) => (
                    <button
                      key={b.id}
                      className={`placed-chip ${selectedBuildingId === b.id ? "active" : ""}`}
                      onClick={() => onSelectBuilding(b.id)}
                    >
                      <span className="chip-dot" style={{ backgroundColor: b.color || "#f59e0b" }} />
                      {b.name || b.id}
                    </button>
                  ))}
                </div>
              )}

              {selectedBuilding ? (
                <div className="transform-controls-card">
                  {/* Selected Building Details Header */}
                  <div className="transform-bld-header">
                    <div>
                      <h4>{selectedBuilding.name || "Building Structure"}</h4>
                      <span className="bld-type-sub">
                        {ARCHITECTURAL_BUILDING_TYPES.find((t) => t.id === selectedBuilding.typeId)?.category || "Building"} • {selectedBuilding.lat.toFixed(5)}°N, {selectedBuilding.lng.toFixed(5)}°E
                      </span>
                    </div>
                    <div className="transform-header-actions">
                      <button
                        className="icon-action-btn"
                        onClick={() => onDuplicateBuilding(selectedBuilding.id)}
                        title="Duplicate Structure"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        className="icon-action-btn delete"
                        onClick={() => onDeleteBuilding(selectedBuilding.id)}
                        title="Delete Structure"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* 25F to 30F Live Demonstration Banner */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    marginBottom: "10px",
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(212, 175, 55, 0.08))",
                    border: "1px solid rgba(245, 158, 11, 0.35)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles size={14} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: "#ffffff" }}>Tower Height Sync Demo</strong>
                        <div style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "11px" }}>
                          {selectedBuilding.floors === 30 ? "Active: 30 Floors (96m • 240 Units)" : "Active: 25 Floors (80m • 200 Units)"}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="action-btn-primary"
                      style={{
                        padding: "4px 10px",
                        fontSize: "11px",
                        height: "auto",
                        background: selectedBuilding.floors === 30 ? "rgba(56, 189, 248, 0.25)" : "var(--accent-gold)",
                        borderColor: selectedBuilding.floors === 30 ? "#38bdf8" : "var(--accent-gold)",
                        color: selectedBuilding.floors === 30 ? "#38bdf8" : "#000",
                        fontWeight: 700,
                      }}
                      onClick={() => {
                        const targetFloors = selectedBuilding.floors === 30 ? 25 : 30;
                        const floorHeight = selectedBuilding.floorHeight || 3.2;
                        const height = parseFloat((targetFloors * floorHeight).toFixed(1));
                        const unitsPerFloor = selectedBuilding.unitsPerFloor || 8;
                        const units = Math.round(targetFloors * unitsPerFloor);
                        const w = selectedBuilding.width || 34;
                        const l = selectedBuilding.length || selectedBuilding.depth || 32;
                        const buaSqFt = Math.round(w * l * 10.7639 * targetFloors);
                        onUpdateBuilding(selectedBuilding.id, {
                          floors: targetFloors,
                          height,
                          units,
                          buaSqFt,
                        });
                      }}
                    >
                      {selectedBuilding.floors === 30 ? "Reset to 25F (80m)" : "Test 25 → 30 Floors (96m)"}
                    </button>
                  </div>

                  {/* ========================================================= */}
                  {/* 1. BUILDING PARAMETERS                                   */}
                  {/* ========================================================= */}
                  <div className="transform-section-box">
                    <div className="transform-section-title">
                      <Building2 size={14} style={{ color: "var(--accent-gold)" }} />
                      <span>BUILDING PARAMETERS</span>
                    </div>

                    {/* Number of floors */}
                    <div className="control-row">
                      <div className="control-label-group">
                        <span className="control-label">Number of Floors</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input
                            type="number"
                            min="1"
                            max="80"
                            step="1"
                            value={selectedBuilding.floors ?? Math.max(1, Math.round((selectedBuilding.height || 50) / (selectedBuilding.floorHeight || 3.2)))}
                            onChange={(e) => {
                              const floors = Math.max(1, parseInt(e.target.value) || 1);
                              const floorHeight = selectedBuilding.floorHeight || 3.2;
                              const height = parseFloat((floors * floorHeight).toFixed(1));
                              const unitsPerFloor = selectedBuilding.unitsPerFloor || 8;
                              const units = Math.round(floors * unitsPerFloor);
                              const w = selectedBuilding.width || 34;
                              const l = selectedBuilding.length || selectedBuilding.depth || 32;
                              const buaSqFt = Math.round(w * l * 10.7639 * floors);
                              onUpdateBuilding(selectedBuilding.id, {
                                floors,
                                height,
                                units,
                                buaSqFt,
                              });
                            }}
                            className="numeric-inline-field"
                          />
                          <span className="control-value">Floors</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="70"
                        step="1"
                        value={selectedBuilding.floors ?? Math.max(1, Math.round((selectedBuilding.height || 50) / (selectedBuilding.floorHeight || 3.2)))}
                        onChange={(e) => {
                          const floors = Math.max(1, parseInt(e.target.value) || 1);
                          const floorHeight = selectedBuilding.floorHeight || 3.2;
                          const height = parseFloat((floors * floorHeight).toFixed(1));
                          const unitsPerFloor = selectedBuilding.unitsPerFloor || 8;
                          const units = Math.round(floors * unitsPerFloor);
                          const w = selectedBuilding.width || 34;
                          const l = selectedBuilding.length || selectedBuilding.depth || 32;
                          const buaSqFt = Math.round(w * l * 10.7639 * floors);
                          onUpdateBuilding(selectedBuilding.id, {
                            floors,
                            height,
                            units,
                            buaSqFt,
                          });
                        }}
                        className="slider-input"
                      />
                    </div>

                    {/* Floor height */}
                    <div className="control-row">
                      <div className="control-label-group">
                        <span className="control-label">Floor Height</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input
                            type="number"
                            min="2.4"
                            max="5.5"
                            step="0.1"
                            value={parseFloat((selectedBuilding.floorHeight || 3.2).toFixed(1))}
                            onChange={(e) => {
                              const floorHeight = parseFloat(e.target.value) || 3.2;
                              const floors = selectedBuilding.floors || Math.max(1, Math.round((selectedBuilding.height || 50) / floorHeight));
                              const height = parseFloat((floors * floorHeight).toFixed(1));
                              onUpdateBuilding(selectedBuilding.id, {
                                floorHeight,
                                height,
                              });
                            }}
                            className="numeric-inline-field"
                          />
                          <span className="control-value">m</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="2.5"
                        max="5.0"
                        step="0.1"
                        value={selectedBuilding.floorHeight || 3.2}
                        onChange={(e) => {
                          const floorHeight = parseFloat(e.target.value) || 3.2;
                          const floors = selectedBuilding.floors || Math.max(1, Math.round((selectedBuilding.height || 50) / floorHeight));
                          const height = parseFloat((floors * floorHeight).toFixed(1));
                          onUpdateBuilding(selectedBuilding.id, {
                            floorHeight,
                            height,
                          });
                        }}
                        className="slider-input"
                      />
                    </div>

                    {/* Total height */}
                    <div className="control-row">
                      <div className="control-label-group">
                        <span className="control-label">Total Height</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input
                            type="number"
                            min="3"
                            max="350"
                            step="0.5"
                            value={parseFloat((selectedBuilding.height || 50).toFixed(1))}
                            onChange={(e) => {
                              const height = Math.max(3, parseFloat(e.target.value) || 10);
                              const floorHeight = selectedBuilding.floorHeight || 3.2;
                              const floors = Math.max(1, Math.round(height / floorHeight));
                              const unitsPerFloor = selectedBuilding.unitsPerFloor || 8;
                              const units = Math.round(floors * unitsPerFloor);
                              const w = selectedBuilding.width || 34;
                              const l = selectedBuilding.length || selectedBuilding.depth || 32;
                              const buaSqFt = Math.round(w * l * 10.7639 * floors);
                              onUpdateBuilding(selectedBuilding.id, {
                                height,
                                floors,
                                units,
                                buaSqFt,
                              });
                            }}
                            className="numeric-inline-field"
                          />
                          <span className="control-value">m</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="6"
                        max="260"
                        step="1"
                        value={selectedBuilding.height || 50}
                        onChange={(e) => {
                          const height = parseFloat(e.target.value) || 10;
                          const floorHeight = selectedBuilding.floorHeight || 3.2;
                          const floors = Math.max(1, Math.round(height / floorHeight));
                          const unitsPerFloor = selectedBuilding.unitsPerFloor || 8;
                          const units = Math.round(floors * unitsPerFloor);
                          const w = selectedBuilding.width || 34;
                          const l = selectedBuilding.length || selectedBuilding.depth || 32;
                          const buaSqFt = Math.round(w * l * 10.7639 * floors);
                          onUpdateBuilding(selectedBuilding.id, {
                            height,
                            floors,
                            units,
                            buaSqFt,
                          });
                        }}
                        className="slider-input"
                      />
                    </div>

                    {/* Width & Length 2-column inputs */}
                    <div className="coords-numeric-row">
                      <div className="numeric-field-group">
                        <label>Width (m)</label>
                        <input
                          type="number"
                          min="6"
                          max="150"
                          step="1"
                          value={Math.round(selectedBuilding.width || 34)}
                          onChange={(e) => {
                            const width = Math.max(6, parseInt(e.target.value) || 10);
                            const l = selectedBuilding.length || selectedBuilding.depth || 32;
                            const fl = selectedBuilding.floors || 25;
                            const buaSqFt = Math.round(width * l * 10.7639 * fl);
                            onUpdateBuilding(selectedBuilding.id, { width, buaSqFt });
                          }}
                          className="numeric-input-field"
                        />
                      </div>
                      <div className="numeric-field-group">
                        <label>Length / Depth (m)</label>
                        <input
                          type="number"
                          min="6"
                          max="150"
                          step="1"
                          value={Math.round(selectedBuilding.length || selectedBuilding.depth || 32)}
                          onChange={(e) => {
                            const length = Math.max(6, parseInt(e.target.value) || 10);
                            const w = selectedBuilding.width || 34;
                            const fl = selectedBuilding.floors || 25;
                            const buaSqFt = Math.round(w * length * 10.7639 * fl);
                            onUpdateBuilding(selectedBuilding.id, { length, depth: length, buaSqFt });
                          }}
                          className="numeric-input-field"
                        />
                      </div>
                    </div>

                    {/* Rotation */}
                    <div className="control-row" style={{ marginTop: 4 }}>
                      <div className="control-label-group">
                        <span className="control-label">Rotation (Heading Yaw)</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input
                            type="number"
                            min="0"
                            max="360"
                            step="1"
                            value={Math.round(selectedBuilding.rotationZ ?? selectedBuilding.rotation ?? 0)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              onUpdateBuilding(selectedBuilding.id, {
                                rotation: val,
                                rotationZ: val,
                              });
                            }}
                            className="numeric-inline-field"
                          />
                          <span className="control-value">°</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="5"
                        value={selectedBuilding.rotationZ ?? selectedBuilding.rotation ?? 0}
                        onChange={(e) =>
                          onUpdateBuilding(selectedBuilding.id, {
                            rotation: parseFloat(e.target.value),
                            rotationZ: parseFloat(e.target.value),
                          })
                        }
                        className="slider-input"
                      />
                      {/* Quick Rotation Buttons */}
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        {[0, 90, 180, 270].map((angle) => (
                          <button
                            key={angle}
                            type="button"
                            className={`action-btn-secondary ${Math.round(selectedBuilding.rotationZ ?? selectedBuilding.rotation ?? 0) === angle ? "active" : ""}`}
                            style={{ flex: 1, padding: "4px 0", fontSize: 11, textAlign: "center" }}
                            onClick={() =>
                              onUpdateBuilding(selectedBuilding.id, {
                                rotation: angle,
                                rotationZ: angle,
                              })
                            }
                          >
                            {angle}°
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Elevation */}
                    <div className="control-row">
                      <div className="control-label-group">
                        <span className="control-label">Base Elevation (Plinth Offset)</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input
                            type="number"
                            step="0.5"
                            value={parseFloat((selectedBuilding.elevation || 0).toFixed(1))}
                            onChange={(e) =>
                              onUpdateBuilding(selectedBuilding.id, {
                                elevation: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="numeric-inline-field"
                          />
                          <span className="control-value">m</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="-5"
                        max="50"
                        step="0.5"
                        value={selectedBuilding.elevation || 0}
                        onChange={(e) =>
                          onUpdateBuilding(selectedBuilding.id, {
                            elevation: parseFloat(e.target.value),
                          })
                        }
                        className="slider-input"
                      />
                    </div>

                    {/* Coordinates & Site Nudge */}
                    <div style={{ marginTop: 6 }}>
                      <div className="control-label" style={{ marginBottom: 6 }}>Site Positioning & Nudge</div>
                      {onToggleDragMode && (
                        <button
                          className={`action-btn-secondary ${isDraggingBuilding ? "active" : ""}`}
                          style={{ width: "100%", marginBottom: 8 }}
                          onClick={onToggleDragMode}
                          title="Click and drag the building across the 3D map terrain"
                        >
                          <Move size={14} />
                          {isDraggingBuilding ? "Active: Click Map to Place" : "Drag on Map with Mouse"}
                        </button>
                      )}

                      <div className="coords-numeric-row">
                        <div className="numeric-field-group">
                          <label>Latitude (°N)</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={parseFloat(selectedBuilding.lat.toFixed(5))}
                            onChange={(e) =>
                              onUpdateBuilding(selectedBuilding.id, {
                                lat: parseFloat(e.target.value),
                              })
                            }
                            className="numeric-input-field"
                          />
                        </div>
                        <div className="numeric-field-group">
                          <label>Longitude (°E)</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={parseFloat(selectedBuilding.lng.toFixed(5))}
                            onChange={(e) =>
                              onUpdateBuilding(selectedBuilding.id, {
                                lng: parseFloat(e.target.value),
                              })
                            }
                            className="numeric-input-field"
                          />
                        </div>
                      </div>

                      {/* Directional Nudge Pad */}
                      <div className="nudge-pad" style={{ marginTop: 6 }}>
                        <button onClick={() => nudgeBuilding(5, 0)} title="North (+5m)">
                          <ArrowUp size={14} />
                        </button>
                        <div className="nudge-middle">
                          <button onClick={() => nudgeBuilding(0, -5)} title="West (-5m)">
                            <ArrowLeft size={14} />
                          </button>
                          <span className="nudge-center">5m</span>
                          <button onClick={() => nudgeBuilding(0, 5)} title="East (+5m)">
                            <ArrowRight size={14} />
                          </button>
                        </div>
                        <button onClick={() => nudgeBuilding(-5, 0)} title="South (-5m)">
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 2. PROPERTY DETAILS                                      */}
                  {/* ========================================================= */}
                  <div className="transform-section-box">
                    <div className="transform-section-title">
                      <Home size={14} style={{ color: "var(--accent-gold)" }} />
                      <span>PROPERTY DETAILS</span>
                    </div>

                    {/* Building Name */}
                    <div className="control-row">
                      <span className="control-label">Building Name</span>
                      <input
                        type="text"
                        value={selectedBuilding.name || ""}
                        onChange={(e) =>
                          onUpdateBuilding(selectedBuilding.id, { name: e.target.value })
                        }
                        className="text-input-field"
                        placeholder="e.g. Tower A"
                      />
                    </div>

                    {/* Building Type */}
                    <div className="control-row">
                      <span className="control-label">Building Type</span>
                      <select
                        value={selectedBuilding.typeId || "residential-tower"}
                        onChange={(e) => {
                          const newTypeId = e.target.value;
                          const typeDef = ARCHITECTURAL_BUILDING_TYPES.find((t) => t.id === newTypeId);
                          if (typeDef) {
                            onUpdateBuilding(selectedBuilding.id, {
                              typeId: newTypeId,
                              unitsPerFloor: typeDef.unitsPerFloor || 8,
                              units: Math.round((selectedBuilding.floors || typeDef.defaultFloors || 25) * (typeDef.unitsPerFloor || 8)),
                              material: typeDef.defaultMaterial || "glass-steel",
                              facadeStyle: typeDef.defaultFacadeStyle || "curtain-wall",
                              glassPercentage: typeDef.defaultGlassPercentage || 75,
                              color: typeDef.glassColor || "#38bdf8",
                            });
                          }
                        }}
                        className="select-dropdown-field"
                      >
                        {ARCHITECTURAL_BUILDING_TYPES.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.thumbIcon} {type.name} ({type.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Unit Count */}
                    <div className="control-row">
                      <div className="control-label-group">
                        <span className="control-label">Unit Count</span>
                        <span className="control-value">{selectedBuilding.units || 0} Units</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="2500"
                        step="1"
                        value={selectedBuilding.units ?? 0}
                        onChange={(e) =>
                          onUpdateBuilding(selectedBuilding.id, {
                            units: parseInt(e.target.value) || 0,
                          })
                        }
                        className="numeric-input-field"
                      />
                    </div>

                    {/* Approximate Built-up Area (BUA) Display Card */}
                    <div className="bua-metric-card">
                      <div className="bua-card-header">
                        <span className="bua-card-title">Approximate Built-up Area (BUA)</span>
                        <span className="bua-badge">FAR Basis</span>
                      </div>
                      <div className="bua-primary-val">
                        {(selectedBuilding.buaSqFt || Math.round((selectedBuilding.width || 34) * (selectedBuilding.length || 32) * 10.7639 * (selectedBuilding.floors || 25))).toLocaleString()} sq.ft
                      </div>
                      <div className="bua-sub-val">
                        ≈ {Math.round(((selectedBuilding.buaSqFt || Math.round((selectedBuilding.width || 34) * (selectedBuilding.length || 32) * 10.7639 * (selectedBuilding.floors || 25))) / 10.7639)).toLocaleString()} m² • Ground Footprint: {Math.round((selectedBuilding.width || 34) * (selectedBuilding.length || 32) * 10.7639).toLocaleString()} sq.ft
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* 3. VISUALIZATION PARAMETERS                              */}
                  {/* ========================================================= */}
                  <div className="transform-section-box">
                    <div className="transform-section-title">
                      <Eye size={14} style={{ color: "var(--accent-gold)" }} />
                      <span>VISUALIZATION & MATERIAL</span>
                    </div>

                    {/* Opacity */}
                    <div className="control-row">
                      <div className="control-label-group">
                        <span className="control-label">Opacity</span>
                        <span className="control-value">{Math.round((selectedBuilding.opacity ?? 0.90) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="1.0"
                        step="0.05"
                        value={selectedBuilding.opacity ?? 0.90}
                        onChange={(e) =>
                          onUpdateBuilding(selectedBuilding.id, {
                            opacity: parseFloat(e.target.value),
                          })
                        }
                        className="slider-input"
                      />
                    </div>

                    {/* Material Selector Cards */}
                    <div className="control-row">
                      <span className="control-label">Material</span>
                      <div className="material-picker-grid">
                        {ARCHITECTURAL_MATERIALS.map((mat) => (
                          <div
                            key={mat.id}
                            className={`material-card ${(selectedBuilding.material || "glass-steel") === mat.id ? "active" : ""}`}
                            onClick={() =>
                              onUpdateBuilding(selectedBuilding.id, {
                                material: mat.id,
                                color: mat.glassColor,
                              })
                            }
                          >
                            <span className="mat-icon">{mat.icon}</span>
                            <span className="mat-name">{mat.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Facade Style Selector Pills */}
                    <div className="control-row">
                      <span className="control-label">Facade Style</span>
                      <div className="facade-style-pills">
                        {FACADE_STYLES.map((style) => (
                          <button
                            key={style.id}
                            type="button"
                            className={`facade-pill ${(selectedBuilding.facadeStyle || "curtain-wall") === style.id ? "active" : ""}`}
                            onClick={() =>
                              onUpdateBuilding(selectedBuilding.id, {
                                facadeStyle: style.id,
                              })
                            }
                          >
                            <span>{style.icon}</span>
                            <span>{style.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Glass Percentage */}
                    <div className="control-row">
                      <div className="control-label-group">
                        <span className="control-label">Glass Percentage</span>
                        <span className="control-value">{selectedBuilding.glassPercentage ?? 75}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="95"
                        step="5"
                        value={selectedBuilding.glassPercentage ?? 75}
                        onChange={(e) =>
                          onUpdateBuilding(selectedBuilding.id, {
                            glassPercentage: parseInt(e.target.value),
                          })
                        }
                        className="slider-input"
                      />
                    </div>

                    {/* Shadow Toggle & Wireframe Toggle */}
                    <div className="toggles-grid-row">
                      <div className="toggle-box">
                        <span className="toggle-box-label">Cast Shadow</span>
                        <button
                          type="button"
                          className={`toggle-state-btn ${selectedBuilding.shadow !== false ? "on" : "off"}`}
                          onClick={() =>
                            onUpdateBuilding(selectedBuilding.id, {
                              shadow: selectedBuilding.shadow === false ? true : false,
                            })
                          }
                        >
                          {selectedBuilding.shadow !== false ? "✓ Enabled" : "✕ Disabled"}
                        </button>
                      </div>

                      <div className="toggle-box">
                        <span className="toggle-box-label">Wireframe Mode</span>
                        <button
                          type="button"
                          className={`toggle-state-btn ${selectedBuilding.wireframe ? "on" : "off"}`}
                          onClick={() =>
                            onUpdateBuilding(selectedBuilding.id, {
                              wireframe: !selectedBuilding.wireframe,
                            })
                          }
                        >
                          {selectedBuilding.wireframe ? "✓ Blueprint" : "✕ Solid"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-msg">
                  Click on any structure above or on the 3D map to open its full Properties Panel.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEDICATED PROPOSED LAYER STYLING */}
          {activeTab === "proposed" && (
            <div className="dock-panel">
              <div className="section-label">Proposed Layer Architectural Styling</div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 14 }}>
                Control the visual manifestation of upcoming structures superimposed onto the Bengaluru environment.
              </p>

              {/* 1. Proposed Architectural Render Modes */}
              <div className="transform-section-box">
                <div className="transform-section-title">
                  <Sparkles size={14} style={{ color: "var(--accent-gold)" }} />
                  <span>Proposed Layer Render Mode</span>
                </div>
                <div className="proposed-mode-grid">
                  {[
                    {
                      id: "realistic",
                      label: "Realistic PBR",
                      desc: "True architectural textures, solar contact shadows, ambient lighting",
                      icon: Building2,
                    },
                    {
                      id: "transparent",
                      label: "Transparent Mode",
                      desc: "Adjustable alpha to inspect terrain and ground footprint alignment",
                      icon: Eye,
                    },
                    {
                      id: "wireframe",
                      label: "Wireframe / CAD",
                      desc: "High-contrast cyan architectural blueprint massing outlines",
                      icon: Grid,
                    },
                    {
                      id: "ghost",
                      label: "Ghost Mode",
                      desc: "Luminescent holographic massing study for urban planning reviews",
                      icon: Ghost,
                    },
                  ].map((mode) => {
                    const ModeIcon = mode.icon;
                    const isSelected = proposedRenderMode === mode.id;
                    return (
                      <div
                        key={mode.id}
                        className={`render-mode-card ${isSelected ? "active" : ""}`}
                        onClick={() =>
                          onChangeProposedRenderMode &&
                          onChangeProposedRenderMode(mode.id)
                        }
                      >
                        <div className="render-mode-header">
                          <ModeIcon
                            size={16}
                            style={{
                              color: isSelected
                                ? "var(--accent-gold)"
                                : "var(--text-secondary)",
                            }}
                          />
                          <strong>{mode.label}</strong>
                        </div>
                        <span className="render-mode-desc">{mode.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Superimpose Transparency & Opacity */}
              <div className="transform-section-box">
                <div className="transform-section-title">
                  <Eye size={14} style={{ color: "var(--accent-gold)" }} />
                  <span>Proposed Layer Transparency & Opacity</span>
                </div>
                <div className="control-row">
                  <div className="control-label-group">
                    <span className="control-label">Superimpose Opacity</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        step="5"
                        value={Math.round(proposedOpacity * 100)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 50;
                          onChangeProposedOpacity &&
                            onChangeProposedOpacity(
                              Math.min(1.0, Math.max(0.1, val / 100))
                            );
                        }}
                        className="numeric-inline-field"
                      />
                      <span className="control-value">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={proposedOpacity}
                    onChange={(e) =>
                      onChangeProposedOpacity &&
                      onChangeProposedOpacity(parseFloat(e.target.value))
                    }
                    className="slider-input"
                  />
                </div>
              </div>

              {/* 3. Existing Context Environment Toggle */}
              <div className="transform-section-box">
                <div className="transform-section-title">
                  <Building size={14} style={{ color: "var(--accent-gold)" }} />
                  <span>Existing Environment Context</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong
                      style={{ fontSize: 13, color: "#fff", display: "block" }}
                    >
                      Existing Surrounding Buildings
                    </strong>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Display 3D context blocks around parcel for height contrast
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`action-btn-secondary ${
                      existingBuildingsEnabled ? "active" : ""
                    }`}
                    onClick={onToggleExistingBuildings}
                    style={{ padding: "6px 14px", fontSize: 11 }}
                  >
                    {existingBuildingsEnabled
                      ? "Context Visible"
                      : "Context Hidden"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIME BENGALURU SITES & BOUNDARY EDITOR */}
          {activeTab === "sites" && (
            <div className="dock-panel">
              {/* Interactive Boundary Editing Mode Banner */}
              {activeSite && (
                <div
                  className="transform-section-box"
                  style={{ borderColor: "var(--accent-gold)" }}
                >
                  <div className="transform-section-title">
                    <PenTool size={14} style={{ color: "var(--accent-gold)" }} />
                    <span>Interactive Boundary Editor</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 12, color: "#fff" }}>
                        {isEditingBoundary ? "Boundary Editing Active" : "Map Edit Mode"}
                      </strong>
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          display: "block",
                        }}
                      >
                        {isEditingBoundary
                          ? "Drag corner pegs directly on the 3D map"
                          : "Activate corner peg dragging on terrain"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`action-btn-secondary ${
                        isEditingBoundary ? "active" : ""
                      }`}
                      onClick={onToggleEditBoundary}
                      style={{ padding: "6px 12px", fontSize: 11 }}
                    >
                      {isEditingBoundary ? "Lock Boundary" : "Edit on Map"}
                    </button>
                  </div>

                  {/* Draw Custom Parcel Button */}
                  {onStartDrawBoundary && (
                    <button
                      type="button"
                      className="action-btn-secondary"
                      onClick={onStartDrawBoundary}
                      style={{ width: "100%", marginTop: 6, fontSize: 11 }}
                    >
                      <Plus size={13} style={{ marginRight: 4 }} />
                      Draw Custom Site Parcel on Map
                    </button>
                  )}
                </div>
              )}

              <div className="section-label" style={{ marginTop: 14 }}>
                Prime Bengaluru Development Sites
              </div>
              <div className="sites-list">
                {REAL_ESTATE_SITES.map((site) => (
                  <div
                    key={site.id}
                    className={`site-card ${
                      activeSite?.id === site.id ? "active" : ""
                    }`}
                    onClick={() => onSelectSite(site)}
                  >
                    <div className="site-card-header">
                      <div className="site-title-box">
                        <span className="site-badge">{site.authority}</span>
                        <h4>{site.name}</h4>
                      </div>
                      <span className="site-acreage">{site.acres} Acres</span>
                    </div>
                    <p className="site-desc">{site.description}</p>
                    <div className="site-stats-row">
                      <div>
                        <span className="stat-label">Permissible FAR</span>
                        <span className="stat-val">{site.permissibleFAR}</span>
                      </div>
                      <div>
                        <span className="stat-label">Zoning</span>
                        <span className="stat-val">{site.zoning.split(" ")[0]}</span>
                      </div>
                      <div>
                        <span className="stat-label">Site Area</span>
                        <span className="stat-val">
                          {(site.areaSqFt / 43560).toFixed(1)} Ac
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cadastral Boundary Vertex & Corner Controls */}
              {activeSite && activeSite.boundary && (
                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div className="section-label" style={{ margin: 0 }}>
                      Cadastral Boundary Vertices ({activeSite.boundary.length} Pegs)
                    </div>
                    {onAddSiteVertex && (
                      <button
                        type="button"
                        className="action-btn-secondary"
                        onClick={onAddSiteVertex}
                        style={{ padding: "4px 8px", fontSize: 10 }}
                        title="Add a new corner vertex peg to the site boundary"
                      >
                        <Plus size={11} /> + Add Corner
                      </button>
                    )}
                  </div>

                  {/* Live Area Readout */}
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: 8,
                      marginBottom: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>
                      Calculated Parcel Area:
                    </span>
                    <strong style={{ color: "var(--accent-gold)" }}>
                      {(
                        calculatePolygonAreaSqFt(activeSite.boundary) / 43560
                      ).toFixed(2)}{" "}
                      Acres (
                      {calculatePolygonAreaSqFt(
                        activeSite.boundary
                      ).toLocaleString()}{" "}
                      sq.ft)
                    </strong>
                  </div>

                  <div className="vertex-controls-list">
                    {activeSite.boundary.map((peg, idx) => (
                      <div key={idx} className="vertex-item-card">
                        <div className="vertex-header">
                          <span className="vertex-badge">Peg #{idx + 1}</span>
                          <span className="vertex-coords">
                            {peg.lat.toFixed(4)}°N, {peg.lng.toFixed(4)}°E
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {onDeleteSiteVertex &&
                            activeSite.boundary.length > 3 && (
                              <button
                                type="button"
                                onClick={() => onDeleteSiteVertex(idx)}
                                title="Remove this corner peg"
                                style={{
                                  background: "rgba(239, 68, 68, 0.15)",
                                  border: "1px solid rgba(239, 68, 68, 0.3)",
                                  color: "#fca5a5",
                                  borderRadius: 4,
                                  width: 20,
                                  height: 20,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  fontSize: 11,
                                }}
                              >
                                ✕
                              </button>
                            )}
                          {onNudgeSiteVertex && (
                            <div className="vertex-nudge-mini">
                              <button
                                onClick={() =>
                                  onNudgeSiteVertex(idx, 0.0001, 0)
                                }
                                title="North (+10m)"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() =>
                                  onNudgeSiteVertex(idx, -0.0001, 0)
                                }
                                title="South (-10m)"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() =>
                                  onNudgeSiteVertex(idx, 0, -0.0001)
                                }
                                title="West (-10m)"
                              >
                                ←
                              </button>
                              <button
                                onClick={() =>
                                  onNudgeSiteVertex(idx, 0, 0.0001)
                                }
                                title="East (+10m)"
                              >
                                →
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REAL-TIME URBAN PLANNING KPIS */}
          {activeTab === "kpis" && (
            <div className="dock-panel">
              <div className="section-label">Development Feasibility & Yield</div>

              <div className="kpis-grid">
                <div className="kpi-card highlight">
                  <div className="kpi-label">Gross Development Value (GDV)</div>
                  <div className="kpi-value gold">₹ {estimatedGDVCrores.toLocaleString()} Cr</div>
                  <div className="kpi-sub">Estimated blended ₹10.5k / sq.ft</div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-label">Total Built-Up Area (BUA)</div>
                  <div className="kpi-value">{totalBUASqFt.toLocaleString()} sq.ft</div>
                  <div className="kpi-sub">{(totalBUASqFt / 10.764).toFixed(0)} sq.meters</div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-label">Achieved FAR / Permissible</div>
                  <div className={`kpi-value ${achievedFAR > permissibleFAR ? "red" : "green"}`}>
                    {achievedFAR} / {permissibleFAR}
                  </div>
                  <div className="kpi-sub">
                    {achievedFAR <= permissibleFAR ? (
                      <span style={{ color: "var(--accent-emerald)" }}>
                        <CheckCircle2 size={12} style={{ display: "inline", marginRight: 4 }} />
                        Within Compliance Limit
                      </span>
                    ) : (
                      <span style={{ color: "var(--accent-red)" }}>
                        <AlertCircle size={12} style={{ display: "inline", marginRight: 4 }} />
                        Exceeds Permissible FAR
                      </span>
                    )}
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-label">Ground Coverage</div>
                  <div className="kpi-value">{groundCoveragePct}%</div>
                  <div className="kpi-sub">{totalFootprintSqFt.toLocaleString()} sq.ft footprint</div>
                </div>

                <div className="kpi-card full-width">
                  <div className="kpi-label">Active Masterplan Configuration</div>
                  <div className="kpi-sub" style={{ marginTop: 6, lineHeight: 1.6 }}>
                    <strong>Site:</strong> {activeSite?.name} ({activeSite?.acres} Acres)<br />
                    <strong>Authority:</strong> {activeSite?.authority} • <strong>Zoning:</strong> {activeSite?.zoning}<br />
                    <strong>Total Buildings Placed:</strong> {placedBuildings.length} structures
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
