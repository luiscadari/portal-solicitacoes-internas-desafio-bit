#!/usr/bin/env bash
# Sobe toda a aplicação (PostgreSQL + API + Frontend) com Docker Compose.
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker não encontrado. Instale o Docker Desktop/Engine: https://docs.docker.com/get-docker/"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "❌ Docker Compose v2 não encontrado (comando 'docker compose')."
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "📄 Arquivo .env criado a partir de .env.example"
fi

set -a
# shellcheck disable=SC1091
. ./.env
set +a

echo "🐳 Construindo e iniciando os containers..."
docker compose up --build -d

echo "⏳ Aguardando a API ficar saudável..."
status="starting"
for _ in $(seq 1 60); do
  status=$(docker inspect -f '{{.State.Health.Status}}' portal-api 2>/dev/null || echo "starting")
  [ "$status" = "healthy" ] && break
  sleep 2
done

if [ "$status" != "healthy" ]; then
  echo "⚠️  A API não ficou saudável a tempo. Verifique os logs: docker compose logs api"
  exit 1
fi

cat <<MSG

✅ Portal de Solicitações Internas no ar!

   Frontend:  http://localhost:${WEB_PORT:-8080}
   API:       http://localhost:${API_PORT:-3333}/api/health

   Usuários de demonstração:
     colaborador / colaborador123  (Colaborador)
     maria       / maria123        (Colaborador)
     atendente   / atendente123    (Atendente)

   Para parar:            docker compose down
   Para resetar o banco:  docker compose down -v
MSG
