const DEFAULT_PAINT_COLOR = 0x0d2a45;

export const SPORTS_CAR_DIMENSIONS = Object.freeze({
  length: 5.28,
  width: 2.72,
  height: 1.56,
  wheelbase: 2.78,
  wheelRadius: 0.39,
  wheelWidth: 0.32,
  groundClearance: 0.18,
});

const DETAIL_CONFIG = Object.freeze({
  low: Object.freeze({
    wheelSegments: 16,
    rimSegments: 10,
    fenderSegments: 12,
    lightSegments: 8,
    includeFenders: false,
    includeWing: true,
    includeMirrors: false,
    includePanelDetails: false,
    includeSuspension: false,
  }),
  medium: Object.freeze({
    wheelSegments: 24,
    rimSegments: 16,
    fenderSegments: 18,
    lightSegments: 12,
    includeFenders: true,
    includeWing: true,
    includeMirrors: true,
    includePanelDetails: true,
    includeSuspension: true,
  }),
  high: Object.freeze({
    wheelSegments: 40,
    rimSegments: 24,
    fenderSegments: 28,
    lightSegments: 18,
    includeFenders: true,
    includeWing: true,
    includeMirrors: true,
    includePanelDetails: true,
    includeSuspension: true,
  }),
});

const VEHICLE_PROFILES = Object.freeze([
  Object.freeze({
    name: "Apex",
    wheelStyle: "Y-spoke",
    spokeCount: 5,
    spokeTwist: 0,
    wingWidth: 2.12,
    wingHeight: 1.29,
    wingDepth: 0.19,
    wingSupportHeight: 0.31,
    hull: Object.freeze([
      { z: -2.54, width: 0.35, base: 0.30, top: 0.56 },
      { z: -2.34, width: 0.63, base: 0.28, top: 0.65 },
      { z: -1.98, width: 0.83, base: 0.25, top: 0.73 },
      { z: -1.42, width: 0.99, base: 0.23, top: 0.80 },
      { z: -0.84, width: 1.03, base: 0.24, top: 0.85 },
      { z: -0.26, width: 1.07, base: 0.27, top: 0.90 },
      { z: 0.38, width: 1.12, base: 0.27, top: 0.91 },
      { z: 0.96, width: 1.14, base: 0.25, top: 0.88 },
      { z: 1.54, width: 1.13, base: 0.25, top: 0.84 },
      { z: 2.12, width: 1.08, base: 0.28, top: 0.78 },
      { z: 2.45, width: 0.92, base: 0.31, top: 0.70 },
      { z: 2.54, width: 0.58, base: 0.33, top: 0.60 },
    ]),
    cabin: Object.freeze([
      { z: -0.91, width: 0.54, base: 0.82, top: 1.02 },
      { z: -0.65, width: 0.66, base: 0.81, top: 1.27 },
      { z: -0.27, width: 0.72, base: 0.81, top: 1.44 },
      { z: 0.20, width: 0.71, base: 0.81, top: 1.48 },
      { z: 0.65, width: 0.62, base: 0.79, top: 1.37 },
      { z: 1.02, width: 0.39, base: 0.77, top: 1.00 },
    ]),
  }),
  Object.freeze({
    name: "GrandTourer",
    wheelStyle: "split-spoke",
    spokeCount: 10,
    spokeTwist: 0.035,
    wingWidth: 2.06,
    wingHeight: 1.14,
    wingDepth: 0.16,
    wingSupportHeight: 0.16,
    hull: Object.freeze([
      { z: -2.54, width: 0.42, base: 0.32, top: 0.58 },
      { z: -2.32, width: 0.70, base: 0.29, top: 0.68 },
      { z: -1.96, width: 0.89, base: 0.27, top: 0.76 },
      { z: -1.40, width: 1.02, base: 0.24, top: 0.83 },
      { z: -0.83, width: 1.06, base: 0.25, top: 0.88 },
      { z: -0.24, width: 1.10, base: 0.28, top: 0.92 },
      { z: 0.40, width: 1.13, base: 0.28, top: 0.94 },
      { z: 0.98, width: 1.14, base: 0.26, top: 0.91 },
      { z: 1.56, width: 1.13, base: 0.26, top: 0.88 },
      { z: 2.14, width: 1.08, base: 0.29, top: 0.82 },
      { z: 2.46, width: 0.93, base: 0.32, top: 0.73 },
      { z: 2.54, width: 0.61, base: 0.34, top: 0.62 },
    ]),
    cabin: Object.freeze([
      { z: -1.03, width: 0.53, base: 0.85, top: 1.02 },
      { z: -0.72, width: 0.65, base: 0.84, top: 1.30 },
      { z: -0.30, width: 0.73, base: 0.84, top: 1.47 },
      { z: 0.18, width: 0.72, base: 0.84, top: 1.50 },
      { z: 0.68, width: 0.64, base: 0.82, top: 1.39 },
      { z: 1.12, width: 0.41, base: 0.79, top: 1.00 },
    ]),
  }),
  Object.freeze({
    name: "HyperWedge",
    wheelStyle: "turbine",
    spokeCount: 8,
    spokeTwist: 0.24,
    wingWidth: 2.22,
    wingHeight: 1.34,
    wingDepth: 0.20,
    wingSupportHeight: 0.34,
    hull: Object.freeze([
      { z: -2.54, width: 0.30, base: 0.28, top: 0.52 },
      { z: -2.34, width: 0.58, base: 0.26, top: 0.61 },
      { z: -1.98, width: 0.81, base: 0.23, top: 0.70 },
      { z: -1.42, width: 1.00, base: 0.22, top: 0.78 },
      { z: -0.84, width: 1.05, base: 0.23, top: 0.83 },
      { z: -0.25, width: 1.09, base: 0.26, top: 0.88 },
      { z: 0.39, width: 1.15, base: 0.26, top: 0.89 },
      { z: 0.98, width: 1.17, base: 0.24, top: 0.86 },
      { z: 1.56, width: 1.16, base: 0.24, top: 0.82 },
      { z: 2.14, width: 1.09, base: 0.27, top: 0.76 },
      { z: 2.46, width: 0.91, base: 0.30, top: 0.68 },
      { z: 2.54, width: 0.56, base: 0.32, top: 0.58 },
    ]),
    cabin: Object.freeze([
      { z: -0.85, width: 0.56, base: 0.79, top: 0.99 },
      { z: -0.57, width: 0.68, base: 0.79, top: 1.24 },
      { z: -0.20, width: 0.74, base: 0.79, top: 1.39 },
      { z: 0.24, width: 0.70, base: 0.79, top: 1.43 },
      { z: 0.67, width: 0.59, base: 0.77, top: 1.32 },
      { z: 1.01, width: 0.37, base: 0.75, top: 0.98 },
    ]),
  }),
]);

