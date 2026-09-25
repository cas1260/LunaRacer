import assert from "node:assert/strict";
import test from "node:test";
import { createRacingAudio } from "./racing-audio.mjs";

class FakeAudioParam {
  value = 0;
  events = [];

  setTargetAtTime(value, time, constant) {
    this.value = value;
    this.events.push({ type: "target", value, time, constant });
  }

  setValueAtTime(value, time) {
    this.value = value;
    this.events.push({ type: "set", value, time });
  }

  linearRampToValueAtTime(value, time) {
    this.value = value;
    this.events.push({ type: "ramp", value, time });
  }
}

class FakeAudioNode {
  connections = [];
  disconnectCount = 0;

  connect(destination) {
    this.connections.push(destination);
    return destination;
  }

  disconnect() {
    this.disconnectCount += 1;
    this.connections = [];
  }
}

class FakeGain extends FakeAudioNode {
  gain = new FakeAudioParam();
}

class FakeOscillator extends FakeAudioNode {
  frequency = new FakeAudioParam();
  type = "sine";
  started = false;
  stopped = false;

  start() {
    this.started = true;
  }

  stop() {
    this.stopped = true;
  }
}

class FakeAudioContext {
  currentTime = 1;
  state = "suspended";
  destination = new FakeAudioNode();
  nodes = [];
  resumeCount = 0;
  closeCount = 0;

  createGain() {
    const node = new FakeGain();
    this.nodes.push(node);
    return node;
  }

  createOscillator() {
    const node = new FakeOscillator();
    this.nodes.push(node);
    return node;
  }

  resume() {
    this.resumeCount += 1;
    this.state = "running";
    return Promise.resolve();
  }

  close() {
    this.closeCount += 1;
    this.state = "closed";
    return Promise.resolve();
  }
}

function audioFixture(options) {
  let context;
  class InjectedAudioContext extends FakeAudioContext {
    constructor() {
      super();
      context = this;
    }
  }
  return {
    audio: createRacingAudio({ AudioContext: InjectedAudioContext, ...options }),
    get context() { return context; },
  };
}

test("cria o contexto só em unlock e segue velocidade real do motor", async () => {
  const fixture = audioFixture();
  fixture.audio.update({ speed: 12, throttle: 0.5 });
  assert.equal(fixture.context, undefined);

  await fixture.audio.unlock();
  const [engine] = fixture.context.nodes.filter((node) => node instanceof FakeOscillator);
  const lowRpm = engine.frequency.value;
  fixture.audio.update({ speed: 72, throttle: 0.5 });

  assert.equal(fixture.context.resumeCount, 1);
  assert.ok(engine.frequency.value > lowRpm);
  assert.equal(engine.started, true);
});

test("aceleração, frenagem e derrapagem controlam seus canais", async () => {
  const fixture = audioFixture();
  const { audio } = fixture;
  await audio.unlock();
  const { context } = fixture;
  audio.update({ speed: 30, throttle: 0.8, brake: 0.6, drift: 0.7 });

  const gains = context.nodes.filter((node) => node instanceof FakeGain);
  assert.ok(gains[1].gain.value > 0); // Motor com aceleração.
  assert.ok(gains[2].gain.value > 0); // Harmônico do motor.
  assert.ok(gains[3].gain.value > 0); // Pneus em derrapagem.
  assert.ok(gains[4].gain.value > 0); // Frenagem.

  audio.update({ speed: 30, throttle: 0, brake: 0, drift: 0 });
  assert.equal(gains[3].gain.value, 0);
  assert.equal(gains[4].gain.value, 0);
});

