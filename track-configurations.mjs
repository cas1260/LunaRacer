// Trilhas autorais em metros; Interlagos é aproximação procedural, não levantamento topográfico.
// Os pontos de cada setor constroem a curva central, respeitando ordem e continuidade do percurso.

const POINT_COUNT = 256;
const CURVE_STEPS_PER_SEGMENT = 64;
const DIFFICULTIES = ["easy", "medium", "hard"];

function makeDifficultyProfiles(values) {
  return Object.freeze(Object.fromEntries(DIFFICULTIES.map((id, index) => [id, Object.freeze({
    id,
    label: ["Fácil", "Médio", "Difícil"][index],
    aiMaxSpeedMps: values[index][0],
    aiSkill: values[index][1],
  })])));
}

function point(x, z, y = 0) {
  return { x, y, z };
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

function catmullPoint(points, parameter) {
  const segment = Math.floor(parameter);
  const t = parameter - segment;
  const p0 = points[(segment - 1 + points.length) % points.length];
  const p1 = points[segment % points.length];
  const p2 = points[(segment + 1) % points.length];
  const p3 = points[(segment + 2) % points.length];
  const dt0 = Math.sqrt(distance(p0, p1)) || 1;
  const dt1 = Math.sqrt(distance(p1, p2)) || 1;
  const dt2 = Math.sqrt(distance(p2, p3)) || 1;

  return Object.fromEntries(["x", "y", "z"].map((axis) => {
    let tangent1 = (p1[axis] - p0[axis]) / dt0
      - (p2[axis] - p0[axis]) / (dt0 + dt1)
      + (p2[axis] - p1[axis]) / dt1;
    let tangent2 = (p2[axis] - p1[axis]) / dt1
      - (p3[axis] - p1[axis]) / (dt1 + dt2)
      + (p3[axis] - p2[axis]) / dt2;
    tangent1 *= dt1;
    tangent2 *= dt1;
    const c2 = -3 * p1[axis] + 3 * p2[axis] - 2 * tangent1 - tangent2;
    const c3 = 2 * p1[axis] - 2 * p2[axis] + tangent1 + tangent2;
    return [axis, p1[axis] + tangent1 * t + c2 * t * t + c3 * t * t * t];
  }));
}

function makeTrack({ id, name, sectorGeometry, targetLengthM, difficultyProfiles }) {
  const waypoints = [];
  const sectorWaypointEnds = [];
  for (const { name: sectorName, points } of sectorGeometry) {
    if (waypoints.length && distance(waypoints.at(-1), points[0]) > 1e-7) {
      throw new Error(`${id}: setor ${sectorName} não conecta ao anterior`);
    }
    waypoints.push(...(waypoints.length ? points.slice(1) : points));
    sectorWaypointEnds.push(waypoints.length - 1);
  }
  if (distance(waypoints.at(-1), waypoints[0]) < 1e-7) waypoints.pop();

  const denseCount = waypoints.length * CURVE_STEPS_PER_SEGMENT;
  const dense = Array.from({ length: denseCount }, (_, index) =>
    catmullPoint(waypoints, index / CURVE_STEPS_PER_SEGMENT));
  const cumulative = [0];
  for (let index = 1; index <= dense.length; index += 1) {
    cumulative.push(cumulative[index - 1] + distance(dense[index - 1], dense[index % dense.length]));
  }
  const scale = targetLengthM / cumulative.at(-1);
  const scaledDense = dense.map(({ x, y, z }) => ({ x: x * scale, y: y * scale, z: z * scale }));
  const scaledCumulative = cumulative.map((length) => length * scale);
  const totalLength = scaledCumulative.at(-1);
  const centerline = [];
  let edge = 0;
  for (let index = 0; index < POINT_COUNT; index += 1) {
    const target = totalLength * index / POINT_COUNT;
    while (scaledCumulative[edge + 1] < target) edge += 1;
    const fraction = (target - scaledCumulative[edge]) / (scaledCumulative[edge + 1] - scaledCumulative[edge]);
    const start = scaledDense[edge % dense.length];
    const end = scaledDense[(edge + 1) % dense.length];
    centerline.push(Object.freeze({
      x: start.x + (end.x - start.x) * fraction,
      y: start.y + (end.y - start.y) * fraction,
      z: start.z + (end.z - start.z) * fraction,
    }));
  }

  const sectorNames = sectorGeometry.map(({ name: sectorName }) => sectorName);
  const sectors = Object.freeze(sectorGeometry.map(({ name: sectorName }, index) => {
    const startDistance = index === 0 ? 0 : scaledCumulative[sectorWaypointEnds[index - 1] * CURVE_STEPS_PER_SEGMENT];
    const endDistance = index === sectorGeometry.length - 1
      ? totalLength
      : scaledCumulative[sectorWaypointEnds[index] * CURVE_STEPS_PER_SEGMENT];
    return Object.freeze({
      id: `${id}-sector-${index + 1}`,
      name: sectorName,
      startProgress: startDistance / totalLength,
      endProgress: endDistance / totalLength,
      checkpointProgress: (startDistance + endDistance) / (2 * totalLength),
    });
  }));
  const checkpoints = Object.freeze(sectors.map((sector, index) => Object.freeze({
    id: `${id}-checkpoint-${index + 1}`,
    sectorId: sector.id,
    name: sector.name,
    progress: sector.checkpointProgress,
  })));

  return Object.freeze({
    id,
    name,
    closed: true,
    centerline: Object.freeze(centerline),
    sectorNames: Object.freeze(sectorNames),
    sectors,
    checkpoints,
    requiredLaps: 3,
    initialTimeMs: 58000,
    timeExtensionMs: 15000,
    difficultyProfiles,
  });
}

const configurations = [
  makeTrack({
    id: "interlagos",
    name: "Interlagos",
    targetLengthM: 4450,
    sectorGeometry: [
      { name: "Reta dos Boxes", points: [point(-450, 400), point(0, 400), point(450, 400)] },
      { name: "S do Senna", points: [point(450, 400), point(560, 380, -1), point(640, 320, -3), point(650, 260, -5), point(600, 220, -6), point(540, 245, -6), point(520, 195, -5), point(580, 145, -4)] },
      { name: "Curva do Sol", points: [point(580, 145, -4), point(650, 80, -2), point(690, -15), point(680, -100), point(640, -130), point(600, -120, 6)] },
      { name: "Reta Oposta", points: [point(600, -120, 6), point(100, -120, 10), point(-520, -120, 12)] },
      { name: "Descida do Lago", points: [point(-520, -120, 12), point(-620, -155, 8), point(-660, -220), point(-650, -290, -2), point(-600, -330, -10), point(-520, -340, -13)] },
      { name: "Subida do Lago", points: [point(-520, -340, -13), point(-300, -340, -10), point(-80, -340, -5), point(160, -340, 1), point(420, -340, 7)] },
      { name: "Ferradura", points: [point(420, -340, 7), point(530, -350, 8), point(600, -400, 7), point(590, -455, 5), point(530, -480, 4), point(450, -470, 3)] },
      { name: "Laranjinha", points: [point(450, -470, 3), point(220, -460, 2), point(-40, -450, 1), point(-300, -440), point(-460, -425, -1)] },
      { name: "Pinheirinho", points: [point(-460, -425, -1), point(-550, -450, -2), point(-600, -505, -3), point(-550, -545, -4), point(-400, -550, -4), point(-250, -535, -3), point(-100, -520, -2)] },
      { name: "Bico de Pato", points: [point(-100, -520, -2), point(-30, -505, -1), point(55, -505), point(125, -520), point(180, -560), point(170, -620), point(210, -670), point(290, -690)] },
      { name: "Mergulho", points: [point(290, -690), point(420, -710, -2), point(560, -700, -7), point(660, -650, -10), point(720, -600, -13)] },
      { name: "Junção", points: [point(720, -600, -13), point(780, -500, -12), point(820, -380, -8), point(820, -220), point(810, -50), point(800, 110, 5)] },
      { name: "Subida aos boxes", points: [point(800, 110, 5), point(790, 260, 9), point(730, 420, 12), point(620, 530, 15), point(400, 580, 14), point(100, 590, 12), point(-220, 590, 8), point(-450, 560, 4), point(-450, 400)] },
    ],
    difficultyProfiles: makeDifficultyProfiles([[78, 0.54], [87, 0.73], [96, 0.91]]),
  }),
  makeTrack({
    id: "costa-azul",
    name: "Costa Azul",
    targetLengthM: 3850,
    sectorGeometry: [
      { name: "Reta do Cais", points: [point(-430, 270), point(0, 270, 1), point(400, 270, 1)] },
      { name: "Curva do Farol", points: [point(400, 270, 1), point(500, 255), point(560, 180, -1), point(550, 100, -2), point(490, 45, -2)] },
      { name: "Marina", points: [point(490, 45, -2), point(370, -20, -1), point(250, -45), point(150, -35, 2), point(80, 5, 3)] },
      { name: "Pontal", points: [point(80, 5, 3), point(-40, 40, 2), point(-170, 80, 1), point(-300, 130), point(-390, 205, -1)] },
      { name: "Dunas", points: [point(-390, 205, -1), point(-480, 150, -2), point(-540, 55, -1), point(-525, -65), point(-450, -145, 2)] },
      { name: "Enseada", points: [point(-450, -145, 2), point(-300, -185, 3), point(-100, -205, 2), point(120, -200), point(290, -185, -1)] },
      { name: "Quebra-mar", points: [point(290, -185, -1), point(410, -205, -2), point(430, -285, -3), point(350, -345, -2), point(180, -365)] },
      { name: "Retorno da Praia", points: [point(180, -365), point(-80, -360, 1), point(-330, -310, 2), point(-475, -215, 1), point(-570, -90), point(-585, 80, -1), point(-560, 250, -1), point(-430, 270)] },
    ],
    difficultyProfiles: makeDifficultyProfiles([[80, 0.52], [88, 0.71], [97, 0.90]]),
  }),
  makeTrack({
    id: "serra-alta",
    name: "Serra Alta",
    targetLengthM: 4100,
    sectorGeometry: [
      { name: "Reta do Mirante", points: [point(-420, 300, 0), point(0, 300, 12), point(420, 300, 24)] },
      { name: "Cotovelos do Cume", points: [point(420, 300, 24), point(510, 250, 30), point(500, 175, 35), point(420, 125, 39), point(300, 130, 43), point(180, 150, 48)] },
      { name: "Travessia da Serra", points: [point(180, 150, 48), point(-60, 150, 54), point(-320, 150, 60)] },
      { name: "Descida da Pedreira", points: [point(-320, 150, 60), point(-445, 95, 48), point(-490, 0, 30), point(-440, -100, 12), point(-300, -145, -4)] },
      { name: "Vale dos Túneis", points: [point(-300, -145, -4), point(-80, -145, -3), point(160, -145, -2), point(330, -155, -1)] },
      { name: "Grampo Leste", points: [point(330, -155, -1), point(455, -205, -6), point(450, -280, -12), point(355, -330, -19), point(220, -320, -26)] },
      { name: "Reta da Floresta", points: [point(220, -320, -26), point(-20, -320, -31), point(-270, -300, -35)] },
      { name: "S da Floresta", points: [point(-270, -300, -35), point(-435, -250, -30), point(-500, -145, -21), point(-600, -40, -12)] },
      { name: "Subida ao Mirante", points: [point(-600, -40, -12), point(-560, 90, -4), point(-500, 210, -1), point(-420, 300)] },
    ],
    difficultyProfiles: makeDifficultyProfiles([[72, 0.50], [81, 0.70], [91, 0.89]]),
  }),
  makeTrack({
    id: "vale-seco",
    name: "Vale Seco",
    targetLengthM: 3700,
    sectorGeometry: [
      { name: "Retão do Sal", points: [point(-440, 275, 1), point(-80, 275, 2), point(360, 275, 2)] },
      { name: "Curva do Oasis", points: [point(360, 275, 2), point(495, 250, 1), point(535, 155), point(485, 60, -1)] },
      { name: "Cânion Norte", points: [point(485, 60, -1), point(300, 0, -2), point(90, -25, -1), point(-130, -15, 1), point(-330, 35, 2)] },
      { name: "Serragem", points: [point(-330, 35, 2), point(-445, -5, 1), point(-470, -95), point(-415, -175, -2), point(-300, -205, -3)] },
      { name: "Dunas Vermelhas", points: [point(-300, -205, -3), point(-80, -210, -2), point(145, -190), point(325, -150, 2)] },
      { name: "Bacia do Vento", points: [point(325, -150, 2), point(455, -175, 3), point(490, -265, 1), point(420, -335, -1), point(280, -355, -2)] },
      { name: "Chicane da Miragem", points: [point(280, -355, -2), point(150, -330), point(85, -280, 2), point(5, -320, 3), point(-100, -355, 2), point(-255, -330)] },
      { name: "Retorno do Planalto", points: [point(-255, -330), point(-430, -260, -1), point(-505, -145, -2), point(-500, -10), point(-475, 145, 1), point(-440, 275, 1)] },
    ],
    difficultyProfiles: makeDifficultyProfiles([[82, 0.53], [90, 0.72], [98, 0.90]]),
  }),
  makeTrack({
    id: "porto-ciano",
    name: "Porto Ciano",
    targetLengthM: 3950,
    sectorGeometry: [
      { name: "Reta dos Armazéns", points: [point(-420, 270), point(0, 270), point(400, 270)] },
      { name: "Grampo do Farol", points: [point(400, 270), point(520, 245), point(565, 160), point(525, 85), point(410, 60)] },
      { name: "Canal Leste", points: [point(410, 60), point(180, 60), point(-70, 60), point(-300, 60)] },
      { name: "Chicane das Docas", points: [point(-300, 60), point(-410, 25), point(-430, -55), point(-360, -115), point(-275, -85), point(-240, -20)] },
      { name: "Avenida do Mercado", points: [point(-240, -20), point(-80, -65), point(110, -95, 1), point(300, -90, 2), point(390, -120, 3)] },
      { name: "Ponte Alta", points: [point(390, -120, 3), point(480, -155, 8), point(490, -240, 12), point(405, -300, 9), point(275, -305, 4)] },
      { name: "Muralha do Porto", points: [point(275, -305, 4), point(40, -305, 2), point(-190, -285), point(-350, -225, -1)] },
      { name: "Retorno da Baía", points: [point(-350, -225, -1), point(-475, -155), point(-520, -45, 1), point(-505, 90, 2), point(-470, 205, 1), point(-420, 270)] },
    ],
    difficultyProfiles: makeDifficultyProfiles([[76, 0.51], [85, 0.70], [94, 0.89]]),
  }),
];

export const TRACK_CONFIGURATIONS = Object.freeze(configurations);
