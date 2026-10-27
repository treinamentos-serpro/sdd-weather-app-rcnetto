import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';
import { city, forecastJson, geocodingCity } from './weatherFixtures';

const fetchMock = vi.fn<typeof fetch>();
function respond(json: unknown, status = 200) {
  const response = new Response(null, { status });
  vi.spyOn(response, 'json').mockResolvedValue(json);
  fetchMock.mockResolvedValueOnce(response);
  return response;
}
function requestedUrl(): URL {
  return new URL(String(fetchMock.mock.calls[0][0]));
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('searchCities', () => {
  it('codifica pontuação/Unicode e mapeia identidade, região e ordem, no máximo dez', async () => {
    respond({ results: Array.from({ length: 12 }, (_, i) => ({ ...geocodingCity, id: 50 - i })) });
    const cities = await searchCities('  São &/? José  ');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const raw = String(fetchMock.mock.calls[0][0]);
    expect(raw).toContain(`name=${encodeURIComponent('São &/? José')}`);
    expect(requestedUrl().origin + requestedUrl().pathname).toBe(
      'https://geocoding-api.open-meteo.com/v1/search',
    );
    expect(Object.fromEntries(requestedUrl().searchParams)).toEqual({
      name: 'São &/? José',
      count: '10',
      language: 'pt',
      format: 'json',
    });
    expect(cities).toEqual(Array.from({ length: 10 }, (_, i) => ({ ...city, id: 50 - i })));
  });
  it('aceita região ausente sem inventar valor', async () => {
    const { admin1: _, ...withoutRegion } = geocodingCity;
    respond({ results: [withoutRegion] });
    const { region: __, ...expected } = city;
    expect(await searchCities('São')).toEqual([expected]);
  });
  it.each([
    '',
    '   ',
    '\t',
    '\n',
    ' \t\r\n ',
  ])('retorna [] sem rede para vazio %j', async (input) => {
    expect(await searchCities(input)).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    'A\nB',
    'São\tPaulo',
    String.fromCharCode(0),
    String.fromCharCode(159),
  ])('rejeita controle %j antes da rede', async (input) => {
    await expect(searchCities(input)).rejects.toThrow(/caracteres de controle/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([{}, { results: [] }])('ausência de resultados é normal: %j', async (body) => {
    respond(body);
    expect(await searchCities('Nada')).toEqual([]);
  });
  it.each([
    null,
    [],
    { results: null },
    { results: {} },
    { results: [null] },
    { results: [{ ...geocodingCity, latitude: 91 }] },
    { results: [{ ...geocodingCity, id: '1' }] },
    { results: [{ ...geocodingCity, admin1: 5 }] },
  ])('estrutura inválida não vira vazio %j', async (body) => {
    respond(body);
    await expect(searchCities('São')).rejects.toThrow(WeatherServiceError);
  });
});

describe('getWeather', () => {
  it('usa endpoint/parâmetros completos e mapeia current/daily/hourly em Celsius', async () => {
    respond(forecastJson());
    const data = await getWeather(city);
    expect(requestedUrl().origin + requestedUrl().pathname).toBe(
      'https://api.open-meteo.com/v1/forecast',
    );
    expect(Object.fromEntries(requestedUrl().searchParams)).toEqual({
      latitude: '-23.55',
      longitude: '-46.63',
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
    expect(data.city).toBe(city);
    expect(data.timezone).toBe('America/Sao_Paulo');
    expect(data.forecastUpdatedAt).toBeNull();
    expect(data.current).toEqual({
      observedAt: '2026-10-28T12:15',
      temperatureC: 22,
      apparentTemperatureC: 23,
      weatherCode: 3,
      temperatureMaxC: 25,
      temperatureMinC: 15,
      humidityPercent: 80,
      windSpeedKmh: 10,
      precipitationMm: 0,
      pressureHpa: 1010,
    });
    expect(data.forecastDays).toHaveLength(5);
    expect(data.forecastDays[0].precipitationProbabilityPercent).toBe(0);
    expect(data.forecastDays[1].precipitationProbabilityPercent).toBe(100);
    expect(data.forecastDays[1].hours).toEqual([
      { time: '2026-10-28T00:00', temperatureC: 15, weatherCode: 3 },
      { time: '2026-10-28T01:00', temperatureC: 14, weatherCode: 0 },
    ]);
  });
  it.each([
    { latitude: 91 },
    { latitude: NaN },
    { longitude: 181 },
    { longitude: Infinity },
  ])('coordenadas inválidas sem rede %j', async (patch) => {
    await expect(getWeather({ ...city, ...patch })).rejects.toThrow(/coordenadas/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    null,
    {},
    { current: {} },
    { daily: {} },
    { current: [], daily: {} },
    { current: {}, daily: null },
  ])('rejeita current/daily ausentes ou ilegíveis %j', async (body) => {
    respond(body);
    await expect(getWeather(city)).rejects.toThrow(/estrutura/);
  });
  it.each([
    undefined,
    null,
    [],
    ['inválida'],
    ['2026-02-30'],
    ['2026-10-28', '2026-10-28'],
    ['2026-10-28', '2026-10-27'],
  ])('rejeita daily.time inválido %j', async (time) => {
    const body = forecastJson();
    respond({ ...body, daily: { ...body.daily, time } });
    await expect(getWeather(city)).rejects.toThrow(/estrutura/);
  });
  it.each([
    undefined,
    null,
    '',
    'Invalid/Zone',
    '+01:00',
  ])('rejeita fuso sem cair no default %j', async (timezone) => {
    respond({ ...forecastJson(), timezone });
    await expect(getWeather(city)).rejects.toThrow(/fuso horário inválido/);
  });
  it('mantém lacunas e índices originais em cinco datas consecutivas, cruzando mês', async () => {
    respond({
      timezone: 'UTC',
      current: { time: '2026-11-01T00:00' },
      daily: {
        time: ['2026-10-30', '2026-11-01'],
        temperature_2m_max: [0, 7],
        weather_code: [0],
        precipitation_probability_max: [0, 100],
      },
    });
    const data = await getWeather(city);
    expect(data.forecastDays.map((day) => day.date)).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
    ]);
    expect(data.forecastDays.map((day) => day.temperatureMaxC)).toEqual([0, null, 7, null, null]);
    expect(data.forecastDays.map((day) => day.weatherCode)).toEqual([0, null, null, null, null]);
    expect(data.current.temperatureMaxC).toBe(7);
    expect(data.current.temperatureMinC).toBeNull();
    expect(data.forecastDays.every((day) => day.hours.length === 0)).toBe(true);
  });
  it.each([
    undefined,
    'inválido',
    '2026-02-30T00:00',
    '2026-10-28T24:00',
    '2026-10-28T12:60',
    '2026-10-28T12:00:60',
    '2026-11-05T00:00',
  ])('não usa cegamente primeiro dia para current %j', async (time) => {
    const body = forecastJson();
    respond({ ...body, current: { time } });
    const data = await getWeather(city);
    expect(data.current.temperatureMaxC).toBeNull();
    expect(data.current.temperatureMinC).toBeNull();
    if (time !== '2026-11-05T00:00') expect(data.current.observedAt).toBeNull();
  });
  it('normaliza domínios inválidos, arrays curtos e preserva zeros e WMO desconhecido', async () => {
    respond({
      timezone: 'UTC',
      current: {
        temperature_2m: Infinity,
        apparent_temperature: '20',
        weather_code: 999,
        relative_humidity_2m: 101,
        wind_speed_10m: -1,
        precipitation: -1,
        surface_pressure: 0,
      },
      daily: {
        time: ['2026-10-27', '2026-10-28', '2026-10-29'],
        weather_code: [2.5, -1, 999],
        temperature_2m_max: [NaN, '30', 0],
        precipitation_probability_max: [-1, 101, 0],
      },
      hourly: {
        time: ['bad', '2026-10-28T00:00', '2026-10-28T01:00'],
        temperature_2m: [100, 0],
        weather_code: [1, 999, 2.5],
      },
    });
    const data = await getWeather(city);
    expect(data.current).toEqual({
      observedAt: null,
      temperatureC: null,
      apparentTemperatureC: null,
      temperatureMaxC: null,
      temperatureMinC: null,
      weatherCode: 999,
      humidityPercent: null,
      windSpeedKmh: null,
      precipitationMm: null,
      pressureHpa: null,
    });
    expect(data.forecastDays.map((day) => day.temperatureMaxC)).toEqual([
      null,
      null,
      0,
      null,
      null,
    ]);
    expect(data.forecastDays.map((day) => day.weatherCode)).toEqual([null, -1, 999, null, null]);
    expect(data.forecastDays.map((day) => day.precipitationProbabilityPercent)).toEqual([
      null,
      null,
      0,
      null,
      null,
    ]);
    expect(data.forecastDays[1].hours).toEqual([
      { time: '2026-10-28T00:00', temperatureC: 0, weatherCode: 999 },
      { time: '2026-10-28T01:00', temperatureC: null, weatherCode: null },
    ]);
  });
  it('aceita zeros meteorológicos, umidade 0/100 e pressão positiva', async () => {
    respond({
      ...forecastJson(),
      current: {
        temperature_2m: 0,
        apparent_temperature: 0,
        weather_code: 0,
        relative_humidity_2m: 0,
        wind_speed_10m: 0,
        precipitation: 0,
        surface_pressure: 1,
      },
    });
    const data = await getWeather(city);
    expect(data.current).toMatchObject({
      temperatureC: 0,
      apparentTemperatureC: 0,
      weatherCode: 0,
      humidityPercent: 0,
      windSpeedKmh: 0,
      precipitationMm: 0,
      pressureHpa: 1,
    });
  });
});

describe('transporte e timeout (via serviço público)', () => {
  it.each([400, 429, 500])('preserva erro HTTP %i e limpa timer', async (status) => {
    vi.useFakeTimers();
    respond({}, status);
    await expect(searchCities('São')).rejects.toThrow(`HTTP ${status}`);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('JSON ilegível é erro explícito e limpa timer', async () => {
    vi.useFakeTimers();
    const response = respond({});
    vi.mocked(response.json).mockRejectedValue(new SyntaxError('bad JSON'));
    await expect(searchCities('São')).rejects.toThrow('O serviço retornou JSON ilegível.');
    expect(vi.getTimerCount()).toBe(0);
  });
  it('falha de rede na leitura do body mantém a mensagem e limpa timer', async () => {
    vi.useFakeTimers();
    const response = respond({});
    vi.mocked(response.json).mockRejectedValue(new TypeError('stream interrupted'));
    await expect(searchCities('São')).rejects.toThrow('Falha de rede.');
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([
    new TypeError('offline'),
    { reason: 'offline' },
  ])('rede gera mensagem exata e limpa timer %j', async (error) => {
    vi.useFakeTimers();
    fetchMock.mockRejectedValue(error);
    await expect(searchCities('São')).rejects.toThrow('Falha de rede.');
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([
    new DOMException('aborted', 'AbortError'),
    Object.assign(new Error('abort'), { name: 'AbortError' }),
    { name: 'AbortError' },
  ])('reconhece AbortError sem instanceof frágil %j', async (error) => {
    fetchMock.mockRejectedValue(error);
    await expect(searchCities('São')).rejects.toThrow('A requisição demorou demais.');
  });
  it('sucesso e falha de mapping limpam timer sem abort tardio', async () => {
    vi.useFakeTimers();
    respond({});
    await searchCities('São');
    const signal = fetchMock.mock.calls[0][1]?.signal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(signal?.aborted).toBe(false);
    respond({ results: null });
    await expect(searchCities('São')).rejects.toThrow(WeatherServiceError);
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([
    false,
    true,
  ])('aborta exatamente em 10000 ms, incluindo body pendente=%j', async (pendingBody) => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async (_url, options) => {
      const pending = new Promise<never>((_, reject) => {
        options?.signal?.addEventListener('abort', () => reject({ name: 'AbortError' }));
      });
      if (!pendingBody) return pending;
      const response = new Response();
      vi.spyOn(response, 'json').mockReturnValue(pending);
      return response;
    });
    const request = searchCities('São');
    const assertion = expect(request).rejects.toThrow('A requisição demorou demais.');
    const signal = fetchMock.mock.calls[0][1]?.signal;
    await vi.advanceTimersByTimeAsync(9999);
    expect(signal?.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    await assertion;
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('domínios e limites das métricas', () => {
  const cases: [string, string, unknown, number | null][] = [
    ['temperature_2m', 'temperatureC', -2.5, -2.5],
    ['temperature_2m', 'temperatureC', NaN, null],
    ['temperature_2m', 'temperatureC', -Infinity, null],
    ['apparent_temperature', 'apparentTemperatureC', 0, 0],
    ['apparent_temperature', 'apparentTemperatureC', Infinity, null],
    ['relative_humidity_2m', 'humidityPercent', -0.01, null],
    ['relative_humidity_2m', 'humidityPercent', 0, 0],
    ['relative_humidity_2m', 'humidityPercent', 100, 100],
    ['relative_humidity_2m', 'humidityPercent', 100.01, null],
    ['relative_humidity_2m', 'humidityPercent', '50', null],
    ['relative_humidity_2m', 'humidityPercent', NaN, null],
    ['wind_speed_10m', 'windSpeedKmh', -0.01, null],
    ['wind_speed_10m', 'windSpeedKmh', 0, 0],
    ['wind_speed_10m', 'windSpeedKmh', Infinity, null],
    ['precipitation', 'precipitationMm', -0.01, null],
    ['precipitation', 'precipitationMm', 0, 0],
    ['precipitation', 'precipitationMm', 0.01, 0.01],
    ['precipitation', 'precipitationMm', NaN, null],
    ['surface_pressure', 'pressureHpa', -1, null],
    ['surface_pressure', 'pressureHpa', 0, null],
    ['surface_pressure', 'pressureHpa', 0.01, 0.01],
    ['surface_pressure', 'pressureHpa', Infinity, null],
    ['weather_code', 'weatherCode', 0, 0],
    ['weather_code', 'weatherCode', 999, 999],
    ['weather_code', 'weatherCode', -1, -1],
    ['weather_code', 'weatherCode', 1.5, null],
    ['weather_code', 'weatherCode', NaN, null],
    ['weather_code', 'weatherCode', '0', null],
  ];
  it.each(cases)('current %s -> %s (%j -> %j)', async (source, target, value, expected) => {
    respond({ ...forecastJson(), current: { [source]: value } });
    const data = await getWeather(city);
    expect(data.current).toHaveProperty(target, expected);
  });
  it.each([
    -0.01,
    0,
    100,
    100.01,
    NaN,
    Infinity,
    '50',
    null,
    undefined,
  ])('probabilidade diária aceita só finitos em [0,100]: %j', async (value) => {
    const body = forecastJson();
    respond({ ...body, daily: { ...body.daily, precipitation_probability_max: [value] } });
    const data = await getWeather(city);
    expect(data.forecastDays[0].precipitationProbabilityPercent).toBe(
      value === 0 || value === 100 ? value : null,
    );
    expect(data.forecastDays[1].precipitationProbabilityPercent).toBeNull();
  });
  it('current vazio e métricas diárias ausentes são null, sem inventar timestamp', async () => {
    respond({ timezone: 'UTC', current: {}, daily: { time: ['2024-02-28'] } });
    const data = await getWeather(city);
    expect(Object.values(data.current).every((value) => value === null)).toBe(true);
    expect(data.forecastDays.map((day) => day.date)).toEqual([
      '2024-02-28',
      '2024-02-29',
      '2024-03-01',
      '2024-03-02',
      '2024-03-03',
    ]);
    for (const day of data.forecastDays)
      expect(day).toMatchObject({
        temperatureMaxC: null,
        temperatureMinC: null,
        weatherCode: null,
        precipitationProbabilityPercent: null,
        hours: [],
      });
  });
  it.each([
    null,
    [],
    { time: 'bad' },
  ])('hourly ilegível não mascara erro como vazio: %j', async (hourly) => {
    respond({ ...forecastJson(), hourly });
    await expect(getWeather(city)).rejects.toThrow(WeatherServiceError);
  });
  it('hourly sem time é vazio e arrays métricos ilegíveis não viram números', async () => {
    respond({
      timezone: 'UTC',
      current: {},
      daily: { time: ['2026-10-27'], temperature_2m_max: '20', temperature_2m_min: {} },
      hourly: {},
    });
    const data = await getWeather(city);
    expect(data.forecastDays[0]).toMatchObject({
      temperatureMaxC: null,
      temperatureMinC: null,
      hours: [],
    });
  });
  it('Forecast também propaga HTTP como WeatherServiceError', async () => {
    respond({}, 503);
    await expect(getWeather(city)).rejects.toThrow('HTTP 503');
  });
  it('JSON pendente que ignora abort também não ultrapassa limite', async () => {
    vi.useFakeTimers();
    const response = respond({});
    vi.mocked(response.json).mockReturnValue(new Promise(() => {}));
    const pending = expect(getWeather(city)).rejects.toThrow('A requisição demorou demais.');
    await vi.advanceTimersByTimeAsync(9999);
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});

it('body completo antes do prazo limpa timer sem abort após headers', async () => {
  vi.useFakeTimers();
  let finish!: (value: unknown) => void;
  const body = new Promise<unknown>((resolve) => {
    finish = resolve;
  });
  const response = respond({});
  vi.mocked(response.json).mockReturnValue(body);
  const pending = searchCities('São');
  await vi.advanceTimersByTimeAsync(9999);
  expect(vi.getTimerCount()).toBe(1);
  finish({ results: [] });
  expect(await pending).toEqual([]);
  expect(vi.getTimerCount()).toBe(0);
  await vi.advanceTimersByTimeAsync(1);
  expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(false);
});

it('preserva WeatherServiceError já classificado na leitura JSON', async () => {
  const response = respond({});
  const error = new WeatherServiceError('Erro de leitura já classificado.');
  vi.mocked(response.json).mockRejectedValue(error);
  await expect(searchCities('São')).rejects.toBe(error);
});
