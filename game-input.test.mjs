import test from 'node:test';
import assert from 'node:assert/strict';
import { createInputController } from './game-input.mjs';

// Contratos executados com dependencias injetadas; nao representam teste de hardware fisico.
function ambiente({ focoInicial = true, ...opcoes } = {}) {
  const ouvintes = new Map();
  const windowRef = {
    document: { hasFocus: () => focoInicial },
    addEventListener(tipo, funcao) {
      if (!ouvintes.has(tipo)) ouvintes.set(tipo, new Set());
      ouvintes.get(tipo).add(funcao);
    },
    removeEventListener(tipo, funcao) { ouvintes.get(tipo)?.delete(funcao); },
  };
  const estado = { controles: [] };
  const navigatorRef = { getGamepads() { return estado.controles; } };
  const entrada = createInputController({ windowRef, navigatorRef, ...opcoes });
  const emitir = (tipo, dados = {}) => {
    const evento = { ...dados, preventDefault() { this.defaultPrevented = true; } };
    for (const funcao of ouvintes.get(tipo) ?? []) funcao(evento);
    return evento;
  };
  return {
    ...entrada, estado, navigatorRef, ouvintes, emitir,
    tecla: (code, tipo = 'keydown', dados = {}) => emitir(tipo, { code, ...dados }),
    conectar(controle = controlePadrao()) {
      estado.controles[controle.index] = controle;
      emitir('gamepadconnected', { gamepad: controle });
      entrada.poll();
      return controle;
    },
  };
}

function controlePadrao(opcoes = {}) {
  return {
    index: 0, id: 'Controle de teste injetado', mapping: 'standard', connected: true,
    axes: [0, 0, 0, 0],
    buttons: Array.from({ length: 17 }, () => ({ value: 0, pressed: false, touched: false })),
    ...opcoes,
  };
}

function botao(controle, indice, valor, pressionado = valor > 0.5) {
  controle.buttons[indice] = { value: valor, pressed: pressionado, touched: valor > 0 };
}

function conferirNeutro(saida) {
  for (const chave of ['steer', 'throttle', 'brake']) assert.equal(saida[chave], 0, chave);
  for (const chave of ['cameraToggle', 'pauseToggle', 'reset', 'diagnosticsToggle']) {
    assert.equal(saida[chave], false, chave);
  }
}

function aproximar(real, esperado) {
  assert.ok(Math.abs(real - esperado) < 1e-12, `${real} difere de ${esperado}`);
}

test('API neutra sem navegador e sem Gamepad API', () => {
  const entrada = createInputController({ windowRef: null, navigatorRef: null });
  assert.deepEqual(entrada.poll(), {
    steer: 0, throttle: 0, brake: 0,
    cameraToggle: false, pauseToggle: false, reset: false, diagnosticsToggle: false,
    connected: false, gamepadId: '', mapping: '', rawAxes: [], rawButtons: [],
  });
  entrada.dispose();
});

test('W/S/A/D e setas preservam sinais, entradas simultaneas e soltura independente', () => {
  const entrada = ambiente();
  for (const [tecla, campo, esperado] of [
    ['KeyW', 'throttle', 1], ['ArrowUp', 'throttle', 1],
    ['KeyS', 'brake', 1], ['ArrowDown', 'brake', 1],
    ['KeyA', 'steer', -1], ['ArrowLeft', 'steer', -1],
    ['KeyD', 'steer', 1], ['ArrowRight', 'steer', 1],
  ]) {
    assert.equal(entrada.tecla(tecla).defaultPrevented, true);
    assert.equal(entrada.poll()[campo], esperado);
    entrada.tecla(tecla, 'keyup');
    conferirNeutro(entrada.poll());
  }
  entrada.tecla('KeyW');
  entrada.tecla('KeyS');
  entrada.tecla('KeyA');
  entrada.tecla('ArrowLeft');
  entrada.tecla('KeyA', 'keyup');
  let saida = entrada.poll();
  assert.equal(saida.steer, -1);
  assert.equal(saida.throttle, 1);
  assert.equal(saida.brake, 1);
  entrada.tecla('KeyD');
  assert.equal(entrada.poll().steer, 0);
  entrada.tecla('ArrowLeft', 'keyup');
  assert.equal(entrada.poll().steer, 1);
  entrada.dispose();
});

