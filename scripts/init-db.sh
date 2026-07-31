set -euo pipefail
 
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
step() { echo -e "${CYAN}==>${NC} $1"; }
ok()   { echo -e "    ${GREEN}OK:${NC} $1"; }
warn() { echo -e "    ${YELLOW}AVISO:${NC} $1"; }
err()  { echo -e "    ${RED}ERROR:${NC} $1"; }
 
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
 

if [[ "$ROOT_DIR" == *"Dropbox"* || "$ROOT_DIR" == *"OneDrive"* || "$ROOT_DIR" == *"Google Drive"* ]]; then
  warn "El proyecto vive dentro de una carpeta sincronizada ($ROOT_DIR)."
  warn "Esto puede causar conflictos con Prisma/git durante el desarrollo."
fi
 
# Verificar herramientas necesarias

step "Verificando herramientas instaladas..."
for tool in node npm docker; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    err "'$tool' no está disponible en el PATH. Instálalo antes de continuar."
    exit 1
  fi
done
ok "node, npm y docker disponibles"
 
if ! docker info >/dev/null 2>&1; then
  err "Docker está instalado pero el motor no está corriendo."
  err "Abre Docker Desktop (macOS) o inicia el servicio docker (Linux: sudo systemctl start docker)."
  exit 1
fi
ok "Docker está corriendo"
 
# Detectar conflicto con un PostgreSQL nativo en el puerto 5432

step "Verificando que el puerto 5432 esté libre para Docker..."
if command -v lsof >/dev/null 2>&1 && lsof -i :5432 -sTCP:LISTEN >/dev/null 2>&1; then
  warn "El puerto 5432 ya está en uso por otro proceso (probablemente un PostgreSQL nativo)."
  warn "Detén ese servicio antes de continuar, por ejemplo:"
  warn "  macOS (Homebrew): brew services stop postgresql"
  warn "  Linux (systemd):  sudo systemctl stop postgresql"
  exit 1
fi
ok "Puerto 5432 libre para Docker"
 

# Verificar .env

step "Verificando archivo .env..."
if [ ! -f "$ROOT_DIR/.env" ]; then
  err "No existe .env. Copia .env.example a .env y completa DATABASE_URL."
  exit 1
fi
ok ".env encontrado"
 

# Levantar el contenedor de PostgreSQL + PostGIS

step "Levantando contenedor Docker (PostgreSQL + PostGIS)..."
docker compose up -d
 
step "Esperando a que el contenedor esté saludable..."
max_retries=20
retries=0
health=""
until [ "$health" == "healthy" ] || [ "$retries" -ge "$max_retries" ]; do
  sleep 2
  health=$(docker inspect --format='{{.State.Health.Status}}' mapa_usm_db 2>/dev/null || echo "")
  retries=$((retries + 1))
done
 
if [ "$health" != "healthy" ]; then
  err "El contenedor no llegó a estado 'healthy' a tiempo. Revisa 'docker compose logs'."
  exit 1
fi
ok "Contenedor 'mapa_usm_db' saludable"
 

# Instalar dependencias

step "Instalando dependencias npm..."
npm install
warn "Si npm advierte sobre 'allow-scripts' pendientes, corre:"
warn "  npm approve-scripts <paquete>   y luego   npm install"
 

# Generar cliente y aplicar migraciones

step "Generando Prisma Client..."
npx prisma generate
 
step "Aplicando migraciones..."
npx prisma migrate deploy

# Seed (Prisma 7 no siembra automáticamente)
step "Sembrando categorías base..."
npx prisma db seed
 
# Verificación final
step "Verificando el ambiente completo..."
npm run db:verify
 
echo ""
echo -e "${GREEN}Setup completo.${NC}"