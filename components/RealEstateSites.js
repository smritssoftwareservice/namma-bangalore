// Curated Prime Bengaluru Real Estate Sites, Water Bodies, Parks & Architectural Masterplans

export const REAL_ESTATE_SITES = [
  {
    id: "devanahalli-aerotropolis",
    name: "Devanahalli Aerotropolis Hub",
    locality: "North Bengaluru (Near BLR Airport)",
    category: "commercial",
    authority: "BIAPPA / BIAAPA",
    zoning: "High-Density Commercial & Mixed-Use",
    acres: 18.5,
    areaSqFt: 805860,
    permissibleFAR: 3.25,
    setbackMeters: 9,
    center: { lat: 13.1895, lng: 77.6980, alt: 915 },
    camera: { height: 850, pitch: -38, heading: 35 },
    boundary: [
      { lat: 13.1915, lng: 77.6955 },
      { lat: 13.1920, lng: 77.7005 },
      { lat: 13.1875, lng: 77.7010 },
      { lat: 13.1870, lng: 77.6960 },
    ],
    internalRoads: [
      // Main Entrance Boulevard
      [
        { lat: 13.1870, lng: 77.6980 },
        { lat: 13.1915, lng: 77.6980 },
      ],
      // East-West Central Crossway
      [
        { lat: 13.1895, lng: 77.6958 },
        { lat: 13.1895, lng: 77.7007 },
      ],
    ],
    description: "Strategic commercial land parcel abutting the NH-44 Airport Expressway corridor. Optimal for grade-A tech campuses, commercial corporate headquarters, and high-street mixed-use developments.",
    defaultMasterplan: "tech-park",
    metrics: {
      proposedBUA: 2619000,
      groundCoverage: 34,
      estimatedGDV: "₹ 2,450 Cr",
      capacity: "24,000 Tech Professionals",
    },
  },
  {
    id: "whitefield-tech-villas",
    name: "Whitefield Eco-Villa & Tech Parcel",
    locality: "East Bengaluru (Channasandra / ITPL Corridor)",
    category: "residential",
    authority: "BDA (Bangalore Development Authority)",
    zoning: "Residential Urban (R3)",
    acres: 8.4,
    areaSqFt: 365904,
    permissibleFAR: 2.25,
    setbackMeters: 6,
    center: { lat: 12.9825, lng: 77.7420, alt: 890 },
    camera: { height: 680, pitch: -42, heading: 15 },
    boundary: [
      { lat: 12.9845, lng: 77.7400 },
      { lat: 12.9848, lng: 77.7445 },
      { lat: 12.9805, lng: 77.7448 },
      { lat: 12.9802, lng: 77.7402 },
    ],
    internalRoads: [
      // Central Villa Loop
      [
        { lat: 12.9804, lng: 77.7424 },
        { lat: 12.9846, lng: 77.7424 },
      ],
      [
        { lat: 12.9825, lng: 77.7404 },
        { lat: 12.9825, lng: 77.7444 },
      ],
    ],
    description: "Picturesque green parcel in the heart of the Silicon Valley tech corridor. Ideal for luxury G+2 contemporary villas, private clubhouse, and sustainable landscaped urban sanctuary.",
    defaultMasterplan: "villa-enclave",
    metrics: {
      proposedBUA: 380000,
      groundCoverage: 28,
      estimatedGDV: "₹ 620 Cr",
      capacity: "42 Luxury Signature Villas",
    },
  },
  {
    id: "bellandur-orr-towers",
    name: "Outer Ring Road Bellandur Site",
    locality: "South-East Bengaluru (Marathahalli-Sarjapur ORR)",
    category: "commercial",
    authority: "BBMP (Bruhat Bengaluru Mahanagara Palike)",
    zoning: "Commercial High-Density (C4)",
    acres: 6.2,
    areaSqFt: 270072,
    permissibleFAR: 3.75,
    setbackMeters: 8,
    center: { lat: 12.9280, lng: 77.6770, alt: 885 },
    camera: { height: 720, pitch: -35, heading: 320 },
    boundary: [
      { lat: 12.9298, lng: 77.6750 },
      { lat: 12.9302, lng: 77.6792 },
      { lat: 12.9262, lng: 77.6795 },
      { lat: 12.9258, lng: 77.6753 },
    ],
    internalRoads: [
      [
        { lat: 12.9260, lng: 77.6772 },
        { lat: 12.9300, lng: 77.6772 },
      ],
    ],
    description: "High-value tech corridor plot with direct arterial frontage to Outer Ring Road. Planned for twin grade-A commercial glass towers with multi-level EV charging hubs and rooftop gardens.",
    defaultMasterplan: "twin-towers",
    metrics: {
      proposedBUA: 1012000,
      groundCoverage: 38,
      estimatedGDV: "₹ 1,850 Cr",
      capacity: "14,500 Workstations",
    },
  },
  {
    id: "hebbal-lakeview-enclave",
    name: "Hebbal Lakeview Luxury Towers",
    locality: "North Bengaluru (Hebbal Flyover / Bellary Road)",
    category: "residential",
    authority: "BDA / BBMP",
    zoning: "High-Rise Residential (R4)",
    acres: 9.6,
    areaSqFt: 418176,
    permissibleFAR: 2.75,
    setbackMeters: 8,
    center: { lat: 13.0420, lng: 77.5980, alt: 910 },
    camera: { height: 780, pitch: -40, heading: 195 },
    boundary: [
      { lat: 13.0442, lng: 77.5955 },
      { lat: 13.0445, lng: 77.6005 },
      { lat: 13.0398, lng: 77.6010 },
      { lat: 13.0395, lng: 77.5960 },
    ],
    internalRoads: [
      [
        { lat: 13.0397, lng: 77.5982 },
        { lat: 13.0443, lng: 77.5982 },
      ],
    ],
    description: "Front-row panoramic lakeview development parcel. Positioned for ultra-luxury residential towers with sky decks, infinity edge pool, private helipad, and landscaped lakeside promenades.",
    defaultMasterplan: "luxury-residences",
    metrics: {
      proposedBUA: 1150000,
      groundCoverage: 26,
      estimatedGDV: "₹ 1,420 Cr",
      capacity: "320 Sky Condominiums",
    },
  },
  {
    id: "sarjapur-township",
    name: "Sarjapur Mixed-Use Township",
    locality: "South-East Bengaluru (Sarjapur-Attibele Road)",
    category: "mixed",
    authority: "BMRDA (Bangalore Metropolitan Region Development)",
    zoning: "Integrated Township / Mixed-Use",
    acres: 14.2,
    areaSqFt: 618552,
    permissibleFAR: 2.50,
    setbackMeters: 7,
    center: { lat: 12.8710, lng: 77.7650, alt: 895 },
    camera: { height: 850, pitch: -45, heading: 45 },
    boundary: [
      { lat: 12.8735, lng: 77.7620 },
      { lat: 12.8740, lng: 77.7685 },
      { lat: 12.8680, lng: 77.7690 },
      { lat: 12.8675, lng: 77.7625 },
    ],
    internalRoads: [
      [
        { lat: 12.8678, lng: 77.7655 },
        { lat: 12.8737, lng: 77.7655 },
      ],
      [
        { lat: 12.8710, lng: 77.7623 },
        { lat: 12.8710, lng: 77.7687 },
      ],
    ],
    description: "Large-scale development parcel in the fast-appreciating Sarjapur tech expansion zone. Configured for a harmonious blend of executive apartments, row villas, school, and retail arcade.",
    defaultMasterplan: "integrated-township",
    metrics: {
      proposedBUA: 1546000,
      groundCoverage: 31,
      estimatedGDV: "₹ 1,180 Cr",
      capacity: "840 Residential Units + Retail",
    },
  },
];

