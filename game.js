;(async function startLunaRacer() {
const logicResponse = await fetch("./game-logic.mjs");
if (!logicResponse.ok) throw new Error(`Falha ao carregar a lógica da corrida: HTTP ${logicResponse.status}.`);
const logicSource = await logicResponse.text();
const logicUrl = URL.createObjectURL(new Blob([logicSource], { type: "text/javascript" }));
let raceLogic;
try {
  raceLogic = await import(logicUrl);
} finally {
  URL.revokeObjectURL(logicUrl);
}
const { createRace, beginCountdown, advanceRace, togglePause, passCheckpoint } = raceLogic;

async function loadTextModule(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao carregar ${url}: HTTP ${response.status}.`);
  const moduleUrl = URL.createObjectURL(new Blob([await response.text()], { type: "text/javascript" }));
  try {
    return await import(moduleUrl);
  } finally {
    URL.revokeObjectURL(moduleUrl);
  }
}

function createRoadMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  const image = context.createImageData(canvas.width, canvas.height);
  let seed = 7841;
  for (let pixel = 0; pixel < image.data.length; pixel += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const grain = 43 + (seed >>> 25);
    image.data[pixel] = grain;
    image.data[pixel + 1] = grain + 2;
    image.data[pixel + 2] = grain + 5;
    image.data[pixel + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  return new THREE.MeshStandardMaterial({
    color: 0xb4b2ac,
    roughness: 0.95,
    side: THREE.DoubleSide,
    map: new THREE.CanvasTexture(canvas),
  });
}

function createGroundMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const pixels = context.createImageData(canvas.width, canvas.height);
  let seed = 16731;
  for (let pixel = 0; pixel < pixels.data.length; pixel += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const variation = (seed >>> 26) & 31;
    pixels.data[pixel] = 36 + variation;
    pixels.data[pixel + 1] = 68 + variation;
    pixels.data[pixel + 2] = 55 + variation;
    pixels.data[pixel + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(32, 32);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return new THREE.MeshStandardMaterial({ color: 0x7c9c8a, map: texture, roughness: 0.94 });
}

const [{ createVehicleState, stepVehicle, FIXED_PHYSICS_STEP_SECONDS }, { createInputController }, {
  createOpponentDriver,
  updateOpponentDriver,
  rankRacers,
}] = await Promise.all([
  loadTextModule("./vehicle-physics.mjs"),
  loadTextModule("./game-input.mjs"),
  loadTextModule("./race-ai.mjs"),
]);
const { createRacingAudio } = await loadTextModule("./racing-audio.mjs");
let audio = null;
let sportsCarDimensions = { length: 5.8, width: 4.25, height: 2.6 };
try {
  ({ SPORTS_CAR_DIMENSIONS: sportsCarDimensions } = await loadTextModule("./vehicle-models.mjs"));
} catch {
  // O fallback local da factory mantém bounds compatíveis com a geometria procedural antiga.
}
const { TRACK_CONFIGURATIONS } = await loadTextModule("./track-configurations.mjs");
let createSportsCar = null;
try {
  ({ createSportsCar } = await loadTextModule("./vehicle-models.mjs"));
} catch (error) {
  console.warn("Factory de carros esportivos indisponível; fallback procedural local:", error);
}
const vehicleFactory = createSportsCar;

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
const TRACK_WIDTH = 18;
const TRACK_HALF_WIDTH = TRACK_WIDTH / 2;
let CHECKPOINT_POSITIONS = [0, 0.12, 0.23, 0.34, 0.45, 0.56, 0.67, 0.78, 0.89];
const BEST_LAP_KEY = "lunaracer.bestLapMs.v1";
const MAX_SPEED_MPS = 98;
const container = document.querySelector("#game-container");
const app = document.querySelector("#race-app");
const timerValue = document.querySelector("#timer-value");
const positionLabelValue = document.querySelector("#position-value");
const lapValue = document.querySelector("#lap-value");
const checkpointValue = document.querySelector("#checkpoint-value");
const bestValue = document.querySelector("#best-value");
const checkpointIndicators = [...document.querySelectorAll(".checkpoint-steps li")];
const raceStatus = document.querySelector("#race-status");
const startButton = document.querySelector("#start-button");
const resultsPanel = document.querySelector("#results-panel");
const resultTime = document.querySelector("#result-time");
const resultBest = document.querySelector("#result-best");
const resultPosition = document.querySelector("#result-position");
const restartButton = document.querySelector("#restart-button");
const positionValue = document.querySelector("#position-value");
const positionTotal = document.querySelector("#position-total");
const positionList = document.querySelector("#position-list");
const lapTimeValue = document.querySelector("#lap-time");
const lastLapValue = document.querySelector("#last-lap");
const speedValue = document.querySelector("#speed-value");
const extendBanner = document.querySelector("#extend-banner");
const countdownOverlay = document.querySelector("#countdown-overlay");
const countdownValue = document.querySelector("#countdown-value");
const pauseOverlay = document.querySelector("#pause-overlay");
const resumeButton = document.querySelector("#resume-button");
const difficultySelect = document.querySelector("#difficulty-select");
const graphicsSelect = document.querySelector("#graphics-select");
const trackSelect = document.querySelector("#track-select");
const difficultyValue = document.querySelector("#difficulty-value");
const controllerStatus = document.querySelector("#controller-status");
const cameraValue = document.querySelector("#camera-value");
const diagnosticsValue = document.querySelector("#diagnostics-value");
const diagnosticsPanel = document.querySelector("#diagnostics-panel");
const trackName = document.querySelector("#track-name");
const minimap = document.querySelector("#minimap");
const minimapTrackShadow = document.querySelector("#minimap-track");
const minimapTrackLine = document.querySelector("#minimap-track-line");
const minimapCars = document.querySelector("#minimap-cars");
const minimapPlayer = document.querySelector("#minimap-player");

let THREE;
try {
  THREE = await import(THREE_URL);
} catch (error) {
  raceStatus.textContent = "Não foi possível carregar o Three.js. Verifique a conexão e recarregue a página.";
  startButton.disabled = true;
  console.error("Falha ao carregar Three.js:", error);
}
if (!THREE) throw new Error("Three.js indisponível.");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x4c7189);
scene.fog = new THREE.Fog(0x8da5ad, 520, 1450);

let camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1800);
const cameraCockpit = new THREE.PerspectiveCamera(72, 1, 0.1, 320);
const cameraElevated = new THREE.OrthographicCamera(-760, 760, 475, -475, 0.1, 2400);
camera.position.set(0, 3.7, 7);
const cameraFar = new THREE.PerspectiveCamera(53, 1, 0.1, 2200);
const cameras = [camera, cameraCockpit, cameraFar, cameraElevated];
const cameraModeLabels = ["TRASEIRA PRÓXIMA", "COCKPIT", "TRASEIRA LONGE", "PANORÂMICA"];
let cameraMode = 0;
let cameraFov = camera.fov;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
} catch (error) {
  raceStatus.textContent = "Seu navegador não conseguiu iniciar a cena 3D.";
  startButton.disabled = true;
  console.error("Falha ao iniciar WebGL:", error);
}
if (!renderer) throw new Error("WebGL indisponível.");

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.info.autoReset = true;
renderer.setClearColor(0x597486, 1);
container.replaceChildren(renderer.domElement);
let rendererContextLost = false;
renderer.domElement.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  rendererContextLost = true;
  app.dataset.state = "error";
  raceStatus.textContent = "A aceleração gráfica foi interrompida. Recarregue a corrida para restaurar a cena.";
  startButton.disabled = true;
});
renderer.domElement.addEventListener("webglcontextrestored", () => {
  rendererContextLost = false;
  app.dataset.state = "ready";
  startButton.disabled = false;
  raceStatus.textContent = "Aceleração gráfica restaurada. Pronto para largar.";
});

const hemisphere = new THREE.HemisphereLight(0xd9f1ff, 0x536044, 2.0);
scene.add(hemisphere);

const sunlight = new THREE.DirectionalLight(0xfff0d6, 3.3);
sunlight.position.set(-60, 90, 36);
sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(1024, 1024);
sunlight.shadow.camera.left = -95;
sunlight.shadow.camera.right = 95;
sunlight.shadow.camera.top = 95;
sunlight.shadow.camera.bottom = -95;
sunlight.shadow.normalBias = 0.035;
scene.add(sunlight);

const materials = {
  grass: createGroundMaterial(),
  road: createRoadMaterial(),
  runoff: new THREE.MeshStandardMaterial({ color: 0xc6c7c0, roughness: 0.92, side: THREE.DoubleSide }),
  line: new THREE.MeshStandardMaterial({ color: 0x7fe2e8, roughness: 0.8, side: THREE.DoubleSide }),
  barrierLight: new THREE.MeshStandardMaterial({ color: 0xe6e7df, roughness: 0.84 }),
  barrierRace: new THREE.MeshStandardMaterial({ color: 0xd3444c, roughness: 0.82 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x624a32, roughness: 1 }),
  foliage: new THREE.MeshStandardMaterial({ color: 0x315e43, roughness: 1 }),
  foliageLight: new THREE.MeshStandardMaterial({ color: 0x497449, roughness: 1 }),
  cone: new THREE.MeshStandardMaterial({ color: 0xf18432, roughness: 0.75 }),
  coneBand: new THREE.MeshStandardMaterial({ color: 0xf4eee1, roughness: 0.72 }),
  grandstand: new THREE.MeshStandardMaterial({ color: 0x42474b, roughness: 0.9 }),
  seat: new THREE.MeshStandardMaterial({ color: 0x87949a, roughness: 0.86 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x353e42, roughness: 0.88 }),
  curb: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, vertexColors: true, side: THREE.DoubleSide }),
  stripe: new THREE.MeshStandardMaterial({ color: 0xf1ead6, roughness: 0.85 }),
};

const selectedTrackId = new URLSearchParams(location.search).get("track") || trackSelect?.value || "interlagos";
const activeTrack = TRACK_CONFIGURATIONS.find((track) => track.id === selectedTrackId) ?? TRACK_CONFIGURATIONS[0];
if (trackSelect) trackSelect.value = activeTrack.id;
CHECKPOINT_POSITIONS = activeTrack.checkpoints.map(({ progress }) => progress);
const difficultyProfiles = activeTrack.difficultyProfiles;
const trackControlPoints = activeTrack.centerline.map(({ x, y, z }) => new THREE.Vector3(x, y, z));
const trackCurve = new THREE.CatmullRomCurve3(trackControlPoints, true, "centripetal");
trackCurve.arcLengthDivisions = 5200;
trackCurve.updateArcLengths();

function trackSample(t) {
  const point = trackCurve.getPointAt((t + 1) % 1);
  const tangent = trackCurve.getTangentAt((t + 1) % 1).normalize();
  const horizontalRight = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
  const normal = new THREE.Vector3().crossVectors(horizontalRight, tangent).normalize();
  const right = new THREE.Vector3().crossVectors(tangent, normal).normalize();
  return {
    point,
    tangent,
    right,
    normal,
    yaw: Math.atan2(-tangent.x, -tangent.z),
    progress: (t + 1) % 1,
  };
}

const trackSamples = Array.from({ length: 2048 }, (_, index) => trackSample(index / 2048));
const gates = CHECKPOINT_POSITIONS.map((t) => trackSample(t));
const checkpointNameForProgress = (progress) => activeTrack.checkpoints
  .slice()
  .reverse()
  .find((checkpoint) => progress >= checkpoint.progress)?.name ?? "LARGADA";
const conePositions = [];
const mapView = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
for (const sample of trackSamples) {
  mapView.minX = Math.min(mapView.minX, sample.point.x);
  mapView.maxX = Math.max(mapView.maxX, sample.point.x);
  mapView.minZ = Math.min(mapView.minZ, sample.point.z);
  mapView.maxZ = Math.max(mapView.maxZ, sample.point.z);
}
const mapProjection = {
  scale: Math.min(190 / Math.max(mapView.maxX - mapView.minX, 1), 115 / Math.max(mapView.maxZ - mapView.minZ, 1)),
  offsetX: 25,
  offsetY: 17.5,
};
mapProjection.offsetX += (190 - (mapView.maxX - mapView.minX) * mapProjection.scale) / 2;
mapProjection.offsetY += (115 - (mapView.maxZ - mapView.minZ) * mapProjection.scale) / 2;
const mapPoints = trackSamples.map((sample) => new THREE.Vector2(
  mapProjection.offsetX + (sample.point.x - mapView.minX) * mapProjection.scale,
  mapProjection.offsetY + (sample.point.z - mapView.minZ) * mapProjection.scale,
));
const trackSvgPath = `${mapPoints.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")} Z`;
minimapTrackShadow.setAttribute("d", trackSvgPath);
minimapTrackLine.setAttribute("d", trackSvgPath);
const trackBounds = {
  minX: mapView.minX - TRACK_HALF_WIDTH - 4,
  maxX: mapView.maxX + TRACK_HALF_WIDTH + 4,
  minZ: mapView.minZ - TRACK_HALF_WIDTH - 4,
  maxZ: mapView.maxZ + TRACK_HALF_WIDTH + 4,
  center: new THREE.Vector3((mapView.minX + mapView.maxX) / 2, 0, (mapView.minZ + mapView.maxZ) / 2),
};
const maxTrackHeight = trackSamples.reduce((height, sample) => Math.max(height, sample.point.y), -Infinity);

function makeRibbon(offsetA, offsetB, material, y = 0.06) {
  const positions = [];
  const indices = [];
  const samples = trackSamples.length;
  for (const sample of trackSamples) {
    for (const offset of [offsetA, offsetB]) {
      positions.push(
        sample.point.x + sample.right.x * offset,
        sample.point.y + y,
        sample.point.z + sample.right.z * offset,
      );
    }
  }
  for (let i = 0; i < samples; i += 1) {
    const next = (i + 1) % samples;
    const a = i * 2;
    const b = a + 1;
    const c = next * 2;
    const d = c + 1;
    indices.push(a, c, b, b, c, d);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  scene.add(mesh);
}

function addGroundAndRoad() {
  const groundPositions = [];
  const groundIndices = [];
  const radialSteps = 12;
  for (const sample of trackSamples) {
    for (let step = 0; step <= radialSteps; step += 1) {
      const progress = step / radialSteps;
      const offset = TRACK_HALF_WIDTH + 3 + progress * 220;
      const height = sample.point.y - 1.2 - progress * 18 + Math.sin(sample.progress * Math.PI * 14 + step * 0.63) * progress * 2;
      const vertex = sample.point.clone().addScaledVector(sample.right, offset);
      groundPositions.push(vertex.x, height, vertex.z);
    }
  }
  for (let index = 0; index < trackSamples.length; index += 1) {
    const next = (index + 1) % trackSamples.length;
    for (let step = 0; step < radialSteps; step += 1) {
      const a = index * (radialSteps + 1) + step;
      const b = next * (radialSteps + 1) + step;
      groundIndices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const groundGeometry = new THREE.BufferGeometry();
  groundGeometry.setAttribute("position", new THREE.Float32BufferAttribute(groundPositions, 3));
  groundGeometry.setIndex(groundIndices);
  groundGeometry.computeVertexNormals();
  const surroundingGround = new THREE.Mesh(groundGeometry, materials.grass);
  surroundingGround.receiveShadow = true;
  scene.add(surroundingGround);

  const infieldPositions = [];
  const infieldIndices = [];
  const infieldSteps = 14;
  for (const sample of trackSamples) {
    for (let step = 0; step <= infieldSteps; step += 1) {
      const offset = -TRACK_HALF_WIDTH - 2 - step * 7;
      const vertex = sample.point.clone().addScaledVector(sample.right, offset);
      const elevation = sample.point.y - 1.35 - step * 0.03;
      infieldPositions.push(vertex.x, elevation, vertex.z);
    }
  }
  for (let index = 0; index < trackSamples.length; index += 1) {
    const next = (index + 1) % trackSamples.length;
    for (let step = 0; step < infieldSteps; step += 1) {
      const a = index * (infieldSteps + 1) + step;
      const b = next * (infieldSteps + 1) + step;
      infieldIndices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const infieldGeometry = new THREE.BufferGeometry();
  infieldGeometry.setAttribute("position", new THREE.Float32BufferAttribute(infieldPositions, 3));
  infieldGeometry.setIndex(infieldIndices);
  infieldGeometry.computeVertexNormals();
  const infield = new THREE.Mesh(infieldGeometry, materials.grass);
  infield.receiveShadow = true;
  scene.add(infield);
  makeRibbon(-TRACK_HALF_WIDTH - 1.1, -TRACK_HALF_WIDTH, materials.runoff, 0.005);
  makeRibbon(TRACK_HALF_WIDTH, TRACK_HALF_WIDTH + 1.1, materials.runoff, 0.005);
  makeRibbon(-TRACK_HALF_WIDTH, TRACK_HALF_WIDTH, materials.road, 0.035);
  makeRibbon(-TRACK_HALF_WIDTH, -TRACK_HALF_WIDTH + 0.24, materials.line, 0.062);
  makeRibbon(TRACK_HALF_WIDTH - 0.24, TRACK_HALF_WIDTH, materials.line, 0.062);
  addTrackCurbs();
  addRoadMarkers();
}

function addTrackCurbs() {
  const positions = [];
  const colors = [];
  const indices = [];
  const curbColors = [new THREE.Color(0xd44843), new THREE.Color(0xe9e6d7)];
  const divisions = trackSamples.length;
  for (let sideIndex = 0; sideIndex < 2; sideIndex += 1) {
    const side = sideIndex === 0 ? -1 : 1;
    for (let index = 0; index <= divisions; index += 1) {
      const sample = trackSamples[index % divisions];
      for (const offset of [TRACK_HALF_WIDTH + 0.08, TRACK_HALF_WIDTH + 0.88]) {
        positions.push(
          sample.point.x + sample.right.x * side * offset,
          sample.point.y + 0.115,
          sample.point.z + sample.right.z * side * offset,
        );
        colors.push(...curbColors[Math.floor(index / 7) % 2].toArray());
      }
    }
    const base = sideIndex * (divisions + 1) * 2;
    for (let index = 0; index < divisions; index += 1) {
      const first = base + index * 2;
      const next = first + 2;
      indices.push(first, next, first + 1, first + 1, next, next + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const curbs = new THREE.Mesh(geometry, materials.curb);
  curbs.receiveShadow = true;
  scene.add(curbs);
}

function addRoadMarkers() {
  const positions = [];
  const indices = [];
  for (let index = 0; index < trackSamples.length; index += 1) {
    if (index % 8 >= 4) continue;
    const start = trackSamples[index].point;
    const end = trackSamples[(index + 1) % trackSamples.length].point;
    const halfWidth = 0.09;
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.hypot(dx, dz) || 1;
    const rightX = dz / length * halfWidth;
    const rightZ = -dx / length * halfWidth;
    const base = positions.length / 3;
    positions.push(
      start.x - rightX, start.y + 0.075, start.z - rightZ,
      start.x + rightX, start.y + 0.075, start.z + rightZ,
      end.x - rightX, end.y + 0.075, end.z - rightZ,
      end.x + rightX, end.y + 0.075, end.z + rightZ,
    );
    indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const markers = new THREE.Mesh(geometry, materials.stripe);
  markers.receiveShadow = true;
  scene.add(markers);
}

function addStartLine() {
  const dark = new THREE.MeshStandardMaterial({ color: 0x202326, roughness: 0.82 });
  const count = 16;
  const cell = TRACK_WIDTH / count;
  const sample = gates[0];
  for (let i = 0; i < count; i += 1) {
    const lateral = (i + 0.5) * cell - TRACK_HALF_WIDTH;
    const square = new THREE.Mesh(
      new THREE.BoxGeometry(cell, 0.045, 0.36),
      i % 2 === 0 ? materials.line : dark,
    );
    square.position.set(
      sample.point.x + sample.right.x * lateral,
      sample.point.y + 0.105,
      sample.point.z + sample.right.z * lateral,
    );
    square.rotation.y = sample.yaw;
    square.receiveShadow = true;
    scene.add(square);
  }
}

function addBarriers() {
  const segmentCount = Math.ceil(trackCurve.getLength() / 2.1);
  const segmentLength = trackCurve.getLength() / segmentCount * 1.02;
  const geometry = new THREE.BoxGeometry(0.4, 0.78, segmentLength);
  const instances = [
    [new THREE.InstancedMesh(geometry, materials.barrierLight, Math.ceil(segmentCount / 2)), new THREE.InstancedMesh(geometry, materials.barrierRace, Math.floor(segmentCount / 2))],
    [new THREE.InstancedMesh(geometry, materials.barrierLight, Math.ceil(segmentCount / 2)), new THREE.InstancedMesh(geometry, materials.barrierRace, Math.floor(segmentCount / 2))],
  ];
  const counts = [[0, 0], [0, 0]];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < segmentCount; i += 1) {
    const sample = trackSample(i / segmentCount);
    const paletteIndex = i % 2 === 0 ? 0 : 1;
    for (let sideIndex = 0; sideIndex < 2; sideIndex += 1) {
      const side = sideIndex === 0 ? -1 : 1;
      const offset = side * (TRACK_HALF_WIDTH + 0.48);
      const center = sample.point.clone().addScaledVector(sample.right, offset);
      dummy.position.set(center.x, center.y + 0.4, center.z);
      dummy.rotation.set(0, sample.yaw, 0);
      dummy.updateMatrix();
      instances[sideIndex][paletteIndex].setMatrixAt(counts[sideIndex][paletteIndex]++, dummy.matrix);
    }
  }
  for (const sideMeshes of instances) {
    for (const mesh of sideMeshes) {
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      scene.add(mesh);
    }
  }
}

function addTree(x, y, z, scale = 1, lighter = false) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.7, 6), materials.trunk);
  trunk.position.y = 0.85;
  trunk.castShadow = true;
  tree.add(trunk);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(1.55, 3.3, 7), lighter ? materials.foliageLight : materials.foliage);
  crown.position.y = 3.1;
  crown.castShadow = true;
  tree.add(crown);
  tree.position.set(x, y, z);
  tree.scale.setScalar(scale);
  tree.userData.lod = Math.hypot(x, z);
  tree.userData.isTree = true;
  scene.add(tree);
  sceneryInstances.push(tree);
}

function addScenery() {
  for (let i = 0; i < 78; i += 1) {
    const sample = trackSample(i / 78);
    const side = i % 2 === 0 ? -1 : 1;
    const offset = 17 + (i % 3) * 2.5;
    addTree(
      sample.point.x + sample.right.x * side * offset,
      sample.point.y,
      sample.point.z + sample.right.z * side * offset,
      0.9 + (i % 4) * 0.09,
      i % 3 === 0,
    );
  }
  const cloudMaterial = new THREE.MeshStandardMaterial({ color: 0xf3f7f9, roughness: 1 });
  const cloudGeometry = new THREE.SphereGeometry(1, 10, 7);
  for (let i = 0; i < 26; i += 1) {
    const cloud = new THREE.Group();
    const baseX = -160 + (i * 31) % 320;
    const baseZ = -230 - (i * 47) % 150;
    for (let puff = 0; puff < 5; puff += 1) {
      const mesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
      mesh.scale.set(4 + (puff % 3) * 1.7, 2.2 + (puff % 2) * 0.8, 3.6 + (puff % 2) * 1.4);
      mesh.position.set((puff - 2) * 4.2, Math.abs(puff - 2) * 0.7, Math.sin(puff) * 1.8);
      cloud.add(mesh);
    }
    cloud.position.set(baseX, 81 + (i % 4) * 12, baseZ);
    cloud.userData.lod = 350;
    sceneryInstances.push(cloud);
    scene.add(cloud);
  }

    const standSample = trackSample(0.08);
  const stand = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(27, 1, 42), materials.grandstand);
  base.position.y = 0.5;
  base.castShadow = true;
  base.receiveShadow = true;
  stand.add(base);
  for (let row = 0; row < 5; row += 1) {
    const seats = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 36), materials.seat);
    seats.position.set((row - 2) * 3.25, 1.15 + row * 0.58, 0.2);
    seats.castShadow = true;
    seats.receiveShadow = true;
    stand.add(seats);
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(29, 0.5, 42), materials.roof);
  roof.position.set(0.15, 5.4, 0.2);
  roof.castShadow = true;
  stand.add(roof);
  for (const x of [-3.1, 3.1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.45, 5, 0.45), materials.roof);
    post.position.set(x * 4.3, 2.8, 0.2);
    stand.add(post);
  }
  stand.position.set(
    standSample.point.x - standSample.right.x * 28,
    standSample.point.y,
    standSample.point.z - standSample.right.z * 28,
  );
  stand.rotation.y = standSample.yaw;
  scene.add(stand);

  addCheckpointGates();
  addMountainsAndLake();
}

function addMountainsAndLake() {
  const terrainMaterial = new THREE.MeshStandardMaterial({ color: 0x526769, roughness: 0.97, flatShading: true });
  const treeLineMaterial = new THREE.MeshStandardMaterial({ color: 0x244b3b, roughness: 0.95, flatShading: true });
  const bounds = trackSamples.reduce((box, sample) => ({
    minX: Math.min(box.minX, sample.point.x),
    maxX: Math.max(box.maxX, sample.point.x),
    minZ: Math.min(box.minZ, sample.point.z),
    maxZ: Math.max(box.maxZ, sample.point.z),
  }), { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity });
  const viewGap = 260;
  for (let index = 0; index < 18; index += 1) {
    const x = bounds.minX - 530 + index * ((bounds.maxX - bounds.minX + 1060) / 17);
    const z = bounds.minZ - viewGap - (index % 4) * 80;
    const height = 42 + (index * 13) % 24;
    const width = 80 + (index % 3) * 22;
    const mountain = new THREE.Mesh(new THREE.ConeGeometry(width, height, 13), terrainMaterial);
    mountain.position.set(x, -10 + height * 0.45, z);
    mountain.rotation.y = index * 0.37;
    mountain.castShadow = true;
    scene.add(mountain);
    const foothill = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8), treeLineMaterial);
    foothill.scale.set(width * 1.6, 8, 75);
    foothill.position.set(x, -10, z + 24);
    scene.add(foothill);
  }
  const water = new THREE.MeshStandardMaterial({ color: 0x327d89, roughness: 0.32, metalness: 0.06, side: THREE.DoubleSide });
  const shoreline = trackSample(0.62);
  const lakeWidth = 88;
  const lakeLength = 142;
  const lakeClearance = TRACK_HALF_WIDTH + 2.3 + lakeWidth / 2 + 8;
  const lake = new THREE.Mesh(new THREE.PlaneGeometry(lakeWidth, lakeLength, 1, 1), water);
  lake.rotation.x = -Math.PI / 2;
  lake.rotation.y = Math.atan2(shoreline.right.z, shoreline.right.x);
  lake.position.set(
    shoreline.point.x + shoreline.right.x * lakeClearance,
    shoreline.point.y - 1.5,
    shoreline.point.z + shoreline.right.z * lakeClearance,
  );
  lake.userData.isBackdropWater = true;
  scene.add(lake);
}

const checkpointMaterials = CHECKPOINT_POSITIONS.map((_, index) => new THREE.MeshStandardMaterial({
  color: index === 0 ? 0xffdf6e : index === 1 ? 0xd4fb53 : index === 2 ? 0x63d8f2 : 0xff9576,
  emissive: index === 0 ? 0xa97c19 : index === 1 ? 0x6b9c18 : index === 2 ? 0x146e85 : 0x9f3c30,
  emissiveIntensity: 0.18,
  roughness: 0.3,
  metalness: 0.12,
}));
const checkpointGateLights = [];

function addCheckpointGates() {
  for (let index = 1; index < gates.length; index += 1) {
    const gate = gates[index];
    const group = new THREE.Group();
    const material = checkpointMaterials[index];
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.34, 5.2, 0.34), material);
      post.position.set(side * (TRACK_HALF_WIDTH - 0.35), 2.6, 0);
      post.castShadow = true;
      group.add(post);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(TRACK_WIDTH - 0.3, 0.3, 0.34), material);
    beam.position.y = 5.2;
    beam.castShadow = true;
    group.add(beam);
    for (let marker = -2; marker <= 2; marker += 1) {
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), material);
      light.position.set(marker * 2.15, 5.45, 0.08);
      group.add(light);
    }
    group.position.copy(gate.point);
    group.rotation.y = gate.yaw;
    scene.add(group);
    checkpointGateLights[index] = material;
  }
}

