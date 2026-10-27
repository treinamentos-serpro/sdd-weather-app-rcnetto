# Plano Técnico — Weather App

## Architecture

Aplicação React de página única, sem backend próprio, organizada em camadas pequenas com dependências direcionadas para dentro. A composição da tela conecta apresentação, estado/orquestração, serviços e funções puras:

```text
App
└── components ──> hooks ──> services ──> Open-Meteo
       │              │          │
       └──────────────┴──────────┴──> lib (funções puras)
                                      types (contratos compartilhados)
```

- **`components/` — apresentação:** componentes funcionais renderizam dados e estados, expõem controles acessíveis e emitem eventos por callbacks. Não contêm chamadas HTTP nem regras de transformação meteorológica; componentes de apresentação podem receber dados via props e o componente de tela pode consumir o hook.
- **`hooks/` — orquestração e estado:** coordenam busca, seleção de cidade e consulta meteorológica; controlam estados de loading, sucesso, vazio e erro, concorrência/timeout e unidade selecionada. Chamam `services/` e entregam à UI estado e ações, sem conhecer detalhes de URL ou formato bruto da API.
- **`services/` — acesso a dados:** encapsulam `fetch`, parâmetros e endpoints Open-Meteo, verificam erros HTTP/resposta e traduzem payloads externos para os contratos da aplicação. Não dependem de React nem renderizam UI; usam funções puras de `lib/` quando houver transformação reutilizável.
- **`lib/` — funções puras:** contém conversão e arredondamento de temperatura, formatação de datas/horas, mapeamento de códigos WMO e transformação/validação determinística de dados quando útil. Não faz I/O, não mantém estado e não depende de React.
- **`types/` — contratos:** define os tipos normalizados compartilhados, como `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `Unit`. Não importa camadas de execução.

`App.tsx` compõe o fluxo e `main.tsx` inicializa React. O fluxo de dependência não forma ciclos: components → hooks → services → lib; tipos são compartilhados sem importar implementação. Isso mantém detalhes da API fora da UI e permite substituir dependências por mocks nos testes.

## Tech Stack

- **React + TypeScript strict + Vite:** stack existente no repositório para uma aplicação web responsiva, com componentes funcionais e tipos explícitos.
- **Tailwind CSS:** estilização responsiva, conforme a stack e a arquitetura documentadas no repositório; a interface deve atender às larguras e aos critérios de acessibilidade da spec.
- **Open-Meteo Geocoding e Forecast:** fontes oficiais especificadas, sem API key nesta versão. Antes da publicação, confirmar que os termos e limites vigentes permitem o uso pretendido; se não permitirem, bloquear a publicação até configurar acesso permitido.
- **Vitest + Testing Library:** testes unitários e de componentes, conforme convenções do repositório; isolar a rede nos testes.
- **Playwright:** testes E2E dos fluxos principais e da experiência responsiva.
- **Biome e pnpm:** lint/formatação e gerenciamento de pacotes, de acordo com os scripts e convenções existentes.

## Project Structure

Manter a estrutura simples já documentada no `README.md`, acrescentando arquivos focados por responsabilidade à medida que forem necessários:

```text
src/
├── components/
│   ├── SearchForm.tsx       # Entrada e confirmação de busca
│   ├── CityResults.tsx      # Lista e seleção de cidades
│   ├── CurrentWeather.tsx   # Condições atuais
│   ├── ForecastList.tsx     # Dias e detalhes horários
│   └── states/              # Loading, erro e vazio
├── hooks/
│   └── useWeather.ts        # Estado e orquestração principal
├── services/
│   ├── geocodingService.ts  # Busca de cidades
│   └── forecastService.ts   # Consulta do clima e previsão
├── lib/
│   ├── weatherCodes.ts     # Código WMO → descrição
│   ├── temperature.ts      # Conversão e arredondamento
│   └── dateTime.ts         # Formatação no fuso local
├── types/
│   └── weather.ts          # Contratos compartilhados
├── styles/                 # Tailwind e estilos globais
├── App.tsx                 # Composição da página
└── main.tsx                # Inicialização React

