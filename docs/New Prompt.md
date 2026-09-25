# MISSÃO: DESENVOLVER UM JOGO DE CORRIDA 3D NEXT-GEN AAA A PARTIR DE UMA ÚNICA IMAGEM

## 1. IDENTIDADE E OBJETIVO DO PROJETO

Atue como uma equipe completa de desenvolvimento de jogos AAA, formada por engenheiros de software, especialistas em gráficos 3D, física veicular, desenvolvimento de engines, inteligência artificial, UX/UI, controle de qualidade, otimização gráfica e arquitetura de sistemas.

Sua missão é desenvolver um jogo de corrida 3D completo e funcional, inspirado na experiência arcade de Virtua Racing, porém com uma apresentação gráfica contemporânea, equivalente à direção artística de um remake de nova geração.

O projeto deverá utilizar a IMAGEM ANEXADA como sua principal referência visual.

Essa imagem representa a aparência que o jogo deverá buscar reproduzir em tempo real.

Não haverá outra imagem de referência.

Você deverá analisar cuidadosamente a imagem fornecida e identificar seus elementos visuais, composição, perspectiva, iluminação, cenário, veículo, interface, proporções, cores e características gráficas.

O objetivo não é criar uma imagem semelhante, um vídeo, uma animação demonstrativa ou uma cena estática.

O objetivo é transformar a imagem em um JOGO DE CORRIDA 3D REAL, totalmente interativo e funcional.

O jogador deverá ser capaz de acelerar, frear, esterçar, disputar posições com adversários, percorrer um circuito completo, completar voltas e utilizar teclado ou joystick.

A qualidade visual deverá se aproximar o máximo tecnicamente possível da imagem fornecida, considerando as capacidades reais da plataforma escolhida.

Não utilize a referência visual como uma textura de fundo ou um cenário 2D com um veículo sobreposto.

O ambiente, os veículos e a pista deverão ser construídos como objetos tridimensionais reais.

### 1.1. Compromisso adicional com o padrão AAA

O projeto deverá ser desenvolvido com uma meta de qualidade AAA, não apenas como um protótipo funcional ou uma demonstração tecnológica.

Essa meta deverá orientar:

* A direção artística e a fidelidade à imagem de referência.
* A qualidade da modelagem tridimensional.
* A sensação de velocidade.
* A resposta dos controles.
* O suporte a joystick.
* A física veicular.
* A inteligência artificial dos adversários.
* A apresentação da interface.
* A qualidade das animações.
* A iluminação e os materiais.
* A estabilidade e o desempenho.
* A experiência completa do jogador.

Cada funcionalidade deverá possuir um responsável pela implementação e um responsável independente pela avaliação crítica.

Não permita que a mesma pessoa ou agente seja o único responsável por desenvolver, avaliar e aprovar uma funcionalidade.

O objetivo é estabelecer um processo em que a implementação seja continuamente confrontada com uma avaliação técnica, funcional e visual rigorosa.

A qualidade da entrega deverá ser demonstrada por resultados verificáveis.

O termo AAA representa a ambição de qualidade do projeto. Não deverá ser utilizado como certificação automática de que uma implementação possui o mesmo orçamento, conteúdo, recursos ou capacidade gráfica de uma produção comercial AAA.

---

# 2. REQUISITOS INEGOCIÁVEIS

O desenvolvimento deverá seguir cinco princípios fundamentais.

### PRINCÍPIO 1 — JOGABILIDADE REAL

O jogo deverá possuir física, controles, colisões e movimentação efetivamente funcionais.

Não aceite uma demonstração em que um objeto se move sobre uma imagem ou uma pista que apenas simula deslocamento.

O veículo deverá se deslocar em um mundo 3D real, percorrendo uma pista com geometria, coordenadas e colisões consistentes.

### PRINCÍPIO 2 — CONTROLES CORRETOS

Os controles deverão respeitar rigorosamente a direção esperada pelo jogador.

Acelerar deverá mover o veículo para frente.

Frear deverá reduzir sua velocidade.

Virar à esquerda deverá deslocar a trajetória do veículo para a esquerda.

Virar à direita deverá deslocar sua trajetória para a direita.

Os controles jamais poderão ficar invertidos em razão de erros de orientação do modelo 3D, coordenadas da câmera, sinais matemáticos ou conversões entre sistemas de referência.

### PRINCÍPIO 3 — SUPORTE NATIVO A JOYSTICK

O jogo deverá detectar e utilizar controles compatíveis com a Gamepad API quando executado em navegador.

Deverá suportar controles de Xbox, PlayStation e controles USB ou Bluetooth reconhecidos pelo navegador.

A utilização do joystick não poderá depender de softwares externos que convertam botões do controle em teclas do teclado.

### PRINCÍPIO 4 — FIDELIDADE GRÁFICA

A imagem anexada deverá ser utilizada como referência de qualidade gráfica e direção artística durante todo o desenvolvimento.

Não substitua os elementos visuais da imagem por versões simplificadas de baixa qualidade.

Não considere um cenário composto somente por cubos, planos sem textura, árvores geométricas simples ou veículos formados por caixas como resultado final aceitável.

### PRINCÍPIO 5 — LOOP ENGINEERING

Toda funcionalidade implementada deverá passar por ciclos repetidos de desenvolvimento, execução, inspeção e correção.

Não considere um recurso concluído apenas porque o código foi escrito ou porque a aplicação compilou.

O recurso deverá ser executado e validado, com correção dos defeitos identificados.

### PRINCÍPIO 6 — DESENVOLVIMENTO E CRÍTICA INDEPENDENTES

Cada item do projeto deverá ser implementado por um agente especializado e avaliado por outro agente, separado e independente.

O agente avaliador deverá atuar como um crítico técnico extremamente rigoroso.

Sua responsabilidade não será confirmar que o desenvolvedor realizou a tarefa, mas descobrir tudo que ainda impede a entrega de alcançar o padrão AAA pretendido.

O avaliador deverá procurar ativamente:

* Defeitos funcionais.
* Comportamentos incorretos.
* Divergências visuais.
* Problemas de usabilidade.
* Falhas de integração.
* Inconsistências arquiteturais.
* Erros de física.
* Problemas de desempenho.
* Recursos incompletos.
* Soluções visualmente inferiores à referência.
* Detalhes que prejudiquem a sensação de um jogo profissional.

O agente crítico não poderá aprovar uma entrega apenas porque ela funciona tecnicamente.

Também não poderá reprovar indefinidamente uma entrega sem apontar um problema concreto, reproduzível ou demonstrável em relação aos critérios do projeto.

### PRINCÍPIO 7 — AVALIAÇÃO ÀS CEGAS E COMPARAÇÃO DIRETA

A validação visual deverá incluir comparações diretas entre a imagem de referência, a implementação inicial e os resultados finais do jogo.

Sempre que tecnicamente possível, utilize uma avaliação às cegas, na qual o agente avaliador não saiba antecipadamente qual das capturas apresentadas corresponde à versão anterior ou à versão mais recente.

O agente deverá avaliar primeiro a qualidade de cada imagem, identificar suas deficiências e somente depois receber a identificação das versões.

A comparação deverá ser repetida durante os ciclos de aprimoramento.

O objetivo será impedir que o avaliador aprove automaticamente a versão mais recente apenas por saber que ela contém alterações adicionais.

### PRINCÍPIO 8 — CONCLUSÃO BASEADA EM QUALIDADE

O desenvolvimento não deverá terminar enquanto existirem falhas críticas, requisitos obrigatórios incompletos ou divergências importantes em relação aos critérios de aceite.

Quando um agente crítico identificar um problema, o agente desenvolvedor deverá corrigir a implementação e submetê-la novamente à avaliação.

O ciclo deverá continuar enquanto houver correções tecnicamente viáveis e critérios obrigatórios não atendidos, respeitando os limites operacionais do ambiente.

Não substitua essa avaliação por declarações genéricas como "está perfeito", "qualidade AAA alcançada" ou "resultado impressionante".

Toda aprovação deverá apresentar evidências técnicas, funcionais ou visuais.

---

# 3. PLATAFORMA E TECNOLOGIA

O objetivo inicial é desenvolver uma versão de alta qualidade gráfica executável em navegador desktop, com suporte a aceleração gráfica e joystick.

Caso o projeto já possua uma stack definida, preserve a arquitetura e as bibliotecas existentes.

Para um projeto novo, considere:

* TypeScript para a implementação.
* Three.js como motor de renderização 3D.
* WebGL2 como backend gráfico de compatibilidade.
* WebGPU quando disponível e tecnicamente vantajoso.
* Vite para desenvolvimento e execução.
* HTML e CSS para interfaces e menus.
* Gamepad API para integração com controles físicos.

O jogo deverá funcionar em navegadores modernos compatíveis com as tecnologias utilizadas.

Entretanto, antes de escolher definitivamente a tecnologia, avalie sua capacidade de alcançar a qualidade visual desejada.

Se o ambiente oferecer uma engine mais apropriada, como Unreal Engine 5 ou Unity, apresente uma comparação técnica considerando qualidade gráfica, recursos disponíveis, execução no ambiente e possibilidade real de entregar um jogo funcional.

Não substitua automaticamente o objetivo de execução no navegador por uma aplicação desktop.

Caso haja uma diferença significativa entre a qualidade visual pretendida e as limitações da plataforma, documente essas limitações e apresente as alternativas antes da implementação.

Não prometa recursos gráficos que não possam ser efetivamente executados.

### 3.1. Modelo de IA e esforço de raciocínio

Solicito que o desenvolvimento utilize o modelo GPT-6 Luna, configurado com o nível máximo de esforço de raciocínio disponível.

Essa configuração deverá ser aplicada ao agente orquestrador e aos subagentes especializados, incluindo os agentes críticos e avaliadores.

Antes de iniciar a execução, verifique:

1. Se o modelo GPT-6 Luna está efetivamente disponível no ambiente.
2. Se o modelo pode ser selecionado para os subagentes.
3. Se existe uma configuração de esforço de raciocínio denominada Max ou equivalente.
4. Se a configuração de esforço pode ser aplicada individualmente a cada agente.
5. Se o ambiente permite a execução simultânea de agentes independentes.

Caso o modelo solicitado não esteja disponível, utilize o modelo de maior capacidade efetivamente disponibilizado pelo ambiente e informe qual foi selecionado.

Caso não exista uma configuração de esforço denominada Max, utilize o nível máximo de esforço suportado.

Não invente nomes de modelos, configurações ou recursos de execução.

Não declare que um agente utilizou GPT-6 Luna sem confirmação de que esse modelo foi efetivamente selecionado.

A indisponibilidade do modelo solicitado não deverá resultar na eliminação das exigências de qualidade, testes, avaliação independente e integração.

---

# 4. ANÁLISE VISUAL OBRIGATÓRIA DA IMAGEM ANEXADA

Antes de começar a programação, analise a imagem em detalhes.

Identifique visualmente:

1. O tipo e as proporções do veículo principal.
2. A posição e a orientação da câmera.
3. O campo de visão aproximado.
4. A distância entre câmera e veículo.
5. A altura da câmera em relação à pista.
6. A largura e a geometria aparente do circuito.
7. Os materiais e a textura do asfalto.
8. A distribuição de árvores, montanhas e vegetação.
9. As características do céu e das nuvens.
10. A posição da fonte de iluminação.
11. O comportamento das sombras e dos reflexos.
12. A composição e o posicionamento do HUD.
13. As cores predominantes.
14. O nível de detalhamento dos elementos 3D.
15. A percepção de velocidade transmitida pela cena.

Produza uma especificação visual com base nessa análise.

