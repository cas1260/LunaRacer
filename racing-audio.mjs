const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const finiteOrZero = (value) => Number.isFinite(value) ? value : 0;

export function createRacingAudio({ AudioContext: AudioContextConstructor, maxSpeedMps = 98 } = {}) {
  let context = null;
  let master = null;
  let engineGain = null;
  let tireGain = null;
  let brakeGain = null;
  let engineOscillator = null;
  let harmonicOscillator = null;
  let tireOscillator = null;
  let brakeOscillator = null;
  let unlocked = false;
  let paused = false;
  let disposed = false;
  let disposePromise = null;
  let state = { speed: 0, throttle: 0, brake: 0, drift: 0 };
  const nodes = new Set();

  if (!Number.isFinite(maxSpeedMps) || maxSpeedMps <= 0) {
    throw new RangeError("A velocidade máxima de áudio precisa ser positiva.");
  }

  function makeNode(factory) {
    const node = factory.call(context);
    nodes.add(node);
    return node;
  }

  function setParam(param, value, timeConstant = 0.035) {
    if (typeof param.setTargetAtTime === "function") {
      param.setTargetAtTime(value, context.currentTime, timeConstant);
    } else {
      param.value = value;
    }
  }

  function setOutput(value) {
    if (master) setParam(master.gain, value);
  }

  function applyState() {
    if (!unlocked || paused || disposed) return;
    const speedRatio = clamp(Math.abs(state.speed) / maxSpeedMps);
    setParam(engineOscillator.frequency, 42 + speedRatio * 165 + state.throttle * 24);
    setParam(harmonicOscillator.frequency, 84 + speedRatio * 330 + state.throttle * 48);
    setParam(engineGain.gain, 0.12 + state.throttle * 0.07);
    setParam(tireOscillator.frequency, 700 + state.drift * 900);
    setParam(tireGain.gain, state.drift * 0.055);
    setParam(brakeOscillator.frequency, 150 + state.brake * 180);
    setParam(brakeGain.gain, state.brake * 0.045);
  }

  function createEngine() {
    master = makeNode(context.createGain);
    master.gain.value = paused ? 0 : 0.65;
    master.connect(context.destination);

    engineGain = makeNode(context.createGain);
    engineGain.gain.value = 0;
    engineGain.connect(master);
    engineOscillator = makeNode(context.createOscillator);
    engineOscillator.type = "sawtooth";
    engineOscillator.frequency.value = 42;
    engineOscillator.connect(engineGain);
    engineOscillator.start();

    harmonicOscillator = makeNode(context.createOscillator);
    harmonicOscillator.type = "triangle";
    harmonicOscillator.frequency.value = 84;
    harmonicOscillator.connect(engineGain);
    harmonicOscillator.start();

    tireGain = makeNode(context.createGain);
    tireGain.gain.value = 0;
    tireGain.connect(master);
    tireOscillator = makeNode(context.createOscillator);
    tireOscillator.type = "sawtooth";
    tireOscillator.frequency.value = 700;
    tireOscillator.connect(tireGain);
    tireOscillator.start();

    brakeGain = makeNode(context.createGain);
    brakeGain.gain.value = 0;
    brakeGain.connect(master);
    brakeOscillator = makeNode(context.createOscillator);
    brakeOscillator.type = "triangle";
    brakeOscillator.frequency.value = 150;
    brakeOscillator.connect(brakeGain);
    brakeOscillator.start();
  }

  function emitTone({ frequency, endFrequency = frequency, duration, amplitude, type = "triangle" }) {
    if (!unlocked || paused || disposed) return false;
    const oscillator = makeNode(context.createOscillator);
    const envelope = makeNode(context.createGain);
    const now = context.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.linearRampToValueAtTime(endFrequency, now + duration);
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(amplitude, now + 0.012);
    envelope.gain.linearRampToValueAtTime(0, now + duration);
    oscillator.connect(envelope);
    envelope.connect(master);
    oscillator.onended = () => {
      for (const node of [oscillator, envelope]) {
        try { node.disconnect(); } catch {}
        nodes.delete(node);
      }
    };
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
    return true;
  }

  function unlock() {
    if (disposed) return Promise.resolve(false);
    if (!context) {
      const Constructor = AudioContextConstructor
        ?? globalThis.AudioContext
        ?? globalThis.webkitAudioContext;
      if (!Constructor) throw new Error("Web Audio API indisponível neste navegador.");
      context = new Constructor();
      createEngine();
      unlocked = true;
    }
    return Promise.resolve(context.resume()).then(() => {
      applyState();
      return true;
    });
  }

  function update(nextState = {}) {
    if (disposed) return false;
    state = {
      speed: finiteOrZero(nextState.speed),
      throttle: clamp(finiteOrZero(nextState.throttle)),
      brake: clamp(finiteOrZero(nextState.brake)),
      drift: clamp(finiteOrZero(nextState.drift)),
    };
    applyState();
    return true;
  }

  function emit(event) {
    const type = typeof event === "string" ? event : event?.type;
    switch (type) {
      case "countdown":
      case "countdown-started":
      case "countdown-tick": {
        const count = typeof event === "object" && Number.isFinite(event.count) ? event.count : 0;
        return emitTone({ frequency: 560 + clamp(count, 0, 3) * 55, duration: 0.12, amplitude: 0.16 });
      }
      case "green-flag":
        return emitTone({ frequency: 880, duration: 0.28, amplitude: 0.2 });
      case "checkpoint":
      case "checkpoint-passed":
        return emitTone({ frequency: 740, endFrequency: 990, duration: 0.18, amplitude: 0.18 });
      case "collision":
        return emitTone({ frequency: 150, endFrequency: 48, duration: 0.24, amplitude: 0.32, type: "sine" });
      case "finish":
      case "race-finished":
        return emitTone({ frequency: 660, endFrequency: 990, duration: 0.55, amplitude: 0.2 });
      default:
        return false;
    }
  }

  function pause() {
    if (disposed || paused) return false;
    paused = true;
    setOutput(0);
    return true;
  }

  function resume() {
    if (disposed || !context) return Promise.resolve(false);
    return Promise.resolve(context.resume()).then(() => {
      paused = false;
      setOutput(0.65);
      applyState();
      return true;
    });
  }

  function dispose() {
    if (disposePromise) return disposePromise;
    disposed = true;
    unlocked = false;
    for (const node of nodes) {
      try { node.stop?.(); } catch {}
      try { node.disconnect(); } catch {}
    }
    nodes.clear();
    const closing = context?.close?.();
    disposePromise = Promise.resolve(closing).then(() => {
      context = null;
      return true;
    });
    return disposePromise;
  }

  return { unlock, update, emit, pause, resume, dispose };
}
