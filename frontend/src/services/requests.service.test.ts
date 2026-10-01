import { toQueryParams } from './requests.service';

describe('toQueryParams', () => {
  it('descarta filtros vazios', () => {
    expect(toQueryParams({ q: '  ', category: '', status: '', from: '', to: '', page: 1, pageSize: 10 })).toEqual({
      page: 1,
      pageSize: 10,
    });
  });

  it('converte o período em instantes ISO e mantém os demais filtros', () => {
    const params = toQueryParams({
      q: ' notebook ',
      category: 'TI',
      status: 'ABERTO',
      from: '2026-09-01',
      to: '2026-09-30',
    });

    expect(params).toMatchObject({ q: 'notebook', category: 'TI', status: 'ABERTO' });
    expect(new Date(params.from as string).getTime()).toBe(new Date(2026, 8, 1).getTime());
    expect(new Date(params.to as string).getTime()).toBe(new Date(2026, 8, 30, 23, 59, 59, 999).getTime());
  });
});
