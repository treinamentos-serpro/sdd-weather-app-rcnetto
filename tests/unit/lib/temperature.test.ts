import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature } from '../../../src/lib/temperature';
import type { Unit } from '../../../src/types/weather';

describe('temperatura', () => {
  it.each<[number, Unit, number]>([
    [21.4, 'celsius', 21],
    [21.5, 'celsius', 22],
    [-2.5, 'celsius', -3],
    [-0.5, 'celsius', -1],
    [0.5, 'celsius', 1],
    [-0.49, 'celsius', 0],
    [-0, 'celsius', 0],
    [0, 'celsius', 0],
    [0, 'fahrenheit', 32],
    [100, 'fahrenheit', 212],
    [-40, 'fahrenheit', -40],
    [1.25, 'fahrenheit', 34],
    [-18.75, 'fahrenheit', -2],
    [21.5, 'fahrenheit', 71],
  ])('%s °C em %s resulta em %s sem -0', (value, unit, expected) => {
    expect(convertTemperature(value, unit)).toBe(expected);
  });

  it.each([
    null,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('trata %s como indisponível', (value) => {
    expect(convertTemperature(value, 'celsius')).toBeNull();
    expect(convertTemperature(value, 'fahrenheit')).toBeNull();
    expect(formatTemperature(value, 'celsius')).toBe('Indisponível');
  });

  it('formata unidade e nunca reconverte valores já arredondados', () => {
    const original = 21.5;
    expect(formatTemperature(original, 'celsius')).toBe('22 °C');
    expect(formatTemperature(original, 'fahrenheit')).toBe('71 °F');
    expect(formatTemperature(original, 'celsius')).toBe('22 °C');
    expect(original).toBe(21.5);
    expect(formatTemperature(-0.1, 'celsius')).toBe('0 °C');
  });
});
