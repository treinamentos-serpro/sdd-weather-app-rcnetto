import { describe, expect, it } from 'vitest';
import { MOCK_WEATHER } from '../../../src/fixtures/weather';

describe('MOCK_WEATHER', () => {
  it('inclui métricas coerentes e determinísticas nas unidades do contrato', () => {
    expect(MOCK_WEATHER.current.precipitationMm).toBe(0);
    expect(MOCK_WEATHER.current.pressureHpa).toBe(925.4);
    expect(MOCK_WEATHER.forecastDays.map((day) => day.precipitationProbabilityPercent)).toEqual([
      20, 35, 80, 15, 5,
    ]);
    for (const day of MOCK_WEATHER.forecastDays) {
      expect(day.precipitationProbabilityPercent).toBeGreaterThanOrEqual(0);
      expect(day.precipitationProbabilityPercent).toBeLessThanOrEqual(100);
    }
  });

  it('fornece metadados consistentes e uma previsão para cinco dias', () => {
    expect(MOCK_WEATHER.city).toMatchObject({
      name: 'São Paulo',
      country: 'Brasil',
      region: 'São Paulo',
    });
    expect(MOCK_WEATHER.timezone).toBe('America/Sao_Paulo');
    expect(MOCK_WEATHER.forecastUpdatedAt).toBeNull();
    expect(MOCK_WEATHER.forecastDays).toHaveLength(5);

    const dates = MOCK_WEATHER.forecastDays.map(({ date }) => date);
    expect(dates).toEqual(['2026-05-10', '2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14']);
    expect(MOCK_WEATHER.current.observedAt?.slice(0, 10)).toBe(dates[0]);

    const { temperatureC, temperatureMinC, temperatureMaxC } = MOCK_WEATHER.current;
    expect(temperatureC).not.toBeNull();
    expect(temperatureMinC).not.toBeNull();
    expect(temperatureMaxC).not.toBeNull();
    if (temperatureC !== null && temperatureMinC !== null && temperatureMaxC !== null) {
      expect(temperatureC).toBeGreaterThanOrEqual(temperatureMinC);
      expect(temperatureC).toBeLessThanOrEqual(temperatureMaxC);
    }
  });

  it('mantém horas em ordem e no mesmo dia local de cada previsão', () => {
    for (const day of MOCK_WEATHER.forecastDays) {
      const hours = day.hours.map(({ time }) => time);
      expect(hours).toEqual([...hours].sort());
      expect(hours.every((time) => time.startsWith(`${day.date}T`))).toBe(true);
      expect(day.hours.length).toBeGreaterThan(0);
      for (const hour of day.hours) {
        expect(hour.temperatureC).not.toBeNull();
        expect(hour.temperatureC).toBeGreaterThanOrEqual(day.temperatureMinC!);
        expect(hour.temperatureC).toBeLessThanOrEqual(day.temperatureMaxC!);
      }
    }
  });
});
