const LANES = [-1, 0, 1];
const DEFAULT_TRACK_HALF_WIDTH_METERS = 5.2;
const DEFAULT_LANE_WIDTH_METERS = 2.4;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const approach = (value, target, maxDelta) => value + clamp(target - value, -maxDelta, maxDelta);
const smooth = (value, target, rate, deltaSeconds) => target + (value - target) * Math.exp(-rate * deltaSeconds);
const laneIndex = (offset) => offset > 0.2 ? 1 : offset < -0.2 ? -1 : 0;
const validId = (id) => (typeof id === "string" && id.trim().length > 0)
  || (typeof id === "number" && Number.isFinite(id));

export function createOpponentDriver(id, {
  laneOffset = 0,
  skill = 0.8,
  maxSpeedMps = 92,
  trackHalfWidthMeters = DEFAULT_TRACK_HALF_WIDTH_METERS,
  laneWidthMeters = DEFAULT_LANE_WIDTH_METERS,
} = {}) {
  if (!validId(id)) throw new TypeError("O adversario precisa de um identificador valido.");
  if (!Number.isFinite(laneOffset) || laneOffset < -1 || laneOffset > 1
    || !Number.isFinite(skill) || skill < 0 || skill > 1
    || !Number.isFinite(maxSpeedMps) || maxSpeedMps <= 0
    || !Number.isFinite(trackHalfWidthMeters) || trackHalfWidthMeters <= 0
    || !Number.isFinite(laneWidthMeters) || laneWidthMeters <= 0 || laneWidthMeters > trackHalfWidthMeters) {
    throw new RangeError("Faixa, habilidade ou velocidade maxima fora dos limites.");
  }

  return {
    id,
    laneOffset,
    laneOffsetMeters: laneOffset * trackHalfWidthMeters,
    targetLane: laneIndex(laneOffset),
    targetLaneOffsetMeters: laneIndex(laneOffset) * laneWidthMeters,
    laneChangeActive: false,
    laneChangeFromLane: laneIndex(laneOffset),
    trackHalfWidthMeters,
    laneWidthMeters,
    skill,
    maxSpeedMps,
    controls: { steer: 0, throttle: 0, brake: 0 },
  };
}

function validateVector(vector, label) {
  if (!vector || !Number.isFinite(vector.x) || !Number.isFinite(vector.z)
    || Math.hypot(vector.x, vector.z) < 1e-9) {
    throw new RangeError(`${label} precisa ser um vetor XZ finito e nao nulo.`);
  }
}

function signedHeadingError(tangent, forward) {
  const tangentLength = Math.hypot(tangent.x, tangent.z);
  const forwardLength = Math.hypot(forward.x, forward.z);
  const tx = tangent.x / tangentLength;
  const tz = tangent.z / tangentLength;
  const fx = forward.x / forwardLength;
  const fz = forward.z / forwardLength;
  return Math.atan2(tz * fx - tx * fz, tx * fx + tz * fz);
}

function isLanePathClear(from, to, occupiedLanes) {
  if (occupiedLanes.includes(to)) return false;
  return !occupiedLanes.some((lane) => lane !== from && lane > Math.min(from, to) && lane < Math.max(from, to));
}

function isTrafficAhead(traffic, trackProgress) {
  if (trackProgress === undefined || traffic.trackProgress === undefined) return true;
  const progressDelta = (traffic.trackProgress - trackProgress + 1) % 1;
  return progressDelta <= 0.5;
}

