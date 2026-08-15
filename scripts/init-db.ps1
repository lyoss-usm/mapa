$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "    OK: $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    AVISO: $msg" -ForegroundColor Yellow }

$RootDir = Split-Path -Parent $PSScriptRoot
Set-Location $RootDir

if ($RootDir -match "OneDrive|Dropbox|Google Drive") {
    Write-Warn "El proyecto vive dentro de una carpeta sincronizada ($RootDir)."
    Write-Warn "Esto puede causar conflictos con Prisma/git durante el desarrollo."
}

# Verificar herramientas necesarias

Write-Step "Verificando herramientas instaladas..."

foreach ($tool in @("node", "npm", "docker")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: '$tool' no está disponible en el PATH. Instálalo antes de continuar." -ForegroundColor Red
        Write-Host "Ver docs/setup-database.md para instrucciones de instalación." -ForegroundColor Red
        exit 1
    }
}
Write-Ok "node, npm y docker disponibles"

try {
    docker info | Out-Null
} catch {
    Write-Host "ERROR: Docker está instalado pero el motor no está corriendo." -ForegroundColor Red
    Write-Host "Abre Docker Desktop y espera a que el ícono de la ballena quede estable." -ForegroundColor Red
    exit 1
}
Write-Ok "Docker Desktop está corriendo"

# Detectar conflicto con un PostgreSQL nativo en el puerto 5432

Write-Step "Verificando que el puerto 5432 esté libre para Docker..."
$nativeService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($nativeService -and $nativeService.Status -eq "Running") {
    Write-Warn "Detecté un servicio de PostgreSQL nativo corriendo ($($nativeService.Name))."
    Write-Warn "Compite con Docker por el puerto 5432. Deténlo con:"
    Write-Warn "  Stop-Service -Name $($nativeService.Name)"
    Write-Warn "Y opcionalmente evita que vuelva a arrancar solo con:"
    Write-Warn "  Set-Service -Name $($nativeService.Name) -StartupType Manual"
    exit 1
}
Write-Ok "Puerto 5432 libre para Docker"

# Verificar .env

Write-Step "Verificando archivo .env..."
if (-not (Test-Path "$RootDir\.env")) {
    Write-Host "ERROR: No existe .env. Copia .env.example a .env y completa DATABASE_URL." -ForegroundColor Red
    exit 1
}
Write-Ok ".env encontrado"

# Levantar el contenedor de PostgreSQL + PostGIS

Write-Step "Levantando contenedor Docker (PostgreSQL + PostGIS)..."
docker compose up -d

Write-Step "Esperando a que el contenedor esté en buen estado..."
$maxRetries = 20
$retries = 0
do {
    Start-Sleep -Seconds 2
    $health = docker inspect --format="{{.State.Health.Status}}" mapa_usm_db 2>$null
    $retries++
} while ($health -ne "healthy" -and $retries -lt $maxRetries)

if ($health -ne "healthy") {
    Write-Host "ERROR: El contenedor no llegó a estado 'healthy' a tiempo. Revisa 'docker compose logs'." -ForegroundColor Red
    exit 1
}
Write-Ok "Contenedor 'mapa_usm_db' está en buen estado"


# Instalar dependencias

Write-Step "Instalando dependencias npm..."
npm install
Write-Warn "Si npm advierte sobre 'allow-scripts' pendientes, corre:"
Write-Warn "  npm approve-scripts <paquete>   y luego   npm install"


# Generar cliente y aplicar migraciones

Write-Step "Generando Prisma Client..."
npx prisma generate

Write-Step "Aplicando migraciones..."
npx prisma migrate deploy

# Seed (Prisma 7 no siembra automáticamente)

Write-Step "Sembrando categorías base..."
npx prisma db seed

# Verificación final

Write-Step "Verificando el ambiente completo..."
npm run db:verify

Write-Host ""
Write-Host "Setup completo." -ForegroundColor Green