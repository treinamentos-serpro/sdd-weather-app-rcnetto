# Backlog de Tarefas — Weather App

Backlog derivado de [plans/weather-app-plan.md](../plans/weather-app-plan.md) e
relacionado aos requisitos de [specs/weather-app-spec.md](../specs/weather-app-spec.md).
As tarefas estão agrupadas por entrega e ordenadas respeitando suas
dependências. Arquivos indicados são prováveis e podem ser ajustados para
acompanhar a estrutura existente, sem alterar os contratos ou critérios.

## Entrega 1 — Fundação e domínio

### T-01 — Preparar a estrutura inicial da aplicação

- **Descrição:** Criar o ponto de entrada React e a composição mínima da página,
  usando a stack já configurada no repositório.
- **Critérios de aceite:**
  - A aplicação inicia pelo Vite e renderiza a raiz React sem erros.
  - TypeScript permanece em modo strict e os estilos globais/Tailwind são
    carregados.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`, `src/styles/index.css`,
  `index.html`, `tailwind.config.js`, `postcss.config.js`.
- **Tipo:** Infra

### T-02 — Definir os contratos meteorológicos compartilhados

- **Descrição:** Criar os tipos normalizados usados entre apresentação,
  orquestração, serviços e utilitários.
- **Critérios de aceite:**
  - `City`, `CurrentWeather`, `HourlyForecast`, `ForecastDay`, `WeatherData` e
    `Unit` refletem os contratos do plano.
  - Campos que podem estar ausentes são representados explicitamente como
    opcionais ou `null`, conforme o contrato.
  - O módulo de tipos não depende de React nem de serviços.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data

### T-03 — Implementar utilitários puros de clima e horário

- **Descrição:** Implementar conversão/arredondamento de temperatura,
  apresentação de códigos WMO e formatação de datas e horas no fuso local.
- **Critérios de aceite:**
  - Fahrenheit é derivado do Celsius original; empates de 0,5 são arredondados
    para longe de zero.
  - Códigos WMO conhecidos têm descrição em português; códigos desconhecidos
    não geram uma descrição meteorológica inventada.
  - Datas e horas são formatáveis em pt-BR, no fuso IANA recebido, sem deslocar
    a data local.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/temperature.ts`,
  `src/lib/weatherCodes.ts`, `src/lib/dateTime.ts`.
- **Tipo:** Data

### T-04 — Testar utilitários de domínio

- **Descrição:** Cobrir funções puras com testes determinísticos, incluindo
  limites e casos de fuso.
- **Critérios de aceite:**
  - Testes cobrem conversão nos dois sentidos de apresentação, negativos e
    empates de arredondamento.
  - Testes cobrem códigos WMO desconhecidos, mudança de dia e fusos distintos.
  - Os testes não acessam DOM nem rede.
- **Dependências:** T-03.
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`,
  `tests/unit/lib/weatherCodes.test.ts`, `tests/unit/lib/dateTime.test.ts`.
- **Tipo:** Test

## Entrega 2 — Busca e seleção de cidades

### T-05 — Implementar o serviço de geocoding

- **Descrição:** Consultar e validar a resposta do Geocoding Open-Meteo,
  normalizando os resultados para `City`.
- **Critérios de aceite:**
  - A consulta usa `name` sem espaços externos, `count=10`, `language=pt` e
    `format=json`.
  - Resultados são limitados a 10, preservam a ordem e mapeiam `admin1` para
    `region`; resposta sem `results` é uma lista vazia.
  - Resposta HTTP não-OK, rede, JSON ilegível ou estrutura inválida é tratada
    como falha, sem expor payload técnico à UI.
  - A operação termina em até 10 segundos e permite cancelamento quando
    suportado.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/services/geocodingService.ts`,
  `src/types/weather.ts`.
- **Tipo:** Data

### T-06 — Testar o serviço de geocoding

- **Descrição:** Verificar parâmetros, normalização e falhas do geocoding sem
  chamadas à API real.
- **Critérios de aceite:**
  - `fetch` mockado confirma URL e parâmetros exigidos.
  - Fixtures cobrem resultado válido, sem resultados, região ausente e
    resposta inválida/parcial.
  - Testes cobrem HTTP não-OK, JSON ilegível, falha de rede e timeout.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/services/geocodingService.test.ts`,
  `tests/fixtures/geocoding*.json`.
- **Tipo:** Test

### T-07 — Orquestrar busca, seleção e retry no hook

- **Descrição:** Criar o estado de busca e as ações para confirmar consulta,
  selecionar uma localidade e repetir a busca.
- **Critérios de aceite:**
  - Busca e consulta meteorológica mantêm estados independentes e discriminados
  (`idle`, `loading`, `success`, `empty`, `error`).
  - Entrada vazia ou com caracteres de controle não chama o serviço; pontuação
    legítima é preservada.
  - A busca só ocorre após confirmação; falha permite retry da mesma consulta.
  - Respostas antigas, inclusive após timeout e retry, não substituem o
    resultado da tentativa mais recente.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`,
  `src/services/geocodingService.ts`.
- **Tipo:** Data

### T-08 — Testar a orquestração da busca

- **Descrição:** Cobrir as transições de estado, validação e concorrência do
  fluxo de busca com serviços mockados.
- **Critérios de aceite:**
  - Testes verificam `idle → loading → success/empty/error`, retry e seleção
    exata entre localidades homônimas.
  - Busca vazia ou inválida não chama o serviço.
  - Resposta tardia não substitui resultados de uma busca mais recente.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.ts`.
- **Tipo:** Test

### T-09 — Criar formulário e lista de resultados de cidade

- **Descrição:** Implementar a busca confirmada por formulário e a escolha
  acessível de um resultado.
- **Critérios de aceite:**
  - Resultados mostram cidade, país e região/estado quando disponível, em até
    10 itens e na ordem recebida.
  - A seleção preserva a identidade da localidade; Forecast não é iniciado
    antes de uma seleção.
  - Loading, erro, retry e resultado vazio são distintos e permitem corrigir
    ou reenviar a consulta.
  - Campos e ações têm nomes acessíveis e funcionam por teclado.
- **Dependências:** T-07.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`,
  `src/components/CityResults.tsx`, `src/components/states/`.
- **Tipo:** UI

### T-10 — Testar os componentes de busca

- **Descrição:** Validar interações e estados visíveis do fluxo de busca.
- **Critérios de aceite:**
  - Testing Library verifica submissão explícita, validação, seleção e retry.
  - Loading, erro e vazio são consultáveis por roles/labels acessíveis.
  - Digitação por si só não dispara busca.
- **Dependências:** T-09.
- **Arquivos prováveis:** `tests/unit/components/SearchForm.test.tsx`,
  `tests/unit/components/CityResults.test.tsx`.
- **Tipo:** Test

## Entrega 3 — Consulta e apresentação meteorológica

### T-11 — Implementar o serviço de previsão

- **Descrição:** Consultar Forecast para a cidade escolhida e normalizar
  condições atuais e previsões diárias/horárias.
- **Critérios de aceite:**
  - A URL usa coordenadas da cidade, os campos `current`, `daily` e `hourly`
    especificados, `forecast_days=5`, `timezone=auto`, Celsius e km/h.
  - O mapeamento associa máximas/mínimas atuais à data local de `current.time`,
    agrupa horas pela data local e mantém datas mesmo quando campos faltam.
  - Valores ausentes ou fora do domínio tornam apenas o campo correspondente
    `null`; resposta estruturalmente ilegível é falha.
  - `forecastUpdatedAt` permanece `null`; `generationtime_ms` não é tratado
    como horário de atualização.
  - A consulta termina em até 10 segundos e não inicia atualização automática.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/services/forecastService.ts`,
  `src/types/weather.ts`, `src/lib/dateTime.ts`.
- **Tipo:** Data

### T-12 — Testar o serviço de previsão

- **Descrição:** Cobrir parâmetros, mapeamento de séries paralelas e dados
  parciais usando `fetch` mockado.
- **Critérios de aceite:**
  - Testes validam URL/parâmetros e associação dos campos pelo índice correto.
  - Fixtures cobrem fuso diferente do dispositivo, campos ausentes/inválidos,
    dia sem dados e séries horárias de múltiplas datas.
  - Testes cobrem HTTP não-OK, JSON ilegível, falha de rede e timeout sem
    acessar o provedor real.
- **Dependências:** T-11.
- **Arquivos prováveis:** `tests/unit/services/forecastService.test.ts`,
  `tests/fixtures/forecast*.json`.
- **Tipo:** Test

### T-13 — Integrar seleção de cidade e consulta de previsão

- **Descrição:** Estender o hook para buscar dados da cidade selecionada e
  permitir retry da operação meteorológica.
- **Critérios de aceite:**
  - Forecast usa as coordenadas da cidade selecionada, não apenas seu nome.
  - O estado de Forecast é independente do estado de geocoding.
  - Erro ou timeout permite retry manual da mesma cidade; respostas de
    consultas anteriores não substituem a mais recente.
  - Resposta parcial permanece sucesso quando contém dados utilizáveis; sem
    dados utilizáveis, o estado é vazio.
  - Nenhum dado em cache é apresentado como atual após falha.
- **Dependências:** T-07, T-11.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`,
  `src/services/forecastService.ts`.
- **Tipo:** Data

### T-14 — Testar o fluxo do hook meteorológico

- **Descrição:** Verificar seleção, estados independentes, retry e proteção
  contra respostas tardias no hook.
- **Critérios de aceite:**
  - Testes cobrem sucesso parcial, vazio, falha, timeout e retry do Forecast.
  - Uma cidade homônima selecionada consulta exatamente suas coordenadas.
  - Busca e Forecast podem concluir ou falhar sem apagar o estado da outra
    operação.
- **Dependências:** T-13.
- **Arquivos prováveis:** `tests/unit/hooks/useWeather.test.ts`.
- **Tipo:** Test

### T-15 — Exibir condições atuais e atualidade da observação

- **Descrição:** Apresentar os indicadores atuais disponíveis e comunicar
  observações antigas ou timestamps indisponíveis.
- **Critérios de aceite:**
  - São apresentados condição, temperatura, sensação térmica, máxima/mínima
    local, umidade e vento quando disponíveis, com unidade.
  - Campos inválidos/ausentes são marcados individualmente como indisponíveis;
    sem temperatura atual, a indisponibilidade das condições atuais é clara.
  - Horário de observação é apresentado no fuso da cidade; idade superior a
    60 minutos recebe aviso explícito.
  - Timestamp ausente, inválido ou futuro não é anunciado como recente.
- **Dependências:** T-03, T-13.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`,
  `src/components/states/`, `src/lib/dateTime.ts`.
- **Tipo:** UI

### T-16 — Exibir previsão diária e detalhes horários

- **Descrição:** Apresentar os cinco dias locais e permitir expandir cada dia
  para ver os pontos horários.
- **Critérios de aceite:**
  - São exibidos exatamente cinco dias com data, condição e máxima/mínima,
    inclusive datas com dados indisponíveis sem deslocar os dias seguintes.
  - Cada dia pode ser expandido independentemente; horas exibidas pertencem
    somente à data local correspondente.
  - Condições, datas DD/MM/AAAA e horas de 24 horas são apresentadas em
    português do Brasil e no fuso IANA da cidade.
  - Horários locais repetidos são distinguidos pelo instante correspondente;
    horários inexistentes não são inventados.
  - A UI comunica que o horário de atualização da previsão não foi fornecido.
- **Dependências:** T-03, T-13.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`,
  `src/components/ForecastDay.tsx`, `src/components/HourlyForecast.tsx`.
- **Tipo:** UI

### T-17 — Testar componentes meteorológicos

- **Descrição:** Verificar os dados, estados parciais e interações da visão
  atual e da previsão.
- **Critérios de aceite:**
  - Testes cobrem indicadores, campos indisponíveis, observação antiga e
    timestamp não confiável.
  - Testes cobrem cinco datas, expansão de um dia, horários locais e conteúdo
    de previsão parcial.
  - Consultas de teste usam comportamento observável e nomes acessíveis.
- **Dependências:** T-15, T-16.
- **Arquivos prováveis:** `tests/unit/components/CurrentWeather.test.tsx`,
  `tests/unit/components/ForecastList.test.tsx`.
- **Tipo:** Test

## Entrega 4 — Unidade, acessibilidade e privacidade

### T-18 — Implementar alternância global de unidade

- **Descrição:** Permitir alternar entre Celsius e Fahrenheit para todas as
  temperaturas carregadas, mantendo a escolha apenas durante a visita.
- **Critérios de aceite:**
  - Celsius é inicial; a troca de unidade atualiza condições atuais, máximas/
    mínimas e detalhes horários.
  - Conversões usam os valores Celsius originais e não arredondam
    cumulativamente.
  - Alternar unidade não dispara novas requisições; recarregar restaura
    Celsius.
  - A unidade escolhida permanece ao selecionar outra cidade na mesma visita.
- **Dependências:** T-03, T-13, T-15, T-16.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`,
  `src/components/TemperatureUnitToggle.tsx`, `src/App.tsx`.
- **Tipo:** UI

### T-19 — Testar a alternância de unidade integrada

- **Descrição:** Garantir que a mudança de unidade alcance todos os valores e
  não provoque tráfego adicional.
- **Critérios de aceite:**
  - Testes verificam °C/°F em dados atuais, diários e horários, inclusive após
    expansão e troca de cidade.
  - Testes confirmam ausência de nova chamada ao serviço ao alternar unidade
    e estado inicial Celsius após nova montagem.
- **Dependências:** T-18.
- **Arquivos prováveis:** `tests/unit/components/TemperatureUnitToggle.test.tsx`,
  `tests/unit/hooks/useWeather.test.ts`.
- **Tipo:** Test

### T-20 — Exibir atribuição e informar privacidade

- **Descrição:** Tornar a fonte dos dados visível e documentar o
  compartilhamento da consulta com o provedor.
- **Critérios de aceite:**
  - Há atribuição visível com link para Open-Meteo tanto na visão atual quanto
    na previsão.
  - A política informa envio da consulta ao provedor e retenção conforme os
    termos publicados.
  - A implementação não adiciona analytics, identificadores, cookies não
    essenciais, armazenamento local ou persistência de consultas.
- **Dependências:** T-15, T-16.
- **Arquivos prováveis:** `src/components/WeatherAttribution.tsx`,
  `src/components/CurrentWeather.tsx`, `src/components/ForecastList.tsx`,
  `docs/privacy-policy.md`.
- **Tipo:** UI

### T-21 — Adequar interface a responsividade e acessibilidade

- **Descrição:** Ajustar os fluxos e estados para uso responsivo, por teclado
  e por tecnologia assistiva.
- **Critérios de aceite:**
  - Busca, seleção, consulta, troca de unidade e retry são utilizáveis somente
    por teclado, com foco visível e sem armadilha de foco.
  - Loading, vazio e erro têm anúncio acessível; controles têm nome acessível.
  - Não há rolagem horizontal nas larguras 320, 375, 768, 1024 e 1440 px.
  - Contraste e critérios WCAG 2.2 AA são verificados por ferramenta
    automatizada e revisão manual.
- **Dependências:** T-09, T-15, T-16, T-18.
- **Arquivos prováveis:** `src/components/**/*.tsx`,
  `src/styles/index.css`, `tests/unit/components/`.
- **Tipo:** UI

## Entrega 5 — Validação ponta a ponta e prontidão

### T-22 — Automatizar os fluxos essenciais com Playwright

- **Descrição:** Cobrir a experiência completa com respostas determinísticas
  interceptadas, sem depender da API externa.
- **Critérios de aceite:**
  - E2E cobre busca confirmada, busca vazia/sem resultados, seleção correta
    entre homônimos, Forecast e retry.
  - E2E valida cinco datas, detalhes horários, conversão sem novo request e
    pelo menos um viewport mobile.
  - Os fluxos essenciais incluem navegação por teclado e interceptam as
    chamadas com fixtures.
- **Dependências:** T-10, T-17, T-19, T-20, T-21.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`,
  `tests/fixtures/`, `playwright.config.ts`.
- **Tipo:** Test

### T-23 — Validar compatibilidade e acessibilidade manual

- **Descrição:** Executar a validação manual de navegadores, dispositivos e
  leitores de tela prevista para a publicação.
- **Critérios de aceite:**
  - Fluxos principais são verificados nas versões estáveis atuais e anteriores
    de Chrome, Edge, Firefox e Safari desktop, e nas versões atuais de Safari
    iOS e Chrome Android.
  - Revisão manual WCAG 2.2 AA inclui NVDA/Firefox/Windows e
    VoiceOver/Safari/iOS.
  - Falhas são registradas com ambiente, fluxo e resultado; bloqueadores são
    corrigidos antes da publicação.
- **Dependências:** T-21, T-22.
- **Arquivos prováveis:** `tests/e2e/`, `docs/validation/`.
- **Tipo:** Test

### T-24 — Medir desempenho, resiliência e disponibilidade

- **Descrição:** Validar os limites de desempenho e timeout e preparar a
  verificação externa de disponibilidade da interface.
- **Critérios de aceite:**
  - São medidas 100 operações bem-sucedidas de geocoding e 100 de Forecast na
    rede controlada especificada; p95 é de até 3 segundos e falhas/timeouts
    são reportados separadamente.
  - Cada operação encerra em até 10 segundos e falhas permitem retry manual
    sem exibir cache como atual.
  - A disponibilidade mensal da interface é acompanhada por verificações
    externas a cada minuto, separada da disponibilidade do provedor, com meta
    de 99,5%.
- **Dependências:** T-22.
- **Arquivos prováveis:** `tests/e2e/`, `.github/workflows/`, documentação de
  operação ou configuração do monitor externo.
- **Tipo:** Infra

### T-25 — Executar validação moderada de usabilidade

- **Descrição:** Avaliar se o público geral consegue completar a tarefa
  principal sem treinamento ou ajuda.
- **Critérios de aceite:**
  - O teste é moderado com 10 participantes, cenários e cidades definidos
    previamente, sem coletar a métrica por telemetria.
  - Pelo menos 9 participantes concluem busca, consulta atual e identificação
    correta das cinco datas.
  - Resultados e impedimentos são registrados para orientar correções antes
    da publicação.
- **Dependências:** T-22.
- **Arquivos prováveis:** `docs/validation/usability-test.md`.
- **Tipo:** Test

### T-26 — Confirmar condições de publicação do provedor

- **Descrição:** Revisar termos e limites vigentes do Open-Meteo antes de
  publicar o aplicativo.
- **Critérios de aceite:**
  - Termos e limites permitem o uso pretendido sem API key e a atribuição
    permanece visível com link.
  - Se o uso não for permitido, a publicação fica bloqueada até configurar
    acesso permitido; o provedor não é substituído sem revisão da spec.
  - A política de privacidade descreve o compartilhamento e retenção conforme
    os termos publicados.
- **Dependências:** T-20.
- **Arquivos prováveis:** `docs/privacy-policy.md`,
  documentação de publicação.
- **Tipo:** Infra