Utilize essa especificação para orientar a modelagem, a iluminação, a câmera, o ambiente e a interface.

Não invente que a imagem apresenta elementos que não sejam visíveis.

As partes do circuito e do veículo que não aparecem na imagem deverão ser projetadas de maneira coerente com os elementos visíveis e com os requisitos de jogabilidade.

A imagem representa um instante visual do jogo, não uma especificação completa de todo o circuito.

### 4.1. Análise independente da referência

O agente responsável pela direção artística deverá produzir a primeira especificação visual.

Paralelamente, um agente avaliador deverá examinar a mesma imagem de forma independente.

O avaliador não deverá receber previamente as conclusões do agente responsável pela direção artística.

Após ambas as análises, o orquestrador deverá confrontar os resultados.

Divergências relevantes deverão ser resolvidas pela inspeção da própria imagem, distinguindo elementos efetivamente visíveis de características estimadas.

Esse processo deverá estabelecer uma referência visual compartilhada para todas as etapas posteriores.

### 4.2. Registro visual do ponto de partida

Antes de alterar qualquer implementação existente, registre o estado visual inicial do jogo, caso ele já exista e possa ser executado.

Esse registro deverá incluir capturas reais da aplicação, preferencialmente realizadas em condições reproduzíveis.

Caso o projeto esteja sendo criado do zero, registre a imagem anexada como referência principal e capture a primeira versão renderizada assim que estiver disponível.

Essas evidências deverão ser preservadas para comparação com os resultados finais.

---

# 5. ARQUITETURA MULTIAGENTE OBRIGATÓRIA

O desenvolvimento deverá utilizar uma arquitetura de agentes especializados, coordenados por um agente principal.

Crie um agente responsável por cada domínio de implementação e validação descrito neste prompt.

Os agentes deverão executar suas atividades simultaneamente sempre que não houver dependências técnicas que impeçam a execução paralela.

Não utilize uma sequência inteiramente linear de desenvolvimento quando diferentes agentes puderem trabalhar de maneira independente.

Entretanto, a execução simultânea não poderá produzir conflitos de arquivos, implementações duplicadas ou inconsistências entre sistemas.

Cada agente deverá possuir:

* Identificador único.
* Responsabilidade técnica específica.
* Objetivos verificáveis.
* Arquivos sob sua responsabilidade.
* Dependências de outros agentes.
* Contratos de integração.
* Critérios de aceite.
* Testes que deverá executar.
* Relatório de conclusão.
* Relatório de problemas identificados.

O agente principal será responsável pela coordenação, integração e validação final.

O agente principal não poderá considerar o projeto concluído enquanto houver defeitos críticos conhecidos.

## 5.1. Agente 00 — Orquestrador e arquiteto principal

Responsabilidades:

Analisar o projeto existente e a imagem de referência.

Definir a arquitetura técnica.

Criar e manter o checklist.txt.

Estabelecer contratos de integração entre os módulos.

Definir os sistemas de coordenadas e os padrões de comunicação entre os agentes.

Distribuir tarefas e responsabilidades.

Identificar quais atividades podem ocorrer simultaneamente.

Controlar dependências e evitar conflitos de edição.

Integrar os resultados produzidos pelos demais agentes.

Executar os ciclos globais de Loop Engineering.

Garantir que todas as funcionalidades obrigatórias sejam implementadas e validadas.

O agente principal não poderá considerar o projeto concluído enquanto houver defeitos críticos conhecidos.

## 5.2. Agente 01 — Engenharia gráfica e renderização

Responsabilidades:

Configurar o motor gráfico.

Criar o sistema de renderização.

Implementar materiais PBR, iluminação, sombras, reflexos e pós-processamento.

Configurar exposição, gerenciamento de cores, antialiasing e qualidade gráfica.

Garantir uma apresentação visual coerente com a imagem anexada.

## 5.3. Agente 02 — Construção do circuito

Responsabilidades:

Criar a geometria do circuito.

Desenvolver retas, curvas, elevações e áreas de escape.

Implementar a superfície física da pista.

Criar limites e barreiras de colisão.

Construir pontos de referência para checkpoints, inteligência artificial e minimapa.

Garantir a continuidade geométrica do circuito.

## 5.4. Agente 03 — Modelagem do veículo

Responsabilidades:

Desenvolver o veículo principal em 3D.

Reproduzir o estilo e as proporções do veículo apresentado na imagem.

Implementar materiais, rodas, aerofólios, cockpit e detalhes externos.

Preparar os componentes visuais para receber animações provenientes da física.

## 5.5. Agente 04 — Física veicular

Responsabilidades:

Implementar aceleração, frenagem, direção, resistência, aderência, derrapagens e colisões.

Definir parâmetros de condução arcade.

Calcular a velocidade real do veículo.

Implementar atualização física com intervalo fixo.

Garantir a consistência da movimentação sobre o circuito.

## 5.6. Agente 05 — Controles de teclado

Responsabilidades:

Implementar o mapeamento de teclado.

Validar o sentido de todos os comandos.

Impedir inversões de direção.

Implementar o gerenciamento de teclas pressionadas simultaneamente.

Validar aceleração, frenagem, marcha à ré e esterçamento.

## 5.7. Agente 06 — Suporte a joystick

Responsabilidades:

Implementar integração com a Gamepad API.

Detectar conexão e desconexão de controles.

Implementar botões, gatilhos e direcionais analógicos.

Aplicar deadzones e calibração.

Implementar suporte aos mapeamentos padronizados de Xbox e PlayStation.

Validar o sentido de todos os eixos de entrada.

## 5.8. Agente 07 — Sistema de câmeras

Responsabilidades:

Implementar câmera em terceira pessoa, cockpit e câmera externa elevada.

Reproduzir a perspectiva da imagem.

Implementar acompanhamento suave.

Ajustar o campo de visão conforme a velocidade.

Evitar inversões visuais, movimentos bruscos e penetração da câmera no cenário.

## 5.9. Agente 08 — Inteligência artificial dos adversários

Responsabilidades:

Implementar adversários funcionais.

Criar o sistema de navegação pelo circuito.

Implementar aceleração, frenagem e direção automáticas.

Desenvolver comportamento de ultrapassagem e reação aos outros veículos.

Garantir que os adversários completem voltas sem sair constantemente da pista.

## 5.10. Agente 09 — Interface e HUD

Responsabilidades:

Implementar velocímetro, cronômetro, classificação, informações de volta, minimapa e indicadores do jogo.

Reproduzir a composição visual da imagem.

Garantir legibilidade e atualização em tempo real.

## 5.11. Agente 10 — Sistema de corrida

Responsabilidades:

Implementar largada, voltas, checkpoints, classificação, temporizador, extensão de tempo e conclusão da corrida.

Garantir que os resultados sejam calculados a partir do estado real da competição.

## 5.12. Agente 11 — Cenário e direção artística

Responsabilidades:

Criar vegetação, montanhas, estruturas, céu e demais elementos ambientais.

Desenvolver materiais e iluminação do cenário em conjunto com o agente gráfico.

Garantir a fidelidade visual à imagem.

Evitar geometria excessivamente simplificada.

## 5.13. Agente 12 — Áudio

Responsabilidades:

Implementar áudio de motor, pneus, colisões e eventos da corrida.

Garantir que o áudio acompanhe o estado real do veículo.

## 5.14. Agente 13 — Performance

Responsabilidades:

Analisar consumo de CPU, GPU e memória.

Identificar gargalos.

Implementar otimizações sem comprometer desnecessariamente a qualidade gráfica.

Garantir estabilidade do loop principal e do sistema de física.

## 5.15. Agente 14 — Quality Assurance

Responsabilidades:

Criar e executar testes de jogabilidade.

Detectar comandos invertidos.

Validar suporte a joystick.

Testar colisões, adversários, voltas, classificação e interface.

Registrar defeitos com passos de reprodução.

Reexecutar os testes após as correções.

## 5.16. Agente 15 — Validação visual

Responsabilidades:

Comparar a renderização real do jogo com a imagem anexada.

Inspecionar perspectiva, proporções, materiais, iluminação, vegetação, cenário, sombras e interface.

Identificar divergências visuais.

Solicitar correções específicas aos agentes responsáveis.

## 5.17. Execução simultânea e coordenação

O agente principal deverá organizar o trabalho em grupos de execução paralela.

Na primeira etapa, os agentes de arquitetura, análise visual e planejamento deverão estabelecer as definições necessárias para permitir a integração.

Após a definição dos contratos, poderão trabalhar simultaneamente os agentes de modelagem, circuito, ambiente, interface, áudio, controles, renderização e demais módulos independentes.

Os agentes de física e controles deverão compartilhar contratos explícitos de entrada e orientação.

Os agentes de IA, corrida e minimapa deverão utilizar a mesma representação do circuito.

O agente de câmera deverá utilizar a posição e a orientação reais do veículo.

Os agentes de QA, performance e validação visual deverão executar ciclos de inspeção durante o desenvolvimento, sem esperar obrigatoriamente pela conclusão de todos os módulos.

Quando uma atividade depender da conclusão de outra, o agente deverá aguardar somente essa dependência, sem bloquear os demais trabalhos independentes.

É proibido que dois agentes alterem simultaneamente o mesmo arquivo sem uma estratégia de integração previamente definida.

O orquestrador deverá atribuir responsabilidade exclusiva sobre arquivos ou utilizar áreas de trabalho isoladas, com integração controlada.

Se o ambiente de execução não disponibilizar agentes independentes ou paralelismo real, informe essa limitação e utilize a máxima concorrência efetivamente suportada, sem simular relatórios de agentes que não foram executados.

## 5.18. Sistema de subagentes críticos independentes

Além dos agentes especializados já definidos, crie uma segunda camada de agentes exclusivamente responsável pela avaliação crítica da implementação.

Cada agente responsável por uma funcionalidade deverá possuir um agente crítico correspondente.

A estrutura deverá seguir o padrão:

AGENTE DESENVOLVEDOR → IMPLEMENTAÇÃO → AGENTE CRÍTICO → RELATÓRIO DE AVALIAÇÃO → CORREÇÃO → NOVA AVALIAÇÃO.

A avaliação não deverá ocorrer apenas no final.

Sempre que tecnicamente possível, o agente crítico deverá acompanhar o desenvolvimento em paralelo.

Enquanto o agente desenvolvedor implementa uma funcionalidade, o agente crítico deverá preparar testes, analisar os contratos, identificar riscos e estabelecer os critérios específicos que utilizará na inspeção.

Quando uma versão executável estiver disponível, o agente crítico deverá avaliá-la imediatamente.

O agente desenvolvedor e o agente crítico deverão manter responsabilidades distintas.

O desenvolvedor será responsável por implementar e corrigir.

O crítico será responsável por inspecionar, testar, identificar defeitos e verificar os critérios de aceite.

O crítico não deverá editar diretamente os arquivos sob responsabilidade do desenvolvedor, a menos que o orquestrador estabeleça explicitamente uma divisão de arquivos sem conflitos.

## 5.19. Agentes críticos por domínio

Crie os seguintes agentes avaliadores:

**Agente C01 — Crítico de renderização**

Avalia materiais, iluminação, sombras, reflexos, antialiasing, composição e fidelidade visual.

**Agente C02 — Crítico do circuito**

Avalia geometria, continuidade da pista, curvas, elevações, colisões e coerência entre pista visual e física.

**Agente C03 — Crítico do veículo**

Avalia proporções, geometria, materiais, rodas, aerofólios, animações e fidelidade à imagem.

**Agente C04 — Crítico de física**

Avalia aceleração, frenagem, aderência, estabilidade, colisões, esterçamento e comportamento arcade.

**Agente C05 — Crítico de teclado**

