import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  value: number | undefined;
  icon: LucideIcon;
  to: string;
  accent: string;
  loading?: boolean;
}

export function StatCard({ title, value, icon: Icon, to, accent, loading }: Props) {
  return (
    <Link to={to} className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', accent)}>
            <Icon className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <p className="text-3xl font-bold" aria-label={title}>
              {value ?? 0}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
