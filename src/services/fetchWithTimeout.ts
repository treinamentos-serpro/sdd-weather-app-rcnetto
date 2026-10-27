export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  );
}

/** Retorna JSON unknown; o prazo inclui fetch e leitura completa do body. */
export async function fetchWithTimeout(url: string): Promise<unknown> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new WeatherServiceError('A requisição demorou demais.'));
      controller.abort();
    }, 10_000);
  });
  const request = async (): Promise<unknown> => {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new WeatherServiceError(`Falha ao consultar o serviço (HTTP ${response.status}).`);
    }
    try {
      const json: unknown = await response.json();
      return json;
    } catch (error: unknown) {
      if (isAbortError(error)) throw error;
      throw new WeatherServiceError('O serviço retornou JSON ilegível.');
    }
  };
  try {
    return await Promise.race([request(), timeout]);
  } catch (error: unknown) {
    if (error instanceof WeatherServiceError) throw error;
    throw new WeatherServiceError(
      isAbortError(error) ? 'A requisição demorou demais.' : 'Falha de rede.',
    );
  } finally {
    clearTimeout(timer);
  }
}