test('C, R, Escape e F2 geram uma acao por pressionamento, inclusive toque entre polls', () => {
  const entrada = ambiente();
  for (const [tecla, acao] of [
    ['KeyC', 'cameraToggle'], ['KeyR', 'reset'],
    ['Escape', 'pauseToggle'], ['F2', 'diagnosticsToggle'],
  ]) {
    entrada.tecla(tecla);
    assert.equal(entrada.poll()[acao], true);
    assert.equal(entrada.poll()[acao], false);
    entrada.tecla(tecla, 'keydown', { repeat: true });
    entrada.tecla(tecla);
    assert.equal(entrada.poll()[acao], false);
    entrada.tecla(tecla, 'keyup');
    entrada.tecla(tecla);
    entrada.tecla(tecla, 'keyup');
    assert.equal(entrada.poll()[acao], true);
    assert.equal(entrada.poll()[acao], false);
  }
  entrada.dispose();
});

test('teclado nao captura campos editaveis, atalhos modificados ou composicao', () => {
  const entrada = ambiente();
  for (const dados of [
    { target: { tagName: 'INPUT' } }, { target: { tagName: 'TEXTAREA' } },
    { target: { tagName: 'SELECT' } }, { target: { isContentEditable: true } },
    { ctrlKey: true }, { metaKey: true }, { altKey: true }, { isComposing: true },
  ]) {
    assert.equal(entrada.tecla('KeyW', 'keydown', dados).defaultPrevented, undefined);
    conferirNeutro(entrada.poll());
  }
  assert.equal(entrada.tecla('KeyQ').defaultPrevented, undefined);
  entrada.emitir('keydown', { key: 'w' });
  assert.equal(entrada.poll().throttle, 1);
  entrada.emitir('keyup', { key: 'w', target: { tagName: 'INPUT' } });
  conferirNeutro(entrada.poll());
  entrada.dispose();
});

test('deadzone remapeia progressivamente para -1..1 sem inverter sinais', () => {
  const entrada = ambiente();
  const controle = entrada.conectar();
  for (const [eixo, esperado] of [
    [-1, -1], [-0.55, -0.5], [-0.1009, -0.001], [-0.1, 0],
    [-0.09, 0], [0, 0], [0.09, 0], [0.1, 0], [0.1009, 0.001], [0.55, 0.5], [1, 1],
  ]) {
    controle.axes[0] = eixo;
    aproximar(entrada.poll().steer, esperado);
  }
  entrada.dispose();
  for (const deadzone of [0, 0.25, 0.9]) {
    const outra = ambiente({ deadzone });
    const controle = outra.conectar();
    controle.axes[0] = (1 + deadzone) / 2;
    aproximar(outra.poll().steer, 0.5);
    outra.dispose();
  }
});

test('gatilhos 7/6 preservam pressao parcial e botoes 0/1 funcionam como alternativas', () => {
  const entrada = ambiente();
  const controle = entrada.conectar();
  for (const valor of [0, 0.01, 0.25, 0.5, 0.75, 1]) {
    botao(controle, 7, valor);
    botao(controle, 6, 1 - valor);
    const saida = entrada.poll();
    assert.equal(saida.throttle, valor);
    assert.equal(saida.brake, 1 - valor);
  }
  botao(controle, 7, 0.25);
  botao(controle, 6, 0.3);
  botao(controle, 0, 1);
  botao(controle, 1, 1);
  assert.equal(entrada.poll().throttle, 1);
  assert.equal(entrada.poll().brake, 1);
  botao(controle, 0, 0);
  botao(controle, 1, 0);
  assert.equal(entrada.poll().throttle, 0.25);
  assert.equal(entrada.poll().brake, 0.3);
  entrada.dispose();
});

test('D-pad 14/15 respeita sinais, precedencia e cancelamento de opostos', () => {
  const entrada = ambiente();
  const controle = entrada.conectar();
  controle.axes[0] = 0.55;
  botao(controle, 14, 1);
  assert.equal(entrada.poll().steer, -1);
  botao(controle, 15, 1);
  assert.equal(entrada.poll().steer, 0);
  botao(controle, 14, 0);
  assert.equal(entrada.poll().steer, 1);
  botao(controle, 15, 0);
  aproximar(entrada.poll().steer, 0.5);
  entrada.dispose();
});

test('botoes de camera e pausa so disparam na borda e aceitam novo pressionamento', () => {
  const entrada = ambiente();
  const controle = entrada.conectar();
  for (const [indice, acao] of [[3, 'cameraToggle'], [9, 'pauseToggle']]) {
    botao(controle, indice, 1);
    assert.equal(entrada.poll()[acao], true);
    assert.equal(entrada.poll()[acao], false);
    assert.equal(entrada.poll()[acao], false);
    botao(controle, indice, 0);
    assert.equal(entrada.poll()[acao], false);
    botao(controle, indice, 1);
    assert.equal(entrada.poll()[acao], true);
    botao(controle, indice, 0);
    entrada.poll();
  }
  botao(controle, 3, 1);
  entrada.tecla('KeyC');
  assert.equal(entrada.poll().cameraToggle, true);
  assert.equal(entrada.poll().cameraToggle, false);
  entrada.dispose();
});

test('alternancia teclado/gamepad tem prioridade deterministica sem somar pedais', () => {
  const entrada = ambiente();
  const controle = entrada.conectar();
  controle.axes[0] = 1;
  botao(controle, 7, 0.4);
  botao(controle, 6, 0.2);
  entrada.tecla('KeyA');
  entrada.tecla('KeyW');
  let saida = entrada.poll();
  assert.equal(saida.steer, -1);
  assert.equal(saida.throttle, 1);
  assert.equal(saida.brake, 0.2);
  entrada.tecla('KeyD');
  assert.equal(entrada.poll().steer, 0);
  entrada.tecla('KeyW', 'keyup');
  entrada.tecla('KeyA', 'keyup');
  entrada.tecla('KeyD', 'keyup');
  saida = entrada.poll();
  assert.equal(saida.steer, 1);
  assert.equal(saida.throttle, 0.4);
  entrada.dispose();
});

test('blur limpa teclas e acoes, ignora repeticao e exige gamepad neutro apos foco', () => {
  const entrada = ambiente();
  const controle = entrada.conectar();
  entrada.tecla('KeyW');
  entrada.tecla('KeyC');
  botao(controle, 7, 1);
  botao(controle, 9, 1);
  entrada.emitir('blur');
  conferirNeutro(entrada.poll());
  entrada.tecla('KeyD');
  conferirNeutro(entrada.poll());
  entrada.emitir('focus');
  entrada.tecla('KeyW', 'keydown', { repeat: true });
  conferirNeutro(entrada.poll());
  conferirNeutro(entrada.poll());
  botao(controle, 7, 0);
  botao(controle, 9, 0);
  conferirNeutro(entrada.poll());
  botao(controle, 7, 0.3);
  botao(controle, 9, 1);
  assert.equal(entrada.poll().pauseToggle, true);
  assert.equal(entrada.poll().throttle, 0.3);
  entrada.tecla('KeyW');
  assert.equal(entrada.poll().throttle, 1);
  entrada.dispose();
});

