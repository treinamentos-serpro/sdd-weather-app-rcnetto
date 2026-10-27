# Backlog de Tarefas — Weather App

Backlog revisado para P5.2 e P5.3, derivado de
[plans/weather-app-plan.md](../plans/weather-app-plan.md) e rastreado para
[specs/weather-app-spec.md](../specs/weather-app-spec.md). As tarefas estão
organizadas por entrega e em ordem de dependência. Cada tarefa limita o escopo
a uma unidade testável, indica arquivos prováveis e apresenta critérios
verificáveis. Os requisitos listados são a rastreabilidade primária; cenários
relacionados da spec também se aplicam.

Rastreabilidade da entrega de UI: **P6.3** → T-22 + T-04/T-28;
**P6.4** → T-18/T-42 + T-05/T-29;
**P6.5** → T-20/T-44 + T-06 (datas civis); teclado/unidades → T-46.
Componentes e testes desta fatia são standalone; rede/hooks, estados assíncronos,
expansão horária (T-21) e conclusão integral de produção (T-26) permanecem pendentes.
P6.7 integrou a UI offline (histórico), substituída por P7.5 abaixo. P7.1–P7.4
entregam serviços/hook; P7.5 conecta App sem concluir todo T-26/backlog.

## Entrega 1 — Tipos e fundação

### T-01 — Criar composição e entrada React

- **Descrição:** Criar a raiz da aplicação e montar o componente principal no
  ponto de entrada React.
- **Critérios de aceite:**
  - `pnpm dev` inicia sem erro de compilação e renderiza um `<main>` com
    cabeçalho visível de Weather App no elemento raiz.
  - `pnpm build` termina com código zero.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.
- **Tipo:** Infra
- **Requisitos:** Base técnica do plano.

### T-02 — Carregar estilos globais e Tailwind

- **Descrição:** Configurar o CSS global mínimo e importá-lo no ponto de entrada.
- **Critérios de aceite:**
  - Classes Tailwind usadas pela aplicação são geradas no build.
  - O CSS global é carregado uma única vez pela entrada da aplicação.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/styles/index.css`, `src/main.tsx`.
- **Tipo:** Infra
- **Requisitos:** RNF-01, RNF-05.

### T-03 — Definir contratos meteorológicos compartilhados

- **Descrição:** Declarar os modelos normalizados usados entre UI, hook e
  serviços.
- **Critérios de aceite:**
  - O módulo exporta `Unit`, `City`, `CurrentWeather`, `HourlyForecast`,
    `ForecastDay` e `WeatherData` com os campos definidos no plano, incluindo
    `current.precipitationMm`,
    `current.pressureHpa` (superfície) e
    `ForecastDay.precipitationProbabilityPercent`, todos `number | null`.
  - Valores de dados opcionais/incertos são representáveis sem valores
    substitutos, e o módulo não importa React nem serviços.
  - `pnpm build` passa em modo TypeScript strict.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data
- **Requisitos:** RF-01, RF-02, RF-03, RF-08.

A fixture determinística deve incluir precipitação mm ≥ 0, pressão de superfície
hPa > 0 e probabilidade diária de chuva entre 0 e 100 %, preservando datas e horas.
Na normalização futura, validar esses domínios e finitude por campo (T-09/T-12);
valores inválidos viram `null`, nunca zero inventado.

## Entrega 2 — Funções puras

### T-04 — Implementar conversão e arredondamento de temperatura

- **Descrição:** Criar a função pura que apresenta uma temperatura Celsius em
  Celsius ou Fahrenheit, arredondada conforme a regra do produto.
- **Critérios de aceite:**
  - Celsius é apresentado sem conversão; Fahrenheit usa `C × 9/5 + 32`.
  - O resultado é arredondado ao inteiro mais próximo e empate de 0,5 é para
    longe de zero, inclusive para valores negativos.
  - A função não altera nem armazena o valor Celsius recebido.
- **Dependências:** T-03
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data
- **Requisitos:** RF-04.

### T-05 — Mapear códigos WMO para descrições em português

- **Descrição:** Implementar a tabela/função de descrição das condições WMO.
- **Critérios de aceite:**
  - Cada código WMO suportado pelo mapeamento retorna descrição em
    português do Brasil.
  - Código desconhecido não produz descrição meteorológica inventada e pode
    ser apresentado como indisponível.
- **Dependências:** T-03
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data
- **Requisitos:** RF-02, RF-03, RNF-07.

### T-06 — Implementar formatação de datas e horas por fuso

- **Descrição:** Criar utilitários puros de apresentação de datas e horários
  locais da cidade.
- **Critérios de aceite:**
  - A data é apresentada como DD/MM/AAAA e a hora em formato de 24 horas e
    pt-BR.
  - A formatação aceita fuso IANA e não usa implicitamente o fuso do dispositivo.
  - Timestamp inválido não é formatado como horário válido.
- **Dependências:** T-03
- **Arquivos prováveis:** `src/lib/dateTime.ts`.
- **Tipo:** Data
- **Requisitos:** RF-03, RF-05, RNF-06, RNF-07.

## Entrega 3 — Services e normalização

### T-07 — Consultar o serviço de geocoding

- **Descrição:** Implementar chamada HTTP ao endpoint oficial de Geocoding e
  mapear resultados válidos para `City`.
- **Critérios de aceite:**
  - Request inclui `name` sem espaços externos, `count=10`, `language=pt` e
    `format=json`.
  - Mapeia `admin1` para `region`, preserva ordem e retorna no máximo 10
    localidades; ausência de `results` representa lista vazia.
  - HTTP não-OK, falha de rede, JSON ilegível ou estrutura inválida rejeitam a
    operação com erro tratável pela aplicação.
  - Um request sem resposta é encerrado em até 10 segundos; não há retry ou
    cache automático no serviço.
- **Dependências:** T-03
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data
- **Requisitos:** RF-01, RF-06, RF-07.

### T-08 — Implementar request do Forecast Open-Meteo

- **Descrição:** Fazer a chamada HTTP de Forecast usando coordenadas e
  parâmetros definidos no plano.
- **Critérios de aceite:**
  - Request inclui latitude/longitude, campos `current`, `daily`, `hourly`,
    `forecast_days=5`, `timezone=auto`, `temperature_unit=celsius` e
    `wind_speed_unit=kmh`.
  - HTTP não-OK, rede, JSON ilegível e timeout rejeitam a operação.
  - Request sem resposta é encerrado em até 10 segundos; o serviço não executa
    polling, retry automático ou cache.
- **Dependências:** T-03
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data
- **Requisitos:** RF-02, RF-03, RF-06, RF-08.

### T-09 — Normalizar dados meteorológicos da resposta

- **Descrição:** Mapear o payload externo Forecast para os contratos
  `WeatherData`, preservando datas, fuso e campos parciais.
- **Critérios de aceite:**
  - `timezone`, dados atuais, séries diárias e horárias são mapeados dos índices
  correspondentes.
  - Máximas/mínimas atuais correspondem à data local de `current.time`; cada
    `daily.time` preserva sua data e horas são agrupadas pela data local.
  - Valor ausente, nulo ou fora do domínio vira `null` somente para o campo
    correspondente; estruturas ilegíveis falham.
  - `forecastUpdatedAt` é `null`; `generationtime_ms` não é usado como
    timestamp.
- **Dependências:** T-03, T-06, T-08
- **Arquivos prováveis:** `src/services/weatherMappers.ts`.
- **Tipo:** Data
- **Requisitos:** RF-02, RF-03, RF-05, RF-08, RNF-06.

## Entrega 4 — Hook e estado

### T-10 — Gerenciar estado e validação da busca no hook

- **Descrição:** Criar estado de busca e ação de confirmação, incluindo
  validação de texto antes do serviço.
- **Critérios de aceite:**
  - Busca inicia em `idle` e representa `loading`, `success`, `empty` e `error`
    de forma explícita.
  - Texto vazio/somente espaços e texto com caractere de controle não chamam o
    serviço; o campo segue editável e pontuação legítima é mantida.
  - Busca só é executada pela ação explícita de confirmação.
- **Dependências:** T-07
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data
- **Requisitos:** RF-01, RF-06, RF-07.

### T-11 — Descartar respostas tardias de geocoding

- **Descrição:** Proteger o estado da busca para que somente a tentativa mais
  recente possa atualizá-lo.
- **Critérios de aceite:**
  - Ao concluir B antes de A, a resposta tardia de A não substitui nem mistura
    resultados de B.
  - Depois de timeout e retry, a resposta da tentativa expirada não altera o
    estado da nova tentativa.
- **Dependências:** T-10
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data
- **Requisitos:** RF-01, RF-06.

### T-12 — Integrar seleção de cidade ao estado de Forecast

- **Descrição:** Fazer o hook consultar Forecast para as coordenadas da
  localidade escolhida.
- **Critérios de aceite:**
  - Forecast começa automaticamente para o primeiro resultado e, na seleção
    posterior, recebe latitude/longitude da cidade selecionada, não somente o nome.
  - Estado Forecast é separado do estado da busca.
  - Resposta parcial com pelo menos um dado utilizável é `success`; ausência de
    dados utilizáveis é `empty`.
- **Dependências:** T-08, T-09, T-10
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data
- **Requisitos:** RF-01, RF-02, RF-03, RF-08.

### T-13 — Proteger Forecast contra resposta tardia e timeout

- **Descrição:** Garantir que uma consulta anterior ou expirada não substitua
  dados de uma consulta posterior.
- **Critérios de aceite:**
  - Após selecionar cidade B enquanto A está pendente, resposta tardia de A
    não substitui nem mistura os dados de B.
  - Após timeout e retry, a primeira resposta não altera o estado da segunda
    tentativa.
  - Erro/timeout mantém retry manual para a mesma cidade e não mostra cache
    como atual.
- **Dependências:** T-12
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data
- **Requisitos:** RF-06, RF-08.

### T-14 — Manter unidade de temperatura no estado da visita

- **Descrição:** Adicionar Celsius inicial e ação de alternância ao estado do
  hook, sem persistência.
- **Critérios de aceite:**
  - Cada montagem inicia com `celsius`; a ação alterna entre `celsius` e
    `fahrenheit`.
  - Troca de cidade durante a mesma montagem conserva unidade.
  - Hook não lê nem grava unidade em localStorage, cookies ou outro storage.
- **Dependências:** T-04, T-12
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data
- **Requisitos:** RF-04, RNF-08.

## Entrega 5 — Componentes de interface

### T-15 — Implementar formulário acessível de busca

- **Descrição:** Criar campo editável e formulário que envia a busca somente
  sob confirmação explícita.
- **Critérios de aceite:**
  - O formulário possui label associado e submissão por botão e Enter.
  - Digitar sem submeter não invoca callback de busca.
  - Texto inválido pode ser corrigido sem perder o foco do campo.
- **Dependências:** T-10
- **Arquivos prováveis:** `src/components/SearchForm.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-01, RF-07, RNF-05.

