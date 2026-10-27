import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../../src/hooks/useWeather';
import { getWeather, searchCities } from '../../../src/services/weatherService';
import type { City, WeatherData } from '../../../src/types/weather';
import { city, otherCity, weatherData } from '../services/weatherFixtures';

vi.mock('../../../src/services/weatherService', () => ({
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));
const searchMock = vi.mocked(searchCities);
const forecastMock = vi.mocked(getWeather);
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
function noMetrics(): WeatherData {
  const data = weatherData();
  data.current.temperatureC = null;
  data.current.observedAt = '2026-10-28T12:00';
  return data;
}
beforeEach(() => {
  searchMock.mockReset();
  forecastMock.mockReset();
  searchMock.mockResolvedValue([city, otherCity]);
  forecastMock.mockImplementation(async (selected) => weatherData(selected));
});

describe('useWeather estados e ações', () => {
  it('inicia idle sem rede, query vazia e sem erro/dados', async () => {
    const { result } = renderHook(useWeather);
    expect(result.current).toMatchObject({
      status: 'idle',
      query: '',
      cities: [],
      data: null,
      error: null,
    });
    await act(() => result.current.retry());
    expect(searchMock).not.toHaveBeenCalled();
    expect(forecastMock).not.toHaveBeenCalled();
  });
  it('trim, loading, primeira cidade automática e lista mantida durante forecast', async () => {
    const cities = deferred<City[]>();
    const weather = deferred<WeatherData>();
    searchMock.mockReturnValue(cities.promise);
    forecastMock.mockReturnValue(weather.promise);
    const { result } = renderHook(useWeather);
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.search('  São Paulo  ');
    });
    expect(result.current).toMatchObject({
      status: 'loading',
      query: 'São Paulo',
      data: null,
      error: null,
      cities: [],
    });
    expect(searchMock).toHaveBeenCalledExactlyOnceWith('São Paulo');
    await act(async () => {
      cities.resolve([city, otherCity]);
    });
    expect(result.current).toMatchObject({
      status: 'loading',
      cities: [city, otherCity],
      data: null,
    });
    expect(forecastMock).toHaveBeenCalledExactlyOnceWith(city);
    await act(async () => {
      weather.resolve(weatherData());
      await pending;
    });
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'São Paulo',
      cities: [city, otherCity],
      data: weatherData(),
      error: null,
    });
  });
  it('seleção manual consulta forecast direto sem perder lista/query', async () => {
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São'));
    await act(() => result.current.selectCity(otherCity));
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(forecastMock).toHaveBeenCalledTimes(2);
    expect(forecastMock).toHaveBeenLastCalledWith(otherCity);
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'São',
      cities: [city, otherCity],
      data: weatherData(otherCity),
    });
  });
  it('nova busca limpa dados/lista em loading e termina empty sem forecast se não há cidades', async () => {
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São'));
    const next = deferred<City[]>();
    searchMock.mockReturnValueOnce(next.promise);
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.search('  Nada  ');
    });
    expect(result.current).toMatchObject({
      status: 'loading',
      data: null,
      cities: [],
      query: 'Nada',
    });
    await act(async () => {
      next.resolve([]);
      await pending;
    });
    expect(result.current).toMatchObject({
      status: 'empty',
      data: null,
      error: null,
      cities: [],
      query: 'Nada',
    });
    expect(forecastMock).toHaveBeenCalledTimes(1);
  });
  it('retry geocoding refaz nome confirmado; elimina erro e dados antigos', async () => {
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São'));
    searchMock.mockRejectedValueOnce(new Error('Falha de rede.'));
    await act(() => result.current.search('  Lisboa  '));
    expect(result.current).toMatchObject({
      status: 'error',
      data: null,
      cities: [],
      query: 'Lisboa',
      error: 'Falha de rede.',
    });
    await act(() => result.current.retry());
    expect(searchMock).toHaveBeenCalledTimes(3);
    expect(searchMock).toHaveBeenLastCalledWith('Lisboa');
    expect(forecastMock).toHaveBeenCalledTimes(2);
    expect(result.current).toMatchObject({ status: 'success', error: null, query: 'Lisboa' });
  });
  it('retry após geocoding bom e forecast falho refaz SOMENTE forecast', async () => {
    forecastMock.mockRejectedValueOnce(new Error('A requisição demorou demais.'));
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('  São  '));
    expect(result.current).toMatchObject({
      status: 'error',
      query: 'São',
      cities: [city, otherCity],
      data: null,
      error: 'A requisição demorou demais.',
    });
    const next = deferred<WeatherData>();
    forecastMock.mockReturnValueOnce(next.promise);
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.retry();
    });
    expect(result.current).toMatchObject({
      status: 'loading',
      data: null,
      error: null,
      query: 'São',
      cities: [city, otherCity],
    });
    await act(async () => {
      next.resolve(weatherData());
      await pending;
    });
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(forecastMock.mock.calls).toEqual([[city], [city]]);
    expect(result.current.status).toBe('success');
    await act(() => result.current.retry());
    expect(forecastMock).toHaveBeenCalledTimes(2);
  });
  it('erro de seleção posterior limpa dado e retry usa cidade escolhida', async () => {
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São'));
    forecastMock.mockRejectedValueOnce(new Error('HTTP 500'));
    await act(() => result.current.selectCity(otherCity));
    expect(result.current).toMatchObject({
      status: 'error',
      data: null,
      cities: [city, otherCity],
      error: 'HTTP 500',
    });
    await act(() => result.current.retry());
    expect(forecastMock).toHaveBeenLastCalledWith(otherCity);
    expect(searchMock).toHaveBeenCalledTimes(1);
  });
  it('all-null é empty mesmo com timestamp e datas; partial é success', async () => {
    forecastMock.mockResolvedValueOnce(noMetrics());
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São'));
    expect(result.current).toMatchObject({
      status: 'empty',
      data: null,
      error: null,
      cities: [city, otherCity],
    });
    const partial = noMetrics();
    partial.forecastDays[3].precipitationProbabilityPercent = 0;
    forecastMock.mockResolvedValueOnce(partial);
    await act(() => result.current.selectCity(city));
    expect(result.current).toMatchObject({ status: 'success', data: partial });
    const hourly = noMetrics();
    hourly.forecastDays[0].hours = [
      { time: '2026-10-27T00:00', temperatureC: 0, weatherCode: null },
    ];
    forecastMock.mockResolvedValueOnce(hourly);
    await act(() => result.current.selectCity(city));
    expect(result.current).toMatchObject({ status: 'success', data: hourly });
  });
  it.each([
    null,
    undefined,
    { problem: 'bad' },
    'falha',
  ])('rejeição desconhecida nunca vira sucesso %j', async (reason) => {
    searchMock.mockRejectedValueOnce(reason);
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São'));
    expect(result.current).toMatchObject({
      status: 'error',
      data: null,
      error: 'Não foi possível consultar o clima. Tente novamente.',
    });
    forecastMock.mockRejectedValueOnce(reason);
    await act(() => result.current.retry());
    expect(result.current.status).toBe('error');
    expect(result.current.data).toBeNull();
  });
  it('vazio volta a idle e controle inválido tem feedback explícito, ambos sem rede', async () => {
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São'));
    searchMock.mockClear();
    forecastMock.mockClear();
    await act(() => result.current.search(' \t\r\n '));
    expect(result.current).toMatchObject({
      status: 'idle',
      data: null,
      cities: [],
      error: null,
      query: '',
    });
    await act(() => result.current.search('São\tPaulo'));
    expect(result.current).toMatchObject({
      status: 'error',
      data: null,
      cities: [],
      query: 'São\tPaulo',
    });
    expect(result.current.error).toContain('caracteres de controle');
    await act(() => result.current.retry());
    expect(searchMock).not.toHaveBeenCalled();
    expect(forecastMock).not.toHaveBeenCalled();
  });
});

