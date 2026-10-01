# Portal de Solicitações Internas

Portal web para que colaboradores registrem demandas internas (TI, RH, Compras, Financeiro e Infraestrutura) e acompanhem sua evolução até a conclusão, enquanto a equipe de atendimento gerencia o status de cada solicitação.

| Dashboard | Solicitações |
| --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Listagem](docs/screenshots/solicitacoes.png) |

| Detalhes e histórico | Mobile |
| --- | --- |
| ![Detalhes](docs/screenshots/detalhes.png) | ![Mobile](docs/screenshots/mobile-solicitacoes.png) |

> 📘 As tecnologias adotadas, suas justificativas e a análise crítica da solução estão no [Memorial Técnico](docs/MEMORIAL_TECNICO.md).

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Arquitetura e estrutura do repositório](#arquitetura-e-estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Início rápido (Docker — recomendado)](#início-rápido-docker--recomendado)
- [Instalação passo a passo](#instalação-passo-a-passo)
- [Configuração](#configuração)
- [Execução](#execução)
- [Acesso e usuários de teste](#acesso-e-usuários-de-teste)
- [Testes automatizados](#testes-automatizados)
- [Testando a API com o Bruno](#testando-a-api-com-o-bruno)
- [Referência da API](#referência-da-api)
- [Solução de problemas](#solução-de-problemas)

---

## Funcionalidades

| Requisito | Implementação |
| --- | --- |
| **1. Autenticação** | Login com usuário e senha, sessão via JWT em cookie `httpOnly` (expira em 8h por padrão), restauração automática da sessão ao recarregar a página e logout. |
| **2. Cadastro de solicitações** | Campos **Título**, **Descrição** e **Categoria** (TI, RH, Compras, Financeiro, Infraestrutura). **Data de criação**, **Solicitante** e **Status = Aberto** são preenchidos automaticamente. O solicitante pode **criar**, **editar** e **excluir** solicitações enquanto estiverem **Abertas**. |
| **3. Gerenciamento** | Listagem com **Código, Título, Categoria, Solicitante, Data de abertura e Status** (tabela no desktop, cartões no mobile). Ações: **consultar detalhes** e **alterar status** (Aberto, Em atendimento, Concluído). Cada alteração é registrada em um **histórico (timeline)**. |
| **4. Consulta e filtros** | Pesquisa por **período** (de/até), **categoria**, **status** e **texto livre no título**, com paginação. Os filtros ficam na URL (podem ser compartilhados/favoritados). |
| **5. Dashboard** | Indicadores de **total**, **abertas**, **em atendimento** e **concluídas**, além da distribuição por categoria. Cada indicador leva à listagem já filtrada. |

### Perfis de acesso

| Ação | Colaborador | Atendente |
| --- | :---: | :---: |
| Criar solicitação | ✅ | ✅ |
| Ver solicitações | Somente as próprias | Todas |
| Editar / excluir | Somente as próprias e com status **Aberto** | Somente as próprias e com status **Aberto** |
| Alterar status | ❌ | ✅ |
| Dashboard | Indicadores das próprias solicitações | Indicadores de todas |

As regras são aplicadas **no backend** (a interface apenas oculta as ações não permitidas).

---

## Arquitetura e estrutura do repositório

```
┌──────────────┐   http://localhost:8080   ┌──────────────────────┐   /api/*   ┌──────────────┐   SQL   ┌──────────────┐
│  Navegador   │ ────────────────────────▶ │ web (Nginx + SPA)    │ ─────────▶ │ api (Express)│ ──────▶ │ db (Postgres)│
└──────────────┘   cookie httpOnly (JWT)   └──────────────────────┘   proxy    └──────────────┘ Prisma  └──────────────┘
```

O Nginx serve o frontend e encaminha `/api` para a API, de modo que **frontend e API ficam na mesma origem** — o cookie de sessão funciona sem configurações de CORS/SameSite adicionais.

```
.
├── backend/                  # API REST (Node.js + Express + Prisma)
│   ├── prisma/               # schema.prisma, migrations, seed e dados fictícios (seed-data.ts)
│   ├── src/
│   │   ├── config/           # variáveis de ambiente (validadas com zod) e cookies
│   │   ├── lib/              # Prisma Client e JWT
│   │   ├── middlewares/      # autenticação, autorização, validação e erros
│   │   └── modules/          # auth, requests (solicitações) e dashboard
│   ├── tests/                # testes Jest + Supertest
│   ├── Dockerfile
│   └── docker-entrypoint.sh  # migrations + seed + start
├── frontend/                 # SPA (React + Vite + Tailwind + shadcn/ui)
│   ├── nginx/                # configuração do Nginx (SPA + proxy /api)
│   ├── src/
│   │   ├── components/       # ui (shadcn), layout, requests, dashboard
│   │   ├── contexts/         # AuthContext (sessão)
│   │   ├── hooks/            # hooks do TanStack Query
│   │   ├── pages/            # telas
│   │   └── services/         # cliente HTTP (axios)
│   └── Dockerfile
├── bruno/                    # coleção Bruno para testar a API
├── docs/
│   ├── MEMORIAL_TECNICO.md
│   └── screenshots/
├── docker-compose.yml        # db + api + web
├── start.sh / start.ps1      # sobe tudo com um comando
└── .env.example
```

---

## Pré-requisitos

### Para executar com Docker (recomendado)

| Item | Versão | Observação |
| --- | --- | --- |
| **Docker Engine** ou **Docker Desktop** | 24+ | <https://docs.docker.com/get-docker/> |
| **Docker Compose** | v2 (comando `docker compose`) | Já incluso no Docker Desktop |
| **Git** | qualquer | Para clonar o repositório |

Portas livres por padrão: **8080** (frontend), **3333** (API) e **5432** (PostgreSQL) — todas configuráveis no `.env`.

### Para executar sem Docker (desenvolvimento local)

| Item | Versão |
| --- | --- |
| **Linguagem** | **TypeScript 5** sobre **Node.js 20 ou superior** (testado com Node.js 22 LTS) e **npm 10+** |
| **Banco de dados** | **PostgreSQL 14 ou superior** (a imagem Docker usa PostgreSQL 16) |

### Principais dependências (instaladas automaticamente pelo `npm`)

| Camada | Dependências |
| --- | --- |
| Backend | Express 4, Prisma ORM 6 (`prisma` + `@prisma/client`), zod, jsonwebtoken, bcryptjs, cookie-parser, helmet, cors, express-rate-limit, dotenv |
| Frontend | React 18, Vite 6, Tailwind CSS 3, shadcn/ui (Radix UI), React Router 6, TanStack Query 5, React Hook Form + zod, axios, date-fns, lucide-react, sonner |
| Testes | Jest 29, ts-jest, Supertest, jest-mock-extended, Testing Library (React, user-event, jest-dom), jsdom |

A lista completa e a justificativa de cada uma estão no [Memorial Técnico](docs/MEMORIAL_TECNICO.md).

---

## Início rápido (Docker — recomendado)

```bash
git clone https://github.com/luiscadari/portal-solicitacoes-internas-desafio-bit.git
cd portal-solicitacoes-internas-desafio-bit

# Linux / macOS / WSL / Git Bash
./start.sh

# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

O script:

1. verifica se o Docker está instalado;
2. cria o `.env` a partir do `.env.example` (se ainda não existir);
3. executa `docker compose up --build -d` (banco, API e frontend);
4. aguarda a API ficar saudável — na primeira subida ela **aplica as migrations e popula o banco com dados de demonstração** automaticamente;
5. exibe a URL e as credenciais de acesso.

Acesse **<http://localhost:8080>** e entre com um dos [usuários de teste](#acesso-e-usuários-de-teste).

> Sem os scripts, o equivalente é: `cp .env.example .env` (opcional — há valores padrão) e `docker compose up --build -d`.

---

## Instalação passo a passo

### Opção A — Tudo via Docker

Nenhuma instalação além do Docker é necessária. Veja o [Início rápido](#início-rápido-docker--recomendado). Comandos úteis:

```bash
docker compose ps                 # status dos containers
docker compose logs -f api        # logs da API
docker compose down               # para os containers (mantém os dados)
docker compose down -v            # para e APAGA o banco (volta ao seed na próxima subida)
docker compose up --build -d      # reconstrói após alterar o código
```

### Opção B — Desenvolvimento local (sem Docker para API e frontend)

#### 1. Banco de dados (PostgreSQL)

Use **uma** das alternativas:

**a) PostgreSQL via Docker (somente o banco):**

```bash
docker compose up -d db
```

Isso cria o banco `portal_solicitacoes` com usuário `portal` / senha `portal` na porta `5432`.

**b) PostgreSQL instalado na máquina:**

```sql
CREATE USER portal WITH PASSWORD 'portal' CREATEDB;
CREATE DATABASE portal_solicitacoes OWNER portal;
```

> A permissão `CREATEDB` é usada pelo `prisma migrate dev` (shadow database). Se preferir, ajuste a `DATABASE_URL` para um usuário existente.

#### 2. Backend (API)

```bash
cd backend
cp .env.example .env          # ajuste DATABASE_URL se necessário
npm install                   # instala as dependências
npx prisma generate           # gera o Prisma Client tipado
npx prisma migrate deploy     # cria as tabelas
npx prisma db seed            # popula usuários e solicitações de demonstração
npm run dev                   # API em http://localhost:3333 (recarrega ao salvar)
```

Teste: <http://localhost:3333/api/health> deve retornar `{"status":"ok",...}`.

#### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

O servidor do Vite encaminha `/api` para `http://localhost:3333` (configurável em `VITE_API_PROXY_TARGET`), mantendo frontend e API na mesma origem.

---

## Configuração

### Variáveis de ambiente — Docker Compose (`.env` na raiz)

Todas possuem valor padrão; o `.env` é opcional.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `POSTGRES_USER` | `portal` | Usuário do PostgreSQL |
| `POSTGRES_PASSWORD` | `portal` | Senha do PostgreSQL |
| `POSTGRES_DB` | `portal_solicitacoes` | Nome do banco |
| `POSTGRES_PORT` | `5432` | Porta do banco exposta no host |
| `API_PORT` | `3333` | Porta da API exposta no host |
| `JWT_SECRET` | `troque-este-segredo-em-producao` | Segredo de assinatura dos tokens (**altere em produção**) |
| `JWT_EXPIRES_IN` | `8h` | Duração da sessão (`30m`, `8h`, `1d`...) |
| `CORS_ORIGIN` | `http://localhost:8080` | Origens permitidas (separadas por vírgula) para acesso direto à API |
| `COOKIE_SECURE` | `false` | `true` quando servido via HTTPS |
| `LOGIN_RATE_LIMIT` | `20` | Tentativas de login **malsucedidas** permitidas por IP a cada 15 minutos |
| `WEB_PORT` | `8080` | Porta do frontend exposta no host |

### Variáveis de ambiente — Backend local (`backend/.env`)

| Variável | Exemplo | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://portal:portal@localhost:5432/portal_solicitacoes?schema=public` | Conexão com o PostgreSQL |
| `PORT` | `3333` | Porta HTTP da API |
| `JWT_SECRET` | `troque-este-segredo-em-producao` | Segredo do JWT (mínimo 8 caracteres) |
| `JWT_EXPIRES_IN` | `8h` | Duração da sessão |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem do frontend |
| `COOKIE_SECURE` | `false` | Cookie apenas em HTTPS |
| `LOGIN_RATE_LIMIT` | `20` | Tentativas de login malsucedidas por IP a cada 15 minutos |
| `NODE_ENV` | `development` | `development`, `test` ou `production` |

As variáveis são validadas na inicialização (zod); valores inválidos interrompem a API com uma mensagem clara.

### Variáveis de ambiente — Frontend local (`frontend/.env`, opcional)

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `VITE_API_PROXY_TARGET` | `http://localhost:3333` | Destino do proxy `/api` do servidor de desenvolvimento |

### Credenciais de demonstração

| Recurso | Credencial |
| --- | --- |
| PostgreSQL | usuário `portal` / senha `portal` / banco `portal_solicitacoes` |
| Usuários da aplicação | ver [Acesso e usuários de teste](#acesso-e-usuários-de-teste) |

---

## Execução

### Com Docker

| Ação | Comando |
| --- | --- |
| Subir tudo | `./start.sh` (ou `start.ps1`) ou `docker compose up --build -d` |
| Parar | `docker compose down` |
| Resetar dados | `docker compose down -v && docker compose up -d` |

### Sem Docker

| Serviço | Desenvolvimento | Produção |
| --- | --- | --- |
| Backend | `cd backend && npm run dev` | `cd backend && npm run build && npm start` |
| Frontend | `cd frontend && npm run dev` | `cd frontend && npm run build && npm run preview` (os arquivos de `dist/` podem ser servidos por qualquer servidor estático com proxy de `/api`) |

Outros scripts:

| Projeto | Script | Descrição |
| --- | --- | --- |
| backend | `npm run prisma:migrate` | Cria/aplica migrations em desenvolvimento |
| backend | `npm run prisma:seed` | Executa o seed |
| backend | `npm run typecheck` | Verificação de tipos |
| frontend | `npm run typecheck` | Verificação de tipos |
| ambos | `npm test` / `npm run test:coverage` | Testes automatizados (com cobertura) |

---

## Acesso e usuários de teste

| Serviço | URL |
| --- | --- |
| **Aplicação (Docker)** | <http://localhost:8080> |
| Aplicação (dev local) | <http://localhost:5173> |
| API — health check | <http://localhost:3333/api/health> |

| Usuário | Senha | Perfil | O que testar |
| --- | --- | --- | --- |
| `colaborador` | `colaborador123` | Colaborador | Criar, editar e excluir solicitações abertas; acompanhar o status das próprias solicitações |
| `maria` | `maria123` | Colaborador | Mesmo perfil, com outras solicitações (verifica o isolamento entre colaboradores) |
| `atendente` | `atendente123` | Atendente | Ver todas as solicitações, alterar status e consultar o histórico |
| `bruno.lima` | `senha123` | Atendente | Segundo atendente (aparece no histórico das solicitações de exemplo) |

### Dados fictícios (seed)

Na primeira subida, o banco é populado automaticamente com dados fictícios, gerados por `backend/prisma/seed-data.ts`:

- **12 usuários**: os 4 acima e mais 8 colaboradores fictícios, todos com a senha `senha123` (`joao.pereira`, `fernanda.alves`, `ricardo.santos`, `juliana.costa`, `paulo.mendes`, `camila.rocha`, `lucas.martins`, `beatriz.oliveira`);
- **80 solicitações** abertas nos **últimos 90 dias**, em todas as categorias, com títulos e descrições realistas;
- **status coerentes com a idade** da solicitação (as antigas tendem a estar concluídas) e **histórico completo** de cada mudança, feita por um dos atendentes.

A geração é determinística e o seed é idempotente: reiniciar a API não duplica dados. Para recriar a base do zero, execute `docker compose down -v` e suba novamente.

### Roteiro sugerido

1. Entre como **colaborador**, crie uma solicitação em **Nova solicitação** e edite-a.
2. Saia (menu do usuário → **Sair**) e entre como **atendente**: localize a solicitação usando os filtros e **altere o status** para *Em atendimento*.
3. Volte como **colaborador**: a solicitação aparece *Em atendimento*, com o histórico na tela de detalhes, e não pode mais ser editada/excluída.
4. Confira os indicadores do **Dashboard** e teste a interface em um celular ou no modo responsivo do navegador.

---

## Testes automatizados

Ambos os projetos usam **Jest**. Os testes não dependem de banco de dados nem da API em execução.

```bash
cd backend && npm test      # 44 testes: rotas HTTP (Supertest) com Prisma mockado e gerador do seed
cd frontend && npm test     # 29 testes: componentes, páginas e utilitários (Testing Library + jsdom)
```

Use `npm run test:coverage` para o relatório de cobertura (`coverage/`).

| Backend | Frontend |
| --- | --- |
| Login/logout/sessão, validação de entrada, CRUD com regras de dono e status, alteração de status (RBAC + histórico), filtros, dashboard, utilitários e dados fictícios do seed | Login, rota protegida, dashboard, formulário de solicitação, filtros, tabela/ações por perfil, badges e utilitários |

---

## Testando a API com o Bruno

O diretório [`bruno/`](bruno) contém uma coleção do [Bruno](https://www.usebruno.com/), cliente de API *open source*, com **32 requisições** e **59 asserções** que percorrem todos os fluxos da API.

| Pasta | O que cobre |
| --- | --- |
| `01 Health` | Health check |
| `02 Autenticacao` | Login inválido e válido, validação, sessão atual, logout e sessão encerrada |
| `03 Solicitacoes - Colaborador` | Criar (com campos automáticos), validação, listar, filtrar (período, categoria, status e texto), detalhar, editar e tentar alterar status (403) |
| `04 Atendimento` | Listar todas, iniciar e concluir atendimento com histórico, status repetido (409) ou inválido (400), edição por não solicitante (403) e 404 |
| `05 Dashboard` | Indicadores do atendente e do colaborador |
| `06 Exclusao` | Exclusão bloqueada (409), exclusão de solicitação aberta (204) e consulta após excluir (404) |

### No aplicativo Bruno

1. Instale o Bruno: <https://www.usebruno.com/downloads>.
2. **Open Collection** → selecione a pasta `bruno/` do repositório.
3. No seletor de ambientes (canto superior direito), escolha:
   - **Docker**: `http://localhost:8080/api` (via Nginx, após `./start.sh`);
   - **Local**: `http://localhost:3333/api` (API direta, Docker ou `npm run dev`).
4. Execute as requisições individualmente, em ordem, ou a coleção inteira pelo **Runner** (botão *Run* da coleção).

A sessão é automática: as requisições de login guardam o token na variável `token`, e o cabeçalho `Cookie` da coleção o envia nas chamadas seguintes. As requisições são encadeadas (por exemplo, o código da solicitação criada fica em `requestId`), por isso o Runner executa as pastas em ordem.

### Pela linha de comando

```bash
npm install -g @usebruno/cli
cd bruno
bru run --env Docker      # ou: bru run --env Local
```

A coleção pode ser executada várias vezes seguidas: cada execução cria os próprios registros. Só as tentativas de login malsucedidas contam para o limite `LOGIN_RATE_LIMIT`.

---

## Referência da API

Base: `/api`. Respostas em JSON. Rotas (exceto login, logout e health) exigem o cookie de sessão.

| Método | Rota | Perfil | Descrição |
| --- | --- | --- | --- |
| `GET` | `/health` | público | Health check |
| `POST` | `/auth/login` | público | `{ username, password }` → define o cookie `portal_token` |
| `POST` | `/auth/logout` | público | Remove o cookie de sessão |
| `GET` | `/auth/me` | autenticado | Usuário da sessão |
| `GET` | `/requests` | autenticado | Lista paginada. Query: `page`, `pageSize` (máx. 100), `from`, `to` (data ISO), `category`, `status`, `q` |
| `POST` | `/requests` | autenticado | `{ title, description, category }` |
| `GET` | `/requests/:id` | autenticado | Detalhes + histórico |
| `PUT` | `/requests/:id` | solicitante | Edita (somente status Aberto) |
| `DELETE` | `/requests/:id` | solicitante | Exclui (somente status Aberto) |
| `PATCH` | `/requests/:id/status` | atendente | `{ status }` — `ABERTO`, `EM_ATENDIMENTO` ou `CONCLUIDO` |
| `GET` | `/dashboard` | autenticado | `{ total, aberto, emAtendimento, concluido, porCategoria }` |

Códigos de erro: `400` (validação, com `details` por campo), `401` (sem sessão), `403` (sem permissão), `404` (não encontrado), `409` (regra de negócio, ex.: editar solicitação que não está aberta).

---

## Solução de problemas

| Sintoma | Solução |
| --- | --- |
| `port is already allocated` | Altere `WEB_PORT`, `API_PORT` ou `POSTGRES_PORT` no `.env` e rode novamente. |
| `./start.sh: Permission denied` | `chmod +x start.sh` ou `bash start.sh`. |
| PowerShell bloqueia o script | `powershell -ExecutionPolicy Bypass -File .\start.ps1` |
| API não fica saudável | `docker compose logs api` — verifique conexão com o banco e variáveis. |
| Quero recomeçar com os dados de exemplo | `docker compose down -v` e suba novamente. |
| Login não persiste ao acessar a API por outra origem | Acesse pelo frontend (mesma origem). Para HTTPS, use `COOKIE_SECURE=true`. |