tests/
├── unit/                    # Vitest e Testing Library
└── e2e/                     # Playwright
```

Os nomes são uma proposta, não uma exigência para criar todos os arquivos antecipadamente. Cada componente fica em seu próprio arquivo; extrair novos módulos apenas quando uma responsabilidade concreta exigir, sem adicionar repositórios, adaptadores ou gerenciadores globais de estado nesta versão.

### Testabilidade por camada

- **`lib/`:** testes unitários puros com entradas e saídas explícitas; cobrem conversão/arredondamento, códigos WMO, datas/fusos e normalização de casos parciais sem DOM ou rede.
- **`services/`:** testes com `fetch` mockado e fixtures JSON para validar parâmetros, mapeamento, respostas inválidas, erros HTTP e timeout, sem chamadas reais ao provedor.
- **`hooks/`:** testes de integração com os serviços mockados para verificar transições de estado, seleção, retry e descarte de respostas tardias.
- **`components/`:** testes com Testing Library focados em comportamento observável, roles/labels e interações; os dados podem ser passados como props ou fornecidos por hooks substituídos no limite do componente.
- **Fluxo completo:** Playwright intercepta as requisições com fixtures e valida o percurso de busca a previsão, incluindo viewport mobile. Assim, os E2E verificam a integração das camadas sem depender da disponibilidade da API externa.

## Data Model

Contratos conceituais TypeScript para os dados normalizados da Open-Meteo. Respostas externas devem ser validadas antes de chegar à UI. Valores ausentes ou inválidos são representados como `null`, nunca substituídos por dados inventados; dias sem previsão mantêm sua data e indicam os campos indisponíveis (RF-08).

```ts
/** Unidade usada para apresentar temperaturas; os dados internos permanecem em Celsius. */
export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  /** Identificador da localidade retornado pelo Geocoding. */
  id: number;
  /** Nome da cidade retornado pelo Geocoding. */
  name: string;
  /** País da cidade. */
  country: string;
  /** Região ou estado, quando disponível. */
  region?: string;
  /** Latitude usada para consultar a previsão. */
  latitude: number;
  /** Longitude usada para consultar a previsão. */
  longitude: number;
}

export interface CurrentWeather {
  /** Horário da observação fornecido pela API, interpretado no fuso local da cidade. */
  observedAt: string | null;
  /** Código WMO da condição atual; a descrição em português é derivada na aplicação. */
  weatherCode: number | null;
  /** Temperatura atual em graus Celsius. */
  temperatureC: number | null;
  /** Sensação térmica em graus Celsius. */
  apparentTemperatureC: number | null;
  /** Temperatura máxima do dia local em graus Celsius. */
  temperatureMaxC: number | null;
  /** Temperatura mínima do dia local em graus Celsius. */
  temperatureMinC: number | null;
  /** Umidade relativa em porcentagem, no intervalo de 0 a 100. */
  humidityPercent: number | null;
  /** Velocidade do vento em quilômetros por hora. */
  windSpeedKmh: number | null;
}

export interface HourlyForecast {
  /** Horário local do ponto previsto, conforme retornado para o fuso da cidade. */
  time: string;
  /** Código WMO da condição prevista para esse horário. */
  weatherCode: number | null;
  /** Temperatura prevista em graus Celsius. */
  temperatureC: number | null;
}

export interface ForecastDay {
  /** Data local no formato YYYY-MM-DD. */
  date: string;
  /** Código WMO da condição prevista para o dia. */
  weatherCode: number | null;
  /** Temperatura máxima diária em graus Celsius. */
  temperatureMaxC: number | null;
  /** Temperatura mínima diária em graus Celsius. */
  temperatureMinC: number | null;
  /** Pontos horários da previsão pertencentes a este dia local. */
  hours: HourlyForecast[];
}

