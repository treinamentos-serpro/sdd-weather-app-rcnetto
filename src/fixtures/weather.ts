import type { WeatherData } from '../types/weather';

/** Dados fixos para desenvolvimento e testes; não representam uma consulta atual. */
const firstDate = new Date('2026-05-10T00:00:00Z');
const days = Array.from({ length: 5 }, (_, offset) => {
  const date = new Date(firstDate);
  date.setUTCDate(firstDate.getUTCDate() + offset);
  const localDate = date.toISOString().slice(0, 10);
  const temperatureMaxC = 25 - offset;
  const temperatureMinC = 16 + (offset % 2);
  const temperatures = [temperatureMinC + 1, temperatureMaxC - 4, temperatureMaxC - 2];

  return {
    date: localDate,
    weatherCode: [2, 3, 61, 2, 1][offset],
    temperatureMaxC,
    temperatureMinC,
    precipitationProbabilityPercent: [20, 35, 80, 15, 5][offset],
    hours: ['06:00', '12:00', '18:00'].map((hour, index) => ({
      time: `${localDate}T${hour}`,
      weatherCode: [1, 2, 3][index],
      temperatureC: temperatures[index],
    })),
  };
});

export const MOCK_WEATHER: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    country: 'Brasil',
    region: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
  },
  timezone: 'America/Sao_Paulo',
  current: {
    observedAt: '2026-05-10T12:00',
    weatherCode: 2,
    temperatureC: 21,
    apparentTemperatureC: 22,
    temperatureMaxC: 25,
    temperatureMinC: 16,
    humidityPercent: 68,
    windSpeedKmh: 12,
    precipitationMm: 0,
    pressureHpa: 925.4,
  },
  forecastDays: days,
  forecastUpdatedAt: null,
};
