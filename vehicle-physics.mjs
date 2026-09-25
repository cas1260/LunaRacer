export const DEFAULT_VEHICLE_CONFIG = Object.freeze({
  wheelbase: 3.55,
  maxSpeedMps: 98,
  maxReverseMps: 11,
  maxSteeringAngle: 0.42,
  minimumSteeringSpeedMps: 0,
  maxLateralAccelerationMps2: 40,
  accelerationMps2: 11,
  brakingMps2: 26,
  reverseAccelerationMps2: 5,
  rollingResistance: 0.18,
  aerodynamicDrag: 0.00115,
  lateralAcceleration: 2.1,
  lateralGrip: 5.2,
  wheelRadius: 0.34,
});

export const FIXED_PHYSICS_STEP_SECONDS = 1 / 120;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const wrapAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));
// Exponential center-height response approaches track contact without vertical snapping.
const SURFACE_HEIGHT_RESPONSE = 8;

export function createVehicleState(initial = {}) {
  return {
    x: Number.isFinite(initial.x) ? initial.x : 0,
    y: Number.isFinite(initial.y) ? initial.y : 0,
    z: Number.isFinite(initial.z) ? initial.z : 0,
    yaw: Number.isFinite(initial.yaw) ? initial.yaw : 0,
    speedMps: Number.isFinite(initial.speedMps) ? initial.speedMps : 0,
    lateralMps: Number.isFinite(initial.lateralMps) ? initial.lateralMps : 0,
    wheelRotation: Number.isFinite(initial.wheelRotation) ? initial.wheelRotation : 0,
  };
}

// Coordinates: +Y up, vehicle forward -Z, right +X, positive steer means right.
export function stepVehicle(state, input, deltaSeconds, config = {}) {
  if (!state || !input || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0 || deltaSeconds > 10) {
    throw new TypeError("Estado, entrada e intervalo físico precisam ser válidos.");
  }

  const settings = { ...DEFAULT_VEHICLE_CONFIG, ...config };
  const positive = ["wheelbase", "maxSpeedMps", "maxReverseMps", "wheelRadius", "maxLateralAccelerationMps2"];
  const nonNegative = ["maxSteeringAngle", "minimumSteeringSpeedMps", "accelerationMps2", "brakingMps2", "reverseAccelerationMps2", "rollingResistance", "aerodynamicDrag", "lateralAcceleration", "lateralGrip"];
  if (settings.surfaceHeight !== undefined && typeof settings.surfaceHeight !== "function") {
    throw new TypeError("A altura da superfície precisa ser uma função.");
  }
  if (positive.some((key) => !Number.isFinite(settings[key]) || settings[key] <= 0)
    || nonNegative.some((key) => !Number.isFinite(settings[key]) || settings[key] < 0)
    || ![state.x, state.y, state.z, state.yaw, state.speedMps, state.lateralMps, state.wheelRotation].every(Number.isFinite)) {
    throw new RangeError("Estado ou configuração física inválidos.");
  }

  const steer = clamp(Number.isFinite(input.steer) ? input.steer : 0, -1, 1);
  const throttle = clamp(Number.isFinite(input.throttle) ? input.throttle : 0, 0, 1);
  const brake = clamp(Number.isFinite(input.brake) ? input.brake : 0, 0, 1);
  let current = state;
  let remaining = deltaSeconds;
  while (remaining > 1e-12) {
    const step = Math.min(FIXED_PHYSICS_STEP_SECONDS, remaining);
    const next = stepFixed(current, { steer, throttle, brake }, step, settings);
    if (settings.surfaceHeight) {
      const surfaceHeight = readSurfaceHeight(settings.surfaceHeight, next.x, next.z);
      const response = 1 - Math.exp(-SURFACE_HEIGHT_RESPONSE * step);
      next.y += (surfaceHeight - next.y) * response;
    }
    current = next;
    remaining -= step;
  }
  return current;
}

function readSurfaceHeight(surfaceHeight, x, z) {
  const height = surfaceHeight(x, z);
  if (!Number.isFinite(height)) {
    throw new RangeError("A altura da superfície precisa ser finita.");
  }
  return height;
}

function stepFixed(state, input, deltaSeconds, settings) {
  const { steer, throttle, brake } = input;
  let speedMps = state.speedMps;
  if (throttle > brake) {
    const acceleration = (speedMps < 0 ? settings.brakingMps2 : settings.accelerationMps2) * throttle * deltaSeconds;
    speedMps = speedMps < 0 ? Math.min(0, speedMps + acceleration) : speedMps + acceleration;
  } else if (brake > 0) {
    if (speedMps > 0) {
      speedMps = Math.max(0, speedMps - settings.brakingMps2 * brake * deltaSeconds);
    } else {
      speedMps -= settings.reverseAccelerationMps2 * brake * deltaSeconds;
    }
  } else {
    speedMps *= Math.exp(-settings.rollingResistance * deltaSeconds);
  }

  // Implicit drag remains stable under long frame gaps and cannot reverse velocity.
  speedMps /= 1 + settings.aerodynamicDrag * Math.abs(speedMps) * deltaSeconds;
  speedMps = clamp(speedMps, -settings.maxReverseMps, settings.maxSpeedMps);

  const steeringSpeed = Math.sign(speedMps || 1) * Math.max(Math.abs(speedMps), settings.minimumSteeringSpeedMps);
  const requestedYawRate = -steeringSpeed / settings.wheelbase * Math.tan(steer * settings.maxSteeringAngle);
  const maxYawRate = settings.maxLateralAccelerationMps2 / Math.max(Math.abs(speedMps), 1);
  const yawRate = clamp(requestedYawRate, -maxYawRate, maxYawRate);
  const yawMid = wrapAngle(state.yaw + yawRate * deltaSeconds * 0.5);
  const yaw = wrapAngle(state.yaw + yawRate * deltaSeconds);
  const forwardX = -Math.sin(yawMid);
  const forwardZ = -Math.cos(yawMid);
  const rightX = Math.cos(yawMid);
  const rightZ = -Math.sin(yawMid);
  const lateralAcceleration = clamp(
    steer * Math.abs(speedMps) * settings.lateralAcceleration / settings.wheelbase,
    -settings.maxLateralAccelerationMps2,
    settings.maxLateralAccelerationMps2,
  );
  const lateralMps = (state.lateralMps + lateralAcceleration * deltaSeconds)
    * Math.exp(-settings.lateralGrip * deltaSeconds);
  const averageSpeed = (state.speedMps + speedMps) * 0.5;
  const averageLateral = (state.lateralMps + lateralMps) * 0.5;

  const x = state.x + (forwardX * averageSpeed + rightX * averageLateral) * deltaSeconds;
  const z = state.z + (forwardZ * averageSpeed + rightZ * averageLateral) * deltaSeconds;
  return {
    x,
    y: state.y,
    z,
    yaw,
    speedMps,
    lateralMps,
    wheelRotation: state.wheelRotation - averageSpeed * deltaSeconds / settings.wheelRadius,
  };
}
