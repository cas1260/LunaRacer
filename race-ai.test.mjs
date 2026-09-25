import assert from "node:assert/strict";
import test from "node:test";
import { createOpponentDriver, updateOpponentDriver, rankRacers } from "./race-ai.mjs";
import { createVehicleState, stepVehicle } from "./vehicle-physics.mjs";
import { TRACK_CONFIGURATIONS } from "./track-configurations.mjs";

const straight = Object.freeze({
  headingError: 0,
  lateralError: 0,
  speedMps: 30,
  targetSpeedMps: 92,
  curveSharpness: 0,
  blockedLanes: Object.freeze([]),
});

function advance(driver, observation = straight, steps = 60) {
  let result;
  for (let step = 0; step < steps; step += 1) {
    result = updateOpponentDriver(driver, observation);
    driver = result.driver;
  }
  return result;
}

test("cria estado proprio e valida configuracao", () => {
  const first = createOpponentDriver("primeiro");
  const second = createOpponentDriver("segundo");
  assert.deepEqual(first.controls, { steer: 0, throttle: 0, brake: 0 });
  assert.notEqual(first.controls, second.controls);
  assert.equal(first.maxSpeedMps, 92);
  assert.throws(() => createOpponentDriver(" "), TypeError);
  for (const config of [
    { skill: -0.1 }, { skill: 1.1 }, { skill: NaN },
    { laneOffset: 2 }, { laneOffset: Infinity },
    { laneWidthMeters: 0 }, { laneWidthMeters: 5.3 },
    { maxSpeedMps: 0 }, { maxSpeedMps: -1 }, { maxSpeedMps: NaN },
  ]) assert.throws(() => createOpponentDriver(1, config), RangeError);
});

test("erro de orientacao preserva sinal e erro lateral corrige para o centro", () => {
  for (const sign of [-1, 1]) {
    const heading = updateOpponentDriver(createOpponentDriver(1), { ...straight, headingError: sign * 0.25 });
    assert.equal(Math.sign(heading.controls.steer), sign);
  }
  const rightOfCenter = updateOpponentDriver(createOpponentDriver(1), { ...straight, lateralError: 0.25 });
  const leftOfCenter = updateOpponentDriver(createOpponentDriver(1), { ...straight, lateralError: -0.25 });
  assert.ok(rightOfCenter.controls.steer < 0);
  assert.ok(leftOfCenter.controls.steer > 0);
  const movedLeft = stepVehicle(createVehicleState({ x: 0.25, speedMps: 30 }), rightOfCenter.controls, 0.25);
  const movedRight = stepVehicle(createVehicleState({ x: -0.25, speedMps: 30 }), leftOfCenter.controls, 0.25);
  assert.ok(movedLeft.x < 0.25, "veiculo a direita deve derivar de volta ao centro");
  assert.ok(movedRight.x > -0.25, "veiculo a esquerda deve derivar de volta ao centro");
  assert.equal(updateOpponentDriver(createOpponentDriver(1), straight).controls.steer, 0);
});

test("tangent e forward geram correcao fisica no sentido da tangente", () => {
  const observation = {
    ...straight,
    speedMps: 30,
    tangent: { x: 0.25, z: -1 },
    vehicleForward: { x: 0, z: -1 },
  };
  const { controls } = updateOpponentDriver(createOpponentDriver(1), observation);
  assert.ok(controls.steer > 0, "veiculo deve virar em direcao a tangent inclinada para +X");
  const moved = stepVehicle(createVehicleState({ speedMps: 30 }), controls, 0.25);
  assert.ok(moved.x > 0, "steer positivo deve deslocar o veiculo para +X em tangent +X");
});

