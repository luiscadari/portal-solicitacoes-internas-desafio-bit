# Memorial Técnico — Portal de Solicitações Internas

## 1. Objetivo

Registrar as decisões técnicas do Portal de Solicitações Internas: as tecnologias, frameworks, bibliotecas, serviços e ferramentas adotados e o motivo de cada escolha, a arquitetura implementada e uma análise crítica da solução (limitações, melhorias futuras, requisitos que poderiam ser aperfeiçoados e o que mudaria em um ambiente corporativo de produção).

## 2. Visão geral da solução

A aplicação é um monorepo com dois projetos independentes, cada um em seu diretório, e um banco relacional:

| Camada | Diretório | Responsabilidade |
| --- | --- | --- |
| Frontend (SPA) | `frontend/` | Interface responsiva: login, dashboard, listagem com filtros, cadastro/edição, detalhes com histórico |
| API REST | `backend/` | Autenticação, regras de negócio, autorização por perfil, validação e persistência |
| Banco de dados | container `db` | PostgreSQL 16 com as tabelas `users`, `requests` e `status_history` |

Em execução via Docker Compose:

```
Navegador ──▶ web (Nginx: SPA + proxy /api) ──▶ api (Express + Prisma) ──▶ db (PostgreSQL)
```

### 2.1 Modelo de dados

| Tabela | Campos principais | Observações |
| --- | --- | --- |
| `users` | `id`, `username` (único), `name`, `password_hash`, `role` (`COLABORADOR` / `ATENDENTE`) | Senhas armazenadas com hash bcrypt |
| `requests` | `id` (código), `title`, `description`, `category`, `status`, `requester_id`, `created_at`, `updated_at` | Índices em `status`, `category`, `created_at` e `requester_id` para os filtros |
| `status_history` | `request_id`, `from_status`, `to_status`, `changed_by_id`, `changed_at` | Trilha de auditoria das mudanças de status, removida em cascata com a solicitação |

Categorias e status são **enums nativos do PostgreSQL**, o que garante a integridade no próprio banco e gera tipos TypeScript pelo Prisma.

### 2.2 Regras de negócio

- Campos automáticos na criação: data de criação, solicitante (usuário da sessão) e status **Aberto**. Mesmo que o cliente envie outro status, a API ignora.
- Edição e exclusão: somente pelo **solicitante** e enquanto o status for **Aberto** (`403` para quem não é o dono, `409` quando o status não permite).
- Alteração de status: somente pelo perfil **Atendente**. Cada alteração grava uma entrada em `status_history`, na mesma operação de escrita.
- Visibilidade: colaboradores veem apenas as próprias solicitações (listagem, detalhes e dashboard). Atendentes veem todas.
- Filtros: período sobre a data de abertura (o dia final é incluído inteiro), categoria, status e texto livre no título (sem diferenciar maiúsculas e minúsculas), com paginação.

### 2.3 Fluxo de autenticação

1. `POST /api/auth/login` confere a senha com bcrypt e emite um **JWT** (HS256) com `id`, `username`, `name` e `role`.
2. O token é gravado em cookie **`httpOnly`**, **`SameSite=Lax`** e, opcionalmente, **`Secure`**. Ele fica inacessível ao JavaScript, o que reduz o impacto de XSS.
3. A cada requisição, o middleware `authenticate` valida o token. O `requireRole` restringe as rotas por perfil.
4. O frontend restaura a sessão chamando `GET /api/auth/me` ao carregar. Qualquer `401` posterior (sessão expirada) devolve o usuário à tela de login.
5. `POST /api/auth/logout` remove o cookie.

Como o Nginx (ou o proxy do Vite em desenvolvimento) serve a SPA e a API **na mesma origem**, o cookie trafega sem precisar de CORS com credenciais entre domínios.

## 3. Tecnologias e justificativas

### 3.1 Linguagem

