import { CheckCircle2, ClipboardList, Clock, Inbox, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/dashboard/StatCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useRequests';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/constants';
import { getErrorMessage } from '@/services/api';

export function DashboardPage() {
  const { user, isAttendant } = useAuth();
  const { data, isLoading, isError, error } = useDashboard();

  const maxCategory = Math.max(1, ...CATEGORIES.map((c) => data?.porCategoria[c] ?? 0));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${user?.name.split(' ')[0]}!`}
        description={isAttendant ? 'Visão geral de todas as solicitações.' : 'Acompanhe suas solicitações.'}
        actions={
          <Button asChild>
            <Link to="/solicitacoes/nova">
              <PlusCircle />
              Nova solicitação
            </Link>
          </Button>
        }
      />

      {isError && (
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage(error, 'Não foi possível carregar os indicadores')}
        </p>
      )}

      <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de solicitações"
          value={data?.total}
          icon={ClipboardList}
          to="/solicitacoes"
          accent="bg-slate-100 text-slate-700"
          loading={isLoading}
        />
        <StatCard
          title="Abertas"
          value={data?.aberto}
          icon={Inbox}
          to="/solicitacoes?status=ABERTO"
          accent="bg-amber-100 text-amber-700"
          loading={isLoading}
        />
        <StatCard
          title="Em atendimento"
          value={data?.emAtendimento}
          icon={Clock}
          to="/solicitacoes?status=EM_ATENDIMENTO"
          accent="bg-blue-100 text-blue-700"
          loading={isLoading}
        />
        <StatCard
          title="Concluídas"
          value={data?.concluido}
          icon={CheckCircle2}
          to="/solicitacoes?status=CONCLUIDO"
          accent="bg-emerald-100 text-emerald-700"
          loading={isLoading}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações por categoria</CardTitle>
          <CardDescription>Distribuição das demandas registradas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {CATEGORIES.map((category) => {
            const value = data?.porCategoria[category] ?? 0;
            return (
              <Link
                key={category}
                to={`/solicitacoes?category=${category}`}
                className="grid grid-cols-[110px_1fr_32px] items-center gap-3 text-sm hover:opacity-80"
              >
                <span className="text-muted-foreground">{CATEGORY_LABELS[category]}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(value / maxCategory) * 100}%` }}
                  />
                </span>
                <span className="text-right font-medium">{value}</span>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