### T-16 — Implementar seleção de resultados de cidade

- **Descrição:** Exibir resultados de geocoding e comunicar a cidade escolhida
  ao hook.
- **Critérios de aceite:**
  - Cada resultado mostra nome e país, e região/estado quando disponível.
  - Resultados mantêm a ordem recebida e nunca mostram mais de 10 opções.
  - Cada opção é acionável por teclado e passa ao callback o `id` e as
    coordenadas exatos daquela cidade.
- **Dependências:** T-03, T-10
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-01, RNF-05.

### T-17 — Comunicar estados de consulta e oferecer retry

- **Descrição:** Criar uma apresentação reutilizável de estados assíncronos
  para busca de cidades e consulta meteorológica.
- **Critérios de aceite:**
  - `loading`, `empty` e `error` têm conteúdo visual distinto; busca vazia
    comunica que nenhuma cidade foi encontrada.
  - A ação de retry aparece somente em erro e chama o callback da mesma
    operação (busca ou Forecast) com o contexto confirmado.
  - Loading é anunciável por tecnologia assistiva; erro e vazio têm texto
    acessível.
- **Dependências:** T-10, T-12
- **Arquivos prováveis:** `src/components/AsyncStatus.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-06, RF-07, RNF-05.

### T-18 — Implementar painel de condições atuais

- **Descrição:** Renderizar os indicadores atuais e seus estados indisponíveis.
- **Critérios de aceite:**
  - Quando presentes, são mostrados condição, temperatura, sensação térmica,
    máxima/mínima do dia local, umidade %, vento km/h, precipitação mm e
    pressão de superfície hPa (P6.4, RF-02). Zeros são preservados.
  - Campo `null` é marcado como indisponível individualmente; sem temperatura
    atual, o painel informa que as condições atuais não estão disponíveis.
  - Condição usa descrição pt-BR e código desconhecido não recebe descrição
    inventada.
- **Dependências:** T-05, T-12
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-02, RF-08, RNF-07.

### T-19 — Implementar indicação de atualidade da observação

- **Descrição:** Exibir timestamp local e sinalizar observações antigas ou
  timestamps não confiáveis.
- **Critérios de aceite:**
  - Timestamp válido é exibido no fuso IANA da cidade.
  - Idade acima de 60 minutos, calculada em relação ao UTC atual, gera aviso de
    desatualização.
  - Timestamp ausente, inválido ou futuro é identificado como indisponível,
    nunca como recente.
- **Dependências:** T-06, T-12
- **Arquivos prováveis:** `src/components/ObservationFreshness.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-05, RNF-06.

