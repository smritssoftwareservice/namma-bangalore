-- ============================================================
-- FLOODGUARD AI - PostGIS Database Schema Migration
-- ============================================================

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Citizens, Field Workers, Admins)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'FIELD_WORKER')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Hazards Table
CREATE TABLE IF NOT EXISTS hazards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN (
    'POTHOLE', 'LARGE_POTHOLE', 'OPEN_MANHOLE', 'DAMAGED_MANHOLE',
    'BROKEN_DRAIN', 'BLOCKED_DRAIN', 'OVERFLOWING_DRAIN', 'WATERLOGGING',
    'FLOODED_ROAD', 'ROAD_CRACK', 'ROAD_DAMAGE', 'ROAD_DEPRESSION',
    'ACCIDENT_REPORTED', 'ROAD_BLOCKED', 'VEHICLE_STRANDED', 'OTHER'
  )),
  title TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) STORED,
  address TEXT,
  severity TEXT NOT NULL DEFAULT 'MODERATE' CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
  risk_score INTEGER NOT NULL DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL DEFAULT 'MODERATE' CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
  status TEXT NOT NULL DEFAULT 'REPORTED' CHECK (status IN (
    'REPORTED', 'AI_ANALYZED', 'PENDING_VERIFICATION', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
  )),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial & query indexes
CREATE INDEX IF NOT EXISTS hazards_location_idx ON hazards USING GIST (location);
CREATE INDEX IF NOT EXISTS hazards_status_idx ON hazards (status);
CREATE INDEX IF NOT EXISTS hazards_risk_level_idx ON hazards (risk_level);
CREATE INDEX IF NOT EXISTS hazards_type_idx ON hazards (type);
CREATE INDEX IF NOT EXISTS hazards_created_at_idx ON hazards (created_at DESC);

-- 4. Detections Table (AI Vision Results)
CREATE TABLE IF NOT EXISTS detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID NOT NULL REFERENCES hazards(id) ON DELETE CASCADE,
  object_type TEXT NOT NULL,
  confidence DOUBLE PRECISION NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  bounding_box JSONB, -- [ymin, xmin, ymax, xmax]
  model_version TEXT NOT NULL DEFAULT 'floodguard-vision-v2',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS detections_hazard_id_idx ON detections(hazard_id);

-- 5. Evidence Table (Media attachments)
CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID NOT NULL REFERENCES hazards(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('IMAGE', 'VIDEO')),
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS evidence_hazard_id_idx ON evidence(hazard_id);

-- 6. Weather Snapshots Table
CREATE TABLE IF NOT EXISTS weather (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  rainfall DOUBLE PRECISION NOT NULL DEFAULT 0.0, -- mm
  rain_intensity TEXT NOT NULL DEFAULT 'NONE' CHECK (rain_intensity IN ('NONE', 'LIGHT', 'MODERATE', 'HEAVY', 'VERY_HEAVY')),
  temperature DOUBLE PRECISION,
  humidity DOUBLE PRECISION,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Risk Scores Breakdown Table
CREATE TABLE IF NOT EXISTS risk_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID NOT NULL REFERENCES hazards(id) ON DELETE CASCADE,
  hazard_score DOUBLE PRECISION NOT NULL,
  rainfall_score DOUBLE PRECISION NOT NULL,
  waterlogging_score DOUBLE PRECISION NOT NULL,
  history_score DOUBLE PRECISION NOT NULL,
  traffic_score DOUBLE PRECISION NOT NULL,
  report_frequency_score DOUBLE PRECISION NOT NULL,
  final_score INTEGER NOT NULL CHECK (final_score >= 0 AND final_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS risk_scores_hazard_id_idx ON risk_scores(hazard_id);

-- 8. Reports Table (Public reporting tracking)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID NOT NULL REFERENCES hazards(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Maintenance Tasks Table (Field Worker assignments)
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID NOT NULL REFERENCES hazards(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED')),
  before_image TEXT,
  after_image TEXT,
  notes TEXT,
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS maintenance_tasks_hazard_id_idx ON maintenance_tasks(hazard_id);
CREATE INDEX IF NOT EXISTS maintenance_tasks_assigned_to_idx ON maintenance_tasks(assigned_to);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ALERT' CHECK (type IN ('ALERT', 'VERIFICATION', 'STATUS_CHANGE', 'MAINTENANCE')),
  hazard_id UUID REFERENCES hazards(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

-- 11. Saved Locations Table (Alert boundaries)
CREATE TABLE IF NOT EXISTS saved_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius INTEGER NOT NULL DEFAULT 1000, -- meters
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Community Confirmations Table
CREATE TABLE IF NOT EXISTS community_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hazard_id UUID NOT NULL REFERENCES hazards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  confirmation TEXT NOT NULL CHECK (confirmation IN ('STILL_PRESENT', 'RESOLVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS community_confirmations_hazard_id_idx ON community_confirmations(hazard_id);

-- ============================================================
-- PostGIS Geospatial Functions
-- ============================================================

-- A. Bounding Box Query
CREATE OR REPLACE FUNCTION get_hazards_in_bounds(
  min_lng DOUBLE PRECISION,
  min_lat DOUBLE PRECISION,
  max_lng DOUBLE PRECISION,
  max_lat DOUBLE PRECISION
)
RETURNS SETOF hazards
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM hazards
  WHERE location && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography;
$$;

-- B. Nearby Hazards with distance sorting
CREATE OR REPLACE FUNCTION get_hazards_nearby(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION
)
RETURNS TABLE (
  hazard hazards,
  distance_meters DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
  SELECT h, ST_Distance(h.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance_meters
  FROM hazards h
  WHERE ST_DWithin(h.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_meters)
  ORDER BY distance_meters ASC;
$$;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_confirmations ENABLE ROW LEVEL SECURITY;

-- Public can read hazards, detections, evidence, weather
CREATE POLICY "Hazards are viewable by everyone" ON hazards FOR SELECT USING (true);
CREATE POLICY "Detections are viewable by everyone" ON detections FOR SELECT USING (true);
CREATE POLICY "Evidence is viewable by everyone" ON evidence FOR SELECT USING (true);
CREATE POLICY "Weather is viewable by everyone" ON weather FOR SELECT USING (true);
CREATE POLICY "Risk scores are viewable by everyone" ON risk_scores FOR SELECT USING (true);
CREATE POLICY "Community confirmations are viewable by everyone" ON community_confirmations FOR SELECT USING (true);

-- Authenticated users can insert hazards & reports
CREATE POLICY "Authenticated users can insert hazards" ON hazards FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can add evidence" ON evidence FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can add confirmations" ON community_confirmations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Notifications & saved locations are user-scoped
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own saved locations" ON saved_locations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saved locations" ON saved_locations FOR INSERT WITH CHECK (auth.uid() = user_id);