const LIVERIES = Object.freeze([
  Object.freeze({ name: "cyan", accent: 0x31dce3, secondary: 0xf2fbff, stripe: "single" }),
  Object.freeze({ name: "silver", accent: 0xeaf0f3, secondary: 0xc92d48, stripe: "double" }),
  Object.freeze({ name: "electric", accent: 0x5e9dff, secondary: 0xf5f8ff, stripe: "offset" }),
  Object.freeze({ name: "amber", accent: 0xffb547, secondary: 0x15202b, stripe: "double" }),
  Object.freeze({ name: "crimson", accent: 0xf04458, secondary: 0xf6efe5, stripe: "offset" }),
  Object.freeze({ name: "violet", accent: 0xb47aff, secondary: 0x23d4d6, stripe: "single" }),
]);
const GEOMETRY_CACHE = new WeakMap();
const MATERIAL_CACHE = new WeakMap();

function assertThree(THREE) {
  if (!THREE || typeof THREE !== "object"
    || typeof THREE.Group !== "function"
    || typeof THREE.Mesh !== "function"
    || typeof THREE.Box3 !== "function"
    || typeof THREE.BufferGeometry !== "function") {
    throw new TypeError("createSportsCar requer a namespace real do Three.js.");
  }
}

function normalizeDetailLevel(detailLevel) {
  if (typeof detailLevel === "number") {
    if (detailLevel <= 0.33) return "low";
    if (detailLevel >= 0.67) return "high";
    return "medium";
  }
  if (typeof detailLevel === "string" && DETAIL_CONFIG[detailLevel.toLowerCase()]) {
    return detailLevel.toLowerCase();
  }
  return "high";
}

function normalizeLivery(livery) {
  if (Number.isFinite(livery)) {
    return ((Math.trunc(livery) % LIVERIES.length) + LIVERIES.length) % LIVERIES.length;
  }
  if (typeof livery === "string") {
    const normalized = livery.toLowerCase();
    const index = LIVERIES.findIndex((entry) => entry.name.toLowerCase() === normalized);
    if (index >= 0) return index;
    if (normalized === "white") return 1;
    if (normalized === "blue") return 2;
  }
  return 0;
}

function resolveColor(THREE, value, fallback) {
  const color = new THREE.Color(value ?? fallback);
  if (![color.r, color.g, color.b].every(Number.isFinite)) {
    throw new TypeError("paintColor precisa ser uma cor Three.js válida.");
  }
  return color.getHex();
}

function getCache(cacheMap, THREE) {
  let cache = cacheMap.get(THREE);
  if (!cache) {
    cache = new Map();
    cacheMap.set(THREE, cache);
  }
  return cache;
}

function cached(cache, key, create) {
  let value = cache.get(key);
  if (!value) {
    value = create();
    cache.set(key, value);
  }
  return value;
}

function selectStations(stations, detailLevel) {
  if (detailLevel === "high") return stations;
  const count = Math.max(5, Math.ceil(stations.length * (detailLevel === "low" ? 0.52 : 0.72)));
  const selected = [];
  for (let index = 0; index < count; index += 1) {
    const station = stations[Math.round(index * (stations.length - 1) / (count - 1))];
    if (selected.at(-1) !== station) selected.push(station);
  }
  return selected;
}

