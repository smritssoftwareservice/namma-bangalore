// FLOODGUARD AI - Automated Unit & Integration Test Suite
import assert from 'node:assert';
import { calculateRiskScore, getRiskLevel, getRainfallScore } from '../lib/risk/risk-engine';
import { DemoAIProvider } from '../lib/ai/ai-provider';
import { haversineDistanceMeters, isHazardNearPolyline } from '../lib/routing/routing-service';
import { reportHazardSchema, updateHazardSchema } from '../lib/validation/schemas';
import { floodGuardStore } from '../lib/db/store';
import { getElevationAt, getSlopeAndAspect, inspectPointTerrain, generateContoursGeoJSON, generateElevationProfile, generateFilledContourBands } from '../lib/gis/dem-data';
import { runFloodSimulation } from '../lib/gis/simulation-service';
import { generateBengaluruTIN } from '../lib/gis/tin-service';
import { delineateCatchmentForOutlet } from '../lib/gis/catchment-service';
import { analyzeInundatedInfrastructure, BENGALURU_STRUCTURES, BENGALURU_ROADS } from '../lib/gis/structures-roads-data';
import {
  BENGALURU_3D_BUILDINGS,
  BENGALURU_ELEVATED_INFRASTRUCTURE,
  calculateSunPosition,
  RENDERING_PROFILES,
  BENGALURU_FLYOVER_PATHS,
} from '../lib/gis/photorealistic-city-data';
import { BENGALURU_LAKES, RAJAKALUVE_SEGMENTS, WATERSHED_BOUNDARIES } from '../lib/gis/hydrology-data';
import { BENGALURU_FLOOD_ZONES, WATERLOGGING_INCIDENTS, HISTORICAL_FLOOD_EVENTS } from '../lib/gis/flood-data';
import { getFallbackBengaluruWeather } from '../lib/gis/weather-provider';

