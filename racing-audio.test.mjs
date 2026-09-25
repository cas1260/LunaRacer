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
  assert.ok(gains[2].gain.value > 0); // Pneus em derrapagem.
  assert.ok(gains[3].gain.value > 0); // Frenagem.

  audio.update({ speed: 30, throttle: 0, brake: 0, drift: 0 });
  assert.equal(gains[2].gain.value, 0);
  assert.equal(gains[3].gain.value, 0);
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
  assert.equal(master.gain.value, 0.65);
  assert.equal(context.resumeCount, 2);
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