export interface WeatherData {
  /** Localidade selecionada para a consulta. */
  city: City;
  /** Fuso horário IANA usado para interpretar datas e horários. */
  timezone: string;
  /** Condições meteorológicas atuais. */
  current: CurrentWeather;
  /** Previsão de hoje e dos quatro dias seguintes, na ordem local. */
  forecastDays: ForecastDay[];
  /** Horário de atualização da previsão, somente se fornecido pela fonte. */
  forecastUpdatedAt: string | null;
}
```

Temperaturas são mantidas em Celsius e convertidas apenas para apresentação conforme `Unit`, usando o valor original e arredondamento ao inteiro mais próximo; empates de 0,5 são arredondados para longe de zero. Isso evita divergências entre componentes e impede conversões sucessivas sobre valores já arredondados (RF-04). `weatherCode` é o código WMO retornado pela API; o mapeamento para descrições em português pertence à camada de apresentação/dominio. Não inferir horário de atualização da previsão a partir de horários de validade dos pontos previstos (RF-05).

## Data Flow

1. A pessoa digita um nome e confirma a busca. A aplicação remove espaços externos, rejeita caracteres de controle e não envia consultas vazias ou compostas apenas por espaços; pontuação legítima é mantida (RF-01, RF-07).
2. O hook inicia a busca e atualiza o estado para `loading`. O serviço de Geocoding consulta o provedor; o resultado é validado, normalizado e limitado a até 10 cidades, preservando a ordem recebida.
3. A UI exibe cidade, país e região/estado quando disponíveis. A seleção mantém a identidade exata do resultado, inclusive para homônimos (RF-01).
4. Ao selecionar uma cidade, o hook solicita clima e previsão usando as coordenadas dessa cidade. O serviço de Forecast valida e normaliza os dados, incluindo o fuso local.
5. O estado atualizado alimenta os componentes de condições atuais e de previsão. Os cinco dias mantêm suas datas mesmo quando algum deles não tiver dados; campos ausentes são marcados individualmente como indisponíveis (RF-02, RF-03, RF-08).
6. A pessoa pode expandir qualquer um dos cinco dias para consultar os pontos horários daquele dia local (RF-03). A alternância °C/°F converte os dados já carregados, sem nova requisição (RF-04).
7. A idade da observação é calculada em relação ao relógio atual em UTC; horários de apresentação são formatados em pt-BR e no fuso IANA da cidade (RF-05, RNF-07).

## External APIs

Usar somente os serviços oficiais definidos na spec. Não configurar chave nesta versão; revisar termos, limites e atribuição antes da publicação.

- **Geocoding**
  - **URL:** `https://geocoding-api.open-meteo.com/v1/search`
  - **Parâmetros:** `name` (termo confirmado, sem espaços externos), `count=10`, `language=pt`, `format=json`. A API já faz correspondência sem distinção de maiúsculas/minúsculas e acentos; não adicionar correção de erros de digitação. Resultados vazios podem vir sem a propriedade `results`.
  - **Exemplo resumido de resposta:**

    ```json
    {
      "results": [
        {
          "id": 2950159,
          "name": "Berlim",
          "latitude": 52.52437,
          "longitude": 13.41053,
          "country": "Alemanha",
          "admin1": "Berlim",
          "timezone": "Europe/Berlin"
        }
      ]
    }
    ```

  - **Mapeamento:** cada elemento de `results` vira um `City`: `id`, `name`, `country`, `admin1` → `region`, `latitude` e `longitude`. Preservar a ordem retornada e a identidade da localidade selecionada; o campo `timezone` do Geocoding não substitui o fuso retornado pela consulta Forecast.