function updateCheckpointIndicators() {
  const finished = game.race.status === "finished";
  const nextCheckpoint = game.race.nextCheckpoint;
  checkpointValue.textContent = finished
    ? "FINALIZADA"
    : nextCheckpoint === 0 ? "LARGADA" : `PONTO ${String(nextCheckpoint).padStart(2, "0")}`;
  checkpointIndicators.forEach((indicator, index) => {
    const state = finished || index < nextCheckpoint || nextCheckpoint === 0 && game.race.status === "racing"
      ? "passed"
      : index === nextCheckpoint ? "next" : "waiting";
    if (indicator.dataset.state !== state) indicator.dataset.state = state;
  });
  checkpointGateLights.forEach((material, index) => {
    if (material) material.emissiveIntensity = index === nextCheckpoint && !finished ? 0.85 : 0.12;
  });
}

function applyGraphicsProfile() {
  const high = game.graphics === "high";
  const low = game.graphics === "low";
  renderer.shadowMap.enabled = !low;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : high ? 1.65 : 1.25));
  sunlight.castShadow = high;
  sunlight.shadow.mapSize.setScalar(high ? 1536 : low ? 256 : 768);
  for (const prop of sceneryInstances) prop.visible = !low || !prop.userData.isTree || prop.position.distanceTo(camera.position) < 280;
  renderer.toneMappingExposure = high ? 1.12 : low ? 1.03 : 1.08;
}

