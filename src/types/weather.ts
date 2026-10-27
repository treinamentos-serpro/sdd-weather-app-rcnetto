/** Unidade usada para apresentar temperaturas; os dados internos permanecem em Celsius. */
export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  /** Identificador da localidade retornado pelo Geocoding. */
  id: number;
  /** Nome da cidade retornado pelo Geocoding. */
  name: string;
  /** País da cidade. */
  country: string;
  /** Região ou estado, quando disponível. */
  region?: string;
  /** Latitude usada para consultar a previsão. */
  latitude: number;
  /** Longitude usada para consultar a previsão. */
  longitude: number;
}

export interface CurrentWeather {
  /** Horário da observação fornecido pela API, interpretado no fuso local da cidade. */
  observedAt: string | null;
  /** Código WMO da condição atual; a descrição em português é derivada na aplicação. */
  weatherCode: number | null;
  /** Temperatura atual em graus Celsius. */
  temperatureC: number | null;
  /** Sensação térmica em graus Celsius. */
  apparentTemperatureC: number | null;
  /** Temperatura máxima do dia local em graus Celsius. */
  temperatureMaxC: number | null;
  /** Temperatura mínima do dia local em graus Celsius. */
  temperatureMinC: number | null;
  /** Umidade relativa em porcentagem, no intervalo de 0 a 100. */
  humidityPercent: number | null;
  /** Velocidade do vento em quilômetros por hora. */
  windSpeedKmh: number | null;
  /** Precipitação atual em mm, finita e não negativa. */
  precipitationMm: number | null;
  /** Pressão de superfície em hPa, finita e positiva; não reduzida ao nível do mar. */
  pressureHpa: number | null;
}

export interface HourlyForecast {
  /** Horário local do ponto previsto, conforme retornado para o fuso da cidade. */
  time: string;
  /** Código WMO da condição prevista para esse horário. */
  weatherCode: number | null;
  /** Temperatura prevista em graus Celsius. */
  temperatureC: number | null;
}

export interface ForecastDay {
  /** Data local no formato YYYY-MM-DD. */
  date: string;
  /** Código WMO da condição prevista para o dia. */
  weatherCode: number | null;
  /** Temperatura máxima diária em graus Celsius. */
  temperatureMaxC: number | null;
  /** Temperatura mínima diária em graus Celsius. */
  temperatureMinC: number | null;
  /** Probabilidade máxima diária de chuva em %, finita entre 0 e 100. */
  precipitationProbabilityPercent: number | null;
  /** Pontos horários da previsão pertencentes a este dia local. */
  hours: HourlyForecast[];
}

export interface WeatherData {
  /** Localidade selecionada para a consulta. */
  city: City;
  /** Fuso horário IANA usado para interpretar datas e horários. */
  timezone: string;
  /** Condições meteorológicas atuais. */
  current: CurrentWeather;
  /** Previsão de hoje e dos quatro dias seguintes, na ordem local. */
  forecastDays: ForecastDay[];
  /** Horário de atualização da previsão, somente se fornecido pela fonte. */
  forecastUpdatedAt: string | null;
}