test("síntese usa ondas suaves, ganhos baixos e transições graduais", async () => {
  const fixture = audioFixture();
  await fixture.audio.unlock();
  fixture.audio.update({ speed: 72, throttle: 1, brake: 1, drift: 1 });
  const { nodes } = fixture.context;
  const oscillators = nodes.filter((node) => node instanceof FakeOscillator);
  const gains = nodes.filter((node) => node instanceof FakeGain);

  assert.deepEqual(oscillators.map((node) => node.type), ["triangle", "sine", "triangle", "sine"]);
  assert.equal(gains[0].gain.value, 0.5);
  assert.ok(gains.slice(1, 5).every((node) => node.gain.value <= 0.08));
  assert.ok(oscillators.every((node) => node.frequency.events.at(-1).constant >= 0.08));
});

test("só emite colisão por evento explícito e cobre eventos de corrida", async () => {
  const fixture = audioFixture();
  const { audio } = fixture;
  await audio.unlock();
  const { context } = fixture;
  audio.update({ speed: 40, brake: 1, drift: 1 });
  const oscillatorCount = () => context.nodes.filter((node) => node instanceof FakeOscillator).length;
  const continuousOscillators = oscillatorCount();

  assert.equal(audio.emit("desconhecido"), false);
  assert.equal(oscillatorCount(), continuousOscillators);
  for (const event of ["countdown", "checkpoint-passed", "collision", "race-finished"]) {
    assert.equal(audio.emit(event), true);
  }
  assert.equal(oscillatorCount(), continuousOscillators + 4);
  const effects = context.nodes.filter((node) => node instanceof FakeOscillator).slice(continuousOscillators);
  assert.ok(effects.every((node) => node.type === "sine" && node.frequency.value <= 600));
  const envelopes = context.nodes.filter((node) => node instanceof FakeGain).slice(5);
  assert.ok(envelopes.every((node) => node.gain.events[1].value <= 0.08));
  assert.ok(envelopes.every((node) => node.gain.events[1].time - node.gain.events[0].time >= 0.044));
});

test("pause silencia e resume restaura o estado mais recente", async () => {
  const fixture = audioFixture();
  const { audio } = fixture;
  await audio.unlock();
  const { context } = fixture;
  audio.update({ speed: 20, throttle: 0.2 });
  const master = context.nodes.find((node) => node instanceof FakeGain);
  assert.equal(audio.pause(), true);
  assert.equal(master.gain.value, 0);

  audio.update({ speed: 65, throttle: 0.9 });
  assert.equal(master.gain.value, 0);
  assert.equal(await audio.resume(), true);
  assert.equal(master.gain.value, 0.5);
  assert.equal(context.resumeCount, 2);
});

test("volume ajusta efeitos antes e depois do unlock e sobrevive à pausa", async () => {
  const fixture = audioFixture();
  const { audio } = fixture;
  assert.equal(audio.setVolume(0.7), 0.7);
  await audio.unlock();
  const master = fixture.context.nodes.find((node) => node instanceof FakeGain);
  assert.ok(Math.abs(master.gain.value - 0.35) < 1e-9);

  assert.equal(audio.setVolume(0.25), 0.25);
  assert.ok(Math.abs(master.gain.value - 0.125) < 1e-9);
  audio.pause();
  assert.equal(audio.setVolume(1.5), 1);
  assert.equal(master.gain.value, 0);
  await audio.resume();
  assert.equal(master.gain.value, 0.5);
  assert.equal(audio.setVolume(-1), 0);
  assert.equal(master.gain.value, 0);
});

test("dispose libera nodes, fecha o contexto e é idempotente", async () => {
  const fixture = audioFixture();
  const { audio } = fixture;
  await audio.unlock();
  const { context } = fixture;
  audio.emit("collision");
  const nodes = [...context.nodes];

  assert.equal(await audio.dispose(), true);
  assert.equal(await audio.dispose(), true);
  assert.equal(context.closeCount, 1);
  assert.ok(nodes.every((node) => node.disconnectCount > 0));
  assert.ok(nodes.filter((node) => node instanceof FakeOscillator).every((node) => node.stopped));
  assert.equal(audio.update({ speed: 50 }), false);
  assert.equal(audio.emit("collision"), false);
});
