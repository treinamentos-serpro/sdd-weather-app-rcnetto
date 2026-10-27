import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { MOCK_WEATHER } from '../../src/fixtures/weather';

const originalWeather = JSON.stringify(MOCK_WEATHER);
const fetchMock = vi.fn();
const selector = () => screen.getByRole('combobox', { name: 'Modo demonstração — estado da tela' });
const cityInput = () => screen.getByRole('searchbox', { name: 'Cidade' });
const currentRegion = () => screen.getByRole('region', { name: 'São Paulo, São Paulo, Brasil' });

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  try {
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.stringify(MOCK_WEATHER)).toBe(originalWeather);
  } finally {
    vi.unstubAllGlobals();
  }
});

function expectTemperatures(fahrenheit: boolean) {
  const current = within(currentRegion());
  expect(
    current.getByRole('heading', { name: `Temperatura atual: ${fahrenheit ? '70 °F' : '21 °C'}` }),
  ).toBeVisible();
  for (const value of fahrenheit ? ['72 °F', '77 °F', '61 °F'] : ['22 °C', '25 °C', '16 °C']) {
    expect(current.getByText(value)).toBeVisible();
  }
  const maxima = fahrenheit ? [77, 75, 73, 72, 70] : [25, 24, 23, 22, 21];
  const minima = fahrenheit ? [61, 63, 61, 63, 61] : [16, 17, 16, 17, 16];
  const suffix = fahrenheit ? '°F' : '°C';
  screen.getAllByRole('article').forEach((card, index) => {
    expect(within(card).getByText(`${maxima[index]} ${suffix}`)).toBeVisible();
    expect(within(card).getByText(`${minima[index]} ${suffix}`)).toBeVisible();
  });
  expect(screen.queryAllByText(fahrenheit ? /°C/ : /°F/, { selector: 'dd, h3' })).toHaveLength(0);
}