async function runTests() {
  console.log('🚀 Starting FLOODGUARD AI Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`  ✅ PASS: ${name}`);
        passed++;
      })
      .catch((err) => {
        console.error(`  ❌ FAIL: ${name}`);
        console.error('     ', err.message);
        failed++;
      });
  }

  // 1. RISK ENGINE TESTS
  console.log('--- 1. Testing Risk Engine ---');

  await test('Risk Level mapping matches defined thresholds', () => {
    assert.strictEqual(getRiskLevel(95), 'CRITICAL');
    assert.strictEqual(getRiskLevel(81), 'CRITICAL');
    assert.strictEqual(getRiskLevel(80), 'HIGH');
    assert.strictEqual(getRiskLevel(61), 'HIGH');
    assert.strictEqual(getRiskLevel(60), 'MODERATE');
    assert.strictEqual(getRiskLevel(31), 'MODERATE');
    assert.strictEqual(getRiskLevel(30), 'LOW');
    assert.strictEqual(getRiskLevel(0), 'LOW');
  });

  await test('Rainfall score scaling handles zero and heavy precipitation', () => {
    assert.strictEqual(getRainfallScore(0), 0);
    assert.ok(getRainfallScore(25) > 30 && getRainfallScore(25) < 70);
    assert.strictEqual(getRainfallScore(75), 100);
  });

  await test('Calculate risk score factors hazard severity, rainfall and waterlogging', () => {
    const result = calculateRiskScore({
      hazardType: 'OPEN_MANHOLE',
      severity: 'CRITICAL',
      rainfall_mm: 55,
      waterlogging_detected: true,
      historical_reports_count: 3,
      is_major_arterial_road: true,
      reports_last_24h: 2,
    });

    assert.ok(result.final_score >= 81, `Expected score >= 81, got ${result.final_score}`);
    assert.strictEqual(result.risk_level, 'CRITICAL');
    assert.ok(result.waterlogging_score > 0);
  });

  await test('Custom weights override default risk distribution', () => {
    const defaultRes = calculateRiskScore({
      hazardType: 'ROAD_CRACK',
      severity: 'LOW',
      rainfall_mm: 0,
      waterlogging_detected: false,
      historical_reports_count: 0,
      is_major_arterial_road: false,
    });

    const heavySeverityRes = calculateRiskScore({
      hazardType: 'ROAD_CRACK',
      severity: 'LOW',
      rainfall_mm: 0,
      waterlogging_detected: false,
      historical_reports_count: 0,
      is_major_arterial_road: false,
      customWeights: { hazardSeverity: 0.90, rainfall: 0.02 },
    });

    assert.notStrictEqual(defaultRes.final_score, heavySeverityRes.final_score);
  });

  // 2. AI VISION PROVIDER TESTS
  console.log('\n--- 2. Testing AI Vision Provider ---');

  await test('DemoAIProvider classifies pothole image metadata with high confidence', async () => {
    const provider = new DemoAIProvider();
    const res = await provider.analyzeImage({
      fileName: 'road_pothole_crater_evidence.jpg',
      fileSize: 1024000,
    });

    assert.strictEqual(res.primary_hazard, 'POTHOLE');
    assert.ok(res.confidence > 0.9);
    assert.ok(res.detections.length > 0);
    assert.ok(res.disclaimer.includes('assistive classification'));
    assert.strictEqual(res.is_demo, true);
  });

  await test('DemoAIProvider detects open manhole from filename hint and assigns critical severity', async () => {
    const provider = new DemoAIProvider();
    const res = await provider.analyzeImage({
      fileName: 'broken_manhole_drain.png',
    });

    assert.strictEqual(res.primary_hazard, 'OPEN_MANHOLE');
    assert.strictEqual(res.recommended_severity, 'CRITICAL');
    assert.ok(res.confidence >= 0.95);
  });

  // 3. GEOSPATIAL HELPER TESTS
  console.log('\n--- 3. Testing Geospatial Intelligence ---');

  await test('Haversine distance calculation between Bangalore landmarks is accurate', () => {
    // Indiranagar (12.9784, 77.6408) to MG Road (12.9756, 77.6066) ~ 3.7 km
    const distMeters = haversineDistanceMeters(12.9784, 77.6408, 12.9756, 77.6066);
    assert.ok(distMeters > 3000 && distMeters < 4200, `Expected ~3.7km, got ${distMeters}`);
  });

  await test('Route polyline buffer correctly identifies nearby hazards', () => {
    const polyline: [number, number][] = [
      [77.6408, 12.9784],
      [77.6200, 12.9760],
      [77.6066, 12.9756],
    ]; // [lng, lat]

    // Point right on line
    const onLine = isHazardNearPolyline(12.9770, 77.6300, polyline, 200);
    assert.strictEqual(onLine, true);

    // Point far away (5 km north)
    const farAway = isHazardNearPolyline(13.0500, 77.6300, polyline, 200);
    assert.strictEqual(farAway, false);
  });

  // 4. ZOD VALIDATION SCHEMAS TESTS
  console.log('\n--- 4. Testing Zod Validation Schemas ---');

  await test('reportHazardSchema validates required fields and coordinates', () => {
    const valid = reportHazardSchema.safeParse({
      type: 'WATERLOGGING',
      title: 'Water pooling on underpass',
      description: 'Traffic blocked',
      latitude: 12.9348,
      longitude: 77.6251,
      severity: 'HIGH',
    });
    assert.strictEqual(valid.success, true);

    const invalid = reportHazardSchema.safeParse({
      type: 'INVALID_TYPE',
      latitude: 200, // out of bounds
    });
    assert.strictEqual(invalid.success, false);
  });

  await test('updateHazardSchema accepts partial workflow updates', () => {
    const valid = updateHazardSchema.safeParse({
      status: 'VERIFIED',
      risk_score: 85,
    });
    assert.strictEqual(valid.success, true);
  });

  // 5. DATABASE STORE ADAPTER TESTS
  console.log('\n--- 5. Testing Store & PostGIS Operations ---');

  await test('Store initializes with Bengaluru demo hazards', async () => {
    const all = await floodGuardStore.getHazards();
    assert.ok(all.length >= 20, `Expected at least 20 seeded hazards, got ${all.length}`);
  });

  await test('Store filters hazards by type and status', async () => {
    const potholes = await floodGuardStore.getHazards({ type: 'POTHOLES' });
    assert.ok(potholes.length > 0);
    potholes.forEach((p) => {
      assert.ok(p.type === 'POTHOLE' || p.type === 'LARGE_POTHOLE');
    });
  });

  await test('Store performs radius near-me query with distance calculation', async () => {
    // Search 3km around Whitefield (12.9698, 77.7499)
    const nearby = await floodGuardStore.getNearbyHazards(12.9698, 77.7499, 3000, 'distance');
    assert.ok(nearby.length > 0);
    nearby.forEach((h) => {
      assert.ok(h.distance_meters !== undefined && h.distance_meters <= 3000);
    });
  });

  await test('Store adds community confirmation and increments tally', async () => {
    const hazard = (await floodGuardStore.getHazards())[0];
    const initialStillPresent = hazard.confirmations_count?.still_present || 0;

    const updated = await floodGuardStore.addConfirmation(hazard.id, 'STILL_PRESENT');
    assert.strictEqual(
      updated?.confirmations_count?.still_present,
      initialStillPresent + 1
    );
  });

  // 6. 3D GIS & HYDROLOGY ENGINE TESTS
  console.log('\n--- 6. Testing 3D GIS, DEM & Hydrology Engine ---');

  await test('Copernicus DEM calculates elevation for Bengaluru within Deccan plateau range', () => {
    // Vidhana Soudha / High Grounds ridge
    const vidhanaElev = getElevationAt(12.9780, 77.5910);
    assert.ok(vidhanaElev >= 930 && vidhanaElev <= 950, `Expected 930-950m, got ${vidhanaElev}`);

    // Bellandur Lake valley sink
    const bellandurElev = getElevationAt(12.9350, 77.6750);
    assert.ok(bellandurElev >= 880 && bellandurElev <= 890, `Expected 880-890m, got ${bellandurElev}`);
    assert.ok(vidhanaElev > bellandurElev, 'Vidhana Soudha ridge must be higher than Bellandur valley');
  });

  await test("Horn's method slope and aspect calculation yields proper classifications", () => {
    const flatArea = getSlopeAndAspect(12.9350, 77.6750); // Bellandur basin
    assert.ok(flatArea.slopeDegrees >= 0);
    assert.ok(flatArea.aspectDegrees >= 0 && flatArea.aspectDegrees <= 360);
    assert.ok(['Very Flat', 'Gentle Slope', 'Moderate Slope', 'Steep Slope', 'Very Steep'].includes(flatArea.slopeClassification));
  });

  await test('Contour Generator outputs valid GeoJSON LineStrings at requested intervals', () => {
    const contours = generateContoursGeoJSON(undefined, 10);
    assert.strictEqual(contours.type, 'FeatureCollection');
    assert.ok(contours.features.length > 0);
    const first = contours.features[0];
    assert.strictEqual(first.geometry.type, 'LineString');
    assert.ok(typeof first.properties.elevation === 'number');
  });

  await test('Hydrological Flood Simulation computes runoff, inundation and affected infrastructure', () => {
    const sim = runFloodSimulation({
      targetLocation: {
        name: 'Bellandur Lake & Ecospace',
        latitude: 12.9350,
        longitude: 77.6750,
        baseElevationMeters: 884.6,
      },
      rainfallScenarioMm: 100,
      rainfallDurationHours: 3,
      targetWaterLevelMeters: 1.2,
      runoffCoefficient: 0.88,
    });

    assert.strictEqual(sim.scenarioMm, 100);
    assert.ok(sim.inundationAreaSqKm > 0.5);
    assert.ok(sim.totalRunoffVolumeM3 > 10000);
    assert.ok(sim.inundationPolygon.length > 5);
    assert.ok(sim.depthContours.length > 0);
    assert.ok(sim.modelDisclaimer.includes('Illustrative planning scenario'));
  });

  await test('Hydrology inventory contains valid Bengaluru Lakes, Rajakaluves and Watersheds', () => {
    assert.ok(BENGALURU_LAKES.length >= 10);
    assert.ok(RAJAKALUVE_SEGMENTS.length >= 6);
    assert.ok(WATERSHED_BOUNDARIES.length >= 3);
    const bellandur = BENGALURU_LAKES.find((l) => l.id === 'lake-bellandur');
    assert.ok(bellandur !== undefined);
    assert.strictEqual(bellandur?.watershed, 'KC Valley');
  });

  await test('Flood monitoring dataset contains verified BBMP flood zones and historical cloudburst archives', () => {
    assert.ok(BENGALURU_FLOOD_ZONES.length >= 6);
    assert.ok(WATERLOGGING_INCIDENTS.length >= 5);
    assert.ok(HISTORICAL_FLOOD_EVENTS.length >= 3);
    const sep2022 = HISTORICAL_FLOOD_EVENTS.find((e) => e.year === 2022);
    assert.ok(sep2022 !== undefined);
    assert.strictEqual(sep2022?.peakRainfall24hMm, 131.6);
  });

  // 7. ADVANCED GIS TERRAIN & CATCHMENT ANALYSIS TESTS
  console.log('\n--- 7. Testing Advanced GIS Terrain, TIN & Catchment Systems ---');

  await test('Elevation Cross-Section Profiler computes geodesic distance, elevation extrema and gain/loss', () => {
    // Cross-section from Vidhana Soudha (ridge ~935m) to Bellandur Lake (valley ~884m)
    const start: [number, number] = [12.9790, 77.5910];
    const end: [number, number] = [12.9350, 77.6750];
    const profile = generateElevationProfile(start, end, 30);

    assert.ok(profile.totalDistanceKm > 8 && profile.totalDistanceKm < 15, `Distance was ${profile.totalDistanceKm}`);
    assert.ok(profile.minElevationMeters >= 850 && profile.minElevationMeters <= 895);
    assert.ok(profile.maxElevationMeters >= 920 && profile.maxElevationMeters <= 960);
    assert.ok(profile.elevationLossMeters > 0, 'Elevation loss must occur heading into Bellandur sink');
    assert.strictEqual(profile.profilePoints.length, 31);
    assert.strictEqual(profile.profilePoints[0].distanceKm, 0);
    assert.ok(profile.profilePoints[30].distanceKm > 8);
  });

  await test('Hypsometric Filled Contour generator creates classified elevation polygons', () => {
    const bands = generateFilledContourBands(undefined, 20, 'green-yellow-orange');
    assert.ok(bands.length >= 5, `Expected >= 5 elevation bands, got ${bands.length}`);
    const lowest = bands[0];
    assert.ok(lowest.minElev <= 860);
    assert.ok(lowest.color.startsWith('#'));
  });

  await test('TIN Surface Engine builds Delaunay triangular mesh with slope and aspect', () => {
    const tin = generateBengaluruTIN('medium', 'green-yellow-orange');
    assert.ok(tin.trianglesCount > 50, `Expected > 50 triangles, got ${tin.trianglesCount}`);
    assert.ok(tin.verticesCount > 25, `Expected > 25 vertices, got ${tin.verticesCount}`);
    assert.ok(tin.elevationRange[0] <= 860 && tin.elevationRange[1] >= 950);

    const firstTri = tin.triangles[0];
    assert.strictEqual(firstTri.vertices.length, 3);
    assert.ok(firstTri.meanElevationMeters >= 800 && firstTri.meanElevationMeters <= 1050);
    assert.ok(firstTri.slopeDegrees >= 0);
    assert.ok(firstTri.aspectDegrees >= 0 && firstTri.aspectDegrees <= 360);
    assert.ok(firstTri.colorHex.startsWith('#'));
  });

  await test('D8 Hydrological Catchment Delineator traces upstream contributing basin from outlet', () => {
    // Outlet at Bellandur Lake weir
    const outletLat = 12.9350;
    const outletLng = 77.6750;
    const catchment = delineateCatchmentForOutlet(outletLat, outletLng);

    assert.strictEqual(catchment.outletCoordinates[0], outletLat);
    assert.strictEqual(catchment.outletCoordinates[1], outletLng);
    assert.ok(catchment.catchmentAreaKm2 >= 10, `Expected catchment >= 10 km2, got ${catchment.catchmentAreaKm2}`);
    assert.ok(catchment.catchmentPolygon.length >= 8, 'Catchment polygon must have closed boundary coordinates');
    assert.ok(catchment.streamNetwork.length >= 3, 'Catchment must contain dendritic stream paths');
    assert.ok(catchment.elevationMinM < catchment.elevationMaxM);
  });

  await test('Infrastructure Inundation Analysis detects submerged structures and impassable road corridors', () => {
    const sim = runFloodSimulation({
      targetLocation: {
        name: 'Ecospace Business Park Basin',
        latitude: 12.9260,
        longitude: 77.6840,
        baseElevationMeters: 882.5,
      },
      rainfallScenarioMm: 150,
      rainfallDurationHours: 4,
      targetWaterLevelMeters: 2.0,
      runoffCoefficient: 0.88,
    });

    const analysis = analyzeInundatedInfrastructure(
      sim.inundationPolygon,
      2.0,
      12.9260,
      77.6840
    );

    assert.ok(analysis.floodedBuildings.length > 0, 'Should detect buildings impacted by flood');
    assert.ok(analysis.floodedRoads.length > 0, 'Should detect roads intersecting flood extent');
    assert.ok(analysis.totalSubmergedRoadKm >= 0);
    assert.ok(analysis.totalAffectedStructures > 0);

    // Deepest affected structure should have non-zero flood depth
    const submergedBuilding = analysis.floodedBuildings.find((b) => b.isSubmerged);
    assert.ok(submergedBuilding !== undefined);
    assert.ok(submergedBuilding?.estimatedFloodDepthM > 0);
  });

  // 8. PHOTOREALISTIC 3D CITY & APPLE MAPS EXPERIENCE TESTS
  console.log('\n--- 8. Testing Photorealistic 3D City & Apple Maps Navigation Engine ---');

  await test('Photorealistic 3D Building Inventory contains surveyed heights, floor counts, and facade types', () => {
    assert.ok(BENGALURU_3D_BUILDINGS.length >= 10, `Expected >= 10 buildings, got ${BENGALURU_3D_BUILDINGS.length}`);
    
    // Vidhana Soudha heritage building
    const vidhana = BENGALURU_3D_BUILDINGS.find((b) => b.id === 'bldg-vidhana-soudha');
    assert.ok(vidhana !== undefined);
    assert.strictEqual(vidhana?.roofType, 'dome-heritage');
    assert.strictEqual(vidhana?.heightMeters, 55.0);
    assert.strictEqual(vidhana?.floorCount, 4);

    // UB Tower flagship high-rise skyscraper
    const ubTower = BENGALURU_3D_BUILDINGS.find((b) => b.id === 'bldg-ub-tower');
    assert.ok(ubTower !== undefined);
    assert.strictEqual(ubTower?.heightMeters, 128.0);
    assert.strictEqual(ubTower?.floorCount, 32);
    assert.strictEqual(ubTower?.roofType, 'spire-tower');
    assert.ok(ubTower?.nightEmissiveHex.startsWith('#'));

    // Mantri Pinnacle South Bangalore tower
    const pinnacle = BENGALURU_3D_BUILDINGS.find((b) => b.id === 'bldg-mantri-pinnacle');
    assert.ok(pinnacle !== undefined);
    assert.strictEqual(pinnacle?.heightMeters, 153.0);
    assert.strictEqual(pinnacle?.floorCount, 46);
  });

  await test('3D Elevated Infrastructure models true clearance heights, deck widths, and structural piers', () => {
    assert.ok(BENGALURU_ELEVATED_INFRASTRUCTURE.length >= 5);

    // Electronic City Expressway NH 44 (14m clearance)
    const ecity = BENGALURU_ELEVATED_INFRASTRUCTURE.find((i) => i.id === 'infra-ecity-expressway');
    assert.ok(ecity !== undefined);
    assert.strictEqual(ecity?.clearanceHeightMeters, 14.0);
    assert.strictEqual(ecity?.deckWidthMeters, 18.0);
    assert.strictEqual(ecity?.type, 'Elevated Expressway');
    assert.ok(ecity?.points.length >= 5);

    // Namma Metro Purple Line Elevated Viaduct (12.5m clearance)
    const metroPurple = BENGALURU_ELEVATED_INFRASTRUCTURE.find((i) => i.id === 'infra-metro-purple-line');
    assert.ok(metroPurple !== undefined);
    assert.strictEqual(metroPurple?.clearanceHeightMeters, 12.5);
    assert.strictEqual(metroPurple?.accentColorHex, '#a855f7');
    assert.strictEqual(metroPurple?.type, 'Metro Viaduct');
  });

  await test('Solar Astronomical calculation maps time of day to sun elevation, azimuth, and day/night transitions', () => {
    // Dawn (06:00)
    const dawn = calculateSunPosition(6.0);
    assert.ok(dawn.elevationDeg >= 0 && dawn.elevationDeg <= 20, `Dawn elevation: ${dawn.elevationDeg}`);
    assert.strictEqual(dawn.isNight, false);

    // Noon (12:00)
    const noon = calculateSunPosition(12.0);
    assert.ok(noon.elevationDeg >= 70, `Noon elevation: ${noon.elevationDeg}`);
    assert.strictEqual(noon.ambientLightIntensity, 1.0);
    assert.strictEqual(noon.isNight, false);

    // Sunset (18:00)
    const sunset = calculateSunPosition(18.0);
    assert.ok(sunset.elevationDeg >= 0 && sunset.elevationDeg <= 20, `Sunset elevation: ${sunset.elevationDeg}`);
    assert.strictEqual(sunset.isNight, false);

    // Night (22:00)
    const night = calculateSunPosition(22.0);
    assert.ok(night.elevationDeg < 0, `Night elevation must be below horizon: ${night.elevationDeg}`);
    assert.strictEqual(night.isNight, true);
    assert.strictEqual(night.nightWindowGlowIntensity, 1.0);
  });

  await test('Rendering Quality Profiles support 8K resolution scaling and SSAO/shadow thresholds', () => {
    const ultra = RENDERING_PROFILES.ULTRA;
    assert.strictEqual(ultra.id, 'ULTRA');
    assert.strictEqual(ultra.resolutionScale, 2.0);
    assert.strictEqual(ultra.enableSsao, true);
    assert.strictEqual(ultra.enableHdr, true);
    assert.strictEqual(ultra.enableDynamicShadows, true);
    assert.strictEqual(ultra.shadowMapSize, 4096);

    const low = RENDERING_PROFILES.LOW;
    assert.strictEqual(low.resolutionScale, 1.0);
    assert.strictEqual(low.enableDynamicShadows, false);
  });

  await test('Cinematic 3D City Flyovers contain valid geographic waypoints and camera easing parameters', () => {
    assert.ok(BENGALURU_FLYOVER_PATHS.length >= 3);
    const cbdRoute = BENGALURU_FLYOVER_PATHS[0];
    assert.strictEqual(cbdRoute.id, 'flyover-cbd-heritage');
    assert.ok(cbdRoute.waypoints.length >= 4);

    for (const wp of cbdRoute.waypoints) {
      assert.ok(wp.latitude >= 12.8 && wp.latitude <= 13.2);
      assert.ok(wp.longitude >= 77.4 && wp.longitude <= 77.8);
      assert.ok(wp.altitudeMeters >= 100 && wp.altitudeMeters <= 1000);
      assert.ok(wp.pitchDegrees <= 0 && wp.pitchDegrees >= -90);
      assert.ok(wp.durationSeconds > 0);
    }
  });

  // Summary
  console.log('\n========================================');
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