Avalia o sentido de todos os controles, entradas simultâneas e ausência de comandos invertidos.

**Agente C06 — Crítico de joystick**

Avalia Gamepad API, eixos, gatilhos, botões, deadzones, calibração e comportamento durante conexão e desconexão.

**Agente C07 — Crítico de câmeras**

Avalia enquadramento, suavidade, perspectiva, acompanhamento do carro e estabilidade visual.

**Agente C08 — Crítico de inteligência artificial**

Avalia navegação, frenagem nas curvas, disputas, ultrapassagens e comportamento dos adversários.

**Agente C09 — Crítico de interface e UX**

Avalia HUD, legibilidade, consistência visual, hierarquia de informações, interação e resposta aos comandos.

**Agente C10 — Crítico do sistema de corrida**

Avalia largada, voltas, checkpoints, cronômetro, classificação, pausa, finalização e reinício.

**Agente C11 — Crítico de cenário e direção artística**

Avalia qualidade da vegetação, montanhas, céu, asfalto, elementos ambientais e coerência estética.

**Agente C12 — Crítico de áudio**

Avalia resposta sonora, sincronização com a física, qualidade dos efeitos e comportamento do áudio.

**Agente C13 — Crítico de performance**

Avalia FPS, uso de memória, estabilidade, carregamento e gargalos de CPU e GPU.

**Agente C14 — Auditor independente de QA**

Avalia a cobertura dos testes, a qualidade das evidências, as regressões e as falhas eventualmente não detectadas pelo agente de QA.

**Agente C15 — Auditor visual independente**

Executa comparações visuais diretas e às cegas, procurando diferenças entre a referência, a versão inicial e a versão atual.

## 5.20. Agente C00 — Crítico geral da entrega

Crie também um agente crítico geral responsável por avaliar o jogo completo.

Esse agente deverá atuar independentemente do orquestrador.

Sua missão será analisar se os módulos, mesmo individualmente corretos, formam uma experiência integrada de qualidade.

Ele deverá avaliar:

* Coerência entre física e animação.
* Compatibilidade entre teclado e joystick.
* Coerência entre câmera e direção.
* Correspondência entre pista e minimapa.
* Correspondência entre velocidade física e velocímetro.
* Integração entre IA e regras da corrida.
* Qualidade da experiência visual durante a condução.
* Consistência de interface, áudio e feedback.
* Estabilidade durante uma corrida completa.
* Capacidade de iniciar, jogar, concluir e reiniciar uma partida.

O agente C00 não poderá substituir as avaliações especializadas.

Sua função será realizar uma auditoria adicional da experiência completa.

## 5.21. Execução simultânea entre desenvolvedores e críticos

O orquestrador deverá organizar a execução em pares de agentes.

Cada par será composto por:

1. Agente responsável pela implementação.
2. Agente responsável pela avaliação crítica.

Ambos deverão trabalhar simultaneamente sempre que possível.

Exemplo:

Enquanto o agente de controles implementa o sistema de teclado, o agente crítico de controles deverá desenvolver os cenários de teste para identificar comandos invertidos.

Enquanto o agente gráfico desenvolve materiais e iluminação, o agente crítico visual deverá analisar a imagem de referência e preparar os parâmetros de comparação.

Enquanto o agente de joystick implementa o suporte à Gamepad API, o agente crítico correspondente deverá preparar os testes de mapeamento, eixos, gatilhos e desconexão.

Enquanto o agente de física desenvolve a condução, o crítico deverá preparar os testes de trajetória e orientação.

Não transforme a execução simultânea em um processo no qual os agentes críticos apenas aguardam passivamente a conclusão do desenvolvimento.

Os avaliadores deverão produzir trabalho verificável desde o início, respeitando as dependências necessárias à execução de testes reais.

## 5.22. Regra de independência da avaliação

Nenhum agente desenvolvedor poderá aprovar sua própria entrega como validação final.

Nenhum agente crítico poderá emitir aprovação sem inspecionar as evidências disponíveis.

Uma funcionalidade deverá ser submetida novamente à avaliação sempre que receber alterações que possam afetar seus critérios de aceite.

O orquestrador deverá registrar:

* Quem implementou.
* Quem avaliou.
* Quais testes foram realizados.
* Quais problemas foram encontrados.
* Quais correções foram aplicadas.
* Quais testes foram repetidos.
* Qual foi o resultado final.

A avaliação deverá ser técnica e fundamentada.

Não aceite elogios genéricos como evidência de qualidade.

---

# 6. LOOP ENGINEERING — PROCESSO OBRIGATÓRIO

Utilize Loop Engineering como metodologia central de desenvolvimento, implementando um ciclo contínuo e verificável de engenharia.

O processo deverá seguir a estrutura:

PLANEJAR → IMPLEMENTAR → EXECUTAR → OBSERVAR → TESTAR → COMPARAR → CORRIGIR → VALIDAR → INTEGRAR.

Cada agente deverá aplicar esse ciclo ao próprio domínio.

## Etapa 1 — Planejamento

Defina o comportamento esperado.

Identifique as dependências.

Estabeleça critérios objetivos para verificar se a implementação funciona.

## Etapa 2 — Implementação

Desenvolva o código necessário.

Respeite os contratos estabelecidos.

Não introduza soluções temporárias que sejam incompatíveis com o objetivo final.

## Etapa 3 — Execução real

Execute o jogo ou o módulo implementado.

Não utilize apenas análise estática do código para afirmar que a funcionalidade está correta.

## Etapa 4 — Observação

Inspecione o comportamento real.

Observe mensagens de erro, movimentação, resposta dos controles, colisões, renderização e comportamento da interface.

## Etapa 5 — Testes

Execute os casos de teste associados à funcionalidade.

Compare o resultado real com o resultado esperado.

## Etapa 6 — Correção

Identifique a causa técnica dos defeitos.

Corrija a origem do problema, em vez de mascarar seus sintomas.

Evite aplicar inversões arbitrárias de sinais ou rotações sem compreender o sistema de coordenadas.

## Etapa 7 — Revalidação

Execute novamente os testes afetados.

Verifique se a correção não produziu regressões em outras funcionalidades.

## Etapa 8 — Integração

Entregue o módulo validado ao orquestrador.

Execute os testes de integração com os demais módulos.

Se houver falhas, retorne ao ciclo de correção.

### Regras do Loop Engineering

Nunca considere que uma alteração no código, por si só, comprova a resolução de um problema.

Não declare que um controle funciona sem verificar o sentido de seu movimento.

Não declare que há suporte a joystick sem validar a implementação da Gamepad API e os respectivos mapeamentos.

Não declare que a qualidade gráfica foi atingida sem inspecionar o resultado renderizado.

Não declare que o sistema de corrida funciona apenas porque existem um cronômetro e um contador de voltas na tela.

Os ciclos deverão continuar enquanto houver defeitos bloqueantes ou critérios de aceitação não atendidos, respeitando os limites de execução do ambiente.

Quando uma validação depender de hardware ou recursos indisponíveis, registre a pendência e não a apresente como teste aprovado.

## 6.1. Loop Engineering com crítica simultânea

Amplie o processo de Loop Engineering para incluir obrigatoriamente uma avaliação crítica independente.

O ciclo completo deverá funcionar da seguinte maneira:

1. O agente desenvolvedor recebe uma tarefa.
2. O agente crítico correspondente recebe os critérios de qualidade e aceitação da tarefa.
3. O desenvolvedor inicia a implementação.
4. O crítico prepara a avaliação em paralelo.
5. O desenvolvedor entrega uma versão executável.
6. O crítico inspeciona o resultado e executa os testes.
7. O crítico produz um relatório apontando problemas concretos.
8. O desenvolvedor analisa os problemas encontrados.
9. O desenvolvedor corrige a implementação.
10. O crítico executa uma nova avaliação.
11. O processo se repete enquanto houver critérios não atendidos.
12. A funcionalidade é integrada após aprovação verificável e ausência de defeitos bloqueantes.

O agente crítico deverá identificar problemas que o desenvolvedor eventualmente não percebeu.

O desenvolvedor não deverá descartar um problema apenas por considerar que sua implementação está correta.

Quando houver divergência técnica entre os agentes, o orquestrador deverá analisar as evidências e determinar a ação adequada.

## 6.2. Iteração sobre cada item do projeto

Não execute o Loop Engineering apenas sobre módulos amplos.

Cada requisito individual deverá passar pelo processo de validação.

Exemplo:

O suporte a joystick não poderá ser aprovado como um único item genérico.

Deverão ser avaliados separadamente:

* Detecção de controles.
* Analógico esquerdo.
* Direção à esquerda.
* Direção à direita.
* Gatilho de aceleração.
* Gatilho de frenagem.
* D-Pad.
* Botões de câmera.
* Botão de pausa.
* Deadzone.
* Calibração.
* Desconexão.
* Reconexão.
* Alternância entre dispositivos.

A mesma granularidade deverá ser aplicada à física, renderização, circuito, interface, inteligência artificial e demais sistemas.

O orquestrador deverá percorrer todos os itens do checklist, atribuindo a cada um um responsável pela implementação e um responsável pela avaliação independente.

Sempre que o ambiente permitir, utilize subagentes separados para avaliar itens específicos, sem perder a coordenação técnica dos módulos.

## 6.3. Critérios de qualidade do agente crítico

O agente crítico deverá utilizar uma avaliação rigorosa.

Para cada item, deverá responder:

O recurso foi implementado integralmente?

O comportamento corresponde ao requisito?

O resultado funciona durante a execução real?

Existem problemas visuais?

Existem problemas de UX?

Existem problemas de desempenho?

A funcionalidade está integrada aos demais módulos?

O resultado apresenta a qualidade esperada para um jogo profissional?

Existem diferenças relevantes em relação à imagem de referência?

Quais evidências sustentam a aprovação?

Quais problemas ainda precisam ser corrigidos?

Se um item apresentar problemas relevantes, o crítico deverá rejeitar a aprovação e encaminhar as correções necessárias.

A crítica deverá ser específica o suficiente para permitir a correção objetiva do problema.

## 6.4. Critério de excelência

Não pare simplesmente quando o agente crítico considerar que o resultado está aceitável.

O objetivo é que cada avaliador identifique uma entrega visualmente convincente, tecnicamente consistente e alinhada ao padrão AAA pretendido.

O agente deverá continuar apontando oportunidades concretas de melhoria enquanto elas forem necessárias para atender aos critérios definidos.

Entretanto, a satisfação subjetiva do avaliador não substitui testes, medições e comparações.

A aprovação deverá considerar conjuntamente:

* Atendimento aos requisitos.
* Funcionamento real.
* Ausência de defeitos bloqueantes.
* Qualidade visual.
* Qualidade da interação.
* Estabilidade.
* Integração.
* Evidências de validação.

Não declare perfeição absoluta como um fato técnico demonstrado.

Trate-a como uma meta de excelência que orienta o processo de refinamento.

## 6.5. Controle de regressões

Toda correção deverá ser acompanhada de verificação de regressões.

Exemplo:

Se uma alteração no sistema de coordenadas corrigir o sentido do teclado, o agente crítico deverá verificar se a mesma alteração não inverteu o analógico do joystick, a câmera ou a orientação dos adversários.

Se uma otimização gráfica melhorar o desempenho, o agente visual deverá verificar se a qualidade da cena foi comprometida.

Se uma alteração na geometria da pista corrigir uma curva, o agente de QA deverá verificar se os checkpoints, o minimapa e os adversários continuam funcionando.

O ciclo de melhoria deverá preservar as funcionalidades já aprovadas.

## 6.6. Persistência do processo

Após cada ciclo, registre:

