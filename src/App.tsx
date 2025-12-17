import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/Auth/Login";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import PerformancePage from "./pages/Dashboard/PerformancePage";
import TransactionsPage from "./pages/Dashboard/TransactionsPage";

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
          <Route path="transactions" element={<TransactionsPage />} />
        </Route>

        <Route path="*" element={<div>404 | Página Não Encontrada</div>} />
      </Routes>
    </RootProviders>
  );
}
