import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/domain/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { OceanBackground } from "@/components/layout/OceanBackground";
import { OceanSoundPlayer } from "@/components/common/OceanSoundPlayer";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

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
        <LoginForm />
      </div>
    </div>
  );
}
