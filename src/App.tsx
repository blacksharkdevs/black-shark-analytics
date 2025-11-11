import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/Login/Login";
import DashboardPage from "./pages/Dashboard/DashboardPage"; // 🚨 Conteúdo Principal (Stats/Charts)

import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/common/ui/toaster";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import RegisterPage from "./pages/Register/Register";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import TransactionsPage from "./pages/Dashboard/Transactions/TransactionsPage";
import TransactionDetailPage from "./pages/Dashboard/Transactions/TransactionDetailPage";
import CustomerHistoryPage from "./components/dashboard/customer/CustomerHistoryPage";

// 🚨 Placeholders para rotas aninhadas
const AffiliatesPage = () => <div>Affiliates View</div>;
const ReportsPage = () => <div>Reports Index View</div>;
// const ConfigurationsPage = () => <div>Configurations Index View</div>;

function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <RootProviders>
      <Routes>
        {/* --- ROTAS PÚBLICAS --- */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="transactions/:id" element={<TransactionDetailPage />} />

          <Route path="customers/:email" element={<CustomerHistoryPage />} />

          <Route path="affiliates" element={<AffiliatesPage />} />

          {/* Rotas de Relatórios (usando o * para sub-sub-rotas futuras) */}
          <Route path="reports/*" element={<ReportsPage />} />

          {/* Rotas de Configurações */}
          {/* <Route path="configurations/*" element={<ConfigurationsPage />} /> */}
        </Route>

        <Route path="*" element={<div>404 | Página Não Encontrada</div>} />
      </Routes>
    </RootProviders>
  );
}