### T-20 — Implementar resumos dos cinco dias

- **Descrição:** Exibir lista diária de hoje e dos quatro dias seguintes com
  seus estados parciais.
- **Critérios de aceite:**
  - A lista renderiza exatamente cinco dias, na ordem e com as datas recebidas.
  - Cada cartão mostra ícone decorativo, condição, máxima/mínima e probabilidade
    máxima diária de chuva % (P6.5, RF-03); campos `null` são indicados
    como indisponíveis sem deslocar datas.
  - Descrições são em português e temperaturas incluem a unidade selecionada.
  - A previsão informa que seu horário de atualização não foi fornecido.
  - Props: lista `forecastDays: ForecastDay[], unit: Unit`; cartão `day: ForecastDay, unit: Unit`.
  - Grid `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`, estado vazio e dia
    totalmente indisponível explícitos; data estrita pt-BR, UTC explícito, sem
    deslocamentos pelo fuso do dispositivo e sem Hoje inferido por índice.
- **Dependências:** T-05, T-12
- **Arquivos prováveis:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-03, RF-08, RNF-07.

### T-21 — Implementar expansão de detalhes horários

- **Descrição:** Permitir abrir individualmente os pontos horários de cada dia.
- **Critérios de aceite:**
  - Cada dia possui controle de expansão acessível por teclado e estado
    expandido/collapsed anunciado.
  - Expandir um dia apresenta somente seus pontos horários, com hora local,
    condição e temperatura.
  - Horários repetidos são distinguidos pelo instante; horários inexistentes
    não são gerados pela UI.
- **Dependências:** T-06, T-12, T-20
- **Arquivos prováveis:** `src/components/HourlyForecast.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-03, RNF-05, RNF-07.

### T-22 — Implementar controle acessível de unidade

- **Descrição:** Criar controle para selecionar Celsius ou Fahrenheit.
- **Critérios de aceite:**
  - O controle expõe as opções °C e °F com nome acessível e seleção
    programaticamente identificável.
  - Ativar cada opção chama callback com a unidade correspondente.
  - P6.3: `UnitToggle({ unit, onChange })`, controlado sem estado duplicado,
    dois botões num grupo com nome acessível e `aria-pressed`, Tab/Enter/Space.
- **Dependências:** T-14
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-04, RNF-05.

### T-23 — Implementar atribuição visível ao Open-Meteo

- **Descrição:** Criar um componente reutilizável de atribuição à fonte dos
  dados meteorológicos.
- **Critérios de aceite:**
  - O componente mostra Open-Meteo como fonte e contém link para
    `https://open-meteo.com/`.
  - O componente pode ser renderizado sem depender de hook ou chamada de rede.
- **Dependências:** T-18, T-20
- **Arquivos prováveis:** `src/components/WeatherAttribution.tsx`.
- **Tipo:** UI
- **Requisitos:** RNF-09.

### T-24 — Tornar os estados assíncronos anunciáveis

- **Descrição:** Implementar a apresentação acessível e reutilizável dos
  estados assíncronos.
- **Critérios de aceite:**
  - Loading e vazio usam região `role="status"`; erro usa `role="alert"`.
  - Erro e resultado vazio têm texto acessível e não dependem apenas de cor ou
    ícone.
  - Retry recebe um nome acessível por operação e chama somente o callback
    recebido por props.
- **Dependências:** T-12, T-17
- **Arquivos prováveis:** `src/components/AsyncStatus.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-06, RF-07, RNF-05.

## Entrega 6 — Integração da aplicação

### T-25 — Integrar a primeira fatia de busca e seleção

- **Descrição:** Conectar formulário, resultados e estados de busca em `App`
  para entregar uma primeira experiência utilizável de pesquisa de cidades.
- **Critérios de aceite:**
  - A pessoa pode confirmar busca, ver resultados identificados por cidade,
    região/estado e país, selecionar uma localidade e ver a seleção refletida
    na tela.
  - Busca vazia, loading, vazio e erro são comunicados; retry repete a mesma
    consulta.
  - O fluxo seleciona automaticamente o primeiro resultado e permite seleção
    posterior sem perder a lista.
- **Dependências:** T-02, T-10, T-11, T-15, T-16, T-17, T-24
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-01, RF-06, RF-07.

### P6.7 — Compor layout demonstrativo offline (histórico, substituído por P7.5)

- **Escopo:** layout dark glass mobile-first com marca, SearchBar e UnitToggle
  no header; integrar `MOCK_WEATHER` a CurrentWeather e ForecastList no sucesso.
- **Critérios de aceite:**
  - Seletor acessível rotulado modo demonstração com cinco opções pt-BR:
    inicial, carregando, sem resultados, erro e sucesso; começa em sucesso.
  - Busca local somente por nome completo São Paulo, com trim e comparação
    sem caixa/acentos, sem normalizar pontuação nem renomear a fixture.
    Outras cidades mostram vazio; digitar sem confirmar não muda o conteúdo.
  - Idle orienta pesquisa; loading e empty usam status distintos (empty inclui
    consulta quando houver); erro demonstrativo usa alert e retry manual.
    Loading desabilita SearchBar, mas o seletor permite sair desse estado.
  - Retry local usa último termo confirmado ou cidade fixture se não houver,
    resolve sucesso/vazio e preserva campo e unidade. Celsius inicial; troca
    converte clima e cinco dias ao renderizar sem modificar os dados.
  - Atribuição Open-Meteo com link externo seguro e observação fixa explicitamente
    não atual; sem rede, timers, hook/API, detalhes horários ou relógio de stale.
  - Testes de integração em `tests/unit/App.test.tsx` cobrem estados exclusivos,
    busca, retry, unidade, atribuição e ausência de fetch.
- **Limite:** não substitui os critérios de produção de T-26 abaixo.

### T-26 — Integrar clima e previsão à aplicação

- **Descrição:** Compor em `App` a seleção da cidade, a consulta de Forecast,
  unidade, atribuição e as visões meteorológicas.
- **Critérios de aceite:**
  - A cidade selecionada aciona Forecast com sua identidade/coordenadas e a
    tela apresenta condições atuais e previsão correspondentes.
  - Busca e Forecast exibem estados independentes; retry repete a operação
    correta e falhas não mostram dados em cache como atuais.
  - Unidade, atribuição Open-Meteo e indicação de atualização estão presentes
    nas visões correspondentes.
- **Dependências:** T-13, T-14, T-18, T-19, T-20, T-21, T-22, T-23, T-25
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08,
  RNF-09.

### T-27 — Ajustar layout responsivo da aplicação

- **Descrição:** Aplicar layout responsivo sem rolagem horizontal nos
  breakpoints da spec.
- **Critérios de aceite:**
  - Em larguras 320, 375, 768, 1024 e 1440 CSS px, `scrollWidth` do documento
    não excede `clientWidth`.
  - Busca, seleção, condições atuais, previsão de cinco dias e unidade não
    cortam texto ou controles nessas larguras.
- **Dependências:** T-26
- **Arquivos prováveis:** `src/styles/index.css`.
- **Tipo:** UI
- **Requisitos:** RNF-01.

## Entrega 7 — Testes unitários, de componentes e E2E

### T-28 — Testar conversão e arredondamento de temperatura

- **Descrição:** Cobrir a função de temperatura com testes unitários puros.
- **Critérios de aceite:**
  - Vitest valida valores conhecidos em Celsius e Fahrenheit, positivos e
    negativos, incluindo empates de 0,5.
  - Os testes verificam conversão repetida sempre a partir do Celsius original.
  - O teste não acessa DOM nem rede.
- **Dependências:** T-04
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-04.

### T-29 — Testar descrições de códigos WMO

- **Descrição:** Verificar códigos mapeados e desconhecidos.
- **Critérios de aceite:**
  - Vitest valida ao menos um código por classe de condição implementada e um
    código desconhecido.
  - As descrições verificadas estão em português do Brasil.
- **Dependências:** T-05
- **Arquivos prováveis:** `tests/unit/lib/weatherCodes.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-02, RF-03, RNF-07.

