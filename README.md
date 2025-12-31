# 🐄 BOVINEXT - Gestão Pecuária Inteligente

Sistema completo de gestão pecuária com IA integrada, desenvolvido com Next.js, Node.js/Express e Supabase.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executando o Projeto](#-executando-o-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Funcionalidades](#-funcionalidades)
- [API Endpoints](#-api-endpoints)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

O **BOVINEXT** é uma plataforma completa para gestão pecuária que oferece:

- 📊 **Dashboard Inteligente** - Visualização de dados em tempo real
- 🤖 **Chatbot com IA (BOVI)** - Assistente virtual powered by DeepSeek
- 💰 **Gestão Financeira** - Controle de transações, metas e investimentos
- 📈 **Análises e Relatórios** - Gráficos e métricas detalhadas
- 🔐 **Autenticação Segura** - Login com Google e credenciais via Supabase
- 📱 **Design Responsivo** - Funciona em desktop e mobile

## 🛠 Tecnologias

### Frontend
- **Next.js 15** - Framework React com SSR
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Material-UI** - Componentes UI
- **Recharts/ApexCharts** - Gráficos
- **Framer Motion** - Animações

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **Supabase** - Database, Auth e Storage

### Infraestrutura
- **Supabase** - Backend as a Service (BaaS)
- **DeepSeek API** - IA para o chatbot

## 📁 Estrutura do Projeto

```
bovinext/
├── backend/                    # API Node.js/Express
│   ├── src/
│   │   ├── config/            # Configurações (Supabase, etc.)
│   │   ├── controllers/       # Controllers da API
│   │   ├── middlewares/       # Middlewares (auth, security)
│   │   ├── models/            # Models do Supabase
│   │   ├── routes/            # Rotas da API
│   │   ├── services/          # Serviços (IA, etc.)
│   │   └── index.ts           # Entry point
│   ├── scripts/               # Scripts utilitários
│   ├── .env.example           # Exemplo de variáveis de ambiente
│   └── package.json
│
├── frontend/                   # Aplicação Next.js
│   ├── components/            # Componentes React
│   ├── context/               # Context API (Auth, Theme, etc.)
│   ├── hooks/                 # Custom Hooks
│   ├── pages/                 # Páginas Next.js
│   │   ├── api/              # API Routes
│   │   ├── auth/             # Páginas de autenticação
│   │   └── ...
│   ├── public/               # Arquivos estáticos
│   ├── services/             # Serviços (API, Auth)
│   ├── styles/               # Estilos globais
│   ├── types/                # TypeScript types
│   ├── .env.example          # Exemplo de variáveis de ambiente
│   └── package.json
│
├── .gitignore                 # Arquivos ignorados pelo Git
└── README.md                  # Este arquivo
```

## ✅ Pré-requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm** ou **yarn**
- **Conta no Supabase** (gratuita)
- **Chave da API DeepSeek** (para o chatbot)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/saulomartins80/bovinext.git
cd bovinext
```

### 2. Instale as dependências do Backend

```bash
cd backend
npm install
```

### 3. Instale as dependências do Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuração

### Backend

Crie o arquivo `backend/.env` baseado no exemplo:

```bash
cp backend/.env.example backend/.env
```

Configure as variáveis:

```env
# Environment
NODE_ENV=development
PORT=4000

# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Frontend URLs
FRONTEND_URL=http://localhost:3001
FRONTEND_ALT_URL=http://127.0.0.1:3001

# JWT Secret (gere uma string segura)
JWT_SECRET=sua_chave_jwt_secreta_aqui

# DeepSeek API (para o Chatbot BOVI)
DEEPSEEK_API_KEY=sua_chave_deepseek_aqui
```

### Frontend

Crie o arquivo `frontend/.env.local` baseado no exemplo:

```bash
cp frontend/.env.example frontend/.env.local
```

Configure as variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## ▶️ Executando o Projeto

### Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
O backend estará disponível em `http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
O frontend estará disponível em `http://localhost:3001`

### Produção

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 📜 Scripts Disponíveis

### Backend

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento com hot-reload |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm start` | Inicia a versão compilada |

### Frontend

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento (porta 3001) |
| `npm run build` | Build de produção |
| `npm start` | Inicia servidor de produção |
| `npm run lint` | Executa ESLint |
| `npm run lint:fix` | Corrige erros de lint automaticamente |
| `npm run format` | Formata código com Prettier |

## ✨ Funcionalidades

### 🏠 Dashboard
- Visão geral do rebanho e finanças
- Gráficos interativos
- Métricas em tempo real

### 🤖 Chatbot BOVI
- Assistente virtual com IA
- Respostas contextualizadas
- Streaming em tempo real (SSE)

### 💵 Gestão Financeira
- Controle de transações
- Metas financeiras
- Investimentos

### 👤 Autenticação
- Login com Google
- Login com email/senha
- Recuperação de senha

### ⚙️ Configurações
- Tema claro/escuro
- Preferências do usuário
- Perfil

## 🔗 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout

### Usuários
- `GET /api/users/:uid` - Buscar usuário
- `PUT /api/users/:uid` - Atualizar usuário

### Transações
- `GET /api/transacoes` - Listar transações
- `POST /api/transacoes` - Criar transação
- `PUT /api/transacoes/:id` - Atualizar transação
- `DELETE /api/transacoes/:id` - Deletar transação

### Chatbot
- `POST /api/chatbot/message` - Enviar mensagem (SSE)

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ por [Saulo Martins](https://github.com/saulomartins80)**
