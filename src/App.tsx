import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/Login/Login";

import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/common/ui/toaster";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const DashboardLayout = () => <div>Dashboard em construção!</div>;

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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div>404 | Página Não Encontrada</div>} />
      </Routes>
    </RootProviders>
  );
}