const sceneryInstances = [];

function createCar(paintColor = 0xd51f32) {
  if (vehicleFactory) {
    const detailLevel = graphicsSelect.value === "low" ? "low" : graphicsSelect.value === "high" ? "high" : "medium";
    const sports = vehicleFactory(THREE, { paintColor, detailLevel, livery: Math.abs(paintColor) % 3 });
    sports.root.userData.sportsCar = true;
    sports.root.userData.dimensions = sports.dimensions;
    sports.root.userData.collisionProxy = sports.collisionProxy;
    sports.root.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    sports.root.position.y = sports.dimensions.groundClearance;
    scene.add(sports.root);
    return sports;
  }
  const root = new THREE.Group();
  const bodyMaterial = new THREE.MeshPhysicalMaterial({ color: paintColor, metalness: 0.32, roughness: 0.28, clearcoat: 0.86, clearcoatRoughness: 0.2 });
  const whiteMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf1f2ed, metalness: 0.18, roughness: 0.3, clearcoat: 0.8 });
  const carbonMaterial = new THREE.MeshStandardMaterial({ color: 0x161a1e, metalness: 0.4, roughness: 0.48 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({ color: 0x15242e, metalness: 0.18, roughness: 0.2, clearcoat: 1, transmission: 0.18 });
  const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x17191b, roughness: 0.95 });
  const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xffe7a4, emissive: 0x8b6830, roughness: 0.35 });
  const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xf0444e, emissive: 0x64131a, roughness: 0.4 });
  const bodyGroup = new THREE.Group();

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.36, 4.75), bodyMaterial);
  chassis.position.set(0, 0.72, -0.05);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  bodyGroup.add(chassis);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.73, 4.2, 6), bodyMaterial);
  nose.rotation.x = -Math.PI / 2;
  nose.position.set(0, 0.82, -0.52);
  nose.castShadow = true;
  bodyGroup.add(nose);

  const centerWhite = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.075, 3.1), whiteMaterial);
  centerWhite.position.set(0, 0.96, -0.08);
  centerWhite.castShadow = true;
  bodyGroup.add(centerWhite);

  const cockpitFloor = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.15, 1.55), carbonMaterial);
  cockpitFloor.position.set(0, 0.98, 0.22);
  bodyGroup.add(cockpitFloor);

  const cabin = new THREE.Mesh(new THREE.SphereGeometry(0.66, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), glassMaterial);
  cabin.scale.set(0.96, 0.75, 1.2);
  cabin.position.set(0, 1.18, 0.3);
  cabin.castShadow = true;
  bodyGroup.add(cabin);

  const airbox = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.075, 7, 16), carbonMaterial);
  airbox.position.set(0, 1.57, 0.72);
  airbox.castShadow = true;
  bodyGroup.add(airbox);

  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.055, 8, 24, Math.PI), carbonMaterial);
  halo.rotation.z = Math.PI;
  halo.position.set(0, 1.47, 0.28);
  halo.castShadow = true;
  bodyGroup.add(halo);

  const frontWing = new THREE.Group();
  const frontMain = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.12, 0.54), whiteMaterial);
  frontMain.position.set(0, 0.36, -3.23);
  frontMain.castShadow = true;
  frontWing.add(frontMain);
  for (const side of [-1, 1]) {
    const endplate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.78), bodyMaterial);
    endplate.position.set(side * 2.03, 0.52, -3.25);
    endplate.castShadow = true;
    frontWing.add(endplate);
    const flap = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 0.46), bodyMaterial);
    flap.position.set(side * 1.12, 0.53, -3.28);
    flap.rotation.y = side * 0.12;
    frontWing.add(flap);
  }
  const frontPylon = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.42, 0.2), carbonMaterial);
  frontPylon.position.set(0, 0.53, -2.75);
  frontWing.add(frontPylon);
  bodyGroup.add(frontWing);

  const rearWing = new THREE.Group();
  const rearMain = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.14, 0.56), whiteMaterial);
  rearMain.position.set(0, 2.1, 1.93);
  rearMain.castShadow = true;
  rearWing.add(rearMain);
  const rearUpper = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.13, 0.42), bodyMaterial);
  rearUpper.position.set(0, 2.56, 2.02);
  rearUpper.rotation.x = -0.12;
  rearWing.add(rearUpper);
  for (const x of [-1.38, 1.38]) {
    const upright = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), carbonMaterial);
    upright.position.set(x, 2.31, 1.95);
    rearWing.add(upright);
  }
  bodyGroup.add(rearWing);

  for (const side of [-1, 1]) {
    const sidepod = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.34, 1.45), whiteMaterial);
    sidepod.position.set(side * 0.95, 0.72, 0.45);
    sidepod.castShadow = true;
    bodyGroup.add(sidepod);
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.5, 10), carbonMaterial);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(side * 0.34, 0.96, 1.55);
    bodyGroup.add(exhaust);
  }

  const wheels = [];
  const wheelGeometry = new THREE.CylinderGeometry(0.57, 0.57, 0.42, 24, 1);
  for (const x of [-1.3, 1.3]) {
    for (const z of [-1.58, 1.48]) {
      const wheel = new THREE.Mesh(wheelGeometry, tireMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.57, z);
      wheel.castShadow = true;
      root.add(wheel);
      wheels.push(wheel);
    }
  }

  const steeringWheels = [];
  for (const x of [-1.3, 1.3]) {
    const wheel = wheels[x < 0 ? 0 : 1];
    steeringWheels.push(wheel);
  }
  const suspension = new THREE.Group();
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      const suspensionArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.45, 6), carbonMaterial);
      suspensionArm.rotation.z = Math.PI / 2;
      suspensionArm.rotation.y = z * 0.16;
      suspensionArm.position.set(x * 0.96, 0.62, z * 1.1);
      suspension.add(suspensionArm);
    }
  }
  root.add(suspension);

  for (const x of [-0.72, 0.72]) {
    const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.1), lightMaterial);
    headlight.position.set(x * 0.78, 0.68, -2.32);
    bodyGroup.add(headlight);
    const taillight = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.1), tailMaterial);
    taillight.position.set(x * 0.55, 1.02, 1.98);
    bodyGroup.add(taillight);
  }

  root.add(bodyGroup);
  scene.add(root);
  return { root, bodyGroup, wheels, steeringWheels, suspension };
}