function expectNoWeather() {
  expect(
    screen.queryByRole('region', { name: 'São Paulo, São Paulo, Brasil' }),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Previsão de 5 dias' })).not.toBeInTheDocument();
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
  expect(screen.queryByText(/Observação fixa da demonstração/)).not.toBeInTheDocument();
}

describe('App — demonstração offline P6.7', () => {
  it('inicia em sucesso com clima, cinco dias fixos, Celsius e atribuição honesta', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1, name: 'Weather App' })).toBeVisible();
    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeVisible();
    expect(selector()).toHaveValue('success');
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    const list = screen.getByRole('list', { name: 'Dias da previsão' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expectTemperatures(false);
    expect(
      screen.getByText(/Modo demonstração offline: dados fixos de São Paulo, não atuais/),
    ).toBeVisible();
    expect(screen.getByText(/Observação fixa da demonstração \(não atual\)/)).toHaveTextContent(
      '10/05/2026 às 12:00 (America/Sao_Paulo)',
    );
    expect(screen.getByText('10/05/2026 às 12:00 (America/Sao_Paulo)')).toHaveAttribute(
      'datetime',
      MOCK_WEATHER.current.observedAt,
    );
    expect(screen.getByText('Horário de atualização da previsão não fornecido.')).toBeVisible();
    const attribution = screen.getByRole('link', { name: 'Open-Meteo' });
    expect(attribution).toHaveAttribute('href', 'https://open-meteo.com/');
    expect(attribution).toHaveAttribute('target', '_blank');
    expect(attribution).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('converte todas as temperaturas e volta aos valores originais sem rede ou mutação', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
    expectTemperatures(true);
    await user.click(screen.getByRole('button', { name: '°C' }));
    expectTemperatures(false);
  });

  it('oferece exatamente cinco estados acessíveis com conteúdo exclusivo e saída manual do loading', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(
      within(selector())
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['Inicial', 'Carregando', 'Sem resultados', 'Erro', 'Sucesso']);
    await user.selectOptions(selector(), 'idle');
    expect(
      screen.getByText('Modo demonstração: pesquise São Paulo para visualizar os dados fixos.'),
    ).toBeVisible();
    expectNoWeather();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.selectOptions(selector(), 'loading');
    expect(screen.getByRole('status')).toHaveTextContent(/Modo demonstração: carregando/);
    expect(screen.getByRole('status')).toHaveTextContent(/sem consulta em andamento/);
    expect(cityInput()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    expect(selector()).toBeEnabled();
    expectNoWeather();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/pesquise São Paulo para visualizar/)).not.toBeInTheDocument();

    await user.selectOptions(selector(), 'empty');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Modo demonstração: nenhuma cidade encontrada.',
    );
    expect(screen.getByRole('status')).not.toHaveTextContent(/carregando/);
    expect(cityInput()).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled();
    expectNoWeather();

    await user.selectOptions(selector(), 'error');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Modo demonstração: exemplo de erro, não uma falha real',
    );
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expectNoWeather();

    await user.selectOptions(selector(), 'success');
    expect(currentRegion()).toBeVisible();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
  });

  it.each([
    'São Paulo',
    '  Sao Paulo  ',
    '  sÃO pAuLo  ',
    'SAO PAULO',
  ])('encontra somente a cidade fixture ao confirmar %s', async (query) => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(selector(), 'idle');
    await user.type(cityInput(), query);
    expect(selector()).toHaveValue('idle');
    expectNoWeather();
    await user.keyboard('{Enter}');
    expect(selector()).toHaveValue('success');
    expect(currentRegion()).toBeVisible();
    expect(cityInput()).toHaveValue(query);
  });

  it.each([
    'Rio de Janeiro',
    'São',
    'Paulo',
    'Sao-Paulo',
    'São Paulo!',
    'São  Paulo',
  ])('mostra vazio para %s sem falsificar cidade ou aceitar prefixos/pontuação', async (query) => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(cityInput(), `  ${query}  `);
    expect(selector()).toHaveValue('success');
    expect(currentRegion()).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(selector()).toHaveValue('empty');
    expect(screen.getByRole('status')).toHaveTextContent(
      `nenhuma cidade encontrada para “${query}”`,
      { normalizeWhitespace: false },
    );
    expectNoWeather();
    await user.clear(cityInput());
    await user.type(cityInput(), 'Sao Paulo');
    expect(selector()).toHaveValue('empty');
    await user.keyboard('{Enter}');
    expect(currentRegion()).toBeVisible();
  });

  it('retry sem termo confirmado usa a fixture e preserva o rascunho do campo', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(cityInput(), 'Lisboa');
    await user.selectOptions(selector(), 'error');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(selector()).toHaveValue('success');
    expect(currentRegion()).toBeVisible();
    expect(cityInput()).toHaveValue('Lisboa');
  });

  it.each([
    ['  sAo PAULO  ', 'Lisboa', 'success'],
    ['  Lisboa  ', 'Sao Paulo', 'empty'],
  ])('retry repete o último termo confirmado %s, não o rascunho %s', async (query, draft, result) => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(cityInput(), query);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.clear(cityInput());
    await user.type(cityInput(), draft);
    await user.selectOptions(selector(), 'error');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(selector()).toHaveValue(result);
    expect(cityInput()).toHaveValue(draft);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    if (result === 'success') expect(currentRegion()).toBeVisible();
    else {
      expectNoWeather();
      expect(screen.getByRole('status')).toHaveTextContent('para “Lisboa”');
    }
  });

  it('mantém a unidade ao trocar estados, pesquisar e tentar novamente', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '°F' }));
    for (const state of ['idle', 'loading', 'empty', 'error', 'success']) {
      await user.selectOptions(selector(), state);
      expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
    }
    expectTemperatures(true);
    await user.type(cityInput(), 'Lisboa');
    await user.keyboard('{Enter}');
    expect(selector()).toHaveValue('empty');
    await user.selectOptions(selector(), 'error');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(selector()).toHaveValue('empty');
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
    await user.clear(cityInput());
    await user.type(cityInput(), 'São Paulo{Enter}');
    expectTemperatures(true);
    await user.click(screen.getByRole('button', { name: '°C' }));
    expectTemperatures(false);
  });
});
