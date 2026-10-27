import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { MOCK_WEATHER } from '../../src/fixtures/weather';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';
import { city, otherCity, weatherData } from './services/weatherFixtures';

vi.mock('../../src/services/weatherService', () => ({
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));
const searchMock = vi.mocked(searchCities);
const forecastMock = vi.mocked(getWeather);
const cityInput = () => screen.getByRole('searchbox', { name: 'Cidade' });
const cityName = (value: City) =>
  [value.name, value.region, value.country].filter(Boolean).join(', ');
const cityButton = (value: City) => screen.getByRole('button', { name: cityName(value) });
const fahrenheit = () => screen.getByRole('button', { name: '°F' });
const celsius = () => screen.getByRole('button', { name: '°C' });

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}
function weather(selected: City = city): WeatherData {
  return { ...structuredClone(MOCK_WEATHER), city: selected };
}
async function submit(user: ReturnType<typeof userEvent.setup>, query = 'São') {
  await user.clear(cityInput());
  await user.type(cityInput(), query);
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
}
async function expectSuccess(selected: City = city) {
  expect(await screen.findByRole('heading', { name: cityName(selected) })).toBeVisible();
  expect(screen.getAllByRole('article')).toHaveLength(5);
}
function expectNoWeather() {
  expect(screen.queryByRole('heading', { name: /Temperatura atual:/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Previsão de 5 dias' })).not.toBeInTheDocument();
}

beforeEach(() => {
  searchMock.mockReset();
  forecastMock.mockReset();
  searchMock.mockResolvedValue([city, otherCity]);
  forecastMock.mockImplementation(async (selected) => weather(selected));
});

describe('App integrado aos serviços via useWeather', () => {
  it('inicia idle sem requests nem demo e apresenta atribuição segura e aviso de compartilhamento', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeVisible();
    expect(screen.getByText(/Pesquise uma cidade/)).toBeVisible();
    expect(celsius()).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText(/demo|fixture|offline/i)).not.toBeInTheDocument();
    expectNoWeather();
    expect(searchMock).not.toHaveBeenCalled();
    expect(forecastMock).not.toHaveBeenCalled();
    const source = screen.getByRole('link', { name: 'Open-Meteo' });
    expect(source).toHaveAttribute('href', 'https://open-meteo.com/');
    expect(source).toHaveAttribute('target', '_blank');
    expect(source).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      screen.getByText('A consulta e a cidade selecionada são enviadas à Open-Meteo.'),
    ).toBeVisible();
  });

  it('não consulta ao digitar nem ao confirmar entrada vazia', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade');
    await user.type(cityInput(), '   ');
    await user.keyboard('{Enter}');
    await user.clear(cityInput());
    await user.type(cityInput(), 'São Paulo');
    expect(searchMock).not.toHaveBeenCalled();
    expect(forecastMock).not.toHaveBeenCalled();
    expectNoWeather();
  });

  it('busca confirmada mostra loading, desabilita busca/cidades e seleciona a primeira com cinco cards', async () => {
    const user = userEvent.setup();
    const cities = deferred<City[]>();
    const forecast = deferred<WeatherData>();
    searchMock.mockReturnValue(cities.promise);
    forecastMock.mockReturnValue(forecast.promise);
    render(<App />);
    await submit(user, '  São Paulo  ');
    expect(searchMock).toHaveBeenCalledExactlyOnceWith('São Paulo');
    expect(screen.getByRole('status')).toHaveTextContent('Consultando o clima');
    expect(cityInput()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    expectNoWeather();
    await act(async () => cities.resolve([city, otherCity]));
    expect(forecastMock).toHaveBeenCalledExactlyOnceWith(city);
    expect(cityButton(city)).toBeDisabled();
    expect(cityButton(otherCity)).toBeDisabled();
    await user.click(cityButton(otherCity));
    expect(forecastMock).toHaveBeenCalledTimes(1);
    await act(async () => forecast.resolve(weather()));
    await expectSuccess();
    expect(cityInput()).toBeEnabled();
    expect(cityButton(city)).toHaveAttribute('aria-current', 'true');
    expect(cityButton(otherCity)).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('list', { name: 'Dias da previsão' })).getAllByRole('listitem'),
    ).toHaveLength(5);
  });

  it('converte painel e todos os cards a partir do Celsius original sem mutações nem requests extras', async () => {
    const user = userEvent.setup();
    const data = weather();
    const original = JSON.stringify(data);
    forecastMock.mockResolvedValue(data);
    render(<App />);
    await submit(user);
    await expectSuccess();
    for (let cycle = 0; cycle < 2; cycle += 1) {
      await user.click(fahrenheit());
      expect(screen.getByRole('heading', { name: 'Temperatura atual: 70 °F' })).toBeVisible();
      const current = screen.getByRole('region', { name: cityName(city) });
      for (const value of ['72 °F', '77 °F', '61 °F'])
        expect(within(current).getByText(value)).toBeVisible();
      const cards = screen.getAllByRole('article');
      [77, 75, 73, 72, 70].forEach((max, index) => {
        expect(within(cards[index]).getByText(`${max} °F`)).toBeVisible();
        expect(within(cards[index]).getByText(`${index % 2 ? 63 : 61} °F`)).toBeVisible();
      });
      expect(screen.queryByText(/ °C/)).not.toBeInTheDocument();
      await user.click(celsius());
      expect(screen.getByRole('heading', { name: 'Temperatura atual: 21 °C' })).toBeVisible();
      [25, 24, 23, 22, 21].forEach((max, index) => {
        const card = screen.getAllByRole('article')[index];
        expect(within(card).getByText(`${max} °C`)).toBeVisible();
        expect(within(card).getByText(`${index % 2 ? 17 : 16} °C`)).toBeVisible();
      });
    }
    expect(JSON.stringify(data)).toBe(original);
    expect(JSON.stringify(MOCK_WEATHER)).toBe(JSON.stringify({ ...data, city: MOCK_WEATHER.city }));
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(forecastMock).toHaveBeenCalledTimes(1);
  });

  it('mantém query e unidade no erro de Geocoding e retry refaz busca antes de Forecast', async () => {
    const user = userEvent.setup();
    searchMock.mockRejectedValueOnce(new Error('Falha de rede.'));
    render(<App />);
    await user.click(fahrenheit());
    await submit(user, 'Porto');
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    expect(cityInput()).toHaveValue('Porto');
    expectNoWeather();
    expect(forecastMock).not.toHaveBeenCalled();
    const cities = deferred<City[]>();
    searchMock.mockReturnValueOnce(cities.promise);
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByRole('status')).toHaveTextContent('Consultando');
    expect(fahrenheit()).toHaveAttribute('aria-pressed', 'true');
    expect(cityInput()).toHaveValue('Porto');
    expect(searchMock).toHaveBeenNthCalledWith(2, 'Porto');
    await act(async () => cities.resolve([city, otherCity]));
    await expectSuccess();
    expect(screen.getByRole('heading', { name: 'Temperatura atual: 70 °F' })).toBeVisible();
    expect(forecastMock).toHaveBeenCalledExactlyOnceWith(city);
  });

  it('erro de Forecast preserva lista/query e retry consulta apenas a mesma cidade', async () => {
    const user = userEvent.setup();
    forecastMock.mockRejectedValueOnce(new Error('A requisição demorou demais.'));
    render(<App />);
    await submit(user, 'São Paulo');
    expect(await screen.findByRole('alert')).toHaveTextContent('A requisição demorou demais.');
    expect(cityButton(city)).toBeEnabled();
    expect(cityInput()).toHaveValue('São Paulo');
    expectNoWeather();
    await user.click(fahrenheit());
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await expectSuccess();
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(forecastMock).toHaveBeenCalledTimes(2);
    expect(forecastMock).toHaveBeenLastCalledWith(city);
    expect(fahrenheit()).toHaveAttribute('aria-pressed', 'true');
  });

  it('seleção por teclado mantém identidade e coordenadas de homônimos e oculta dados antigos no loading/erro', async () => {
    const user = userEvent.setup();
    render(<App />);
    await submit(user);
    await expectSuccess();
    await user.click(fahrenheit());
    const forecast = deferred<WeatherData>();
    forecastMock.mockReturnValueOnce(forecast.promise);
    cityButton(otherCity).focus();
    await user.keyboard('{Enter}');
    expect(forecastMock).toHaveBeenLastCalledWith(otherCity);
    expect(forecastMock.mock.calls[1][0]).toBe(otherCity);
    expect(forecastMock.mock.calls[1][0]).toMatchObject({ id: 2, latitude: 39, longitude: -8 });
    expectNoWeather();
    expect(cityButton(city)).toBeDisabled();
    expect(fahrenheit()).toHaveAttribute('aria-pressed', 'true');
    await act(async () => forecast.resolve(weather(otherCity)));
    await expectSuccess(otherCity);
    expect(cityButton(otherCity)).toHaveAttribute('aria-current', 'true');
    expect(cityButton(city)).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('heading', { name: 'Temperatura atual: 70 °F' })).toBeVisible();
    forecastMock.mockRejectedValueOnce(new Error('Forecast indisponível.'));
    await user.click(cityButton(city));
    expect(await screen.findByRole('alert')).toHaveTextContent('Forecast indisponível.');
    expectNoWeather();
    expect(fahrenheit()).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await expectSuccess();
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(forecastMock).toHaveBeenCalledTimes(4);
    expect(forecastMock).toHaveBeenLastCalledWith(city);
  });

  it('empty de Geocoding não consulta Forecast e mantém unidade na próxima busca', async () => {
    const user = userEvent.setup();
    searchMock.mockResolvedValueOnce([]);
    render(<App />);
    await user.click(fahrenheit());
    await submit(user, 'Cidade inexistente');
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Nenhuma cidade encontrada para “Cidade inexistente”',
    );
    expect(forecastMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('region', { name: 'Cidades encontradas' })).not.toBeInTheDocument();
    expectNoWeather();
    expect(fahrenheit()).toHaveAttribute('aria-pressed', 'true');
    await submit(user, 'São Paulo');
    await expectSuccess();
    expect(screen.getByRole('heading', { name: 'Temperatura atual: 70 °F' })).toBeVisible();
    expect(searchMock).toHaveBeenCalledTimes(2);
    expect(forecastMock).toHaveBeenCalledTimes(1);
  });

  it('empty de Forecast all-null mantém cidades e permite outra seleção sem confundir com cidade ausente', async () => {
    const user = userEvent.setup();
    const empty = weatherData();
    empty.current.temperatureC = null;
    forecastMock.mockResolvedValueOnce(empty);
    render(<App />);
    await user.click(fahrenheit());
    await submit(user);
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Condições meteorológicas indisponíveis',
    );
    expect(screen.queryByText(/Nenhuma cidade encontrada/)).not.toBeInTheDocument();
    expect(cityButton(otherCity)).toBeEnabled();
    expectNoWeather();
    expect(fahrenheit()).toHaveAttribute('aria-pressed', 'true');
    await user.click(cityButton(otherCity));
    await expectSuccess(otherCity);
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(forecastMock).toHaveBeenLastCalledWith(otherCity);
    expect(screen.getByRole('heading', { name: 'Temperatura atual: 70 °F' })).toBeVisible();
  });

  it('exibe data civil e horário local da fonte sem conversão pelo fuso do dispositivo ou alegação de recência', async () => {
    const user = userEvent.setup();
    const data = weather();
    data.current.observedAt = '2026-10-28T00:15';
    data.timezone = 'Pacific/Auckland';
    forecastMock.mockResolvedValue(data);
    render(<App />);
    await submit(user);
    await expectSuccess();
    const timestamp = screen.getByText('28/10/2026 às 00:15 (Pacific/Auckland)');
    expect(timestamp).toHaveAttribute('datetime', '2026-10-28T00:15');
    expect(screen.getByText(/Horário da observação informado pela fonte:/)).toBeVisible();
    expect(screen.queryByText(/atualizado agora|recente|demonstração/i)).not.toBeInTheDocument();
    expect(screen.getByText('Horário de atualização da previsão não fornecido.')).toBeVisible();
  });

  it('informa timestamp ausente sem inventar horário', async () => {
    const user = userEvent.setup();
    const data = weather();
    data.current.observedAt = null;
    forecastMock.mockResolvedValue(data);
    render(<App />);
    await submit(user);
    await expectSuccess();
    expect(screen.getByText('Horário da observação indisponível')).toBeVisible();
    expect(
      screen.queryByText(/Horário da observação informado pela fonte:/),
    ).not.toBeInTheDocument();
  });

  it('permite trocar unidade durante loading sem reiniciar a consulta', async () => {
    const user = userEvent.setup();
    const forecast = deferred<WeatherData>();
    forecastMock.mockReturnValueOnce(forecast.promise);
    render(<App />);
    await submit(user);
    await screen.findByRole('button', { name: cityName(city) });
    expect(screen.getByRole('status')).toHaveTextContent('Consultando');
    await user.click(fahrenheit());
    expect(fahrenheit()).toHaveAttribute('aria-pressed', 'true');
    expect(cityInput()).toBeDisabled();
    await act(async () => forecast.resolve(weather()));
    await expectSuccess();
    expect(screen.getByRole('heading', { name: 'Temperatura atual: 70 °F' })).toBeVisible();
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(forecastMock).toHaveBeenCalledTimes(1);
  });

  it('retry usa a query confirmada mesmo se o campo foi editado depois do erro', async () => {
    const user = userEvent.setup();
    searchMock.mockRejectedValueOnce(new Error('Falha de rede.'));
    render(<App />);
    await submit(user, 'Porto');
    await screen.findByRole('alert');
    await user.clear(cityInput());
    await user.type(cityInput(), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await expectSuccess();
    expect(searchMock).toHaveBeenNthCalledWith(2, 'Porto');
    expect(cityInput()).toHaveValue('Lisboa');
    expect(forecastMock).toHaveBeenCalledExactlyOnceWith(city);
  });

  it('nova busca após sucesso remove dados antigos inclusive se Geocoding falhar', async () => {
    const user = userEvent.setup();
    render(<App />);
    await submit(user);
    await expectSuccess();
    await user.click(fahrenheit());
    const cities = deferred<City[]>();
    searchMock.mockReturnValueOnce(cities.promise);
    await submit(user, 'Porto');
    expectNoWeather();
    expect(screen.queryByRole('region', { name: 'Cidades encontradas' })).not.toBeInTheDocument();
    expect(fahrenheit()).toHaveAttribute('aria-pressed', 'true');
    await act(async () => cities.resolve([]));
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
    expectNoWeather();
    searchMock.mockRejectedValueOnce(new Error('Falha de rede.'));
    await submit(user, 'Lisboa');
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    expectNoWeather();
    expect(cityInput()).toHaveValue('Lisboa');
    expect(fahrenheit()).toHaveAttribute('aria-pressed', 'true');
    expect(forecastMock).toHaveBeenCalledTimes(1);
  });

  it('retry de uma seleção homônima falha não volta para a primeira cidade', async () => {
    const user = userEvent.setup();
    render(<App />);
    await submit(user);
    await expectSuccess();
    forecastMock.mockRejectedValueOnce(new Error('Falha de rede.'));
    await user.click(cityButton(otherCity));
    await screen.findByRole('alert');
    expectNoWeather();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await expectSuccess(otherCity);
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(forecastMock).toHaveBeenCalledTimes(3);
    expect(forecastMock.mock.calls[1][0]).toBe(otherCity);
    expect(forecastMock.mock.calls[2][0]).toBe(otherCity);
    expect(cityInput()).toHaveValue('São');
  });

  it('mantém sucesso parcial com cinco dias quando condições atuais estão ausentes', async () => {
    const user = userEvent.setup();
    const partial = weatherData();
    partial.current.temperatureC = null;
    partial.forecastDays[2].temperatureMaxC = 20;
    forecastMock.mockResolvedValueOnce(partial);
    render(<App />);
    await submit(user);
    await expectSuccess();
    expect(screen.getByText('Condições atuais indisponíveis')).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getAllByText('Previsão indisponível para este dia')).toHaveLength(4);
    await user.click(fahrenheit());
    expect(within(screen.getAllByRole('article')[2]).getByText('68 °F')).toBeVisible();
    expect(forecastMock).toHaveBeenCalledTimes(1);
  });

  it('cidades sem região continuam selecionáveis por nome e país', async () => {
    const user = userEvent.setup();
    const noRegion: City = {
      id: 3,
      name: 'Lisboa',
      country: 'Portugal',
      latitude: 38.72,
      longitude: -9.14,
    };
    searchMock.mockResolvedValueOnce([noRegion]);
    render(<App />);
    await submit(user, 'Lisboa');
    await expectSuccess(noRegion);
    expect(cityButton(noRegion)).toHaveAccessibleName('Lisboa, Portugal');
    expect(forecastMock).toHaveBeenCalledExactlyOnceWith(noRegion);
  });
});
