import { useId } from 'react';
import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecastDays: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecastDays, unit }: ForecastListProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="min-w-0 text-white">
      <h2 id={headingId} className="text-xl font-semibold">
        Previsão de 5 dias
      </h2>
      <p className="mt-2 text-sm text-slate-200">
        Horário de atualização da previsão não fornecido.
      </p>
      {forecastDays.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          Previsão indisponível.
        </p>
      ) : (
        <ul
          aria-label="Dias da previsão"
          className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {forecastDays.map((day) => (
            <li key={day.date} className="min-w-0">
              <ForecastCard day={day} unit={unit} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
