import type { City, ForecastDay, HourlyForecast, WeatherData } from '../types/weather';
import { WeatherServiceError } from './fetchWithTimeout';

type RecordData = Record<string, unknown>;

export function isRecord(value: unknown): value is RecordData {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function validCoordinates(latitude: unknown, longitude: unknown): boolean {
  return (
    finite(latitude) && Math.abs(latitude) <= 90 && finite(longitude) && Math.abs(longitude) <= 180
  );
}

function unreadable(): never {
  throw new WeatherServiceError('O serviço retornou uma estrutura de dados ilegível.');
}

export function mapCities(value: unknown): City[] {
  if (!isRecord(value)) return unreadable();
  if (value.results === undefined) return [];
  if (!Array.isArray(value.results)) return unreadable();
  return value.results.slice(0, 10).map((item: unknown): City => {
    if (
      !isRecord(item) ||
      !finite(item.id) ||
      !Number.isInteger(item.id) ||
      typeof item.name !== 'string' ||
      !item.name.trim() ||
      typeof item.country !== 'string' ||
      !item.country.trim() ||
      !finite(item.latitude) ||
      !finite(item.longitude) ||
      !validCoordinates(item.latitude, item.longitude) ||
      (item.admin1 !== undefined && typeof item.admin1 !== 'string')
    )
      return unreadable();
    return {
      id: item.id,
      name: item.name,
      country: item.country,
      ...(typeof item.admin1 === 'string' ? { region: item.admin1 } : {}),
      latitude: item.latitude,
      longitude: item.longitude,
    };
  });
}

function metric(value: unknown, min = -Infinity, max = Infinity): number | null {
  return finite(value) && value >= min && value <= max ? value : null;
}

function code(value: unknown): number | null {
  return finite(value) && Number.isInteger(value) ? value : null;
}

function at(record: RecordData, key: string, index: number): unknown {
  const values = record[key];
  return Array.isArray(values) ? values[index] : undefined;
}

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function timestamp(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value))
    return null;
  if (!validDate(value.slice(0, 10))) return null;
  const hour = Number(value.slice(11, 13));
  const minute = Number(value.slice(14, 16));
  const second = value.length > 16 ? Number(value.slice(17, 19)) : 0;
  return hour < 24 && minute < 60 && second < 60 ? value : null;
}

function timezone(value: unknown): string {
  if (typeof value !== 'string' || !value || /^[+-]/.test(value)) {
    throw new WeatherServiceError('O serviço retornou um fuso horário inválido.');
  }
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: value });
    return value;
  } catch {
    throw new WeatherServiceError('O serviço retornou um fuso horário inválido.');
  }
}

function mapHours(value: unknown): HourlyForecast[] {
  if (value === undefined) return [];
  if (!isRecord(value)) return unreadable();
  if (value.time === undefined) return [];
  if (!Array.isArray(value.time)) return unreadable();
  return value.time.flatMap((raw: unknown, index: number): HourlyForecast[] => {
    const time = timestamp(raw);
    return time === null
      ? []
      : [
          {
            time,
            temperatureC: metric(at(value, 'temperature_2m', index)),
            weatherCode: code(at(value, 'weather_code', index)),
          },
        ];
  });
}

export function mapWeather(value: unknown, city: City): WeatherData {
  if (!isRecord(value) || !isRecord(value.current) || !isRecord(value.daily)) return unreadable();
  const zone = timezone(value.timezone);
  const { current, daily } = value;
  if (!Array.isArray(daily.time) || daily.time.length === 0) return unreadable();
  const dates: string[] = [];
  for (const date of daily.time) {
    if (!validDate(date) || (dates.length > 0 && date <= dates[dates.length - 1]))
      return unreadable();
    dates.push(date);
  }
  const hours = mapHours(value.hourly);
  const start = new Date(`${dates[0]}T00:00:00Z`);
  const forecastDays: ForecastDay[] = Array.from({ length: 5 }, (_, offset) => {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + offset);
    const date = day.toISOString().slice(0, 10);
    const index = dates.indexOf(date);
    return {
      date,
      weatherCode: code(at(daily, 'weather_code', index)),
      temperatureMaxC: metric(at(daily, 'temperature_2m_max', index)),
      temperatureMinC: metric(at(daily, 'temperature_2m_min', index)),
      precipitationProbabilityPercent: metric(
        at(daily, 'precipitation_probability_max', index),
        0,
        100,
      ),
      hours: hours.filter((hour) => hour.time.slice(0, 10) === date),
    };
  });
  const observedAt = timestamp(current.time);
  const currentIndex = observedAt === null ? -1 : dates.indexOf(observedAt.slice(0, 10));
  return {
    city,
    timezone: zone,
    current: {
      observedAt,
      weatherCode: code(current.weather_code),
      temperatureC: metric(current.temperature_2m),
      apparentTemperatureC: metric(current.apparent_temperature),
      temperatureMaxC: metric(at(daily, 'temperature_2m_max', currentIndex)),
      temperatureMinC: metric(at(daily, 'temperature_2m_min', currentIndex)),
      humidityPercent: metric(current.relative_humidity_2m, 0, 100),
      windSpeedKmh: metric(current.wind_speed_10m, 0),
      precipitationMm: metric(current.precipitation, 0),
      pressureHpa:
        finite(current.surface_pressure) && current.surface_pressure > 0
          ? current.surface_pressure
          : null,
    },
    forecastDays,
    forecastUpdatedAt: null,
  };
}
