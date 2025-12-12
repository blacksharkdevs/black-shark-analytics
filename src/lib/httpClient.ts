import { API_BASE_URL, AUTH_TOKEN_KEY } from "./apiConfig";

/**
 * Cliente HTTP com suporte a autenticação JWT
 * Adiciona automaticamente o token de autenticação nas requisições
 */

export interface RequestConfig extends RequestInit {
  baseURL?: string;
  requiresAuth?: boolean;
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Obtém o token do localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Prepara os headers da requisição
   */
  private prepareHeaders(config?: RequestConfig): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(config?.headers || {}),
    };

    // Adiciona o token se a requisição requer autenticação
    if (config?.requiresAuth !== false) {
      const token = this.getToken();
      if (token) {
        (headers as Record<string, string>)[
          "Authorization"
        ] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Faz uma requisição HTTP
   */
  private async request<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<T> {
    const url = config?.baseURL
      ? `${config.baseURL}${endpoint}`
      : `${this.baseURL}${endpoint}`;

    const headers = this.prepareHeaders(config);

    const response = await fetch(url, {
      ...config,
      headers,
    });

    // Se não autorizado, redireciona para login
    if (response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.location.href = "/login";
      throw new Error("Não autorizado");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

// Exporta uma instância única do cliente HTTP
export const httpClient = new HttpClient();

// Exemplos de uso:
//
// // GET com autenticação automática
// const data = await httpClient.get('/api/v1/users');
//
// // POST com autenticação automática
// const result = await httpClient.post('/api/v1/transactions', { amount: 100 });
//
// // GET sem autenticação
// const publicData = await httpClient.get('/api/v1/public/data', { requiresAuth: false });