- **Forecast**
  - **URL:** `https://api.open-meteo.com/v1/forecast`
  - **Parâmetros:** `latitude` e `longitude` da cidade selecionada; `current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`; `daily=weather_code,temperature_2m_max,temperature_2m_min`; `hourly=temperature_2m,weather_code`; `forecast_days=5`; `timezone=auto`; `temperature_unit=celsius`; `wind_speed_unit=kmh`.
  - Solicitar somente esses campos, manter as unidades normalizadas do modelo e não fazer atualização automática em segundo plano. `timezone=auto` faz a API devolver o identificador IANA e séries em horário local. Os arrays de cada granularidade são paralelos: os valores compartilham o índice correspondente ao item em `time`.
  - **Exemplo resumido de resposta:**

    ```json
    {
      "latitude": 52.52,
      "longitude": 13.42,
      "timezone": "Europe/Berlin",
      "utc_offset_seconds": 7200,
      "current": {
        "time": "2025-06-15T14:00",
        "temperature_2m": 22.4,
        "relative_humidity_2m": 48,
        "apparent_temperature": 22.1,
        "weather_code": 2,
        "wind_speed_10m": 12.6
      },
      "hourly": {
        "time": ["2025-06-15T15:00", "2025-06-15T16:00"],
        "temperature_2m": [22.0, 21.3],
        "weather_code": [2, 3]
      },
      "daily": {
        "time": ["2025-06-15", "2025-06-16"],
        "weather_code": [2, 3],
        "temperature_2m_max": [24.1, 21.8],
        "temperature_2m_min": [14.2, 13.9]
      }
    }
    ```

  - **Mapeamento para `WeatherData`:** `timezone` alimenta o fuso do modelo. `current.time` alimenta `current.observedAt`; `temperature_2m`, `apparent_temperature`, `relative_humidity_2m`, `wind_speed_10m` e `weather_code` alimentam os campos correspondentes de `CurrentWeather`. Associar `temperature_2m_max` e `temperature_2m_min` do dia local atual (`daily.time` correspondente à data local de `current.time`) às máximas/mínimas atuais. Cada índice de `daily.time` gera um `ForecastDay` com condição e máximas/mínimas do mesmo índice. Agrupar os arrays horários por data local; cada ponto mapeia `hourly.time`, `weather_code` e `temperature_2m` para um `HourlyForecast`. Manter os cinco dias e não deslocar datas quando dados estiverem ausentes.
  - Validar o tipo e o domínio de cada valor antes de normalizar: valores ausentes, nulos ou inválidos tornam apenas o campo correspondente `null`; resposta estruturalmente ilegível é falha. Converter códigos WMO em descrições em português na aplicação, sem enviar descrições inferidas como dados da API. A resposta não fornece um timestamp de atualização da previsão: `forecastUpdatedAt` fica `null`; `generationtime_ms` é duração de processamento, não horário de atualização.

Atribuir visivelmente os dados ao Open-Meteo com link, tanto na visão atual quanto na previsão. Informar na política de privacidade que a consulta é enviada ao provedor e divulgar a retenção conforme os termos publicados (RNF-08, RNF-09).

## State Management

Manter o estado em hooks React, sem biblioteca externa de gerenciamento global e sem persistência local. Separar o estado de busca do estado meteorológico para que cada operação tenha seu próprio loading, sucesso, vazio e erro (RF-06, RF-07).

O estado da tela inclui o termo editável, o último termo confirmado, os resultados da busca, a cidade selecionada, os dados meteorológicos, a unidade (`celsius` por padrão) e o estado de expansão dos detalhes horários. Unidade e expansão vivem apenas na memória da página e não são persistidas (RF-04, RNF-08).

Derivar valores formatados e convertidos a partir dos dados normalizados sempre que possível, em vez de duplicá-los no estado. Em buscas concorrentes, cancelar a operação anterior ou descartar sua resposta tardia; somente a busca mais recente pode atualizar resultados (critério de aceite RF-01).

## Error Handling

- **Loading:** indicar visualmente e de forma acessível cada busca ou consulta em andamento; encerrar o indicador em sucesso, resultado vazio ou falha (RF-07, RNF-05).
- **Busca vazia:** não chamar o serviço; orientar a pessoa a informar um nome e manter o campo editável (RF-07).
- **Busca sem resultados:** exibir estado vazio distinto de erro e permitir ajustar o termo (RF-07).
- **Falha de rede, API ou parsing:** informar que a operação não pôde ser concluída e oferecer nova tentativa manual, preservando o termo confirmado ou a cidade selecionada (RF-06). Usar timeout de 10 segundos por operação e não tratar parsing inválido como resposta válida.
- **Resposta tardia:** ignorar respostas de consultas anteriores que terminem após uma operação mais recente.
- **Dados incompletos ou inválidos:** apresentar cada campo válido e marcar individualmente como indisponíveis os valores ausentes, nulos ou fora do domínio (por exemplo, umidade fora de 0–100% e vento negativo). Sem temperatura atual, informar indisponibilidade das condições atuais e manter a previsão disponível. Dias ausentes não deslocam as datas; respostas ilegíveis são falhas (RF-08).
- **Atualidade:** observações com mais de 60 minutos podem ser exibidas apenas com aviso explícito. Timestamp ausente, inválido ou no futuro não deve ser identificado como recente. Se não houver horário de atualização da previsão, informar que ele não foi fornecido (RF-05, RNF-06).
- **Sem cache como fallback:** após falha, não apresentar dados em cache como atuais. Não implementar fallback para outro provedor nem atualização automática, conforme o escopo.
- **Acessibilidade:** tornar estados de loading, vazio e erro perceptíveis e anunciáveis por tecnologia assistiva; garantir foco visível e possibilidade de nova tentativa por teclado (RNF-05).

