import { prisma } from '../src/db/db'

async function main() {
  console.log('⏳ Iniciando el sembrado de datos (Seed) en Neon...')

  // 1. Limpieza previa (Opcional, evita errores de duplicados si volvés a correr el seed)
  console.log('🗑️ Limpiando datos viejos de Compradores y Pedidos...')
  await prisma.pedido.deleteMany()
  await prisma.comprador.deleteMany()

  // 2. CREACIÓN DE COMPRADORES
  console.log('👤 Insertando compradores...')
  
  const comprador1 = await prisma.comprador.create({
    data: {
      dni: '12345678',
      cuilCuit: '20-12345678-9',
      apellido: 'García',
      nombre: 'Lucas',
      sexo: 'M',
      direccion: 'Av. Corrientes 1234, CABA',
      mail: 'lucas.garcia@email.com',
      celular: '1145678901',
      fechaNacimiento: new Date('1990-05-15'),
      nacionalidad: 'Argentina',
      condicionIva: 'Consumidor Final',
      clerkUserId: 'user_3DslH4IXlUb92',
      isDeleted: false
    }
  })

  const comprador2 = await prisma.comprador.create({
    data: {
      dni: '23456789',
      cuilCuit: '27-23456789-4',
      apellido: 'Martínez',
      nombre: 'Ana',
      sexo: 'F',
      direccion: 'Calle Falsa 456, Rosario',
      mail: 'ana.martinez@email.com',
      celular: '3414567890',
      fechaNacimiento: new Date('1995-08-22'),
      nacionalidad: 'Argentina',
      condicionIva: 'Consumidor Final',
      clerkUserId: 'user_3DsllhTwrG6tPrfIkVxm0ccenrQ',
      isDeleted: false
    }
  })

  const comprador3 = await prisma.comprador.create({
    data: {
      dni: '34567890',
      cuilCuit: '20-34567890-1',
      apellido: 'López',
      nombre: 'Martín',
      sexo: 'M',
      direccion: 'San Martín 789, Córdoba',
      mail: 'martin.lopez@email.com',
      celular: '3514567890',
      fechaNacimiento: new Date('1988-12-01'),
      nacionalidad: 'Argentina',
      condicionIva: 'Responsable Inscripto',
      clerkUserId: 'user_3DslpwkE6FXlO1VdY8HL1aI6Nd4',
      isDeleted: false
    }
  })

  // 3. CREACIÓN DE PEDIDOS (Usando los IDs reales autogenerados por Neon)
  console.log('📦 Insertando historial de pedidos...')
  
  await prisma.pedido.createMany({
    data: [
      {
        fecha: new Date('2026-04-01'),
        compradorId: comprador1.id,
        vendedorId: 1,
        productosId: [1, 3],
        monto: 3070000,
        estado: 'entregado',
        envioId: 1
      },
      {
        fecha: new Date('2026-04-15'),
        compradorId: comprador1.id,
        vendedorId: 2,
        productosId: [5],
        monto: 310000,
        estado: 'en_camino',
        envioId: 2
      },
      {
        fecha: new Date('2026-05-01'),
        compradorId: comprador2.id,
        vendedorId: 1,
        productosId: [2],
        monto: 950000,
        estado: 'pendiente',
        envioId: null
      },
      {
        fecha: new Date('2026-05-10'),
        compradorId: comprador2.id,
        vendedorId: 3,
        productosId: [3, 11],
        monto: 318000,
        estado: 'cancelado',
        envioId: null
      },
      {
        fecha: new Date('2026-05-15'),
        compradorId: comprador3.id,
        vendedorId: 2,
        productosId: [15],
        monto: 780000,
        estado: 'entregado',
        envioId: 3
      },
      {
        fecha: new Date('2026-05-16'),
        compradorId: comprador3.id,
        vendedorId: 1,
        productosId: [8],
        monto: 620000,
        estado: 'en_camino',
        envioId: 4
      }
    ]
  })

  console.log('✅ ¡Seed completado con éxito! Los datos quedaron persistidos en Neon.')
}

main()
  .catch((e) => {
    console.error('❌ Error en el proceso de seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })