import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RequestFiltersBar } from '../RequestFiltersBar';

const empty = { q: '', category: '', status: '', from: '', to: '' } as const;

describe('RequestFiltersBar', () => {
  it('aplica o filtro por texto livre', async () => {
    const onApply = jest.fn();
    render(<RequestFiltersBar value={empty} onApply={onApply} />);

    await userEvent.type(screen.getByLabelText('Título'), 'notebook');
    await userEvent.click(screen.getByRole('button', { name: /filtrar/i }));

    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ q: 'notebook' }));
  });

  it('valida o período informado', async () => {
    const onApply = jest.fn();
    render(<RequestFiltersBar value={empty} onApply={onApply} />);

    fireEvent.change(screen.getByLabelText('De'), { target: { value: '2026-09-30' } });
    fireEvent.change(screen.getByLabelText('Até'), { target: { value: '2026-09-01' } });
    await userEvent.click(screen.getByRole('button', { name: /filtrar/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('A data inicial deve ser menor ou igual à data final');
    expect(onApply).not.toHaveBeenCalled();
  });

  it('limpa todos os filtros', async () => {
    const onApply = jest.fn();
    render(<RequestFiltersBar value={{ ...empty, q: 'vpn', status: 'ABERTO' }} onApply={onApply} />);

    expect(screen.getByLabelText('Título')).toHaveValue('vpn');
    await userEvent.click(screen.getByRole('button', { name: /limpar/i }));

    expect(onApply).toHaveBeenCalledWith(empty);
    expect(screen.getByLabelText('Título')).toHaveValue('');
  });
});