test('disconnect neutraliza mesmo com snapshot desatualizado; reconnect nao repete comandos mantidos', () => {
  const entrada = ambiente();
  const controle = entrada.conectar();
  botao(controle, 7, 1);
  botao(controle, 3, 1);
  controle.axes[0] = -1;
  assert.equal(entrada.poll().throttle, 1);
  entrada.tecla('KeyW');
  entrada.tecla('KeyR');
  entrada.emitir('gamepaddisconnected', { gamepad: controle });
  let saida = entrada.poll();
  conferirNeutro(saida);
  assert.equal(saida.connected, false);
  conferirNeutro(entrada.poll());
  entrada.emitir('gamepadconnected', { gamepad: controle });
  saida = entrada.poll();
  assert.equal(saida.connected, true);
  conferirNeutro(saida);
  conferirNeutro(entrada.poll());
  botao(controle, 7, 0);
  botao(controle, 3, 0);
  controle.axes[0] = 0;
  conferirNeutro(entrada.poll());
  botao(controle, 7, 0.5);
  botao(controle, 3, 1);
  saida = entrada.poll();
  assert.equal(saida.throttle, 0.5);
  assert.equal(saida.cameraToggle, true);
  assert.equal(entrada.poll().cameraToggle, false);
  entrada.dispose();
});

test('poll detecta ausencia, connected=false e reconexao sem eventos', () => {
  for (const removido of [null, false]) {
    const entrada = ambiente();
    const controle = entrada.conectar();
    botao(controle, 7, 1);
    assert.equal(entrada.poll().throttle, 1);
    entrada.tecla('KeyW');
    if (removido === null) entrada.estado.controles = [null];
    else controle.connected = false;
    const saida = entrada.poll();
    conferirNeutro(saida);
    assert.equal(saida.connected, false);
    controle.connected = true;
    entrada.estado.controles = [controle];
    conferirNeutro(entrada.poll());
    conferirNeutro(entrada.poll());
    botao(controle, 7, 0);
    entrada.poll();
    botao(controle, 7, 0.7);
    assert.equal(entrada.poll().throttle, 0.7);
    entrada.dispose();
  }
});

test('conexao inicial com entradas mantidas exige retorno ao neutro', () => {
  const entrada = ambiente();
  const controle = controlePadrao();
  controle.axes[0] = 1;
  botao(controle, 9, 1);
  entrada.conectar(controle);
  conferirNeutro(entrada.poll());
  controle.axes[0] = 0;
  botao(controle, 9, 0);
  conferirNeutro(entrada.poll());
  controle.axes[0] = -1;
  assert.equal(entrada.poll().steer, -1);
  entrada.dispose();
});

test('inicializacao sem foco nao aceita comandos antes de foco e retorno ao neutro', () => {
  const entrada = ambiente({ focoInicial: false });
  const controle = entrada.conectar();
  botao(controle, 7, 1);
  entrada.tecla('KeyW');
  conferirNeutro(entrada.poll());
  entrada.emitir('focus');
  conferirNeutro(entrada.poll());
  botao(controle, 7, 0);
  conferirNeutro(entrada.poll());
  botao(controle, 7, 0.2);
  assert.equal(entrada.poll().throttle, 0.2);
  entrada.dispose();
});

test('evento de reconexao no mesmo slot neutraliza mesmo sem evento previo de desconexao', () => {
  const entrada = ambiente();
  const controle = entrada.conectar();
  botao(controle, 7, 0.9);
  assert.equal(entrada.poll().throttle, 0.9);
  entrada.tecla('KeyR');
  entrada.emitir('gamepadconnected', { gamepad: controle });
  conferirNeutro(entrada.poll());
  conferirNeutro(entrada.poll());
  botao(controle, 7, 0);
  conferirNeutro(entrada.poll());
  botao(controle, 7, 0.4);
  assert.equal(entrada.poll().throttle, 0.4);
  entrada.dispose();
});

