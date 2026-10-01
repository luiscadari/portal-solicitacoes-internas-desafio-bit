import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardPage } from '@/pages/DashboardPage';
import { EditRequestPage } from '@/pages/EditRequestPage';
import { LoginPage } from '@/pages/LoginPage';
import { NewRequestPage } from '@/pages/NewRequestPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RequestDetailsPage } from '@/pages/RequestDetailsPage';
import { RequestsPage } from '@/pages/RequestsPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="solicitacoes" element={<RequestsPage />} />
          <Route path="solicitacoes/nova" element={<NewRequestPage />} />
          <Route path="solicitacoes/:id" element={<RequestDetailsPage />} />
          <Route path="solicitacoes/:id/editar" element={<EditRequestPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