test("mira a faixa escolhida e confirma o deslocamento com a fisica real", () => {
  for (const side of [-1, 1]) {
    let driver = createOpponentDriver(`faixa-${side}`);
    let vehicle = createVehicleState({ speedMps: 28 });
    const blockedLanes = side < 0 ? [0, 1] : [-1, 0];
    let distance = 0;
    let maxStepLateral = 0;

    for (let step = 0; step < 180; step += 1) {
      const forward = { x: -Math.sin(vehicle.yaw), z: -Math.cos(vehicle.yaw) };
      const headingError = Math.atan2(-forward.x, -forward.z);
      const decision = updateOpponentDriver(driver, {
        ...straight,
        headingError,
        lateralError: vehicle.x,
        speedMps: vehicle.speedMps,
        targetSpeedMps: 50,
        blockedLanes,
        laneOffset: vehicle.x / 5.2,
        trackHalfWidthMeters: 5.2,
        laneWidthMeters: 2.4,
        deltaSeconds: 1 / 120,
      });
      const next = stepVehicle(vehicle, decision.controls, 1 / 120);
      distance += Math.hypot(next.x - vehicle.x, next.z - vehicle.z);
      maxStepLateral = Math.max(maxStepLateral, Math.abs(next.x - vehicle.x));
      vehicle = next;
      driver = decision.driver;
    }

    assert.equal(driver.targetLane, side);
    assert.ok(side * vehicle.x > 2.2, `carro deve atingir fisicamente a faixa ${side}`);
    assert.ok(distance > 35, "IA deve seguir acelerando durante a manobra");
    assert.ok(maxStepLateral < 0.1, "mudanca de faixa deve ser gradual, sem teleporte");
    assert.equal(driver.controls.throttle * driver.controls.brake, 0);
  }
});

test("alvo laneTarget explicito sobrepoe o alvo inicial sem quebrar compatibilidade", () => {
  const decision = updateOpponentDriver(createOpponentDriver("explicit"), {
    ...straight,
    laneTarget: -1,
  });
  assert.equal(decision.targetLane, -1);
  assert.equal(decision.targetLaneOffsetMeters, -decision.laneSpacingMeters);
  assert.equal(decision.driver.laneChangeActive, true);
  assert.throws(() => updateOpponentDriver(createOpponentDriver("conflict"), {
    ...straight,
    targetLane: -1,
    laneTarget: 1,
  }), RangeError);
});

test("alvo lateral em metros usa os dois sinais fisicos para chegar ao centro da faixa", () => {
  for (const sign of [-1, 1]) {
    const halfWidth = 5.2;
    const lateralError = sign * 2;
    const driver = createOpponentDriver(1, { laneOffset: lateralError / halfWidth });
    const decision = updateOpponentDriver(driver, {
      ...straight,
      lateralError,
      laneOffset: lateralError / halfWidth,
      trackHalfWidthMeters: halfWidth,
      laneWidthMeters: 2.4,
    });
    assert.equal(decision.targetLaneOffsetMeters, sign * 2.4);
    const moved = stepVehicle(createVehicleState({ x: lateralError, speedMps: 30 }), decision.controls, 0.25);
    assert.ok(Math.abs(moved.x - sign * 2.4) < Math.abs(lateralError - sign * 2.4),
      `offset ${sign} deve aproximar a posicao fisica do alvo em metros`);
  }
});

test("preserva offsets iniciais fracionarios nas duas faixas laterais", () => {
  for (const laneOffset of [-0.46, 0.46]) {
    const driver = createOpponentDriver(1, { laneOffset });
    const side = Math.sign(laneOffset);
    assert.equal(driver.targetLane, side);
    assert.ok(Math.abs(driver.laneOffsetMeters - laneOffset * driver.trackHalfWidthMeters) < 1e-12);
    assert.equal(driver.targetLaneOffsetMeters, side * driver.laneWidthMeters);
    const result = updateOpponentDriver(driver, straight);
    assert.equal(result.driver.targetLane, side);
    assert.ok(Math.abs(result.laneOffsetMeters - side * driver.laneWidthMeters) < 0.02);

    const observed = updateOpponentDriver(createOpponentDriver(1), { ...straight, laneOffset });
    assert.equal(observed.driver.targetLane, side);
    assert.equal(observed.targetLaneOffsetMeters, side * observed.laneSpacingMeters);
    assert.ok(Math.sign(observed.laneOffsetMeters) === side);
  }
});

test("smoothing produz o mesmo resultado a 60 e 120 atualizacoes por segundo", () => {
  const observation = { ...straight, headingError: 0.2, lateralError: 0.3, speedMps: 30, deltaSeconds: 1 / 60 };
  const run = (deltaSeconds, steps) => {
    let driver = createOpponentDriver(1);
    let result;
    for (let step = 0; step < steps; step += 1) {
      result = updateOpponentDriver(driver, { ...observation, deltaSeconds });
      driver = result.driver;
    }
    return result;
  };
  const at60Hz = run(1 / 60, 60);
  const at120Hz = run(1 / 120, 120);
  for (const control of ["steer", "throttle", "brake"]) {
    assert.ok(Math.abs(at60Hz.controls[control] - at120Hz.controls[control]) < 1e-10);
  }
  assert.ok(Math.abs(at60Hz.laneOffset - at120Hz.laneOffset) < 1e-10);
  assert.ok(Math.abs(at60Hz.laneOffsetMeters - at120Hz.laneOffsetMeters) < 1e-10);
});

