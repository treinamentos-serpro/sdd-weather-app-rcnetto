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

### Fixture e modo offline

`src/fixtures/weather.ts` exporta `MOCK_WEATHER`, uma fixture determinística
com dados em Celsius para desenvolvimento e testes. Ela não é uma resposta
atual da API. O modo demonstração offline inicia em sucesso, mostrando São Paulo
com cinco dias fixos e a data de observação da fixture, explicitamente não atual.
A busca só muda o resultado ao confirmar: aceita somente o nome completo
São Paulo (ignora espaços externos, caixa e acentos, não pontuação); qualquer
outro termo mostra sem resultados. Não consulta serviços nem renomeia a fixture.

O seletor **Modo demonstração — estado da tela** permite explorar Inicial,
Carregando, Sem resultados, Erro e Sucesso. Carregando desabilita a busca, mas
permite sair pelo seletor; nenhum timer simula uma consulta. O erro é apenas
uma demonstração: a nova tentativa manual repete a busca local pelo último
termo confirmado (ou São Paulo se ainda não houve busca), preservando o campo.
A unidade começa em Celsius e é mantida ao buscar ou trocar estados; a
conversão para Fahrenheit ocorre só na apresentação, sem alterar a fixture.
Não há chamadas de rede neste modo.

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
A validação de domínio na ingestão pertence ao serviço futuro. A fixture
`MOCK_WEATHER` é fixa, não representa uma consulta atual e inclui essas métricas.
Não há rede, hook, estados assíncronos, expansão horária nem integração dos
componentes no App nesta fatia; essa composição fica para P6.7/T-26.
