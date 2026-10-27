import { useState } from 'react';
import DemoWeatherContent, { type DemoState } from './components/DemoWeatherContent';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import { MOCK_WEATHER } from './fixtures/weather';
import type { Unit } from './types/weather';

const demoStates = [
  { value: 'idle', label: 'Inicial' },
  { value: 'loading', label: 'Carregando' },
  { value: 'empty', label: 'Sem resultados' },
  { value: 'error', label: 'Erro' },
  { value: 'success', label: 'Sucesso' },
] as const;

function normalizeCity(city: string): string {
  return city.trim().normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');
}

export default function App() {
  const [state, setState] = useState<DemoState>('success');
  const [unit, setUnit] = useState<Unit>('celsius');
  const [lastQuery, setLastQuery] = useState('');
  const { city } = MOCK_WEATHER;

  function searchLocal(query: string) {
    setLastQuery(query.trim());
    setState(normalizeCity(query) === normalizeCity(city.name) ? 'success' : 'empty');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-night-900 via-night-800 to-night-900 px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:p-6 lg:flex-row lg:items-end">
          <div className="lg:shrink-0">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
              Previsão do tempo
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Weather App</h1>
          </div>
          <div className="min-w-0 flex-1">
            <SearchBar onSearch={searchLocal} disabled={state === 'loading'} />
          </div>
          <div className="self-start lg:self-auto">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </header>

        <section aria-label="Controles do modo demonstração" className="space-y-4">
          <p className="max-w-prose text-slate-200">
            Modo demonstração offline: dados fixos de São Paulo, não atuais. Nenhuma API é
            consultada. Busque o nome completo São Paulo ou explore os estados da tela.
          </p>
          <div>
            <label htmlFor="demo-state" className="mb-2 block text-sm font-medium">
              Modo demonstração — estado da tela
            </label>
            <select
              id="demo-state"
              value={state}
              onChange={(event) => {
                const selected = demoStates.find((option) => option.value === event.target.value);
                if (selected) setState(selected.value);
              }}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-night-800 px-4 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 sm:w-auto"
            >
              {demoStates.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <DemoWeatherContent
          state={state}
          query={lastQuery}
          unit={unit}
          weather={MOCK_WEATHER}
          onRetry={() => searchLocal(lastQuery || city.name)}
        />

        <footer className="border-t border-white/10 pt-6 text-sm text-slate-200">
          Fonte meteorológica do projeto:{' '}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded text-accent-400 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
          >
            Open-Meteo
          </a>
          . Nesta demonstração, os dados são uma fixture local, não uma consulta atual.
        </footer>
      </div>
    </main>
  );
}