test("mudanca de faixa em metros e invariante entre 60 e 120 Hz", () => {
  const run = (deltaSeconds, steps) => {
    let driver = createOpponentDriver(1, { trackHalfWidthMeters: 5.2, laneWidthMeters: 2.4 });
    let result;
    for (let step = 0; step < steps; step += 1) {
      result = updateOpponentDriver(driver, { ...straight, blockedLanes: [-1, 0], deltaSeconds });
      driver = result.driver;
    }
    return result;
  };
  const at60Hz = run(1 / 60, 15);
  const at120Hz = run(1 / 120, 30);
  assert.equal(at60Hz.targetLaneOffsetMeters, 2.4);
  assert.ok(Math.abs(at60Hz.laneOffsetMeters - at120Hz.laneOffsetMeters) < 1e-10);
});

test("acelera na reta e freia pela curva adiante mesmo alinhado", () => {
  const driver = createOpponentDriver(1, { skill: 1 });
  const observation = { ...straight, speedMps: 60 };
  const onStraight = updateOpponentDriver(driver, observation).controls;
  const onCurve = updateOpponentDriver(driver, { ...observation, curveSharpness: 1 }).controls;
  assert.ok(onStraight.throttle > 0);
  assert.equal(onStraight.brake, 0);
  assert.ok(onCurve.brake > 0);
  assert.equal(onCurve.throttle, 0);
});

test("respeita velocidade maxima, limite do trecho e alvo zero", () => {
  const driver = createOpponentDriver(1, { skill: 1, maxSpeedMps: 70 });
  assert.ok(updateOpponentDriver(driver, { ...straight, speedMps: 80 }).controls.brake > 0);
  assert.ok(updateOpponentDriver(driver, { ...straight, targetSpeedMps: 20 }).controls.brake > 0);
  assert.ok(updateOpponentDriver(driver, { ...straight, targetSpeedMps: 0 }).controls.brake > 0);
  const coast = updateOpponentDriver(driver, { ...straight, speedMps: 70 }).controls;
  assert.equal(coast.throttle, 0);
  assert.equal(coast.brake, 0);
});

test("habilidade muda o ritmo de modo deterministico", () => {
  const observation = { ...straight, speedMps: 30, curveSharpness: 1 };
  const novice = updateOpponentDriver(createOpponentDriver(1, { skill: 0 }), observation);
  const expert = updateOpponentDriver(createOpponentDriver(1, { skill: 1 }), observation);
  assert.ok(novice.controls.brake > 0);
  assert.ok(expert.controls.throttle > 0);
  assert.deepEqual(expert, updateOpponentDriver(createOpponentDriver(1, { skill: 1 }), observation));
});

test("mantem faixa livre e muda gradualmente para a unica faixa livre", () => {
  const initial = createOpponentDriver(1);
  assert.equal(advance(initial).laneOffset, 0);
  for (const side of [-1, 1]) {
    const observation = { ...straight, blockedLanes: [0, -side] };
    const first = updateOpponentDriver(initial, observation);
    assert.equal(first.driver.targetLane, side);
    assert.equal(Math.sign(first.laneOffset), side);
    assert.ok(Math.abs(first.laneOffsetMeters) <= 0.06);
    assert.equal(first.targetLaneOffsetMeters, side * first.laneSpacingMeters);
    assert.equal(first.controls.throttle * first.controls.brake, 0);
    const final = advance(first.driver, observation);
    assert.ok(Math.abs(final.laneOffsetMeters - side * final.laneSpacingMeters) < 1e-12);
    assert.equal(final.driver.targetLane, side);
    assert.ok(Math.abs(advance(final.driver).laneOffsetMeters - final.laneOffsetMeters) < 1e-12);
  }
});

test("nao cruza faixa intermediaria ocupada para alcancar o outro lado", () => {
  for (const side of [-1, 1]) {
    const observation = { ...straight, blockedLanes: [side, 0] };
    const result = advance(createOpponentDriver(1, { laneOffset: side }), observation);
    assert.equal(result.laneOffset, side);
    assert.equal(result.driver.targetLane, side);
    assert.equal(result.controls.throttle, 0);
    assert.ok(result.controls.brake > 0);
  }
});

