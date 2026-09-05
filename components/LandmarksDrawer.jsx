"use client";

import { useState } from "react";
import { X, Trash2, Compass, Sparkles, MapPin, Building2, Landmark, Trees, ShoppingBag, Plane } from "lucide-react";

export const BANGALORE_LANDMARKS = [
  {
    id: "vidhana-soudha",
    name: "Vidhana Soudha (ವಿಧಾನ ಸೌಧ)",
    category: "heritage",
    location: "Sampangi Rama Nagara, Bengaluru",
    latitude: 12.9796,
    longitude: 77.5907,
    height: 600,
    pitch: -35,
    heading: 0,
    thumb: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=150&auto=format&fit=crop&q=80",
    description: "The grand seat of Karnataka's state legislature, constructed in Neo-Dravidian architectural style.",
  },
  {
    id: "ub-city",
    name: "UB City & Vittal Mallya Road",
    category: "commercial",
    location: "CBD, Bengaluru",
    latitude: 12.9719,
    longitude: 77.5958,
    height: 700,
    pitch: -40,
    heading: 45,
    thumb: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80",
    description: "Bangalore's signature commercial skyscraper complex with luxury dining, high-end retail, and corporate offices.",
  },
  {
    id: "bangalore-palace",
    name: "Bangalore Palace (ಬೆಂಗಳೂರು ಅರಮನೆ)",
    category: "heritage",
    location: "Vasanth Nagar, Bengaluru",
    latitude: 12.9988,
    longitude: 77.5921,
    height: 650,
    pitch: -35,
    heading: 150,
    thumb: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=150&auto=format&fit=crop&q=80",
    description: "19th-century royal palace built by the Wadiyar dynasty featuring Tudor-style architecture with fortified towers.",
  },
  {
    id: "lalbagh",
    name: "Lalbagh Glass House (ಲಾಲ್ ಬಾಗ್)",
    category: "nature",
    location: "Mavalli, South Bengaluru",
    latitude: 12.9507,
    longitude: 77.5848,
    height: 800,
    pitch: -35,
    heading: 30,
    thumb: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=150&auto=format&fit=crop&q=80",
    description: "240-acre botanical haven established by Hyder Ali, home to the iconic Crystal Palace-inspired Glass House.",
  },
  {
    id: "cubbon-park",
    name: "Cubbon Park & Stadium",
    category: "nature",
    location: "Kasturba Road, Bengaluru",
    latitude: 12.9750,
    longitude: 77.5929,
    height: 800,
    pitch: -40,
    heading: 90,
    thumb: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=150&auto=format&fit=crop&q=80",
    description: "Sprawling 300-acre historic park adjoining the Karnataka High Court and M. Chinnaswamy Cricket Stadium.",
  },
  {
    id: "electronic-city",
    name: "Electronic City (Infosys & Wipro)",
    category: "tech",
    location: "Anekal Taluk, South Bengaluru",
    latitude: 12.8452,
    longitude: 77.6602,
    height: 1200,
    pitch: -35,
    heading: 180,
    thumb: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&auto=format&fit=crop&q=80",
    description: "Premier information technology park spread over 800 acres, hosting world tech giants and connected by the elevated expressway.",
  },
  {
    id: "itpl-whitefield",
    name: "ITPL (International Tech Park)",
    category: "tech",
    location: "Whitefield, East Bengaluru",
    latitude: 12.9863,
    longitude: 77.7377,
    height: 1000,
    pitch: -35,
    heading: 60,
    thumb: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=80",
    description: "Pioneer tech park in India, the catalyst of Whitefield's transformation into a major global software and engineering hub.",
  },
  {
    id: "manyata-tech-park",
    name: "Manyata Embassy Tech Park",
    category: "tech",
    location: "Nagawara / Hebbal, Bengaluru",
    latitude: 13.0487,
    longitude: 77.6200,
    height: 1200,
    pitch: -35,
    heading: 45,
    thumb: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80",
    description: "One of largest operational tech parks in India along the Outer Ring Road with hundreds of multinational tech corporations.",
  },
  {
    id: "koramangala",
    name: "Koramangala Startup Hub",
    category: "commercial",
    location: "South-East Bengaluru",
    latitude: 12.9352,
    longitude: 77.6245,
    height: 900,
    pitch: -45,
    heading: 0,
    thumb: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&auto=format&fit=crop&q=80",
    description: "Birthplace of India's startup unicorns (Flipkart, Swiggy, Ola) famed for its cafe culture and tech community.",
  },
  {
    id: "indiranagar",
    name: "Indiranagar 100ft Road",
    category: "commercial",
    location: "East Bengaluru",
    latitude: 12.9719,
    longitude: 77.6412,
    height: 900,
    pitch: -40,
    heading: 90,
    thumb: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
    description: "Bengaluru's trendsetting boulevard for dining, fashion, brewpubs, and modern lifestyle.",
  },
  {
    id: "blr-airport",
    name: "Kempegowda Airport (BLR T2)",
    category: "transit",
    location: "Devanahalli, North Bengaluru",
    latitude: 13.1986,
    longitude: 77.7066,
    height: 1800,
    pitch: -30,
    heading: 270,
    thumb: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=150&auto=format&fit=crop&q=80",
    description: "World's best new airport terminal designed as a 'Terminal in a Garden', incorporating indigenous flora and bamboo architecture.",
  },
  {
    id: "nandi-hills",
    name: "Nandi Hills (ನಂದಿ ಬೆಟ್ಟ)",
    category: "nature",
    location: "Chikkaballapur / North Bengaluru",
    latitude: 13.3702,
    longitude: 77.6835,
    height: 2500,
    pitch: -25,
    heading: 120,
    thumb: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=150&auto=format&fit=crop&q=80",
    description: "Scenic 1,478-meter high ancient hill fortress offering spectacular sunrise cloud views over the Bangalore plateau.",
  },
];

