const MAPEAMENTO_PADRAO = Object.freeze({
  steerAxis: 0,
  invertSteer: false,
  throttleButton: 7,
  brakeButton: 6,
  throttleAltButton: 0,
  brakeAltButton: 1,
  leftButton: 14,
  rightButton: 15,
  cameraButton: 3,
  pauseButton: 9,
  resetButton: null,
  diagnosticsButton: null,
});

const TECLAS = Object.freeze({
  KeyW: 'throttle', ArrowUp: 'throttle',
  KeyS: 'brake', ArrowDown: 'brake',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  KeyC: 'cameraToggle', KeyR: 'reset',
  Escape: 'pauseToggle', F2: 'diagnosticsToggle',
});

const ACOES = Object.freeze({
  cameraToggle: 'cameraButton',
  pauseToggle: 'pauseButton',
  reset: 'resetButton',
  diagnosticsToggle: 'diagnosticsButton',
});

const limitar = (valor, minimo, maximo) => Number.isFinite(valor)
  ? Math.max(minimo, Math.min(maximo, valor)) : 0;
const identificar = (controle) => `${controle.index}:${controle.id}`;
const entradaNeutra = () => ({
  steer: 0, throttle: 0, brake: 0,
  cameraToggle: false, pauseToggle: false, reset: false, diagnosticsToggle: false,
  connected: false, gamepadId: '', mapping: '', rawAxes: [], rawButtons: [],
});

/**
 * customMapping aceita as chaves de MAPEAMENTO_PADRAO; indices null desativam entradas.
 * Em controles nao standard, somente os indices configurados sao utilizados.
 * mapping preserva Gamepad.mapping; rawButtons sao copias { value, pressed, touched }.
 * Direcao: teclado > D-pad > analogico; pedais combinam os dispositivos pelo maior valor.
 */
