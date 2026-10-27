<div align="center">

# SDD Weather App

### Treinamento hands-on de **Spec-Driven Development** com **GitHub Copilot**

**Brief → Spec → Plan → Tasks → Code → Test → Review → Ship**

</div>

---

Este repositório é um **laboratório de treinamento de 8 horas** que ensina a
construir software guiado por especificação (**Spec-Driven Development**) usando
o **GitHub Copilot** em todas as etapas. O projeto final é um **Weather App** em
React + TypeScript que consome a API Open-Meteo.

> ## Princípio central
> **NÃO COMECE PELO CÓDIGO.** Sempre: **Spec → Plan → Tasks → Code.**

---

## O workshop

Comece pelo **[Guia do Workshop](workshop/GUIDE.md)** e siga os módulos em ordem.

| # | Módulo | Fase | Duração |
| --- | --- | --- | --- |
| 01 | [Setup](workshop/module-01-setup/README.md) | Preparação | 30 min |
| 02 | [Understanding the Problem](workshop/module-02-discovery/README.md) | Discovery | 45 min |
| 03 | [Writing the Specification](workshop/module-03-spec/README.md) | Spec | 50 min |
| 04 | [Creating the Technical Plan](workshop/module-04-plan/README.md) | Plan | 45 min |
| 05 | [Breaking Down Tasks](workshop/module-05-tasks/README.md) | Tasks | 40 min |
| 06 | [Building the UI](workshop/module-06-ui/README.md) | Code | 60 min |
| 07 | [Integrating APIs](workshop/module-07-api/README.md) | Code | 60 min |
| 08 | [Testing](workshop/module-08-testing/README.md) | Test | 55 min |
| 09 | [Hardening](workshop/module-09-hardening/README.md) | Test | 50 min |
| 10 | [Pull Request Review](workshop/module-10-review/README.md) | Review | 45 min |
| 11 | [Delivery (GitHub Pages)](workshop/module-11-delivery/README.md) | Ship | 30 min |

Cada módulo tem **README.md**, **challenge.md**, **prompts.md** e
**solution.md**.

---

## Começando

### Pré-requisitos

- **Node.js**
- **pnpm** (único gerenciador de pacotes suportado — habilite com `corepack enable`)
- **GitHub Copilot** habilitado no VS Code
- Git e uma conta no GitHub (para PR e deploy)

> O repositório inclui um **DevContainer** com tudo pré-configurado. Abra em um
> Codespace ou em "Reopen in Container" e pule a instalação manual.

### Instalação

```bash
pnpm install
pnpm exec playwright install   # navegadores para os testes E2E
```

### Scripts

```bash
pnpm dev             # servidor de desenvolvimento (Vite)
pnpm build           # build de produção
pnpm preview         # serve o build localmente
pnpm lint            # Biome (lint)
pnpm format          # Biome (formatação)
pnpm check           # Biome (lint + formatação)
pnpm test            # testes unitários (Vitest)
pnpm test:coverage   # cobertura
pnpm test:e2e        # testes E2E (Playwright)
```

---

## Arquitetura do app

```text
src/
├── components/      # apresentação (um componente por arquivo)
│   └── states/      # loading, erro, vazio
├── hooks/           # orquestração (useWeather)
├── services/        # acesso a dados (Open-Meteo) isolado
├── lib/             # funções puras (conversão, formatação, códigos WMO)
├── types/           # contratos compartilhados
├── styles/          # Tailwind + estilos globais
├── App.tsx          # composição da tela
└── main.tsx         # bootstrap React
```

Decisões-chave:

- **Temperaturas em Celsius** internamente; conversão só na apresentação (o
  toggle °C/°F **não** faz nova requisição).
- **Rede isolada** em `services/` — componentes e hooks não conhecem URLs.
- Sempre tratar **loading**, **erro** e **vazio**.

### Aplicação atual — integração P7.5

O App usa `useWeather` e os serviços Open-Meteo. Inicia em **idle**, sem consulta
automática: digitar não envia requests, apenas confirmar uma busca não vazia.
A primeira cidade é selecionada automaticamente; a lista mantém nome, região e
país para escolher outra localidade, inclusive homônimos. A busca e os botões
de cidades ficam desabilitados durante loading. Erro oferece nova tentativa da
operação que falhou (Geocoding ou Forecast), sem apresentar dados antigos.
Vazio distingue nenhuma cidade encontrada de condições indisponíveis.

A unidade inicia em Celsius e persiste em buscas, seleção, retry e todos os
estados. A conversão é somente visual para o painel e os cinco cards, sem nova
consulta ou alteração dos dados originais. A consulta e a cidade selecionada
são enviadas à Open-Meteo; não há dados de busca na URL da aplicação.

A observação apresenta o horário local informado pela fonte em pt-BR e seu
fuso, ou informa ausência. Não há classificação de recência/aviso de idade nem
tratamento completo de DST nesta fatia: **T-19/RF-05 ainda não estão completos**.
A fonte não fornece horário de atualização da previsão (`forecastUpdatedAt`
permanece null); a UI informa isso sem inventar datas. Detalhes horários (T-21),
validação E2E e conclusão integral de T-26/produção permanecem pendentes.

#### Histórico P6.7 — demo offline substituída