export default function LandmarksDrawer({
  isOpen,
  onClose,
  onFlyToLandmark,
  bookmarks,
  onDeleteBookmark,
}) {
  const [activeCategory, setActiveCategory] = useState("all");

  if (!isOpen) return null;

  const filteredLandmarks =
    activeCategory === "all"
      ? BANGALORE_LANDMARKS
      : BANGALORE_LANDMARKS.filter((l) => l.category === activeCategory);

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="bookmarks-drawer">
        <div className="drawer-header">
          <h2>
            <Compass size={20} style={{ color: "var(--accent-gold)" }} />
            Bengaluru Landmarks
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-content">
          {/* Category Filter Tabs */}
          <div className="category-tabs">
            <button
              className={`category-tab-btn ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              All Hubs
            </button>
            <button
              className={`category-tab-btn ${activeCategory === "heritage" ? "active" : ""}`}
              onClick={() => setActiveCategory("heritage")}
            >
              <Landmark size={12} style={{ display: "inline", marginRight: 4 }} />
              Heritage
            </button>
            <button
              className={`category-tab-btn ${activeCategory === "tech" ? "active" : ""}`}
              onClick={() => setActiveCategory("tech")}
            >
              <Building2 size={12} style={{ display: "inline", marginRight: 4 }} />
              Tech Parks
            </button>
            <button
              className={`category-tab-btn ${activeCategory === "nature" ? "active" : ""}`}
              onClick={() => setActiveCategory("nature")}
            >
              <Trees size={12} style={{ display: "inline", marginRight: 4 }} />
              Parks
            </button>
            <button
              className={`category-tab-btn ${activeCategory === "commercial" ? "active" : ""}`}
              onClick={() => setActiveCategory("commercial")}
            >
              <ShoppingBag size={12} style={{ display: "inline", marginRight: 4 }} />
              Lifestyle
            </button>
            <button
              className={`category-tab-btn ${activeCategory === "transit" ? "active" : ""}`}
              onClick={() => setActiveCategory("transit")}
            >
              <Plane size={12} style={{ display: "inline", marginRight: 4 }} />
              Transit
            </button>
          </div>

          {/* User Saved Bookmarks */}
          {bookmarks && bookmarks.length > 0 && (
            <div>
              <div className="drawer-section-title">⭐ Your Saved Places ({bookmarks.length})</div>
              {bookmarks.map((bm, index) => (
                <div
                  key={index}
                  className="landmark-card"
                  onClick={() =>
                    onFlyToLandmark({
                      latitude: bm.latitude,
                      longitude: bm.longitude,
                      height: 1000,
                      pitch: -45,
                      heading: 0,
                      name: bm.name,
                      fullName: bm.fullName,
                    })
                  }
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      background: "rgba(245, 158, 11, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-gold)",
                    }}
                  >
                    <MapPin size={22} />
                  </div>
                  <div className="landmark-info">
                    <div className="landmark-name">{bm.name}</div>
                    <div className="landmark-loc">
                      {bm.latitude.toFixed(4)}°N, {bm.longitude.toFixed(4)}°E
                    </div>
                  </div>
                  <button
                    className="close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBookmark(index);
                    }}
                    title="Delete Bookmark"
                  >
                    <Trash2 size={16} style={{ color: "var(--accent-red)" }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bengaluru Curated Hubs */}
          <div>
            <div className="drawer-section-title">
              <Sparkles size={14} style={{ display: "inline", marginRight: 4, color: "var(--accent-gold)" }} />
              Iconic Bengaluru Destinations ({filteredLandmarks.length})
            </div>
            {filteredLandmarks.map((item) => (
              <div
                key={item.id}
                className="landmark-card"
                onClick={() => onFlyToLandmark(item)}
              >
                <img src={item.thumb} alt={item.name} className="landmark-thumb" />
                <div className="landmark-info">
                  <div className="landmark-name">{item.name}</div>
                  <div className="landmark-loc">{item.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