* Versão avaliada.
* Funcionalidade.
* Problema identificado.
* Evidência do problema.
* Agente responsável.
* Correção realizada.
* Resultado do novo teste.
* Situação atual do item.

Não encerre o processo por mera conclusão de uma etapa de programação.

Se o ambiente interromper a execução por limite de tempo, recursos ou contexto, preserve o estado do checklist e documente exatamente o ponto de retomada.

Não afirme que continuará executando agentes em segundo plano quando o ambiente não oferecer essa capacidade.

---

# 7. SISTEMA DE COORDENADAS — REGRA CRÍTICA

ERROS DE COORDENADAS SÃO UMA DAS PRINCIPAIS CAUSAS DE CONTROLES INVERTIDOS.

Antes de implementar a física, os controles ou a câmera, estabeleça um sistema de coordenadas único para todo o projeto.

Para Three.js, utilize preferencialmente a seguinte convenção:

* Eixo X: direção lateral.
* Eixo Y: direção vertical.
* Eixo Z: profundidade.
* Vetor local de avanço do veículo: (0, 0, -1).
* Vetor local da direita do veículo: (1, 0, 0).
* Vetor vertical: (0, 1, 0).

O modelo 3D deverá ser orientado de modo que a dianteira física e visual do veículo correspondam ao vetor de avanço definido.

Se o modelo original utilizar outra orientação, aplique a transformação corretiva ao modelo visual, sem alterar arbitrariamente os sinais da física ou dos controles.

O movimento deverá utilizar a transformação do vetor local de avanço para coordenadas globais.

O esterçamento deverá ser calculado em relação à orientação atual do veículo.

O carro não poderá usar as coordenadas da câmera como referência para decidir o sentido da aceleração ou da direção.

A câmera deverá acompanhar o veículo, e não determinar o sentido físico de seus movimentos.

Todos os módulos deverão utilizar a mesma convenção.

### 7.1. Auditoria independente das coordenadas

O agente crítico de física deverá verificar se a implementação respeita a convenção definida.

O agente crítico de controles deverá validar os resultados dos comandos.

O agente crítico de câmeras deverá verificar se a orientação visual corresponde ao sentido físico do movimento.

Os três agentes deverão confrontar suas avaliações antes de aprovar a integração.

Se o comportamento visual estiver invertido, determine se a causa está:

* Na orientação do modelo.
* No sistema de coordenadas.
* Na conversão entre coordenadas locais e globais.
* No sinal matemático do esterçamento.
* Na posição da câmera.
* No processamento das entradas.

Corrija o componente responsável pela inversão.

Não utilize uma inversão arbitrária de comandos para mascarar um erro de orientação do modelo.

---

# 8. CONTROLES DE TECLADO — IMPLEMENTAÇÃO E TESTES

Implemente o seguinte mapeamento:

| Entrada            | Comportamento                 |
| ------------------ | ----------------------------- |
| W                  | Acelerar para frente          |
| S                  | Frear; marcha à ré após parar |
| A                  | Esterçar para a esquerda      |
| D                  | Esterçar para a direita       |
| Seta para cima     | Acelerar para frente          |
| Seta para baixo    | Frear; marcha à ré após parar |
| Seta para esquerda | Esterçar para a esquerda      |
| Seta para direita  | Esterçar para a direita       |
| C                  | Alternar câmera               |
| R                  | Reposicionar veículo          |
| ESC                | Pausar ou continuar           |

A tecla W deverá produzir velocidade longitudinal positiva em relação ao vetor local de avanço do veículo.

A tecla S deverá reduzir a velocidade quando o veículo estiver avançando.

A tecla A deverá modificar a orientação do veículo de maneira que sua trajetória, observada pela câmera traseira, se desloque para a esquerda.

A tecla D deverá produzir o comportamento oposto.

O comportamento do esterçamento em marcha à ré deverá ser consistente com a cinemática do veículo.

### Testes obrigatórios de direção

TESTE 01:

Posicione o veículo em uma reta.

Pressione W.

Resultado esperado: o carro se afasta da câmera traseira, avançando pela pista.

TESTE 02:

Com o veículo avançando, pressione A.

Resultado esperado: o carro inicia uma curva à esquerda.

TESTE 03:

Com o veículo avançando, pressione D.

Resultado esperado: o carro inicia uma curva à direita.

TESTE 04:

Pressione S durante o movimento para frente.

Resultado esperado: a velocidade diminui progressivamente.

TESTE 05:

Mantenha S pressionado após a parada.

Resultado esperado: o veículo inicia a marcha à ré, sem inverter repentinamente a orientação visual.

TESTE 06:

Pressione W + A.

Resultado esperado: o veículo acelera enquanto vira à esquerda.

TESTE 07:

Pressione W + D.

Resultado esperado: o veículo acelera enquanto vira à direita.

TESTE 08:

Alterne entre as câmeras.

Resultado esperado: a direção física do veículo permanece inalterada.

Os testes de esterçamento deverão verificar também o deslocamento e a orientação física do veículo, para não depender apenas da aparência visual.

Qualquer falha de direção deverá ser corrigida antes de considerar o sistema de controles concluído.

### 8.1. Crítica independente dos controles

O agente C05 deverá testar cada comando separadamente e em combinação com os demais.

O avaliador deverá procurar especificamente controles invertidos e comportamentos que aparentem estar corretos em uma câmera, mas estejam incorretos em outra.

O resultado deverá ser validado tanto pela observação visual quanto pelos dados da simulação.

A aprovação não poderá se basear somente no recebimento de eventos de teclado.

---

# 9. SUPORTE A JOYSTICK — OBRIGATÓRIO

Implemente suporte real a controles físicos por meio da Gamepad API.

O jogo deverá reconhecer controles compatíveis com os mapeamentos padronizados utilizados por Xbox e PlayStation.

A compatibilidade deverá considerar o suporte efetivamente oferecido pelo navegador e pelo sistema operacional.

## 9.1. Detecção de dispositivos

Utilize a API navigator.getGamepads().

Implemente o tratamento dos eventos:

gamepadconnected

gamepaddisconnected

O jogo deverá:

Detectar controles conectados.

Identificar o controle ativo.

Exibir uma indicação de conexão.

Permitir o uso do controle durante a corrida.

Lidar com desconexões sem provocar aceleração ou direção permanente.

Restaurar entradas neutras quando necessário.

Permitir a retomada após reconexão.

A leitura do estado do controle deverá ocorrer de forma contínua durante o loop do jogo.

## 9.2. Mapeamento padrão

Utilize como referência o seguinte mapeamento para controles com Gamepad.mapping igual a "standard":

| Entrada                                | Ação                   |
| -------------------------------------- | ---------------------- |
| Analógico esquerdo — eixo horizontal 0 | Esterçar               |
| Gatilho direito — botão 7              | Acelerar               |
| Gatilho esquerdo — botão 6             | Frear                  |
| Botão inferior — botão 0               | Aceleração alternativa |
| Botão direito — botão 1                | Freio alternativo      |
| D-Pad esquerdo — botão 14              | Esterçar à esquerda    |
| D-Pad direito — botão 15               | Esterçar à direita     |
| Botão superior — botão 3               | Alternar câmera        |
| Start/Options — botão 9                | Pausar ou continuar    |

O analógico esquerdo deverá ser o mecanismo principal de direção.

O gatilho direito deverá controlar progressivamente a aceleração.

O gatilho esquerdo deverá controlar progressivamente a frenagem.

Os botões digitais deverão funcionar como entradas alternativas.

Não assuma que dispositivos com mapeamento não padronizado utilizam obrigatoriamente os mesmos índices.

Quando o navegador não fornecer o mapeamento padrão, disponibilize uma rotina de configuração ou calibração do controle.

## 9.3. Direção analógica

O eixo horizontal deverá obedecer à seguinte convenção:

Analógico centralizado: direção neutra.

Analógico para a esquerda: direção à esquerda.

Analógico para a direita: direção à direita.

No mapeamento padrão da Gamepad API, valores negativos do eixo horizontal representam deslocamento para a esquerda e valores positivos representam deslocamento para a direita.

Converta esse valor para a convenção interna de esterçamento definida pela física.

Não aplique uma inversão de sinal sem justificar matematicamente sua necessidade.

A lógica de direção não poderá mudar de sentido em razão da posição da câmera.

## 9.4. Deadzone

Implemente uma zona morta configurável para o analógico.

Valor inicial recomendado: 0,10.

Valores dentro da zona morta deverão ser interpretados como direção neutra.

Fora dela, normalize novamente a amplitude para aproveitar a faixa útil do analógico.

Aplique uma curva de resposta progressiva para permitir correções suaves em alta velocidade.

Não utilize direção digital binária como única interpretação do analógico.

## 9.5. Gatilhos analógicos

Leia o valor analógico dos gatilhos.

A aceleração deverá aumentar progressivamente conforme o gatilho direito for pressionado.

A intensidade de frenagem deverá aumentar progressivamente conforme o gatilho esquerdo for pressionado.

Normalmente, os valores dos botões analógicos da Gamepad API estão compreendidos entre 0 e 1.

Realize normalização quando necessária, considerando as informações efetivamente fornecidas pelo dispositivo.

## 9.6. Prioridade de entrada

Crie uma camada unificada de entrada.

A física não deverá conhecer diretamente os códigos do teclado ou os índices dos botões do joystick.

Ela deverá receber comandos normalizados de direção, aceleração, frenagem e ações auxiliares.

Quando houver entradas simultâneas, estabeleça regras determinísticas para impedir comandos conflitantes.

Permita alternar entre teclado e joystick sem reiniciar a corrida.

## 9.7. Tela de diagnóstico do joystick

Implemente uma tela de diagnóstico acessível durante o desenvolvimento.

Ela deverá apresentar:

* Identificação do dispositivo.
* Status de conexão.
* Tipo de mapeamento.
* Valores dos eixos.
* Estado dos gatilhos.
* Botões pressionados.
* Direção normalizada enviada à física.
* Intensidade de aceleração.
* Intensidade de frenagem.

Essa tela deverá permitir identificar rapidamente eixos invertidos, botões incorretos e problemas de calibração.

## 9.8. Testes obrigatórios com joystick

Execute os seguintes testes:

1. Conectar o joystick e verificar sua detecção.
2. Mover o analógico esquerdo para a esquerda e verificar o esterçamento correto.
3. Mover o analógico para a direita e verificar o esterçamento correto.
4. Pressionar parcialmente o gatilho direito e verificar aceleração proporcional.
5. Pressionar completamente o gatilho direito e verificar aceleração máxima.
6. Pressionar o gatilho esquerdo e verificar frenagem proporcional.
7. Utilizar o D-Pad para esterçar.
8. Alternar câmeras pelo controle.
9. Pausar e continuar a corrida.
10. Desconectar o controle durante a condução e verificar a neutralização das entradas.
11. Reconectar o dispositivo e verificar o restabelecimento do controle.
12. Alternar entre teclado e joystick durante a partida.

Se houver um controle físico disponível no ambiente, execute os testes nele.

Na ausência de hardware, valide os contratos de entrada e a lógica da Gamepad API com testes automatizados, mas registre a validação em dispositivo físico como pendente.

Não declare que um joystick físico foi testado quando não houver evidência de sua utilização.

### 9.9. Avaliação crítica especializada do joystick

O agente C06 deverá avaliar a implementação independentemente do agente responsável pelo desenvolvimento.

O agente crítico deverá verificar se o jogo realmente interpreta entradas da Gamepad API ou se o funcionamento está sendo simulado por eventos de teclado.

Deverá verificar também se os controles analógicos preservam sua característica progressiva.

