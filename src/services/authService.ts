import { API_ENDPOINTS, AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/apiConfig";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
}

export interface RegisterResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface AuthUser {
  id?: string;
  email: string;
  name?: string;
  role?: string;
}

/**
 * Serviço de autenticação
 * Gerencia login, logout e armazenamento de tokens
 */
export class AuthService {
  /**
   * Realiza o login do usuário
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(API_ENDPOINTS.auth.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Falha no login");
    }

    const data: LoginResponse = await response.json();
    return data;
  }

  /**
   * Realiza o registro de um novo usuário
   */
  static async register(
    credentials: RegisterCredentials
  ): Promise<RegisterResponse> {
    const response = await fetch(API_ENDPOINTS.auth.register, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Falha no registro");
    }

    const data: RegisterResponse = await response.json();
    return data;
  }

  /**
   * Armazena o token de autenticação no localStorage
   */
  static setToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  /**
   * Recupera o token de autenticação do localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Remove o token de autenticação do localStorage
   */
  static removeToken(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  /**
   * Armazena os dados do usuário no localStorage
   */
  static setUser(user: AuthUser): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  /**
   * Recupera os dados do usuário do localStorage
   */
  static getUser(): AuthUser | null {
    const userString = localStorage.getItem(AUTH_USER_KEY);
    if (!userString) return null;

    try {
      return JSON.parse(userString) as AuthUser;
    } catch {
      return null;
    }
  }

  /**
   * Remove os dados do usuário do localStorage
   */
  static removeUser(): void {
    localStorage.removeItem(AUTH_USER_KEY);
  }

  /**
   * Decodifica o token JWT para extrair informações do usuário
   * Nota: Esta é uma decodificação simples, não valida a assinatura
   */
  static decodeToken(token: string): AuthUser | null {
    try {
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));

      return {
        email: decodedPayload.email,
        role: decodedPayload.role,
      };
    } catch {
      return null;
    }
  }

  /**
   * Verifica se o token está expirado
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      const exp = decodedPayload.exp;

      if (!exp) return true;

      // exp está em segundos, Date.now() está em milissegundos
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * Faz logout completo, removendo token e dados do usuário
   */
  static logout(): void {
    this.removeToken();
    this.removeUser();
  }

  /**
   * Verifica se o usuário está autenticado
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }
}