// BANGALORE NATURAL WATER BODIES (LAKES)
export const BANGALORE_WATER_BODIES = [
  {
    id: "ulsoor-lake",
    name: "Ulsoor Lake (ಹಲಸೂರು ಕೆರೆ)",
    type: "lake",
    areaAcres: 123,
    polygon: [
      { lat: 12.9860, lng: 77.6180 },
      { lat: 12.9875, lng: 77.6230 },
      { lat: 12.9840, lng: 77.6260 },
      { lat: 12.9790, lng: 77.6250 },
      { lat: 12.9800, lng: 77.6190 },
    ],
  },
  {
    id: "bellandur-lake",
    name: "Bellandur Lake (ಬೆಳ್ಳಂದೂರು ಕೆರೆ)",
    type: "lake",
    areaAcres: 890,
    polygon: [
      { lat: 12.9420, lng: 77.6580 },
      { lat: 12.9450, lng: 77.6740 },
      { lat: 12.9350, lng: 77.6850 },
      { lat: 12.9280, lng: 77.6750 },
      { lat: 12.9320, lng: 77.6600 },
    ],
  },
  {
    id: "hebbal-lake",
    name: "Hebbal Lake (ಹೆಬ್ಬಾಳ ಕೆರೆ)",
    type: "lake",
    areaAcres: 150,
    polygon: [
      { lat: 13.0480, lng: 77.5850 },
      { lat: 13.0520, lng: 77.5940 },
      { lat: 13.0420, lng: 77.5960 },
      { lat: 13.0400, lng: 77.5870 },
    ],
  },
  {
    id: "sankey-tank",
    name: "Sankey Tank (ಸ್ಯಾಂಕಿ ಕೆರೆ)",
    type: "lake",
    areaAcres: 37,
    polygon: [
      { lat: 13.0100, lng: 77.5720 },
      { lat: 13.0110, lng: 77.5760 },
      { lat: 13.0070, lng: 77.5750 },
      { lat: 13.0065, lng: 77.5725 },
    ],
  },
  {
    id: "agara-lake",
    name: "Agara Lake (ಅಗರ ಕೆರೆ)",
    type: "lake",
    areaAcres: 98,
    polygon: [
      { lat: 12.9240, lng: 77.6470 },
      { lat: 12.9260, lng: 77.6540 },
      { lat: 12.9190, lng: 77.6550 },
      { lat: 12.9180, lng: 77.6480 },
    ],
  },
];