### T-30 — Testar formatação de datas e horas por fuso

- **Descrição:** Cobrir formatação local, mudança de dia e casos sazonais.
- **Critérios de aceite:**
  - Testes comparam a mesma referência UTC formatada em dois fusos diferentes.
  - Testes cobrem mudança de data local, timestamp inválido e transição
    sazonal, incluindo hora local repetida quando aplicável.
  - Os resultados esperados seguem DD/MM/AAAA e 24 horas.
- **Dependências:** T-06
- **Arquivos prováveis:** `tests/unit/lib/dateTime.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-03, RF-05, RNF-06, RNF-07.

### T-31 — Testar request e mapeamento de geocoding

- **Descrição:** Testar contrato HTTP e normalização do serviço com `fetch`
  mockado.
- **Critérios de aceite:**
  - Vitest verifica endpoint e os quatro parâmetros requeridos.
  - Fixtures inline cobrem resposta válida, `results` ausente, região ausente,
    ordem preservada e truncamento em 10.
  - Testes não fazem conexão com Open-Meteo.
- **Dependências:** T-07
- **Arquivos prováveis:** `tests/unit/services/weatherService.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-01.

### T-32 — Testar falhas e timeout de geocoding

- **Descrição:** Verificar os modos de falha do serviço de busca.
- **Critérios de aceite:**
  - `fetch` mockado cobre HTTP não-OK, rejeição de rede, JSON ilegível e
    estrutura inválida; timer controlado cobre timeout de 10 segundos.
  - Cada cenário rejeita com erro; nenhum cenário retorna sucesso vazio como
    fallback.
- **Dependências:** T-07
- **Arquivos prováveis:** `tests/unit/services/weatherService.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-06, RF-07.

### T-33 — Testar validação e estados da busca no hook

- **Descrição:** Verificar transições e validação do hook com serviço mockado.
- **Critérios de aceite:**
  - Vitest/Testing Library verifica `idle → loading → success`, `empty` e
    `error`.
  - Busca vazia ou com caractere de controle não chama o mock; busca válida
    envia o termo sem espaços externos e preserva pontuação.
- **Dependências:** T-10
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-01, RF-07.

### T-34 — Testar concorrência e retry de geocoding

- **Descrição:** Testar ordenação concorrente e retry no hook de busca.
- **Critérios de aceite:**
  - Teste com promises controladas conclui busca B antes de A e confirma que B
    permanece no estado.
  - Teste de retry após timeout confirma que a resposta antiga não sobrescreve
    o novo resultado.
- **Dependências:** T-11
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-01, RF-06.

### T-35 — Testar formulário de busca

- **Descrição:** Cobrir submissão explícita e acessibilidade básica do
  formulário.
- **Critérios de aceite:**
  - Testing Library verifica submissão por botão e Enter, e ausência de callback
    durante digitação.
  - Campo é encontrado por label acessível.
- **Dependências:** T-15
- **Arquivos prováveis:** `tests/unit/components/SearchForm.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-01, RF-07, RNF-05.

### T-36 — Testar seleção e identificação de cidades

- **Descrição:** Verificar apresentação e seleção exata de resultados.
- **Critérios de aceite:**
  - Testing Library valida nome/país/região, preservação da ordem e seleção
    exata em um conjunto com cidades homônimas.
  - Uma cidade sem região continua selecionável e não exibe região inventada.
- **Dependências:** T-16
- **Arquivos prováveis:** `tests/unit/components/CityResults.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-01.

### T-37 — Testar componentes nos estados loading, erro e vazio

- **Descrição:** Testar explicitamente o componente de estado assíncrono para
  busca e Forecast em loading, erro e vazio.
- **Critérios de aceite:**
  - Testing Library renderiza o componente em `loading`, `error` e `empty` para
    cada tipo de operação e verifica conteúdo/role acessível esperado.
  - Estado loading e vazio usam `role="status"`; erro usa `role="alert"`.
  - Ativar retry chama o callback da operação indicada; não há retry no estado
    vazio.
- **Dependências:** T-17
- **Arquivos prováveis:** `tests/unit/components/AsyncStatus.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-06, RF-07, RNF-05.

### T-38 — Testar request e falhas do Forecast

