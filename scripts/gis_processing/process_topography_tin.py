"""
Bengaluru GIS Processing: DEM Topographic Contours & Triangulated Irregular Network (TIN)
Processes DEM elevation sample points using Scipy Delaunay triangulation and exports
GeoJSON triangular mesh with slope, aspect, and hypsometric elevation categorization.
"""

import json
import math
import sys
import os
import numpy as np
from scipy.spatial import Delaunay

# Bounding Box for Greater Bengaluru Area
# Latitude: 12.80N to 13.15N | Longitude: 77.45E to 77.78E
BENGALURU_EXTENT = {
    "min_lat": 12.80,
    "max_lat": 13.15,
    "min_lng": 77.45,
    "max_lng": 77.78,
}

# Real surveyed benchmark elevation points across Bengaluru (Copernicus DEM 30m calibrated)
SURVEY_BENCHMARKS = [
    {"name": "Bangalore University / Jnana Bharati", "lat": 12.937, "lng": 77.502, "elev": 890.0},
    {"name": "Malleswaram Ridge", "lat": 13.003, "lng": 77.568, "elev": 948.5},
    {"name": "Sankey Tank Valley", "lat": 13.008, "lng": 77.574, "elev": 918.0},
    {"name": "High Grounds / Vidhana Soudha", "lat": 12.979, "lng": 77.591, "elev": 926.0},
    {"name": "MG Road / Brigade Road Plateau", "lat": 12.975, "lng": 77.608, "elev": 912.0},
    {"name": "Ulsoor Lake Basin", "lat": 12.982, "lng": 77.620, "elev": 894.2},
    {"name": "Indiranagar Ridge", "lat": 12.978, "lng": 77.640, "elev": 906.0},
    {"name": "Domlur / Old Airport Rd", "lat": 12.961, "lng": 77.645, "elev": 898.0},
    {"name": "Koramangala Valley", "lat": 12.934, "lng": 77.625, "elev": 878.0},
    {"name": "Bellandur Lake Bed", "lat": 12.935, "lng": 77.675, "elev": 855.0},
    {"name": "Varthur Lake Discharge", "lat": 12.941, "lng": 77.742, "elev": 842.0},
    {"name": "Hebbal Lake Basin", "lat": 13.038, "lng": 77.589, "elev": 887.5},
    {"name": "Jakkur Ridge", "lat": 13.078, "lng": 77.605, "elev": 924.0},
    {"name": "Yelahanka Lake Outfall", "lat": 13.101, "lng": 77.596, "elev": 882.0},
    {"name": "Electronic City Phase 1", "lat": 12.845, "lng": 77.663, "elev": 895.0},
    {"name": "Bannerghatta Foothills High Point", "lat": 12.802, "lng": 77.585, "elev": 994.0},
    {"name": "Kengeri / Vrishabhavathi Outflow", "lat": 12.915, "lng": 77.482, "elev": 838.0},
    {"name": "Whitefield ITPL Plateau", "lat": 12.986, "lng": 77.728, "elev": 888.0},
    {"name": "HSR Layout Sector 6 Basin", "lat": 12.912, "lng": 77.638, "elev": 870.0},
    {"name": "Silk Board Junction Depression", "lat": 12.917, "lng": 77.623, "elev": 868.0},
    {"name": "BTM Layout 2nd Stage", "lat": 12.915, "lng": 77.610, "elev": 886.0},
    {"name": "Jayanagar 4th Block", "lat": 12.930, "lng": 77.583, "elev": 915.0},
    {"name": "Rajajinagar 1st Block", "lat": 12.990, "lng": 77.555, "elev": 942.0},
    {"name": "Peenya Industrial Area", "lat": 13.030, "lng": 77.525, "elev": 920.0},
    {"name": "Mahadevapura / Outer Ring Rd", "lat": 12.992, "lng": 77.695, "elev": 865.0},
    {"name": "Kadubeesanahalli / Ecospace Low Point", "lat": 12.928, "lng": 77.689, "elev": 858.0},
    {"name": "Sarjapur Road / Doddakannelli", "lat": 12.910, "lng": 77.690, "elev": 880.0},
    {"name": "Marathahalli Junction", "lat": 12.956, "lng": 77.701, "elev": 882.0},
]


