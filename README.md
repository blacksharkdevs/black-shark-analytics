# 🦈 Black Shark Analytics

Bem-vindo(a) ao **Black Shark Analytics**!  
Este é o painel de métricas da nossa empresa de marketing — o coração de onde analisamos as vendas, reembolsos e performance dos nossos afiliados.

Este projeto foi totalmente refatorado do **Next.js** para uma stack moderna, leve e performática:  
**React + Vite + SWC + TypeScript**.

Seja você um dev experiente ou alguém que acabou de chegar, este README é o seu guia essencial para entender, rodar e desenvolver no projeto.

---

## 🛠️ Stack Tecnológica

Aqui é onde a mágica acontece. A performance do Black Shark é garantida por essa combinação de ferramentas:

| Categoria         | Tecnologia       | Por que usamos?                                         |
| ----------------- | ---------------- | ------------------------------------------------------- |
| **Frontend**      | React            | Biblioteca de UI padrão do mercado.                     |
| **Build Tool**    | Vite             | Compilação super-rápida (dev e produção).               |
| **Transpiler**    | SWC              | Substituindo o Babel para builds instantâneos.          |
| **Linguagem**     | TypeScript       | Segurança de tipos para evitar bugs bobos.              |
| **Estilização**   | Tailwind CSS     | Utility-First para desenvolver a UI em tempo recorde.   |
| **Banco/Backend** | Supabase         | Database e autenticação simples e robusta (PostgreSQL). |
| **Roteamento**    | React Router DOM | Gerenciamento de rotas e navegação.                     |

---

## 📁 Estrutura de Pastas Profissional

A estrutura do projeto segue o princípio de **separação de preocupações (SoC)**, facilitando a localização de arquivos e a manutenção.

### 🌲 Visão em Árvore Detalhada

```
├── .vscode/                 # ⚙️ Configurações (settings, extensions)
├── node_modules/            # 📦 Dependências (gerado automaticamente)
├── public/                  # 🖼️ Arquivos estáticos (favicon, logos, etc.)
│
├── src/                     # 🦈 Coração da Aplicação
│   ├── assets/              # 🎨 Mídia, ícones, fontes, estilos globais
│   │   ├── images/
│   │   └── styles/
│   │
│   ├── components/          # 🧱 Componentes Reutilizáveis
│   │   ├── common/          # 🧩 Componentes de UI - Botões, Inputs, Cards
│   │   ├── layout/          # 📐 Header, Sidebar, Footer
│   │   └── dashboard/       # 📊 Gráficos e componentes do Dashboard
│   │
│   ├── hooks/               # 🎣 Lógica de estado/ciclo de vida
│   ├── contexts/            # 🌟 Gerenciamento de estado global
│   │   ├── DashboardConfigProvider.tsx
│   │   ├── DashboardDataProvider.tsx
│   │   └── TransactionsProvider.tsx
│   │
│   ├── lib/                 # 📚 Lógica Pura (sem React/API)
│   │   ├── dataCalculations.ts
│   │   ├── dateConfig.ts
│   │   └── transactionFilters.ts
│   │
│   ├── services/            # 🔗 Acesso a Dados e Persistência
│   │   ├── configStorage.ts
│   │   ├── dashboardService.ts
│   │   └── transactionsService.ts
│   │
│   └── pages/               # 🧭 Telas da Aplicação (por rota)
│       ├── Login/
│       │   └── Login.tsx
│       ├── Dashboard/
│       │   ├── Affiliates/
│       │   ├── Customers/
│       │   ├── Transactions/
│       │   ├── DashboardLayout.tsx
│       │   └── DashboardPage.tsx
│       └── App.tsx
│
├── .gitignore               # 🚫 O que o Git deve ignorar
├── README.md                # 📄 Documentação
├── package.json             # 📦 Dependências e scripts
├── vite.config.ts           # ⚡ Configuração do bundler (Vite + SWC)
└── tsconfig.json            # ⚙️ Configuração do TypeScript
```

---

## 🗺️ Guia Rápido por Responsabilidade

| Pasta            | Conteúdo                                  | Para que serve                             |
| ---------------- | ----------------------------------------- | ------------------------------------------ |
| `src/contexts`   | Providers (`*Provider.tsx`)               | 🌟 Orquestrador de estado global e filtros |
| `src/services`   | Funções que acessam Supabase/localStorage | 🔗 Acesso a dados e queries SQL            |
| `src/lib`        | Funções puras (`calculate*`, `apply*`)    | 📚 Lógica de negócio desacoplada           |
| `src/components` | UI e Componentes JSX                      | 🧱 Interface visual e consumo de hooks     |

---

## 🧠 Arquitetura: Fluxo de Dados Desacoplado

O fluxo de dados segue sempre esta ordem:

1. **Componente** (`*Table.tsx`): Pede dados.
2. **Hook** (`useTransactions`): Consome o Context.
3. **Context** (`TransactionsProvider`): Gerencia estado e chama o Service.
4. **Service** (`transactionsService.ts`): Monta query SQL e chama Supabase.
5. **Lib** (`transactionFilters.ts`): Aplica regras de negócio.

### Exemplo: Atualização da Tabela de Transações

| Camada       | Responsabilidade               | Arquivo                                 |
| ------------ | ------------------------------ | --------------------------------------- |
| Lógica Pura  | Cálculo de `net_sales`         | `src/lib/dataCalculations.ts`           |
| Query Logic  | Construção da Query            | `src/services/transactionsService.ts`   |
| State        | Armazenar resultados e filtros | `src/contexts/TransactionsProvider.tsx` |
| Persistência | Salvar configs no LocalStorage | `src/services/configStorage.ts`         |

💡 Esse desacoplamento garante que, se o Supabase for substituído por uma API Node.js, **apenas os arquivos dentro de `src/services/` precisam ser alterados.**

---

## 🚀 Como Rodar o Projeto

### 1. Pré-requisitos

- Node.js (versão LTS)
- npm, yarn ou pnpm (preferencialmente **npm**)

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz e adicione:

```
VITE_SUPABASE_URL=SUA-URL-AQUI
VITE_SUPABASE_ANON_KEY=SUA-CHAVE-AQUI
VITE_SUPABASE_SERVICE_ROLE_KEY=SUA-CHAVE-AQUI
VITE_REGISTRATION_SECRET=SUA-CHAVE-AQUI
```

### 3. Instalação e Execução

```bash
# 1. Instalar dependências
npm install

# 2. Rodar ambiente de desenvolvimento
npm run dev
```

Acesse **http://localhost:5173** (ou porta semelhante).

---

🦈 **Black Shark Analytics** — Performance, clareza e dados sob controle.
