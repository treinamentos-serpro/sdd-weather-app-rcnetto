import { useId } from 'react';
import { formatForecastDate, formatMetric } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const headingId = useId();
  const condition = getWeatherCondition(day.weatherCode);
  const unavailable =
    day.weatherCode === null &&
    day.temperatureMaxC === null &&
    day.temperatureMinC === null &&
    day.precipitationProbabilityPercent === null;

  return (
    <article
      aria-labelledby={headingId}
      className="h-full min-w-0 rounded-2xl border border-white/10 bg-white/5 p-3 text-white shadow-glass backdrop-blur-md sm:p-4"
    >
      <h3 id={headingId} className="break-words font-semibold">
        {formatForecastDate(day.date)}
      </h3>
      <p className="mt-3">
        <span aria-hidden="true" className="text-3xl">
          {condition.icon}
        </span>
      </p>
      <p className="mt-2 break-words text-sm text-slate-200">{condition.description}</p>
      {unavailable && (
        <p className="mt-2 text-sm text-slate-200">Previsão indisponível para este dia</p>
      )}
      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-sm text-slate-200">Máxima</dt>
          <dd className="break-words font-semibold">
            {formatTemperature(day.temperatureMaxC, unit)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-200">Mínima</dt>
          <dd className="break-words font-semibold">
            {formatTemperature(day.temperatureMinC, unit)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-200">Probabilidade de chuva</dt>
          <dd className="break-words font-semibold">
            {formatMetric(day.precipitationProbabilityPercent, '%')}
          </dd>
        </div>
      </dl>
    </article>
  );
}