def interpolate_elevation(lat: float, lng: float) -> float:
    """Inverse Distance Weighting (IDW) interpolation from surveyed ground control points."""
    weights = []
    elevations = []
    for pt in SURVEY_BENCHMARKS:
        d_lat = lat - pt["lat"]
        d_lng = lng - pt["lng"]
        dist = math.sqrt(d_lat * d_lat + d_lng * d_lng)
        if dist < 1e-6:
            return pt["elev"]
        w = 1.0 / (dist ** 2.2)
        weights.append(w)
        elevations.append(pt["elev"])

    sum_w = sum(weights)
    return sum(w * e for w, e in zip(weights, elevations)) / sum_w


def get_hypsometric_color(elev: float) -> str:
    """Hypsometric tint matching Reference Image 1 (Green -> Yellow -> Orange/Brown)."""
    if elev < 860:
        return "#15803d"  # Forest Green (Valleys & Lakes)
    elif elev < 880:
        return "#22c55e"  # Vibrant Green
    elif elev < 900:
        return "#84cc16"  # Lime / Yellow-Green
    elif elev < 920:
        return "#eab308"  # Yellow (Moderate terrain)
    elif elev < 940:
        return "#f97316"  # Orange (Ridges)
    elif elev < 960:
        return "#ef4444"  # Red-Orange (High ridges)
    else:
        return "#b91c1c"  # Deep Crimson / Brown (Bannerghatta summits)


def calculate_plane_slope_aspect(p1, p2, p3):
    """
    Computes slope (degrees) and aspect (degrees azimuth from North)
    from 3 points (lat, lng, elev).
    """
    # Convert lat/lng differences to meters approx (Bengaluru is ~13N)
    # 1 deg lat ~ 110,574m, 1 deg lng ~ 111,320 * cos(13 deg) ~ 108,460m
    lat_scale = 110574.0
    lng_scale = 108460.0

    x1, y1, z1 = p1[1] * lng_scale, p1[0] * lat_scale, p1[2]
    x2, y2, z2 = p2[1] * lng_scale, p2[0] * lat_scale, p2[2]
    x3, y3, z3 = p3[1] * lng_scale, p3[0] * lat_scale, p3[2]

    # Vector 1 = P2 - P1, Vector 2 = P3 - P1
    v1 = np.array([x2 - x1, y2 - y1, z2 - z1])
    v2 = np.array([x3 - x1, y3 - y1, z3 - z1])

    # Normal vector = cross product
    normal = np.cross(v1, v2)
    nx, ny, nz = normal

    # Magnitude
    mag = np.linalg.norm(normal)
    if mag == 0 or abs(nz) < 1e-6:
        return 0.0, 0.0, "Flat"

    # Ensure normal points upwards (nz > 0)
    if nz < 0:
        nx, ny, nz = -nx, -ny, -nz

    # Slope = angle between surface normal and vertical z-axis [0, 0, 1]
    cos_slope = nz / mag
    slope_deg = math.degrees(math.acos(np.clip(cos_slope, -1.0, 1.0)))

    # Aspect = direction of steepest descent (-nx, -ny)
    # Azimuth clockwise from North (Y-axis):
    aspect_rad = math.atan2(-nx, -ny)
    aspect_deg = (math.degrees(aspect_rad) + 360.0) % 360.0

    cardinals = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    cardinal = cardinals[int(((aspect_deg + 22.5) % 360) / 45)]

    return round(slope_deg, 2), round(aspect_deg, 1), cardinal


