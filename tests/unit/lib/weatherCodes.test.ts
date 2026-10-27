import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../../src/lib/weatherCodes';

describe('códigos WMO', () => {
  it.each([
    [0, 'Céu limpo'],
    [1, 'Predominantemente limpo'],
    [2, 'Parcialmente nublado'],
    [3, 'Nublado'],
    [45, 'Nevoeiro'],
    [48, 'Nevoeiro com depósito de geada'],
    [51, 'Garoa fraca'],
    [53, 'Garoa moderada'],
    [55, 'Garoa intensa'],
    [56, 'Garoa congelante fraca'],
    [57, 'Garoa congelante intensa'],
    [61, 'Chuva fraca'],
    [63, 'Chuva moderada'],
    [65, 'Chuva forte'],
    [66, 'Chuva congelante fraca'],
    [67, 'Chuva congelante forte'],
    [71, 'Neve fraca'],
    [73, 'Neve moderada'],
    [75, 'Neve forte'],
    [77, 'Grãos de neve'],
    [80, 'Pancadas de chuva fracas'],
    [81, 'Pancadas de chuva moderadas'],
    [82, 'Pancadas de chuva violentas'],
    [85, 'Pancadas de neve fracas'],
    [86, 'Pancadas de neve fortes'],
    [95, 'Trovoada fraca ou moderada'],
    [96, 'Trovoada com granizo fraco'],
    [99, 'Trovoada com granizo forte'],
  ] as const)('traduz o código %s em pt-BR', (code, description) => {
    expect(getWeatherCondition(code).description).toBe(description);
    expect(getWeatherCondition(code).icon).toBeTruthy();
    expect(getWeatherCondition(code).icon).not.toBe('❔');
  });

  it.each([
    null,
    -1,
    4,
    100,
    999,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])('não inventa condição para %s', (code) => {
    expect(getWeatherCondition(code)).toEqual({ description: 'Condição indisponível', icon: '❔' });
  });
});
