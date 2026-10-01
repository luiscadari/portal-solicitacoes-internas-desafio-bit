import { useEffect, useState, type FormEvent } from 'react';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CATEGORIES, CATEGORY_LABELS, STATUSES, STATUS_LABELS } from '@/lib/constants';
import type { Category, RequestFilters, RequestStatus } from '@/types';

const ALL = 'TODOS';

type FilterValues = Pick<RequestFilters, 'from' | 'to' | 'category' | 'status' | 'q'>;

const EMPTY: FilterValues = { from: '', to: '', category: '', status: '', q: '' };

interface Props {
  value: FilterValues;
  onApply: (filters: FilterValues) => void;
}

export function RequestFiltersBar({ value, onApply }: Props) {
  const [draft, setDraft] = useState<FilterValues>({ ...EMPTY, ...value });
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(value).filter(Boolean).length;

  useEffect(() => setDraft({ ...EMPTY, ...value }), [value]);

  const set = <K extends keyof FilterValues>(key: K, val: FilterValues[K]) =>
    setDraft((current) => ({ ...current, [key]: val }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (draft.from && draft.to && draft.from > draft.to) {
      setError('A data inicial deve ser menor ou igual à data final');
      return;
    }
    setError(null);
    onApply(draft);
  };

  const handleClear = () => {
    setError(null);
    setDraft(EMPTY);
    onApply(EMPTY);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border bg-card p-4" aria-label="Filtros">
      <button
        type="button"
        className="flex w-full items-center justify-between text-sm font-medium md:hidden"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{activeCount}</span>
          )}
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      <div className={cn('space-y-3', open ? 'block' : 'hidden', 'md:block')}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="filter-q">Título</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="filter-q"
                placeholder="Buscar pelo título..."
                className="pl-8"
                value={draft.q}
                onChange={(e) => set('q', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-category">Categoria</Label>
            <Select
              value={draft.category || ALL}
              onValueChange={(v) => set('category', v === ALL ? '' : (v as Category))}
            >
              <SelectTrigger id="filter-category" aria-label="Categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-status">Status</Label>
            <Select
              value={draft.status || ALL}
              onValueChange={(v) => set('status', v === ALL ? '' : (v as RequestStatus))}
            >
              <SelectTrigger id="filter-status" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-from">De</Label>
            <Input id="filter-from" type="date" value={draft.from} onChange={(e) => set('from', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-to">Até</Label>
            <Input id="filter-to" type="date" value={draft.to} onChange={(e) => set('to', e.target.value)} />
          </div>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClear}>
            <X />
            Limpar
          </Button>
          <Button type="submit">
            <Search />
            Filtrar
          </Button>
        </div>
      </div>
    </form>
  );
}
