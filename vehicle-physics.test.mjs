import assert from "node:assert/strict";
import test from "node:test";
import { createVehicleState, stepVehicle } from "./vehicle-physics.mjs";

test("positive speed moves along local -Z", () => {
  const next = stepVehicle(createVehicleState(), { throttle: 1 }, 0.5);
  assert.ok(next.speedMps > 0);
  assert.ok(next.z < 0);
  assert.equal(next.x, 0);
});

test("steer sign produces the requested world direction", () => {
  const straight = createVehicleState({ speedMps: 25 });
  const right = stepVehicle(straight, { steer: 1 }, 0.2);
  const left = stepVehicle(straight, { steer: -1 }, 0.2);
  assert.ok(right.x > 0 && right.yaw < 0);
  assert.ok(left.x < 0 && left.yaw > 0);
});

test("braking crosses zero consistently and continues into reverse", () => {
  const moving = createVehicleState({ speedMps: 9 });
  const stopped = stepVehicle(moving, { brake: 1 }, 0.5);
  assert.ok(stopped.speedMps <= 0);
  const reverse = stepVehicle(stopped, { brake: 1 }, 0.5);
  assert.ok(reverse.speedMps < 0);
  assert.ok(reverse.z > stopped.z);
});

test("speed is clamped and lateral slip decays under grip", () => {
  const fast = stepVehicle(createVehicleState({ speedMps: 97 }), { throttle: 1 }, 1);
  const sliding = createVehicleState({ speedMps: 32, lateralMps: 8 });
  const gripped = stepVehicle(sliding, {}, 0.2);
  assert.ok(fast.speedMps <= 98);
  assert.ok(Math.abs(gripped.lateralMps) < Math.abs(sliding.lateralMps));
});

test("render-rate-sized calls subdivide to the same fixed physics steps", () => {
  const state = createVehicleState({ speedMps: 55 });
  const oneSecond = stepVehicle(state, { steer: 0.4, throttle: 0.65 }, 1);
  let sixtyFrames = state;
  for (let frame = 0; frame < 60; frame += 1) {
    sixtyFrames = stepVehicle(sixtyFrames, { steer: 0.4, throttle: 0.65 }, 1 / 60);
  }
  for (const key of ["x", "z", "yaw", "speedMps", "lateralMps", "wheelRotation"]) {
    assert.ok(Math.abs(oneSecond[key] - sixtyFrames[key]) < 1e-8, key);
  }
});

test("braking through zero is identical at 60 Hz and 120 Hz", () => {
  const initial = createVehicleState({ speedMps: 0.11, lateralMps: 0.4 });
  const config = { surfaceHeight: (x, z) => x * 0.2 - z * 0.1 };
  let sixtyHz = initial;
  let oneTwentyHz = initial;
  for (let frame = 0; frame < 60; frame += 1) {
    sixtyHz = stepVehicle(sixtyHz, { brake: 1, steer: 0.3 }, 1 / 60, config);
  }
  for (let frame = 0; frame < 120; frame += 1) {
    oneTwentyHz = stepVehicle(oneTwentyHz, { brake: 1, steer: 0.3 }, 1 / 120, config);
  }

  assert.ok(sixtyHz.speedMps < 0);
  for (const key of ["x", "y", "z", "yaw", "speedMps", "lateralMps", "wheelRotation"]) {
    assert.ok(Math.abs(sixtyHz[key] - oneTwentyHz[key]) < 1e-8, key);
  }
});

test("surface height approaches contact continuously at each substep", () => {
  const samples = [];
  const state = createVehicleState({ y: 2, speedMps: 12 });
  const next = stepVehicle(state, { throttle: 1 }, 0.25, {
    surfaceHeight: (x, z) => {
      samples.push([x, z]);
      return 12;
    },
  });

  assert.equal(samples.length, 30);
  assert.ok(samples.every(([x, z]) => Number.isFinite(x) && Number.isFinite(z)));
  assert.ok(next.y > state.y && next.y < 12);
  assert.ok(samples.length > 1);
  let previousY = state.y;
  for (let index = 1; index <= samples.length; index += 1) {
    const progress = 1 - Math.exp(-8 * index / 120);
    const y = state.y + (12 - state.y) * progress;
    assert.ok(y > previousY);
    previousY = y;
  }
  assert.ok(Math.abs(next.y - previousY) < 1e-9);
});

