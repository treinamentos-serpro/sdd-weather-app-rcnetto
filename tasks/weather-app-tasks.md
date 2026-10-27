# Backlog de Tarefas — Weather App

Backlog revisado para P5.2 e P5.3, derivado de
[plans/weather-app-plan.md](../plans/weather-app-plan.md) e rastreado para
[specs/weather-app-spec.md](../specs/weather-app-spec.md). As tarefas estão
organizadas por entrega e em ordem de dependência. Cada tarefa limita o escopo
a uma unidade testável, indica arquivos prováveis e apresenta critérios
verificáveis. Os requisitos listados são a rastreabilidade primária; cenários
relacionados da spec também se aplicam.

## Entrega 1 — Fundação e funções de domínio

### T-01 — Criar composição e entrada React

- **Descrição:** Criar a raiz da aplicação e montar o componente principal no
  ponto de entrada React.
- **Critérios de aceite:**
  - `pnpm dev` inicia sem erro de compilação e renderiza `App` no elemento raiz.
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
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/styles/index.css`, `src/main.tsx`.
- **Tipo:** Infra
- **Requisitos:** RNF-01, RNF-05.

### T-03 — Definir contratos meteorológicos compartilhados

- **Descrição:** Declarar os modelos normalizados usados entre UI, hook e
  serviços.
- **Critérios de aceite:**
  - O módulo exporta `Unit`, `City`, `CurrentWeather`, `HourlyForecast`,
    `ForecastDay` e `WeatherData` com os campos definidos no plano.
  - Valores de dados opcionais/incertos são representáveis sem valores
    substitutos, e o módulo não importa React nem serviços.
  - `pnpm build` passa em modo TypeScript strict.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data
- **Requisitos:** RF-01, RF-02, RF-03, RF-08.

### T-04 — Implementar conversão e arredondamento de temperatura

- **Descrição:** Criar a função pura que apresenta uma temperatura Celsius em
  Celsius ou Fahrenheit, arredondada conforme a regra do produto.
- **Critérios de aceite:**
  - Celsius é apresentado sem conversão; Fahrenheit usa `C × 9/5 + 32`.
  - O resultado é arredondado ao inteiro mais próximo e empate de 0,5 é para
    longe de zero, inclusive para valores negativos.
  - A função não altera nem armazena o valor Celsius recebido.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data
- **Requisitos:** RF-04.

### T-05 — Testar conversão e arredondamento de temperatura

- **Descrição:** Cobrir a função de temperatura com testes unitários puros.
- **Critérios de aceite:**
  - Vitest valida valores conhecidos em Celsius e Fahrenheit, positivos e
    negativos, incluindo empates de 0,5.
  - Os testes verificam conversão repetida sempre a partir do Celsius original.
  - O teste não acessa DOM nem rede.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-04.

### T-06 — Mapear códigos WMO para descrições em português

- **Descrição:** Implementar a tabela/função de descrição das condições WMO.
- **Critérios de aceite:**
  - Cada código WMO suportado pelo mapeamento retorna descrição em
    português do Brasil.
  - Código desconhecido não produz descrição meteorológica inventada e pode
    ser apresentado como indisponível.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data
- **Requisitos:** RF-02, RF-03, RNF-07.

### T-07 — Testar descrições de códigos WMO

- **Descrição:** Verificar códigos mapeados e desconhecidos.
- **Critérios de aceite:**
  - Vitest valida ao menos um código por classe de condição implementada e um
    código desconhecido.
  - As descrições verificadas estão em português do Brasil.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/lib/weatherCodes.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-02, RF-03, RNF-07.

### T-08 — Implementar formatação de datas e horas por fuso

- **Descrição:** Criar utilitários puros de apresentação de datas e horários
  locais da cidade.
- **Critérios de aceite:**
  - A data é apresentada como DD/MM/AAAA e a hora em formato de 24 horas e
    pt-BR.
  - A formatação aceita fuso IANA e não usa implicitamente o fuso do dispositivo.
  - Timestamp inválido não é formatado como horário válido.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/dateTime.ts`.
- **Tipo:** Data
- **Requisitos:** RF-03, RF-05, RNF-06, RNF-07.

### T-09 — Testar formatação de datas e horas por fuso

