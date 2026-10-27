import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatForecastDate, formatMetric } from '../../../src/lib/format';

afterEach(() => vi.unstubAllEnvs());

describe('datas civis em pt-BR', () => {
  it.each([
    'UTC',
    'America/Los_Angeles',
    'America/Sao_Paulo',
    'Pacific/Kiritimati',
  ])('preserva data no fuso do dispositivo %s', (timezone) => {
    vi.stubEnv('TZ', timezone);
    expect(formatForecastDate('2026-05-10')).toBe('10/05/2026');
    expect(formatForecastDate('2026-01-01')).toBe('01/01/2026');
    expect(formatForecastDate('2024-02-29')).toBe('29/02/2024');
    expect(formatForecastDate('2026-03-08')).toBe('08/03/2026');
    expect(formatForecastDate('0099-12-31')).toBe('31/12/0099');
  });

  it.each([
    '',
    '2026-2-01',
    '2026-02-29',
    '2026-04-31',
    '2026-00-10',
    '2026-13-01',
    '2026-01-00',
    '2026-01-32',
    '0000-01-01',
    '2026-05-10T00:00:00Z',
    ' 2026-05-10',
    '10/05/2026',
  ])('rejeita %s sem normalização silenciosa', (value) => {
    expect(formatForecastDate(value)).toBe('Data inválida');
  });
});

describe('métricas', () => {
  it('formata números pt-BR e preserva zeros', () => {
    expect(formatMetric(925.4, ' hPa')).toBe('925,4 hPa');
    expect(formatMetric(0, ' mm')).toBe('0 mm');
    expect(formatMetric(0, '%')).toBe('0%');
    expect(formatMetric(100, '%')).toBe('100%');
  });
  it.each([null, Number.NaN, Number.POSITIVE_INFINITY])('não inventa número para %s', (value) => {
    expect(formatMetric(value, ' mm')).toBe('Indisponível');
  });
});
