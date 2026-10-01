# Sobe toda a aplicação (PostgreSQL + API + Frontend) com Docker Compose no Windows (PowerShell).
$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host 'Docker nao encontrado. Instale o Docker Desktop: https://docs.docker.com/get-docker/' -ForegroundColor Red
  exit 1
}

if (-not (Test-Path '.env')) {
  Copy-Item '.env.example' '.env'
  Write-Host 'Arquivo .env criado a partir de .env.example'
}

Write-Host 'Construindo e iniciando os containers...'
docker compose up --build -d
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'Aguardando a API ficar saudavel...'
$status = ''
for ($i = 0; $i -lt 60; $i++) {
  $status = (docker inspect -f '{{.State.Health.Status}}' portal-api 2>$null)
  if ($status -eq 'healthy') { break }
  Start-Sleep -Seconds 2
}

if ($status -ne 'healthy') {
  Write-Host 'A API nao ficou saudavel a tempo. Verifique: docker compose logs api' -ForegroundColor Yellow
  exit 1
}

$webPort = '8080'
$match = Select-String -Path '.env' -Pattern '^WEB_PORT=(.+)$'
if ($match) { $webPort = $match.Matches[0].Groups[1].Value.Trim() }

Write-Host ''
Write-Host 'Portal de Solicitacoes Internas no ar!' -ForegroundColor Green
Write-Host "   Frontend:  http://localhost:$webPort"
Write-Host ''
Write-Host '   Usuarios de demonstracao:'
Write-Host '     colaborador / colaborador123  (Colaborador)'
Write-Host '     maria       / maria123        (Colaborador)'
Write-Host '     atendente   / atendente123    (Atendente)'
Write-Host ''
Write-Host '   Para parar:  docker compose down'
