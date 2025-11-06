import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { AuthContext } from "./AuthContextDefinition";

// --- Tipagens ---

interface User {
  id: string;
  username: string;
}

// --- Constantes ---

const ADMIN_USER_LOCAL_STORAGE_KEY = "blackshark_admin_user";

// --- Provider ---

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // 1. Efeito para carregar o usuário do LocalStorage
  useEffect(() => {
    try {
      const storedUserString = localStorage.getItem(
        ADMIN_USER_LOCAL_STORAGE_KEY
      );
      if (storedUserString) {
        const storedUser = JSON.parse(storedUserString) as User;
        if (storedUser && storedUser.id && storedUser.username) {
          setUser(storedUser);
        }
      }
    } catch (error) {
      console.error("Falha ao carregar usuário do localStorage", error);
      localStorage.removeItem(ADMIN_USER_LOCAL_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  // 2. Função de Login
  const login = useCallback(
    async (usernameInput: string, passwordInput: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc("verify_password", {
          user_name: usernameInput,
          password_param: passwordInput,
        });

        if (error) {
          console.error("RPC verify_password error:", error);
          localStorage.removeItem(ADMIN_USER_LOCAL_STORAGE_KEY);
          setUser(null);
          setIsLoading(false);
          return false;
        }

        const rpcUser = data?.[0] as User | undefined;

        if (rpcUser && rpcUser.id && rpcUser.username) {
          const userData = { id: rpcUser.id, username: rpcUser.username };
          localStorage.setItem(
            ADMIN_USER_LOCAL_STORAGE_KEY,
            JSON.stringify(userData)
          );
          setUser(userData);
          setIsLoading(false);
          navigate("/dashboard", { replace: true });
          return true;
        } else {
          console.warn(
            "Login falhou: Credenciais inválidas ou usuário não encontrado."
          );
          localStorage.removeItem(ADMIN_USER_LOCAL_STORAGE_KEY);
          setUser(null);
          setIsLoading(false);
          return false;
        }
      } catch (e) {
        console.error("Exceção no Login:", e);
        localStorage.removeItem(ADMIN_USER_LOCAL_STORAGE_KEY);
        setUser(null);
        setIsLoading(false);
        return false;
      }
    },
    [navigate]
  );

  // 3. Função de Logout
  const logout = useCallback(() => {
    setIsLoading(true);
    localStorage.removeItem(ADMIN_USER_LOCAL_STORAGE_KEY);
    setUser(null);
    navigate("/login", { replace: true });
    setIsLoading(false);
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
