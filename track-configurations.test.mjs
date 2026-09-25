import assert from "node:assert/strict";
import test from "node:test";
import { TRACK_CONFIGURATIONS } from "./track-configurations.mjs";

const EPSILON = 1e-8;
const MIN_TRACK_CLEARANCE_M = 22.8;
const MIN_NON_LOCAL_ROUTE_DISTANCE_M = 70;
const MIN_VERTICAL_CLEARANCE_M = 4.5;

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

function sampleClosedPolyline(track, sampleCount = 768) {
  const points = track.centerline;
  const lengths = points.map((point, index) => distance(point, points[(index + 1) % points.length]));
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);
  const samples = [];
  let segment = 0;
  let segmentStartDistance = 0;

  for (let index = 0; index < sampleCount; index += 1) {
    const targetDistance = totalLength * index / sampleCount;
    while (segmentStartDistance + lengths[segment] < targetDistance) {
      segmentStartDistance += lengths[segment];
      segment += 1;
    }
    const start = points[segment];
    const end = points[(segment + 1) % points.length];
    const fraction = (targetDistance - segmentStartDistance) / lengths[segment];
    samples.push({
      x: start.x + (end.x - start.x) * fraction,
      y: start.y + (end.y - start.y) * fraction,
      z: start.z + (end.z - start.z) * fraction,
    });
  }

  return { samples, totalLength };
}

function sampleCatmullRom(points, sampleCount = 1536) {
  return Array.from({ length: sampleCount }, (_, index) => {
    const parameter = points.length * index / sampleCount;
    const segment = Math.floor(parameter);
    const t = parameter - segment;
    const p0 = points[(segment - 1 + points.length) % points.length];
    const p1 = points[segment % points.length];
    const p2 = points[(segment + 1) % points.length];
    const p3 = points[(segment + 2) % points.length];
    let dt0 = Math.sqrt(distance(p0, p1));
    let dt1 = Math.sqrt(distance(p1, p2));
    let dt2 = Math.sqrt(distance(p2, p3));
    if (dt1 < 1e-4) dt1 = 1;
    if (dt0 < 1e-4) dt0 = dt1;
    if (dt2 < 1e-4) dt2 = dt1;

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
      return [axis, p1[axis] + tangent1 * t + c2 * t ** 2 + c3 * t ** 3];
    }));
  });
}

function polylineLength(points) {
  return points.reduce((total, point, index) => total + distance(point, points[(index + 1) % points.length]), 0);
}

function turnRadius(a, b, c) {
  const ab = Math.hypot(b.x - a.x, b.z - a.z);
  const bc = Math.hypot(c.x - b.x, c.z - b.z);
  const ac = Math.hypot(c.x - a.x, c.z - a.z);
  const cross = Math.abs((b.x - a.x) * (c.z - b.z) - (b.z - a.z) * (c.x - b.x));
  return cross ? ab * bc * ac / (2 * cross) : Infinity;
}

function minimumNonLocalClearance(track) {
  const samples = sampleCatmullRom(track.centerline);
  const segmentLengths = samples.map((point, index) => distance(point, samples[(index + 1) % samples.length]));
  const cumulative = [0];
  for (const segmentLength of segmentLengths) cumulative.push(cumulative.at(-1) + segmentLength);

  let minimum = { distance: Infinity, first: -1, second: -1, vertical: 0 };
  for (let first = 0; first < samples.length; first += 1) {
    for (let second = first + 1; second < samples.length; second += 1) {
      const routeDistance = cumulative[second] - cumulative[first];
      if (Math.min(routeDistance, cumulative.at(-1) - routeDistance) < MIN_NON_LOCAL_ROUTE_DISTANCE_M) continue;
      const vertical = Math.abs(samples[first].y - samples[second].y);
      if (vertical >= MIN_VERTICAL_CLEARANCE_M) continue;
      const horizontal = Math.hypot(samples[first].x - samples[second].x, samples[first].z - samples[second].z);
      if (horizontal < minimum.distance) minimum = { distance: horizontal, first, second, vertical };
    }
  }
  return minimum;
}