test("sem faixa livre usa velocidade segura sem stall e acelera quando libera", () => {
  const driver = createOpponentDriver(1, { laneOffset: 0.25 });
  const observation = { ...straight, blockedLanes: [-1, 0, 1] };
  const result = advance(driver, observation);
  assert.equal(result.laneOffset, 0.25);
  assert.equal(result.controls.throttle, 0);
  assert.ok(result.controls.brake > 0);
  const stopped = updateOpponentDriver(result.driver, { ...straight, speedMps: 0 });
  assert.ok(stopped.controls.throttle > 0, "abrir a faixa deve retomar a aceleracao");
  assert.equal(stopped.controls.brake, 0);
  let safeSpeed = 0;
  let safeDriver = stopped.driver;
  for (let step = 0; step < 120; step += 1) {
    const decision = updateOpponentDriver(safeDriver, { ...observation, speedMps: safeSpeed });
    assert.equal(decision.controls.throttle * decision.controls.brake, 0);
    safeSpeed = stepVehicle(createVehicleState({ speedMps: safeSpeed }), decision.controls, 1 / 120).speedMps;
    safeDriver = decision.driver;
  }
  assert.ok(safeSpeed > 0, "all blocked must not keep the opponent stopped");
  assert.ok(updateOpponentDriver(safeDriver, { ...straight, speedMps: safeSpeed }).controls.throttle > 0);
  const accelerating = advance(createOpponentDriver(1)).driver;
  const stoppedByCollision = updateOpponentDriver(accelerating, { ...observation, speedMps: 0 });
  assert.ok(stoppedByCollision.controls.throttle > 0);
  assert.equal(stoppedByCollision.controls.brake, 0);
});

test("ignora trafego atras e bloqueia faixa para trafego a frente", () => {
  const driver = createOpponentDriver(1);
  const behind = updateOpponentDriver(driver, {
    ...straight,
    trackProgress: 0.5,
    trafficAhead: [{ lane: 0, gapMeters: -4, trackProgress: 0.49 }],
  });
  assert.equal(behind.driver.targetLane, 0);
  assert.equal(behind.laneOffset, 0);

  const ahead = updateOpponentDriver(driver, {
    ...straight,
    trackProgress: 0.5,
    trafficAhead: [{ lane: 0, gapMeters: 4, trackProgress: 0.51 }],
  });
  assert.notEqual(ahead.driver.targetLane, 0);
  assert.ok(ahead.laneOffset < 0);
});

test("usa progresso circular e velocidade relativa para seguir somente trafego a frente", () => {
  const driver = createOpponentDriver(1);
  const behind = updateOpponentDriver(driver, {
    ...straight,
    speedMps: 30,
    trackProgress: 0.99,
    trafficAhead: [{ lane: 0, gapMeters: 4, relativeSpeedMps: -10, trackProgress: 0.98 }],
  });
  assert.equal(behind.driver.targetLane, 0);
  assert.equal(behind.controls.brake, 0);

  const aheadAcrossStart = updateOpponentDriver(driver, {
    ...straight,
    speedMps: 30,
    trackProgress: 0.99,
    trafficAhead: [{ lane: 0, gapMeters: 4, relativeSpeedMps: -5, trackProgress: 0.01 }],
  });
  assert.notEqual(aheadAcrossStart.driver.targetLane, 0);
  assert.ok(aheadAcrossStart.controls.brake > 0);
});

test("trafego ocupando todas as faixas segura o gap e retoma ao liberar", () => {
  const driver = createOpponentDriver(1);
  const blocked = {
    ...straight,
    trackProgress: 0.4,
    trafficAhead: [-1, 0, 1].map((lane) => ({
      lane,
      gapMeters: lane === 0 ? 20 : 12,
      relativeSpeedMps: 30,
      trackProgress: 0.405,
    })),
  };
  const approach = updateOpponentDriver(driver, { ...blocked, speedMps: 30 });
  assert.equal(approach.driver.targetLane, 0);
  assert.equal(approach.controls.throttle, 0);
  assert.ok(approach.controls.brake > 0, "deve frear para acompanhar o lider lento");

  const held = updateOpponentDriver(approach.driver, {
    ...blocked,
    speedMps: 0,
    trafficAhead: blocked.trafficAhead.map((traffic) => ({ ...traffic, relativeSpeedMps: 0 })),
  });
  assert.equal(held.controls.brake, 0);
  assert.ok(held.controls.throttle > 0, "avanca com cuidado quando o gap permite");

  const released = updateOpponentDriver(held.driver, { ...straight, speedMps: 0 });
  assert.ok(released.controls.throttle > held.controls.throttle, "faixas livres permitem acelerar");
});