function validateDriver(driver) {
  if (!driver || !validId(driver.id)
    || !Number.isFinite(driver.laneOffset) || Math.abs(driver.laneOffset) > 1
    || !Number.isFinite(driver.laneOffsetMeters)
    || !LANES.includes(driver.targetLane)
    || !Number.isFinite(driver.targetLaneOffsetMeters)
    || (driver.laneChangeActive !== undefined && typeof driver.laneChangeActive !== "boolean")
    || (driver.laneChangeFromLane !== undefined && !LANES.includes(driver.laneChangeFromLane))
    || !Number.isFinite(driver.skill) || driver.skill < 0 || driver.skill > 1
    || !Number.isFinite(driver.maxSpeedMps) || driver.maxSpeedMps <= 0
    || !Number.isFinite(driver.trackHalfWidthMeters) || driver.trackHalfWidthMeters <= 0
    || !Number.isFinite(driver.laneWidthMeters) || driver.laneWidthMeters <= 0
    || driver.laneWidthMeters > driver.trackHalfWidthMeters
    || !driver.controls
    || !Number.isFinite(driver.controls.steer) || Math.abs(driver.controls.steer) > 1
    || !Number.isFinite(driver.controls.throttle) || driver.controls.throttle < 0 || driver.controls.throttle > 1
    || !Number.isFinite(driver.controls.brake) || driver.controls.brake < 0 || driver.controls.brake > 1
    || driver.controls.throttle * driver.controls.brake !== 0) {
    throw new TypeError("Estado do adversario invalido.");
  }
}