describe('useWeather concorrência', () => {
  it('buscas A/B: resultado A tardio não substitui B nem inicia forecast', async () => {
    const a = deferred<City[]>();
    const b = deferred<City[]>();
    searchMock.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
    const { result } = renderHook(useWeather);
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = result.current.search('A');
    });
    act(() => {
      second = result.current.search('B');
    });
    await act(async () => {
      b.resolve([otherCity]);
      await second;
    });
    await act(async () => {
      a.resolve([city]);
      await first;
    });
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'B',
      cities: [otherCity],
      data: weatherData(otherCity),
    });
    expect(forecastMock).toHaveBeenCalledExactlyOnceWith(otherCity);
  });
  it('forecast A tardio não sobrescreve busca B bem sucedida', async () => {
    const a = deferred<WeatherData>();
    forecastMock.mockReturnValueOnce(a.promise);
    const { result } = renderHook(useWeather);
    let first!: Promise<void>;
    await act(async () => {
      first = result.current.search('A');
    });
    searchMock.mockResolvedValueOnce([otherCity]);
    await act(() => result.current.search('B'));
    await act(async () => {
      a.resolve(weatherData());
      await first;
    });
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'B',
      cities: [otherCity],
      data: weatherData(otherCity),
    });
  });
  it('seleção invalida busca pendente sem forecast extra nem lista tardia', async () => {
    const a = deferred<City[]>();
    searchMock.mockReturnValueOnce(a.promise);
    const { result } = renderHook(useWeather);
    let first!: Promise<void>;
    act(() => {
      first = result.current.search('A');
    });
    await act(() => result.current.selectCity(otherCity));
    await act(async () => {
      a.resolve([city]);
      await first;
    });
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'A',
      cities: [],
      data: weatherData(otherCity),
    });
    expect(forecastMock).toHaveBeenCalledExactlyOnceWith(otherCity);
  });
  it('seleção vs seleção e timeout tardio não habilitam retry da operação antiga', async () => {
    const a = deferred<WeatherData>();
    forecastMock.mockReturnValueOnce(a.promise);
    const { result } = renderHook(useWeather);
    let first!: Promise<void>;
    act(() => {
      first = result.current.selectCity(city);
    });
    await act(() => result.current.selectCity(otherCity));
    await act(async () => {
      a.reject(new Error('A requisição demorou demais.'));
      await first;
    });
    await act(() => result.current.retry());
    expect(result.current).toMatchObject({
      status: 'success',
      data: weatherData(otherCity),
      error: null,
    });
    expect(forecastMock).toHaveBeenCalledTimes(2);
  });
  it('retry pendente perde para busca nova, inclusive rejeição tardia', async () => {
    const old = deferred<WeatherData>();
    forecastMock
      .mockRejectedValueOnce(new Error('Falha de rede.'))
      .mockReturnValueOnce(old.promise);
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('A'));
    let retry!: Promise<void>;
    act(() => {
      retry = result.current.retry();
    });
    searchMock.mockResolvedValueOnce([otherCity]);
    await act(() => result.current.search('B'));
    await act(async () => {
      old.reject(new Error('A requisição demorou demais.'));
      await retry;
    });
    await act(() => result.current.retry());
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'B',
      data: weatherData(otherCity),
      cities: [otherCity],
    });
    expect(searchMock).toHaveBeenCalledTimes(2);
    expect(forecastMock).toHaveBeenCalledTimes(3);
  });
  it.each(['', '  ', '\t'])('busca vazia/inválida %j invalida forecast anterior', async (name) => {
    const a = deferred<WeatherData>();
    forecastMock.mockReturnValueOnce(a.promise);
    const { result } = renderHook(useWeather);
    let first!: Promise<void>;
    act(() => {
      first = result.current.selectCity(city);
    });
    await act(() => result.current.search(name));
    const snapshot = result.current;
    await act(async () => {
      a.resolve(weatherData());
      await first;
    });
    expect(result.current).toBe(snapshot);
    expect(result.current.data).toBeNull();
    expect(searchMock).not.toHaveBeenCalled();
  });
  it('unmount descarta geocoding sem iniciar forecast e ignora ações retidas', async () => {
    const a = deferred<City[]>();
    searchMock.mockReturnValueOnce(a.promise);
    const { result, unmount } = renderHook(useWeather);
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.search('A');
    });
    const snapshot = result.current;
    unmount();
    await act(async () => {
      a.resolve([city]);
      await pending;
    });
    await act(() => snapshot.search('B'));
    await act(() => snapshot.selectCity(otherCity));
    expect(result.current).toBe(snapshot);
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(forecastMock).not.toHaveBeenCalled();
  });
  it('unmount descarta forecast pendente e sua falha', async () => {
    const a = deferred<WeatherData>();
    forecastMock.mockReturnValueOnce(a.promise);
    const { result, unmount } = renderHook(useWeather);
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.selectCity(city);
    });
    const snapshot = result.current;
    unmount();
    await act(async () => {
      a.reject(new Error('Falha de rede.'));
      await pending;
    });
    expect(result.current).toBe(snapshot);
    await act(() => snapshot.retry());
    expect(forecastMock).toHaveBeenCalledTimes(1);
  });
});

