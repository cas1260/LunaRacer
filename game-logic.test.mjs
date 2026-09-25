import assert from "node:assert/strict";
import test from "node:test";
import { advanceRace, beginCountdown, createRace, passCheckpoint, togglePause } from "./game-logic.mjs";

function greenFlag(options = {}) {
  const countdown = beginCountdown(createRace(4, 3, { initialTimeMs: 200000, ...options })).race;
  return advanceRace(countdown, 3000).race;
}

function advanceTo(race, timestampMs) {
  return advanceRace(race, timestampMs - race.raceTimeElapsedMs).race;
}

function completeLap(race, startMs, lapMs) {
  let state = advanceTo(race, startMs);
  state = passCheckpoint(state, 0, startMs).race;
  for (const checkpoint of [1, 2, 3]) {
    const checkpointTime = startMs + lapMs * checkpoint / 4;
    state = advanceTo(state, checkpointTime);
    state = passCheckpoint(state, checkpoint, checkpointTime).race;
  }
  const finishTime = startMs + lapMs;
  state = advanceTo(state, finishTime);
  return passCheckpoint(state, 0, finishTime);
}

test("countdown starts the race after three seconds", () => {
  const countdown = beginCountdown(createRace()).race;
  assert.equal(countdown.status, "countdown");
  const beforeGreen = advanceRace(countdown, 2999);
  assert.equal(beforeGreen.race.status, "countdown");
  assert.equal(beforeGreen.race.countdownRemainingMs, 1);
  const green = advanceRace(beforeGreen.race, 1);
  assert.equal(green.race.status, "racing");
  assert.equal(green.event.type, "green-flag");
});

test("ignores pause time and resumes the countdown deterministically", () => {
  const countdown = advanceRace(beginCountdown(createRace()).race, 1000).race;
  const paused = togglePause(countdown);
  assert.equal(paused.status, "paused");
  assert.equal(advanceRace(paused, 2500).race.countdownRemainingMs, 2000);
  const resumed = togglePause(paused);
  assert.equal(advanceRace(resumed, 2000).race.status, "racing");
});

test("requires checkpoints in order and preserves prior race state", () => {
  const initial = createRace();
  const racing = greenFlag();
  const ignored = passCheckpoint(racing, 2, 1000);
  assert.equal(ignored.event.reason, "wrong-order");
  const started = passCheckpoint(racing, 0, 1000).race;
  assert.equal(racing.lapStartedAt, null);
  assert.equal(started.lapStartedAt, 1000);
  assert.equal(started.nextCheckpoint, 1);
});

test("valid checkpoints extend the timer and lap records improve", () => {
  let state = greenFlag({ initialTimeMs: 10000, checkpointBonusMs: 15000 });
  state = advanceTo(state, 1000);
  state = passCheckpoint(state, 0, 1000).race;
  state = advanceTo(state, 1500);
  let result = passCheckpoint(state, 1, 1500);
  assert.equal(result.event.extendTimeMs, 15000);
  assert.equal(result.race.timeRemainingMs, 23500);

  state = greenFlag();
  result = completeLap(state, 1000, 12000);
  state = result.race;
  assert.equal(result.event.type, "lap-completed");
  assert.equal(result.event.lapTimeMs, 12000);
  assert.equal(result.event.isNewRecord, true);

  result = completeLap(state, 13000, 10000);
  assert.equal(result.race.completedLaps, 2);
  assert.equal(result.race.bestLapMs, 10000);
  assert.equal(result.event.isNewRecord, true);
});

test("finishes after three laps and rejects later crossings", () => {
  let state = greenFlag();
  state = completeLap(state, 1000, 12000).race;
  state = completeLap(state, 13000, 10000).race;
  const final = completeLap(state, 23000, 11000);
  assert.equal(final.event.type, "race-finished");
  assert.equal(final.race.status, "finished");
  assert.equal(final.race.completedLaps, 3);
  assert.equal(final.race.totalTimeMs, 34000);
  assert.equal(passCheckpoint(final.race, 1, 35000).event.reason, "race-finished");
});

test("time expiry finishes the race and pause freezes its countdown", () => {
  let race = beginCountdown(createRace(4, 3, { initialTimeMs: 1000 })).race;
  race = advanceRace(race, 3000).race;
  const paused = togglePause(race);
  const unchanged = advanceRace(paused, 2000);
  assert.equal(unchanged.race.timeRemainingMs, 1000);
  const expired = advanceRace(togglePause(paused), 1000);
  assert.equal(expired.race.status, "finished");
  assert.equal(expired.event.type, "time-expired");
});

test("rejects invalid race configuration and timestamps", () => {
  assert.throws(() => createRace(1, 3), RangeError);
  assert.throws(() => createRace(4, 0), RangeError);
  assert.throws(() => createRace(4, 3, { initialTimeMs: 0 }), RangeError);
  assert.throws(() => passCheckpoint(createRace(), 0, Number.NaN), TypeError);
});

test("rejects checkpoints with timestamps that move backward", () => {
  const started = passCheckpoint(greenFlag(), 0, 1000).race;
  const afterFirst = passCheckpoint(started, 1, 2000).race;
  assert.throws(() => passCheckpoint(afterFirst, 2, 1500), RangeError);
});
