/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContextDefinition";
import { AuthService } from "@/services/authService";

// --- Tipagens ---

interface User {
  email: string;
  role?: string;
}

// --- Provider ---

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // 1. Efeito para carregar o usuário do LocalStorage e validar token
  useEffect(() => {
    try {
      const token = AuthService.getToken();
      const storedUser = AuthService.getUser();

      if (token && storedUser && !AuthService.isTokenExpired(token)) {
        setUser(storedUser);
      } else {
        // Token expirado ou inválido, limpar dados
        AuthService.logout();
        setUser(null);
      }
    } catch (error) {
      console.error("Falha ao carregar usuário do localStorage", error);
      AuthService.logout();
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  // 2. Função de Login
  const login = useCallback(
    async (emailInput: string, passwordInput: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Faz a requisição de login
        const response = await AuthService.login({
          email: emailInput,
          password: passwordInput,
        });

        // Decodifica o token para extrair informações do usuário
        const userInfo = AuthService.decodeToken(response.access_token);

        if (userInfo) {
          // Armazena o token e dados do usuário
          AuthService.setToken(response.access_token);
          AuthService.setUser(userInfo);

          setUser(userInfo);
          setIsLoading(false);
          return true;
        } else {
          console.warn("Login falhou: Token inválido");
          AuthService.logout();
          setUser(null);
          setIsLoading(false);
          return false;
        }
      } catch (error) {
        console.error("Exceção no Login:", error);
        AuthService.logout();
        setUser(null);
        setIsLoading(false);
        return false;
      }
    },
    []
  );

  const registerUser = useCallback(
    async (
      nameInput: string,
      emailInput: string,
      passwordInput: string,
      roleInput: "ADMIN" | "USER" = "ADMIN"
    ): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Faz a requisição de registro
        const response = await AuthService.register({
          name: nameInput,
          email: emailInput,
          password: passwordInput,
          role: roleInput,
        });

        // Armazena o token e dados do usuário
        AuthService.setToken(response.access_token);
        AuthService.setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        });

        setUser({
          email: response.user.email,
          role: response.user.role,
        });

        setIsLoading(false);
        return true;
      } catch (error) {
        console.error("Exceção no Registro:", error);
        AuthService.logout();
        setUser(null);
        setIsLoading(false);
        return false;
      }
    },
    []
  );

  // 3. Função de Logout
  const logout = useCallback(() => {
    setIsLoading(true);
    AuthService.logout();
    setUser(null);
    navigate("/login", { replace: true });
    setIsLoading(false);
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, registerUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