// BANGALORE URBAN GREEN RESERVES & PARKS
export const BANGALORE_PARKS = [
  {
    id: "cubbon-park",
    name: "Cubbon Park Botanical Reserve",
    type: "park",
    polygon: [
      { lat: 12.9790, lng: 77.5890 },
      { lat: 12.9790, lng: 77.5970 },
      { lat: 12.9710, lng: 77.5960 },
      { lat: 12.9720, lng: 77.5895 },
    ],
  },
  {
    id: "lalbagh-gardens",
    name: "Lalbagh Botanical Gardens",
    type: "park",
    polygon: [
      { lat: 12.9550, lng: 77.5820 },
      { lat: 12.9560, lng: 77.5910 },
      { lat: 12.9460, lng: 77.5900 },
      { lat: 12.9470, lng: 77.5815 },
    ],
  },
  {
    id: "iisc-campus-greens",
    name: "IISc Green Canopy Reserve",
    type: "park",
    polygon: [
      { lat: 13.0250, lng: 77.5640 },
      { lat: 13.0260, lng: 77.5740 },
      { lat: 13.0130, lng: 77.5730 },
      { lat: 13.0140, lng: 77.5630 },
    ],
  },
];

// BANGALORE PLANNING & ADMINISTRATIVE BOUNDARIES
export const BANGALORE_ADMIN_BOUNDARIES = [
  {
    id: "bbmp-core",
    name: "BBMP Municipal Planning Boundary",
    color: "rgba(59, 130, 246, 0.45)",
    polygon: [
      { lat: 13.0700, lng: 77.5200 },
      { lat: 13.0800, lng: 77.6700 },
      { lat: 12.9800, lng: 77.7100 },
      { lat: 12.8700, lng: 77.6800 },
      { lat: 12.8800, lng: 77.5200 },
      { lat: 12.9800, lng: 77.4900 },
    ],
  },
];