- **Descrição:** Verificar contrato HTTP e modos de falha do serviço.
- **Critérios de aceite:**
  - `fetch` mockado confirma endpoint, coordenadas e todos os parâmetros
    requeridos.
  - `fetch` mockado cobre HTTP não-OK, falha de rede e JSON ilegível; timer
    controlado cobre timeout de até 10 segundos.
  - Nenhum teste acessa Open-Meteo.
- **Dependências:** T-08
- **Arquivos prováveis:** `tests/unit/services/weatherService.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-06.

### T-39 — Testar normalização do Forecast

- **Descrição:** Cobrir mapeamento, associação paralela e dados incompletos
  com fixtures locais.
- **Critérios de aceite:**
  - Testes verificam associação de cada array pelo índice de `time` e
    correspondência de máximas/mínimas com a data atual local.
  - Testes cobrem timezone diferente do host, campos inválidos, dia ausente,
    arrays parciais e estrutura ilegível.
  - Datas dos dias seguintes não são deslocadas por campos ausentes.
- **Dependências:** T-09
- **Arquivos prováveis:** `tests/unit/services/weatherService.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-02, RF-03, RF-08.

### T-40 — Testar seleção e estados do Forecast no hook

- **Descrição:** Cobrir o fluxo normal e estados de Forecast com o serviço
  mockado.
- **Critérios de aceite:**
  - Testes verificam coordenadas exatas da cidade selecionada e ausência de
    request antes do retorno do Geocoding; depois consulta a primeira cidade
    automaticamente.
  - Testes verificam sucesso completo, sucesso parcial, vazio e erro.
  - Concluir/falhar Forecast não apaga o estado independente da busca.
- **Dependências:** T-12
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-01, RF-02, RF-03, RF-08.

### T-41 — Testar concorrência e retry do Forecast

- **Descrição:** Validar respostas tardias, timeout e recuperação manual.
- **Critérios de aceite:**
  - Promises controladas confirmam que uma resposta antiga não substitui a
    resposta da cidade/tentativa mais recente.
  - Timer controlado confirma encerramento em 10 segundos e retry para a mesma
    localidade.
- **Dependências:** T-13
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-06.

### T-42 — Testar painel de condições atuais

- **Descrição:** Cobrir apresentação de dados completos, parciais e
  indisponíveis.
- **Critérios de aceite:**
  - Testing Library verifica cada indicador e suas unidades com dados
    completos, incluindo precipitação mm, pressão de superfície hPa e zeros.
  - Teste com campos `null` confirma mensagens indisponíveis individuais e
    indisponibilidade geral quando falta temperatura atual.
- **Dependências:** T-18
- **Arquivos prováveis:** `tests/unit/components/CurrentWeather.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-02, RF-08.

### T-43 — Testar indicação de atualidade

- **Descrição:** Verificar os limites e casos inválidos de observação.
- **Critérios de aceite:**
  - Relógio controlado confirma observação com idade de até 60 minutos sem
    aviso e acima de 60 minutos com aviso.
  - Testes cobrem ausência, formato inválido, timestamp futuro e fusos distintos.
- **Dependências:** T-19
- **Arquivos prováveis:** `tests/unit/components/ObservationFreshness.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-05, RNF-06.

### T-44 — Testar resumos diários

- **Descrição:** Verificar cinco datas na ordem e representação de campos
  diários ausentes.
- **Critérios de aceite:**
  - Testing Library valida exatamente cinco datas e conteúdo de cada cartão,
    probabilidade de chuva % (inclusive zero/nulo), lista vazia e rerender °C/°F.
  - Fixture com valores indisponíveis conserva a data do dia e sinaliza apenas
    os campos afetados.
  - Teste verifica a comunicação de que o horário de atualização da previsão
    não foi fornecido.
- **Dependências:** T-20
- **Arquivos prováveis:** `tests/unit/components/ForecastList.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-03, RF-08.

### T-45 — Testar expansão e pontos horários

- **Descrição:** Verificar interação de expansão e associação ao dia escolhido.
- **Critérios de aceite:**
  - Testes abrem e fecham um dia por teclado e verificam seu estado acessível.
  - Ao expandir um dia, nenhum ponto de outra data é apresentado.
  - Testes verificam horário repetido distinguível e ausência de horas
    inventadas para o conteúdo recebido.
- **Dependências:** T-21
- **Arquivos prováveis:** `tests/unit/components/HourlyForecast.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-03, RNF-05.

### T-46 — Testar alternância de unidade na tela

- **Descrição:** Verificar propagação da unidade para toda temperatura
  apresentada, sem nova consulta.
- **Critérios de aceite:**
  - Testes verificam unidade em clima atual, resumos diários e detalhes
    horários, antes/depois de expansão e troca de cidade.
  - Alternar unidade não chama geocoding nem Forecast.
  - Nova montagem inicia em Celsius.
- **Dependências:** T-14, T-22, T-26
- **Arquivos prováveis:** `tests/unit/components/TemperatureUnitToggle.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-04.

### T-47 — Testar composição da tela

- **Descrição:** Validar o fluxo integrado entre busca, seleção, consulta e
  retry no limite da aplicação.
- **Critérios de aceite:**
  - Teste com serviços mockados completa busca, seleção e exibição do Forecast.
  - Teste de erro permite retry da operação apropriada sem apagar o estado da
    outra.
  - Nenhuma chamada de rede real é executada.
- **Dependências:** T-25, T-26
- **Arquivos prováveis:** `tests/unit/App.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-01, RF-02, RF-06, RF-07.

### T-48 — Testar atribuição do provedor

- **Descrição:** Verificar presença e destino do link de atribuição.
- **Critérios de aceite:**
  - Testing Library confirma texto Open-Meteo e `href` oficial em condição
    atual e previsão.
- **Dependências:** T-23, T-26
- **Arquivos prováveis:** `tests/unit/components/WeatherAttribution.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RNF-09.

### T-49 — Testar anúncios e nomes acessíveis dos estados

- **Descrição:** Verificar estrutura acessível dos indicadores e controles de
  estado.
- **Critérios de aceite:**
  - Testing Library encontra `role="status"` para loading/vazio e
    `role="alert"` para erro em busca e Forecast.
  - Botões de retry têm nome acessível que identifica busca ou consulta
    meteorológica.
- **Dependências:** T-24, T-26
- **Arquivos prováveis:** `tests/unit/components/AsyncStatus.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RNF-05.

### T-50 — Testar fluxo E2E de busca e seleção

- **Descrição:** Cobrir a busca confirmada, lista vazia e seleção entre
  localidades ambíguas com fixtures interceptadas.
