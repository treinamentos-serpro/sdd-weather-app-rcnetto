import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../../src/components/UnitToggle';

describe('UnitToggle', () => {
  it('expõe grupo, dois botões e seleção controlada sem estado duplicado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<UnitToggle unit="celsius" onChange={onChange} />);
    const group = screen.getByRole('group', { name: 'Unidade de temperatura' });
    expect(within(group).getAllByRole('button')).toHaveLength(2);
    const celsius = within(group).getByRole('button', { name: '°C', pressed: true });
    const fahrenheit = within(group).getByRole('button', { name: '°F', pressed: false });
    await user.click(fahrenheit);
    expect(onChange).toHaveBeenLastCalledWith('fahrenheit');
    expect(celsius).toHaveAttribute('aria-pressed', 'true');
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'false');
    rerender(<UnitToggle unit="fahrenheit" onChange={onChange} />);
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
    expect(celsius).toHaveAttribute('aria-pressed', 'false');
    await user.click(celsius);
    expect(onChange).toHaveBeenLastCalledWith('celsius');
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
  });

  it('permite Tab, Shift+Tab, Enter e Espaço nativos, sem enviar formulário', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <UnitToggle unit="celsius" onChange={onChange} />
      </form>,
    );
    const celsius = screen.getByRole('button', { name: '°C' });
    const fahrenheit = screen.getByRole('button', { name: '°F' });
    await user.tab();
    expect(celsius).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('celsius');
    await user.tab();
    expect(fahrenheit).toHaveFocus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith('fahrenheit');
    await user.tab({ shift: true });
    expect(celsius).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
