import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['ABERTO', 'Aberto'],
    ['EM_ATENDIMENTO', 'Em atendimento'],
    ['CONCLUIDO', 'Concluído'],
  ] as const)('exibe o rótulo de %s', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
