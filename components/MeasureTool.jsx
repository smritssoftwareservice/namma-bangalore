"use client";

import { Ruler, Trash2, X } from "lucide-react";

export default function MeasureTool({
  isActive,
  points,
  totalDistance,
  onClear,
  onClose,
}) {
  if (!isActive) return null;

  const formattedDistance =
    totalDistance >= 1000
      ? `${(totalDistance / 1000).toFixed(2)} km`
      : `${Math.round(totalDistance)} m`;

  return (
    <div className="measure-hud">
      <Ruler size={24} style={{ color: "var(--accent-gold)" }} />

      <div className="measure-stat">
        <span className="measure-stat-label">Total Distance</span>
        <span className="measure-stat-val">
          {points.length > 1 ? formattedDistance : "0.00 km"}
        </span>
      </div>

      <div
        className="measure-stat"
        style={{ borderLeft: "1px solid var(--border-glass)", paddingLeft: 16 }}
      >
        <span className="measure-stat-label">Points Added</span>
        <span className="measure-stat-val" style={{ color: "var(--text-primary)" }}>
          {points.length} {points.length === 1 ? "point" : "points"}
        </span>
      </div>

      <button className="measure-btn-clear" onClick={onClear} title="Clear measurements">
        <Trash2 size={14} style={{ display: "inline", marginRight: 4 }} />
        Clear
      </button>

      <button className="close-btn" onClick={onClose} title="Exit measure tool">
        <X size={18} />
      </button>
    </div>
  );
}
