import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastCard from '../../../src/components/ForecastCard';
import ForecastList from '../../../src/components/ForecastList';
import { MOCK_WEATHER } from '../../../src/fixtures/weather';
import type { ForecastDay } from '../../../src/types/weather';

const { forecastDays } = MOCK_WEATHER;

describe('ForecastList e ForecastCard', () => {
  it('mostra cinco dias fixos na ordem, datas pt-BR, condições e chuva', () => {
    render(<ForecastList forecastDays={forecastDays} unit="celsius" />);
    expect(screen.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
    const list = screen.getByRole('list', { name: 'Dias da previsão' });
    expect(list).toHaveClass('grid', 'grid-cols-2', 'sm:grid-cols-3', 'lg:grid-cols-5');
    expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    expect(
      within(list)
        .getAllByRole('heading')
        .map((heading) => heading.textContent),
    ).toEqual(['10/05/2026', '11/05/2026', '12/05/2026', '13/05/2026', '14/05/2026']);
    expect(screen.queryByText(/Hoje/i)).not.toBeInTheDocument();
    const first = screen.getByRole('article', { name: '10/05/2026' });
    expect(within(first).getByText('Parcialmente nublado')).toBeVisible();
    expect(within(first).getByText('⛅')).toHaveAttribute('aria-hidden', 'true');
    expect(within(first).getByText('25 °C')).toBeVisible();
    expect(within(first).getByText('16 °C')).toBeVisible();
    expect(within(first).getByText('20%')).toBeVisible();
    expect(screen.getByText('Horário de atualização da previsão não fornecido.')).toBeVisible();
  });

  it('comunica lista vazia sem inventar cartões', () => {
    render(<ForecastList forecastDays={[]} unit="celsius" />);
    expect(screen.getByText('Previsão indisponível.')).toBeVisible();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('preserva datas e dados parciais, incluindo dia totalmente indisponível', () => {
    const days: ForecastDay[] = forecastDays.map((day) => ({ ...day }));
    days[1] = {
      ...days[1],
      weatherCode: null,
      temperatureMaxC: null,
      temperatureMinC: null,
      precipitationProbabilityPercent: null,
      hours: [],
    };
    days[2] = { ...days[2], temperatureMinC: null, precipitationProbabilityPercent: 0 };
    render(<ForecastList forecastDays={days} unit="celsius" />);
    expect(screen.getAllByRole('article')).toHaveLength(5);
    const unavailable = screen.getByRole('article', { name: '11/05/2026' });
    expect(within(unavailable).getByText('Previsão indisponível para este dia')).toBeVisible();
    expect(within(unavailable).getAllByText('Indisponível')).toHaveLength(3);
    const partial = screen.getByRole('article', { name: '12/05/2026' });
    expect(within(partial).getByText('Chuva fraca')).toBeVisible();
    expect(within(partial).getByText('23 °C')).toBeVisible();
    expect(within(partial).getByText('Indisponível')).toBeVisible();
    expect(within(partial).getByText('0%')).toBeVisible();
    expect(screen.getByRole('article', { name: '13/05/2026' })).toBeVisible();
  });

  it('rerender converte temperaturas de todos os dias sem alterar chuva ou dados originais', () => {
    const { rerender } = render(<ForecastList forecastDays={forecastDays} unit="celsius" />);
    rerender(<ForecastList forecastDays={forecastDays} unit="fahrenheit" />);
    const max = ['77 °F', '75 °F', '73 °F', '72 °F', '70 °F'];
    const rain = ['20%', '35%', '80%', '15%', '5%'];
    screen.getAllByRole('article').forEach((card, index) => {
      expect(within(card).getByText(max[index])).toBeVisible();
      expect(within(card).getByText(index % 2 === 0 ? '61 °F' : '63 °F')).toBeVisible();
      expect(within(card).getByText(rain[index])).toBeVisible();
    });
    rerender(<ForecastList forecastDays={forecastDays} unit="celsius" />);
    expect(
      within(screen.getByRole('article', { name: '10/05/2026' })).getByText('25 °C'),
    ).toBeVisible();
    expect(forecastDays[0].temperatureMaxC).toBe(25);
  });

  it('cartão standalone marca data inválida, WMO desconhecido e chuva nula sem inventar valores', () => {
    render(
      <ForecastCard
        day={{
          ...forecastDays[0],
          date: '2026-02-30',
          weatherCode: 999,
          precipitationProbabilityPercent: null,
        }}
        unit="celsius"
      />,
    );
    const card = screen.getByRole('article', { name: 'Data inválida' });
    expect(within(card).getByText('Condição indisponível')).toBeVisible();
    expect(within(card).getByText('Indisponível')).toBeVisible();
    expect(within(card).getByText('25 °C')).toBeVisible();
    expect(screen.queryByText('02/03/2026')).not.toBeInTheDocument();
  });
});