| Tecnologia | Versão | Justificativa |
| --- | --- | --- |
| **TypeScript** | 5.9 | Tipagem forte, que aumenta a previsibilidade e permite corrigir erros enquanto se programa, agilizando a entrega com qualidade. No projeto, os tipos atravessam todas as camadas: o Prisma gera os tipos a partir do schema do banco, o zod deriva os tipos das entradas validadas, e o frontend tipa as respostas da API. Assim, uma mudança de contrato aparece como erro de compilação em vez de bug em produção. |
| **Node.js** | 22 LTS (mín. 20) | Runtime JavaScript/TypeScript no servidor, com versão LTS de suporte estendido. Usar a mesma linguagem no front e no back reduz a troca de contexto e permite reaproveitar conhecimento e ferramentas (zod, Jest, TypeScript) nos dois lados. |

### 3.2 Backend

| Tecnologia | Versão | Justificativa |
| --- | --- | --- |
| **Express** | 4.22 | Framework HTTP minimalista, maduro e amplamente conhecido, com um grande ecossistema de middlewares. Organizamos a aplicação em módulos (routes → controller → service), o que mantém a regra de negócio isolada do HTTP. A *factory* `createApp()` permite testar a aplicação sem abrir porta. |
| **Prisma ORM** | 6.19 | ORM com *schema* declarativo, migrations versionadas e client **totalmente tipado**. Evita SQL manual sujeito a erros e injeção, documenta o modelo de dados em um único arquivo (`schema.prisma`) e facilita a evolução do banco com `migrate`. A versão 6 é a linha estável que não exige *driver adapters* nem o novo arquivo de configuração da v7. |
| **PostgreSQL** | 16 | Banco relacional robusto e de código aberto, com enums nativos, índices eficientes, busca *case-insensitive* (`ILIKE`, usada pelo `mode: 'insensitive'` do Prisma) e transações ACID. É uma escolha comum em ambientes corporativos. |
| **zod** | 3.25 | Validação de esquemas com inferência de tipos. Valida o corpo, os parâmetros e a query de cada rota, as variáveis de ambiente na inicialização e os formulários no frontend. Uma única fonte define a regra e o tipo. |
| **jsonwebtoken** | 9 | Emissão e verificação de JWT para sessão *stateless*. Dispensa armazenar sessões no servidor e escala horizontalmente. |
| **bcryptjs** | 3 | Hash de senhas com *salt* e custo configurável. É a implementação em JavaScript puro, sem dependência nativa, o que simplifica o build em Alpine/Windows. |
| **cookie-parser** | 1.4 | Leitura do cookie de sessão `httpOnly`. |
| **helmet** | 8 | Cabeçalhos HTTP de segurança (CSP, `X-Content-Type-Options`, HSTS e outros) com configuração mínima. |
| **cors** | 2.8 | Controle das origens autorizadas a chamar a API diretamente (útil em desenvolvimento ou se o frontend for hospedado em outro domínio). |
| **express-rate-limit** | 8 | Limita as tentativas de login **malsucedidas** (padrão: 20 a cada 15 minutos por IP, configurável em `LOGIN_RATE_LIMIT`) para mitigar força bruta, sem bloquear o uso legítimo. |
| **dotenv** | 18 | Carrega o `backend/.env` em desenvolvimento, sem sobrescrever variáveis já definidas pelo Docker/CI. |
| **tsx** | 4 | Executa TypeScript diretamente com *watch* no desenvolvimento (`npm run dev`), sem etapa de build. |

### 3.3 Frontend

