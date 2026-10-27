import type { City, WeatherData } from '../types/weather';
import { fetchWithTimeout, WeatherServiceError } from './fetchWithTimeout';
import { mapCities, mapWeather, validCoordinates } from './weatherMappers';

export { WeatherServiceError } from './fetchWithTimeout';

export async function searchCities(name: string): Promise<City[]> {
  if (/[\u0000-\u001f\u007f-\u009f]/.test(name)) {
    throw new WeatherServiceError('O nome da cidade contém caracteres de controle inválidos.');
  }
  const query = name.trim();
  if (!query) return [];
  const json = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
  );
  return mapCities(json);
}

export async function getWeather(city: City): Promise<WeatherData> {
  if (!validCoordinates(city.latitude, city.longitude)) {
    throw new WeatherServiceError('As coordenadas da cidade são inválidas.');
  }
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,surface_pressure',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    hourly: 'temperature_2m,weather_code',
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });
  const json = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);
  return mapWeather(json, city);
}
