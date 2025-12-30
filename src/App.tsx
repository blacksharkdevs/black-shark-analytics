import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/Auth/Login";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import PerformancePage from "./pages/Dashboard/PerformancePage";
import ProductsPerformancePage from "./pages/Dashboard/Performance/ProductsPerformancePage";
import AffiliatesPerformancePage from "./pages/Dashboard/Performance/AffiliatesPerformancePage";
import AffiliatePerformanceDetailPage from "./pages/Dashboard/Performance/AffiliatePerformanceDetailPage";
import TransactionsPage from "./pages/Dashboard/TransactionsPage";
import TransactionDetailPage from "./pages/Dashboard/Transactions/TransactionDetailPage";
import AffiliatesPage from "./pages/Dashboard/AffiliatesPage";
import AffiliateDetailPage from "./pages/Dashboard/Affiliates/AffiliateDetailPage";

import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/common/ui/toaster";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import RegisterPage from "./pages/Auth/Register";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";

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

        {/* --- ROTAS PRIVADAS --- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="performance" element={<PerformancePage />} />
          <Route
            path="performance/products"
            element={<ProductsPerformancePage />}
          />
          <Route
            path="performance/affiliates"
            element={<AffiliatesPerformancePage />}
          />
          <Route
            path="performance/affiliates/:id"
            element={<AffiliatePerformanceDetailPage />}
          />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="transactions/:id" element={<TransactionDetailPage />} />
          <Route path="affiliates" element={<AffiliatesPage />} />
          <Route path="affiliates/:name" element={<AffiliateDetailPage />} />
        </Route>

        <Route path="*" element={<div>404 | Página Não Encontrada</div>} />
      </Routes>
    </RootProviders>
  );
}
