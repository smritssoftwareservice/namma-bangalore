"use client";

import { useEffect, useState } from "react";
import { X, Navigation, RotateCw, Bookmark, Copy, Check } from "lucide-react";

export default function PropertyCard({
  info,
  onClose,
  onFlyTo,
  onToggleOrbit,
  isOrbiting,
  onSaveBookmark,
  isBookmarked,
}) {
  const [wikiData, setWikiData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!info) return;

    setWikiData(null);

    // Try fetching summary from Wikipedia API for the landmark
    const cleanSearch = (info.name || "")
      .replace(/\(.*?\)/g, "")
      .trim();

    if (cleanSearch) {
      fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          cleanSearch
        )}`
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.extract) {
            setWikiData({
              extract: data.extract,
              thumbnail: data.thumbnail?.source || null,
            });
          }
        })
        .catch(() => {});
    }
  }, [info]);

  if (!info) return null;

  const handleCopyCoords = () => {
    const coordStr = `${info.latitude.toFixed(5)}, ${info.longitude.toFixed(5)}`;
    navigator.clipboard.writeText(coordStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="property-modal">
      <div className="property-header">
        <div className="property-title-group">
          <span className="property-badge">{info.type || "Bengaluru Spot"}</span>
          <h2 className="property-title">{info.name || "Target Location"}</h2>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      {wikiData?.thumbnail && (
        <img
          src={wikiData.thumbnail}
          alt={info.name}
          className="property-img"
        />
      )}

      <p className="property-description">
        {wikiData?.extract ||
          info.description ||
          info.fullName ||
          "Explore this landmark in 3D photorealistic perspective."}
      </p>

      <div className="property-details-grid">
        <div>
          <div className="grid-stat-label">Latitude</div>
          <div className="grid-stat-val">{info.latitude.toFixed(5)}° N</div>
        </div>
        <div>
          <div className="grid-stat-label">Longitude</div>
          <div className="grid-stat-val">{info.longitude.toFixed(5)}° E</div>
        </div>
        <div>
          <div className="grid-stat-label">Altitude</div>
          <div className="grid-stat-val">
            {info.altitude ? `${Math.round(info.altitude)}m ASL` : "920m (BLR Plateau)"}
          </div>
        </div>
        <div>
          <div className="grid-stat-label">Drone Orbit</div>
          <div className="grid-stat-val" style={{ color: "var(--accent-gold)" }}>
            {isOrbiting ? "Orbiting (360°)" : "Ready"}
          </div>
        </div>
      </div>

      <div className="property-actions">
        <button
          className="action-btn-primary"
          onClick={() => onFlyTo(info.latitude, info.longitude, 700)}
        >
          <Navigation size={15} />
          Fly To
        </button>

        <button
          className={`action-btn-secondary ${isOrbiting ? "active" : ""}`}
          onClick={() => onToggleOrbit(info.latitude, info.longitude)}
          title="360° Drone Orbit View"
        >
          <RotateCw size={15} className={isOrbiting ? "animate-spin" : ""} />
          {isOrbiting ? "Stop" : "360° Orbit"}
        </button>

        <button
          className="action-btn-secondary"
          onClick={() => onSaveBookmark(info)}
          title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
          style={{ color: isBookmarked ? "var(--accent-gold)" : "inherit" }}
        >
          <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
        </button>

        <button
          className="action-btn-secondary"
          onClick={handleCopyCoords}
          title="Copy Coordinates"
        >
          {copied ? <Check size={15} style={{ color: "var(--accent-emerald)" }} /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  );
}