- **Descrição:** Cobrir formatação local, mudança de dia e casos sazonais.
- **Critérios de aceite:**
  - Testes comparam a mesma referência UTC formatada em dois fusos diferentes.
  - Testes cobrem mudança de data local, timestamp inválido e transição
    sazonal, incluindo hora local repetida quando aplicável.
  - Os resultados esperados seguem DD/MM/AAAA e 24 horas.
- **Dependências:** T-08.
- **Arquivos prováveis:** `tests/unit/lib/dateTime.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-03, RF-05, RNF-06, RNF-07.

## Entrega 2 — Geocoding, busca e seleção

### T-10 — Consultar o serviço de geocoding

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
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/services/geocodingService.ts`.
- **Tipo:** Data
- **Requisitos:** RF-01, RF-06, RF-07.

### T-11 — Testar request e mapeamento de geocoding

- **Descrição:** Testar contrato HTTP e normalização do serviço com `fetch`
  mockado.
- **Critérios de aceite:**
  - Vitest verifica endpoint e os quatro parâmetros requeridos.
  - Fixtures inline cobrem resposta válida, `results` ausente, região ausente,
    ordem preservada e truncamento em 10.
  - Testes não fazem conexão com Open-Meteo.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/unit/services/geocodingService.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-01.

### T-12 — Testar falhas e timeout de geocoding

- **Descrição:** Verificar os modos de falha do serviço de busca.
- **Critérios de aceite:**
  - Testes cobrem HTTP não-OK, rejeição de rede, JSON ilegível, estrutura
    inválida e timeout de 10 segundos usando mocks/timers.
  - Cada cenário rejeita com erro; nenhum cenário retorna sucesso vazio como
    fallback.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/unit/services/geocodingService.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-06, RF-07.

### T-13 — Gerenciar estado e validação da busca no hook

- **Descrição:** Criar estado de busca e ação de confirmação, incluindo
  validação de texto antes do serviço.
- **Critérios de aceite:**
  - Busca inicia em `idle` e representa `loading`, `success`, `empty` e `error`
    de forma explícita.
  - Texto vazio/somente espaços e texto com caractere de controle não chamam o
    serviço; o campo segue editável e pontuação legítima é mantida.
  - Busca só é executada pela ação explícita de confirmação.
- **Dependências:** T-10.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data
- **Requisitos:** RF-01, RF-06, RF-07.

### T-14 — Testar validação e estados da busca no hook

- **Descrição:** Verificar transições e validação do hook com serviço mockado.
- **Critérios de aceite:**
  - Vitest/Testing Library verifica `idle → loading → success`, `empty` e
    `error`.
  - Busca vazia ou com caractere de controle não chama o mock; busca válida
    envia o termo sem espaços externos e preserva pontuação.
- **Dependências:** T-13.
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-01, RF-07.

### T-15 — Descartar respostas tardias de geocoding

- **Descrição:** Proteger o estado da busca para que somente a tentativa mais
  recente possa atualizá-lo.
- **Critérios de aceite:**
  - Ao concluir B antes de A, a resposta tardia de A não substitui nem mistura
    resultados de B.
  - Depois de timeout e retry, a resposta da tentativa expirada não altera o
    estado da nova tentativa.
- **Dependências:** T-13.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data
- **Requisitos:** RF-01, RF-06.

### T-16 — Testar concorrência e retry de geocoding

- **Descrição:** Testar ordenação concorrente e retry no hook de busca.
- **Critérios de aceite:**
  - Teste com promises controladas conclui busca B antes de A e confirma que B
    permanece no estado.
  - Teste de retry após timeout confirma que a resposta antiga não sobrescreve
    o novo resultado.
- **Dependências:** T-15.
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-01, RF-06.

### T-17 — Implementar formulário acessível de busca

- **Descrição:** Criar campo editável e formulário que envia a busca somente
  sob confirmação explícita.
- **Critérios de aceite:**
  - O formulário possui label associado e submissão por botão e Enter.
  - Digitar sem submeter não invoca callback de busca.
  - Texto inválido pode ser corrigido sem perder o foco do campo.
- **Dependências:** T-13.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-01, RF-07, RNF-05.

### T-18 — Testar formulário de busca

- **Descrição:** Cobrir submissão explícita e acessibilidade básica do
  formulário.
- **Critérios de aceite:**
  - Testing Library verifica submissão por botão e Enter, e ausência de callback
    durante digitação.
  - Campo é encontrado por label acessível.