export function updateOpponentDriver(driver, observation) {
  validateDriver(driver);
  if (!observation) throw new TypeError("A observacao do circuito e obrigatoria.");

  const {
    headingError: observedHeadingError,
    lateralError,
    speedMps,
    targetSpeedMps,
    curveSharpness,
    blockedLanes = [],
    deltaSeconds = 1 / 120,
    laneOffset: observedLaneOffset,
    trackProgress,
    trafficAhead,
    trackHalfWidthMeters = driver.trackHalfWidthMeters,
    laneWidthMeters = driver.laneWidthMeters,
    targetLane: observedTargetLane,
    laneTarget: observedLaneTarget,
    tangent,
    vehicleForward,
  } = observation;
  const headingError = tangent && vehicleForward ? signedHeadingError(tangent, vehicleForward) : observedHeadingError;

  if (![headingError, lateralError, speedMps, targetSpeedMps, curveSharpness].every(Number.isFinite)
    || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0 || deltaSeconds > 10
    || (observedLaneOffset !== undefined && (!Number.isFinite(observedLaneOffset) || Math.abs(observedLaneOffset) > 1))
    || (observedTargetLane !== undefined && !LANES.includes(observedTargetLane))
    || (observedLaneTarget !== undefined && !LANES.includes(observedLaneTarget))
    || (observedTargetLane !== undefined && observedLaneTarget !== undefined && observedTargetLane !== observedLaneTarget)
    || (trackProgress !== undefined && (!Number.isFinite(trackProgress) || trackProgress < 0 || trackProgress > 1))
    || !Number.isFinite(trackHalfWidthMeters) || trackHalfWidthMeters <= 0
    || !Number.isFinite(laneWidthMeters) || laneWidthMeters <= 0 || laneWidthMeters > trackHalfWidthMeters
    || targetSpeedMps < 0 || curveSharpness < 0 || curveSharpness > 1
    || !Array.isArray(blockedLanes) || blockedLanes.some((lane) => !LANES.includes(lane))
    || (trafficAhead !== undefined && (!Array.isArray(trafficAhead) || trafficAhead.some((traffic) => !traffic
      || !LANES.includes(traffic.lane) || !Number.isFinite(traffic.gapMeters)
      || (traffic.relativeSpeedMps !== undefined && !Number.isFinite(traffic.relativeSpeedMps))
      || (traffic.trackProgress !== undefined && (!Number.isFinite(traffic.trackProgress)
        || traffic.trackProgress < 0 || traffic.trackProgress > 1)))))) {
    throw new RangeError("Observacao invalida: use valores finitos e faixas -1, 0 ou 1.");
  }
  if ((tangent === undefined) !== (vehicleForward === undefined)) {
    throw new RangeError("Tangent e vehicleForward devem ser informados juntos.");
  }
  if (tangent) {
    validateVector(tangent, "Tangent");
    validateVector(vehicleForward, "vehicleForward");
  }

  const currentOffset = observedLaneOffset ?? driver.laneOffset;
  const currentOffsetMeters = observedLaneOffset === undefined
    ? driver.laneOffsetMeters
    : observedLaneOffset * trackHalfWidthMeters;
  let laneChangeActive = driver.laneChangeActive ?? false;
  let laneChangeFromLane = driver.laneChangeFromLane ?? laneIndex(currentOffset);
  if (laneChangeActive && Math.abs(lateralError - driver.targetLaneOffsetMeters) <= Math.max(0.15, laneWidthMeters * 0.06)) {
    laneChangeActive = false;
    laneChangeFromLane = driver.targetLane;
  }
  const currentLane = laneChangeActive ? laneChangeFromLane : laneIndex(currentOffset);
  const occupiedLane = laneChangeActive ? laneChangeFromLane : currentLane;
  const safeDistanceMeters = Math.max(8, Math.abs(speedMps) * 1.2 + (speedMps * speedMps) / 36 + 8);
  const relevantTraffic = trafficAhead?.filter((traffic) => traffic.gapMeters >= 0
    && traffic.gapMeters < safeDistanceMeters && isTrafficAhead(traffic, trackProgress)) ?? [];
  const occupiedLanes = trafficAhead === undefined
    ? blockedLanes
    : [...new Set(relevantTraffic.map(({ lane }) => lane))];
  const availableLanes = LANES.filter((lane) => isLanePathClear(currentLane, lane, occupiedLanes));

  const requestedTargetLane = observedTargetLane ?? observedLaneTarget;
  let targetLane = laneChangeActive || requestedTargetLane === undefined ? driver.targetLane : requestedTargetLane;
  let targetLaneOffsetMeters = laneChangeActive || requestedTargetLane === undefined
    ? driver.targetLaneOffsetMeters
    : targetLane * laneWidthMeters;
  if (!laneChangeActive && observedLaneOffset !== undefined
    && targetLane === laneIndex(driver.laneOffset)
    && laneIndex(observedLaneOffset) !== laneIndex(driver.laneOffset)) {
    targetLane = laneIndex(observedLaneOffset);
    targetLaneOffsetMeters = targetLane * laneWidthMeters;
  }
  if (availableLanes.length) {
    const preferredLane = targetLane;
    if (!availableLanes.includes(preferredLane)) {
      targetLane = availableLanes.sort((a, b) => Math.abs(a - currentLane) - Math.abs(b - currentLane)
        || Math.abs(a - preferredLane) - Math.abs(b - preferredLane) || a - b)[0];
      targetLaneOffsetMeters = targetLane * laneWidthMeters;
    }
    if (targetLane === currentLane) {
      laneChangeActive = false;
      laneChangeFromLane = currentLane;
    } else {
      if (!laneChangeActive) laneChangeFromLane = currentLane;
      laneChangeActive = true;
    }
  } else if (laneChangeActive) {
    targetLane = currentLane;
    targetLaneOffsetMeters = currentLane * laneWidthMeters;
    laneChangeActive = false;
    laneChangeFromLane = currentLane;
  }

  const laneChangeSpeedMps = 5.5 + driver.skill * 1.5;
  const laneOffsetMeters = availableLanes.length
    ? approach(currentOffsetMeters, targetLaneOffsetMeters, laneChangeSpeedMps * deltaSeconds)
    : currentOffsetMeters;
  const reachedLane = Math.abs(targetLaneOffsetMeters - laneOffsetMeters) < 0.03;
  const settledLaneOffsetMeters = reachedLane ? targetLaneOffsetMeters : laneOffsetMeters;
  const nextLaneOffset = clamp(settledLaneOffsetMeters / trackHalfWidthMeters, -1, 1);

  let desiredSpeed = Math.min(driver.maxSpeedMps, targetSpeedMps)
    * (0.94 + driver.skill * 0.06)
    * (1 - curveSharpness * (0.68 - driver.skill * 0.04));
  let blockingLaneSpeedMps = null;
  if (trafficAhead !== undefined) {
    const lead = relevantTraffic.filter((traffic) => traffic.lane === occupiedLane)
      .sort((a, b) => a.gapMeters - b.gapMeters)[0];
    if (lead) {
      const leadSpeedMps = Math.max(0, speedMps - (lead.relativeSpeedMps ?? 0));
      blockingLaneSpeedMps = leadSpeedMps;
      const minimumGapMeters = Math.max(7, Math.max(0, speedMps) * 0.25);
      const gapSpeedMps = leadSpeedMps + Math.sqrt(12 * Math.max(0, lead.gapMeters - minimumGapMeters));
      desiredSpeed = Math.min(desiredSpeed, Math.max(0, gapSpeedMps));
    }
  } else if (!availableLanes.length) {
    // ponytail: blockedLanes has no gap/speed data; keep a crawl cap until trafficAhead is supplied.
    desiredSpeed = Math.max(Math.min(desiredSpeed, driver.maxSpeedMps * 0.2), driver.maxSpeedMps * 0.08);
  }
  const speedError = desiredSpeed - speedMps;
  const desiredPedal = clamp(speedError / 8, -1, 1);
  const previousPedal = driver.controls.throttle - driver.controls.brake;
  const pedalRate = desiredPedal < previousPedal ? 7.2 + driver.skill * 2.4 : 3 + driver.skill * 1.8;
  const pedal = smooth(previousPedal, desiredPedal, pedalRate, deltaSeconds);
  const lateralTargetError = targetLaneOffsetMeters - lateralError;
  const laneHeadingError = Math.atan2(lateralTargetError, Math.max(2, Math.abs(speedMps) * 0.6));
  const desiredSteer = clamp((headingError + laneHeadingError) * (1.6 + driver.skill * 0.2)
    + Math.atan2(lateralTargetError * (0.45 + driver.skill * 0.1), Math.max(2, Math.abs(speedMps) * 0.25)), -1, 1);
  const steerRate = 4.8 + driver.skill * 2.4;
  const controls = {
    steer: approach(driver.controls.steer, desiredSteer, steerRate * deltaSeconds),
    throttle: speedMps <= 0 && desiredSpeed === 0 ? 0 : Math.max(speedMps <= 0 && desiredSpeed > 0 ? 0.12 : 0, pedal),
    brake: speedMps > 0 ? Math.max(0, -pedal) : 0,
  };
  const nextDriver = {
    ...driver,
    laneOffset: nextLaneOffset,
    laneOffsetMeters: settledLaneOffsetMeters,
    targetLane,
    targetLaneOffsetMeters,
    laneChangeActive,
    laneChangeFromLane,
    trackHalfWidthMeters,
    laneWidthMeters,
    controls,
  };

  return {
    driver: nextDriver,
    controls,
    laneOffset: nextLaneOffset,
    laneOffsetMeters: settledLaneOffsetMeters,
    targetLane,
    targetLaneOffsetMeters,
    laneChangeActive,
    laneChangeFromLane,
    laneSpacingMeters: laneWidthMeters,
  };
}

// Progresso e a fracao da volta atual (0..1), somada as voltas ja validadas pelo sistema de corrida.
export function rankRacers(racers) {
  if (!Array.isArray(racers) || racers.some((racer) => !racer || !validId(racer.id)
    || !Number.isSafeInteger(racer.completedLaps) || racer.completedLaps < 0
    || !Number.isFinite(racer.progress) || racer.progress < 0 || racer.progress > 1)) {
    throw new TypeError("Classificacao exige id, voltas completas e progresso entre 0 e 1.");
  }

  return [...racers].sort((a, b) => {
    const progressOrder = b.completedLaps - a.completedLaps || b.progress - a.progress;
    if (progressOrder) return progressOrder;
    if (typeof a.id !== typeof b.id) return typeof a.id === "number" ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}