addGroundAndRoad();
addBarriers();
addScenery();
addStartLine();

const player = {
  id: 0,
  label: "JOGADOR",
  car: createCar(0xd51f32),
  physics: createVehicleState(),
  driver: null,
  laneOffset: 0,
  completedLaps: 0,
  progress: 0,
  previousDistance: 0,
  lastInput: { steer: 0, throttle: 0, brake: 0 },
};
const car = player.car;
const opponentPalette = [0xf5f5ee, 0x176dcc, 0x1fa574, 0xf3b522, 0x893de0, 0xed5c27, 0x24b8c8, 0xe84361];
const gridOffsets = [-1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1];
const opponents = Array.from({ length: 15 }, (_, index) => {
  const id = index + 1;
  const laneOffset = gridOffsets[index] * 2.15;
  const initialProgress = ((trackCurve.getLength() - 8 - Math.floor(index / 2) * 9) / trackCurve.getLength() + 1) % 1;
  const sample = trackSample(initialProgress);
  const opponentCar = createCar(opponentPalette[index % opponentPalette.length]);
  opponentCar.root.position.set(
    sample.point.x + sample.right.x * laneOffset,
    sample.point.y,
    sample.point.z + sample.right.z * laneOffset,
  );
  opponentCar.root.rotation.y = sample.yaw;
  opponentCar.root.traverse((object) => { if (object.isMesh) object.castShadow = false; });
  return {
    id,
    label: `PILOTO ${String(id + 1).padStart(2, "0")}`,
    car: opponentCar,
    physics: createVehicleState({ x: opponentCar.root.position.x, y: opponentCar.root.position.y, z: opponentCar.root.position.z, yaw: sample.yaw }),
    driver: createOpponentDriver(id, { laneOffset: Math.max(-1, Math.min(1, laneOffset / 6.5)), skill: 0.52 + (index % 5) * 0.09, maxSpeedMps: 81 + (index % 4) * 3.2 }),
    laneOffset,
    completedLaps: 0,
    progress: initialProgress,
    previousDistance: initialProgress * trackCurve.getLength(),
    lastInput: { steer: 0, throttle: 0, brake: 0 },
  };
});
const racers = [player, ...opponents];
const input = createInputController({});
const bestLapMs = readBestLap();
const game = {
  race: createRace(CHECKPOINT_POSITIONS.length, 3, { initialTimeMs: 58000, checkpointBonusMs: 15000 }),
  armed: false,
  paused: false,
  startTimeMs: null,
  cameraMode: 0,
  difficulty: difficultySelect.value,
  graphics: graphicsSelect.value,
  progress: 0,
  lastHudSecond: -1,
  fixedAccumulator: 0,
  actualInput: { steer: 0, throttle: 0, brake: 0 },
  countdownCue: null,
  fpsFrames: 0,
  fpsTime: 0,
  fps: 0,
  extendBannerUntil: 0,
  playerCollisionUntil: 0,
  collisionReason: "—",
};
let inputState = input.poll();
const emptyInput = Object.freeze({
  steer: 0, throttle: 0, brake: 0, cameraToggle: false, pauseToggle: false,
  reset: false, diagnosticsToggle: false, connected: false, gamepadId: "", mapping: "", rawAxes: [], rawButtons: [],
});

for (const opponent of opponents) opponent.driver = createOpponentDriver(opponent.id, {
  laneOffset: Math.max(-1, Math.min(1, opponent.laneOffset / 6.5)),
  skill: 0.64,
  maxSpeedMps: 88,
});

const mapMarkers = new Map();
for (const racer of opponents) {
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  marker.setAttribute("r", "1.7");
  marker.setAttribute("class", "map-car-dot");
  marker.setAttribute("fill", `#${opponentPalette[(racer.id - 1) % opponentPalette.length].toString(16).padStart(6, "0")}`);
  minimapCars.append(marker);
  mapMarkers.set(racer.id, marker);
}

