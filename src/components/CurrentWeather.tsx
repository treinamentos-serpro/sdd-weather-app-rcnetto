import { useId } from 'react';
import { formatMetric } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const headingId = useId();
  const condition = getWeatherCondition(current.weatherCode);
  const metrics = [
    ['Sensação térmica', formatTemperature(current.apparentTemperatureC, unit)],
    ['Máxima', formatTemperature(current.temperatureMaxC, unit)],
    ['Mínima', formatTemperature(current.temperatureMinC, unit)],
    ['Umidade', formatMetric(current.humidityPercent, '%')],
    ['Vento', formatMetric(current.windSpeedKmh, ' km/h')],
    ['Precipitação', formatMetric(current.precipitationMm, ' mm')],
    ['Pressão de superfície', formatMetric(current.pressureHpa, ' hPa')],
  ];

  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-glass backdrop-blur-md sm:p-6"
    >
      <h2 id={headingId} className="break-words text-xl font-semibold sm:text-2xl">
        {[city.name, city.region, city.country].filter(Boolean).join(', ')}
      </h2>
      <p className="mt-2 text-sm text-slate-200">Condições atuais</p>
      {current.temperatureC === null && (
        <p className="mt-2 text-slate-200">Condições atuais indisponíveis</p>
      )}
      <h3
        aria-label={`Temperatura atual: ${formatTemperature(current.temperatureC, unit)}`}
        className="mt-4 break-words text-5xl font-bold tracking-tight sm:text-7xl"
      >
        {formatTemperature(current.temperatureC, unit)}
      </h3>
      <p className="mt-3 flex items-center gap-3">
        <span aria-hidden="true" className="text-4xl">
          {condition.icon}
        </span>
        {condition.description}
      </p>
      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-xl bg-night-900/50 p-3">
            <dt className="text-sm text-slate-200">{label}</dt>
            <dd className="mt-1 break-words font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
