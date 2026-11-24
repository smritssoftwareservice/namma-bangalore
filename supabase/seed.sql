-- ============================================================
-- FLOODGUARD AI - Bengaluru Demonstration Seed Dataset
-- Note: All records are strictly marked as DEMO DATA.
-- ============================================================

-- Seed Demo Profiles
INSERT INTO profiles (id, name, email, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dr. Priya Nair', 'priya.nair@bbmp.gov.demo', 'ADMIN'),
  ('00000000-0000-0000-0000-000000000002', 'Ramesh Kumar', 'ramesh.crew4@bbmp.gov.demo', 'FIELD_WORKER'),
  ('00000000-0000-0000-0000-000000000003', 'Vikram Sharma', 'vikram.citizen@floodguard.io', 'USER')
ON CONFLICT (id) DO NOTHING;

-- Seed Hazards
INSERT INTO hazards (id, type, title, description, latitude, longitude, address, severity, risk_score, risk_level, status)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'LARGE_POTHOLE',
    'Severe crater near ITPL Main Gate',
    'Deep road crater measuring 1.2m across on eastbound lane right after ITPL signal. DEMO DATA.',
    12.9863,
    77.7314,
    'ITPL Main Road, Whitefield, Bengaluru',
    'HIGH',
    78,
    'HIGH',
    'VERIFIED'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'OPEN_MANHOLE',
    'Completely open manhole chamber on Hope Farm curve',
    'Cast iron cover shattered and missing. Chamber depth approx 2.5m. DEMO DATA.',
    12.9839,
    77.7511,
    'Channasandra Main Rd, Hope Farm Junction, Whitefield, Bengaluru',
    'CRITICAL',
    96,
    'CRITICAL',
    'VERIFIED'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'WATERLOGGING',
    'Severe waterlogging at EcoSpace Outer Ring Road',
    'Standing water depth over 45cm covering all 3 westbound lanes. DEMO DATA.',
    12.9265,
    77.6848,
    'Outer Ring Road, EcoSpace Business Park, Bellandur, Bengaluru',
    'CRITICAL',
    94,
    'CRITICAL',
    'VERIFIED'
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'FLOODED_ROAD',
    'Flooded underpass at Rainbow Drive layout entrance',
    'Sarjapur road culvert backflow causing localized flooding of 60cm depth. DEMO DATA.',
    12.9084,
    77.7012,
    'Sarjapur Main Road, Rainbow Drive, Bengaluru',
    'CRITICAL',
    97,
    'CRITICAL',
    'VERIFIED'
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'POTHOLE',
    'Multiple road depressions near Sony World Junction',
    'Cluster of sharp-edged potholes in front of commercial row. DEMO DATA.',
    12.9348,
    77.6251,
    '80 Feet Road, 4th Block, Koramangala, Bengaluru',
    'MODERATE',
    58,
    'MODERATE',
    'IN_PROGRESS'
  ),
  (
    'a0000000-0000-0000-0000-000000000006',
    'LARGE_POTHOLE',
    'Deep crater on Silk Board flyover approach',
    'Damaged expansion joint gap and expanding crater in middle lane. DEMO DATA.',
    12.9181,
    77.6234,
    'Hosur Road Flyover Ramp, Central Silk Board, Bengaluru',
    'CRITICAL',
    89,
    'CRITICAL',
    'VERIFIED'
  ),
  (
    'a0000000-0000-0000-0000-000000000007',
    'POTHOLE',
    'Pothole repaired outside Indiranagar Metro',
    'Tarmac patched and hot-rolled by municipal quick response team. DEMO DATA.',
    12.9781,
    77.6394,
    'Chinmaya Mission Hospital Rd, Indiranagar, Bengaluru',
    'LOW',
    15,
    'LOW',
    'RESOLVED'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Detections
INSERT INTO detections (id, hazard_id, object_type, confidence, model_version)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'pothole', 0.95, 'floodguard-yolo-v8'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'open_manhole', 0.98, 'floodguard-yolo-v8'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'waterlogging', 0.96, 'floodguard-yolo-v8')
ON CONFLICT (id) DO NOTHING;
