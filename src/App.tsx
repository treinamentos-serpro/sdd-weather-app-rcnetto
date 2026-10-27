import { useState } from 'react';
import CityResults from './components/CityResults';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import ErrorState from './components/states/ErrorState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import { formatForecastDate } from './lib/format';
import type { Unit } from './types/weather';

export default function App() {
  const { status, data, cities, error, query, search, selectCity, retry } = useWeather();
  const [unit, setUnit] = useState<Unit>('celsius');
  const [observedDate, observedTime] = data?.current.observedAt?.split('T') ?? [];
  const loading = status === 'loading';

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
            <SearchBar onSearch={search} disabled={loading} />
          </div>
          <div className="self-start lg:self-auto">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </header>

        <CityResults
          cities={cities}
          selectedCityId={data?.city.id}
          onSelect={selectCity}
          disabled={loading}
        />

        <div className="min-w-0 space-y-6">
          {status === 'idle' && (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              Pesquise uma cidade para consultar as condições atuais e a previsão de 5 dias.
            </p>
          )}
          {loading && (
            <p
              role="status"
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              Consultando o clima…
            </p>
          )}
          {status === 'empty' && (
            <p
              role="status"
              className="break-words rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              {cities.length === 0
                ? `Nenhuma cidade encontrada para “${query}”. Ajuste a pesquisa.`
                : 'Condições meteorológicas indisponíveis para esta cidade. Escolha outra localidade ou faça uma nova busca.'}
            </p>
          )}
          {(status === 'error' || (status === 'success' && data === null)) && (
            <ErrorState
              message={error ?? 'Não foi possível exibir os dados meteorológicos. Tente novamente.'}
              onRetry={retry}
            />
          )}
          {status === 'success' && data !== null && (
            <>
              <p className="text-sm text-slate-200">
                {observedDate && observedTime ? (
                  <>
                    Horário da observação informado pela fonte:{' '}
                    <time dateTime={data.current.observedAt ?? undefined}>
                      {formatForecastDate(observedDate)} às {observedTime.slice(0, 5)}
                      {data.timezone ? ` (${data.timezone})` : ''}
                    </time>
                  </>
                ) : (
                  'Horário da observação indisponível'
                )}
              </p>
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList forecastDays={data.forecastDays} unit={unit} />
            </>
          )}
        </div>

        <footer className="space-y-2 border-t border-white/10 pt-6 text-sm text-slate-200">
          <p>
            Dados meteorológicos:{' '}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded text-accent-400 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
            >
              Open-Meteo
            </a>
            .
          </p>
          <p>A consulta e a cidade selecionada são enviadas à Open-Meteo.</p>
        </footer>
      </div>
    </main>
  );
}