function createSectionGeometry(THREE, stations) {
  const positions = [];
  const indices = [];
  const ringSize = 12;

  for (const station of stations) {
    const height = station.top - station.base;
    positions.push(
      -station.width, station.base, station.z,
      -station.width * 0.99, station.base + height * 0.40, station.z,
      -station.width * 0.91, station.top - height * 0.18, station.z,
      -station.width * 0.66, station.top - height * 0.055, station.z,
      -station.width * 0.31, station.top - height * 0.012, station.z,
      0, station.top, station.z,
      station.width * 0.31, station.top - height * 0.012, station.z,
      station.width * 0.66, station.top - height * 0.055, station.z,
      station.width * 0.91, station.top - height * 0.18, station.z,
      station.width * 0.99, station.base + height * 0.40, station.z,
      station.width, station.base, station.z,
      0, station.base, station.z,
    );
  }

  for (let stationIndex = 0; stationIndex < stations.length - 1; stationIndex += 1) {
    const current = stationIndex * ringSize;
    const next = (stationIndex + 1) * ringSize;
    for (let ringIndex = 0; ringIndex < ringSize; ringIndex += 1) {
      const nextRingIndex = (ringIndex + 1) % ringSize;
      const a = current + ringIndex;
      const b = current + nextRingIndex;
      const c = next + nextRingIndex;
      const d = next + ringIndex;
      indices.push(a, d, b, b, d, c);
    }
  }

  const firstCap = positions.length / 3;
  const first = stations[0];
  positions.push(0, (first.base + first.top) / 2, first.z);
  const lastCap = positions.length / 3;
  const last = stations[stations.length - 1];
  positions.push(0, (last.base + last.top) / 2, last.z);

  for (let ringIndex = 0; ringIndex < ringSize; ringIndex += 1) {
    const nextRingIndex = (ringIndex + 1) % ringSize;
    indices.push(firstCap, ringIndex, nextRingIndex);
    const lastRing = (stations.length - 1) * ringSize;
    indices.push(lastCap, lastRing + nextRingIndex, lastRing + ringIndex);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function topAt(stations, z) {
  for (let index = 0; index < stations.length - 1; index += 1) {
    const a = stations[index];
    const b = stations[index + 1];
    if (z < a.z || z > b.z) continue;
    const ratio = (z - a.z) / (b.z - a.z);
    return a.top + (b.top - a.top) * ratio;
  }
  return stations[z <= stations[0].z ? 0 : stations.length - 1].top;
}

function createTopStripeGeometry(THREE, stations, centerX, width, minZ, maxZ) {
  const samples = stations.filter((station) => station.z >= minZ && station.z <= maxZ);
  samples.unshift({ z: minZ });
  samples.push({ z: maxZ });
  const positions = [];
  const indices = [];
  for (const sample of samples) {
    const edgeWidth = Math.min(width, Math.max(0.025, (topAt(stations, sample.z) - 0.20) * 0.62));
    const y = topAt(stations, sample.z) + 0.014;
    positions.push(centerX - edgeWidth / 2, y, sample.z, centerX + edgeWidth / 2, y, sample.z);
  }
  for (let index = 0; index < samples.length - 1; index += 1) {
    const a = index * 2;
    const next = a + 2;
    indices.push(a, next, a + 1, a + 1, next, next + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
}

function createWheelSpokesGeometry(THREE, count, width, depth, twist) {
  const source = new THREE.BoxGeometry(depth, 0.29, width).toNonIndexed();
  const sourcePositions = source.getAttribute("position");
  const positions = [];
  for (let spoke = 0; spoke < count; spoke += 1) {
    const angle = Math.PI * 2 * spoke / count + twist;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    for (let vertex = 0; vertex < sourcePositions.count; vertex += 1) {
      const x = sourcePositions.getX(vertex);
      const radial = sourcePositions.getY(vertex) + 0.145;
      const tangent = sourcePositions.getZ(vertex);
      positions.push(x, radial * cos - tangent * sin, radial * sin + tangent * cos);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
}

function createGeometrySet(THREE, detailLevel, profileIndex) {
  const detail = DETAIL_CONFIG[detailLevel];
  const profile = VEHICLE_PROFILES[profileIndex];
  const spokeCount = Math.max(4, Math.round(profile.spokeCount * (detailLevel === "low" ? 0.6 : detailLevel === "medium" ? 0.8 : 1)));
  const geometryCache = getCache(GEOMETRY_CACHE, THREE);
  const hullStations = selectStations(profile.hull, detailLevel);
  const cabinStations = selectStations(profile.cabin, detailLevel);
  return {
    hull: cached(geometryCache, `hull-${profileIndex}-${detailLevel}`, () => createSectionGeometry(THREE, hullStations)),
    cabin: cached(geometryCache, `cabin-${profileIndex}-${detailLevel}`, () => createSectionGeometry(THREE, cabinStations)),
    roof: cached(geometryCache, `roof-${profileIndex}`, () => new THREE.BoxGeometry(0.96, 0.09, 0.78)),
    roofStripe: cached(geometryCache, `roof-stripe-${profileIndex}`, () => new THREE.BoxGeometry(0.075, 0.014, 0.56)),
    stripe: cached(geometryCache, `stripe-${profileIndex}-center`, () => createTopStripeGeometry(THREE, hullStations, 0, 0.24, -2.46, -1.04)),
    stripeOffset: cached(geometryCache, `stripe-${profileIndex}-offset`, () => createTopStripeGeometry(THREE, hullStations, 0.28, 0.13, -2.43, -1.06)),
    stripeSecond: cached(geometryCache, `stripe-${profileIndex}-second`, () => createTopStripeGeometry(THREE, hullStations, -0.28, 0.13, -2.43, -1.06)),
    tire: cached(geometryCache, `tire-${detailLevel}`, () => new THREE.CylinderGeometry(
      SPORTS_CAR_DIMENSIONS.wheelRadius,
      SPORTS_CAR_DIMENSIONS.wheelRadius,
      SPORTS_CAR_DIMENSIONS.wheelWidth,
      detail.wheelSegments,
      1,
      false,
    )),
    rim: cached(geometryCache, `rim-${detailLevel}`, () => new THREE.CylinderGeometry(0.27, 0.27, 0.034, detail.rimSegments)),
    brake: cached(geometryCache, `brake-${detailLevel}`, () => new THREE.CylinderGeometry(0.226, 0.226, 0.022, detail.rimSegments)),
    hub: cached(geometryCache, `hub-${detailLevel}`, () => new THREE.CylinderGeometry(0.085, 0.085, 0.042, Math.max(8, detail.rimSegments))),
    rimLip: cached(geometryCache, `rim-lip-${detailLevel}`, () => new THREE.TorusGeometry(0.269, 0.014, 6, detail.rimSegments)),
    fender: cached(geometryCache, `fender-${detailLevel}`, () => new THREE.TorusGeometry(0.405, 0.032, 7, detail.fenderSegments)),
    headlight: cached(geometryCache, `headlight-${detailLevel}`, () => new THREE.BoxGeometry(0.48, 0.12, 0.035)),
    frontSplitter: cached(geometryCache, "front-splitter", () => new THREE.BoxGeometry(1.88, 0.075, 0.16)),
    rearDiffuser: cached(geometryCache, "rear-diffuser", () => new THREE.BoxGeometry(1.76, 0.14, 0.20)),
    sill: cached(geometryCache, "side-sill", () => new THREE.BoxGeometry(0.075, 0.15, 1.72)),
    wing: cached(geometryCache, `wing-${profileIndex}`, () => new THREE.BoxGeometry(profile.wingWidth, 0.095, profile.wingDepth)),
    wingLip: cached(geometryCache, `wing-lip-${profileIndex}`, () => new THREE.BoxGeometry(profile.wingWidth * 0.92, 0.045, 0.035)),
    wingSupport: cached(geometryCache, `wing-support-${profileIndex}`, () => new THREE.BoxGeometry(0.075, profile.wingSupportHeight, 0.075)),
    mirror: cached(geometryCache, `mirror-${detailLevel}`, () => new THREE.SphereGeometry(0.115, detail.lightSegments, Math.max(5, Math.floor(detail.lightSegments / 2)))),
    vent: cached(geometryCache, "hood-vent", () => new THREE.BoxGeometry(0.14, 0.025, 0.40)),
    sideVent: cached(geometryCache, "side-vent", () => new THREE.BoxGeometry(0.035, 0.11, 0.30)),
    windowFrame: cached(geometryCache, "window-frame", () => new THREE.BoxGeometry(0.065, 0.34, 0.075)),
    panelLine: cached(geometryCache, "panel-line", () => new THREE.BoxGeometry(0.018, 0.018, 0.92)),
    diffuserFin: cached(geometryCache, "diffuser-fin", () => new THREE.BoxGeometry(0.055, 0.15, 0.19)),
    tailLight: cached(geometryCache, "tail-light", () => new THREE.BoxGeometry(1.34, 0.075, 0.045)),
    grille: cached(geometryCache, "front-grille", () => new THREE.BoxGeometry(0.66, 0.095, 0.025)),
    spoke: cached(geometryCache, `wheel-spoke-${profileIndex}-${detailLevel}`, () => createWheelSpokesGeometry(
      THREE,
      spokeCount,
      profile.wheelStyle === "split-spoke" ? 0.032 : profile.wheelStyle === "turbine" ? 0.055 : 0.045,
      profile.wheelStyle === "turbine" ? 0.062 : 0.042,
      profile.wheelStyle === "turbine" ? profile.spokeTwist : 0,
    )),
    caliper: cached(geometryCache, "brake-caliper", () => new THREE.BoxGeometry(0.075, 0.17, 0.09)),
    strut: cached(geometryCache, "suspension-strut", () => new THREE.CylinderGeometry(0.025, 0.025, 1, 6)),
    suspensionLink: cached(geometryCache, "suspension-link", () => new THREE.CylinderGeometry(0.018, 0.018, 1, 6)),
    doorHandle: cached(geometryCache, "door-handle", () => new THREE.BoxGeometry(0.075, 0.035, 0.18)),
    sideAccent: cached(geometryCache, "side-accent", () => new THREE.BoxGeometry(0.028, 0.045, 1.18)),
    rearVent: cached(geometryCache, "rear-deck-vent", () => new THREE.BoxGeometry(0.11, 0.025, 0.34)),
  };
}

function createMaterials(THREE, paintHex, liveryIndex) {
  const materialCache = getCache(MATERIAL_CACHE, THREE);
  const key = `${paintHex.toString(16)}-${liveryIndex}`;
  return cached(materialCache, key, () => {
    const livery = LIVERIES[liveryIndex] ?? LIVERIES[0];
    return {
      paint: new THREE.MeshPhysicalMaterial({
        color: paintHex,
        metalness: 0.72,
        roughness: 0.19,
        clearcoat: 1,
        clearcoatRoughness: 0.085,
      }),
      accent: new THREE.MeshPhysicalMaterial({
        color: livery.accent,
        metalness: 0.62,
        roughness: 0.18,
        clearcoat: 0.96,
        clearcoatRoughness: 0.10,
      }),
      secondary: new THREE.MeshPhysicalMaterial({
        color: livery.secondary,
        metalness: 0.34,
        roughness: 0.24,
        clearcoat: 0.82,
        clearcoatRoughness: 0.13,
      }),
      carbon: new THREE.MeshStandardMaterial({ color: 0x091017, metalness: 0.54, roughness: 0.38 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0x101d2a,
        metalness: 0.34,
        roughness: 0.13,
        clearcoat: 1,
        clearcoatRoughness: 0.055,
        transmission: 0.08,
        transparent: true,
        opacity: 0.94,
        side: THREE.DoubleSide,
      }),
      tire: new THREE.MeshStandardMaterial({ color: 0x101216, metalness: 0.025, roughness: 0.94 }),
      sidewall: new THREE.MeshStandardMaterial({ color: 0x1b1e22, metalness: 0.04, roughness: 0.78 }),
      rim: new THREE.MeshPhysicalMaterial({ color: 0xc6d0d6, metalness: 0.94, roughness: 0.16, clearcoat: 0.76 }),
      rimDark: new THREE.MeshStandardMaterial({ color: 0x17212a, metalness: 0.82, roughness: 0.28 }),
      brake: new THREE.MeshStandardMaterial({ color: 0x69747b, metalness: 0.86, roughness: 0.34 }),
      caliper: new THREE.MeshStandardMaterial({ color: livery.accent, metalness: 0.52, roughness: 0.31 }),
      light: new THREE.MeshPhysicalMaterial({
        color: 0xf4fbff,
        emissive: 0x68c9ee,
        emissiveIntensity: 1.4,
        metalness: 0.15,
        roughness: 0.12,
      }),
      tail: new THREE.MeshPhysicalMaterial({
        color: 0xff334d,
        emissive: 0xb40b2e,
        emissiveIntensity: 1.15,
        metalness: 0.12,
        roughness: 0.20,
      }),
    };
  });
}

function addMesh(THREE, parent, geometry, material, name, position = null, rotation = null, scale = null) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.userData.role = name;
  if (position) mesh.position.set(position[0], position[1], position[2]);
  if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addWheels(THREE, root, geometry, materials, detailLevel) {
  const wheels = [];
  const detail = DETAIL_CONFIG[detailLevel];
  const wheelLayout = [
    { side: -1, axle: "front", z: -SPORTS_CAR_DIMENSIONS.wheelbase / 2 },
    { side: 1, axle: "front", z: -SPORTS_CAR_DIMENSIONS.wheelbase / 2 },
    { side: -1, axle: "rear", z: SPORTS_CAR_DIMENSIONS.wheelbase / 2 },
    { side: 1, axle: "rear", z: SPORTS_CAR_DIMENSIONS.wheelbase / 2 },
  ];

  for (const [index, layout] of wheelLayout.entries()) {
    const wheel = new THREE.Group();
    wheel.name = `wheel-${layout.axle}-${layout.side < 0 ? "left" : "right"}`;
    wheel.userData.role = "wheel";
    wheel.userData.axle = layout.axle;
    wheel.userData.localForwardAxis = "-Z";
    wheel.position.set(layout.side * 1.055, SPORTS_CAR_DIMENSIONS.wheelRadius, layout.z);

    const tire = addMesh(THREE, wheel, geometry.tire, materials.tire, `tire-${index}`, null, [0, 0, Math.PI / 2]);
    tire.userData.role = "tire";
    addMesh(THREE, wheel, geometry.rimLip, materials.sidewall, `tire-sidewall-${index}`, [layout.side * 0.166, 0, 0], [0, Math.PI / 2, 0]);
    const brake = addMesh(THREE, wheel, geometry.brake, materials.brake, `brake-disc-${index}`, [layout.side * 0.151, 0, 0], [0, 0, Math.PI / 2]);
    brake.userData.role = "brake-disc";
    const rim = addMesh(THREE, wheel, geometry.rim, materials.rim, `rim-${index}`, [layout.side * 0.174, 0, 0], [0, 0, Math.PI / 2]);
    rim.userData.role = "rim";
    const rimDark = addMesh(THREE, wheel, geometry.rim, materials.rimDark, `rim-inset-${index}`, [layout.side * 0.181, 0, 0], [0, 0, Math.PI / 2], [0.82, 0.82, 0.82]);
    rimDark.userData.role = "rim-inset";
    const caliper = addMesh(THREE, wheel, geometry.caliper, materials.caliper, `brake-caliper-${index}`, [layout.side * 0.125, 0.13, -0.14]);
    caliper.userData.role = "brake-caliper";
    const hub = addMesh(THREE, wheel, geometry.hub, materials.rim, `hub-${index}`, [layout.side * 0.196, 0, 0], [0, 0, Math.PI / 2]);
    hub.userData.role = "hub";

    addMesh(THREE, wheel, geometry.spoke, materials.rim, `wheel-spokes-${index}`, [layout.side * 0.19, 0, 0]);
    if (detailLevel !== "low") {
      const cap = addMesh(THREE, wheel, geometry.rimLip, materials.rim, `rim-edge-${index}`, [layout.side * 0.183, 0, 0], [0, Math.PI / 2, 0], [0.82, 0.82, 0.82]);
      cap.userData.role = "rim-edge";
    }

    root.add(wheel);
    wheels.push(wheel);
  }
  return wheels;
}

function addFenders(THREE, bodyGroup, geometry, materials) {
  for (const side of [-1, 1]) {
    for (const z of [-SPORTS_CAR_DIMENSIONS.wheelbase / 2, SPORTS_CAR_DIMENSIONS.wheelbase / 2]) {
      const fender = addMesh(
        THREE,
        bodyGroup,
        geometry.fender,
        materials.paint,
        `fender-${side < 0 ? "left" : "right"}-${z < 0 ? "front" : "rear"}`,
        [side * 1.105, SPORTS_CAR_DIMENSIONS.wheelRadius + 0.045, z],
        [0, Math.PI / 2, 0],
      );
      fender.userData.role = "fender";
    }
  }
}

function addStrut(THREE, parent, geometry, material, name, start, end, radiusScale = 1) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = to.clone().sub(from);
  const mesh = addMesh(
    THREE,
    parent,
    geometry,
    material,
    name,
    from.clone().add(to).multiplyScalar(0.5).toArray(),
    null,
    [radiusScale, direction.length(), radiusScale],
  );
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.userData.role = "suspension-link";
  return mesh;
}

function addSuspension(THREE, root, geometry, materials, detail) {
  if (!detail.includeSuspension) return;
  const wheelY = SPORTS_CAR_DIMENSIONS.wheelRadius;
  const suspension = new THREE.Group();
  suspension.name = "suspension";
  suspension.userData.role = "suspension";
  for (const side of [-1, 1]) {
    for (const axleZ of [-SPORTS_CAR_DIMENSIONS.wheelbase / 2, SPORTS_CAR_DIMENSIONS.wheelbase / 2]) {
      const wheelX = side * 1.055;
      addStrut(THREE, suspension, geometry.strut, materials.rimDark, `suspension-strut-${side}-${axleZ}`, [side * 0.53, 0.53, axleZ + (axleZ < 0 ? 0.28 : -0.28)], [wheelX, wheelY, axleZ], 0.9);
      addStrut(THREE, suspension, geometry.suspensionLink, materials.carbon, `suspension-upper-arm-${side}-${axleZ}`, [side * 0.48, 0.59, axleZ + (axleZ < 0 ? 0.27 : -0.27)], [wheelX, wheelY + 0.13, axleZ], 0.82);
      addStrut(THREE, suspension, geometry.suspensionLink, materials.carbon, `suspension-lower-arm-${side}-${axleZ}`, [side * 0.52, 0.34, axleZ + (axleZ < 0 ? 0.25 : -0.25)], [wheelX, wheelY - 0.12, axleZ], 0.82);
    }
  }
  root.add(suspension);
}

function addLivery(THREE, bodyGroup, geometry, materials, livery) {
  let primaryStripe;
  if (livery.stripe === "double") {
    primaryStripe = addMesh(THREE, bodyGroup, geometry.stripeOffset, materials.accent, "hood-livery-stripe");
    addMesh(THREE, bodyGroup, geometry.stripeSecond, materials.accent, "hood-livery-stripe-right");
  } else if (livery.stripe === "offset") {
    primaryStripe = addMesh(THREE, bodyGroup, geometry.stripeOffset, materials.accent, "hood-livery-stripe");
  } else {
    primaryStripe = addMesh(THREE, bodyGroup, geometry.stripe, materials.accent, "hood-livery-stripe");
  }
  primaryStripe.userData.role = "livery-decal";

  const accent = addMesh(THREE, bodyGroup, geometry.sideAccent, materials.accent, "left-side-livery", [-1.14, 0.55, 0.22]);
  accent.userData.role = "side-livery";
  const oppositeAccent = addMesh(THREE, bodyGroup, geometry.sideAccent, materials.accent, "right-side-livery", [1.14, 0.55, 0.22]);
  oppositeAccent.userData.role = "side-livery";
  addMesh(THREE, bodyGroup, geometry.sill, materials.carbon, "left-carbon-sill", [-1.12, 0.34, 0.22]);
  addMesh(THREE, bodyGroup, geometry.sill, materials.carbon, "right-carbon-sill", [1.12, 0.34, 0.22]);
}

function addAerodynamicDetails(THREE, bodyGroup, geometry, materials, detailLevel, profile) {
  addMesh(THREE, bodyGroup, geometry.frontSplitter, materials.carbon, "front-splitter", [0, 0.255, -2.44]);
  addMesh(THREE, bodyGroup, geometry.rearDiffuser, materials.carbon, "rear-diffuser", [0, 0.30, 2.40]);
  addMesh(THREE, bodyGroup, geometry.grille, materials.carbon, "front-grille", [0, 0.39, -2.50]);

  if (detailLevel === "high") {
    for (const side of [-1, 1]) {
      for (const finZ of [2.31, 2.46]) {
        addMesh(THREE, bodyGroup, geometry.diffuserFin, materials.carbon, `rear-diffuser-fin-${side}-${finZ}`, [side * 0.50, 0.40, Math.min(finZ, 2.43)]);
      }
    }
    for (const x of [-0.18, 0.18]) {
      addMesh(THREE, bodyGroup, geometry.diffuserFin, materials.carbon, `rear-diffuser-fin-center-${x}`, [x, 0.40, 2.37], null, [0.8, 1, 1]);
    }
  }

  if (profile.wingWidth > 0) {
    const wing = new THREE.Group();
    wing.name = "rear-wing";
    wing.userData.role = "wing";
    addMesh(THREE, wing, geometry.wing, materials.secondary, "rear-wing-main-plane", [0, profile.wingHeight, 2.18]);
    addMesh(THREE, wing, geometry.wingLip, materials.accent, "rear-wing-trailing-edge", [0, profile.wingHeight + 0.069, 2.18]);
    for (const side of [-1, 1]) {
      addMesh(THREE, wing, geometry.wingSupport, materials.carbon, `rear-wing-support-${side}`, [side * profile.wingWidth * 0.31, profile.wingHeight - profile.wingSupportHeight / 2 - 0.035, 2.18]);
      if (detailLevel !== "low") {
        addMesh(THREE, wing, geometry.wingSupport, materials.secondary, `rear-wing-endplate-${side}`, [side * profile.wingWidth * 0.46, profile.wingHeight + 0.01, 2.18], null, [0.55, 0.65, 1.7]);
      }
    }
    bodyGroup.add(wing);
  }
}

function addHighDetail(THREE, bodyGroup, geometry, materials, profile, livery) {
  for (const side of [-1, 1]) {
    addMesh(THREE, bodyGroup, geometry.vent, materials.carbon, `hood-vent-${side}`, [side * 0.47, 0.875, -1.18], [0, 0, side * 0.08]);
    addMesh(THREE, bodyGroup, geometry.sideVent, materials.carbon, `side-intake-${side}`, [side * 1.12, 0.55, 0.40], [0, 0, side * -0.12], [1, 1, 1.3]);
    addMesh(THREE, bodyGroup, geometry.panelLine, materials.carbon, `door-seam-${side}`, [side * 1.105, 0.63, 0.63], [0, 0, side * 0.055]);
    addMesh(THREE, bodyGroup, geometry.doorHandle, materials.secondary, `door-handle-${side}`, [side * 1.105, 0.66, 0.22]);
    addMesh(THREE, bodyGroup, geometry.rearVent, materials.carbon, `rear-deck-vent-${side}`, [side * 0.48, 0.79, 1.58], [0, side * 0.1, 0]);
    addMesh(THREE, bodyGroup, geometry.windowFrame, materials.carbon, `quarter-window-frame-${side}`, [side * 0.61, 1.12, 0.83], [0, 0, side * -0.18]);
  }
  addMesh(THREE, bodyGroup, geometry.roof, materials.paint, "paint-roof", [0, 1.395, 0.15]);
  if (livery.stripe === "double") {
    addMesh(THREE, bodyGroup, geometry.roofStripe, materials.secondary, "roof-stripe-left", [-0.12, 1.445, 0.15]);
    addMesh(THREE, bodyGroup, geometry.roofStripe, materials.secondary, "roof-stripe-right", [0.12, 1.445, 0.15]);
  } else if (livery.stripe === "offset") {
    addMesh(THREE, bodyGroup, geometry.roofStripe, materials.accent, "roof-stripe", [0.16, 1.445, 0.15]);
  } else {
    addMesh(THREE, bodyGroup, geometry.roofStripe, materials.accent, "roof-stripe", [0, 1.445, 0.15], null, [1.8, 1, 1]);
  }
}

function addMirrors(THREE, bodyGroup, geometry, materials) {
  for (const side of [-1, 1]) {
    addMesh(THREE, bodyGroup, geometry.mirror, materials.paint, `mirror-${side}`, [side * 1.11, 1.01, -0.55], null, [1.25, 0.48, 0.9]);
  }
}

function addLights(THREE, bodyGroup, geometry, materials) {
  const frontLights = new THREE.Group();
  frontLights.name = "front-lights";
  frontLights.userData.role = "front-lights";
  for (const side of [-1, 1]) {
    const light = addMesh(THREE, frontLights, geometry.headlight, materials.light, `headlight-${side}`, [side * 0.66, 0.60, -2.38], [0, side * 0.08, 0], [1, 0.72, 1]);
    light.userData.role = "headlight";
    addMesh(THREE, frontLights, geometry.headlight, materials.carbon, `headlight-housing-${side}`, [side * 0.66, 0.60, -2.36], [0, side * 0.08, 0], [1.12, 1.3, 1.4]);
  }
  bodyGroup.add(frontLights);

  const rearLights = new THREE.Group();
  rearLights.name = "rear-lights";
  rearLights.userData.role = "rear-lights";
  addMesh(THREE, rearLights, geometry.tailLight, materials.tail, "tail-light-bar", [0, 0.67, 2.44]);
  bodyGroup.add(rearLights);
}

export function createSportsCar(THREE, options = {}) {
  assertThree(THREE);

  const detailLevel = normalizeDetailLevel(options.detailLevel);
  const livery = normalizeLivery(options.livery);
  const requestedProfile = typeof options.profile === "string"
    ? VEHICLE_PROFILES.findIndex((profile) => profile.name.toLowerCase() === options.profile.toLowerCase())
    : Number.isInteger(options.profile) ? options.profile : -1;
  const profileIndex = requestedProfile >= 0 && requestedProfile < VEHICLE_PROFILES.length
    ? requestedProfile
    : livery % VEHICLE_PROFILES.length;
  const profile = VEHICLE_PROFILES[profileIndex];
  const liveryStyle = LIVERIES[livery];
  const paintHex = resolveColor(THREE, options.paintColor, DEFAULT_PAINT_COLOR);
  const geometry = createGeometrySet(THREE, detailLevel, profileIndex);
  const materials = createMaterials(THREE, paintHex, livery);

  const root = new THREE.Group();
  root.name = options.name || "sports-car";
  root.userData.forwardAxis = "-Z";
  root.userData.upAxis = "+Y";
  root.userData.detailLevel = detailLevel;
  root.userData.livery = livery;
  root.userData.liveryName = liveryStyle.name;
  root.userData.vehicleProfile = profile.name;
  root.userData.wheelStyle = profile.wheelStyle;

  const bodyGroup = new THREE.Group();
  bodyGroup.name = "bodyGroup";
  bodyGroup.userData.role = "body";
  bodyGroup.userData.forwardAxis = "-Z";
  bodyGroup.position.y = 0.75;
  root.add(bodyGroup);

  const bodySurface = new THREE.Group();
  bodySurface.name = "bodySurface";
  bodySurface.position.y = -bodyGroup.position.y - SPORTS_CAR_DIMENSIONS.groundClearance;
  bodySurface.userData.role = "body-geometry";
  bodyGroup.add(bodySurface);

  addMesh(THREE, bodySurface, geometry.hull, materials.paint, "paint-hull");
  const cabin = addMesh(THREE, bodySurface, geometry.cabin, materials.glass, "glass-cabin");
  cabin.userData.role = "windscreen-and-greenhouse";
  if (detailLevel === "high") {
    for (const side of [-1, 1]) {
      addMesh(THREE, bodySurface, geometry.windowFrame, materials.carbon, `windscreen-pillar-${side}`, [side * 0.58, 1.13, -0.53], [0, 0, side * 0.28], [1, 1.1, 1]);
      addMesh(THREE, bodySurface, geometry.windowFrame, materials.carbon, `rear-pillar-${side}`, [side * 0.56, 1.12, 0.79], [0, 0, side * -0.26], [1, 0.92, 1]);
    }
  }
  addLivery(THREE, bodySurface, geometry, materials, liveryStyle);
  addAerodynamicDetails(THREE, bodySurface, geometry, materials, detailLevel, profile);
  addLights(THREE, bodySurface, geometry, materials);

  const detail = DETAIL_CONFIG[detailLevel];
  if (detail.includeFenders) addFenders(THREE, bodySurface, geometry, materials);
  if (detail.includeSuspension) addSuspension(THREE, root, geometry, materials, detail);
  if (detail.includePanelDetails) addHighDetail(THREE, bodySurface, geometry, materials, profile, liveryStyle);
  if (detail.includeMirrors) addMirrors(THREE, bodySurface, geometry, materials);

  const wheels = addWheels(THREE, root, geometry, materials, detailLevel);
  const steeringWheels = wheels.filter((wheel) => wheel.userData.axle === "front");
  const dimensions = Object.freeze({ ...SPORTS_CAR_DIMENSIONS });
  const collisionProxy = new THREE.Box3(
    new THREE.Vector3(-dimensions.width / 2, -dimensions.groundClearance, -dimensions.length / 2),
    new THREE.Vector3(dimensions.width / 2, dimensions.height - dimensions.groundClearance, dimensions.length / 2),
  );

  root.userData.dimensions = dimensions;
  root.userData.collisionProxy = collisionProxy;
  root.userData.collisionProxySpace = "root-local; bodyGroup sway envelope ±0.1 radians";

  return { root, bodyGroup, wheels, steeringWheels, collisionProxy, dimensions };
}
