import type { City, WeatherData } from '../../../src/types/weather';

export const city: City = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  region: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};
export const otherCity: City = { ...city, id: 2, country: 'Portugal', latitude: 39, longitude: -8 };
export const geocodingCity = {
  id: city.id,
  name: city.name,
  country: city.country,
  admin1: city.region,
  latitude: city.latitude,
  longitude: city.longitude,
};
export function forecastJson() {
  return {
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2026-10-28T12:15',
      temperature_2m: 22,
      apparent_temperature: 23,
      relative_humidity_2m: 80,
      weather_code: 3,
      wind_speed_10m: 10,
      precipitation: 0,
      surface_pressure: 1010,
    },
    daily: {
      time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
      weather_code: [0, 3, 61, 2, 1],
      temperature_2m_max: [20, 25, 22, 23, 24],
      temperature_2m_min: [10, 15, 12, 13, 14],
      precipitation_probability_max: [0, 100, 50, 20, 10],
    },
    hourly: {
      time: ['2026-10-28T00:00', '2026-10-28T01:00'],
      temperature_2m: [15, 14],
      weather_code: [3, 0],
    },
  };
}
export function weatherData(selectedCity: City = city): WeatherData {
  return {
    city: selectedCity,
    timezone: 'America/Sao_Paulo',
    forecastUpdatedAt: null,
    current: {
      observedAt: null,
      weatherCode: null,
      temperatureC: 22,
      apparentTemperatureC: null,
      temperatureMaxC: null,
      temperatureMinC: null,
      humidityPercent: null,
      windSpeedKmh: null,
      precipitationMm: null,
      pressureHpa: null,
    },
    forecastDays: Array.from({ length: 5 }, (_, i) => ({
      date: `2026-10-${27 + i}`,
      weatherCode: null,
      temperatureMaxC: null,
      temperatureMinC: null,
      precipitationProbabilityPercent: null,
      hours: [],
    })),
  };
}
