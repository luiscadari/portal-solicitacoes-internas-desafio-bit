import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RequestForm } from '../RequestForm';

describe('RequestForm', () => {
  it('exibe mensagens de validação para campos obrigatórios', async () => {
    const onSubmit = jest.fn();
    render(<RequestForm submitLabel="Criar solicitação" onSubmit={onSubmit} onCancel={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Criar solicitação' }));

    expect(await screen.findByText('O título deve ter ao menos 3 caracteres')).toBeInTheDocument();
    expect(screen.getByText('A descrição deve ter ao menos 5 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Selecione uma categoria')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envia os dados preenchidos', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <RequestForm defaultValues={{ category: 'RH' }} submitLabel="Salvar" onSubmit={onSubmit} onCancel={jest.fn()} />,
    );

    await userEvent.type(screen.getByLabelText('Título'), 'Solicitação de férias');
    await userEvent.type(screen.getByLabelText('Descrição'), 'Férias a partir de novembro.');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { title: 'Solicitação de férias', description: 'Férias a partir de novembro.', category: 'RH' },
        expect.anything(),
      ),
    );
  });

  it('aciona o cancelamento', async () => {
    const onCancel = jest.fn();
    render(<RequestForm submitLabel="Salvar" onSubmit={jest.fn()} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalled();
  });
});