// Architectural Building Types available for Apartment & Tower Planner
export const ARCHITECTURAL_BUILDING_TYPES = [
  {
    id: "apartment-block",
    name: "Signature Apartment Block",
    category: "Apartment Block",
    defaultFloors: 14,
    defaultFloorHeight: 3.2,
    defaultHeight: 45,
    defaultWidth: 46,
    defaultDepth: 24,
    defaultLength: 24,
    unitsPerFloor: 6,
    defaultUnits: 84,
    defaultMaterial: "precast-concrete",
    defaultFacadeStyle: "balcony-terraces",
    defaultGlassPercentage: 55,
    defaultOpacity: 0.95,
    glassColor: "#38bdf8",
    concreteColor: "#e2e8f0",
    balconies: true,
    footprintSqFt: 11880,
    buaSqFt: 166320,
    thumbIcon: "🏬",
    description: "Mid-rise residential apartment block featuring rhythmic balcony projections, cross-ventilation corridors, and ground-level reception lobby.",
  },
  {
    id: "residential-tower",
    name: "Tower A (Residential Tower)",
    category: "Residential Tower",
    defaultFloors: 25,
    defaultFloorHeight: 3.2,
    defaultHeight: 80,
    defaultWidth: 34,
    defaultDepth: 32,
    defaultLength: 32,
    unitsPerFloor: 8,
    defaultUnits: 200,
    defaultMaterial: "bronze-glass",
    defaultFacadeStyle: "curtain-wall",
    defaultGlassPercentage: 75,
    defaultOpacity: 0.90,
    glassColor: "#c5a059",
    concreteColor: "#1e293b",
    spire: true,
    balconies: true,
    footprintSqFt: 11700,
    buaSqFt: 292500,
    thumbIcon: "🏙️",
    description: "Premium high-rise residential tower with floor-to-ceiling panoramic corner glazing, private sky decks, and illuminated crown.",
  },
  {
    id: "commercial-building",
    name: "Nexus Commercial Complex",
    category: "Commercial Building",
    defaultFloors: 18,
    defaultFloorHeight: 3.8,
    defaultHeight: 68,
    defaultWidth: 52,
    defaultDepth: 38,
    defaultLength: 38,
    unitsPerFloor: 2,
    defaultUnits: 36,
    defaultMaterial: "glass-steel",
    defaultFacadeStyle: "curtain-wall",
    defaultGlassPercentage: 90,
    defaultOpacity: 0.88,
    glassColor: "#0284c7",
    concreteColor: "#334155",
    footprintSqFt: 21270,
    buaSqFt: 382860,
    thumbIcon: "🏢",
    description: "Grade-A corporate office building with column-free floor plates, structural low-E glass facade, and double-height entrance atrium.",
  },
  {
    id: "mixed-use-tower",
    name: "Vertex Mixed-Use Tower",
    category: "Mixed-Use Tower",
    defaultFloors: 34,
    defaultFloorHeight: 3.5,
    defaultHeight: 119,
    defaultWidth: 42,
    defaultDepth: 36,
    defaultLength: 36,
    unitsPerFloor: 4,
    defaultUnits: 136,
    defaultMaterial: "glass-steel",
    defaultFacadeStyle: "modular-grid",
    defaultGlassPercentage: 80,
    defaultOpacity: 0.92,
    glassColor: "#0ea5e9",
    concreteColor: "#475569",
    podiumHeight: 12,
    podiumWidthScale: 1.25,
    footprintSqFt: 16270,
    buaSqFt: 553180,
    thumbIcon: "🏗️",
    description: "Dynamic mixed-use vertical urban community with retail/dining podium, mid-tower sky garden terrace, and luxury residences above.",
  },
  {
    id: "clubhouse",
    name: "Aura Lifestyle Clubhouse",
    category: "Clubhouse",
    defaultFloors: 3,
    defaultFloorHeight: 4.5,
    defaultHeight: 14,
    defaultWidth: 40,
    defaultDepth: 28,
    defaultLength: 28,
    unitsPerFloor: 1,
    defaultUnits: 3,
    defaultMaterial: "timber-stucco",
    defaultFacadeStyle: "curtain-wall",
    defaultGlassPercentage: 65,
    defaultOpacity: 0.95,
    glassColor: "#818cf8",
    concreteColor: "#f8fafc",
    canopy: true,
    pool: true,
    footprintSqFt: 12050,
    buaSqFt: 36150,
    thumbIcon: "🏛️",
    description: "Contemporary community clubhouse with indoor sports pavilion, banquet hall, health spa, and landscaped infinity pool deck.",
  },
  {
    id: "parking-structure",
    name: "Multi-Level Car Parking (MLCP)",
    category: "Parking Structure",
    defaultFloors: 6,
    defaultFloorHeight: 3.0,
    defaultHeight: 18,
    defaultWidth: 48,
    defaultDepth: 34,
    defaultLength: 34,
    unitsPerFloor: 60,
    defaultUnits: 360,
    defaultMaterial: "slate-granite",
    defaultFacadeStyle: "ribbed-louvers",
    defaultGlassPercentage: 20,
    defaultOpacity: 0.98,
    glassColor: "#64748b",
    concreteColor: "#334155",
    footprintSqFt: 17560,
    buaSqFt: 105360,
    thumbIcon: "🅿️",
    description: "Multi-level parking facility with natural cross-ventilation aluminum louver screens, EV charging stations, and rooftop canopy.",
  },
  {
    id: "modern-villa",
    name: "Zenith Signature Villa",
    category: "Private Luxury Villa",
    defaultFloors: 3,
    defaultFloorHeight: 3.8,
    defaultHeight: 12,
    defaultWidth: 22,
    defaultDepth: 18,
    defaultLength: 18,
    unitsPerFloor: 1,
    defaultUnits: 1,
    defaultMaterial: "timber-stucco",
    defaultFacadeStyle: "balcony-terraces",
    defaultGlassPercentage: 60,
    defaultOpacity: 0.95,
    glassColor: "#38bdf8",
    concreteColor: "#f1f5f9",
    accentColor: "#d97706",
    balconies: true,
    pool: true,
    footprintSqFt: 4260,
    buaSqFt: 12780,
    thumbIcon: "🏡",
    description: "Contemporary G+2 luxury villa with cantilevered architectural overhangs, double-height floor-to-ceiling glass, and private plunge pool.",
  },
  {
    id: "landscape-plaza",
    name: "Central Park & Amenities",
    category: "Landscape & Open Space",
    defaultFloors: 1,
    defaultFloorHeight: 2.0,
    defaultHeight: 2,
    defaultWidth: 40,
    defaultDepth: 40,
    defaultLength: 40,
    unitsPerFloor: 0,
    defaultUnits: 0,
    defaultMaterial: "precast-concrete",
    defaultFacadeStyle: "curtain-wall",
    defaultGlassPercentage: 10,
    defaultOpacity: 0.90,
    glassColor: "#059669",
    isLandscape: true,
    pool: true,
    footprintSqFt: 17200,
    buaSqFt: 0,
    thumbIcon: "🌳",
    description: "Curated green central promenade featuring native Bengaluru trees, jogging tracks, water fountain, and amphitheater.",
  },
];