test("all-blocked com fisica real aproxima o lider parado sem fechar gap; acelera quando abre", () => {
  let driver = createOpponentDriver(1);
  let vehicle = createVehicleState({ speedMps: 30 });
  let gapMeters = 38;
  const dt = 1 / 120;

  for (let step = 0; step < 1200; step += 1) {
    const trafficAhead = [-1, 0, 1].map((lane) => ({
      lane,
      gapMeters,
      relativeSpeedMps: vehicle.speedMps,
    }));
    const decision = updateOpponentDriver(driver, {
      ...straight,
      speedMps: vehicle.speedMps,
      trafficAhead,
      deltaSeconds: dt,
    });
    const next = stepVehicle(vehicle, decision.controls, dt);
    gapMeters -= vehicle.z - next.z;
    assert.ok(gapMeters > 0, "deve preservar distancia positiva ao lider parado");
    vehicle = next;
    driver = decision.driver;
  }

  assert.ok(vehicle.speedMps < 0.2, "deve parar no gap seguro em vez de colidir");
  assert.ok(gapMeters > 0.1);
  const clear = updateOpponentDriver(driver, { ...straight, speedMps: vehicle.speedMps, deltaSeconds: dt });
  assert.ok(clear.controls.throttle > 0, "faixas livres removem o hold e retomam aceleracao");
});

test("altera faixa, ultrapassa lider mais lento e volta a acelerar sem teleporte", () => {
  let driver = createOpponentDriver("ultrapassagem", { skill: 0.7, maxSpeedMps: 70 });
  let vehicle = createVehicleState({ speedMps: 30 });
  let leaderZ = -32;
  const leaderSpeedMps = 10;
  const dt = 1 / 120;
  let minimumVehicleSeparation = Infinity;
  let minimumLongitudinalGap = Infinity;
  let changedLane = false;
  let passed = false;
  let maximumStepDistance = 0;

  for (let step = 0; step < 1800; step += 1) {
    const gapMeters = vehicle.z - leaderZ;
    const trafficAhead = gapMeters > 0
      ? [{ lane: 0, gapMeters, relativeSpeedMps: vehicle.speedMps - leaderSpeedMps }]
      : [];
    const decision = updateOpponentDriver(driver, {
      ...straight,
      lateralError: vehicle.x,
      speedMps: vehicle.speedMps,
      targetSpeedMps: 70,
      trafficAhead,
      laneOffset: vehicle.x / 5.2,
      trackHalfWidthMeters: 5.2,
      laneWidthMeters: 2.4,
      deltaSeconds: dt,
    });
    const next = stepVehicle(vehicle, decision.controls, dt);
    leaderZ -= leaderSpeedMps * dt;
    const longitudinalGap = next.z - leaderZ;
    const separation = Math.hypot(next.x, longitudinalGap);
    maximumStepDistance = Math.max(maximumStepDistance, Math.hypot(next.x - vehicle.x, next.z - vehicle.z));
    if (longitudinalGap >= 0) minimumLongitudinalGap = Math.min(minimumLongitudinalGap, longitudinalGap);
    minimumVehicleSeparation = Math.min(minimumVehicleSeparation, separation);
    changedLane ||= Math.abs(next.x) > 1;
    passed ||= changedLane && longitudinalGap < 0;
    assert.equal(decision.controls.throttle * decision.controls.brake, 0);
    driver = decision.driver;
    vehicle = next;
  }

  assert.ok(minimumLongitudinalGap > 0, "mantem gap positivo enquanto segue atras do lider");
  assert.ok(minimumVehicleSeparation > 2.2, "ultrapassa sem sobrepor o collider lateral do carro");
  assert.ok(maximumStepDistance < 0.6, "deslocamento permanece fisico, sem teleporte");
  assert.ok(changedLane && passed, "muda de faixa e efetivamente passa o lider");
  assert.ok(vehicle.speedMps > leaderSpeedMps, "retoma velocidade de corrida apos ultrapassar");
});

