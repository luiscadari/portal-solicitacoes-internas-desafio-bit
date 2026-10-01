import { useAuth } from '@/contexts/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight">Olá, {user?.name.split(' ')[0]}!</h1>
      <p className="text-muted-foreground">Bem-vindo ao Portal de Solicitações Internas.</p>
    </div>
  );
}