P6.7 compunha uma demonstração offline com `MOCK_WEATHER`, busca local de São
Paulo e seletor dos cinco estados. Essa UI foi substituída pela integração P7.5:
não há seletor demo nem fixture na UI de produção. `src/fixtures/weather.ts`
continua exportando dados determinísticos em Celsius para desenvolvimento e
testes; não representa uma consulta atual.

---

## Stack

- **TypeScript** (strict) · **React** · **Vite**
- **Tailwind CSS** (tema dark glassmorphism)
- **Vitest** + **Testing Library** (unit) · **Playwright** (E2E)
- **Biome** (lint + formatação)
- **pnpm** (gerenciador de pacotes)
- **Open-Meteo** (geocoding + forecast, sem API key)

---

## Copilot no fluxo SDD

A pasta `.github/` traz a inteligência do laboratório:

- **`agents/`** — personas especializadas: Spec, Plan, Task, Code, Test, Review.
- **`prompts/`** — prompts de produção para cada etapa.
- **`instructions/`** — convenções (React, Tailwind, Testing) aplicadas
  automaticamente.
- **`workflows/`** — CI (lint/build/test/e2e), deploy no Pages e validações que
  **impõem a ordem Spec → Plan → Tasks**.

Veja [AGENTS.md](AGENTS.md) para a descrição de cada agente.

---

## Idioma

- Narrativa, comentários e documentação: **pt-BR**.
- Identificadores de código, nomes de arquivos e termos técnicos: **en-US**.

---

<div align="center">

Construído com ❤️ para capacitar times em **Spec-Driven Development** usando o poder do GitHub Copilot.

</div>


## Componentes meteorológicos standalone (P6.3–P6.5)

```tsx
import UnitToggle from "./src/components/UnitToggle";
import CurrentWeather from "./src/components/CurrentWeather";
import ForecastList from "./src/components/ForecastList";
import ForecastCard from "./src/components/ForecastCard";
```

- `UnitToggle`: `{ unit: Unit, onChange: (unit: Unit) => void }`. Controlado;
  o consumidor é dono da unidade. Dois botões com `aria-pressed` e teclado
  nativo (Tab, Enter e Espaço), sem persistência nem estado interno duplicado.
- `CurrentWeather`: `{ city: City, current: CurrentWeather, unit: Unit }`.
- `ForecastList`: `{ forecastDays: ForecastDay[], unit: Unit }`; renderiza a
  ordem e as datas recebidas, incluindo dias parciais e estado vazio.
- `ForecastCard`: `{ day: ForecastDay, unit: Unit }`, também utilizável sozinho.

Os tipos vêm de `src/types/weather.ts`; `Unit` é `celsius | fahrenheit`.
Temperaturas internas são Celsius não arredondados; `src/lib/temperature.ts`
converte somente no render, com empates arredondados para longe de zero e sem
zero negativo. `src/lib/weatherCodes.ts` cobre a tabela WMO do Open-Meteo com
texto pt-BR e emoji decorativo. `src/lib/format.ts` valida datas civis estritas
YYYY-MM-DD e as apresenta em DD/MM/AAAA com UTC explícito, sem depender do fuso
do dispositivo nem inferir Hoje pelo índice.

Contrato adicional nullable (`number | null`):

| Campo | Unidade e domínio | Fonte prevista no Open-Meteo |
| --- | --- | --- |
| `current.precipitationMm` | mm, finito ≥ 0 | `current.precipitation` |
| `current.pressureHpa` | hPa, finito > 0, pressão **de superfície**, não ao nível do mar | `current.surface_pressure` |
| `ForecastDay.precipitationProbabilityPercent` | %, finito entre 0 e 100 | `daily.precipitation_probability_max` |

Nulidades são indisponíveis por campo; zero é dado válido. Sem temperatura
atual, o painel informa indisponibilidade geral e preserva as demais métricas.
Na entrega histórica P6, a validação de domínio na ingestão ainda pertencia ao
serviço futuro (implementado em P7.1–P7.4). A fixture
`MOCK_WEATHER` é fixa, não representa uma consulta atual e inclui essas métricas.
Historicamente, esta fatia P6 não incluía rede, hook, estados assíncronos ou
composição App. P7.5 integra esses componentes; expansão horária segue pendente.

### Serviços e hook (P7.1–P7.4, conectados ao App em P7.5)

O recorte original P7.1–P7.4 não conectava o App; P7.5 realiza essa integração.
`src/services/weatherService.ts` exporta `searchCities(name)` e `getWeather(city)`
e `WeatherServiceError`. Consultas usam somente Open-Meteo, sem cache ou retry
automático; o timeout de 10 s cobre headers e JSON.

Usado pelo App, `useWeather` (`src/hooks/useWeather.ts`) expõe
`status`, `data` (`WeatherData | null`), `cities`, `error` (`string | null`),
`query`, `search(name)`, `selectCity(city)` e `retry()`. Uma busca confirmada
seleciona a primeira cidade automaticamente, mantendo a lista para escolha
posterior. Retry repete apenas a operação falha; busca vazia volta a idle.
Estados loading/empty/error não mantêm dados antigos como atuais. Dados sem
métricas úteis produzem empty; dados parciais continuam disponíveis. Respostas
obsoletas ou após unmount são descartadas. A integração ao App está em P7.5;
validações E2E e demais requisitos de produção continuam pendentes.
