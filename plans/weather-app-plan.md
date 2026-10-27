# Plano Técnico — Weather App

## Architecture

Aplicação React de página única, sem backend próprio. A interface aciona operações de busca e consulta; os serviços isolam a comunicação com o Open-Meteo e normalizam as respostas; hooks coordenam as operações e mantêm o estado apresentado pela UI.

```text
UI (App e components)
        ↕
Hooks (busca, consulta e estado da tela)
        ↕
Services (Geocoding e Forecast; validação e normalização)
        ↕
Open-Meteo (Geocoding API e Forecast API)
```

Os componentes não conhecem URLs nem fazem chamadas de rede. Funções puras em `lib/` ficam responsáveis por conversão, arredondamento e formatação. Essa separação atende RF-01 a RF-08 e permite testar a interface sem depender de chamadas reais.

## Tech Stack

- **React + TypeScript strict + Vite:** stack existente no repositório para uma aplicação web responsiva, com componentes funcionais e tipos explícitos.
- **Tailwind CSS:** estilização responsiva, conforme a stack e a arquitetura documentadas no repositório; a interface deve atender às larguras e aos critérios de acessibilidade da spec.
- **Open-Meteo Geocoding e Forecast:** fontes oficiais especificadas, sem API key nesta versão. Antes da publicação, confirmar que os termos e limites vigentes permitem o uso pretendido; se não permitirem, bloquear a publicação até configurar acesso permitido.
- **Vitest + Testing Library:** testes unitários e de componentes, conforme convenções do repositório; isolar a rede nos testes.
- **Playwright:** testes E2E dos fluxos principais e da experiência responsiva.
- **Biome e pnpm:** lint/formatação e gerenciamento de pacotes, de acordo com os scripts e convenções existentes.

## Project Structure

Manter a estrutura simples já documentada no `README.md`:

```text
src/
├── components/      # Apresentação; subcomponentes focados
│   └── states/      # Estados visuais de loading, erro e vazio
├── hooks/           # Orquestração do fluxo e estado da tela
├── services/        # Chamadas Open-Meteo, validação e normalização
├── lib/             # Conversão, formatação e mapeamento de códigos WMO
├── types/           # Contratos compartilhados
├── styles/          # Estilos globais e configuração visual
├── App.tsx          # Composição da tela
└── main.tsx         # Inicialização React

tests/
├── unit/            # Testes Vitest; comportamento observável
└── e2e/             # Fluxos de usuário Playwright
```

O hook coordena as operações; os serviços cuidam do acesso a dados; componentes apresentam os resultados e estados. Essa divisão segue a arquitetura existente e evita introduzir camadas adicionais sem necessidade.

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

- **Geocoding:** `https://geocoding-api.open-meteo.com/v1/search`
  - Enviar `name` com o termo confirmado e sem espaços externos; usar `count=10`, `language=pt` e `format=json`.
  - Exibir os resultados na ordem do provedor, sem paginação. Validar o comportamento de busca sem distinção de acentos e capitalização, sem adicionar correção de erros de digitação (RF-01).
  - Normalizar o resultado para `City`, preservando o identificador, coordenadas e metadados disponíveis para distinguir localidades homônimas.

- **Forecast:** `https://api.open-meteo.com/v1/forecast`
  - Enviar `latitude` e `longitude` da cidade selecionada.
  - Solicitar apenas os campos necessários: `current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`, `daily=weather_code,temperature_2m_max,temperature_2m_min` e `hourly=temperature_2m,weather_code`.
  - Solicitar `forecast_days=5`, `timezone=auto` e `wind_speed_unit=kmh`. Manter temperaturas internamente em Celsius e não solicitar atualização automática em segundo plano.
  - Usar as datas e horas locais devolvidas para a localidade, conservando metadados de fuso/offset necessários à normalização de timestamps e à distinção de horários locais repetidos (RF-02 a RF-05).

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