function readBestLap() {
  try {
    const value = Number(window.localStorage.getItem(BEST_LAP_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function saveBestLap(value) {
  try {
    window.localStorage.setItem(BEST_LAP_KEY, String(value));
    return true;
  } catch {
    return false;
  }
}

let personalBest = bestLapMs;

function formatTime(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return "--:--.---";
  const totalMs = Math.floor(milliseconds);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const millis = totalMs % 1000;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function formatCountdown(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function orderedRacers() {
  return rankRacers(racers.map((racer) => ({
    id: racer.id,
    completedLaps: racer.completedLaps,
    progress: Math.min(1, Math.max(0, racer.progress)),
  })));
}

function refreshTelemetry(now = performance.now()) {
  const race = game.race;
  const elapsed = race.status === "racing" && race.lapStartedAt !== null
    ? race.raceTimeElapsedMs - race.lapStartedAt : null;
  const remaining = race.status === "countdown" ? Math.max(0, Math.ceil(race.countdownRemainingMs / 1000)) : Math.ceil(race.timeRemainingMs / 1000);
  timerValue.textContent = race.status === "finished" ? "00" : String(remaining).padStart(2, "0");
  lapTimeValue.textContent = formatTime(elapsed);
  const visibleLap = race.status === "racing" || race.status === "countdown" ? race.completedLaps + 1 : race.completedLaps;
  lapValue.querySelector(".lap-number").textContent = String(visibleLap).padStart(2, "0");
  lapValue.querySelector(".lap-total").textContent = `/ ${String(race.totalLaps).padStart(2, "0")}`;
  lastLapValue.textContent = formatTime(race.lastLapMs);
  bestValue.textContent = formatTime(personalBest);
  speedValue.textContent = String(Math.round(Math.abs(player.physics.speedMps) * 3.6));
  positionTotal.textContent = String(racers.length);
  const ranking = orderedRacers();
  const rank = ranking.findIndex((racer) => racer.id === player.id) + 1;
  positionLabelValue.textContent = String(rank).padStart(2, "0");
  positionLabelValue.setAttribute("aria-label", `Posição ${rank} de ${racers.length}`);
  [...positionList.children].forEach((item, index) => item.classList.toggle("is-player", index === rank - 1));
  difficultyValue.textContent = difficultySelect.selectedOptions[0].textContent.toUpperCase();
  if (trackName) trackName.textContent = activeTrack.name.toUpperCase();
  cameraValue.textContent = cameraModeLabels[game.cameraMode];
  controllerStatus.textContent = inputState.connected
    ? `GAMEPAD · ${inputState.gamepadId || "CONECTADO"}`
    : "TECLADO · GAMEPAD NÃO ATIVO";
  diagnosticsValue.textContent = [
    `Dispositivo: ${inputState.gamepadId || "teclado"}`,
    `Mapeamento: ${inputState.mapping || "—"}`,
    `Eixos: ${inputState.rawAxes.map((axis) => axis.toFixed(2)).join(", ") || "—"}`,
    `Botões/gatilhos: ${inputState.rawButtons.map((button) => button.value.toFixed(2)).join(", ") || "—"}`,
    `Direção normalizada: ${game.actualInput.steer.toFixed(2)}`,
    `Aceleração: ${game.actualInput.throttle.toFixed(2)}`,
    `Frenagem: ${game.actualInput.brake.toFixed(2)}`,
    `Velocidade: ${(player.physics.speedMps * 3.6).toFixed(1)} km/h`,
    `Colisão/contenção: ${game.collisionReason}`,
    `Curva t: ${player.trackProgress?.toFixed(4) ?? "—"} · total m: ${player.totalDistance.toFixed(1)}`,
    `FPS aproximados: ${game.fps || "—"}`,
    `Pista: ${activeTrack.id} (${trackCurve.getLength().toFixed(0)} m)`,
    `Dificuldade: ${game.difficulty} · AI máx ${difficultyProfiles[game.difficulty].aiMaxSpeedMps.toFixed(1)} m/s · habilidade ${difficultyProfiles[game.difficulty].aiSkill.toFixed(2)}`,
    `Gráficos: ${game.graphics} · DPR ${renderer.getPixelRatio().toFixed(2)} · sombras ${renderer.shadowMap.enabled ? "on" : "off"} · mapa ${sunlight.shadow.mapSize.width}px`,
    `Câmera: ${cameraModeLabels[game.cameraMode]} · track ${activeTrack.id}`,
  ].join("\n");
  const playerPoint = projectToMap(player.physics);
  minimapPlayer.setAttribute("cx", playerPoint.x.toFixed(1));
  minimapPlayer.setAttribute("cy", playerPoint.y.toFixed(1));
  minimapPlayer.removeAttribute("transform");
  minimapPlayer.setAttribute("visibility", "visible");
  for (const opponent of opponents) {
    const marker = mapMarkers.get(opponent.id);
    const point = projectToMap(opponent.physics);
    marker.setAttribute("cx", point.x.toFixed(1));
    marker.setAttribute("cy", point.y.toFixed(1));
  }
  extendBanner.hidden = performance.now() > game.extendBannerUntil;
  if (race.status === "racing" && Math.ceil(race.timeRemainingMs / 1000) !== game.lastHudSecond) {
    game.lastHudSecond = Math.ceil(race.timeRemainingMs / 1000);
  }
  updateCheckpointIndicators();
}

function projectToMap(state) {
  return {
    x: mapProjection.offsetX + (state.x - mapView.minX) * mapProjection.scale,
    y: mapProjection.offsetY + (state.z - mapView.minZ) * mapProjection.scale,
  };
}

function resetCar() {
  const length = trackCurve.getLength();
  const gridProgress = 0.998;
  const laneOffsets = [-2.15, 2.15];
  for (const racer of racers) {
    const row = racer.id === 0 ? 0 : Math.ceil(racer.id / 2);
    const column = racer.id === 0 ? 0 : (racer.id - 1) % 2;
    const progress = (gridProgress - row * 9 / length + 1) % 1;
    const sample = trackSample(progress);
    const laneOffset = racer.id === 0 ? 0 : laneOffsets[column];
    const state = createVehicleState({
      x: sample.point.x + sample.right.x * laneOffset,
      y: sample.point.y,
      z: sample.point.z + sample.right.z * laneOffset,
      yaw: sample.yaw,
    });
    racer.physics = state;
    racer.car.root.position.set(state.x, state.y + (sportsCarDimensions.groundClearance || 0.18), state.z);
    racer.car.root.rotation.y = state.yaw;
    racer.car.bodyGroup.rotation.set(0, 0, 0);
    racer.laneOffset = laneOffset;
    racer.completedLaps = 0;
    racer.progress = 0;
    racer.trackStartProgress = progress;
    racer.trackProgress = progress;
    racer.previousDistance = progress * length;
    racer.totalDistance = 0;
    racer.previousProgress = progress;
    racer.previousPhysicsPosition = new THREE.Vector3(state.x, state.y, state.z);
    racer.nextCheckpoint = 0;
    racer.started = false;
    racer.lapStartedAt = null;
    racer.race = createRace(CHECKPOINT_POSITIONS.length, 3, {
      initialTimeMs: 58000,
      checkpointBonusMs: 15000,
      countdownMs: 3000,
    });
    if (racer.id !== 0) {
      racer.race = beginCountdown(racer.race).race;
      racer.started = true;
    }
    racer.lastInput = { steer: 0, throttle: 0, brake: 0 };
    if (racer.id !== 0) {
      const profile = difficultyProfiles[game.difficulty] ?? difficultyProfiles.medium;
      racer.driver = createOpponentDriver(racer.id, {
        laneOffset: Math.max(-1, Math.min(1, laneOffset / 5.2)),
        skill: Math.max(0, Math.min(1, profile.aiSkill + ((racer.id * 7) % 5) * 0.015)),
        maxSpeedMps: Math.min(MAX_SPEED_MPS, profile.aiMaxSpeedMps + ((racer.id * 11) % 4) * 1.2),
      });
    }
  }
  game.race = player.race;
  game.armed = false;
  game.collisionReason = "—";
  game.paused = false;
  game.startTimeMs = null;
  game.raceTimeMs = 0;
  game.progress = 0;
  game.fixedAccumulator = 0;
  game.lastHudSecond = 58;
  extendBanner.hidden = true;
  resultsPanel.hidden = true;
  pauseOverlay.hidden = true;
  countdownOverlay.hidden = true;
  app.dataset.state = "ready";
  refreshTelemetry();
  updateCamera(1, true);
}

function finishRace() {
  game.armed = false;
  inputState = emptyInput;
  countdownOverlay.hidden = true;
  pauseOverlay.hidden = true;
  startButton.hidden = true;
  app.dataset.state = "finished";
  resultPosition.textContent = `${positionLabelValue.textContent} / ${racers.length}`;
  resultTime.textContent = formatTime(game.race.totalTimeMs);
  resultBest.textContent = formatTime(personalBest);
  resultsPanel.hidden = false;
  audio?.pause();
  audio?.emit("race-finished");
  updateCheckpointIndicators();
  raceStatus.textContent = "Corrida finalizada. Seu resultado está pronto.";
  restartButton.focus();
}

function handleCheckpoint(now) {
  for (const racer of racers) {
    if (!racer.started || racer.race.status !== "racing" && racer.race.status !== "countdown") continue;
    const index = racer.race.nextCheckpoint;
    const gate = gates[index];
    const previous = racer.previousPhysicsPosition;
    if (!previous) continue;
    const current = new THREE.Vector3(racer.physics.x, racer.physics.y, racer.physics.z);
    const previousSide = previous.clone().sub(gate.point).dot(gate.tangent);
    const currentSide = current.clone().sub(gate.point).dot(gate.tangent);
    if (!(previousSide < 0 && currentSide >= 0)) continue;

    const fraction = previousSide / (previousSide - currentSide);
    const crossingPoint = previous.clone().lerp(current, fraction);
    const lateralDistance = crossingPoint.clone().sub(gate.point).dot(gate.right);
    if (Math.abs(lateralDistance) > TRACK_HALF_WIDTH - 0.5) continue;

    const result = passCheckpoint(racer.race, index, racer.race.raceTimeElapsedMs);
    racer.race = result.race;
    if (racer.id !== 0) {
      if (result.event.type === "lap-started") racer.started = true;
      if (result.event.type === "lap-completed" || result.event.type === "race-finished") {
        racer.completedLaps = result.event.completedLaps;
      }
      continue;
    }
    game.race = racer.race;
    const event = result.event;
    if (event.type === "lap-started") {
      player.started = true;
      raceStatus.textContent = "VALENDO! CRUZE OS CHECKPOINTS E ESTENDA O TEMPO.";
    } else if (event.type === "checkpoint-passed") {
      const bonus = event.extendTimeMs ?? 0;
      if (bonus > 0) {
        game.extendBannerUntil = performance.now() + 1800;
        audio?.emit("checkpoint-passed");
      }
      raceStatus.textContent = `CHECKPOINT ${event.checkpointIndex} · +${Math.ceil(bonus / 1000)}s`;
    } else if (event.type === "lap-completed" || event.type === "race-finished") {
      racer.completedLaps = event.completedLaps;
      lastLapValue.textContent = formatTime(event.lapTimeMs);
      if (personalBest === null || event.lapTimeMs < personalBest) {
        personalBest = event.lapTimeMs;
        saveBestLap(personalBest);
        raceStatus.textContent = `NOVA MELHOR VOLTA · ${formatTime(personalBest)}`;
      } else {
        raceStatus.textContent = `VOLTA ${event.completedLaps} · ${formatTime(event.lapTimeMs)}`;
      }
      if (event.type === "race-finished") {
        game.race = racer.race;
        finishRace();
      }
    }
  }
  if (now !== null) refreshTelemetry(now);
}

function nearestTrackSample(position) {
  let best = trackSamples[0];
  let bestDistance = Infinity;
  for (const sample of trackSamples) {
    const dx = position.x - sample.point.x;
    const dz = position.z - sample.point.z;
    const distance = dx * dx + dz * dz;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = sample;
    }
  }
  return best;
}

function constrainVehicle(racer) {
  const sample = nearestTrackSample(new THREE.Vector3(racer.physics.x, racer.physics.y, racer.physics.z));
  const lateral = new THREE.Vector3(racer.physics.x, sample.point.y, racer.physics.z)
    .sub(sample.point).dot(sample.right);
  const limit = TRACK_HALF_WIDTH - 1.3;
  let speedScale = 1;
  if (Math.abs(lateral) > limit) {
    const wasOutside = Math.abs(racer.lastTrackLateral ?? 0) > limit;
    const corrected = Math.sign(lateral) * limit;
    const outwardSign = Math.sign(racer.physics.lateralMps);
    const movingOutward = outwardSign === Math.sign(lateral);
    const position = new THREE.Vector3(racer.physics.x, sample.point.y, racer.physics.z)
      .addScaledVector(sample.right, corrected - lateral);
    racer.physics = { ...racer.physics, x: position.x, y: sample.point.y, z: position.z };
    speedScale = movingOutward ? (wasOutside ? 0.9995 : 0.72) : 1;
    if (movingOutward) {
      racer.physics = { ...racer.physics, lateralMps: -racer.physics.lateralMps * 0.18 };
    }
    if (!wasOutside) game.collisionReason = `limite de pista (${lateral.toFixed(1)} m)`;
    racer.lastCollision = true;
  }
  racer.lastTrackLateral = lateral;
  racer.lastTrackCollision = speedScale < 1;
  if (racer.lastTrackCollision && !racer.trackCollisionActive) game.collisionReason = `limite de pista (${lateral.toFixed(1)} m)`;
  racer.trackCollisionActive = racer.lastTrackCollision;
  if (speedScale < 1) racer.physics = { ...racer.physics, speedMps: racer.physics.speedMps * speedScale };
}

const SPORTS_CAR_HALF_LENGTH = sportsCarDimensions.length / 2;
const SPORTS_CAR_HALF_WIDTH = sportsCarDimensions.width / 2;

function resolveVehicleCollisions() {
  let playerContact = false;
  for (let first = 0; first < racers.length; first += 1) {
    const racer = racers[first];
    for (let second = first + 1; second < racers.length; second += 1) {
      const other = racers[second];
      const lowerA = racer.physics.y;
      const upperA = lowerA + sportsCarDimensions.height;
      const lowerB = other.physics.y;
      const upperB = lowerB + sportsCarDimensions.height;
      const verticalPenetration = Math.min(upperA, upperB) - Math.max(lowerA, lowerB);
      if (verticalPenetration <= 0) continue;
      const forward = new THREE.Vector3(-Math.sin(racer.physics.yaw), 0, -Math.cos(racer.physics.yaw));
      const right = new THREE.Vector3(Math.cos(racer.physics.yaw), 0, -Math.sin(racer.physics.yaw));
      const otherForward = new THREE.Vector3(-Math.sin(other.physics.yaw), 0, -Math.cos(other.physics.yaw));
      const otherRight = new THREE.Vector3(Math.cos(other.physics.yaw), 0, -Math.sin(other.physics.yaw));
      const offset = new THREE.Vector3(racer.physics.x - other.physics.x, 0, racer.physics.z - other.physics.z);
      const axes = [forward, right, otherForward, otherRight];
      let minPenetration = Infinity;
      let normal = null;
      for (const axis of axes) {
        const firstRadius = SPORTS_CAR_HALF_LENGTH * Math.abs(forward.dot(axis)) + SPORTS_CAR_HALF_WIDTH * Math.abs(right.dot(axis));
        const secondRadius = SPORTS_CAR_HALF_LENGTH * Math.abs(otherForward.dot(axis)) + SPORTS_CAR_HALF_WIDTH * Math.abs(otherRight.dot(axis));
        const projectedDistance = offset.dot(axis);
        const overlap = firstRadius + secondRadius - Math.abs(projectedDistance);
        if (overlap <= 0) {
          minPenetration = 0;
          break;
        }
        if (overlap < minPenetration) {
          minPenetration = overlap;
          normal = axis.clone().multiplyScalar(Math.sign(projectedDistance || (racer.id < other.id ? 1 : -1)));
        }
      }
      if (!(minPenetration > 0) || !normal) continue;

      const separation = Math.min(minPenetration + 0.025, 1.5);
      const normalSpeed = (racer.physics.speedMps * forward.x + racer.physics.lateralMps * right.x
        - other.physics.speedMps * otherForward.x - other.physics.lateralMps * otherRight.x) * normal.x
        + (racer.physics.speedMps * forward.z + racer.physics.lateralMps * right.z
          - other.physics.speedMps * otherForward.z - other.physics.lateralMps * otherRight.z) * normal.z;
      const inverseMassA = 1 / (racer.id === 0 ? 1.1 : 1);
      const inverseMassB = 1 / (other.id === 0 ? 1.1 : 1);
      const totalInverseMass = inverseMassA + inverseMassB;
      racer.physics = {
        ...racer.physics,
        x: racer.physics.x + normal.x * separation * inverseMassA / totalInverseMass,
        z: racer.physics.z + normal.z * separation * inverseMassA / totalInverseMass,
      };
      other.physics = {
        ...other.physics,
        x: other.physics.x - normal.x * separation * inverseMassB / totalInverseMass,
        z: other.physics.z - normal.z * separation * inverseMassB / totalInverseMass,
      };
      if (normalSpeed < 0) {
        const impulse = -(1.08 * normalSpeed) / totalInverseMass;
        racer.physics = {
          ...racer.physics,
          speedMps: Math.max(0, racer.physics.speedMps + impulse * inverseMassA * forward.dot(normal)),
          lateralMps: racer.physics.lateralMps + impulse * inverseMassA * right.dot(normal),
        };
        other.physics = {
          ...other.physics,
          speedMps: Math.max(0, other.physics.speedMps - impulse * inverseMassB * otherForward.dot(normal)),
          lateralMps: other.physics.lateralMps - impulse * inverseMassB * otherRight.dot(normal),
        };
      }
      racer.car.root.position.set(racer.physics.x, racer.physics.y + (sportsCarDimensions.groundClearance || 0.18), racer.physics.z);
      other.car.root.position.set(other.physics.x, other.physics.y + (sportsCarDimensions.groundClearance || 0.18), other.physics.z);
      racer.collisionPairs = [...(racer.collisionPairs ?? []), other.id];
      other.collisionPairs = [...(other.collisionPairs ?? []), racer.id];
      if (racer.id === 0 || other.id === 0) {
        playerContact = true;
        game.collisionReason = `carro ${racer.id === 0 ? other.id : racer.id} · overlap ${minPenetration.toFixed(2)}m`;
      }
    }
  }
  if (playerContact && !player.collisionActive) audio?.emit("collision");
  player.collisionActive = playerContact;
}

function distanceToTravelAlongTrack(startProgress, distanceM) {
  return (startProgress * trackCurve.getLength() + distanceM + trackCurve.getLength()) % trackCurve.getLength();
}

function opponentObservation(racer) {
  const trackLength = trackCurve.getLength();
  const sample = nearestTrackSample(new THREE.Vector3(racer.physics.x, racer.physics.y, racer.physics.z));
  const forward = new THREE.Vector3(-Math.sin(racer.physics.yaw), 0, -Math.cos(racer.physics.yaw));
  const dot = THREE.MathUtils.clamp(forward.dot(sample.tangent), -1, 1);
  const headingError = Math.atan2(new THREE.Vector3().crossVectors(sample.tangent, forward).y, dot);
  const lateralError = new THREE.Vector3(racer.physics.x, sample.point.y, racer.physics.z).sub(sample.point).dot(sample.right);
  const progress = sample.progress;
  const ahead = trackSample((progress + 32 / trackLength) % 1);
  const distanceToAhead = Math.max(3, Math.hypot(ahead.point.x - sample.point.x, ahead.point.z - sample.point.z));
  const forwardAhead = new THREE.Vector3(-ahead.tangent.x, 0, -ahead.tangent.z);
  const curveSharpness = THREE.MathUtils.clamp(1 - sample.tangent.dot(ahead.tangent), 0, 1);
  const targetSpeedMps = Math.min(racer.driver.maxSpeedMps, Math.sqrt(40 * distanceToAhead));
  const traffic = racers
    .filter((other) => other.id !== racer.id && Number.isFinite(other.trackProgress))
    .map((other) => {
      const signedProgress = ((other.trackProgress - progress + 1.5) % 1) - 0.5;
      return {
        lane: Math.max(-1, Math.min(1, Math.round(other.laneOffset / 2.15))),
        gapMeters: signedProgress * trackLength,
        trackProgress: other.trackProgress,
        relativeSpeedMps: racer.physics.speedMps - other.physics.speedMps,
      };
    });
  const blockedLanes = traffic.filter((carAhead) => carAhead.gapMeters >= 0 && carAhead.gapMeters < 8).map(({ lane }) => lane);
  void forwardAhead;
  return {
    headingError,
    lateralError,
    speedMps: racer.physics.speedMps,
    targetSpeedMps,
    curveSharpness,
    blockedLanes,
    trafficAhead: traffic,
    deltaSeconds: 1 / 120,
    trackProgress: progress,
    laneOffset: Math.max(-1, Math.min(1, racer.laneOffset / 5.2)),
  };
}

function updateRacer(racer, controls, deltaSeconds) {
  racer.lastCollision = false;
  const previous = new THREE.Vector3(racer.physics.x, racer.physics.y, racer.physics.z);
  racer.lastInput = controls;
  const contactConfig = {
    surfaceHeight: (x, z) => nearestTrackSample(new THREE.Vector3(x, 0, z)).point.y + 0.18,
    verticalFollowRate: 16,
  };
  racer.physics = stepVehicle(racer.physics, controls, deltaSeconds, contactConfig);
  constrainVehicle(racer);
  racer.car.root.position.set(racer.physics.x, racer.physics.y + (sportsCarDimensions.groundClearance || 0.18), racer.physics.z);
  racer.car.root.rotation.y = racer.physics.yaw;
  const driftAngle = Math.atan2(racer.physics.lateralMps, Math.max(1, Math.abs(racer.physics.speedMps)));
  racer.car.bodyGroup.rotation.z = -THREE.MathUtils.clamp(driftAngle * 0.28 - controls.steer * Math.abs(racer.physics.speedMps) * 0.0011, -0.1, 0.1);
  racer.car.wheels.forEach((wheel) => { wheel.rotation.x = racer.physics.wheelRotation; });
  racer.car.steeringWheels.forEach((wheel) => { wheel.rotation.y = controls.steer * 0.18; });
  racer.previousPhysicsPosition = previous;
  if (racer.id === 0 && racer.lastCollision) audio?.emit("collision");
  const sample = nearestTrackSample(racer.physics);
  const distance = sample.progress * trackCurve.getLength();
  racer.trackProgress = sample.progress;
  let progressDelta = distance - racer.previousDistance;
  if (progressDelta < -trackCurve.getLength() / 2) progressDelta += trackCurve.getLength();
  if (progressDelta > trackCurve.getLength() / 2) progressDelta -= trackCurve.getLength();
  if (racer.id === 0 && game.race.status === "racing" && progressDelta > 0) player.totalDistance += progressDelta;
  else if (racer.id !== 0 && progressDelta > 0) racer.totalDistance += progressDelta;
  racer.previousDistance = distance;
  racer.progress = ((racer.totalDistance / trackCurve.getLength()) % 1 + 1) % 1;
}

function updateRivals(deltaSeconds) {
  for (const rival of opponents) {
    if (!rival.started || game.race.status !== "racing") continue;
    const observation = opponentObservation(rival);
    const decision = updateOpponentDriver(rival.driver, observation);
    rival.driver = decision.driver;
    rival.laneOffset = decision.laneOffset * 5.2;
    rival.lastInput = decision.controls;
    updateRacer(rival, decision.controls, deltaSeconds);
  }
}

function updateCamera(deltaSeconds, snap = false) {
  const heading = player.physics.yaw;
  const forward = new THREE.Vector3(-Math.sin(heading), 0, -Math.cos(heading));
  const carPosition = car.root.position;
  if (cameraMode === 1) {
    camera = cameraCockpit;
    camera.position.copy(carPosition).add(new THREE.Vector3(0, 1.1, 0.65));
    camera.lookAt(carPosition.clone().addScaledVector(forward, 25));
    return camera;
  }
  const targetCamera = cameraMode === 2 ? cameraFar : cameraMode === 3 ? cameraElevated : cameras[0];
  if (camera !== targetCamera) camera = targetCamera;
  if (cameraMode === 3) {
    camera.position.set(trackBounds.center.x, maxTrackHeight + 920, trackBounds.center.z + 6);
    camera.up.set(0, 0, -1);
    camera.lookAt(trackBounds.center.x, 0, trackBounds.center.z);
    const spanX = trackBounds.maxX - trackBounds.minX;
    const spanZ = trackBounds.maxZ - trackBounds.minZ;
    const aspect = camera.aspect || 1;
    const height = Math.max(spanZ + 160, (spanX + 160) / aspect);
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.left = -height * aspect / 2;
    camera.right = height * aspect / 2;
    camera.updateProjectionMatrix();
    return camera;
  }
  const distance = cameraMode === 2 ? 54 : 29;
  const height = cameraMode === 2 ? 15 : 8.4;
  const desired = carPosition.clone().addScaledVector(forward, -distance).add(new THREE.Vector3(0, height, 0));
  const lookAt = carPosition.clone().addScaledVector(forward, 46).add(new THREE.Vector3(0, 1.8, 0));
  if (snap) camera.position.copy(desired);
  else camera.position.lerp(desired, 1 - Math.exp(-4.5 * deltaSeconds));
  const speedRatio = THREE.MathUtils.clamp(Math.abs(player.physics.speedMps) / MAX_SPEED_MPS, 0, 1);
  const targetFov = 39 + speedRatio * 9;
  if (Math.abs(camera.fov - targetFov) > 0.05) {
    camera.fov += (targetFov - camera.fov) * (1 - Math.exp(-2.5 * deltaSeconds));
    camera.updateProjectionMatrix();
  }
  camera.lookAt(lookAt);
  return camera;
}

function advanceSimulation(deltaSeconds) {
  if (!game.armed || game.paused) return;
  for (const racer of racers) racer.collisionPairs = [];
  const inputSnapshot = inputState;
  const startCrossedBefore = player.started;
    let steer = inputSnapshot.steer;
  let throttle = inputSnapshot.throttle;
  let brake = inputSnapshot.brake;
  if (game.race.status === "countdown") {
    game.race = advanceRace(game.race, deltaSeconds * 1000).race;
    player.race = game.race;
    for (const rival of opponents) {
      if (rival.race.status === "countdown") rival.race = advanceRace(rival.race, deltaSeconds * 1000).race;
    }
    const nextNumber = Math.ceil(game.race.countdownRemainingMs / 1000);
    countdownValue.textContent = nextNumber > 0 ? String(nextNumber) : "GO!";
    countdownOverlay.hidden = false;
    app.dataset.state = "countdown";
    if (nextNumber < game.countdownCue && nextNumber > 0) {
      game.countdownCue = nextNumber;
      audio?.emit({ type: "countdown-tick", count: nextNumber });
    }
    if (game.race.status === "racing") {
      player.started = true;
      for (const rival of opponents) rival.started = true;
      countdownOverlay.hidden = true;
      app.dataset.state = "racing";
      game.startTimeMs = performance.now();
      audio?.emit("green-flag");
      raceStatus.textContent = "VALENDO! CRUZE OS CHECKPOINTS E ESTENDA O TEMPO.";
      throttle = inputSnapshot.throttle;
      brake = inputSnapshot.brake;
      steer = inputSnapshot.steer;
    } else {
      throttle = 0;
      brake = 0;
    }
  } else if (game.race.status === "racing") {
    const result = advanceRace(game.race, deltaSeconds * 1000);
    game.race = result.race;
    player.race = game.race;
    game.raceTimeMs = game.race.raceTimeElapsedMs;
    for (const rival of opponents) {
      if (rival.race.status === "racing") rival.race = advanceRace(rival.race, deltaSeconds * 1000).race;
    }
    app.dataset.state = "racing";
    countdownOverlay.hidden = true;
    if (result.event?.type === "time-expired") finishRace();
  }

  if (game.race.status === "racing" && player.started) {
    game.actualInput = {
      steer,
      throttle,
      brake,
    };
    if (game.actualInput.throttle * game.actualInput.brake > 0) game.actualInput.throttle = 0;
    updateRacer(player, game.actualInput, deltaSeconds);
    updateRivals(deltaSeconds);
    resolveVehicleCollisions();
    handleCheckpoint(performance.now());
  } else {
    game.actualInput = { steer: 0, throttle: 0, brake: 0 };
  }
  audio?.update({
    speed: player.physics.speedMps,
    throttle: game.actualInput.throttle,
    brake: game.actualInput.brake,
    drift: Math.abs(player.physics.lateralMps) > 4 ? THREE.MathUtils.clamp(Math.abs(player.physics.lateralMps) / 14, 0, 1) : 0,
  });
  game.progress = player.totalDistance / trackCurve.getLength();
  refreshTelemetry(performance.now());
}

function resizeRenderer() {
  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);
  renderer.setSize(width, height, false);
  for (const view of cameras) {
    view.aspect = width / height;
    view.updateProjectionMatrix();
  }
}

let unpauseInput = createInputController({});

function updateGraphicsSetting() {
  game.graphics = graphicsSelect.value;
  applyGraphicsProfile();
  if (game.armed) raceStatus.textContent = `GRÁFICOS ${graphicsSelect.selectedOptions[0].textContent.toUpperCase()} APLICADOS.`;
}

function startRace() {
  game.difficulty = difficultySelect.value;
  game.graphics = graphicsSelect.value;
  if (trackSelect && trackSelect.value !== activeTrack.id) {
    const next = new URL(location.href);
    next.searchParams.set("track", trackSelect.value);
    location.href = next.href;
    return;
  }
  resetCar();
  game.race = beginCountdown(player.race).race;
  player.race = game.race;
  for (const rival of opponents) {
    rival.race = beginCountdown(rival.race).race;
    rival.started = true;
  }
  inputState = input.poll();
  if (!audio) audio = createRacingAudio();
  audio.unlock().catch((error) => console.warn("Áudio indisponível:", error));
  game.countdownCue = 3;
  countdownValue.textContent = "3";
  countdownOverlay.hidden = false;
  audio.emit({ type: "countdown-tick", count: 3 });
  game.armed = true;
  app.dataset.state = "countdown";
  startButton.hidden = true;
  raceStatus.textContent = `3 · ${activeTrack.name.toUpperCase()} · PREPARE-SE PARA A LARGADA`;
  raceStatus.focus();
}

function prepareRestart() {
  resultsPanel.hidden = true;
  startButton.hidden = false;
  startButton.disabled = false;
  pauseOverlay.hidden = true;
  app.dataset.state = "ready";
  resetCar();
  game.armed = false;
  inputState = input.poll();
  startButton.focus();
}

function toggleRacePause() {
  if (!["countdown", "racing", "paused"].includes(game.race.status)) return;
  game.race = togglePause(game.race);
  player.race = game.race;
  game.paused = game.race.status === "paused";
  app.dataset.state = game.paused ? "paused" : game.race.status;
  pauseOverlay.hidden = !game.paused;
  countdownOverlay.hidden = game.race.status !== "countdown";
  if (game.paused) {
    inputState = emptyInput;
    audio?.pause();
    resumeButton.focus();
  } else {
    audio?.resume().catch((error) => console.warn("Áudio pausado:", error));
    raceStatus.focus();
  }
}

function resetToTrack() {
  const sample = nearestTrackSample(player.physics);
  const snapped = { ...player.physics, x: sample.point.x, y: sample.point.y, z: sample.point.z, yaw: sample.yaw, speedMps: Math.min(14, Math.abs(player.physics.speedMps) * 0.35), lateralMps: 0 };
  player.physics = snapped;
  car.root.position.set(snapped.x, snapped.y + (sportsCarDimensions.groundClearance || 0.18), snapped.z);
  car.root.rotation.y = snapped.yaw;
  player.previousPhysicsPosition = new THREE.Vector3(snapped.x, snapped.y, snapped.z);
  raceStatus.textContent = "Veículo reposicionado na pista.";
}

function cycleCamera() {
  game.cameraMode = (game.cameraMode + 1) % cameras.length;
  cameraMode = game.cameraMode;
  camera = cameras[cameraMode];
  updateCamera(0, true);
  refreshTelemetry();
}

function handleRaceInput() {
  inputState = input.poll();
  if (inputState.cameraToggle) cycleCamera();
  if (inputState.pauseToggle) toggleRacePause();
  if (inputState.reset) resetToTrack();
  if (inputState.diagnosticsToggle) {
    diagnosticsPanel.hidden = !diagnosticsPanel.hidden;
    diagnosticsPanel.open = !diagnosticsPanel.hidden;
  }
}

startButton.addEventListener("click", startRace);
restartButton.addEventListener("click", prepareRestart);
resumeButton.addEventListener("click", toggleRacePause);
difficultySelect.addEventListener("change", () => {
  game.difficulty = difficultySelect.value;
  difficultyValue.textContent = difficultySelect.selectedOptions[0].textContent.toUpperCase();
  raceStatus.textContent = app.dataset.state === "racing" || app.dataset.state === "countdown"
    ? `DIFICULDADE ${difficultyValue.textContent} SERÁ APLICADA À PRÓXIMA LARGADA.`
    : `DIFICULDADE ${difficultyValue.textContent}.`;
});
graphicsSelect.addEventListener("change", updateGraphicsSetting);
trackSelect?.addEventListener("change", () => {
  if (app.dataset.state === "racing" || app.dataset.state === "countdown") {
    trackSelect.value = activeTrack.id;
    raceStatus.textContent = "A pista só pode ser trocada antes da largada.";
    return;
  }
  const next = new URL(location.href);
  next.searchParams.set("track", trackSelect.value);
  location.href = next.href;
});
window.addEventListener("blur", () => { inputState = emptyInput; });

addEventListener("resize", resizeRenderer);
if ("ResizeObserver" in window) new ResizeObserver(resizeRenderer).observe(container);
resizeRenderer();
resetCar();
game.graphics = graphicsSelect.value;
applyGraphicsProfile();
renderer.render(scene, camera);

const supportedTestStates = new Set(["ready", "grid", "countdown", "active", "pause", "results"]);
window.__THREE_GAME_DIAGNOSTICS__ = {
  renderer: renderer.info,
  physics: { timestep: FIXED_PHYSICS_STEP_SECONDS, engine: "custom-kinematic", vehicles: racers.length },
  get state() {
    return {
      race: game.race.status,
      player: {
        modelType: player.car.root.userData?.sportsCar ? "sports-coupe" : "procedural-fallback",
        modelBounds: player.car.collisionProxy ? {
          min: player.car.collisionProxy.min.toArray(),
          max: player.car.collisionProxy.max.toArray(),
        } : null,
        x: player.physics.x,
        y: player.physics.y,
        z: player.physics.z,
        yaw: player.physics.yaw,
        speedMps: player.physics.speedMps,
        lateralMps: player.physics.lateralMps,
        progress: player.progress,
        trackProgress: player.trackProgress,
        totalDistanceM: player.totalDistance,
        throttle: game.actualInput.throttle,
        steer: game.actualInput.steer,
        brake: game.actualInput.brake,
      },
      rivals: opponents.map((racer) => ({ id: racer.id, modelType: racer.car.root.userData?.sportsCar ? "sports-coupe" : "procedural-fallback", x: racer.physics.x, y: racer.physics.y, z: racer.physics.z, progress: racer.progress, trackProgress: racer.trackProgress, laps: racer.completedLaps, speedMps: racer.physics.speedMps })),
      visibleVehicles: racers.filter((racer) => racer.car.root.visible && racer.car.root.parent === scene).length,
      visibleVehicleMeshes: racers.reduce((count, racer) => count + racer.car.root.children.filter((child) => child.visible && child.isMesh).length, 0),
      vehicleBounds: sportsCarDimensions,
      rank: orderedRacers().findIndex((racer) => racer.id === player.id) + 1,
      countdownMs: game.race.countdownRemainingMs,
      timeRemainingMs: game.race.timeRemainingMs,
      completedLaps: game.race.completedLaps,
      framesPerSecond: game.fps,
      lastCollision: game.collisionReason,
      roadLengthM: trackCurve.getLength(),
      trackId: activeTrack.id,
      trackName: activeTrack.name,
      difficulty: game.difficulty,
      graphics: game.graphics,
      cameraMode: game.cameraMode,
      contextLost: rendererContextLost,
      renderingProfile: {
        id: game.graphics,
        pixelRatio: renderer.getPixelRatio(),
        shadowsEnabled: renderer.shadowMap.enabled,
        sunCastsShadow: sunlight.castShadow,
        shadowMapWidth: sunlight.shadow.mapSize.width,
        shadowMapHeight: sunlight.shadow.mapSize.height,
        toneMappingExposure: renderer.toneMappingExposure,
      },
      aiProfile: difficultyProfiles[game.difficulty],
      rivalsConfig: opponents.map((racer) => ({ id: racer.id, skill: racer.driver.skill, maxSpeedMps: racer.driver.maxSpeedMps })),
      canvas: { cssWidth: container.clientWidth, cssHeight: container.clientHeight, width: renderer.domElement.width, height: renderer.domElement.height },
    };
  },
};
window.__THREE_GAME_TEST_HOOKS__ = {
  async seed() { return { seed: 0, deterministic: true }; },
  async setState(state) {
    if (!supportedTestStates.has(state)) throw new Error(`Unknown test state: ${state}`);
    if (state === "ready" || state === "grid") {
      resultsPanel.hidden = true;
      startButton.hidden = false;
      startButton.disabled = false;
      game.armed = false;
      game.paused = false;
      resetCar();
      app.dataset.state = "ready";
      return { state: "ready" };
    }
    if (state === "countdown") {
      if (!game.armed) startRace();
      return { state: game.race.status };
    }
    if (state === "active") {
      if (!game.armed) startRace();
      game.race = beginCountdown(player.race).race;
      player.race = game.race;
      game.race = { ...game.race, countdownRemainingMs: 0, status: "racing" };
      player.race = game.race;
      player.started = true;
      player.race = passCheckpoint(player.race, 0, 0).race;
      game.race = player.race;
      countdownOverlay.hidden = true;
      app.dataset.state = "racing";
      return { state: "racing" };
    }
    if (state === "pause") {
      if (game.race.status === "ready") {
        game.race = beginCountdown(game.race).race;
        game.race = { ...game.race, status: "racing", countdownRemainingMs: 0 };
        player.race = game.race;
      }
      if (game.race.status !== "paused") toggleRacePause();
      return { state: game.race.status };
    }
    if (state === "results") {
      if (!game.armed) startRace();
      game.race = { ...game.race, status: "finished", finishReason: "test-state", completedLaps: 3, totalTimeMs: game.race.raceTimeElapsedMs };
      player.race = game.race;
      resultsPanel.hidden = false;
      app.dataset.state = "finished";
      return { state: "finished" };
    }
    throw new Error(`Unable to apply state: ${state}`);
  },
  setPausedForScreenshot(paused) {
    if (paused) {
      game.paused = true;
      app.dataset.state = "paused";
    } else {
      game.paused = game.race.status === "paused";
      app.dataset.state = game.race.status === "racing" ? "racing" : "ready";
    }
  },
  setReducedMotion(enabled) {
    document.documentElement.classList.toggle("test-reduced-motion", Boolean(enabled));
  },
  hideDebugUi() {
    diagnosticsPanel.hidden = true;
    diagnosticsPanel.open = false;
  },
};

  let previousFrameTime = performance.now();
  function animate() {
    requestAnimationFrame(animate);
    const frameTime = performance.now();
    const frameDelta = Math.min(Math.max((frameTime - previousFrameTime) / 1000, 0), 0.05);
    previousFrameTime = frameTime;
  handleRaceInput();
  if (!game.paused && game.armed) {
    game.fixedAccumulator = Math.min(game.fixedAccumulator + frameDelta, 0.16);
    while (game.fixedAccumulator >= FIXED_PHYSICS_STEP_SECONDS) {
      advanceSimulation(FIXED_PHYSICS_STEP_SECONDS);
      game.fixedAccumulator -= FIXED_PHYSICS_STEP_SECONDS;
    }
  }
  game.fpsFrames += 1;
  game.fpsTime += frameDelta;
  if (game.fpsTime >= 0.5) {
    game.fps = Math.round(game.fpsFrames / game.fpsTime);
    game.fpsFrames = 0;
    game.fpsTime = 0;
  }
  updateCamera(frameDelta);
  renderer.render(scene, camera);
}
animate();
startButton.disabled = false;
app.dataset.state = "ready";
raceStatus.textContent = "Escolha a dificuldade e inicie a corrida.";
})().catch((error) => {
  const app = document.querySelector("#race-app");
  const raceStatus = document.querySelector("#race-status");
  const startButton = document.querySelector("#start-button");
  const overlayTitle = document.querySelector("#overlay-title");
  const overlayCopy = document.querySelector("#overlay-copy");
  app.dataset.state = "error";
  startButton.disabled = true;
  overlayTitle.textContent = "Corrida indisponível";
  overlayCopy.textContent = `Falha real na inicialização: ${error.message || "erro inesperado."}`;
  raceStatus.textContent = `Falha ao iniciar a corrida: ${error.message || "erro inesperado."}`;
  console.error("Falha ao iniciar LunaRacer:", error);
});
