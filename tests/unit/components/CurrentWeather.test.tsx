import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import { MOCK_WEATHER } from '../../../src/fixtures/weather';
import type { CurrentWeather as CurrentWeatherData } from '../../../src/types/weather';

const { city, current } = MOCK_WEATHER;
function expectMetric(label: string, value: string) {
  const metric = screen.getByText(label).parentElement!;
  expect(within(metric).getByRole('definition')).toHaveTextContent(value);
}

describe('CurrentWeather', () => {
  it('mostra cidade, região/país, hero, condição e todas as métricas em Celsius', () => {
    render(<CurrentWeather city={city} current={current} unit="celsius" />);
    expect(screen.getByRole('region', { name: 'São Paulo, São Paulo, Brasil' })).toBeVisible();
    expect(screen.getByLabelText('Temperatura atual: 21 °C')).toHaveTextContent('21 °C');
    expect(screen.getByText('Parcialmente nublado')).toBeVisible();
    expect(screen.getByText('⛅')).toHaveAttribute('aria-hidden', 'true');
    expectMetric('Sensação térmica', '22 °C');
    expectMetric('Máxima', '25 °C');
    expectMetric('Mínima', '16 °C');
    expectMetric('Umidade', '68%');
    expectMetric('Vento', '12 km/h');
    expectMetric('Precipitação', '0 mm');
    expectMetric('Pressão de superfície', '925,4 hPa');
  });

  it('converte todas as temperaturas do valor original ao rerender e preserva métricas', () => {
    const data = { ...current, temperatureC: 21.5, temperatureMinC: -2.5 };
    const { rerender } = render(<CurrentWeather city={city} current={data} unit="celsius" />);
    expect(screen.getByLabelText('Temperatura atual: 22 °C')).toBeVisible();
    rerender(<CurrentWeather city={city} current={data} unit="fahrenheit" />);
    expect(screen.getByLabelText('Temperatura atual: 71 °F')).toBeVisible();
    expectMetric('Sensação térmica', '72 °F');
    expectMetric('Máxima', '77 °F');
    expectMetric('Mínima', '28 °F');
    expectMetric('Precipitação', '0 mm');
    expectMetric('Pressão de superfície', '925,4 hPa');
    rerender(<CurrentWeather city={city} current={data} unit="celsius" />);
    expectMetric('Mínima', '-3 °C');
    expect(data.temperatureC).toBe(21.5);
  });

  it('marca cada campo nulo individualmente', () => {
    const empty: CurrentWeatherData = {
      observedAt: null,
      weatherCode: null,
      temperatureC: null,
      apparentTemperatureC: null,
      temperatureMaxC: null,
      temperatureMinC: null,
      humidityPercent: null,
      windSpeedKmh: null,
      precipitationMm: null,
      pressureHpa: null,
    };
    render(
      <CurrentWeather city={{ ...city, region: undefined }} current={empty} unit="fahrenheit" />,
    );
    expect(screen.getByRole('heading', { name: 'São Paulo, Brasil' })).toBeVisible();
    expect(screen.getByText('Condições atuais indisponíveis')).toBeVisible();
    expect(screen.getByLabelText('Temperatura atual: Indisponível')).toBeVisible();
    expect(screen.getByText('Condição indisponível')).toBeVisible();
    for (const label of [
      'Sensação térmica',
      'Máxima',
      'Mínima',
      'Umidade',
      'Vento',
      'Precipitação',
      'Pressão de superfície',
    ]) {
      expectMetric(label, 'Indisponível');
    }
  });

  it('preserva dados parciais sem temperatura atual e não inventa condição WMO', () => {
    render(
      <CurrentWeather
        city={city}
        current={{ ...current, temperatureC: null, weatherCode: 999, humidityPercent: null }}
        unit="celsius"
      />,
    );
    expect(screen.getByText('Condições atuais indisponíveis')).toBeVisible();
    expect(screen.getByText('Condição indisponível')).toBeVisible();
    expectMetric('Umidade', 'Indisponível');
    expectMetric('Sensação térmica', '22 °C');
    expectMetric('Vento', '12 km/h');
    expectMetric('Pressão de superfície', '925,4 hPa');
  });

  it('zero é dado disponível, não ausência', () => {
    render(
      <CurrentWeather
        city={city}
        current={{
          ...current,
          temperatureC: 0,
          apparentTemperatureC: 0,
          temperatureMaxC: 0,
          temperatureMinC: -0.1,
          humidityPercent: 0,
          windSpeedKmh: 0,
          precipitationMm: 0,
          weatherCode: 0,
        }}
        unit="celsius"
      />,
    );
    expect(screen.queryByText('Condições atuais indisponíveis')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Temperatura atual: 0 °C')).toBeVisible();
    expect(screen.getByText('Céu limpo')).toBeVisible();
    expectMetric('Umidade', '0%');
    expectMetric('Vento', '0 km/h');
    expectMetric('Precipitação', '0 mm');
    expectMetric('Mínima', '0 °C');
  });
});