test("velocidade relativa do caller e usada no sentido documentado", () => {
  const driver = createOpponentDriver("gap");
  const observation = {
    ...straight,
    speedMps: 30,
    trafficAhead: [{ lane: 0, gapMeters: 18, relativeSpeedMps: 20 }],
  };
  const slowerLeader = updateOpponentDriver(driver, observation);
  const matchingSpeedLeader = updateOpponentDriver(driver, {
    ...observation,
    trafficAhead: [{ lane: 0, gapMeters: 18, relativeSpeedMps: 0 }],
  });
  assert.ok(slowerLeader.controls.brake > matchingSpeedLeader.controls.brake,
    "relativeSpeedMps positivo do game.js significa que o lider esta mais lento");
});

test("perfis easy/medium/hard mantem progressao deterministica dentro de cada pista", () => {
  for (const track of TRACK_CONFIGURATIONS) {
    const profiles = ["easy", "medium", "hard"].map((difficulty) => track.difficultyProfiles[difficulty]);
    assert.ok(profiles[0].aiMaxSpeedMps < profiles[1].aiMaxSpeedMps);
    assert.ok(profiles[1].aiMaxSpeedMps < profiles[2].aiMaxSpeedMps);
    assert.ok(profiles[0].aiSkill < profiles[1].aiSkill);
    assert.ok(profiles[1].aiSkill < profiles[2].aiSkill);

    const run = (profile) => {
      let driver = createOpponentDriver(track.id, {
        skill: profile.aiSkill,
        maxSpeedMps: profile.aiMaxSpeedMps,
      });
      let vehicle = createVehicleState();
      for (let step = 0; step < 1200; step += 1) {
        const decision = updateOpponentDriver(driver, {
          ...straight,
          speedMps: vehicle.speedMps,
          targetSpeedMps: 98,
          deltaSeconds: 1 / 120,
        });
        driver = decision.driver;
        vehicle = stepVehicle(vehicle, decision.controls, 1 / 120);
        assert.equal(decision.controls.throttle * decision.controls.brake, 0);
      }
      return vehicle.speedMps;
    };

    const speeds = profiles.map(run);
    assert.ok(speeds[0] <= profiles[0].aiMaxSpeedMps + 0.1);
    assert.ok(speeds[1] <= profiles[1].aiMaxSpeedMps + 0.1);
    assert.ok(speeds[2] <= profiles[2].aiMaxSpeedMps + 0.1);
    assert.ok(speeds[0] < speeds[1] && speeds[1] < speeds[2], `${track.id}: ${speeds.join(", ")}`);
    assert.deepEqual(speeds, profiles.map(run), `${track.id}: perfis repetidos devem ser deterministas`);
  }
});

