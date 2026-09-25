export function createRace(totalCheckpoints = 4, totalLaps = 3, options = {}) {
  if (!Number.isInteger(totalCheckpoints) || totalCheckpoints < 2) {
    throw new RangeError("A corrida exige pelo menos dois checkpoints.");
  }
  if (!Number.isInteger(totalLaps) || totalLaps < 1) {
    throw new RangeError("A corrida exige pelo menos uma volta.");
  }
  const initialTimeMs = options.initialTimeMs ?? 58000;
  const checkpointBonusMs = options.checkpointBonusMs ?? 15000;
  const countdownMs = options.countdownMs ?? 3000;
  if (![initialTimeMs, checkpointBonusMs, countdownMs].every(Number.isFinite)
      || initialTimeMs <= 0 || checkpointBonusMs < 0 || countdownMs < 0) {
    throw new RangeError("Tempos da corrida inválidos.");
  }

  return {
    status: "ready",
    totalCheckpoints,
    totalLaps,
    initialTimeMs,
    checkpointBonusMs,
    countdownRemainingMs: countdownMs,
    timeRemainingMs: initialTimeMs,
    raceTimeElapsedMs: 0,
    pausedFromStatus: null,
    finishReason: null,
    completedLaps: 0,
    nextCheckpoint: 0,
    raceStartedAt: null,
    lapStartedAt: null,
    lastCheckpointAt: null,
    lastLapMs: null,
    bestLapMs: null,
    totalTimeMs: null,
  };
}

export function beginCountdown(race) {
  if (!race || race.status !== "ready") return { race, event: { type: "start-ignored" } };
  return {
    race: { ...race, status: "countdown", countdownRemainingMs: race.countdownRemainingMs },
    event: { type: "countdown-started", countdownRemainingMs: race.countdownRemainingMs },
  };
}

export function advanceRace(race, deltaMs) {
  if (!race || !Number.isFinite(deltaMs) || deltaMs < 0) {
    throw new TypeError("Corrida e intervalo precisam ser válidos.");
  }
  if (race.status === "paused" || race.status === "ready" || race.status === "finished") {
    return { race, event: null };
  }

  let next = { ...race };
  let remainingDelta = deltaMs;
  let event = null;
  if (next.status === "countdown") {
    const consumed = Math.min(remainingDelta, next.countdownRemainingMs);
    next.countdownRemainingMs -= consumed;
    remainingDelta -= consumed;
    if (next.countdownRemainingMs === 0) {
      next.status = "racing";
      event = { type: "green-flag" };
    }
  }

  if (next.status === "racing" && remainingDelta > 0) {
    next.raceTimeElapsedMs += remainingDelta;
    next.timeRemainingMs = Math.max(0, next.timeRemainingMs - remainingDelta);
    if (next.timeRemainingMs === 0) {
      next.status = "finished";
      next.finishReason = "time-expired";
      next.totalTimeMs = next.raceTimeElapsedMs;
      event = { type: "time-expired", totalTimeMs: next.totalTimeMs };
    }
  }
  return { race: next, event };
}

export function togglePause(race) {
  if (!race || !["countdown", "racing", "paused"].includes(race.status)) return race;
  if (race.status === "paused") {
    return { ...race, status: race.pausedFromStatus ?? "racing", pausedFromStatus: null };
  }
  return { ...race, status: "paused", pausedFromStatus: race.status };
}

export function passCheckpoint(race, checkpointIndex, timestampMs) {
  if (!race || !Number.isInteger(checkpointIndex) || !Number.isFinite(timestampMs) || timestampMs < 0) {
    throw new TypeError("Corrida, checkpoint e instante precisam ser válidos.");
  }
  if (checkpointIndex < 0 || checkpointIndex >= race.totalCheckpoints) {
    throw new RangeError("Checkpoint fora da pista.");
  }

  const ignored = (reason) => ({
    race,
    event: { type: "checkpoint-ignored", reason, expectedCheckpoint: race.nextCheckpoint },
  });

  if (race.status === "finished") return ignored("race-finished");
  if (race.status === "ready") {
    if (checkpointIndex !== 0) return ignored("race-not-started");
    return {
      race: {
        ...race,
        status: "racing",
        raceStartedAt: timestampMs,
        lapStartedAt: timestampMs,
        lastCheckpointAt: timestampMs,
        nextCheckpoint: 1,
      },
      event: { type: "race-started" },
    };
  }
  if (race.status !== "racing") return ignored("race-not-running");
  if (checkpointIndex === 0 && race.lapStartedAt === null) {
    return {
      race: { ...race, lapStartedAt: timestampMs, raceStartedAt: timestampMs, lastCheckpointAt: timestampMs, nextCheckpoint: 1 },
      event: { type: "lap-started", lap: 1 },
    };
  }
  if (checkpointIndex !== race.nextCheckpoint) return ignored("wrong-order");
  if (timestampMs < race.lastCheckpointAt) {
    throw new RangeError("O instante do checkpoint não pode retroceder.");
  }

  if (checkpointIndex !== 0) {
    const nextCheckpoint = checkpointIndex === race.totalCheckpoints - 1 ? 0 : checkpointIndex + 1;
    const extendTime = checkpointIndex > 0 ? race.checkpointBonusMs : 0;
    return {
      race: {
        ...race,
        nextCheckpoint,
        lastCheckpointAt: timestampMs,
        timeRemainingMs: race.timeRemainingMs + extendTime,
      },
      event: { type: "checkpoint-passed", checkpointIndex, extendTimeMs: extendTime, timeRemainingMs: race.timeRemainingMs + extendTime },
    };
  }

  const lapTimeMs = timestampMs - race.lapStartedAt;
  const bestLapMs = race.bestLapMs === null ? lapTimeMs : Math.min(race.bestLapMs, lapTimeMs);
  const completedLaps = race.completedLaps + 1;
  const finished = completedLaps >= race.totalLaps;
  const nextRace = {
    ...race,
    status: finished ? "finished" : "racing",
    completedLaps,
    nextCheckpoint: finished ? 0 : 1,
    lapStartedAt: finished ? null : timestampMs,
    lastCheckpointAt: timestampMs,
    lastLapMs: lapTimeMs,
    bestLapMs,
    totalTimeMs: finished ? race.raceTimeElapsedMs : null,
  };

  return {
    race: nextRace,
    event: {
      type: finished ? "race-finished" : "lap-completed",
      lapTimeMs,
      bestLapMs,
      totalTimeMs: nextRace.totalTimeMs,
      isNewRecord: race.bestLapMs === null || lapTimeMs < race.bestLapMs,
      completedLaps,
    },
  };
}
