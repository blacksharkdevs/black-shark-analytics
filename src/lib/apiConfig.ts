/**
 * Configuração da API
 * Define a baseURL com base no ambiente (desenvolvimento ou produção)
 */

// URL de desenvolvimento (localhost)
const DEV_API_URL = "http://localhost:3000";

// URL de produção
const PROD_API_URL = import.meta.env.VITE_API_URL;

// Define se está em modo de desenvolvimento
const isDevelopment = import.meta.env.VITE_ENV === "development";

// BaseURL da API
export const API_BASE_URL = isDevelopment ? DEV_API_URL : PROD_API_URL;

// Endpoints da API
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/v1/auth/login`,
    register: `${API_BASE_URL}/api/v1/auth/register`,
    logout: `${API_BASE_URL}/api/v1/auth/logout`,
    refresh: `${API_BASE_URL}/api/v1/auth/refresh`,
  },
  // Adicione outros endpoints conforme necessário
} as const;

// Chave para armazenar o token no localStorage
export const AUTH_TOKEN_KEY = "blackshark_auth_token";

// Chave para armazenar dados do usuário no localStorage
export const AUTH_USER_KEY = "blackshark_auth_user";
