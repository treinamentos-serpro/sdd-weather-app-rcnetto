import { useCallback, useEffect, useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'empty';
interface WeatherState {
  status: Status;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
}
type Operation = { type: 'search'; name: string } | { type: 'forecast'; city: City };

const initialState: WeatherState = {
  status: 'idle',
  data: null,
  cities: [],
  error: null,
  query: '',
};

function hasMetrics(data: WeatherData): boolean {
  const isMetric = (value: unknown) => typeof value === 'number' && Number.isFinite(value);
  return (
    Object.values(data.current).some(isMetric) ||
    data.forecastDays.some(
      (day) =>
        Object.values(day).some(isMetric) ||
        day.hours.some((hour) => isMetric(hour.temperatureC) || isMetric(hour.weatherCode)),
    )
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : 'Não foi possível consultar o clima. Tente novamente.';
}

/** Estado em memória; nenhuma integração automática com o App ou persistência. */
export function useWeather() {
  const [state, setState] = useState<WeatherState>(initialState);
  const generation = useRef(0);
  const mounted = useRef(true);
  const failed = useRef<Operation | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
    };
  }, []);

  const isCurrent = useCallback(
    (token: number) => mounted.current && token === generation.current,
    [],
  );

  const fail = useCallback(
    (token: number, operation: Operation, error: unknown) => {
      if (!isCurrent(token)) return;
      failed.current = operation;
      setState((previous) => ({
        ...previous,
        status: 'error',
        data: null,
        error: errorMessage(error),
      }));
    },
    [isCurrent],
  );

  const loadForecast = useCallback(
    async (city: City, token: number) => {
      try {
        const data = await getWeather(city);
        if (!isCurrent(token)) return;
        const usable = hasMetrics(data);
        setState((previous) => ({
          ...previous,
          status: usable ? 'success' : 'empty',
          data: usable ? data : null,
          error: null,
        }));
      } catch (error: unknown) {
        fail(token, { type: 'forecast', city }, error);
      }
    },
    [fail, isCurrent],
  );

  const search = useCallback(
    async (name: string): Promise<void> => {
      if (!mounted.current) return;
      const token = ++generation.current;
      failed.current = null;
      const query = name.trim();
      if (!query) {
        setState(initialState);
        return;
      }
      if (
        Array.from(name).some((char) => {
          const code = char.charCodeAt(0);
          return code < 32 || (code >= 127 && code <= 159);
        })
      ) {
        setState({
          ...initialState,
          query,
          status: 'error',
          error: 'O nome da cidade contém caracteres de controle inválidos.',
        });
        return;
      }
      setState({ ...initialState, query, status: 'loading' });
      try {
        const cities = await searchCities(query);
        if (!isCurrent(token)) return;
        setState({ ...initialState, query, cities, status: cities.length ? 'loading' : 'empty' });
        if (cities.length) await loadForecast(cities[0], token);
      } catch (error: unknown) {
        fail(token, { type: 'search', name: query }, error);
      }
    },
    [fail, isCurrent, loadForecast],
  );

  const selectCity = useCallback(
    async (city: City): Promise<void> => {
      if (!mounted.current) return;
      const token = ++generation.current;
      failed.current = null;
      setState((previous) => ({ ...previous, status: 'loading', data: null, error: null }));
      await loadForecast(city, token);
    },
    [loadForecast],
  );

  const retry = useCallback(async (): Promise<void> => {
    const operation = failed.current;
    if (operation?.type === 'search') await search(operation.name);
    if (operation?.type === 'forecast') await selectCity(operation.city);
  }, [search, selectCity]);

  return { ...state, search, selectCity, retry };
}
