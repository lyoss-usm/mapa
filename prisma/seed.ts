import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const categories = [
  { name: 'Baños', color: '#0462fa' },
  { name: 'Agua', color: '#21f0f7' },
  { name: 'Comida', color: '#a0ff2c' },
  { name: 'Deportes', color: '#02a802' },
  { name: 'Salas de Estudio', color: '#c81dfc' },
  { name: 'Impresoras', color: '#ff008887' },
  { name: 'Bancos/Cajeros', color: '#ff0303' },
  { name: 'Tiendas', color: '#EC4899' },
  { name: 'Cultura', color: '#e37f0d' },
  { name: 'Auditorios', color: '#e4f409' },
  { name: 'Bibliotecas', color: '#8800ff' },
]

async function main() {
  console.log(`Sembrando ${categories.length} categorías...`)

  for (const category of categories) {
    const result = await prisma.category.upsert({
      where: { name: category.name },
      update: { color: category.color },
      create: category,
    })
    console.log(`  ✓ ${result.name}`)
  }

  console.log('Seed completado.')
}

main()
  .catch((error) => {
    console.error('Error ejecutando el seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