describe('concorrência adicional', () => {
  it('busca nova invalida seleção manual pendente', async () => {
    const old = deferred<WeatherData>();
    forecastMock.mockReturnValueOnce(old.promise);
    const { result } = renderHook(useWeather);
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.selectCity(otherCity);
    });
    await act(() => result.current.search('São'));
    await act(async () => {
      old.resolve(weatherData(otherCity));
      await pending;
    });
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'São',
      data: weatherData(),
      cities: [city, otherCity],
    });
    expect(forecastMock).toHaveBeenCalledTimes(2);
  });
  it('erro geocoding A após B não habilita retry antigo', async () => {
    const old = deferred<City[]>();
    searchMock.mockReturnValueOnce(old.promise);
    const { result } = renderHook(useWeather);
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.search('A');
    });
    await act(() => result.current.search('B'));
    await act(async () => {
      old.reject(new Error('timeout'));
      await pending;
    });
    await act(() => result.current.retry());
    expect(result.current).toMatchObject({ status: 'success', query: 'B', error: null });
    expect(searchMock).toHaveBeenCalledTimes(2);
    expect(forecastMock).toHaveBeenCalledTimes(1);
  });
  it('busca vazia invalida geocoding pendente antes de chamar forecast', async () => {
    const old = deferred<City[]>();
    searchMock.mockReturnValueOnce(old.promise);
    const { result } = renderHook(useWeather);
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.search('A');
    });
    await act(() => result.current.search('  '));
    await act(async () => {
      old.resolve([city]);
      await pending;
    });
    expect(result.current).toMatchObject({ status: 'idle', query: '', data: null, cities: [] });
    expect(forecastMock).not.toHaveBeenCalled();
  });
  it('retry duplicado durante request não duplica requisições', async () => {
    const next = deferred<WeatherData>();
    forecastMock.mockRejectedValueOnce(new Error('offline')).mockReturnValueOnce(next.promise);
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São'));
    let first!: Promise<void>;
    act(() => {
      first = result.current.retry();
    });
    await act(() => result.current.retry());
    expect(forecastMock).toHaveBeenCalledTimes(2);
    await act(async () => {
      next.resolve(weatherData());
      await first;
    });
    expect(result.current.status).toBe('success');
  });
});