- **Dependências:** T-17.
- **Arquivos prováveis:** `tests/unit/components/SearchForm.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-01, RF-07, RNF-05.

### T-19 — Implementar seleção de resultados de cidade

- **Descrição:** Exibir resultados de geocoding e comunicar a cidade escolhida
  ao hook.
- **Critérios de aceite:**
  - Cada resultado mostra nome e país, e região/estado quando disponível.
  - Resultados mantêm a ordem recebida e nunca mostram mais de 10 opções.
  - Cada opção é acionável por teclado e passa ao callback o `id` e as
    coordenadas exatos daquela cidade.
- **Dependências:** T-03, T-13.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-01, RNF-05.

### T-20 — Testar seleção e identificação de cidades

- **Descrição:** Verificar apresentação e seleção exata de resultados.
- **Critérios de aceite:**
  - Testing Library valida nome/país/região, preservação da ordem e seleção
    exata em um conjunto com cidades homônimas.
  - Uma cidade sem região continua selecionável e não exibe região inventada.
- **Dependências:** T-19.
- **Arquivos prováveis:** `tests/unit/components/CityResults.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-01.

### T-21 — Comunicar estados de consulta e oferecer retry

- **Descrição:** Criar uma apresentação reutilizável de estados assíncronos
  para busca de cidades e consulta meteorológica.
- **Critérios de aceite:**
  - `loading`, `empty` e `error` têm conteúdo visual distinto; busca vazia
    comunica que nenhuma cidade foi encontrada.
  - A ação de retry aparece somente em erro e chama o callback da mesma
    operação (busca ou Forecast) com o contexto confirmado.
  - Loading é anunciável por tecnologia assistiva; erro e vazio têm texto
    acessível.
- **Dependências:** T-13.
- **Arquivos prováveis:** `src/components/AsyncStatus.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-06, RF-07, RNF-05.

### T-22 — Testar estados visíveis das consultas

- **Descrição:** Validar os estados reutilizáveis de busca e Forecast na UI.
- **Critérios de aceite:**
  - Testing Library distingue loading, vazio e erro por texto/role acessível
    para os dois tipos de operação.
  - Ativar retry chama o callback da operação indicada; não há retry no estado
    vazio.
- **Dependências:** T-21.
- **Arquivos prováveis:** `tests/unit/components/AsyncStatus.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-06, RF-07, RNF-05.

## Entrega 3 — Forecast e normalização de dados

### T-23 — Implementar request do Forecast Open-Meteo

- **Descrição:** Fazer a chamada HTTP de Forecast usando coordenadas e
  parâmetros definidos no plano.
- **Critérios de aceite:**
  - Request inclui latitude/longitude, campos `current`, `daily`, `hourly`,
    `forecast_days=5`, `timezone=auto`, `temperature_unit=celsius` e
    `wind_speed_unit=kmh`.
  - HTTP não-OK, rede, JSON ilegível e timeout rejeitam a operação.
  - Request sem resposta é encerrado em até 10 segundos; o serviço não executa
    polling, retry automático ou cache.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/services/forecastService.ts`.
- **Tipo:** Data
- **Requisitos:** RF-02, RF-03, RF-06, RF-08.

### T-24 — Testar request e falhas do Forecast

- **Descrição:** Verificar contrato HTTP e modos de falha do serviço.
- **Critérios de aceite:**
  - Testes mockados validam endpoint, coordenadas e todos os parâmetros
    requeridos.
  - Testes cobrem HTTP não-OK, falha de rede, JSON ilegível e timeout de até
    10 segundos.
  - Nenhum teste acessa Open-Meteo.
- **Dependências:** T-23.
- **Arquivos prováveis:** `tests/unit/services/forecastService.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-06.

### T-25 — Normalizar dados meteorológicos da resposta

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
- **Dependências:** T-03, T-08, T-23.
- **Arquivos prováveis:** `src/services/forecastMapper.ts`.
- **Tipo:** Data
- **Requisitos:** RF-02, RF-03, RF-05, RF-08, RNF-06.

### T-26 — Testar normalização do Forecast

- **Descrição:** Cobrir mapeamento, associação paralela e dados incompletos
  com fixtures locais.
- **Critérios de aceite:**
  - Testes verificam associação de cada array pelo índice de `time` e
    correspondência de máximas/mínimas com a data atual local.
  - Testes cobrem timezone diferente do host, campos inválidos, dia ausente,
    arrays parciais e estrutura ilegível.
  - Datas dos dias seguintes não são deslocadas por campos ausentes.