// Architectural Material Presets for Visualization
export const ARCHITECTURAL_MATERIALS = [
  { id: "precast-concrete", name: "Precast Concrete", glassColor: "#38bdf8", concreteColor: "#e2e8f0", icon: "🧱" },
  { id: "glass-steel", name: "Glass & Steel", glassColor: "#0284c7", concreteColor: "#334155", icon: "🪟" },
  { id: "bronze-glass", name: "Bronze Reflective Glass", glassColor: "#c5a059", concreteColor: "#1e293b", icon: "✨" },
  { id: "slate-granite", name: "Slate & Granite", glassColor: "#64748b", concreteColor: "#1e293b", icon: "🪨" },
  { id: "timber-stucco", name: "Timber & Stucco", glassColor: "#818cf8", concreteColor: "#f8fafc", icon: "🪵" },
  { id: "terracotta", name: "Terracotta Ceramic", glassColor: "#f97316", concreteColor: "#9a3412", icon: "🏛️" },
];

// Facade Style Presets
export const FACADE_STYLES = [
  { id: "curtain-wall", name: "Curtain Wall", icon: "🪟" },
  { id: "balcony-terraces", name: "Balcony Terraces", icon: "🏢" },
  { id: "modular-grid", name: "Modular Grid", icon: "▦" },
  { id: "ribbed-louvers", name: "Ribbed Louvers", icon: "▥" },
  { id: "minimalist", name: "Minimalist Frameless", icon: "◻" },
];

// Helper to normalize and ensure any building object has complete editable parameters
export function normalizeBuilding(bld) {
  if (!bld) return null;
  const typeDef = ARCHITECTURAL_BUILDING_TYPES.find((t) => t.id === bld.typeId) || ARCHITECTURAL_BUILDING_TYPES[0];
  const floorHeight = bld.floorHeight ?? typeDef.defaultFloorHeight ?? 3.2;
  const floors = bld.floors ?? (bld.height ? Math.max(1, Math.round(bld.height / floorHeight)) : typeDef.defaultFloors || 25);
  const height = bld.height ?? parseFloat((floors * floorHeight).toFixed(1));
  const width = bld.width ?? (typeDef.defaultWidth || 34) * (bld.scaleX || bld.scale || 1.0);
  const length = bld.length ?? bld.depth ?? (typeDef.defaultLength || typeDef.defaultDepth || 32) * (bld.scaleY || bld.scale || 1.0);
  const unitsPerFloor = bld.unitsPerFloor ?? typeDef.unitsPerFloor ?? 8;
  const units = bld.units ?? Math.round(floors * unitsPerFloor);
  const buaSqFt = bld.buaSqFt ?? Math.round(width * length * 10.7639 * floors);
  const opacity = bld.opacity ?? typeDef.defaultOpacity ?? 0.90;
  const material = bld.material ?? typeDef.defaultMaterial ?? "glass-steel";
  const facadeStyle = bld.facadeStyle ?? typeDef.defaultFacadeStyle ?? "curtain-wall";
  const glassPercentage = bld.glassPercentage ?? typeDef.defaultGlassPercentage ?? 75;
  const shadow = bld.shadow !== false;
  const wireframe = bld.wireframe === true;
  const rotation = bld.rotationZ ?? bld.rotation ?? 0;
  const elevation = bld.elevation ?? 0;

  return {
    ...bld,
    floors,
    floorHeight,
    height,
    width,
    length,
    depth: length,
    unitsPerFloor,
    units,
    buaSqFt,
    opacity,
    material,
    facadeStyle,
    glassPercentage,
    shadow,
    wireframe,
    rotation,
    rotationZ: rotation,
    elevation,
  };
}