test("percorre uma volta completa no TrackPath de Interlagos com stepVehicle", () => {
  const points = TRACK_CONFIGURATIONS.find(({ id }) => id === "interlagos").centerline;
  const tangentAt = (index) => {
    const previous = points[(index - 1 + points.length) % points.length];
    const next = points[(index + 1) % points.length];
    const length = Math.hypot(next.x - previous.x, next.z - previous.z);
    return { x: (next.x - previous.x) / length, z: (next.z - previous.z) / length };
  };
  const first = points[0];
  const firstTangent = tangentAt(0);
  let driver = createOpponentDriver("lap", { skill: 0.73, maxSpeedMps: 87 });
  let vehicle = createVehicleState({
    x: first.x,
    y: first.y,
    z: first.z,
    yaw: Math.atan2(-firstTangent.x, -firstTangent.z),
  });
  let previousIndex = 0;
  let completedLaps = 0;
  let traveledMeters = 0;

  for (let step = 0; step < 16000 && completedLaps === 0; step += 1) {
    let nearestIndex = 0;
    let nearestDistanceSquared = Infinity;
    for (let index = 0; index < points.length; index += 1) {
      const dx = vehicle.x - points[index].x;
      const dz = vehicle.z - points[index].z;
      const distanceSquared = dx * dx + dz * dz;
      if (distanceSquared < nearestDistanceSquared) {
        nearestIndex = index;
        nearestDistanceSquared = distanceSquared;
      }
    }
    if (previousIndex > points.length * 0.8 && nearestIndex < points.length * 0.2) completedLaps += 1;
    previousIndex = nearestIndex;

    const tangent = tangentAt(nearestIndex);
    const lookAheadIndex = (nearestIndex + 3) % points.length;
    const lookAheadTangent = tangentAt(lookAheadIndex);
    const currentPoint = points[nearestIndex];
    const lookAheadPoint = points[lookAheadIndex];
    const lookAheadDistance = Math.max(3, Math.hypot(
      lookAheadPoint.x - currentPoint.x,
      lookAheadPoint.z - currentPoint.z,
    ));
    const curveSharpness = Math.max(0, Math.min(1, 1 - tangent.x * lookAheadTangent.x - tangent.z * lookAheadTangent.z));
    const right = { x: -tangent.z, z: tangent.x };
    const lateralError = (vehicle.x - currentPoint.x) * right.x + (vehicle.z - currentPoint.z) * right.z;
    const forward = { x: -Math.sin(vehicle.yaw), z: -Math.cos(vehicle.yaw) };
    const headingError = Math.atan2(
      tangent.z * forward.x - tangent.x * forward.z,
      tangent.x * forward.x + tangent.z * forward.z,
    );
    const decision = updateOpponentDriver(driver, {
      headingError,
      lateralError,
      speedMps: vehicle.speedMps,
      targetSpeedMps: Math.min(driver.maxSpeedMps, Math.sqrt(40 * lookAheadDistance)),
      curveSharpness,
      laneOffset: Math.max(-1, Math.min(1, lateralError / 5.2)),
      trackProgress: nearestIndex / points.length,
      deltaSeconds: 1 / 120,
    });
    const next = stepVehicle(vehicle, decision.controls, 1 / 120);
    traveledMeters += Math.hypot(next.x - vehicle.x, next.z - vehicle.z);
    assert.equal(decision.controls.throttle * decision.controls.brake, 0);
    driver = decision.driver;
    vehicle = next;
  }

  assert.equal(completedLaps, 1, "a politica deve fechar uma volta sem reposicionar o carro");
  assert.ok(traveledMeters > 3500, `distancia fisica ${traveledMeters.toFixed(1)} m`);
});

test("cancela mudanca quando o destino fica ocupado, sem salto de faixa", () => {
  const initial = createOpponentDriver(1);
  const changing = advance(initial, { ...straight, blockedLanes: [-1, 0] }, 5);
  assert.ok(changing.laneOffset > 0);
  const cancel = updateOpponentDriver(changing.driver, { ...straight, blockedLanes: [1] });
  assert.equal(cancel.driver.targetLane, 0);
  assert.ok(cancel.laneOffset < changing.laneOffset);
  assert.ok(changing.laneOffset - cancel.laneOffset <= 0.04);
  const blocked = updateOpponentDriver(changing.driver, { ...straight, blockedLanes: [-1, 0, 1] });
  assert.equal(blocked.laneOffset, changing.laneOffset);
});

test("evita oscilacao da faixa escolhida em observacoes repetidas", () => {
  let driver = createOpponentDriver(1);
  for (let step = 0; step < 120; step += 1) {
    const result = updateOpponentDriver(driver, { ...straight, blockedLanes: step % 2 ? [] : [0] });
    assert.equal(result.driver.targetLane, -1);
    assert.ok(result.laneOffset <= driver.laneOffset);
    driver = result.driver;
  }
  assert.ok(Math.abs(driver.laneOffsetMeters + driver.laneWidthMeters) < 1e-12);
});

test("limita variacoes e nunca acelera e freia simultaneamente", () => {
  for (const skill of [0, 0.5, 1]) {
    let driver = createOpponentDriver(1, { skill });
    for (let step = 0; step < 300; step += 1) {
      const curve = step % 80 >= 40;
      const observation = {
        ...straight,
        headingError: curve ? -2 : 2,
        lateralError: curve ? -10 : 10,
        speedMps: curve ? 90 : 15,
        curveSharpness: curve ? 1 : 0,
        blockedLanes: curve ? [0, 1] : [0, -1],
      };
      const result = updateOpponentDriver(driver, observation);
      const { steer, throttle, brake } = result.controls;
      assert.ok(Math.abs(steer) <= 1 && throttle >= 0 && throttle <= 1 && brake >= 0 && brake <= 1);
      assert.equal(throttle * brake, 0);
      assert.ok(Math.abs(steer - driver.controls.steer) <= 0.080001);
      assert.ok(Math.abs(throttle - driver.controls.throttle) <= 0.160001);
      assert.ok(Math.abs(brake - driver.controls.brake) <= 0.160001);
      assert.ok(Math.abs(result.laneOffset - driver.laneOffset) <= 0.040001);
      driver = result.driver;
    }
  }
});