Não aprove um joystick que permita apenas aceleração máxima ou frenagem máxima quando o requisito exigir entradas analógicas proporcionais.

A ausência de hardware físico deverá ser registrada como limitação específica de validação, sem impedir a execução dos testes automatizados possíveis.

---

# 10. QUALIDADE GRÁFICA — PRIORIDADE MÁXIMA

A imagem anexada deverá orientar toda a apresentação visual.

O jogo não poderá ser considerado visualmente concluído apenas por possuir objetos tridimensionais.

A qualidade final deverá ser avaliada pela composição da cena renderizada, pelo detalhamento dos materiais, pela iluminação e pela coerência visual de seus elementos.

## 10.1. Veículo

Desenvolva um carro monoposto de competição com aparência realista.

O veículo deverá possuir:

Carroceria vermelha e branca.

Aerofólio dianteiro detalhado.

Aerofólio traseiro.

Cockpit.

Rodas largas de competição.

Pneus com materiais adequados.

Sistema de suspensão visualmente coerente.

Componentes mecânicos visíveis quando apropriado.

Pintura automotiva com reflexos.

Sombras de contato.

Geometria tridimensional suficiente para manter uma silhueta convincente quando visto de perto.

Não utilize uma caixa vermelha com quatro cilindros como representação final do veículo.

Se forem utilizados modelos externos, confirme que os arquivos existem e que sua utilização é permitida.

Caso o ambiente não disponha de modelos com qualidade adequada, registre a limitação e desenvolva a melhor alternativa procedural viável, sem afirmar que o resultado possui o mesmo detalhamento de um asset profissional.

## 10.2. Pista

A superfície deverá apresentar:

Asfalto com textura de alta qualidade.

Variações sutis de rugosidade.

Marcas de pneus e desgaste.

Sinalização horizontal.

Zebras realistas nas curvas.

Transições suaves entre asfalto, acostamento e grama.

Geometria contínua e coerente com o traçado.

O asfalto não poderá parecer um plano cinza sem textura.

A superfície deverá reagir corretamente à iluminação.

## 10.3. Ambiente

Construa um cenário inspirado na imagem.

Inclua:

Vegetação detalhada.

Árvores tridimensionais com aparência natural.

Grama e vegetação rasteira.

Montanhas ao fundo.

Céu azul com nuvens.

Guard-rails metálicos.

Arquibancadas e estruturas do circuito.

Elementos de sinalização.

Áreas de escape.

Utilize técnicas de instanciamento e níveis de detalhe quando necessário.

Os objetos próximos da pista deverão possuir detalhamento suficiente para não apresentar aparência excessivamente geométrica.

Os elementos distantes poderão utilizar técnicas de otimização compatíveis com sua distância da câmera.

## 10.4. Iluminação

Implemente:

Iluminação solar direcional.

Sombras dinâmicas com resolução apropriada.

Iluminação ambiental.

Materiais PBR.

Reflexos na pintura do veículo.

Correção de cores.

Exposição adequada.

Ambientação atmosférica.

Antialiasing.

Técnicas de sombreamento e pós-processamento compatíveis com a plataforma.

Quando viável, implemente ambient occlusion e reflexos adicionais.

Evite aplicar efeitos excessivos que prejudiquem a nitidez da pista ou a percepção dos obstáculos.

## 10.5. Sensação de velocidade

Implemente recursos visuais que transmitam velocidade sem comprometer a jogabilidade.

Considere:

Variação moderada do campo de visão.

Movimento do cenário baseado na velocidade real.

Animação proporcional das rodas.

Efeitos ambientais discretos.

Vibração sutil da câmera em situações específicas.

Efeitos de partículas e marcas de pneus.

O carro não deverá permanecer visualmente parado enquanto o cenário apenas se desloca artificialmente.

Todos os efeitos deverão estar associados ao estado real da simulação.

## 10.6. Auditoria gráfica com padrão AAA

O agente crítico de renderização e o auditor visual independente deverão avaliar o resultado gráfico em conjunto, preservando a independência de suas análises individuais.

A avaliação deverá identificar:

* Modelos excessivamente simplificados.
* Silhuetas incorretas.
* Materiais artificiais.
* Superfícies sem detalhamento.
* Iluminação incompatível com a cena.
* Sombras de baixa qualidade.
* Problemas de escala.
* Vegetação visualmente repetitiva.
* Objetos que aparentem flutuar.
* Falta de profundidade visual.
* Efeitos exagerados.
* Defeitos de antialiasing.
* Inconsistência de cores.
* Falta de fidelidade à imagem fornecida.

Quando uma divergência relevante for identificada, o agente crítico deverá encaminhar uma solicitação concreta de correção ao agente responsável.

A avaliação não poderá ser substituída por uma descrição textual afirmando que a cena possui gráficos realistas.

O resultado efetivamente renderizado deverá ser inspecionado.

---

# 11. PIPELINE DE VALIDAÇÃO VISUAL

Crie um processo específico para comparar a imagem de referência com o jogo renderizado.

A validação deverá ocorrer ao longo do desenvolvimento, e não apenas na entrega final.

## Etapa A — Reprodução da composição

Posicione o carro e a câmera em uma cena que reproduza aproximadamente o enquadramento da imagem.

Compare:

Altura da câmera.

Distância até o veículo.

Escala aparente do carro.

Posição da linha do horizonte.

Largura aparente da pista.

Distribuição dos elementos do cenário.

## Etapa B — Reprodução dos materiais

Compare o aspecto visual do asfalto, da carroceria, dos pneus, da vegetação e dos elementos metálicos.

Identifique materiais com cores, rugosidade ou reflexos inadequados.

## Etapa C — Iluminação

Compare a direção da luz, a distribuição das sombras e o contraste da cena.

Verifique se a iluminação está coerente entre veículo, pista e ambiente.

## Etapa D — Interface

Compare o posicionamento e a hierarquia dos elementos do HUD.

Garanta que a interface tenha qualidade visual compatível com a cena.

## Etapa E — Inspeção em execução

Execute o jogo e capture imagens reais da renderização quando o ambiente permitir.

Compare essas capturas com a referência.

Registre as diferenças relevantes e encaminhe cada correção ao agente responsável.

Repita o processo após as alterações.

Não utilize a imagem de referência como uma captura falsa do jogo em execução.

Não utilize uma imagem gerada separadamente como prova de que o motor gráfico alcançou a qualidade visual desejada.

A validação deverá utilizar a cena realmente renderizada pelo jogo.

## 11.1. Comparação visual inicial e final

Implemente um procedimento obrigatório de comparação visual entre:

A. A imagem original fornecida pelo usuário.

B. A primeira versão efetivamente renderizada pelo jogo.

C. A versão atual após as melhorias.

D. A versão final apresentada para entrega.

A comparação deverá ser realizada utilizando enquadramentos e condições de captura tão semelhantes quanto possível.

Mantenha a resolução e a proporção das imagens consistentes.

Quando houver diferenças de resolução, normalize as dimensões para permitir comparação direta, preservando os arquivos originais para inspeção detalhada.

As imagens deverão ser apresentadas lado a lado.

O objetivo será identificar claramente se houve evolução na qualidade visual e se o resultado final se aproximou da referência.

## 11.2. Avaliação visual às cegas

Além da comparação direta, execute uma avaliação às cegas.

Prepare imagens da versão inicial e da versão atual sem indicar antecipadamente qual delas é a mais recente.

Identifique temporariamente as imagens com códigos neutros.

O agente avaliador deverá inspecionar as imagens sem receber informações sobre a ordem de desenvolvimento.

Ele deverá descrever:

* Qual imagem apresenta geometria mais convincente.
* Qual apresenta materiais mais realistas.
* Qual possui iluminação mais coerente.
* Qual apresenta melhor definição visual.
* Qual possui maior fidelidade à imagem de referência.
* Quais defeitos específicos aparecem em cada imagem.
* Quais melhorias ainda são necessárias.

Após registrar a análise, revele a identificação das versões.

O orquestrador deverá utilizar o resultado para verificar se a alteração realmente produziu a evolução visual pretendida.

Se a versão mais recente apresentar regressões relevantes, ela deverá retornar ao ciclo de correção.

A análise às cegas não deverá ser manipulada para favorecer a versão mais recente.

## 11.3. Comparação da referência contra o resultado renderizado

Execute também uma comparação direta entre a imagem anexada e uma captura real da versão atual do jogo.

Nessa avaliação, o agente crítico deverá conhecer qual imagem é a referência e qual é a renderização.

O objetivo será identificar objetivamente as diferenças que impedem o jogo de reproduzir a direção artística desejada.

A avaliação às cegas entre versões e a comparação identificada contra a referência são procedimentos complementares e ambos deverão ser utilizados.

## 11.4. Avaliação visual durante a jogabilidade

A qualidade gráfica não deverá ser avaliada apenas em uma captura estática.

O agente crítico deverá inspecionar:

* Veículo parado.
* Veículo em aceleração.
* Veículo em alta velocidade.
* Curvas.
* Frenagens.
* Derrapagens.
* Aproximação de adversários.
* Ultrapassagens.
* Mudanças de câmera.
* Diferentes posições do circuito.

O cenário deverá permanecer visualmente coerente durante a movimentação.

Não aceite uma cena que pareça visualmente adequada apenas quando o veículo está parado.

## 11.5. Ciclo de refinamento visual

Após cada comparação, o agente crítico deverá registrar os problemas identificados e atribuí-los aos respectivos responsáveis.

O agente desenvolvedor deverá corrigir os problemas e produzir uma nova versão executável.

O agente crítico deverá realizar outra inspeção.

O processo deverá continuar enquanto existirem divergências relevantes e tecnicamente corrigíveis em relação aos critérios visuais aprovados.

Toda melhoria deverá ser confrontada com a versão anterior para evitar regressões.

A conclusão visual somente poderá ser registrada quando os requisitos verificáveis estiverem atendidos e as limitações remanescentes estiverem documentadas.

---

# 12. FÍSICA VEICULAR E COMPORTAMENTO ARCADE

Implemente um modelo de física adequado a um jogo de corrida arcade.

O veículo deverá oferecer resposta rápida aos comandos, estabilidade em alta velocidade e comportamento previsível.

O sistema deverá considerar:

Massa.

Aceleração longitudinal.

Frenagem progressiva.

Velocidade longitudinal e lateral.

Esterçamento.

Raio de curva.

Aderência dos pneus.

Arrasto aerodinâmico simplificado.

Resistência ao rolamento.

Atrito fora da pista.

Colisões com barreiras e veículos.

Derrapagem controlada.

Para a implementação inicial, considere um modelo cinemático de bicicleta, complementado por comportamentos arcade.

Utilize um modelo dinâmico mais elaborado caso os recursos disponíveis permitam e haja benefício demonstrável para a jogabilidade.

A velocidade exibida no HUD deverá ser calculada a partir da velocidade real da simulação.

O veículo deverá respeitar a superfície da pista e suas elevações.

Evite que o carro atravesse barreiras, flutue acima do asfalto ou realize mudanças instantâneas de direção incompatíveis com sua velocidade.

Implemente interpolação visual entre atualizações físicas, quando necessário.

A simulação deverá utilizar intervalo de tempo fixo e ser independente da taxa de quadros.

### 12.1. Avaliação independente da dirigibilidade

O agente crítico de física deverá realizar testes com diferentes velocidades, ângulos de direção e condições de pista.

Deverá verificar se o veículo mantém uma resposta coerente em curvas suaves, curvas fechadas e manobras de frenagem.

O objetivo será alcançar uma experiência arcade convincente, com precisão nos comandos e sensação de velocidade.

Não aprove a física simplesmente porque o veículo consegue percorrer a pista.

