"use client";

import { useState } from "react";
import {
  Layers,
  Sun,
  RotateCw,
  Eye,
  Footprints,
  Compass,
  Building,
  Building2,
  Sparkles,
  Sliders,
  Maximize2,
  PenTool,
  Boxes,
  Ghost,
  Grid,
} from "lucide-react";

export default function DevelopmentComparisonBar({
  proposedBlend = 100, // 0 to 100 (0 = Existing, 50 = Superimpose, 100 = Proposed)
  onChangeProposedBlend,
  proposedRenderMode = "realistic", // 'realistic' | 'transparent' | 'wireframe' | 'ghost'
  onChangeProposedRenderMode,
  existingBuildingsEnabled = true,
  onToggleExistingBuildings,
  isEditingBoundary = false,
  onToggleEditBoundary,
  solarHour,
  onChangeSolarHour,
  isOrbiting,
  onToggleOrbit,
  isWalking,
  onToggleWalk,
  onOrthoView,
  activeSite,
}) {
  const [showSolarSlider, setShowSolarSlider] = useState(false);

  // Format solar hour to 12h clock
  const formatSolarTime = (h) => {
    const hours = Math.floor(h);
    const minutes = Math.round((h - hours) * 60);
    const minStr = minutes < 10 ? `0${minutes}` : minutes;
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHour}:${minStr} ${ampm}`;
  };

  // Get human-readable blend status label
  const getBlendLabel = (val) => {
    if (val <= 5) return "Existing Site (Baseline)";
    if (val >= 95) return "Proposed 3D Development";
    return `Superimpose Blend (${val}%)`;
  };

  return (
    <div className="dev-comparison-bar-container">
      {/* Main Floating Comparison Pill */}
      <div className="dev-comparison-pill">
        {/* Continuous EXISTING <---> PROPOSED Slider */}
        <div className="comparison-slider-group">
          <button
            type="button"
            className={`slider-anchor-btn ${proposedBlend <= 10 ? "active" : ""}`}
            onClick={() => onChangeProposedBlend && onChangeProposedBlend(0)}
            title="Snap to Existing Baseline Site (0%)"
          >
            <Layers size={13} />
            <span>EXISTING</span>
          </button>

          <div className="comparison-slider-track-wrap">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={proposedBlend}
              onChange={(e) =>
                onChangeProposedBlend &&
                onChangeProposedBlend(parseFloat(e.target.value))
              }
              className="comparison-blend-range"
              title={`Compare: ${getBlendLabel(proposedBlend)}`}
            />
            <div
              className="slider-fill-indicator"
              style={{ width: `${proposedBlend}%` }}
            />
          </div>

          <button
            type="button"
            className={`slider-anchor-btn ${proposedBlend >= 90 ? "active" : ""}`}
            onClick={() => onChangeProposedBlend && onChangeProposedBlend(100)}
            title="Snap to Proposed 3D Development (100%)"
          >
            <Sparkles size={13} style={{ color: "var(--accent-gold)" }} />
            <span>PROPOSED</span>
          </button>

          <span className="comparison-blend-badge">
            {proposedBlend === 0
              ? "Existing"
              : proposedBlend === 100
              ? "Proposed"
              : `${proposedBlend}%`}
          </span>
        </div>

        <div className="pill-divider" />

        {/* Proposed Layer Rendering Modes Quick-Pills */}
        <div className="proposed-modes-group">
          {[
            { id: "realistic", label: "Realistic", icon: Building2 },
            { id: "transparent", label: "Transparent", icon: Eye },
            { id: "wireframe", label: "Wireframe", icon: Grid },
            { id: "ghost", label: "Ghost", icon: Ghost },
          ].map((mode) => {
            const IconComponent = mode.icon;
            const isActive = proposedRenderMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                className={`mode-pill-btn ${isActive ? "active" : ""}`}
                onClick={() =>
                  onChangeProposedRenderMode && onChangeProposedRenderMode(mode.id)
                }
                title={`Proposed Layer Mode: ${mode.label}`}
              >
                <IconComponent size={13} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pill-divider" />

        {/* Layer Quick Toggles: Existing Buildings & Edit Boundary */}
        <div className="pill-actions-group">
          {/* Toggle Existing Context Buildings */}
          <button
            type="button"
            className={`pill-icon-btn ${existingBuildingsEnabled ? "active" : ""}`}
            onClick={onToggleExistingBuildings}
            title={
              existingBuildingsEnabled
                ? "Existing Surroundings: Visible (Click to Hide)"
                : "Existing Surroundings: Hidden (Click to Show)"
            }
          >
            <Building size={14} />
            <span className="pill-btn-label">
              {existingBuildingsEnabled ? "Context ON" : "Context OFF"}
            </span>
          </button>

          {/* Edit Boundary Mode */}
          <button
            type="button"
            className={`pill-icon-btn ${isEditingBoundary ? "active highlight-gold" : ""}`}
            onClick={onToggleEditBoundary}
            title={
              isEditingBoundary
                ? "Exit Site Boundary Editor"
                : "Edit Parcel Boundary (Drag corner pegs)"
            }
          >
            <PenTool size={14} style={{ color: isEditingBoundary ? "var(--accent-gold)" : "inherit" }} />
            <span className="pill-btn-label">
              {isEditingBoundary ? "Editing Site" : "Edit Site"}
            </span>
          </button>
        </div>

        <div className="pill-divider" />

        {/* Camera Perspectives & Solar Simulation */}
        <div className="pill-actions-group">
          {/* 360 Drone Orbit */}
          <button
            type="button"
            className={`pill-icon-btn ${isOrbiting ? "active" : ""}`}
            onClick={onToggleOrbit}
            title={isOrbiting ? "Stop 360° Drone Orbit" : "360° Drone Orbit Camera"}
          >
            <RotateCw size={14} className={isOrbiting ? "animate-spin" : ""} />
            <span className="pill-btn-label">360° Orbit</span>
          </button>

          {/* Pedestrian Walk */}
          <button
            type="button"
            className={`pill-icon-btn ${isWalking ? "active" : ""}`}
            onClick={onToggleWalk}
            title={isWalking ? "Exit Walk Mode (WASD)" : "Pedestrian Eye-Level Walk (1.7m)"}
          >
            <Footprints size={14} />
            <span className="pill-btn-label">{isWalking ? "Exit Walk" : "Walk View"}</span>
          </button>

          {/* Top-Down Orthographic Masterplan */}
          <button
            type="button"
            className="pill-icon-btn"
            onClick={onOrthoView}
            title="Top-Down 90° Masterplan Ortho View"
          >
            <Maximize2 size={14} />
            <span className="pill-btn-label">Masterplan</span>
          </button>

          {/* Solar Shadow Study Button */}
          <button
            type="button"
            className={`pill-icon-btn ${showSolarSlider ? "active" : ""}`}
            onClick={() => setShowSolarSlider(!showSolarSlider)}
            title="Simulate Real-time Solar Angle & Building Shadows"
          >
            <Sun size={14} style={{ color: "var(--accent-gold)" }} />
            <span className="pill-btn-label">{formatSolarTime(solarHour)}</span>
          </button>
        </div>
      </div>

      {/* Expandable Solar Shadow Simulation Slider */}
      {showSolarSlider && (
        <div className="solar-slider-card">
          <div className="solar-header">
            <div className="solar-title">
              <Sun size={16} style={{ color: "var(--accent-gold)" }} />
              <span>Solar Exposure & Shadow Cast</span>
            </div>
            <span className="solar-time-badge">{formatSolarTime(solarHour)}</span>
          </div>

          <input
            type="range"
            min="6"
            max="18.5"
            step="0.25"
            value={solarHour}
            onChange={(e) => onChangeSolarHour(parseFloat(e.target.value))}
            className="solar-range-input"
          />

          <div className="solar-time-ticks">
            <span>06:00 Sunrise</span>
            <span>12:00 Noon</span>
            <span>18:30 Sunset</span>
          </div>
        </div>
      )}
    </div>
  );
}