test("surface height descends toward contact without snapping", () => {
  let state = createVehicleState({ y: 12 });
  for (let index = 0; index < 5; index += 1) {
    const next = stepVehicle(state, {}, 1 / 120, { surfaceHeight: () => 0 });
    assert.ok(next.y < state.y && next.y > 0);
    state = next;
  }
});

test("surface height follows changing horizontal position without changing yaw", () => {
  const samples = [];
  const state = createVehicleState({ x: 1, y: 0, z: -3, yaw: 0.2, speedMps: 10 });
  const input = { steer: 0.5 };
  const baseline = stepVehicle(state, input, 0.1);
  const next = stepVehicle(state, { steer: 0.5 }, 0.1, {
    surfaceHeight: (x, z) => {
      samples.push([x, z]);
      return x * 0.5 + z * 0.25;
    },
  });

  assert.ok(samples.length > 1);
  assert.ok(samples.some(([x, z]) => x !== state.x || z !== state.z));
  assert.ok(Number.isFinite(next.y));
  assert.notEqual(next.y, state.y);
  let expectedY = state.y;
  for (const [x, z] of samples) {
    expectedY += (x * 0.5 + z * 0.25 - expectedY) * (1 - Math.exp(-8 / 120));
  }
  assert.ok(Math.abs(next.y - expectedY) < 1e-10);
  assert.equal(next.yaw, baseline.yaw);
});

test("surface height follows a ramp continuously instead of freezing or snapping", () => {
  const surfaceHeight = (x, z) => -z * 0.12 + x * 0.04;
  let state = createVehicleState({ y: surfaceHeight(0, 0), speedMps: 8 });
  for (let index = 0; index < 120; index += 1) {
    const previousY = state.y;
    state = stepVehicle(state, {}, 1 / 120, { surfaceHeight });
    const height = surfaceHeight(state.x, state.z);
    assert.ok(state.y > previousY);
    assert.ok(state.y <= height);
  }
  assert.ok(state.y > 0.6);
});

test("surface height is optional and rejects invalid callbacks and heights", () => {
  const state = createVehicleState({ y: 2 });
  assert.equal(stepVehicle(state, {}, 1 / 120).y, state.y);
  assert.throws(() => stepVehicle(state, {}, 1 / 120, { surfaceHeight: 12 }), TypeError);
  for (const invalidHeight of [Number.NaN, Number.POSITIVE_INFINITY, "12"]) {
    assert.throws(() => stepVehicle(state, {}, 1 / 120, { surfaceHeight: () => invalidHeight }), RangeError);
  }
  assert.throws(() => stepVehicle(state, {}, 1 / 120, { surfaceHeight: () => { throw new Error("surface failure"); } }), /surface failure/);
});

test("drag cannot reverse a high-speed car and high-speed steering stays bounded", () => {
  let state = createVehicleState({ speedMps: 98 });
  for (let second = 0; second < 6; second += 1) {
    state = stepVehicle(state, { throttle: 1 }, 1);
    assert.ok(state.speedMps >= 0);
  }
  const turn = stepVehicle(createVehicleState({ speedMps: 98 }), { steer: 1 }, 0.5);
  assert.ok(turn.x > 0);
  assert.ok(turn.x < 20);
});

test("rejects zero wheelbase/radius and non-finite vehicle states", () => {
  for (const config of [{ wheelbase: 0 }, { wheelRadius: 0 }, { maxLateralAccelerationMps2: 0 }]) {
    assert.throws(() => stepVehicle(createVehicleState(), {}, 1 / 120, config), RangeError);
  }
  assert.throws(() => stepVehicle({ ...createVehicleState(), x: Number.NaN }, {}, 1 / 120), RangeError);
});

test("rejects non-positive physics steps", () => {
  assert.throws(() => stepVehicle(createVehicleState(), {}, 0), TypeError);
  assert.throws(() => stepVehicle(null, {}, 0.1), TypeError);
});