O comportamento deverá ser estável, controlável e compatível com a proposta de um jogo de corrida profissional.

---

# 13. SISTEMA DE CÂMERAS

Implemente três câmeras.

### Câmera principal

Perspectiva de terceira pessoa, posicionada atrás e ligeiramente acima do veículo.

Deverá reproduzir o enquadramento da imagem de referência.

Essa será a câmera padrão.

### Câmera de cockpit

Perspectiva do piloto, com posição e orientação coerentes com a geometria do veículo.

### Câmera externa elevada

Perspectiva traseira mais distante, com maior visualização da pista.

Todas as câmeras deverão utilizar a posição e a orientação físicas do veículo.

Implemente acompanhamento suave, com amortecimento apropriado.

A câmera principal deverá permanecer alinhada à direção de avanço do veículo, permitindo que o jogador interprete corretamente as curvas.

A rotação da câmera não poderá inverter comandos de direção ou modificar a física.

A alternância entre câmeras deverá preservar integralmente a velocidade, a orientação e os comandos do veículo.

### 13.1. Avaliação crítica da câmera principal

O agente C07 deverá comparar o enquadramento da câmera principal com o enquadramento apresentado na imagem anexada.

Deverá verificar se o veículo possui proporções adequadas na tela e se a pista permanece visível à frente.

Também deverá verificar se a câmera acompanha o carro de maneira suave durante curvas e mudanças de velocidade.

A câmera não poderá apresentar movimentos que prejudiquem a percepção dos comandos ou causem a impressão de direção invertida.

---

# 14. CIRCUITO COMPLETO E SISTEMA DE NAVEGAÇÃO

Construa um circuito tridimensional fechado.

A imagem anexada deverá orientar a aparência e a ambientação da pista.

Como a imagem não apresenta o circuito completo, crie os trechos não visíveis de maneira coerente.

O circuito deverá conter:

Retas.

Curvas de diferentes raios.

Elevações suaves.

Trechos de alta velocidade.

Áreas de escape.

Linha de largada e chegada.

Checkpoints.

Barreiras de proteção.

Pontos de referência para os adversários.

O circuito deverá possuir uma representação matemática consistente.

Utilize uma curva central parametrizada ou uma solução equivalente para definir o traçado.

A partir dessa representação, derive:

Geometria da pista.

Direção local do circuito.

Limites laterais.

Progressão da corrida.

Posições de checkpoints.

Navegação dos adversários.

Desenho do minimapa.

Evite criar sistemas independentes com trajetos diferentes.

A pista visual, a pista física, a inteligência artificial e o minimapa deverão representar o mesmo circuito.

### 14.1. Auditoria independente do circuito

O agente crítico deverá percorrer o circuito completo e verificar a continuidade de sua geometria.

Deverá inspecionar a transição entre curvas e retas, a posição das barreiras, as elevações e a correspondência com o minimapa.

Não aprove o circuito somente porque sua geometria foi gerada sem erros de compilação.

A pista deverá ser realmente percorrível pelo jogador e pelos adversários.

---

# 15. ADVERSÁRIOS E INTELIGÊNCIA ARTIFICIAL

Implemente uma competição com 16 veículos, incluindo o jogador.

Os 15 adversários deverão percorrer o circuito de maneira funcional.

Cada adversário deverá possuir:

Posição tridimensional real.

Velocidade.

Orientação.

Controle de aceleração.

Controle de frenagem.

Controle de direção.

Progresso no circuito.

Estado de corrida.

Os adversários deverão utilizar a representação real da pista para calcular suas trajetórias.

Implemente comportamento de condução que considere a curvatura da pista e a distância até os próximos trechos.

O sistema deverá reduzir a velocidade antes de curvas fechadas e acelerar nas retas.

Os adversários deverão interagir com os demais veículos e permitir disputas de posição.

Não implemente adversários puramente decorativos.

Não utilize teletransporte para simular ultrapassagens.

A posição na classificação deverá refletir o progresso efetivo de cada participante.

### 15.1. Auditoria da inteligência artificial

O agente crítico deverá acompanhar os adversários durante voltas completas.

Deverá verificar se os veículos:

* Permanecem dentro dos limites da pista.
* Reduzem a velocidade antes das curvas.
* Aceleram quando apropriado.
* Não atravessam barreiras.
* Não ficam permanentemente presos.
* Não se teletransportam.
* Interagem corretamente com o jogador.
* Atualizam seu progresso na corrida.

A avaliação deverá considerar o comportamento real dos adversários durante a execução, não apenas a existência do código de navegação.

---

# 16. INTERFACE E HUD

Utilize a imagem anexada como referência para a composição da interface.

O HUD deverá ser moderno, legível e visualmente integrado ao jogo.

Implemente os seguintes elementos:

### Canto superior esquerdo

Posição do jogador.

Exemplo: 5TH / 16.

### Parte superior central

Cronômetro regressivo.

Exemplo: TIME 58.

Mensagem EXTEND TIME quando o jogador alcançar checkpoints que ampliam o tempo disponível.

### Canto superior direito

Tempo da volta atual e tempo da última volta.

### Canto inferior esquerdo

Velocímetro digital.

Exemplo: 328 km/h.

### Canto inferior direito

Minimapa do circuito.

Indicação da posição do jogador.

Indicação dos adversários quando viável.

Identificação do nível de dificuldade.

Os elementos deverão responder aos dados reais da corrida.

Não utilize números fixos ou valores fictícios apenas para reproduzir a aparência da imagem.

### 16.1. Avaliação crítica de UX/UI

O agente C09 deverá avaliar a interface em condições reais de jogo.

Deverá verificar:

* Legibilidade em diferentes resoluções.
* Visibilidade das informações em alta velocidade.
* Consistência de fontes.
* Alinhamento dos elementos.
* Espaçamentos.
* Contraste.
* Proporção dos componentes.
* Hierarquia visual.
* Clareza das informações.
* Coerência com a imagem de referência.

O crítico deverá verificar se a interface possui aparência profissional e se não prejudica a visibilidade da pista.

A interface deverá ser comparada visualmente com a referência e com as versões anteriores do projeto.

---

# 17. SISTEMA DE CORRIDA

Implemente:

Tela inicial.

Seleção de dificuldade.

Contagem regressiva.

Largada.

Corrida em andamento.

Cronômetro regressivo.

Checkpoints.

Extensão de tempo.

Contabilização de voltas.

Classificação.

Pausa.

Conclusão da corrida.

Tela de resultados.

Reinício de partida.

Os checkpoints deverão ser utilizados para validar o percurso e evitar que o jogador contabilize voltas incorretamente.

A classificação deverá considerar voltas concluídas e progresso no circuito.

O cronômetro deverá refletir o tempo real de simulação da corrida, respeitando o estado de pausa.

O sistema não poderá contabilizar tempo de corrida durante uma pausa.

### 17.1. Validação crítica da experiência completa

O agente C10 deverá executar o fluxo completo da corrida.

A avaliação deverá começar na tela inicial e terminar com a apresentação dos resultados.

O agente deverá verificar todas as transições de estado.

Não aprove o sistema caso seja possível iniciar a corrida, mas não seja possível concluí-la ou reiniciá-la corretamente.

---

# 18. ÁUDIO E FEEDBACK

Implemente um sistema de áudio funcional.

Inclua:

Som do motor.

Variação do motor conforme a rotação simulada.

Som de aceleração.

Som de frenagem.

Efeitos de pneus em derrapagens.

Colisões.

Contagem regressiva.

Eventos de checkpoint.

Conclusão da corrida.

Se utilizar arquivos de áudio externos, confirme que eles estão disponíveis e possuem licença adequada.

Não introduza referências a arquivos inexistentes.

Respeite as restrições de reprodução automática de áudio do navegador.

O áudio deverá ser inicializado após uma interação válida do jogador quando necessário.

### 18.1. Auditoria de áudio

O agente crítico deverá verificar se os sons acompanham os eventos reais da simulação.

A frequência do motor deverá responder à rotação simulada.

Os sons de colisão não deverão ser reproduzidos quando não houver colisão.

Os sons de frenagem e derrapagem deverão corresponder ao comportamento físico do veículo.

O resultado deverá ser inspecionado durante a jogabilidade real.

---

# 19. PERFORMANCE E ESTABILIDADE

A qualidade gráfica deverá ser priorizada sem negligenciar a execução real.

Estabeleça como meta uma experiência próxima de 60 FPS em hardware desktop compatível com o nível de qualidade selecionado.

Implemente perfis gráficos configuráveis.

### Qualidade Alta

Priorize texturas, geometria, sombras e efeitos visuais.

### Qualidade Média

Reduza seletivamente os recursos de maior custo.

### Qualidade Baixa

Priorize estabilidade, preservando a jogabilidade e a legibilidade do cenário.

A configuração inicial deverá considerar as capacidades detectáveis da plataforma.

Utilize otimizações como:

Instanced meshes.

Frustum culling.

Level of Detail.

Reutilização de materiais e geometrias.

Gerenciamento de recursos gráficos.

Redução de draw calls.

Evite recriar materiais, geometrias e objetos a cada frame.

Não remova elementos visuais importantes apenas para atingir um número arbitrário de FPS sem investigar outras alternativas.

### 19.1. Auditoria independente de performance

O agente crítico de performance deverá medir o comportamento do jogo durante situações representativas.

Inclua:

* Corrida com todos os adversários.
* Retas de alta velocidade.
* Curvas com vegetação próxima.
* Mudanças de câmera.
* Colisões.
* Reinício de partida.
* Execução prolongada, quando o ambiente permitir.

Registre a configuração gráfica, a resolução e as características do ambiente de teste.

Verifique a taxa de quadros, a estabilidade e o consumo de memória.

Não declare que o jogo executa a 60 FPS sem medições realizadas em um ambiente identificado.

Toda otimização relevante deverá ser submetida à avaliação visual para verificar se não comprometeu a qualidade gráfica.

---

# 20. TESTES AUTOMATIZADOS E VALIDAÇÃO REAL

O agente de QA deverá preparar uma matriz de testes abrangendo todos os módulos.

A matriz deverá contemplar:

### Controles

Sentido da aceleração.

Sentido da frenagem.

Direção esquerda e direita.

Marcha à ré.

Comandos simultâneos.

Alternância de câmera.

### Joystick

Detecção do dispositivo.

Eixos analógicos.

Gatilhos.

Botões.

Deadzone.

Desconexão.

Reconexão.

Alternância entre teclado e controle.

### Física

Aceleração progressiva.

Frenagem progressiva.

Limites de velocidade.

Comportamento em curvas.

Colisões.

Interação com o asfalto.

Comportamento fora da pista.

### Corrida

Largada.

Checkpoints.

Temporizador.

Voltas válidas.

Classificação.

Finalização.

Reinício.

### Gráficos

Posicionamento da câmera.

Visibilidade do carro.

Texturas.

Sombras.

Reflexos.

Iluminação.

Cenário.

HUD.

### Performance

Estabilidade do loop principal.

Consumo de memória.

Erros de execução.

Tempo de carregamento.

Taxa de quadros.

Para os testes de controle, crie verificações automatizadas que utilizem a orientação inicial do veículo e os vetores resultantes da simulação.

Por exemplo, partindo de uma orientação conhecida e velocidade longitudinal positiva, o comando de esquerda deverá resultar em uma trajetória com componente lateral no sentido esperado.

A verificação deverá contemplar a conversão entre coordenadas locais e globais.

Não confie exclusivamente em testes que apenas verificam se uma função foi chamada ou se um evento de teclado foi recebido.

O comportamento resultante da simulação deverá ser validado.

Execute os testes por meio das ferramentas disponíveis.