- **Dependências:** T-25.
- **Arquivos prováveis:** `tests/unit/services/forecastMapper.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-02, RF-03, RF-08.

### T-27 — Integrar seleção de cidade ao estado de Forecast

- **Descrição:** Fazer o hook consultar Forecast para as coordenadas da
  localidade escolhida.
- **Critérios de aceite:**
  - Forecast começa somente após seleção e recebe latitude/longitude da cidade
    selecionada, não somente o nome.
  - Estado Forecast é separado do estado da busca.
  - Resposta parcial com pelo menos um dado utilizável é `success`; ausência de
    dados utilizáveis é `empty`.
- **Dependências:** T-13, T-23, T-25.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data
- **Requisitos:** RF-01, RF-02, RF-03, RF-08.

### T-28 — Testar seleção e estados do Forecast no hook

- **Descrição:** Cobrir o fluxo normal e estados de Forecast com o serviço
  mockado.
- **Critérios de aceite:**
  - Testes verificam coordenadas exatas da cidade selecionada e ausência de
    request antes da seleção.
  - Testes verificam sucesso completo, sucesso parcial, vazio e erro.
  - Concluir/falhar Forecast não apaga o estado independente da busca.
- **Dependências:** T-27.
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-01, RF-02, RF-03, RF-08.

### T-29 — Proteger Forecast contra resposta tardia e timeout

- **Descrição:** Garantir que uma consulta anterior ou expirada não substitua
  dados de uma consulta posterior.
- **Critérios de aceite:**
  - Após selecionar cidade B enquanto A está pendente, resposta tardia de A
    não substitui nem mistura os dados de B.
  - Após timeout e retry, a primeira resposta não altera o estado da segunda
    tentativa.
  - Erro/timeout mantém retry manual para a mesma cidade e não mostra cache
    como atual.
- **Dependências:** T-27.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data
- **Requisitos:** RF-06, RF-08.

### T-30 — Testar concorrência e retry do Forecast

- **Descrição:** Validar respostas tardias, timeout e recuperação manual.
- **Critérios de aceite:**
  - Promises controladas confirmam que uma resposta antiga não substitui a
    resposta da cidade/tentativa mais recente.
  - Timer controlado confirma encerramento em 10 segundos e retry para a mesma
    localidade.
- **Dependências:** T-29.
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.ts`.
- **Tipo:** Test
- **Requisitos:** RF-06.

## Entrega 4 — Apresentação da previsão e condições atuais

### T-31 — Implementar painel de condições atuais

- **Descrição:** Renderizar os indicadores atuais e seus estados indisponíveis.
- **Critérios de aceite:**
  - Quando presentes, são mostrados condição, temperatura, sensação térmica,
    máxima/mínima do dia local, umidade e vento, com unidade.
  - Campo `null` é marcado como indisponível individualmente; sem temperatura
    atual, o painel informa que as condições atuais não estão disponíveis.
  - Condição usa descrição pt-BR e código desconhecido não recebe descrição
    inventada.
- **Dependências:** T-06, T-27.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-02, RF-08, RNF-07.

### T-32 — Testar painel de condições atuais

- **Descrição:** Cobrir apresentação de dados completos, parciais e
  indisponíveis.
- **Critérios de aceite:**
  - Testing Library verifica cada indicador e suas unidades com dados
    completos.
  - Teste com campos `null` confirma mensagens indisponíveis individuais e
    indisponibilidade geral quando falta temperatura atual.
- **Dependências:** T-31.
- **Arquivos prováveis:** `tests/unit/components/CurrentWeather.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-02, RF-08.

### T-33 — Implementar indicação de atualidade da observação

- **Descrição:** Exibir timestamp local e sinalizar observações antigas ou
  timestamps não confiáveis.
- **Critérios de aceite:**
  - Timestamp válido é exibido no fuso IANA da cidade.
  - Idade acima de 60 minutos, calculada em relação ao UTC atual, gera aviso de
    desatualização.
  - Timestamp ausente, inválido ou futuro é identificado como indisponível,
    nunca como recente.
- **Dependências:** T-08, T-27.
- **Arquivos prováveis:** `src/components/ObservationFreshness.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-05, RNF-06.