export function createInputController({
  windowRef = globalThis.window,
  navigatorRef = globalThis.navigator,
  deadzone = 0.10,
  customMapping = null,
} = {}) {
  if (!Number.isFinite(deadzone) || deadzone < 0 || deadzone >= 1) {
    throw new RangeError('deadzone deve estar entre 0 (inclusive) e 1 (exclusive).');
  }
  if (windowRef != null && (typeof windowRef.addEventListener !== 'function'
    || typeof windowRef.removeEventListener !== 'function')) {
    throw new TypeError('windowRef deve permitir registrar e remover eventos.');
  }
  if (customMapping !== null && (typeof customMapping !== 'object' || Array.isArray(customMapping))) {
    throw new TypeError('customMapping deve ser um objeto ou null.');
  }
  for (const [chave, valor] of Object.entries(customMapping ?? {})) {
    if (!Object.hasOwn(MAPEAMENTO_PADRAO, chave)
      || (chave === 'invertSteer' ? typeof valor !== 'boolean'
        : valor !== null && (!Number.isInteger(valor) || valor < 0))) {
      throw new TypeError(`Mapeamento invalido: ${chave}.`);
    }
  }

  const configurado = { ...customMapping };
  const padrao = { ...MAPEAMENTO_PADRAO, ...configurado };
  const teclas = new Set();
  const pendentes = new Set();
  const acoesAnteriores = new Set();
  const desconectados = new Set();
  let controleAtivo = null;
  let controlePronto = false;
  let focado = windowRef?.document?.hasFocus?.() ?? true;
  let encerrado = false;
  let neutralizarCiclo = false;

  function limpar() {
    teclas.clear();
    pendentes.clear();
    acoesAnteriores.clear();
    controlePronto = false;
  }

  function codigo(evento) {
    return evento.code || (/^[wasdcr]$/i.test(evento.key ?? '')
      ? `Key${evento.key.toUpperCase()}` : evento.key);
  }

  function pressionar(evento) {
    const tecla = codigo(evento);
    if (!focado || !Object.hasOwn(TECLAS, tecla) || evento.isComposing
      || evento.ctrlKey || evento.metaKey || evento.altKey
      || evento.target?.isContentEditable
      || /^(INPUT|TEXTAREA|SELECT)$/.test(evento.target?.tagName ?? '')) return;
    evento.preventDefault?.();
    if (evento.repeat || teclas.has(tecla)) return;
    teclas.add(tecla);
    if (Object.hasOwn(ACOES, TECLAS[tecla])) pendentes.add(TECLAS[tecla]);
  }

  function soltar(evento) {
    teclas.delete(codigo(evento));
  }

  function desfocar() {
    focado = false;
    limpar();
  }

  function focar() {
    focado = true;
  }

  function conectar(evento) {
    if (!evento.gamepad) return;
    const id = identificar(evento.gamepad);
    desconectados.delete(id);
    if (id === controleAtivo) {
      neutralizarCiclo = true;
      limpar();
    }
  }

  function desconectar(evento) {
    if (!evento.gamepad) return;
    const id = identificar(evento.gamepad);
    desconectados.add(id);
    if (id === controleAtivo) {
      controleAtivo = null;
      neutralizarCiclo = true;
      limpar();
    }
  }

  const eventos = {
    keydown: pressionar, keyup: soltar, blur: desfocar, focus: focar,
    gamepadconnected: conectar, gamepaddisconnected: desconectar,
  };
  for (const [tipo, funcao] of Object.entries(eventos)) windowRef?.addEventListener(tipo, funcao);

  function poll() {
    const saida = entradaNeutra();
    if (encerrado) return saida;
    let controles;
    try {
      controles = Array.from(navigatorRef?.getGamepads?.() ?? [])
        .filter((controle) => controle && controle.connected !== false);
    } catch {
      controles = [];
    }
    for (const id of desconectados) {
      if (!controles.some((controle) => identificar(controle) === id)) desconectados.delete(id);
    }
    controles = controles.filter((controle) => !desconectados.has(identificar(controle)));
    const controle = controles.find((item) => identificar(item) === controleAtivo) ?? controles[0];
    const id = controle ? identificar(controle) : null;
    if (id !== controleAtivo) {
      limpar();
      controleAtivo = id;
      neutralizarCiclo = true;
    }
    if (controle) {
      saida.connected = true;
      saida.gamepadId = controle.id ?? '';
      saida.mapping = controle.mapping ?? '';
      saida.rawAxes = Array.from(controle.axes ?? []);
      saida.rawButtons = Array.from(controle.buttons ?? [], (botao) => ({
        value: typeof botao === 'number' ? botao : botao?.value ?? (botao?.pressed ? 1 : 0),
        pressed: typeof botao === 'number' ? botao > 0.5 : Boolean(botao?.pressed),
        touched: Boolean(botao?.touched),
      }));
    }

    const mapa = saida.mapping === 'standard' ? padrao : configurado;
    const valorBotao = (chave) => limitar(saida.rawButtons[mapa[chave]]?.value, 0, 1);
    const pressionado = (chave) => Boolean(saida.rawButtons[mapa[chave]]?.pressed)
      || valorBotao(chave) > 0.5;
    const eixo = limitar(saida.rawAxes[mapa.steerAxis], -1, 1);
    const analogico = Math.abs(eixo) <= deadzone ? 0
      : Math.sign(eixo) * (Math.abs(eixo) - deadzone) / (1 - deadzone) * (mapa.invertSteer ? -1 : 1);
    const esquerda = pressionado('leftButton');
    const direita = pressionado('rightButton');
    const direcao = esquerda || direita ? Number(direita) - Number(esquerda) : analogico;
    const acelerador = Math.max(valorBotao('throttleButton'), valorBotao('throttleAltButton'));
    const freio = Math.max(valorBotao('brakeButton'), valorBotao('brakeAltButton'));
    const acoes = Object.keys(ACOES).filter((acao) => pressionado(ACOES[acao]));

    // Reconexao/foco exigem soltar os comandos; um gatilho mantido nao pode retomar a aceleracao.
    if (!focado) return saida;
    if (!controlePronto && !analogico && !esquerda && !direita && !acelerador && !freio && !acoes.length) {
      controlePronto = true;
    }
    if (neutralizarCiclo) {
      neutralizarCiclo = false;
      return saida;
    }
    if (controlePronto) {
      saida.steer = direcao;
      saida.throttle = acelerador;
      saida.brake = freio;
      for (const acao of Object.keys(ACOES)) {
        const atual = acoes.includes(acao);
        if (atual && !acoesAnteriores.has(acao)) pendentes.add(acao);
        if (atual) acoesAnteriores.add(acao);
        else acoesAnteriores.delete(acao);
      }
    }
    const ativo = (acao) => [...teclas].some((tecla) => TECLAS[tecla] === acao);
    if (ativo('left') || ativo('right')) saida.steer = Number(ativo('right')) - Number(ativo('left'));
    saida.throttle = Math.max(saida.throttle, Number(ativo('throttle')));
    saida.brake = Math.max(saida.brake, Number(ativo('brake')));
    for (const acao of pendentes) saida[acao] = true;
    pendentes.clear();
    return saida;
  }

  function dispose() {
    if (encerrado) return;
    encerrado = true;
    limpar();
    desconectados.clear();
    for (const [tipo, funcao] of Object.entries(eventos)) windowRef?.removeEventListener(tipo, funcao);
  }

  return { poll, dispose };
}