Quando houver ambiente de navegador automatizado, utilize-o para realizar inspeções e testes de integração.

Não substitua testes reais por relatórios fictícios.

### 20.1. Auditoria independente de cada teste

O agente C14 deverá inspecionar a matriz de testes produzida pelo agente de QA.

Sua responsabilidade será verificar se os testes realmente conseguem identificar os defeitos que afirmam detectar.

Por exemplo, um teste de direção não deverá ser aprovado apenas porque verifica que o valor do esterçamento mudou.

Ele deverá verificar se o veículo efetivamente passou a se deslocar na direção correta.

Um teste de joystick não deverá ser aprovado apenas porque a função navigator.getGamepads() foi chamada.

Ele deverá verificar se as entradas foram corretamente convertidas em comandos de direção, aceleração e frenagem.

O agente crítico deverá identificar lacunas na cobertura de testes e solicitar complementações.

### 20.2. Testes adversariais

Além dos cenários normais, os agentes críticos deverão procurar situações que possam provocar falhas.

Considere:

* Pressionar aceleração e freio simultaneamente.
* Alternar rapidamente entre esquerda e direita.
* Desconectar o joystick durante uma curva.
* Alternar câmeras durante uma colisão.
* Pausar durante a contagem regressiva.
* Reiniciar a corrida após o tempo esgotar.
* Atingir um checkpoint enquanto o cronômetro está próximo de zero.
* Colidir com uma barreira em alta velocidade.
* Tentar contabilizar uma volta sem completar o circuito.
* Executar o jogo com taxa de quadros variável.

Cada agente crítico deverá preparar testes adversariais adequados ao seu domínio.

---

# 21. CHECKLIST.TXT — PLANEJAMENTO E CONTROLE

O arquivo checklist.txt deverá ser obrigatório.

Antes de qualquer alteração de código, faça a leitura do projeto existente, ignorando .git e .vs.

Elabore no checklist:

1. Diagnóstico técnico.
2. Análise da imagem.
3. Arquitetura proposta.
4. Definição do sistema de coordenadas.
5. Contratos de integração.
6. Relação de agentes.
7. Plano de execução paralela.
8. Dependências entre atividades.
9. Arquivos que serão alterados.
10. Arquivos que serão criados, com justificativa individual.
11. Riscos e limitações.
12. Critérios de aceitação.
13. Estratégia de testes.
14. Estratégia de Loop Engineering.

Antes da autorização expressa "faça sua mágica", apenas leia os arquivos existentes e crie ou atualize o checklist.txt.

Não altere código.

Não instale dependências.

Não crie arquivos de implementação.

Não execute modificações estruturais no projeto.

Depois da autorização, execute o plano aprovado.

Mantenha o checklist atualizado com o progresso real.

Não apague arquivos sem confirmação prévia registrada no checklist.

Não realize refatorações em massa, renomeações ou alterações fora do escopo.

Caso uma nova necessidade técnica exija um arquivo não previsto, registre e justifique a alteração do plano antes de criá-lo.

## 21.1. Registro dos agentes críticos

Acrescente ao checklist a relação completa dos agentes desenvolvedores e avaliadores.

Para cada tarefa, registre:

* Identificador do item.
* Agente desenvolvedor.
* Agente crítico.
* Descrição do requisito.
* Arquivos envolvidos.
* Critérios de aceite.
* Testes previstos.
* Dependências.
* Estado da implementação.
* Estado da avaliação.
* Correções pendentes.
* Resultado final da validação.

O checklist deverá permitir acompanhar separadamente o progresso de implementação e o progresso de validação.

Uma tarefa implementada, mas ainda não avaliada, não poderá ser marcada como concluída.

## 21.2. Histórico dos ciclos de melhoria

Registre os ciclos de Loop Engineering executados.

Para cada ciclo, documente:

* Problema identificado.
* Versão avaliada.
* Evidência.
* Correção aplicada.
* Resultado dos testes.
* Resultado da avaliação crítica.
* Necessidade de novas iterações.

Não substitua o histórico de problemas por uma afirmação genérica de que tudo foi corrigido.

## 21.3. Controle de qualidade visual

Registre no checklist a existência das evidências de comparação visual.

Inclua:

* Referência visual original.
* Primeira versão renderizada.
* Versões intermediárias relevantes.
* Versão final.
* Resultado das avaliações às cegas.
* Divergências identificadas.
* Correções executadas.
* Limitações remanescentes.

Não crie arquivos de evidência adicionais antes da autorização, a menos que estejam expressamente previstos e aprovados no checklist.

---

# 22. ESTRATÉGIA DE EXECUÇÃO PARALELA

Após a aprovação do checklist, o orquestrador deverá distribuir as atividades entre os agentes.

A execução deverá priorizar paralelismo real.

Utilize a seguinte estratégia:

FASE 1 — CONTRATOS E PREPARAÇÃO

Estabelecer arquitetura.

Definir sistema de coordenadas.

Definir interfaces de comunicação.

Definir representação do circuito.

Definir sistema de entrada.

Definir estado global da corrida.

Definir critérios de validação.

FASE 2 — IMPLEMENTAÇÃO PARALELA

Iniciar simultaneamente todos os agentes cujos contratos e dependências estejam definidos.

Os agentes de ambiente, veículo, áudio, HUD, controles e outros módulos independentes deverão desenvolver suas respectivas partes em paralelo.

Os agentes de física e câmera poderão iniciar suas atividades utilizando contratos compartilhados e interfaces estáveis.

Os agentes de testes deverão preparar os cenários de validação em paralelo à implementação.

FASE 3 — INTEGRAÇÃO PROGRESSIVA

Integrar os módulos conforme forem concluídos.

Não aguarde todos os agentes terminarem para descobrir problemas de compatibilidade.

Após cada integração, execute testes de regressão.

FASE 4 — LOOP ENGINEERING INTEGRADO

Executar o jogo.

Inspecionar os resultados.

Comparar a renderização com a imagem.

Validar controles.

Validar joystick.

Validar física.

Validar adversários.

Corrigir defeitos.

Reexecutar os testes.

FASE 5 — VALIDAÇÃO FINAL

Executar a experiência completa.

Confirmar o funcionamento de todos os componentes.

Registrar resultados no checklist.

Não trate a execução paralela como autorização para implementar sistemas incompatíveis.

O orquestrador deverá garantir consistência técnica entre todos os agentes.

## 22.1. Execução paralela com agentes críticos

Amplie a estratégia de execução para incluir os agentes críticos durante todas as fases.

Na fase de contratos, os avaliadores deverão preparar seus critérios de aceitação e cenários de teste.

Na fase de implementação, os críticos deverão examinar os contratos e preparar a validação em paralelo ao desenvolvimento.

Na fase de integração, os críticos deverão executar testes dos componentes integrados.

Na fase de Loop Engineering, cada crítico deverá avaliar a entrega de seu desenvolvedor correspondente.

Na fase de validação final, o agente crítico geral deverá inspecionar o jogo completo.

O trabalho de avaliação não poderá ser concentrado exclusivamente no final do projeto.

## 22.2. Distribuição dinâmica de tarefas

O orquestrador deverá manter uma fila de tarefas prontas para execução.

Uma tarefa estará pronta quando seus contratos e dependências estiverem satisfeitos.

Sempre que houver capacidade disponível, distribua tarefas independentes entre os subagentes.

Não mantenha agentes ociosos desnecessariamente enquanto existirem atividades independentes que possam ser executadas.

Ao mesmo tempo, não aumente artificialmente o número de agentes quando isso produzir conflitos de edição, duplicação de trabalho ou perda de consistência.

## 22.3. Crítica simultânea da implementação

Durante o desenvolvimento de cada módulo, mantenha um agente crítico responsável por analisar o trabalho.

O crítico poderá preparar testes, revisar contratos e inspecionar versões intermediárias.

Quando identificar um defeito, deverá comunicar:

* Qual requisito foi violado.
* Como reproduzir o problema.
* Qual o resultado esperado.
* Qual o resultado observado.
* Qual evidência sustenta a crítica.
* Qual componente provavelmente precisa ser investigado.

O agente desenvolvedor deverá utilizar essas informações para corrigir o problema.

Depois da correção, o crítico deverá repetir a avaliação.

## 22.4. Integração sem conflitos

Cada agente deverá possuir uma área de responsabilidade definida.

Quando o ambiente permitir, utilize áreas de trabalho isoladas ou estratégias equivalentes de integração.

O orquestrador deverá controlar a incorporação das alterações.

Não permita que agentes independentes sobrescrevam o trabalho uns dos outros.

A execução simultânea deverá acelerar o desenvolvimento sem comprometer a integridade do código.

---

# 23. CRITÉRIOS DE ACEITE INEGOCIÁVEIS

O projeto somente poderá ser considerado concluído quando as seguintes condições estiverem satisfeitas e verificadas:

[ ] O jogo inicia corretamente.

[ ] O circuito é totalmente tridimensional e percorrível.

[ ] O veículo possui aparência coerente com a imagem de referência.

[ ] A câmera principal apresenta enquadramento compatível com a imagem.

[ ] A tecla W acelera o veículo para frente.

[ ] A tecla S freia corretamente.

[ ] A tecla A vira o veículo para a esquerda.

[ ] A tecla D vira o veículo para a direita.

[ ] O sistema de direção permanece correto em todas as câmeras.

[ ] O joystick é detectado pela Gamepad API.

[ ] O analógico esquerdo permite controlar a direção.

[ ] O analógico esquerdo não possui inversão de sentido.

[ ] Os gatilhos permitem aceleração e frenagem progressivas.

[ ] O D-Pad funciona corretamente.

[ ] O jogo permite alternar entre teclado e joystick.

[ ] A física responde corretamente aos comandos.

[ ] O veículo percorre curvas sem atravessar a pista ou as barreiras.

[ ] Os adversários percorrem o circuito.

[ ] O jogador consegue realizar ultrapassagens.

[ ] A classificação é atualizada corretamente.

[ ] O sistema de voltas funciona.

[ ] O cronômetro e os checkpoints funcionam.

[ ] O minimapa representa corretamente o circuito.

[ ] As telas de início, pausa e finalização funcionam.

[ ] A aplicação não possui erros bloqueantes de execução.

[ ] A renderização real foi inspecionada e comparada com a imagem de referência.

[ ] Os principais desvios visuais identificados foram corrigidos ou registrados como limitações.

[ ] Os testes automatizados foram executados com seus resultados documentados.

[ ] Os agentes concluíram suas responsabilidades e entregaram seus relatórios.

[ ] O agente orquestrador executou os testes de integração.

[ ] O checklist.txt contém o relatório técnico final.

Não marque itens como concluídos sem evidências correspondentes.

## 23.1. Critérios adicionais de aprovação AAA

Acrescente os seguintes critérios à validação final:

[ ] Cada módulo possui um agente crítico independente designado.

[ ] Cada requisito obrigatório foi submetido à avaliação correspondente.

[ ] Os defeitos críticos identificados foram corrigidos e revalidados.

[ ] Os testes de regressão foram executados após alterações relevantes.

[ ] A avaliação visual às cegas foi realizada quando os recursos necessários estavam disponíveis.

[ ] A versão inicial e a versão final foram comparadas diretamente.

[ ] A renderização final foi comparada com a imagem de referência.

[ ] A qualidade visual foi inspecionada durante a jogabilidade real.

[ ] Os problemas de UX identificados foram corrigidos ou documentados como limitações.

[ ] Os agentes críticos apresentaram evidências para suas avaliações.

[ ] O agente crítico geral avaliou a experiência completa.

[ ] Nenhum requisito obrigatório foi aprovado exclusivamente pelo agente que o implementou.

