// Esto lo que hace es verificar que el ambiente de base de datos quedó correctamente configurado
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

let hasErrors = false

function ok(msg: string) {
  console.log(` ✓ ${msg}`)
}

function fail(msg: string) {
  console.log(` ✗ ${msg}`)
  hasErrors = true
}

async function main() {
  // Verificar la conexión a la base de datos
  console.log('Verificando la conexión a la base de datos...\n')
  try {
    await prisma.$queryRaw`SELECT 1`
    ok('Conexión a PostgreSQL exitosa')
  } catch {
    fail('No se pudo conectar a la base de datos')
    await prisma.$disconnect()
    process.exit(1)
  }

  // Verificar que PostGIS esté habilitado
  try {
    const result = await prisma.$queryRaw<
      { postgis_full_version: string }[]
    >`SELECT postgis_full_version()`
    ok(`PostGIS habilitado (${result[0].postgis_full_version.split(' ')[0]})`)
  } catch {
    fail('PostGIS no está habilitado en esta base de datos')
  }

  // Verificar que existan las tablas esperadas
  const expectedTables = ['buildings', 'departments', 'categories', 'pois']
  const tables = await prisma.$queryRaw<
    { tablename: string }[]
  >`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
  const tableNames = tables.map((t) => t.tablename)
  for (const table of expectedTables) {
    if (tableNames.includes(table)) {
      ok(`Tabla "${table}" existe`)
    } else {
      fail(`Tabla "${table}" NO existe`)
    }
  }

  // Verificar que existan los índices GiST
  const gistIndexes = await prisma.$queryRaw<
    { indexname: string }[]
  >`SELECT indexname FROM pg_indexes WHERE indexdef ILIKE '%USING gist%'`
  const expectedIndexes = [
    'buildings_geometry_idx',
    'departments_geometry_idx',
    'pois_geometry_idx',
  ]
  for (const idx of expectedIndexes) {
    if (gistIndexes.some((i) => i.indexname === idx)) {
      ok(`Índice GiST "${idx}" existe`)
    } else {
      fail(`Índice GiST "${idx}" NO existe`)
    }
  }

  // Trigger para heredar Buildings al crear un POI
  const triggers = await prisma.$queryRaw<
    { tgname: string }[]
  >`SELECT tgname FROM pg_trigger WHERE tgname = 'trg_poi_inherit_building'`
  if (triggers.length > 0) {
    ok('Trigger "trg_poi_inherit_building" existe')
  } else {
    fail('Trigger "trg_poi_inherit_building" NO existe')
  }

  // Verificar que existan las 11 categorías sembradas
  const categoryCount = await prisma.category.count()
  if (categoryCount === 11) {
    ok(`11 categorías sembradas correctamente`)
  } else {
    fail(`Se esperaban 11 categorías, se encontraron ${categoryCount}`)
  }

  console.log('')
  if (hasErrors) {
    console.log(
      'La verificación encontró problemas. Revisa los puntos marcados con ✗ arriba.'
    )
    process.exitCode = 1
  } else {
    console.log(
      'Todo el ambiente de base de datos está correctamente configurado.'
    )
  }
}
// Ejecutar la función principal y manejar errores
main()
  .catch((error) => {
    console.error('Error inesperado durante la verificación:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
