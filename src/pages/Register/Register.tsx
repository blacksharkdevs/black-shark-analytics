import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "@/components/domain/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import { OceanBackground } from "@/components/layout/OceanBackground";
import { OceanSoundPlayer } from "@/components/common/OceanSoundPlayer";

export default function RegisterPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Se já estiver logado, redireciona para o dashboard
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-blackshark-background">
      <OceanSoundPlayer />
      <OceanBackground />

      <div className="z-10">
        <RegisterForm />
      </div>
    </div>
  );
}
