"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2, Navigation } from "lucide-react";

export default function SearchBox({ onSelectLocation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query strictly bounded to Bengaluru
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setOpenDropdown(false);
      return;
    }

    // Check if query is coordinates format (e.g. 12.9716, 77.5946)
    const coordMatch = query.match(/^([-+]?\d+(\.\d+)?)[,\s]+([-+]?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      setResults([
        {
          place_id: "coord-custom",
          display_name: `Bengaluru Point: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
          lat: lat.toString(),
          lon: lng.toString(),
          type: "coordinate",
        },
      ]);
      setOpenDropdown(true);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Query bounded strictly to Bangalore bounding box: minLon 77.30, maxLat 13.25, maxLon 77.85, minLat 12.75
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query + " Bengaluru Karnataka"
          )}&viewbox=77.30,13.25,77.85,12.75&bounded=1&limit=6&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en,kn",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          // Filter results to ensure they stay in greater Bangalore area
          const bangaloreResults = data.filter((item) => {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            return lat >= 12.70 && lat <= 13.35 && lon >= 77.25 && lon <= 77.95;
          });
          setResults(bangaloreResults.length > 0 ? bangaloreResults : data);
          setOpenDropdown(true);
        }
      } catch (err) {
        console.error("Bengaluru search error:", err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const name = item.display_name.split(",")[0];
    const fullName = item.display_name;

    onSelectLocation({
      name,
      fullName,
      latitude: lat,
      longitude: lng,
      type: item.type || "Bengaluru Locality",
    });

    setOpenDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0) {
        handleSelect(results[0]);
      }
    }
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-bar">
        <Search size={18} />
        <input
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpenDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search Bengaluru locality, metro, tech park..."
        />
        {loading && (
          <Loader2
            size={16}
            className="animate-spin"
            style={{ color: "var(--accent-gold)", marginRight: 8 }}
          />
        )}
        {query && !loading && (
          <button
            className="clear-btn"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpenDropdown(false);
            }}
          >
            <X size={15} />
          </button>
        )}
        <button
          className="search-action-btn"
          onClick={() => {
            if (results.length > 0) {
              handleSelect(results[0]);
            }
          }}
        >
          <Navigation size={13} />
          Fly
        </button>
      </div>

      {openDropdown && (
        <div className="search-dropdown">
          {results.map((item) => (
            <div
              key={item.place_id}
              className="suggestion-item"
              onClick={() => handleSelect(item)}
            >
              <MapPin size={16} className="suggestion-icon" />
              <div className="suggestion-content">
                <div className="suggestion-title">
                  {item.display_name.split(",")[0]}
                </div>
                <div className="suggestion-subtitle">
                  {item.display_name.split(",").slice(1, 4).join(",")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
