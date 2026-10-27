import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../../src/components/SearchBar';

describe('SearchBar', () => {
  it('associa um rótulo acessível ao campo dentro de uma região de busca', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeInTheDocument();
  });

  it('não busca enquanto a pessoa apenas digita', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('submete por botão, removendo espaços externos sem alterar acentos ou pontuação', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), '  São Paulo, SP  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo, SP');
  });

  it('submete por Enter e preserva espaços internos', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });

    await user.type(input, '  Rio de Janeiro  ');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Rio de Janeiro');
  });

  it.each([
    '',
    '   	  ',
  ])('informa erro acessível sem buscar uma entrada vazia (%j)', async (value) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });

    if (value) fireEvent.change(input, { target: { value } });
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('não submete enquanto desabilitado, mesmo se o formulário receber Enter', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.type(input, 'Lisboa');

    rerender(<SearchBar disabled onSearch={onSearch} />);
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    fireEvent.submit(screen.getByRole('search', { name: 'Buscar cidade' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('preserva o texto digitado ao ser reabilitado', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });

    await user.type(input, 'Porto Alegre');
    rerender(<SearchBar disabled onSearch={onSearch} />);
    rerender(<SearchBar onSearch={onSearch} />);

    expect(input).toHaveValue('Porto Alegre');
  });

  it('gera rótulos independentes em múltiplas instâncias', () => {
    render(
      <>
        <SearchBar onSearch={vi.fn()} />
        <SearchBar onSearch={vi.fn()} />
      </>,
    );

    expect(screen.getAllByRole('searchbox', { name: 'Cidade' })).toHaveLength(2);
  });
});
