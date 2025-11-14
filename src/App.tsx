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
import CustomersDetailPage from "./pages/Dashboard/Customers/CustomersDetailPage";
import AffiliatesPage from "./pages/Dashboard/Affiliates/AffiliatesPage";
import AffiliateDetailPage from "./pages/Dashboard/Affiliates/AffiliateDetailPage";
// import ReportsPage from "./pages/Dashboard/Reports/ReportsPage";
import ItemsPage from "./pages/Dashboard/Reports/Items";

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
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="transactions/:id" element={<TransactionDetailPage />} />
          <Route path="customers/:email" element={<CustomersDetailPage />} />

          <Route path="affiliates" element={<AffiliatesPage />} />
          <Route path="affiliates/:name" element={<AffiliateDetailPage />} />

          {/* <Route path="reports/items" element={<ReportsPage />} /> */}
          <Route path="reports/items" element={<ItemsPage />} />
        </Route>

        <Route path="*" element={<div>404 | Página Não Encontrada</div>} />
      </Routes>
    </RootProviders>
  );
}