| Tecnologia | Versão | Justificativa |
| --- | --- | --- |
| **React** | 18.3 | Biblioteca de UI baseada em componentes, com o maior ecossistema do mercado e farta mão de obra disponível. A versão 18 é estável e compatível com todo o ecossistema usado (Radix, Testing Library, React Router 6). |
| **Vite** | 6 | *Dev server* com HMR instantâneo e build otimizado com Rollup (divisão de *chunks* em `react`, `vendor` e app). Também fornece o proxy de `/api` em desenvolvimento, replicando a topologia de produção (mesma origem). |
| **Tailwind CSS** | 3.4 | CSS utilitário que acelera a construção de interfaces consistentes e **responsivas** (prefixos `sm:`, `md:`, `lg:`), com CSS final enxuto (só as classes usadas). A versão 3 foi escolhida pela compatibilidade consolidada com o shadcn/ui no estilo `new-york`. |
| **shadcn/ui** (Radix UI) | — | Coleção de componentes **copiados para o projeto** (`src/components/ui`) em vez de instalados como dependência fechada. O código fica sob controle do time e pode ser customizado livremente. Os componentes usam primitivas Radix, **acessíveis** (teclado, foco, ARIA) e testadas. Componentes usados: button, input, textarea, label, card, badge, table, select, dialog, alert-dialog, sheet, dropdown-menu, skeleton e sonner (toast). |
| **React Router** | 6.30 | Roteamento da SPA, rotas protegidas e filtros persistidos na URL (`useSearchParams`). As *future flags* da v7 já estão ativas, o que facilita a migração. |
| **TanStack Query** | 5 | Gerencia o estado do servidor: cache, *loading*/erro, invalidação após mutações (por exemplo, o dashboard se atualiza ao alterar um status) e manutenção dos dados anteriores durante a paginação. Elimina muito código manual com `useEffect`. |
| **React Hook Form** + **@hookform/resolvers** | 7 / 3 | Formulários performáticos (campos não controlados) integrados ao zod para validação declarativa com mensagens em português. |
| **axios** | 1.20 | Cliente HTTP com `withCredentials` (envio do cookie) e interceptors para tratar a sessão expirada (`401`) de forma centralizada. |
| **date-fns** | 4 | Formatação de datas em pt-BR e utilitários de data, modulares (*tree-shaking*). |
| **lucide-react** | — | Ícones SVG consistentes, padrão do shadcn/ui. |
| **sonner** | 2 | Notificações (toasts) de sucesso e erro. |
| **class-variance-authority**, **clsx**, **tailwind-merge**, **tailwindcss-animate** | — | Utilitários padrão do shadcn/ui: variantes de componentes, composição de classes sem conflito e animações. |

### 3.4 Testes

| Ferramenta | Uso | Justificativa |
| --- | --- | --- |
| **Jest** 29 + **ts-jest** | Backend e frontend | Executor de testes, maduro, com *mocks*, *snapshots* e cobertura nativos. O ts-jest compila TypeScript com checagem de tipos, de modo que os próprios testes também são verificados pelo compilador. |
| **Supertest** | Backend | Testes de integração HTTP sobre a aplicação Express real (middlewares, validação, autenticação, autorização e serialização), sem subir servidor. |
| **jest-mock-extended** | Backend | *Mock* profundo e tipado do `PrismaClient`. Os testes rodam em segundos, sem banco, e verificam exatamente as consultas enviadas ao ORM (filtros, escopo por usuário, histórico). |
| **Testing Library** (React, user-event, jest-dom) + **jsdom** | Frontend | Testes orientados ao comportamento do usuário (encontrar por rótulo/papel, digitar, clicar), resistentes a refatorações internas, que reforçam a acessibilidade da interface. |

Totais atuais: **44 testes no backend** (incluindo o gerador de dados fictícios do seed) e **29 no frontend**. Além deles, o fluxo completo foi verificado manualmente de ponta a ponta no ambiente Docker (login, CRUD, alteração de status, filtros, logout, desktop e mobile).

### 3.5 Infraestrutura e ferramentas