test('snapshot novo da mesma conexao nao reinicia entradas; slot reaparece por polling', () => {
  const entrada = ambiente();
  const controle = entrada.conectar();
  botao(controle, 7, 0.8);
  botao(controle, 3, 1);
  assert.equal(entrada.poll().cameraToggle, true);
  entrada.estado.controles[0] = { ...controle };
  assert.equal(entrada.poll().throttle, 0.8);
  assert.equal(entrada.poll().cameraToggle, false);
  entrada.emitir('gamepaddisconnected', { gamepad: controle });
  conferirNeutro(entrada.poll());
  entrada.estado.controles = [];
  conferirNeutro(entrada.poll());
  entrada.estado.controles = [controle];
  conferirNeutro(entrada.poll());
  botao(controle, 7, 0);
  botao(controle, 3, 0);
  entrada.poll();
  botao(controle, 7, 0.8);
  assert.equal(entrada.poll().throttle, 0.8);
  entrada.dispose();
});

test('controle ativo permanece estavel; desconectar outro dispositivo nao zera comandos', () => {
  const entrada = ambiente();
  const primeiro = entrada.conectar(controlePadrao({ index: 1, id: 'Primeiro' }));
  const segundo = controlePadrao({ index: 0, id: 'Segundo' });
  entrada.estado.controles[0] = segundo;
  entrada.emitir('gamepadconnected', { gamepad: segundo });
  botao(primeiro, 7, 0.4);
  assert.equal(entrada.poll().gamepadId, 'Primeiro');
  entrada.emitir('gamepaddisconnected', { gamepad: segundo });
  assert.equal(entrada.poll().throttle, 0.4);
  entrada.estado.controles[1] = controlePadrao({ index: 1, id: 'Substituto' });
  conferirNeutro(entrada.poll());
  assert.equal(entrada.poll().gamepadId, 'Substituto');
  entrada.dispose();
});

test('dispositivo nao standard nao presume indices; raw e mapping continuam disponiveis', () => {
  const entrada = ambiente();
  const controle = entrada.conectar(controlePadrao({ mapping: '' }));
  controle.axes[0] = -0.7;
  botao(controle, 7, 0.8);
  botao(controle, 3, 1);
  const saida = entrada.poll();
  conferirNeutro(saida);
  assert.equal(saida.connected, true);
  assert.equal(saida.gamepadId, controle.id);
  assert.equal(saida.mapping, '');
  assert.equal(saida.rawAxes[0], -0.7);
  assert.deepEqual(saida.rawButtons[7], { value: 0.8, pressed: true, touched: true });
  saida.rawAxes[0] = 100;
  saida.rawButtons[7].value = 100;
  assert.equal(controle.axes[0], -0.7);
  assert.equal(controle.buttons[7].value, 0.8);
  entrada.dispose();
});

test('customMapping suporta indices, inversao explicita e acoes sem assumir outros botoes', () => {
  const customMapping = {
    steerAxis: 2, invertSteer: true,
    throttleButton: 4, brakeButton: 5,
    leftButton: 10, rightButton: 11,
    cameraButton: 8, pauseButton: 12, resetButton: 13, diagnosticsButton: 16,
  };
  const entrada = ambiente({ customMapping });
  const controle = entrada.conectar(controlePadrao({ mapping: '' }));
  customMapping.steerAxis = 0;
  controle.axes[2] = 0.55;
  botao(controle, 4, 0.25);
  botao(controle, 5, 0.4);
  botao(controle, 7, 1);
  botao(controle, 0, 1);
  let saida = entrada.poll();
  aproximar(saida.steer, -0.5);
  assert.equal(saida.throttle, 0.25);
  assert.equal(saida.brake, 0.4);
  botao(controle, 10, 1);
  assert.equal(entrada.poll().steer, -1);
  botao(controle, 10, 0);
  botao(controle, 11, 1);
  assert.equal(entrada.poll().steer, 1);
  for (const indice of [8, 12, 13, 16]) botao(controle, indice, 1);
  saida = entrada.poll();
  for (const acao of ['cameraToggle', 'pauseToggle', 'reset', 'diagnosticsToggle']) {
    assert.equal(saida[acao], true);
    assert.equal(entrada.poll()[acao], false);
  }
  entrada.dispose();
});