## Testing Strategy

- **Unitários com Vitest:** testar serviços com respostas externas controladas; normalização e validação, inclusive valores nulos e fora do domínio; mapeamento de códigos meteorológicos; conversão C/F e arredondamento, inclusive empates de 0,5 e conversão de negativos; cálculo de atualidade; formatação de datas/horas em pt-BR. Mockar a rede, sem chamar a API real.
- **Componentes com Testing Library:** verificar, por comportamento observável e queries acessíveis, estados de loading, vazio, erro, dados parciais, atribuição visível, seleção de unidade e expansão horária. Cobrir caminho feliz, erro, vazio e conversão.
- **E2E com Playwright:** interceptar chamadas com `page.route` e fixtures determinísticas. Validar busca após confirmação, rejeição de busca vazia, distinção e seleção de homônimos, clima da cidade selecionada, previsão de cinco datas, detalhes horários, alternância de unidade e nova tentativa. Incluir ao menos um viewport mobile e os fluxos de teclado relevantes.
- **Fuso e concorrência:** testar datas próximas à mudança de dia, fusos diferentes e horários locais repetidos; simular resposta tardia de uma busca anterior e confirmar que ela não substitui a mais recente.
- **Usabilidade:** conduzir teste moderado com 10 participantes do público geral, sem ajuda ou treinamento, usando cenários e cidades definidos previamente; ao menos 9 devem concluir busca, consulta atual e identificação correta das cinco datas. Não coletar essa métrica por telemetria (RNF-02).
- **Validação não funcional:** conferir larguras de 320, 375, 768, 1024 e 1440 px; as duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari em desktop; versões estáveis atuais de Safari em iOS e Chrome em Android. Validar WCAG 2.2 AA com avaliação automatizada e revisão manual, incluindo NVDA/Firefox/Windows e VoiceOver/Safari/iOS (RNF-01, RNF-05).
- **Desempenho e disponibilidade:** medir 100 operações bem-sucedidas de cada tipo em rede controlada de 10 Mbps de download, 2 Mbps de upload e 100 ms RTT; verificar p95 ≤ 3 s da ação até o conteúdo ficar visível. Reportar falhas/timeouts separadamente e encerrar cada operação em até 10 s. Verificar externamente a disponibilidade mensal de 99,5% da interface, separada da disponibilidade do provedor (RNF-03, RNF-04).

## Risks & Trade-offs

- **Dependência e termos do provedor:** indisponibilidade, limites ou mudança de condições podem impedir consultas; respostas parciais são possíveis. Mitigar revisando cobertura, limites, termos e atribuição antes da publicação e periodicamente. Bloquear publicação se o uso sem chave não for permitido; não substituir o provedor sem revisão da spec.
- **Ambiguidade geográfica:** homônimos ou variações podem levar à localidade errada. Exibir cidade, país e região quando disponíveis, preservar o identificador selecionado e não iniciar Forecast antes da seleção (RF-01).
- **Cobertura desigual ou dados antigos:** não inferir campos ausentes; sinalizar observações antigas e comunicar timestamps indisponíveis (RF-05, RF-08).
- **Fuso e calendário:** usar o fuso local devolvido para as séries e validar mudança de dia e de horário sazonal; preservar datas e identificação dos pontos horários para evitar deslocamentos (RF-03).
- **Conversão de unidades:** converter a partir dos Celsius não arredondados em um único ponto de apresentação. Isso evita nova requisição e reduz inconsistências, ao custo de manter o formato interno diferente de Fahrenheit (RF-04).
- **Simplicidade versus persistência:** estado apenas em memória evita armazenamento proibido e respeita a unidade temporária; recarregar a página restaura Celsius e não recupera consultas (RF-04, RNF-08).
- **Privacidade e telemetria:** não adicionar analytics, identificadores, cookies não essenciais ou armazenamento local. A consulta é compartilhada com o provedor e isso deve ser informado na política de privacidade (RNF-08).
- **Acessibilidade e compatibilidade:** cumprir WCAG 2.2 AA e validar navegadores/dispositivos previstos requer testes automatizados e revisão manual; não presumir conformidade apenas por testes E2E (RNF-01, RNF-05).
