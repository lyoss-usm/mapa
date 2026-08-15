# Mapa interactivo USM ![](https://img.shields.io/badge/estado-activo-green) ![](https://img.shields.io/github/license/lyoss-usm/mapa)

El Mapa Interactivo USM es una iniciativa desarrollada por la comunidad con el objetivo de centralizar y facilitar la orientación espacial dentro de la universidad. Construido con tecnologías web modernas y cartografía colaborativa, este mapa permite a estudiantes, docentes y visitantes ubicar rápidamente edificios, departamentos y puntos de interés clave (como baños, dispensadores de agua y laboratorios) a través de una experiencia rápida, filtrable y optimizada para dispositivos móviles.

## Seguimiento

- Puedes seguir el progreso del proyecto en [GitHub Projects](https://github.com/orgs/lyoss-usm/projects/19).
- Para reportar problemas o sugerencias, visita [GitHub Issues](https://github.com/lyoss-usm/mapa/issues).

## Requisitos

- [Node.js](https://nodejs.org/) (>= 18.0.0)
- [npm](https://www.npmjs.com/) (>= 9.0.0)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — para levantar la base de datos (PostgreSQL + PostGIS) sin instalación nativa. En Windows requiere WSL2 y virtualización habilitada en el BIOS.

## Quick Start

1. Clona el repositorio:
   ```bash
   git clone https://github.com/lyoss-usm/mapa.git
   cd mapa
   ```

2. Copia las variables de entorno y completa `DATABASE_URL`:
   ```bash
   cp .env.example .env
   ```

3. Levanta la base de datos y aplica migraciones + seed (el script hace: `docker compose up -d` → `prisma migrate deploy` → `prisma db seed` → `db:verify`):
   ```powershell
   # Windows (PowerShell)
   .\scripts\init-db.ps1
   ```
   ```bash
   # macOS/Linux
   chmod +x scripts/init-db.sh
   ./scripts/init-db.sh
   ```

   > En Windows también puedes usar `scripts/init-db.sh` en vez del `.ps1`, corriéndolo desde WSL (`wsl`, luego `cd /mnt/c/ruta/al/proyecto`) o desde Git Bash. Ambos scripts hacen exactamente lo mismo.

4. Instala las dependencias y ejecuta el proyecto:
   ```bash
   npm install
   npm run dev
   ```

## Base de datos

La capa de datos almacena la información geoespacial del campus (edificios, departamentos, puntos de interés) usando PostgreSQL + PostGIS, gestionada con Prisma 7 (driver adapter `@prisma/adapter-pg`) y containerizada con Docker para que todo el equipo tenga el mismo ambiente sin instalación nativa.

### Modelo de datos

- **Building**: edificio del campus. Geometría `MultiPolygon`. Tiene muchos Department y muchos POI.
- **Department**: unidad dentro de un edificio. Geometría `MultiPolygon`. FK obligatoria a Building.
- **Category**: catálogo dinámico de tipos de POI (tabla, no enum). 12 categorías base sembradas: Baños, Agua, Comida, Deportes, Salas de Estudio, Impresoras, Bancos/Cajeros, Tiendas, Cultura, Auditorios, Bibliotecas, Puntos de Interés.
- **POI**: punto de interés. Geometría `Point`. FK a Category obligatoria; FK a Building y Department nullable (un POI puede estar suelto en el campus).

Nota: "Departamentos" y "Edificios" **NO** son categorías de POI — son tablas separadas.

### Particularidades de Prisma 7

- La URL de conexión vive en `prisma.config.ts`, no en `schema.prisma`.
- Requiere un driver adapter explícito (`@prisma/adapter-pg` + `pg`) para hacer una instancia `PrismaClient`.
- El generator usa `prisma-client-js` sin campo `output`.
- El seed **no** corre automáticamente con `migrate dev`/`migrate reset` — siempre a mano con `npx prisma db seed`.
- Las columnas de geometría son `Unsupported("geometry(...)")`: Prisma Client no las lee/escribe directamente, hay que usar `$executeRaw`/`$queryRaw` con funciones de PostGIS (`ST_GeomFromText`, etc.).
- Los índices espaciales GiST se declaran en el schema con `@@index([geometry], type: Gist)` — si se crean a mano fuera del schema, Prisma los interpreta como drift y los elimina en la siguiente migración.

### Comandos útiles

|           Comando           |                         Qué hace                             |
|-----------------------------|--------------------------------------------------------------|
| `docker compose up -d`      | Levanta PostgreSQL + PostGIS en un contenedor                |
| `npx prisma migrate deploy` | Aplica el historial de migraciones                           |
| `npx prisma db seed`        | Siembra las 12 categorías base                               |
| `npm run db:verify`         | Verifica conexión, PostGIS, tablas, índices, trigger y seed  |
| `npx prisma studio`         | Explorador visual de la base de datos                        |

### Migraciones

1. `init` — las 4 tablas y sus FKs
2. `add_gist_indexes` — índices espaciales GiST
3. `add_poi_building_inheritance_trigger` — el trigger de herencia
4. `recreate_gist_indexes` — corrección tras declarar los índices en el schema

### Notas adicionales

- Si el proyecto vive dentro de una carpeta sincronizada (OneDrive, Dropbox, Google Drive), la sincronización en tiempo real puede causar conflictos con Prisma/git (migraciones duplicadas). Se recomienda una carpeta local no sincronizada.
- `docker-compose.yml` debe usar exactamente el mismo usuario/contraseña/base que `DATABASE_URL` en `.env` — un desajuste es la causa más común de errores de autenticación al migrar.