test("nao altera estado anterior, observacao ou coordenadas fisicas", () => {
  const driver = createOpponentDriver(1);
  Object.freeze(driver.controls);
  Object.freeze(driver);
  const result = updateOpponentDriver(driver, straight);
  assert.notEqual(result.driver, driver);
  assert.deepEqual(driver.controls, { steer: 0, throttle: 0, brake: 0 });
  assert.equal(driver.laneOffset, 0);
  assert.deepEqual(Object.keys(result.driver).sort(), Object.keys(driver).sort());
  assert.equal(result.controls, result.driver.controls);
});

test("rejeita observacoes invalidas e estado corrompido", () => {
  const driver = createOpponentDriver(1);
  for (const field of ["headingError", "lateralError", "speedMps", "targetSpeedMps", "curveSharpness"]) {
    for (const value of [undefined, NaN, Infinity, "0"]) {
      assert.throws(() => updateOpponentDriver(driver, { ...straight, [field]: value }), RangeError);
    }
  }
  for (const changes of [
    { targetSpeedMps: -1 }, { curveSharpness: -0.1 }, { curveSharpness: 1.1 },
    { blockedLanes: [2] }, { blockedLanes: [0.5] }, { blockedLanes: null },
    { deltaSeconds: 0 }, { laneOffset: 1.1 }, { targetLane: 2 }, { laneTarget: -1.5 },
    { targetLane: -1, laneTarget: 1 }, { trackProgress: -0.1 },
    { trafficAhead: [{ lane: 0, gapMeters: NaN }] },
    { trafficAhead: [{ lane: 0, gapMeters: 3, relativeSpeedMps: Infinity }] },
    { trafficAhead: [{ lane: 0, gapMeters: 3, trackProgress: 1.1 }] },
  ]) assert.throws(() => updateOpponentDriver(driver, { ...straight, ...changes }), RangeError);
  assert.throws(() => updateOpponentDriver(driver, {
    ...straight,
    tangent: { x: 0, z: 0 },
    vehicleForward: { x: 0, z: -1 },
  }), RangeError);
  assert.throws(() => updateOpponentDriver(null, straight), TypeError);
  assert.throws(() => updateOpponentDriver(driver, null), TypeError);
  assert.throws(() => updateOpponentDriver({ ...driver, controls: { steer: NaN, throttle: 0, brake: 0 } }, straight), TypeError);
});

test("ranking usa voltas, progresso e id sem alterar participantes", () => {
  const racers = Object.freeze([
    Object.freeze({ id: "d", completedLaps: 0, progress: 0.99 }),
    Object.freeze({ id: "b", completedLaps: 1, progress: 0.2 }),
    Object.freeze({ id: "c", completedLaps: 1, progress: 0.9 }),
    Object.freeze({ id: "a", completedLaps: 1, progress: 0.2 }),
    Object.freeze({ id: "e", completedLaps: 2, progress: 0 }),
  ]);
  const ranking = rankRacers(racers);
  assert.deepEqual(ranking.map(({ id }) => id), ["e", "c", "a", "b", "d"]);
  assert.deepEqual(racers.map(({ id }) => id), ["d", "b", "c", "a", "e"]);
  assert.equal(ranking[0], racers[4]);
  assert.deepEqual(rankRacers([...racers].reverse()), ranking);
});

test("ranking resolve ids numericos, textuais e empates de modo estavel", () => {
  const racers = [10, "2", 2, "10", 2].map((id) => ({ id, completedLaps: 0, progress: 0 }));
  const ranking = rankRacers(racers);
  assert.deepEqual(ranking.map(({ id }) => id), [2, 2, 10, "10", "2"]);
  assert.equal(ranking[0], racers[2]);
  assert.equal(ranking[1], racers[4]);
  assert.deepEqual(rankRacers([]), []);
  assert.throws(() => rankRacers(null), TypeError);
  for (const changes of [{ id: "" }, { completedLaps: -1 }, { completedLaps: 0.5 }, { progress: NaN }, { progress: 1.1 }]) {
    assert.throws(() => rankRacers([{ id: 1, completedLaps: 0, progress: 0, ...changes }]), TypeError);
  }
});
