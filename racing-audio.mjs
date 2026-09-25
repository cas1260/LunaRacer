const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const finiteOrZero = (value) => Number.isFinite(value) ? value : 0;

export function createRacingAudio({ AudioContext: AudioContextConstructor, maxSpeedMps = 98 } = {}) {
  let context = null;
  let master = null;
  let engineGain = null;
  let harmonicGain = null;
  let tireGain = null;
  let brakeGain = null;
  let engineOscillator = null;
  let harmonicOscillator = null;
  let tireOscillator = null;
  let brakeOscillator = null;
  let masterVolume = 1;
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

  function setParam(param, value, timeConstant = 0.08) {
    if (typeof param.setTargetAtTime === "function") {
      param.setTargetAtTime(value, context.currentTime, timeConstant);
    } else {
      param.value = value;
    }
  }

  function setOutput(value) {
    if (master) setParam(master.gain, value * masterVolume);
  }

  function applyState() {
    if (!unlocked || paused || disposed) return;
    const speedRatio = clamp(Math.abs(state.speed) / maxSpeedMps);
    setParam(engineOscillator.frequency, 55 + speedRatio * 120 + state.throttle * 18);
    setParam(harmonicOscillator.frequency, 110 + speedRatio * 240 + state.throttle * 36);
    setParam(engineGain.gain, 0.045 + state.throttle * 0.03);
    setParam(harmonicGain.gain, 0.008 + state.throttle * 0.012);
    setParam(tireOscillator.frequency, 260 + state.drift * 300);
    setParam(tireGain.gain, state.drift * 0.018);
    setParam(brakeOscillator.frequency, 120 + state.brake * 70);
    setParam(brakeGain.gain, state.brake * 0.014);
  }

  function createEngine() {
    master = makeNode(context.createGain);
    master.gain.value = paused ? 0 : 0.5 * masterVolume;
    master.connect(context.destination);

    engineGain = makeNode(context.createGain);
    engineGain.gain.value = 0;
    engineGain.connect(master);
    engineOscillator = makeNode(context.createOscillator);
    engineOscillator.type = "triangle";
    engineOscillator.frequency.value = 55;
    engineOscillator.connect(engineGain);
    engineOscillator.start();

    harmonicGain = makeNode(context.createGain);
    harmonicGain.gain.value = 0;
    harmonicGain.connect(master);
    harmonicOscillator = makeNode(context.createOscillator);
    harmonicOscillator.type = "sine";
    harmonicOscillator.frequency.value = 110;
    harmonicOscillator.connect(harmonicGain);
    harmonicOscillator.start();

    tireGain = makeNode(context.createGain);
    tireGain.gain.value = 0;
    tireGain.connect(master);
    tireOscillator = makeNode(context.createOscillator);
    tireOscillator.type = "triangle";
    tireOscillator.frequency.value = 260;
    tireOscillator.connect(tireGain);
    tireOscillator.start();

    brakeGain = makeNode(context.createGain);
    brakeGain.gain.value = 0;
    brakeGain.connect(master);
    brakeOscillator = makeNode(context.createOscillator);
    brakeOscillator.type = "sine";
    brakeOscillator.frequency.value = 120;
    brakeOscillator.connect(brakeGain);
    brakeOscillator.start();
  }

  function emitTone({ frequency, endFrequency = frequency, duration, amplitude, type = "sine" }) {
    if (!unlocked || paused || disposed) return false;
    const oscillator = makeNode(context.createOscillator);
    const envelope = makeNode(context.createGain);
    const now = context.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.linearRampToValueAtTime(endFrequency, now + duration);
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(amplitude, now + Math.min(0.045, duration * 0.25));
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

  function setVolume(value) {
    if (disposed) return false;
    masterVolume = clamp(finiteOrZero(value));
    setOutput(paused ? 0 : 0.5);
    return masterVolume;
  }

  function emit(event) {
    const type = typeof event === "string" ? event : event?.type;
    switch (type) {
      case "countdown":
      case "countdown-started":
      case "countdown-tick": {
        const count = typeof event === "object" && Number.isFinite(event.count) ? event.count : 0;
        return emitTone({ frequency: 330 + clamp(count, 0, 3) * 30, duration: 0.18, amplitude: 0.04 });
      }
      case "green-flag":
        return emitTone({ frequency: 420, endFrequency: 530, duration: 0.36, amplitude: 0.06 });
      case "checkpoint":
      case "checkpoint-passed":
        return emitTone({ frequency: 350, endFrequency: 490, duration: 0.3, amplitude: 0.045 });
      case "collision":
        return emitTone({ frequency: 110, endFrequency: 55, duration: 0.3, amplitude: 0.08 });
      case "finish":
      case "race-finished":
        return emitTone({ frequency: 420, endFrequency: 600, duration: 0.55, amplitude: 0.055 });
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
      setOutput(0.5);
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

  return { unlock, update, emit, setVolume, pause, resume, dispose };
}