| Ferramenta | Justificativa |
| --- | --- |
| **Docker** (imagens multi-stage) | Ambiente reprodutível: quem avalia não precisa instalar Node ou PostgreSQL. As imagens finais contêm apenas o necessário. A API roda como usuário não-root e tem *healthcheck*. |
| **Docker Compose** | Orquestra `db`, `api` e `web` com *healthchecks* e ordem de inicialização (`depends_on: service_healthy`), volume persistente para o banco e variáveis com valores padrão. Assim, `docker compose up` funciona mesmo sem `.env`. |
| **Nginx** (alpine) | Serve os arquivos estáticos da SPA com *fallback* de rotas, compressão gzip e cache de *assets* com hash. Atua como **proxy reverso** de `/api`, colocando frontend e API na mesma origem. |
| **Entrypoint da API** | Aplica `prisma migrate deploy` e o **seed idempotente** a cada subida: o primeiro acesso já tem usuários e dados de exemplo, e reinícios não duplicam registros. |
| **Seed com dados fictícios** | `prisma/seed-data.ts` gera 12 usuários e 80 solicitações nos últimos 90 dias, com status proporcionais à idade e histórico coerente. A geração usa um PRNG com semente fixa (determinística) e fica separada do acesso ao banco, o que permite testá-la. Assim, filtros, paginação e dashboard podem ser avaliados com volume realista logo na primeira subida. |
| **Bruno** | Cliente de API *open source* cujas coleções são arquivos de texto (`.bru`) versionados junto com o código, sem conta nem nuvem. A coleção em `bruno/` documenta e testa os endpoints com asserções, nos ambientes Docker e Local, e roda no app ou pela CLI (`bru run`), podendo ser usada em CI. |
| **start.sh / start.ps1** | Um único comando (Linux/macOS e Windows) para subir a aplicação, aguardar a saúde da API e exibir URL e credenciais. |
| **Prettier** | Formatação consistente do código (`.prettierrc` na raiz). |
| **EditorConfig** / **.gitattributes** | Padronizam a indentação e as quebras de linha. O `.gitattributes` força LF nos scripts `.sh`, evitando que o entrypoint quebre ao clonar no Windows. |
| **Git** + **Conventional Commits** | Histórico organizado por marcos de implementação, seguindo o padrão de commits proposto (`feat`, `fix`, `test`, `build`, `docs`, `chore`, `style`). |

## 4. Decisões de projeto relevantes

1. **Sessão via JWT em cookie `httpOnly`, e não no `localStorage`.** O token fica inacessível a scripts, o que mitiga o roubo de sessão por XSS. `SameSite=Lax` e o uso de métodos não-GET para mutações reduzem o risco de CSRF. Como contrapartida, a revogação imediata de tokens não é possível (ver limitações).
2. **Mesma origem para SPA e API** (Nginx/Vite como proxy). Simplifica cookies e CORS e espelha uma topologia comum de produção.
3. **Autorização sempre no backend.** A interface esconde ações indisponíveis apenas por usabilidade; as regras de dono, status e perfil são impostas pela API e cobertas por testes.
4. **Histórico de status (`status_history`).** O requisito pede apenas o status atual, mas a trilha de quem alterou e quando agrega rastreabilidade e alimenta a timeline dos detalhes.
5. **Filtros na URL.** Recarregar a página, voltar no navegador ou compartilhar o link mantém a pesquisa. Os indicadores do dashboard levam à listagem já filtrada.
6. **Período no fuso do usuário.** O frontend converte as datas "de/até" para o início e o fim do dia **no fuso do navegador** antes de enviar à API, evitando que solicitações do fim do dia "sumam" por causa da diferença para UTC.
7. **Responsividade real.** Em telas pequenas, a tabela vira lista de cartões, os filtros ficam recolhíveis e a navegação passa a um menu lateral (*sheet*).
8. **Componentes shadcn escritos no repositório.** O registro online do shadcn não estava acessível no ambiente de desenvolvimento, então os componentes foram incluídos manualmente, seguindo o estilo `new-york`. O `components.json` está presente, e a CLI (`npx shadcn add ...`) pode ser usada normalmente para adicionar novos componentes.

