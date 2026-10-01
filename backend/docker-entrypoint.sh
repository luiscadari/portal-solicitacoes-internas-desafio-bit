#!/bin/sh
set -e

echo "⏳ Aplicando migrations do banco de dados..."
./node_modules/.bin/prisma migrate deploy

echo "🌱 Executando seed (idempotente)..."
node dist/prisma/seed.js

echo "🚀 Iniciando a API..."
exec node dist/src/server.js