- **Critérios de aceite:**
  - Playwright testa busca após confirmação, busca vazia sem request e
    resultado sem localidades.
  - Cenário com homônimos seleciona um resultado e confirma coordenadas
    correspondentes no request de Forecast.
  - Requests são interceptados; o teste não depende da API real.
- **Dependências:** T-25
- **Arquivos prováveis:** `tests/e2e/city-search.spec.ts`.
- **Tipo:** Test
- **Requisitos:** RF-01, RF-07.

### T-51 — Testar fluxo E2E meteorológico e retry

- **Descrição:** Cobrir condições atuais, previsão, retry e alternância de
  unidade no navegador.
- **Critérios de aceite:**
  - Playwright verifica indicadores atuais, exatamente cinco datas e expansão
    dos detalhes horários.
  - Cenário de falha seguido de retry conclui a consulta sem exibir cache como
    dado atual.
  - Alternância °C/°F altera as temperaturas visíveis sem aumentar o número
    de requests interceptados.
- **Dependências:** T-23, T-26
- **Arquivos prováveis:** `tests/e2e/weather-forecast.spec.ts`.
- **Tipo:** Test
- **Requisitos:** RF-02, RF-03, RF-04, RF-06, RNF-09.

### T-52 — Testar E2E do fluxo principal em viewport mobile

- **Descrição:** Executar o percurso principal da busca até a previsão com
  Playwright, incluindo viewport mobile e navegação por teclado.
- **Critérios de aceite:**
  - E2E percorre busca confirmada, seleção de cidade, condições atuais,
    previsão de cinco dias e expansão de detalhes horários com respostas
    interceptadas; não acessa API real.
  - O fluxo completo passa em viewport desktop de 1440 px e mobile de
    375 × 812 px, sem rolagem horizontal.
  - Em viewport mobile, busca, seleção, alternância de unidade e expansão
    horária são concluíveis por teclado.
- **Dependências:** T-26, T-27, T-50, T-51
- **Arquivos prováveis:** `tests/e2e/weather-main-flow-mobile.spec.ts`.
- **Tipo:** Test
- **Requisitos:** RNF-01, RNF-05.

## Entrega 8 — Hardening e prontidão para lançamento

### T-53 — Documentar privacidade e compartilhamento de consulta

- **Descrição:** Criar política informando o envio da consulta ao provedor e
  as práticas de privacidade da versão.
- **Critérios de aceite:**
  - Documento informa que busca/localização consultada é enviada ao Open-Meteo
    e descreve retenção conforme os termos publicados.
  - Documento declara ausência de conta, persistência local, analytics,
    identificadores e cookies não essenciais, e informa que a aplicação não
    coleta nem armazena IP para fins próprios; metadados de conexão podem ser
    processados pelo provedor conforme os termos dele.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `docs/privacy-policy.md`.
- **Tipo:** Infra
- **Requisitos:** RNF-08.

### T-54 — Validar compatibilidade de navegadores e leitores de tela

- **Descrição:** Executar revisão manual nos ambientes suportados e registrar
  resultados e bloqueadores.
- **Critérios de aceite:**
  - Fluxos principais são verificados na versão estável atual e anterior de
    Chrome, Edge, Firefox e Safari desktop, e versões atuais de Safari iOS e
    Chrome Android.
  - Revisão manual inclui NVDA/Firefox/Windows e VoiceOver/Safari/iOS para
    busca, consulta, retry e expansão.
  - Uma avaliação automatizada WCAG 2.2 AA e a revisão manual são registradas;
    violações confirmadas são resolvidas ou mantêm o lançamento bloqueado.
  - Resultado registra ambiente, fluxo, sucesso/falha e defeitos encontrados.
- **Dependências:** T-49, T-52
- **Arquivos prováveis:** `docs/validation/accessibility-compatibility.md`.
- **Tipo:** Test
- **Requisitos:** RNF-01, RNF-05.

### T-55 — Medir desempenho das operações meteorológicas

- **Descrição:** Medir o tempo de geocoding e Forecast em rede controlada e
  registrar os resultados.
- **Critérios de aceite:**
  - São obtidas 100 medições bem-sucedidas de geocoding e 100 de Forecast na
    rede de 10 Mbps down, 2 Mbps up e 100 ms RTT.
  - p95 de cada operação, medido da ação até conteúdo visível, é no máximo
    3 segundos; falhas e timeouts são reportados em separado.
  - Documento registra configuração da rede, amostras, p95 e falhas/timeout.
- **Dependências:** T-50, T-51
- **Arquivos prováveis:** `docs/validation/performance.md`.
- **Tipo:** Test
- **Requisitos:** RNF-03.

### T-56 — Configurar medição externa de disponibilidade

- **Descrição:** Configurar ou documentar monitoramento da disponibilidade da
  interface separado do provedor de clima.
- **Critérios de aceite:**
  - Verificação externa da capacidade de carregar a interface roda a cada
    minuto.
  - Relatório mensal calcula sucesso dividido pelo total de verificações e
    apresenta meta de 99,5%.
  - Falha do provedor meteorológico é registrada separadamente da
    indisponibilidade da interface.
- **Dependências:** T-01
- **Arquivos prováveis:** `docs/operations/availability-monitoring.md`.
- **Tipo:** Infra
- **Requisitos:** RNF-04.

### T-57 — Conduzir teste moderado de usabilidade

- **Descrição:** Medir conclusão da tarefa principal sem treinamento ou ajuda.
- **Critérios de aceite:**
  - Plano define antes das sessões os cenários e cidades e recruta 10
    participantes do público geral.
  - Pelo menos 9 de 10 concluem sem ajuda busca, consulta de condições atuais
    e identificação correta das cinco datas.
  - O registro não coleta a métrica por telemetria e descreve método,
    contagem de conclusão e impedimentos.
- **Dependências:** T-51, T-52
- **Arquivos prováveis:** `docs/validation/usability-test.md`.
- **Tipo:** Test
- **Requisitos:** RNF-02, RNF-08.

### T-58 — Verificar termos e limites do Open-Meteo antes do lançamento

- **Descrição:** Confirmar se o uso sem chave e a atribuição estão de acordo
  com as condições vigentes do provedor.
- **Critérios de aceite:**
  - Registro identifica os termos/limites consultados, data da revisão e
    decisão de conformidade para a implantação pretendida.
  - Se o uso sem chave não for permitido, a decisão de lançamento é bloqueada
    até configurar acesso permitido.
  - Nenhuma troca de provedor ou remoção de atribuição ocorre sem revisão da
    especificação.
