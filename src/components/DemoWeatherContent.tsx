import { formatForecastDate } from '../lib/format';
import type { Unit, WeatherData } from '../types/weather';
import CurrentWeather from './CurrentWeather';
import ForecastList from './ForecastList';

export type DemoState = 'idle' | 'loading' | 'empty' | 'error' | 'success';

interface DemoWeatherContentProps {
  state: DemoState;
  query: string;
  unit: Unit;
  weather: WeatherData;
  onRetry: () => void;
}

export default function DemoWeatherContent({
  state,
  query,
  unit,
  weather,
  onRetry,
}: DemoWeatherContentProps) {
  const { city, current, forecastDays, timezone } = weather;
  const [observedDate, observedTime] = current.observedAt?.split('T') ?? [];
  return (
    <div className="min-w-0 space-y-6">
      {state === 'idle' && (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          Modo demonstração: pesquise São Paulo para visualizar os dados fixos.
        </p>
      )}
      {state === 'loading' && (
        <p
          role="status"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          Modo demonstração: carregando (apenas uma exibição, sem consulta em andamento). Use o
          seletor para sair deste estado.
        </p>
      )}
      {state === 'empty' && (
        <p
          role="status"
          className="break-words rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          Modo demonstração: nenhuma cidade encontrada{query ? ` para “${query}”` : ''}. Apenas São
          Paulo está disponível na busca local. Ajuste a pesquisa.
        </p>
      )}
      {state === 'error' && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <p role="alert">
            Modo demonstração: exemplo de erro, não uma falha real de conexão ou API. Tente
            novamente para executar a busca local.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 min-h-12 rounded-xl bg-accent-500 px-5 py-3 font-semibold text-night-900 hover:bg-accent-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Tentar novamente
          </button>
        </div>
      )}
      {state === 'success' && (
        <>
          <p className="text-sm text-slate-200">
            Observação fixa da demonstração (não atual):{' '}
            {observedDate && observedTime ? (
              <time dateTime={current.observedAt ?? undefined}>
                {formatForecastDate(observedDate)} às {observedTime} ({timezone})
              </time>
            ) : (
              'Horário não fornecido'
            )}
            .
          </p>
          <CurrentWeather city={city} current={current} unit={unit} />
          <ForecastList forecastDays={forecastDays} unit={unit} />
        </>
      )}
    </div>
  );
}
