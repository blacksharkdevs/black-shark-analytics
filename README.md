# 🦈 Black Shark Analytics

Bem-vindo(a) ao **Black Shark Analytics**! Este é o painel de métricas da nossa empresa de marketing, o coração de onde analisamos as vendas, reembolsos e performance dos nossos afiliados.

Este projeto foi totalmente refatorado do Next.js para uma **stack moderna, leve e performática**: **React + Vite + SWC + TypeScript**.

Seja você um dev experiente ou alguém que acabou de chegar, este README é o seu **guia essencial** para entender, rodar e desenvolver no projeto.

---

## 🛠️ Stack Tecnológica

Aqui é onde a mágica acontece. A performance do Black Shark é garantida por essa combinação de ferramentas:

| Categoria         | Tecnologia       | Por que usamos?                                         |
| :---------------- | :--------------- | :------------------------------------------------------ |
| **Frontend**      | React            | Biblioteca de UI padrão do mercado.                     |
| **Build Tool**    | Vite             | Compilação super-rápida (dev e produção).               |
| **Transpiler**    | SWC              | Substituindo o Babel para builds _instantâneos_.        |
| **Linguagem**     | TypeScript       | Segurança de tipos para evitar bugs bobos.              |
| **Estilização**   | Tailwind CSS     | Utility-First para desenvolver a UI em tempo recorde.   |
| **Banco/Backend** | Supabase         | Database e autenticação simples e robusta (PostgreSQL). |
| **Roteamento**    | React Router DOM | Gerenciamento de rotas e navegação.                     |

---

## 📁 Estrutura de Pastas Profissional

A estrutura do projeto segue o princípio de **separação de preocupações (SoC)**, facilitando a localização de arquivos e a manutenção.

### 🌲 Visão em Árvore

Para uma visão rápida, aqui está como o projeto está organizado. Note a separação clara entre **UI, Lógica, Páginas e Utilitários**.

```
├── .vscode/ # ⚙️ Configurações (settings, extensions)
├── node_modules/ # 📦 Dependências (gerado automaticamente)
├── public/ # 🖼️ Arquivos estáticos (favicon, logos, etc.)
│
├── src/ # 🦈 Coração da Aplicação (Tudo que será compilado)
│ ├── assets/ # 🎨 Mídia, ícones, fontes, estilos globais
│ │ ├── images/
│ │ └── styles/
│ │ ├── global.css
│ │ └── variables.css
│ │
│ ├── components/ # 🧱 Componentes Reutilizáveis
│ │ ├── common/ # 🧩 Componentes "burros" (UI) - Botões, Inputs, Cards genéricos
│ │ ├── layout/ # 📐 Componentes de Layout - Header, Sidebar, Footer (Ex: AppSidebar.tsx)
│ │ └── domain/ # 📊 Componentes que carregam lógica específica (Ex: SalesTrendChart.tsx)
│ │
│ ├── hooks/ # 🎣 Lógica de estado/ciclo de vida (useAuth, useToast, useDateRange)
│ │
│ ├── contexts/ # 🌟 Gerenciamento de estado global (AuthContext, DateRangeContext)
│ │
│ ├── lib/ # 📚 Utilitários e Wrappers
│ │ ├── api/ # 🔗 Funções de interação com API ou Supabase
│ │ └── utils.ts # Funções helpers genéricas
│ │
│ ├── pages/ # 🧭 Telas da Aplicação (Organizadas por Rota)
│ │ ├── Login/ # /login
│ │ │ └── Login.tsx
│ │ │
│ │ ├── Dashboard/ # /dashboard/\*
│ │ │ ├── components/ # Componentes exclusivos desta página/domínio
│ │ │ ├── Vendas/ # /dashboard/vendas
│ │ │ │ └── VendasPage.tsx
│ │ │ └── Reembolsos/# /dashboard/reembolsos
│ │ │ └── ReembolsosPage.tsx
│ │ └── App.tsx # Ponto de entrada com o Roteador Principal
│ │
│ └── main.tsx # 🚀 Ponto de entrada do Vite (Monta o React no DOM)
│
├── .gitignore # 🚫 O que o Git deve ignorar
├── README.md # 📄 Documentação
├── package.json # Dependências e scripts
├── vite.config.ts # ⚡ Configuração do bundler (Vite + SWC)
├── tsconfig.json # Configuração do TypeScript
└── tailwind.config.js # Configuração do Tailwind CSS
```

---

### 🗺️ Guia Rápido por Responsabilidade

| Pasta            | Conteúdo                                                               | Para que serve?                                                                                                 |
| :--------------- | :--------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| `src/assets`     | Imagens, fontes e estilos globais (`global.css`).                      | 🖼️ Onde ficam os recursos estáticos que não são código.                                                         |
| `src/components` | **Componentes Reutilizáveis** (UI e Lógica).                           | 🧱 Nossa biblioteca de blocos de montar. Divididos em `common` (botões/inputs) e `layout` (Sidebar/Header).     |
| `src/contexts`   | Providers e gerenciamento de estado global.                            | 🌟 Onde definimos quem tem acesso a dados globais (Autenticação, Configuração de Data).                         |
| `src/hooks`      | Lógica de reuso e custom hooks (e.g., `useAuth`, `useToast`).          | 🎣 Encapsula a lógica de estado/ciclo de vida do componente.                                                    |
| `src/lib`        | Funções utilitárias, wrappers de terceiros e clientes de API/Supabase. | 📚 O "canivete suíço" do projeto. Funções que fazem coisas fora do React.                                       |
| `src/pages`      | **Telas** da aplicação. Uma pasta por rota principal.                  | 🗺️ O mapa do site. Se o URL é `/dashboard/vendas`, você encontra a tela dentro de `src/pages/Dashboard/Vendas`. |
| `public`         | `index.html`, `favicon.ico` e arquivos que vão direto para a raiz.     | 🌐 Arquivos estáticos servidos diretamente.                                                                     |

---

## 🚀 Como Colocar para Rodar

Siga estes passos para ter o Black Shark Analytics rodando na sua máquina:

### 1. Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** (versão LTS recomendada)
- **npm** ou **yarn** ou **pnpm** (use o que preferir, mas `npm` é o padrão)

### 2. Variáveis de Ambiente

O projeto precisa de credenciais do Supabase. Crie um arquivo `.env` na raiz e preencha com o seguinte (peça a um colega as chaves):

```dotenv
VITE_SUPABASE_URL=secreto-url-aqui
VITE_SUPABASE_ANON_KEY=secreto-key-aqui
```