### T-34 — Testar indicação de atualidade

- **Descrição:** Verificar os limites e casos inválidos de observação.
- **Critérios de aceite:**
  - Relógio controlado confirma observação com idade de até 60 minutos sem
    aviso e acima de 60 minutos com aviso.
  - Testes cobrem ausência, formato inválido, timestamp futuro e fusos distintos.
- **Dependências:** T-33.
- **Arquivos prováveis:** `tests/unit/components/ObservationFreshness.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-05, RNF-06.

### T-35 — Implementar resumos dos cinco dias

- **Descrição:** Exibir lista diária de hoje e dos quatro dias seguintes com
  seus estados parciais.
- **Critérios de aceite:**
  - A lista renderiza exatamente cinco dias, na ordem e com as datas recebidas.
  - Cada cartão mostra condição e máxima/mínima; campos `null` são indicados
    como indisponíveis sem deslocar datas.
  - Descrições são em português e temperaturas incluem a unidade selecionada.
  - A previsão informa que seu horário de atualização não foi fornecido.
- **Dependências:** T-06, T-27.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-03, RF-08, RNF-07.

### T-36 — Testar resumos diários

- **Descrição:** Verificar cinco datas na ordem e representação de campos
  diários ausentes.
- **Critérios de aceite:**
  - Testing Library valida exatamente cinco datas e conteúdo de cada cartão.
  - Fixture com valores indisponíveis conserva a data do dia e sinaliza apenas
    os campos afetados.
  - Teste verifica a comunicação de que o horário de atualização da previsão
    não foi fornecido.
- **Dependências:** T-35.
- **Arquivos prováveis:** `tests/unit/components/ForecastList.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-03, RF-08.

### T-37 — Implementar expansão de detalhes horários

- **Descrição:** Permitir abrir individualmente os pontos horários de cada dia.
- **Critérios de aceite:**
  - Cada dia possui controle de expansão acessível por teclado e estado
    expandido/collapsed anunciado.
  - Expandir um dia apresenta somente seus pontos horários, com hora local,
    condição e temperatura.
  - Horários repetidos são distinguidos pelo instante; horários inexistentes
    não são gerados pela UI.
- **Dependências:** T-08, T-27, T-35.
- **Arquivos prováveis:** `src/components/HourlyForecast.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-03, RNF-05, RNF-07.

### T-38 — Testar expansão e pontos horários

- **Descrição:** Verificar interação de expansão e associação ao dia escolhido.
- **Critérios de aceite:**
  - Testes abrem e fecham um dia por teclado e verificam seu estado acessível.
  - Ao expandir um dia, nenhum ponto de outra data é apresentado.
  - Testes verificam horário repetido distinguível e ausência de horas
    inventadas para o conteúdo recebido.
- **Dependências:** T-37.
- **Arquivos prováveis:** `tests/unit/components/HourlyForecast.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-03, RNF-05.

## Entrega 5 — Unidade, composição e privacidade

### T-39 — Manter unidade de temperatura no estado da visita

- **Descrição:** Adicionar Celsius inicial e ação de alternância ao estado do
  hook, sem persistência.
- **Critérios de aceite:**
  - Cada montagem inicia com `celsius`; a ação alterna entre `celsius` e
    `fahrenheit`.
  - Troca de cidade durante a mesma montagem conserva unidade.
  - Hook não lê nem grava unidade em localStorage, cookies ou outro storage.
- **Dependências:** T-04, T-27.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data
- **Requisitos:** RF-04, RNF-08.

### T-40 — Implementar controle acessível de unidade

- **Descrição:** Criar controle para selecionar Celsius ou Fahrenheit.
- **Critérios de aceite:**
  - O controle expõe as opções °C e °F com nome acessível e seleção
    programaticamente identificável.
  - Ativar cada opção chama callback com a unidade correspondente.
- **Dependências:** T-39.
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-04, RNF-05.

### T-41 — Testar alternância de unidade na tela

- **Descrição:** Verificar propagação da unidade para toda temperatura
  apresentada, sem nova consulta.
- **Critérios de aceite:**
  - Testes verificam unidade em clima atual, resumos diários e detalhes
    horários, antes/depois de expansão e troca de cidade.
  - Alternar unidade não chama geocoding nem Forecast.
  - Nova montagem inicia em Celsius.
