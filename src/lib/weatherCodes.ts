export interface WeatherCondition {
  description: string;
  icon: string;
}

/** Códigos de interpretação WMO publicados pelo Open-Meteo. */
const weatherCodes: Readonly<Record<number, WeatherCondition>> = {
  0: { description: 'Céu limpo', icon: '☀️' },
  1: { description: 'Predominantemente limpo', icon: '🌤️' },
  2: { description: 'Parcialmente nublado', icon: '⛅' },
  3: { description: 'Nublado', icon: '☁️' },
  45: { description: 'Nevoeiro', icon: '🌫️' },
  48: { description: 'Nevoeiro com depósito de geada', icon: '🌫️' },
  51: { description: 'Garoa fraca', icon: '🌦️' },
  53: { description: 'Garoa moderada', icon: '🌦️' },
  55: { description: 'Garoa intensa', icon: '🌧️' },
  56: { description: 'Garoa congelante fraca', icon: '🌧️' },
  57: { description: 'Garoa congelante intensa', icon: '🌧️' },
  61: { description: 'Chuva fraca', icon: '🌧️' },
  63: { description: 'Chuva moderada', icon: '🌧️' },
  65: { description: 'Chuva forte', icon: '🌧️' },
  66: { description: 'Chuva congelante fraca', icon: '🌧️' },
  67: { description: 'Chuva congelante forte', icon: '🌧️' },
  71: { description: 'Neve fraca', icon: '🌨️' },
  73: { description: 'Neve moderada', icon: '🌨️' },
  75: { description: 'Neve forte', icon: '🌨️' },
  77: { description: 'Grãos de neve', icon: '❄️' },
  80: { description: 'Pancadas de chuva fracas', icon: '🌦️' },
  81: { description: 'Pancadas de chuva moderadas', icon: '🌧️' },
  82: { description: 'Pancadas de chuva violentas', icon: '🌧️' },
  85: { description: 'Pancadas de neve fracas', icon: '🌨️' },
  86: { description: 'Pancadas de neve fortes', icon: '🌨️' },
  95: { description: 'Trovoada fraca ou moderada', icon: '⛈️' },
  96: { description: 'Trovoada com granizo fraco', icon: '⛈️' },
  99: { description: 'Trovoada com granizo forte', icon: '⛈️' },
};

const unavailable: WeatherCondition = { description: 'Condição indisponível', icon: '❔' };

export function getWeatherCondition(code: number | null): WeatherCondition {
  return code === null ? unavailable : (weatherCodes[code] ?? unavailable);
}