## 5. Análise crítica

### 5.1 Limitações da solução implementada

- **Revogação de sessão:** o JWT é *stateless*. Um logout remove o cookie do navegador, mas um token copiado continua válido até expirar (8h por padrão). Não há *refresh token*, lista de revogação nem encerramento de sessões ativas.
- **Gestão de usuários inexistente:** os usuários são criados pelo seed. Não há cadastro, recuperação ou troca de senha, bloqueio por tentativas, nem administração de perfis.
- **Transições de status livres:** o atendente pode mover entre quaisquer status (inclusive reabrir uma solicitação concluída). Não há máquina de estados com transições permitidas nem justificativa obrigatória.
- **Exclusão física:** solicitações excluídas são removidas do banco (com seu histórico). Não há *soft delete* nem lixeira.
- **Busca textual simples:** usa `ILIKE` no título, sem *full-text search*, sem busca na descrição e sem índice trigram. Com volumes grandes, a consulta tende a degradar.
- **Atribuição e comunicação:** não há responsável pelo atendimento, comentários, anexos, notificações (e-mail/Teams/Slack) nem SLA.
- **Rate limit em memória:** o contador de tentativas de login fica na memória de cada instância. Com várias réplicas, o limite deixa de ser global.
- **Concorrência:** duas alterações simultâneas na mesma solicitação seguem a regra "a última escrita vence". Não há controle otimista de versão.
- **Observabilidade mínima:** apenas logs no console e *health check*. Não há logs estruturados, métricas, *tracing* nem alertas.
- **Testes:** os testes do backend usam o Prisma *mockado*. As consultas SQL reais (por exemplo, o `ILIKE` e os índices) não são exercitadas por testes de integração com banco, e não há testes E2E automatizados no pipeline.
- **Internacionalização:** textos fixos em português e datas no fuso do navegador, sem fuso configurável por usuário ou organização.

### 5.2 Melhorias futuras

1. *Refresh token* com rotação e armazenamento de sessões (Redis) para permitir revogação e "sair de todos os dispositivos".
2. Máquina de estados de status, com transições permitidas, comentário obrigatório ao concluir e reabertura controlada.
3. Atribuição de responsável, filas por área (TI, RH...), comentários e anexos (armazenados em S3/Blob).
4. Notificações por e-mail e por ferramentas de mensageria quando o status mudar.
5. SLA por categoria e prioridade, com indicadores de tempo médio de atendimento e solicitações atrasadas no dashboard.
6. *Soft delete* e auditoria completa (quem criou, editou e excluiu, com valores anteriores).
7. Busca *full-text* (`tsvector` do PostgreSQL ou um motor de busca dedicado) no título e na descrição.
8. Exportação da listagem filtrada (CSV/Excel) e gráficos temporais no dashboard.
9. Testes de integração com PostgreSQL real (Testcontainers) e testes E2E (Playwright) no pipeline de CI.
10. Documentação OpenAPI/Swagger gerada a partir dos schemas zod.
11. Atualizações em tempo real (WebSocket/SSE) da listagem e do dashboard.

### 5.3 Requisitos que poderiam ser aperfeiçoados

- **Autenticação:** o requisito pede apenas "usuário e senha". Em uma empresa, o natural seria **SSO** com o provedor de identidade corporativo, o que eliminaria senhas locais e o cadastro manual de usuários.
- **Perfis e permissões:** o enunciado não define quem altera o status. Adotamos dois perfis (Colaborador e Atendente). O requisito poderia especificar perfis por área (um atendente de RH só vê RH, por exemplo) e um perfil administrador.
- **Status:** três status podem ser pouco para operações reais. Valeria incluir **Cancelado**, **Aguardando solicitante** e **Rejeitado**, com regras de transição explícitas.
- **Edição/exclusão:** o requisito permite excluir solicitações abertas. Para rastreabilidade, seria preferível **cancelar** (manter o registro) em vez de excluir.
- **Categorias:** fixas em enum. Poderiam ser cadastráveis (tabela própria), com responsáveis e SLA por categoria.
- **Filtro por texto livre:** restrito ao título pelo enunciado. Incluir a descrição e o código tornaria a busca mais útil.
- **Dashboard:** "indicadores simples" poderiam incluir tempo médio de atendimento, volume por período e ranking por categoria ou área.
- **Requisitos não funcionais** (volume esperado, tempo de resposta, retenção de dados, LGPD, disponibilidade) não foram especificados e orientariam decisões de arquitetura.