- **Dependências:** T-23, T-53
- **Arquivos prováveis:** `docs/validation/provider-terms.md`.
- **Tipo:** Infra
- **Requisitos:** RNF-08, RNF-09.

### T-59 — Inspecionar privacidade da aplicação em execução

- **Descrição:** Verificar chamadas, cookies e armazenamento produzidos pelos
  fluxos funcionais no navegador.
- **Critérios de aceite:**
  - Com busca e Forecast executados, a inspeção não encontra chamadas de
    analytics nem identificadores persistentes; chamadas externas são somente
    as funcionais ao Open-Meteo e recursos necessários da aplicação.
  - Inspeção confirma ausência de cookies não essenciais e de cidade/unidade
    persistidas em localStorage, sessionStorage ou IndexedDB.
  - Resultado da inspeção e as exceções técnicas necessárias à conexão são
    documentados.
- **Dependências:** T-50, T-51, T-53
- **Arquivos prováveis:** `docs/validation/privacy-inspection.md`.
- **Tipo:** Test
- **Requisitos:** RNF-08.

## Priorização e tamanho relativo

Prioridade indica ordem de valor para a primeira versão: **P0** é essencial
para entregar o fluxo principal ou é bloqueador de lançamento; **P1** é
necessário para completar a qualidade/aceitação da versão após a primeira fatia
visível; **P2** é hardening operacional que pode ser implantado depois do
primeiro fluxo, sem dispensar o requisito correspondente. Tamanho é relativo,
não uma estimativa de duração: **P** é escopo contido; **M** envolve vários
casos/estados de uma responsabilidade; **G** envolve validação ampla ou
coordenação externa.

| Tarefa | Prioridade | Tamanho | Tarefa | Prioridade | Tamanho |
|---|---|---|---|---|---|
| T-01 | P0 | P | T-31 | P1 | P |
| T-02 | P0 | P | T-32 | P1 | M |
| T-03 | P0 | P | T-33 | P0 | M |
| T-04 | P0 | P | T-34 | P1 | M |
| T-05 | P0 | M | T-35 | P0 | P |
| T-06 | P0 | M | T-36 | P0 | P |
| T-07 | P0 | M | T-37 | P0 | P |
| T-08 | P0 | M | T-38 | P0 | M |
| T-09 | P0 | G | T-39 | P1 | M |
| T-10 | P0 | M | T-40 | P1 | M |
| T-11 | P1 | M | T-41 | P0 | M |
| T-12 | P0 | M | T-42 | P0 | M |
| T-13 | P1 | M | T-43 | P1 | P |
| T-14 | P0 | P | T-44 | P0 | P |
| T-15 | P0 | P | T-45 | P1 | M |
| T-16 | P0 | P | T-46 | P0 | M |
| T-17 | P0 | P | T-47 | P0 | M |
| T-18 | P0 | M | T-48 | P1 | P |
| T-19 | P0 | P | T-49 | P1 | P |
| T-20 | P0 | M | T-50 | P0 | M |
| T-21 | P1 | M | T-51 | P0 | M |
| T-22 | P1 | P | T-52 | P0 | G |
| T-23 | P0 | P | T-53 | P1 | G |
| T-24 | P0 | P | T-54 | P1 | G |
| T-25 | P0 | M | T-55 | P2 | M |
| T-26 | P0 | M | T-56 | P1 | M |
| T-27 | P1 | M | T-57 | P0 | M |
| T-28 | P0 | P | T-58 | P1 | M |
| T-29 | P1 | P | T-59 | P1 | M |
| T-30 | P1 | P |  |  |  |

## Sequência sugerida em fatias verticais

Cada fatia combina implementação com seus testes dedicados, mesmo que a seção
do backlog mantenha os testes agrupados depois da integração.

1. **Busca de cidade visível:** T-01, T-02, T-03, T-07, T-10, T-11, T-15,
   T-16, T-17, T-24 e T-25; validar com T-31, T-32, T-33, T-34, T-35, T-36,
   T-37 e T-50. Entrega busca confirmada, seleção sem confundir homônimos,
   estados loading/erro/vazio e retry.
2. **Condições atuais e previsão:** T-05, T-06, T-08, T-09, T-12, T-13,
   T-18, T-19, T-20, T-23 e T-26; validar com T-29, T-38, T-39, T-40, T-42,
   T-43, T-44, T-47 e T-51. Entrega uma consulta selecionada com condições
   atuais, atualização, cinco dias e atribuição.
3. **Unidades, horas e experiência mobile:** T-04, T-14, T-21, T-22 e T-27;
   validar com T-28, T-45, T-46 e T-52. Confirma todas as temperaturas em
   °C/°F, detalhes horários e fluxo principal no viewport mobile.
4. **Prontidão de lançamento:** T-53, T-54, T-55, T-56, T-57, T-58 e T-59.
   Completa validações de acessibilidade/compatibilidade, desempenho,
   disponibilidade, usabilidade, termos do provedor e privacidade.

## Rastreabilidade dos requisitos funcionais

As tarefas de implementação são listadas primeiro; tarefas de teste que
verificam os mesmos requisitos aparecem depois do ponto e vírgula.

| Requisito da spec | Tarefas correspondentes | Cobertura |
|---|---|---|
| RF-01 — Pesquisar e selecionar cidades | T-07, T-10, T-11, T-15, T-16, T-25; T-31, T-32, T-33, T-34, T-35, T-36, T-50 | Coberto: parâmetros e resultados, confirmação explícita, validação, identidade de homônimos, concorrência e retry. |
| RF-02 — Consultar condições atuais | T-08, T-09, T-12, T-18, T-26; T-38, T-39, T-42, T-47, T-51 | Coberto: indicadores, unidades, dados parciais e seleção da cidade. |
| RF-03 — Consultar previsão diária e horária | T-08, T-09, T-12, T-20, T-21, T-26; T-30, T-38, T-39, T-44, T-45, T-51 | Coberto: cinco dias, detalhes horários, fuso local e transições sazonais. |
| RF-04 — Alternar unidade de temperatura | T-04, T-14, T-22, T-26; T-28, T-46, T-51, T-52 | Coberto: Celsius inicial, conversão a partir do original, alcance global e ausência de request adicional. |
| RF-05 — Informar atualização dos dados | T-06, T-09, T-19, T-20; T-30, T-39, T-43, T-44 | Coberto: hora local da observação, aviso após 60 minutos e atualização de Forecast explicitamente indisponível. |
| RF-06 — Tratar indisponibilidade e permitir nova tentativa | T-07, T-08, T-10, T-11, T-12, T-13, T-17, T-24, T-25, T-26; T-32, T-33, T-37, T-38, T-40, T-41, T-47, T-51 | Coberto: erro de API/rede, timeout de 10 segundos, retry manual e descarte de resposta tardia sem cache apresentado como atual. |
| RF-07 — Comunicar estados de consulta | T-07, T-10, T-15, T-17, T-24, T-25; T-31, T-32, T-33, T-35, T-37, T-49, T-50 | Coberto: loading, vazio, erro acessível, busca vazia sem request e edição/reenvio. |
| RF-08 — Apresentar respostas meteorológicas parciais | T-09, T-12, T-18, T-20, T-26; T-39, T-42, T-44, T-47, T-51 | Coberto: campos/dias indisponíveis sem inventar valores ou deslocar datas, mantendo previsão disponível. |

