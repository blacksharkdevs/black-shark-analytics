# Configuração de Autenticação - Black Shark Analytics

## 📋 Resumo das Mudanças

A lógica de autenticação foi completamente reformulada para usar o novo backend baseado em JWT.

## 🔧 Arquivos Criados/Modificados

### Novos Arquivos:

1. **`src/lib/apiConfig.ts`** - Configuração da baseURL e endpoints da API
2. **`src/services/authService.ts`** - Serviço de autenticação com métodos de login, logout, gerenciamento de tokens

### Arquivos Modificados:

1. **`src/contexts/AuthContext.tsx`** - Context atualizado para usar o novo serviço de autenticação
2. **`src/contexts/AuthContextDefinition.tsx`** - Interfaces atualizadas (email no lugar de username)
3. **`src/components/domain/LoginForm.tsx`** - Formulário atualizado para usar email
4. **`.env`** e **`.env.example`** - Novas variáveis de ambiente

## 🌐 Configuração da BaseURL

A aplicação agora usa URLs diferentes dependendo do ambiente:

### Desenvolvimento (localhost)

Quando `VITE_ENV=development`, a aplicação usa:

```
http://localhost:3000
```

### Produção

Quando `VITE_ENV` não está definido ou tem qualquer outro valor, usa a URL definida em `VITE_API_URL`:

```
https://api.blackshark.com (ou o valor que você configurar)
```

## ⚙️ Como Configurar o Arquivo .env

### Para Desenvolvimento Local:

Crie/edite o arquivo `.env` na raiz do projeto:

```env
# Ambiente de execução
VITE_ENV=development

# URL da API em produção (usada quando VITE_ENV != 'development')
VITE_API_URL=https://api.blackshark.com
```

### Para Produção:

```env
# Não definir VITE_ENV ou definir como 'production'
# VITE_ENV=production

# URL da sua API em produção
VITE_API_URL=https://api.blackshark.com
```

## 🔐 Nova Lógica de Login

### Endpoint

```
POST {{baseURL}}/api/v1/auth/login
```

### Request Body

```json
{
  "email": "admin@blackshark.com",
  "password": "admin123"
}
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 💾 Armazenamento

O sistema agora armazena:

- **Token JWT**: `localStorage.getItem('blackshark_auth_token')`
- **Dados do Usuário**: `localStorage.getItem('blackshark_auth_user')`

O token é automaticamente decodificado para extrair informações do usuário (email, role).

## 🔄 Fluxo de Autenticação

1. Usuário insere email e senha no formulário
2. Sistema faz POST para `/api/v1/auth/login`
3. Backend retorna `access_token`
4. Token é decodificado para extrair dados do usuário
5. Token e dados do usuário são armazenados no localStorage
6. Usuário é redirecionado para o dashboard

## ✅ Validação de Token

O sistema verifica automaticamente:

- Se o token existe no localStorage
- Se o token não está expirado (verifica campo `exp` no JWT)
- Se o token está válido ao carregar a aplicação

## 🧪 Credenciais de Teste

```
Email: admin@blackshark.com
Senha: admin123
```

## 📝 Registro de Usuário

### Endpoint

```
POST {{baseURL}}/api/v1/auth/register
```

### Request Body

```json
{
  "name": "victor",
  "email": "victor@gmail.com",
  "password": "123asdFF",
  "role": "ADMIN"
}
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "44a89741-d642-4bbb-8969-d4b846045edd",
    "email": "victor@gmail.com",
    "name": "victor",
    "role": "ADMIN"
  }
}
```

### Campos

- **name**: Nome completo do usuário
- **email**: Email único do usuário (usado para login)
- **password**: Senha com no mínimo 6 caracteres
- **role**: Função do usuário (`ADMIN` ou `USER`)

## 📝 Próximos Passos

- [x] Implementar endpoint de registro no backend
- [ ] Adicionar funcionalidade de refresh token
- [x] Implementar interceptor HTTP para adicionar token automaticamente nas requisições
- [ ] Adicionar tratamento de erros 401 (não autorizado) para redirecionar ao login

## 🚀 Como Testar

1. Configure o `.env` com `VITE_ENV=development`
2. Certifique-se que seu backend está rodando em `localhost:3000`
3. Execute a aplicação: `npm run dev`
4. Acesse a página de login e use as credenciais de teste
5. Verifique no console do navegador se o token foi armazenado corretamente

## 🐛 Debugging

Para verificar se está usando a URL correta, abra o console do navegador e digite:

```javascript
console.log(import.meta.env.VITE_ENV);
console.log(import.meta.env.VITE_API_URL);
```

Você pode também importar diretamente:

```javascript
import { API_BASE_URL } from "./src/lib/apiConfig";
console.log("API Base URL:", API_BASE_URL);
```