- **Dependências:** T-31, T-35, T-37, T-40.
- **Arquivos prováveis:** `tests/unit/components/TemperatureUnitToggle.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-04.

### T-42 — Compor a tela com hook e componentes

- **Descrição:** Conectar formulário, resultados, consulta, estados e
  apresentação em `App`.
- **Critérios de aceite:**
  - Uma busca válida pode ser confirmada, resultado selecionado e conteúdo
    meteorológico correspondente renderizado.
  - Busca e Forecast mantêm seus estados independentes na tela.
  - Retry executa a mesma operação e não apresenta dados antigos como atuais.
- **Dependências:** T-17, T-19, T-21, T-27, T-31, T-33, T-35, T-37, T-40.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-01, RF-02, RF-03, RF-06, RF-07, RF-08.

### T-43 — Testar composição da tela

- **Descrição:** Validar o fluxo integrado entre busca, seleção, consulta e
  retry no limite da aplicação.
- **Critérios de aceite:**
  - Teste com serviços mockados completa busca, seleção e exibição do Forecast.
  - Teste de erro permite retry da operação apropriada sem apagar o estado da
    outra.
  - Nenhuma chamada de rede real é executada.
- **Dependências:** T-42.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RF-01, RF-02, RF-06, RF-07.

### T-44 — Implementar atribuição visível ao Open-Meteo

- **Descrição:** Criar atribuição reutilizável e incluí-la nas visões atuais e
  de previsão.
- **Critérios de aceite:**
  - O componente mostra Open-Meteo como fonte e contém link navegável para o
    provedor.
  - A atribuição aparece quando há condições atuais e quando há previsão.
- **Dependências:** T-31, T-35, T-42.
- **Arquivos prováveis:** `src/components/WeatherAttribution.tsx`,
  `src/App.tsx`.
- **Tipo:** UI
- **Requisitos:** RNF-09.

### T-45 — Testar atribuição do provedor

- **Descrição:** Verificar presença e destino do link de atribuição.
- **Critérios de aceite:**
  - Testing Library confirma texto Open-Meteo e `href` oficial em condição
    atual e previsão.
- **Dependências:** T-44.
- **Arquivos prováveis:** `tests/unit/components/WeatherAttribution.test.tsx`.
- **Tipo:** Test
- **Requisitos:** RNF-09.

### T-46 — Documentar privacidade e compartilhamento de consulta

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

## Entrega 6 — Responsividade, acessibilidade e testes integrados

### T-47 — Ajustar layout responsivo da aplicação

- **Descrição:** Aplicar layout responsivo sem rolagem horizontal nos
  breakpoints da spec.
- **Critérios de aceite:**
  - Em larguras 320, 375, 768, 1024 e 1440 CSS px, `scrollWidth` do documento
    não excede `clientWidth`.
  - Busca, seleção, condições atuais, cinco dias e controle de unidade
    permanecem visíveis e operáveis em cada largura.
- **Dependências:** T-42.
- **Arquivos prováveis:** `src/App.tsx`, `src/styles/index.css`.
- **Tipo:** UI
- **Requisitos:** RNF-01.

### T-48 — Tornar os estados assíncronos anunciáveis

- **Descrição:** Garantir anúncios acessíveis de loading, vazio e erro nos
  fluxos de busca e Forecast.
- **Critérios de aceite:**
  - Loading e vazio usam região `role="status"`; erro usa `role="alert"`.
  - Erro e resultado vazio têm texto acessível e não dependem apenas de cor ou
    ícone.
  - Os nomes acessíveis de botões de retry descrevem a operação repetida.
- **Dependências:** T-21, T-42.
- **Arquivos prováveis:** `src/components/AsyncStatus.tsx`, `src/App.tsx`.
- **Tipo:** UI
- **Requisitos:** RF-06, RF-07, RNF-05.

### T-49 — Testar anúncios e nomes acessíveis dos estados

- **Descrição:** Verificar estrutura acessível dos indicadores e controles de
  estado.
- **Critérios de aceite:**
  - Testing Library encontra `role="status"` para loading/vazio e
    `role="alert"` para erro em busca e Forecast.
  - Botões de retry têm nome acessível que identifica busca ou consulta
    meteorológica.
- **Dependências:** T-48.
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
- **Dependências:** T-43.
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
- **Dependências:** T-43, T-45.
- **Arquivos prováveis:** `tests/e2e/weather-forecast.spec.ts`.
- **Tipo:** Test
- **Requisitos:** RF-02, RF-03, RF-04, RF-06, RNF-09.

### T-52 — Testar viewport responsivo e fluxo por teclado

- **Descrição:** Validar os fluxos essenciais nos viewports definidos e por
  navegação de teclado.
- **Critérios de aceite:**
  - E2E executa os fluxos essenciais nas larguras 320, 375, 768, 1024 e
    1440 px e verifica ausência de rolagem horizontal.
  - Busca, seleção, alternância e expansão horária são concluíveis por teclado
    em viewport mobile.
- **Dependências:** T-47, T-50, T-51.
- **Arquivos prováveis:** `tests/e2e/responsive-keyboard.spec.ts`.
- **Tipo:** Test
- **Requisitos:** RNF-01, RNF-05.

## Entrega 7 — Validação de qualidade e prontidão para lançamento

### T-53 — Validar compatibilidade de navegadores e leitores de tela

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
- **Dependências:** T-52.
- **Arquivos prováveis:** `docs/validation/accessibility-compatibility.md`.
- **Tipo:** Test
- **Requisitos:** RNF-01, RNF-05.

### T-54 — Medir desempenho das operações meteorológicas

- **Descrição:** Medir o tempo de geocoding e Forecast em rede controlada e
  registrar os resultados.
- **Critérios de aceite:**
  - São obtidas 100 medições bem-sucedidas de geocoding e 100 de Forecast na
    rede de 10 Mbps down, 2 Mbps up e 100 ms RTT.
  - p95 de cada operação, medido da ação até conteúdo visível, é no máximo
    3 segundos; falhas e timeouts são reportados em separado.
  - Documento registra configuração da rede, amostras, p95 e falhas/timeout.
- **Dependências:** T-50, T-51.
- **Arquivos prováveis:** `docs/validation/performance.md`.
- **Tipo:** Test
- **Requisitos:** RNF-03.

### T-55 — Configurar medição externa de disponibilidade

- **Descrição:** Configurar ou documentar monitoramento da disponibilidade da
  interface separado do provedor de clima.
- **Critérios de aceite:**
  - Verificação externa da capacidade de carregar a interface roda a cada
    minuto.
  - Relatório mensal calcula sucesso dividido pelo total de verificações e
    apresenta meta de 99,5%.
  - Falha do provedor meteorológico é registrada separadamente da
    indisponibilidade da interface.
- **Dependências:** T-01.
- **Arquivos prováveis:** `docs/operations/availability-monitoring.md`.
- **Tipo:** Infra
- **Requisitos:** RNF-04.

### T-56 — Conduzir teste moderado de usabilidade

- **Descrição:** Medir conclusão da tarefa principal sem treinamento ou ajuda.
- **Critérios de aceite:**
  - Plano define antes das sessões os cenários e cidades e recruta 10
    participantes do público geral.
  - Pelo menos 9 de 10 concluem sem ajuda busca, consulta de condições atuais
    e identificação correta das cinco datas.
  - O registro não coleta a métrica por telemetria e descreve método,
    contagem de conclusão e impedimentos.
- **Dependências:** T-51, T-52.
- **Arquivos prováveis:** `docs/validation/usability-test.md`.
- **Tipo:** Test
- **Requisitos:** RNF-02, RNF-08.

### T-57 — Verificar termos e limites do Open-Meteo antes do lançamento

- **Descrição:** Confirmar se o uso sem chave e a atribuição estão de acordo
  com as condições vigentes do provedor.
- **Critérios de aceite:**
  - Registro identifica os termos/limites consultados, data da revisão e
    decisão de conformidade para a implantação pretendida.
  - Se o uso sem chave não for permitido, a decisão de lançamento é bloqueada
    até configurar acesso permitido.
  - Nenhuma troca de provedor ou remoção de atribuição ocorre sem revisão da
    especificação.
- **Dependências:** T-44, T-46.
- **Arquivos prováveis:** `docs/validation/provider-terms.md`.
- **Tipo:** Infra
- **Requisitos:** RNF-08, RNF-09.

### T-58 — Inspecionar privacidade da aplicação em execução

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
- **Dependências:** T-46, T-50, T-51.
- **Arquivos prováveis:** `docs/validation/privacy-inspection.md`.
- **Tipo:** Test
- **Requisitos:** RNF-08.