**Requisitos funcionais sem tarefa correspondente:** nenhum RF-01 a RF-08 ficou
sem tarefa de implementação e teste associada.

## Prompt para o Coding Agent — T-01

```text
Você é o Coding Agent do Weather App. Implemente somente T-01 — Criar
composição e entrada React, conforme o backlog, a especificação e o plano
técnico existentes no repositório.

Contexto
- O projeto usa React 19, TypeScript strict, Vite e pnpm.
- `index.html` já contém `<div id="root"></div>` e carrega
  `/src/main.tsx`; use esse ponto de montagem existente.
- A aplicação ainda não possui os arquivos da camada `src/`.
- T-01 é apenas o shell inicial. Não implemente busca, clima, estilos/Tailwind,
  serviços, estado meteorológico ou chamadas de rede; essas responsabilidades
  pertencem a tarefas posteriores.
- Antes de editar, confirme que `specs/weather-app-spec.md`,
  `plans/weather-app-plan.md` e `tasks/weather-app-tasks.md` existem e leia os
  critérios de T-01. Leia também `.github/instructions/react.instructions.md`
  e `.github/instructions/tailwind.instructions.md` antes de editar arquivos
  abrangidos por essas instruções.

Arquivos
- Criar `src/main.tsx`: montar `App` no elemento `#root` usando a API de
  montagem do React 19 e `StrictMode`. Trate explicitamente a ausência do
  elemento raiz com erro claro; não use `any` nem casts desnecessários.
- Criar `src/App.tsx`: exportar um componente funcional default que renderiza
  um `<main>` semântico com um cabeçalho visível “Weather App”. Manter o
  componente pequeno e sem dependências de rede.
- Não editar `index.html`, configurações, dependências ou arquivos fora do
  escopo sem necessidade demonstrável para satisfazer os critérios.

Critérios de aceite
1. `pnpm dev` inicia sem erro e a página apresenta o cabeçalho “Weather App”
   dentro de `<main>` montado em `#root`.
2. `pnpm build` termina com código zero em TypeScript strict.
3. A mudança inclui somente os arquivos de T-01 e não adiciona chamada de API,
   estado de produto ou estilo pertencente a tarefa posterior.
4. Rode `pnpm lint`, `pnpm build` e `pnpm test`. Informe o resultado exato de
   cada comando; se algum falhar por estado preexistente ou configuração,
   reporte a falha sem escondê-la nem ampliar o escopo.

Ao concluir, resuma os arquivos criados, os critérios atendidos e os comandos
executados com seus resultados.
```

## Recorte solicitado P7.1–P7.4 — sem conectar App (histórico)

Estes IDs complementam T-*; não declaram concluída a integração ou produção.
Executar em ordem, com os testes correspondentes:

- **P7.1:** searchCities em src/services/weatherService.ts: trim,
  encodeURIComponent, count=10/language=pt/format=json, identidade/ordem,
  admin1->region, guards e erros explícitos. Vazio sem rede.
- **P7.2:** getWeather no mesmo serviço: parâmetros completos do plano,
  current/daily obrigatórios, cinco datas sem compressão de lacunas, nulls por
  domínio, timezone validado e horas preservadas. Testes com fetch mock.
- **P7.3:** fetchWithTimeout e WeatherServiceError: 10 s inclusive body,
  AbortController, mensagens pt-BR, cleanup em todos os caminhos; testes
  9999/10000 ms, HTTP/JSON/rede e body pendente.
- **P7.4:** useWeather com primeira cidade automática, lista para seleção
  posterior, query trim, estados coerentes, retry da operação falha e token
  concorrente/unmount. Testes renderHook, all-null vs parcial.

Aceite local: pnpm lint, pnpm check, pnpm build e pnpm test. Não conectar App
nem alterar demo offline; testes E2E/produção e integração continuam pendentes.


## P7.5 — Conectar App ao useWeather (nova integração, fatia de T-26)

- **Dependências:** P7.1–P7.4 e componentes P6.
- **Rastreabilidade:** RF-01/02/03/04/06/08; T-26 parcial, T-19/RF-05 não concluídos.
- **Arquivos:** App, CityResults, states/ErrorState, testes unitários App e README.
- **Aceite:**
  1. Idle orienta busca sem request automático; digitar/vazio não consulta.
  2. SearchBar chama search, desabilitada em loading; estados status/alert
     acessíveis. Success somente com data; incoerência vira erro explícito.
  3. Empty distingue nenhuma cidade da indisponibilidade de condições. Erro
     não mostra dados antigos; botão de ErrorState chama retry da operação falha.
  4. Lista preserva identidade/nome/região/país; botões nativos chamam selectCity
     com a cidade exata, desabilitados em loading. Primeira cidade automática.
  5. Unidade Celsius inicial mantida em todos os estados/buscas/retry/seleção;
     CurrentWeather e cinco cards recebem unit, sem mutação/request ao converter.
  6. Horário local da observação da fonte em pt-BR + timezone quando disponível;
     ausente explícito, sem alegar recente. Sem age/DST ou detalhes horários.
  7. Remover UI demo e componente morto, manter fixture; atribuição Open-Meteo
     segura e nota sobre envio da consulta/cidade. Docs históricas identificadas.
  8. Testes com serviços mockados, nunca hook/API real, cobrindo os fluxos acima,
     retry Geocoding versus Forecast e query persistente. Preservar demais testes.
- **Validação:** pnpm lint, pnpm check, pnpm build, pnpm test. Não declarar
  backlog/produção completos; E2E, T-19, T-21 e restante de T-26 seguem pendentes.