// Masterplan configuration generator for a site
export function generateMasterplan(siteId, centerLat, centerLng) {
  const latDelta = 0.00045; // ~50m
  const lngDelta = 0.00045; // ~50m

  let rawList = [];

  switch (siteId) {
    case "devanahalli-aerotropolis":
      rawList = [
        {
          id: "bld-dev-1",
          typeId: "commercial-building",
          name: "Aura Tower Alpha (HQ)",
          lat: centerLat + latDelta * 0.8,
          lng: centerLng - lngDelta * 0.9,
          floors: 36,
          floorHeight: 3.8,
          height: 136.8,
          width: 52,
          length: 38,
          rotation: 25,
          elevation: 0,
          material: "glass-steel",
          facadeStyle: "curtain-wall",
          glassPercentage: 90,
          color: "#38bdf8",
        },
        {
          id: "bld-dev-2",
          typeId: "commercial-building",
          name: "Aura Tower Beta",
          lat: centerLat + latDelta * 0.8,
          lng: centerLng + lngDelta * 0.9,
          floors: 30,
          floorHeight: 3.8,
          height: 114,
          width: 48,
          length: 36,
          rotation: 35,
          elevation: 0,
          material: "glass-steel",
          facadeStyle: "modular-grid",
          glassPercentage: 85,
          color: "#0284c7",
        },
        {
          id: "bld-dev-3",
          typeId: "clubhouse",
          name: "Aerotropolis Retail Pavilion",
          lat: centerLat - latDelta * 0.9,
          lng: centerLng,
          floors: 4,
          floorHeight: 4.5,
          height: 18,
          width: 42,
          length: 30,
          rotation: 0,
          elevation: 0,
          material: "timber-stucco",
          facadeStyle: "curtain-wall",
          glassPercentage: 70,
          color: "#818cf8",
        },
        {
          id: "bld-dev-4",
          typeId: "landscape-plaza",
          name: "Central Tech Promenade",
          lat: centerLat,
          lng: centerLng,
          floors: 1,
          floorHeight: 2.0,
          height: 2,
          width: 40,
          length: 40,
          rotation: 0,
          elevation: 0,
          color: "#059669",
        },
      ];
      break;

    case "whitefield-tech-villas":
      const villaOffsets = [
        { dLat: 0.8, dLng: -1.0 },
        { dLat: 0.8, dLng: 0.0 },
        { dLat: 0.8, dLng: 1.0 },
        { dLat: -0.1, dLng: -1.0 },
        { dLat: -0.1, dLng: 1.0 },
        { dLat: -0.9, dLng: -1.0 },
        { dLat: -0.9, dLng: 0.0 },
        { dLat: -0.9, dLng: 1.0 },
      ];
      rawList = villaOffsets.map((off, idx) => ({
        id: `bld-wf-v${idx + 1}`,
        typeId: "modern-villa",
        name: `Signature Villa #${101 + idx}`,
        lat: centerLat + off.dLat * latDelta * 0.85,
        lng: centerLng + off.dLng * lngDelta * 0.85,
        floors: 3,
        floorHeight: 3.8,
        height: 11.4,
        width: 22,
        length: 18,
        rotation: (idx % 2 === 0) ? 0 : 180,
        elevation: 0,
        material: "timber-stucco",
        facadeStyle: "balcony-terraces",
        glassPercentage: 60,
        color: "#38bdf8",
      }));
      rawList.push({
        id: "bld-wf-club",
        typeId: "clubhouse",
        name: "Residents Club & Infinity Pool",
        lat: centerLat - latDelta * 0.1,
        lng: centerLng,
        floors: 3,
        floorHeight: 4.5,
        height: 13.5,
        width: 40,
        length: 28,
        rotation: 0,
        elevation: 0,
        material: "timber-stucco",
        facadeStyle: "curtain-wall",
        glassPercentage: 65,
        color: "#818cf8",
      });
      break;

    case "bellandur-orr-towers":
      rawList = [
        {
          id: "bld-bel-1",
          typeId: "commercial-building",
          name: "ORR Prime Tower 1",
          lat: centerLat + latDelta * 0.6,
          lng: centerLng - lngDelta * 0.7,
          floors: 34,
          floorHeight: 3.8,
          height: 129.2,
          width: 52,
          length: 38,
          rotation: 40,
          elevation: 0,
          material: "glass-steel",
          facadeStyle: "curtain-wall",
          glassPercentage: 90,
          color: "#38bdf8",
        },
        {
          id: "bld-bel-2",
          typeId: "commercial-building",
          name: "ORR Prime Tower 2",
          lat: centerLat + latDelta * 0.6,
          lng: centerLng + lngDelta * 0.7,
          floors: 34,
          floorHeight: 3.8,
          height: 129.2,
          width: 52,
          length: 38,
          rotation: 40,
          elevation: 0,
          material: "glass-steel",
          facadeStyle: "curtain-wall",
          glassPercentage: 90,
          color: "#38bdf8",
        },
        {
          id: "bld-bel-3",
          typeId: "parking-structure",
          name: "ORR EV Car Park Hub",
          lat: centerLat - latDelta * 0.7,
          lng: centerLng,
          floors: 6,
          floorHeight: 3.0,
          height: 18,
          width: 48,
          length: 34,
          rotation: 40,
          elevation: 0,
          material: "slate-granite",
          facadeStyle: "ribbed-louvers",
          glassPercentage: 20,
          color: "#64748b",
        },
      ];
      break;

    case "hebbal-lakeview-enclave":
      rawList = [
        {
          id: "bld-heb-1",
          typeId: "residential-tower",
          name: "Lakeview Sky Tower Alpha",
          lat: centerLat + latDelta * 0.6,
          lng: centerLng - lngDelta * 0.8,
          floors: 32,
          floorHeight: 3.2,
          height: 102.4,
          width: 36,
          length: 32,
          rotation: 15,
          elevation: 0,
          material: "bronze-glass",
          facadeStyle: "curtain-wall",
          glassPercentage: 75,
          color: "#c5a059",
        },
        {
          id: "bld-heb-2",
          typeId: "residential-tower",
          name: "Lakeview Sky Tower Beta",
          lat: centerLat + latDelta * 0.6,
          lng: centerLng + lngDelta * 0.8,
          floors: 32,
          floorHeight: 3.2,
          height: 102.4,
          width: 36,
          length: 32,
          rotation: 15,
          elevation: 0,
          material: "bronze-glass",
          facadeStyle: "curtain-wall",
          glassPercentage: 75,
          color: "#c5a059",
        },
        {
          id: "bld-heb-3",
          typeId: "clubhouse",
          name: "Lakeside Deck & Club",
          lat: centerLat - latDelta * 0.7,
          lng: centerLng,
          floors: 3,
          floorHeight: 4.5,
          height: 13.5,
          width: 40,
          length: 28,
          rotation: 15,
          elevation: 0,
          material: "timber-stucco",
          facadeStyle: "curtain-wall",
          glassPercentage: 65,
          color: "#818cf8",
        },
      ];
      break;

    case "sarjapur-township":
    default:
      rawList = [
        {
          id: "bld-sar-1",
          typeId: "residential-tower",
          name: "Tower A",
          lat: centerLat + latDelta * 0.7,
          lng: centerLng - lngDelta * 0.8,
          floors: 25,
          floorHeight: 3.2,
          height: 80,
          width: 34,
          length: 32,
          rotation: 0,
          elevation: 0,
          unitsPerFloor: 8,
          units: 200,
          material: "bronze-glass",
          facadeStyle: "curtain-wall",
          glassPercentage: 75,
          color: "#c5a059",
        },
        {
          id: "bld-sar-2",
          typeId: "apartment-block",
          name: "Signature Apartment Block",
          lat: centerLat + latDelta * 0.7,
          lng: centerLng + lngDelta * 0.8,
          floors: 14,
          floorHeight: 3.2,
          height: 44.8,
          width: 46,
          length: 24,
          rotation: 90,
          elevation: 0,
          unitsPerFloor: 6,
          units: 84,
          material: "precast-concrete",
          facadeStyle: "balcony-terraces",
          glassPercentage: 55,
          color: "#38bdf8",
        },
        {
          id: "bld-sar-3",
          typeId: "commercial-building",
          name: "Tech Innovation Hub",
          lat: centerLat - latDelta * 0.8,
          lng: centerLng - lngDelta * 0.8,
          floors: 18,
          floorHeight: 3.8,
          height: 68.4,
          width: 52,
          length: 38,
          rotation: 0,
          elevation: 0,
          unitsPerFloor: 2,
          units: 36,
          material: "glass-steel",
          facadeStyle: "curtain-wall",
          glassPercentage: 90,
          color: "#0284c7",
        },
        {
          id: "bld-sar-4",
          typeId: "parking-structure",
          name: "Township Multi-Level Car Parking",
          lat: centerLat - latDelta * 0.8,
          lng: centerLng + lngDelta * 0.8,
          floors: 6,
          floorHeight: 3.0,
          height: 18,
          width: 48,
          length: 34,
          rotation: 0,
          elevation: 0,
          unitsPerFloor: 60,
          units: 360,
          material: "slate-granite",
          facadeStyle: "ribbed-louvers",
          glassPercentage: 20,
          color: "#64748b",
        },
        {
          id: "bld-sar-5",
          typeId: "landscape-plaza",
          name: "Central Eco-Greens",
          lat: centerLat,
          lng: centerLng,
          floors: 1,
          floorHeight: 2.0,
          height: 2,
          width: 40,
          length: 40,
          rotation: 0,
          elevation: 0,
          color: "#059669",
        },
      ];
      break;
  }

  return rawList.map((b) => normalizeBuilding(b));
}