function orientation(a, b, c) {
  return (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
}

function onSegment(a, b, point) {
  return point.x >= Math.min(a.x, b.x) - EPSILON
    && point.x <= Math.max(a.x, b.x) + EPSILON
    && point.z >= Math.min(a.z, b.z) - EPSILON
    && point.z <= Math.max(a.z, b.z) + EPSILON;
}

function segmentsIntersect(a, b, c, d) {
  const abC = orientation(a, b, c);
  const abD = orientation(a, b, d);
  const cdA = orientation(c, d, a);
  const cdB = orientation(c, d, b);
  if (((abC > EPSILON && abD < -EPSILON) || (abC < -EPSILON && abD > EPSILON))
    && ((cdA > EPSILON && cdB < -EPSILON) || (cdA < -EPSILON && cdB > EPSILON))) return true;
  return (Math.abs(abC) <= EPSILON && onSegment(a, b, c))
    || (Math.abs(abD) <= EPSILON && onSegment(a, b, d))
    || (Math.abs(cdA) <= EPSILON && onSegment(c, d, a))
    || (Math.abs(cdB) <= EPSILON && onSegment(c, d, b));
}

function findSelfIntersection(points) {
  const segmentCount = points.length;
  for (let first = 0; first < segmentCount; first += 1) {
    const a = points[first];
    const b = points[(first + 1) % segmentCount];
    for (let second = first + 2; second < segmentCount; second += 1) {
      if (first === 0 && second === segmentCount - 1) continue;
      const c = points[second];
      const d = points[(second + 1) % segmentCount];
      if (segmentsIntersect(a, b, c, d)) return { first, second, a, b, c, d };
    }
  }
  return null;
}

test("catálogo contém Interlagos e quatro layouts distintos", () => {
  assert.equal(TRACK_CONFIGURATIONS.length, 5);
  assert.equal(new Set(TRACK_CONFIGURATIONS.map(({ id }) => id)).size, 5);
  assert.equal(TRACK_CONFIGURATIONS.find(({ id }) => id === "interlagos")?.name, "Interlagos");
  assert.deepEqual(TRACK_CONFIGURATIONS.map(({ id }) => id), [
    "interlagos", "costa-azul", "serra-alta", "vale-seco", "porto-ciano",
  ]);
  assert.equal(new Set(TRACK_CONFIGURATIONS.map(({ centerline }) => JSON.stringify(centerline))).size, 5,
    "cada circuito precisa de geometria própria");
});

test("caminhos amostrados têm dimensões finitas, elevação e comprimentos de circuito", () => {
  const lengths = new Map();
  for (const track of TRACK_CONFIGURATIONS) {
    assert.equal(track.closed, true, track.id);
    assert.ok(track.centerline.length >= 128, track.id);
    const { samples, totalLength } = sampleClosedPolyline(track);
    lengths.set(track.id, totalLength);
    assert.ok(totalLength >= 3000 && totalLength <= 4800, `${track.id}: ${totalLength.toFixed(1)} m`);
    assert.ok(Math.max(...samples.map(({ x }) => x)) - Math.min(...samples.map(({ x }) => x)) <= 1800, track.id);
    assert.ok(Math.max(...samples.map(({ z }) => z)) - Math.min(...samples.map(({ z }) => z)) <= 1400, track.id);
    for (const point of [...track.centerline, ...samples]) {
      assert.ok([point.x, point.y, point.z].every(Number.isFinite), track.id);
    }
    assert.ok(Math.max(...samples.map(({ y }) => y)) - Math.min(...samples.map(({ y }) => y)) >= 2,
      `${track.id}: perfil vertical deve ser derivado do percurso`);
  }
  assert.ok(lengths.get("interlagos") >= 4300 && lengths.get("interlagos") <= 4800,
    `Interlagos: ${lengths.get("interlagos")?.toFixed(1)} m`);
  assert.equal(new Set([...lengths.values()].map((length) => Math.round(length))).size, TRACK_CONFIGURATIONS.length,
    "os cinco circuitos devem ter comprimentos próprios");
});

test("polylines fechadas densamente amostradas não cruzam a si próprias", () => {
  for (const track of TRACK_CONFIGURATIONS) {
    const { samples } = sampleClosedPolyline(track, 768);
    const intersection = findSelfIntersection(samples);
    assert.equal(intersection, null, `${track.id}: segmentos cruzados ${JSON.stringify(intersection)}`);
  }
});

test("curvas Catmull-Rom do jogo permanecem fechadas, sem cruzamentos e em escala de circuito", () => {
  for (const track of TRACK_CONFIGURATIONS) {
    const curveSamples = sampleCatmullRom(track.centerline);
    const totalLength = polylineLength(curveSamples);
    const intersection = findSelfIntersection(curveSamples);
    assert.equal(intersection, null, `${track.id}: Catmull-Rom cruza ${JSON.stringify(intersection)}`);
    assert.ok(totalLength >= 3000 && totalLength <= 4800, `${track.id}: ${totalLength.toFixed(1)} m`);
    if (track.id === "interlagos") {
      assert.ok(totalLength >= 4300 && totalLength <= 4800, `Interlagos: ${totalLength.toFixed(1)} m`);
    }
  }
});

test("emenda de cada circuito não introduz cotovelo por waypoint duplicado", () => {
  for (const track of TRACK_CONFIGURATIONS) {
    const points = track.centerline;
    const radius = turnRadius(points.at(-1), points[0], points[1]);
    assert.ok(radius >= 25, `${track.id}: raio de ${radius.toFixed(1)} m na emenda`);
  }
});

test("corredores Catmull-Rom não se sobrepõem entre trechos não locais", () => {
  for (const track of TRACK_CONFIGURATIONS) {
    const clearance = minimumNonLocalClearance(track);
    assert.ok(clearance.distance >= MIN_TRACK_CLEARANCE_M,
      `${track.id}: clearance ${clearance.distance.toFixed(2)} m entre amostras ${clearance.first}/${clearance.second}; dy ${clearance.vertical.toFixed(2)} m`);
  }
});

test("setores nomeados cobrem a volta e checkpoints seguem seu progresso em ordem", () => {
  for (const track of TRACK_CONFIGURATIONS) {
    assert.ok(track.sectors.length >= 8, track.id);
    assert.deepEqual(track.sectorNames, track.sectors.map(({ name }) => name), track.id);
    assert.equal(track.checkpoints.length, track.sectors.length, track.id);
    assert.equal(track.sectors[0].startProgress, 0, track.id);
    assert.equal(track.sectors.at(-1).endProgress, 1, track.id);
    assert.ok(new Set(track.sectors.map(({ startProgress, endProgress }) =>
      (endProgress - startProgress).toFixed(5))).size > 1, `${track.id}: setores precisam seguir distâncias geométricas`);
    for (let index = 0; index < track.sectors.length; index += 1) {
      const sector = track.sectors[index];
      const checkpoint = track.checkpoints[index];
      assert.ok(sector.name.length > 0, track.id);
      assert.ok(sector.startProgress < sector.checkpointProgress, track.id);
      assert.ok(sector.checkpointProgress < sector.endProgress, track.id);
      if (index > 0) assert.equal(sector.startProgress, track.sectors[index - 1].endProgress, track.id);
      assert.equal(checkpoint.sectorId, sector.id, track.id);
      assert.equal(checkpoint.name, sector.name, track.id);
      assert.equal(checkpoint.progress, sector.checkpointProgress, track.id);
      assert.ok(checkpoint.progress > 0 && checkpoint.progress < 1, track.id);
      if (index > 0) assert.ok(checkpoint.progress > track.checkpoints[index - 1].progress, track.id);
    }
  }
});

test("todos os circuitos expõem três perfis reais e progressivos de velocidade/habilidade", () => {
  for (const track of TRACK_CONFIGURATIONS) {
    const profiles = track.difficultyProfiles;
    assert.deepEqual(Object.keys(profiles), ["easy", "medium", "hard"]);
    assert.equal(track.requiredLaps, 3);
    assert.equal(track.initialTimeMs, 58000);
    assert.equal(track.timeExtensionMs, 15000);
    assert.ok(profiles.easy.aiMaxSpeedMps < profiles.medium.aiMaxSpeedMps, track.id);
    assert.ok(profiles.medium.aiMaxSpeedMps < profiles.hard.aiMaxSpeedMps, track.id);
    assert.ok(profiles.easy.aiSkill < profiles.medium.aiSkill, track.id);
    assert.ok(profiles.medium.aiSkill < profiles.hard.aiSkill, track.id);
    for (const profile of Object.values(profiles)) {
      assert.ok(profile.aiMaxSpeedMps > 0 && profile.aiMaxSpeedMps <= 98, track.id);
      assert.ok(profile.aiSkill >= 0 && profile.aiSkill <= 1, track.id);
    }
  }
  assert.equal(new Set(TRACK_CONFIGURATIONS.map(({ difficultyProfiles }) =>
    JSON.stringify(difficultyProfiles))).size, TRACK_CONFIGURATIONS.length);
});