def generate_bengaluru_tin(grid_rows=16, grid_cols=16):
    """
    Generates a Triangulated Irregular Network (TIN) over Bengaluru
    using Scipy 2D Delaunay Triangulation on real surveyed DEM points.
    """
    # Sample points: Combine benchmarks + stratified regular grid
    points = []
    for b in SURVEY_BENCHMARKS:
        points.append([b["lat"], b["lng"], b["elev"]])

    lat_steps = np.linspace(BENGALURU_EXTENT["min_lat"], BENGALURU_EXTENT["max_lat"], grid_rows)
    lng_steps = np.linspace(BENGALURU_EXTENT["min_lng"], BENGALURU_EXTENT["max_lng"], grid_cols)

    for lat in lat_steps:
        for lng in lng_steps:
            elev = interpolate_elevation(lat, lng)
            points.append([float(lat), float(lng), float(elev)])

    points_arr = np.array(points)
    # 2D coordinates for Delaunay: [lat, lng]
    coords_2d = points_arr[:, :2]

    # Perform Delaunay Triangulation
    tri = Delaunay(coords_2d)

    features = []
    triangles_meta = []

    for idx, simplex in enumerate(tri.simplices):
        p1, p2, p3 = points[simplex[0]], points[simplex[1]], points[simplex[2]]

        mean_elev = (p1[2] + p2[2] + p3[2]) / 3.0
        slope_deg, aspect_deg, cardinal = calculate_plane_slope_aspect(p1, p2, p3)
        color = get_hypsometric_color(mean_elev)

        centroid = [
            (p1[0] + p2[0] + p3[0]) / 3.0,
            (p1[1] + p2[1] + p3[1]) / 3.0,
            mean_elev,
        ]

        tri_info = {
            "id": idx + 1,
            "centroid": centroid,
            "mean_elevation_m": round(mean_elev, 2),
            "slope_deg": slope_deg,
            "aspect_deg": aspect_deg,
            "aspect_cardinal": cardinal,
            "color": color,
            "vertices": [
                {"lat": p1[0], "lng": p1[1], "elev": p1[2]},
                {"lat": p2[0], "lng": p2[1], "elev": p2[2]},
                {"lat": p3[0], "lng": p3[1], "elev": p3[2]},
            ],
        }
        triangles_meta.append(tri_info)

        # GeoJSON Polygon: [lng, lat, elev]
        polygon_coords = [
            [p1[1], p1[0], p1[2]],
            [p2[1], p2[0], p2[2]],
            [p3[1], p3[0], p3[2]],
            [p1[1], p1[0], p1[2]],
        ]

        feature = {
            "type": "Feature",
            "properties": {
                "triangleId": idx + 1,
                "meanElevation": round(mean_elev, 2),
                "slope": slope_deg,
                "aspect": aspect_deg,
                "aspectCardinal": cardinal,
                "fill": color,
                "stroke": "#0ea5e9",
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [polygon_coords],
            },
        }
        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "name": "Bengaluru_TIN_Terrain_Mesh",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
        },
        "features": features,
    }

    elevations = [p[2] for p in points]
    stats = {
        "total_vertices": len(points),
        "total_triangles": len(tri.simplices),
        "min_elevation_m": min(elevations),
        "max_elevation_m": max(elevations),
        "mean_elevation_m": round(float(np.mean(elevations)), 2),
    }

    return geojson, triangles_meta, stats


def main():
    print("=================================================================")
    print("BENGALURU GIS: PROCESSING TIN TERRAIN MESH & TOPOGRAPHIC DEM")
    print("=================================================================")

    output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "public", "gis")
    os.makedirs(output_dir, exist_ok=True)

    geojson, triangles_meta, stats = generate_bengaluru_tin(grid_rows=14, grid_cols=14)

    output_geojson_path = os.path.join(output_dir, "bengaluru_tin_mesh.geojson")
    with open(output_geojson_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2)

    print(f"Generated TIN Mesh GeoJSON: {output_geojson_path}")
    print(f"Total vertices: {stats['total_vertices']}")
    print(f"Total triangles: {stats['total_triangles']}")
    print(f"Elevation Range: {stats['min_elevation_m']:.1f}m - {stats['max_elevation_m']:.1f}m (Mean: {stats['mean_elevation_m']:.1f}m)")
    print("SUCCESS: TIN Terrain Model ready for 3D Cesium GIS ingestion.")


if __name__ == "__main__":
    main()