### 5.4 O que seria diferente em um ambiente corporativo de produção

| Tema | Nesta entrega | Em produção corporativa |
| --- | --- | --- |
| Identidade | Usuários locais com senha (bcrypt) | SSO via **OIDC/SAML** (Entra ID, Okta, Keycloak), MFA e perfis vindos de grupos do diretório |
| Sessão | JWT HS256 em cookie, sem revogação | Tokens curtos + *refresh token* rotativo, sessões revogáveis, chaves assimétricas (RS256) com rotação |
| Segredos | `.env` e valores padrão no Compose | Cofre de segredos (Vault, AWS Secrets Manager, Azure Key Vault), sem valores padrão inseguros |
| Transporte | HTTP local | **HTTPS/TLS** obrigatório, `COOKIE_SECURE=true`, HSTS, WAF e CDN |
| Banco | Um container PostgreSQL com volume local | PostgreSQL gerenciado (RDS, Cloud SQL, Azure DB) com alta disponibilidade, backups automáticos, *point-in-time recovery*, réplicas de leitura e *pool* de conexões (PgBouncer) |
| Migrations e seed | Executados no *start* do container | Etapa dedicada do pipeline de deploy, com revisão e *rollback* planejado. Seed de demonstração nunca em produção |
| Implantação | Docker Compose em uma máquina | Kubernetes/ECS/App Service com réplicas, *autoscaling*, *rolling/blue-green deploy* e *readiness/liveness probes* |
| CI/CD | Execução manual dos testes | Pipeline (GitHub Actions, GitLab CI ou Azure DevOps) com lint, *typecheck*, testes, cobertura mínima, SAST, varredura de dependências e imagens (Dependabot, Trivy) e deploy automatizado por ambiente |
| Observabilidade | Logs no console e *health check* | Logs estruturados (pino) com *correlation id*, métricas e *tracing* (OpenTelemetry), dashboards e alertas (Grafana, Datadog), monitoramento de erros no front e no back (Sentry) |
| Rate limiting | Em memória, por instância | Distribuído (Redis) ou no API Gateway/WAF |
| Auditoria e conformidade | Histórico de status | Trilha de auditoria completa e imutável, política de retenção e tratamento de dados pessoais conforme a **LGPD** |
| Qualidade | Jest (unitário/integração) | Acrescentar testes com banco real, E2E, contrato da API e testes de carga e acessibilidade (axe) |
| Arquitetura do front | SPA servida por Nginx | Mesma abordagem, publicada em CDN, com *code splitting* por rota e monitoramento de Web Vitals |
| Versionamento da API | Sem versão | Prefixo `/api/v1`, contrato OpenAPI publicado e política de depreciação |

## 6. Conclusão

A solução atende aos cinco grupos de requisitos funcionais com uma stack tipada de ponta a ponta (TypeScript, Prisma e zod), autorização imposta no servidor, interface responsiva e acessível (shadcn/ui sobre Radix) e testes automatizados nas duas camadas. A execução por um único comando via Docker Compose dispensa adaptações no ambiente de quem avalia. As limitações listadas acima são escolhas conscientes de escopo para um desafio técnico, e a seção 5.4 descreve o caminho para levar a aplicação a um ambiente corporativo de produção.