test('customMapping parcial standard preserva defaults e null desativa entrada', () => {
  const entrada = ambiente({ customMapping: { throttleButton: 4, cameraButton: null } });
  const controle = entrada.conectar();
  botao(controle, 7, 1);
  botao(controle, 4, 0.6);
  botao(controle, 3, 1);
  botao(controle, 9, 1);
  const saida = entrada.poll();
  assert.equal(saida.throttle, 0.6);
  assert.equal(saida.cameraToggle, false);
  assert.equal(saida.pauseToggle, true);
  entrada.dispose();
});

test('API bloqueada neutraliza gamepad e permite teclado apos a transicao', () => {
  const entrada = ambiente();
  const controle = entrada.conectar();
  botao(controle, 7, 1);
  assert.equal(entrada.poll().throttle, 1);
  entrada.navigatorRef.getGamepads = () => { throw new Error('API indisponivel'); };
  const saida = entrada.poll();
  conferirNeutro(saida);
  assert.equal(saida.connected, false);
  entrada.tecla('KeyW');
  assert.equal(entrada.poll().throttle, 1);
  entrada.dispose();
});

test('valores invalidos nao escapam das faixas normalizadas; dispositivos incompletos sao neutros', () => {
  const entrada = ambiente();
  const controle = entrada.conectar();
  for (const [eixo, esperado] of [[-2, -1], [2, 1], [NaN, 0], [Infinity, 0], [undefined, 0]]) {
    controle.axes[0] = eixo;
    assert.equal(entrada.poll().steer, esperado);
  }
  for (const [valor, esperado] of [[-1, 0], [2, 1], [NaN, 0], [Infinity, 0]]) {
    botao(controle, 7, valor);
    botao(controle, 6, valor);
    assert.equal(entrada.poll().throttle, esperado);
    assert.equal(entrada.poll().brake, esperado);
  }
  controle.axes = [];
  controle.buttons = [];
  conferirNeutro(entrada.poll());
  controle.buttons[7] = { pressed: true };
  assert.equal(entrada.poll().throttle, 1);
  controle.buttons[7] = 0.2;
  assert.equal(entrada.poll().throttle, 0.2);
  entrada.dispose();
});

test('configuracao invalida falha antes de registrar ouvintes', () => {
  const windowRef = {
    addEventListener() { assert.fail('Nao deve registrar antes de validar'); },
    removeEventListener() {},
  };
  for (const deadzone of [-0.1, 1, NaN, Infinity, '0.1', null]) {
    assert.throws(() => createInputController({ windowRef, deadzone }), RangeError);
  }
  for (const customMapping of [
    [], 1, 'standard', { steerAxis: -1 }, { throttleButton: 1.5 },
    { brakeButton: NaN }, { cameraButton: '3' }, { invertSteer: 1 }, { desconhecido: 0 },
  ]) {
    assert.throws(() => createInputController({ windowRef, customMapping }), TypeError);
  }
  assert.throws(() => createInputController({ windowRef: {} }), TypeError);
});

test('dispose remove todos os ouvintes, pode repetir e nao consulta API novamente', () => {
  const entrada = ambiente();
  entrada.conectar();
  entrada.tecla('KeyW');
  entrada.tecla('KeyC');
  entrada.dispose();
  entrada.dispose();
  for (const funcoes of entrada.ouvintes.values()) assert.equal(funcoes.size, 0);
  entrada.navigatorRef.getGamepads = () => { assert.fail('API chamada apos dispose'); };
  entrada.tecla('KeyW');
  entrada.emitir('gamepadconnected', { gamepad: controlePadrao() });
  const saida = entrada.poll();
  conferirNeutro(saida);
  assert.equal(saida.connected, false);
  assert.deepEqual(saida.rawAxes, []);
  assert.deepEqual(saida.rawButtons, []);
});