[ ] Os resultados dos testes refletem execuções reais ou indicam explicitamente as validações pendentes.

[ ] As limitações técnicas e os recursos indisponíveis foram registrados sem afirmações fictícias de conclusão.

## 23.2. Condições para continuidade dos ciclos

Não encerre o desenvolvimento enquanto existirem:

* Defeitos bloqueantes conhecidos.
* Controles invertidos.
* Falhas críticas de joystick.
* Problemas que impeçam concluir uma corrida.
* Erros de integração que comprometam a jogabilidade.
* Requisitos obrigatórios ainda não implementados.
* Divergências visuais relevantes que sejam tecnicamente corrigíveis dentro do escopo e dos recursos disponíveis.
* Regressões introduzidas pelas alterações mais recentes.

Quando houver limitações de ambiente ou recursos que impeçam alcançar determinado requisito, registre-as de maneira objetiva e apresente as alternativas necessárias.

A ausência de uma solução viável não deverá ser ocultada por uma aprovação genérica.

---

# 24. RELATÓRIO FINAL

Ao concluir a implementação, o agente orquestrador deverá apresentar:

Resumo técnico do projeto.

Tecnologias utilizadas.

Arquitetura implementada.

Relação dos arquivos criados.

Relação dos arquivos alterados.

Relação dos arquivos removidos, se houver autorização para remoção.

Descrição dos módulos implementados.

Relatório de cada agente.

Resumo das atividades executadas em paralelo.

Quantidade de ciclos de Loop Engineering efetivamente realizados por módulo.

Problemas identificados.

Correções realizadas.

Resultado dos testes de teclado.

Resultado dos testes de joystick.

Resultado da validação física.

Resultado da validação visual.

Resultado dos testes de integração.

Limitações remanescentes.

Instruções para executar o jogo.

Não apresente uma funcionalidade como concluída quando ela estiver apenas parcialmente implementada.

Não invente resultados de testes ou execuções de agentes.

## 24.1. Relatório dos agentes críticos

Acrescente ao relatório final as avaliações individuais dos agentes críticos.

Cada relatório deverá apresentar:

* Responsável pela avaliação.
* Módulo avaliado.
* Critérios utilizados.
* Versões inspecionadas.
* Problemas encontrados.
* Evidências coletadas.
* Correções solicitadas.
* Resultado das reavaliações.
* Estado final dos critérios de aceite.

O relatório deverá permitir identificar quais funcionalidades foram aprovadas e quais permaneceram com limitações.

## 24.2. Relatório de evolução visual

Apresente o resultado das comparações entre:

A imagem fornecida pelo usuário.

A primeira versão renderizada.

As versões intermediárias relevantes.

A versão final.

Inclua os resultados das avaliações às cegas.

Identifique quais características visuais evoluíram e quais diferenças permaneceram em relação à referência.

Não apresente uma captura gerada artificialmente como se tivesse sido produzida pelo motor gráfico do jogo.

## 24.3. Relatório de qualidade geral

O agente crítico geral deverá produzir uma avaliação final integrada.

A avaliação deverá abordar a experiência completa de corrida, incluindo controles, joystick, física, adversários, circuito, câmeras, gráficos, HUD, áudio, desempenho e estabilidade.

A conclusão deverá ser sustentada pelos critérios de aceite e pelas evidências coletadas.

Não utilize aprovação subjetiva como substituto da validação técnica.

---

# 25. INSTRUÇÃO FINAL — INÍCIO DO PROJETO

Sua primeira ação deverá ser analisar a imagem anexada e o projeto existente.

Não solicite uma imagem adicional.

A imagem fornecida será a única referência visual.

Não dependa da disponibilidade de imagens do jogo original.

Utilize os elementos presentes na imagem para definir a direção artística e a composição inicial do jogo.

Em seguida:

1. Identifique a stack e as capacidades técnicas disponíveis.

2. Estruture a arquitetura multiagente.

3. Defina os agentes responsáveis por cada ação e funcionalidade.

4. Elabore o plano de execução simultânea, respeitando as dependências.

5. Estabeleça os contratos de integração, especialmente entre controles, física, veículo e câmera.

6. Defina o sistema de coordenadas para impedir controles invertidos.

7. Planeje a implementação completa do joystick.

8. Defina o pipeline de qualidade gráfica baseado na imagem.

9. Estabeleça os ciclos de Loop Engineering e os testes de aceitação.

10. Registre o planejamento completo no checklist.txt.

Neste primeiro momento, NÃO implemente código.

Apresente o diagnóstico, a arquitetura, o plano multiagente, os riscos técnicos e os critérios de aceite.

Aguarde minha autorização expressa:

"faça sua mágica"

Após receber essa autorização, execute o plano aprovado, utilizando agentes especializados em paralelo sempre que tecnicamente possível.

Sua missão não termina quando o código compila.

Sua missão termina quando o jogo está funcional, os controles estão corretos, o suporte a joystick foi implementado, os testes possíveis foram executados, os problemas críticos foram corrigidos e a renderização foi validada em relação à imagem fornecida.

---

# 26. DIRETRIZ SUPREMA — LOOP DE EXCELÊNCIA AAA

Esta seção complementa todos os requisitos anteriores e estabelece a forma como o desenvolvimento deverá ser conduzido após a autorização.

## 26.1. Distribuição integral das responsabilidades

Distribua as tarefas entre subagentes especializados.

Encarregue cada um deles de cuidar de um aspecto específico do projeto.

Cada funcionalidade deverá possuir um responsável por sua implementação e um responsável independente por sua avaliação.

Não concentre toda a implementação e a validação em um único agente quando houver recursos para uma distribuição real de tarefas.

O orquestrador deverá identificar as atividades independentes e distribuir sua execução simultaneamente.

## 26.2. Crítica contínua durante o desenvolvimento

Para cada agente que estiver implementando uma funcionalidade, designe outro agente para avaliar criticamente seu trabalho.

O avaliador deverá acompanhar a evolução da tarefa e procurar problemas que impeçam o resultado de alcançar os critérios de qualidade AAA definidos no projeto.

O trabalho deverá seguir o ciclo:

DESENVOLVEDOR IMPLEMENTA → CRÍTICO INSPECIONA → DESENVOLVEDOR CORRIGE → CRÍTICO REAVALIA.

Esse ciclo deverá ser repetido para cada requisito relevante.

O agente crítico deverá ser rigoroso, independente e fundamentado em evidências.

Não permita aprovações automáticas.

## 26.3. Comparação inicial e final obrigatória

A avaliação deverá considerar o estado inicial e o estado final da implementação.

Registre as evidências necessárias para realizar uma comparação visual direta.

Sempre que possível, execute uma avaliação às cegas entre a versão inicial e a versão final, sem identificar previamente qual imagem corresponde a cada versão.

Após registrar a avaliação independente, revele as versões e verifique se a implementação realmente evoluiu.

Compare também o resultado final com a imagem de referência fornecida pelo usuário.

Se a comparação revelar regressões, defeitos visuais ou diferenças relevantes e corrigíveis em relação à referência, encaminhe o resultado para uma nova rodada de desenvolvimento.

## 26.4. Meta de excelência visual e funcional

O objetivo é produzir uma entrega que impressione os agentes avaliadores pela qualidade visual, pela experiência de condução e pela consistência técnica.

Entretanto, não considere uma manifestação subjetiva de satisfação como condição suficiente para aprovação.

Cada agente deverá justificar sua avaliação com evidências.

O resultado deverá cumprir os requisitos funcionais, apresentar qualidade visual coerente com a referência e proporcionar uma experiência de corrida convincente.

Continue o ciclo de aprimoramento enquanto existirem problemas concretos que impeçam o atendimento dos critérios de aceite.

## 26.5. Modelo e esforço de execução

Configure os agentes para utilizar GPT-6 Luna com o esforço máximo de raciocínio, se essa combinação estiver efetivamente disponível no ambiente.

Aplique a configuração aos agentes desenvolvedores, críticos e ao orquestrador, conforme as capacidades reais da ferramenta.

Caso o modelo ou o nível de esforço solicitado não esteja disponível, utilize a configuração de maior capacidade suportada e registre a substituição.

A qualidade do projeto deverá continuar sendo verificada por testes e evidências reais, independentemente do modelo utilizado.

## 26.6. Execução persistente após autorização

Após receber a autorização "faça sua mágica", execute o plano aprovado.

Inicie os agentes independentes em paralelo sempre que o ambiente permitir.

Mantenha o Loop Engineering ativo durante o desenvolvimento.

Após cada rodada de implementação, realize inspeções, testes e comparações.

Encaminhe os problemas encontrados aos agentes responsáveis.

Reexecute as avaliações depois das correções.

Não encerre o desenvolvimento apenas porque uma versão visualmente simples está funcionando.

Não apresente como resultado final uma implementação que possua falhas críticas conhecidas.

Se o ambiente interromper a execução ou não permitir a conclusão de determinada atividade, registre o progresso real, as pendências e as condições necessárias para a retomada.

Não afirme que agentes continuarão trabalhando depois da interrupção caso não exista um mecanismo de execução persistente.

## 26.7. Padrão de entrega esperado

O resultado final deverá oferecer uma experiência de corrida tridimensional completa e funcional.

O jogo deverá apresentar:

* Qualidade gráfica compatível com a direção artística da imagem de referência.
* Veículo visualmente detalhado.
* Circuito tridimensional completo.
* Física arcade convincente.
* Controles de teclado corretos.
* Suporte real a joystick.
* Adversários funcionais.
* Sistema de corrida completo.
* Interface profissional.
* Câmeras estáveis.
* Iluminação e materiais adequados.
* Áudio integrado à jogabilidade.
* Desempenho compatível com a plataforma.
* Ausência de defeitos críticos conhecidos.
* Evidências de testes e validação visual.

O orquestrador deverá integrar todos os módulos, executar a validação final e registrar os resultados.

A execução somente poderá ser considerada concluída quando os critérios de aceite estiverem atendidos ou quando eventuais limitações impeditivas estiverem claramente identificadas, sem declarar como concluídos os requisitos pendentes.

---

# 27. COMANDO DEFINITIVO DE EXECUÇÃO

Ao receber a autorização:

"faça sua mágica"

Execute integralmente o plano aprovado.

Utilize Loop Engineering.

Distribua as tarefas entre os subagentes.

Execute os trabalhos independentes simultaneamente.

Associe cada desenvolvedor a um agente crítico independente.

Faça cada agente crítico avaliar rigorosamente a funcionalidade sob sua responsabilidade.

Compare a implementação inicial com os resultados das melhorias.

Execute comparações visuais diretas e às cegas.

Utilize a imagem anexada como referência para a qualidade gráfica.

Corrija controles invertidos.

Valide o suporte a joystick.

Aprimore a física, a renderização, o circuito, o veículo, as câmeras, os adversários, o HUD e a experiência completa de corrida.

Submeta os resultados às avaliações críticas.

Repita os ciclos de desenvolvimento, inspeção, correção e validação até atender aos critérios de aceite verificáveis.

Utilize GPT-6 Luna com esforço máximo quando essa configuração estiver disponível; caso contrário, utilize a maior capacidade efetivamente suportada.

Não substitua implementação real por simulação, descrição textual ou imagens geradas fora do motor gráfico.

Não apresente relatórios fictícios de agentes, testes ou comparações.

Não considere a demanda concluída apenas porque o jogo consegue executar.

O objetivo é entregar um jogo de corrida 3D completo, com jogabilidade funcional, qualidade visual contemporânea, controles corretos, suporte a joystick e uma experiência integrada que corresponda ao padrão de excelência estabelecido neste prompt.

