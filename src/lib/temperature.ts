import type { Unit } from '../types/weather';

/** Converte sempre do Celsius original e arredonda empates para longe de zero. */
export function convertTemperature(celsius: number | null, unit: Unit): number | null {
  if (celsius === null || !Number.isFinite(celsius)) return null;
  const value = unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
  if (!Number.isFinite(value)) return null;
  const rounded = Math.sign(value) * Math.round(Math.abs(value));
  return rounded === 0 ? 0 : rounded;
}

export function formatTemperature(celsius: number | null, unit: Unit): string {
  const value = convertTemperature(celsius, unit);
  return value === null ? 'Indisponível' : `${value} °${unit === 'celsius' ? 'C' : 'F'}`;
}
