import { atendente, colaborador } from '@/test/utils';
import { canChangeStatus, canModify } from './permissions';

describe('permissions', () => {
  it('permite ao solicitante modificar solicitação aberta', () => {
    expect(canModify(colaborador, { requesterId: colaborador.id, status: 'ABERTO' })).toBe(true);
  });

  it('impede modificação quando não está aberta ou não é o solicitante', () => {
    expect(canModify(colaborador, { requesterId: colaborador.id, status: 'EM_ATENDIMENTO' })).toBe(false);
    expect(canModify(atendente, { requesterId: colaborador.id, status: 'ABERTO' })).toBe(false);
    expect(canModify(null, { requesterId: colaborador.id, status: 'ABERTO' })).toBe(false);
  });

  it('somente atendentes alteram status', () => {
    expect(canChangeStatus(atendente)).toBe(true);
    expect(canChangeStatus(colaborador)).toBe(false);
    expect(canChangeStatus(null)).toBe(false);
  });
});