// Calculate Area of Polygon Boundary in Square Feet & Acres
export function calculatePolygonAreaSqFt(boundary) {
  if (!boundary || boundary.length < 3) return 0;

  // Planar projection around Bengaluru (~13.0°N latitude)
  const latMeters = 110574; // meters per degree latitude
  const lngMeters = 111320 * Math.cos((13.0 * Math.PI) / 180); // ~108460 meters per degree longitude

  let areaSqMeters = 0;
  for (let i = 0; i < boundary.length; i++) {
    const j = (i + 1) % boundary.length;
    const x1 = boundary[i].lng * lngMeters;
    const y1 = boundary[i].lat * latMeters;
    const x2 = boundary[j].lng * lngMeters;
    const y2 = boundary[j].lat * latMeters;
    areaSqMeters += x1 * y2 - x2 * y1;
  }
  areaSqMeters = Math.abs(areaSqMeters) / 2;

  // 1 sq.meter = 10.7639 sq.ft
  return Math.round(areaSqMeters * 10.7639);
}

// Generate Realistic Surrounding Existing Context Buildings for Context & Height Comparison
export function generateContextBuildings(siteId, centerLat, centerLng) {
  const existing = [];
  const rings = [
    { radiusOffset: 0.0035, count: 6, minH: 14, maxH: 26 },
    { radiusOffset: 0.0055, count: 8, minH: 12, maxH: 34 },
  ];

  let bldIndex = 1;
  rings.forEach((ring) => {
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * Math.PI * 2 + ring.radiusOffset * 100;
      const bLat = centerLat + Math.sin(angle) * ring.radiusOffset * 0.85;
      const bLng = centerLng + Math.cos(angle) * ring.radiusOffset;
      const height = Math.round(
        ring.minH + Math.abs(Math.sin(i * 3)) * (ring.maxH - ring.minH)
      );
      const width = 25 + Math.round(Math.abs(Math.cos(i * 2)) * 20);
      const depth = 22 + Math.round(Math.abs(Math.sin(i * 4)) * 18);

      existing.push({
        id: `context-bld-${siteId}-${bldIndex}`,
        name: `Existing Context Structure #${bldIndex}`,
        lat: bLat,
        lng: bLng,
        width,
        depth,
        height,
        elevation: 0,
        rotation: Math.round(angle * (180 / Math.PI)),
        color: "#64748b", // Subtle architectural clay slate
      });
      bldIndex++;
    }
  });

  return existing;
}
