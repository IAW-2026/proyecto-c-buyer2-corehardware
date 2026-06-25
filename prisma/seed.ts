import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { prisma } from '../src/lib/prisma'
import { createClerkClient } from '@clerk/backend'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

async function setRole(clerkUserId: string, role: 'buyer' | 'admin') {
  try {
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { role },
    })
    console.log(`✅ Rol '${role}' asignado a ${clerkUserId}`)
  } catch (e) {
    console.warn(`⚠️  Error al asignar rol:`, e)
  }
}

// IDs reales de la Seller API (Vercel)
const SELLERS = {
  compuMundo: 'cmqsqife700003gwvusoch7hn',
  techHub:    'cmqsqifro00013gwv1be68fk2',
  juanPerez:  'cmqsqig0o00023gwvaaq128mq',
}

const PRODUCTS = {
  // CompuMundo
  p1:  'cmqsqige700033gwvgrck0hve',
  p3:  'cmqsqihki00053gwvva3dkwj3',
  p9:  'cmqsqilkh000b3gwv5n997e4f',
  p10: 'cmqsqim5k000c3gwvsxq3m8cn',
  // TechHub
  p2:  'cmqsqigzf00043gwvqiuls5ud',
  p4:  'cmqsqii5m00063gwvy2veckqs',
  p8:  'cmqsqikz8000a3gwvbw7d9zjh',
  // Juan Perez
  p5:  'cmqsqiiqo00073gwvguro81as',
  p6:  'cmqsqijbt00083gwv9thkmebw',
}

async function main() {
  console.log('⏳ Iniciando seed...')

  console.log('🗑️  Limpiando datos viejos...')
  await prisma.carritoItem.deleteMany()
  await prisma.carrito.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.comprador.deleteMany()

  console.log('👤 Insertando comprador...')
  const comprador1 = await prisma.comprador.create({
    data: {
      dni:             '12345678',
      cuilCuit:        '20-12345678-9',
      apellido:        'García',
      nombre:          'Lucas',
      sexo:            'M',
      direccion:       'Av. Corrientes 1234, CABA',
      mail:            'buyer_1+clerk_test@iaw.com',
      celular:         '1145678901',
      fechaNacimiento: new Date('1990-05-15'),
      nacionalidad:    'Argentina',
      condicionIva:    'Consumidor Final',
      clerkUserId:     'user_3FKfOSysGCxZhOAaOY4FhmKeTE4',
      isDeleted:       false,
      perfilCompleto:  true,
    },
  })

  console.log('📦 Insertando pedidos...')
  await prisma.pedido.createMany({
    data: [
      // 1. PENDIENTE_PAGO — TechHub
      {
        fecha:       new Date('2026-05-22'),
        compradorId: comprador1.id,
        vendedorId:  SELLERS.techHub,
        productosId: [PRODUCTS.p2, PRODUCTS.p4],
        monto:       79.98,
        estado:      'PENDIENTE_PAGO',
        envioId:     null,
      },
      // 2. PAGO_APROBADO — CompuMundo
      {
        fecha:       new Date('2026-05-20'),
        compradorId: comprador1.id,
        vendedorId:  SELLERS.compuMundo,
        productosId: [PRODUCTS.p1],
        monto:       19.99,
        estado:      'PAGO_APROBADO',
        envioId:     null,
      },
      // 3. PAGO_RECHAZADO — Juan Perez
      {
        fecha:       new Date('2026-05-18'),
        compradorId: comprador1.id,
        vendedorId:  SELLERS.juanPerez,
        productosId: [PRODUCTS.p5],
        monto:       59.99,
        estado:      'PAGO_RECHAZADO',
        envioId:     null,
      },
      // 4. EN_PREPARACION — TechHub
      {
        fecha:       new Date('2026-05-15'),
        compradorId: comprador1.id,
        vendedorId:  SELLERS.techHub,
        productosId: [PRODUCTS.p8],
        monto:       89.99,
        estado:      'EN_PREPARACION',
        envioId:     null,
      },
      // 5. EN_CAMINO — CompuMundo
      {
        fecha:       new Date('2026-05-01'),
        compradorId: comprador1.id,
        vendedorId:  SELLERS.compuMundo,
        productosId: [PRODUCTS.p9, PRODUCTS.p10],
        monto:       209.98,
        estado:      'EN_CAMINO',
        envioId:     'envio_demo_001',
      },
      // 6. ENTREGADO — CompuMundo
      {
        fecha:       new Date('2026-04-05'),
        compradorId: comprador1.id,
        vendedorId:  SELLERS.compuMundo,
        productosId: [PRODUCTS.p1, PRODUCTS.p3],
        monto:       59.98,
        estado:      'ENTREGADO',
        envioId:     'envio_demo_002',
      },
      // 7. CANCELADO — Juan Perez
      {
        fecha:       new Date('2026-04-18'),
        compradorId: comprador1.id,
        vendedorId:  SELLERS.juanPerez,
        productosId: [PRODUCTS.p5, PRODUCTS.p6],
        monto:       129.98,
        estado:      'CANCELADO',
        envioId:     null,
      },
    ],
  })

  console.log('🔑 Asignando rol en Clerk...')
  await setRole(comprador1.clerkUserId, 'buyer')

  console.log(`
✅ Seed completado:
   👤 1 comprador (Lucas García — buyer, perfilCompleto: true)
   📦 7 pedidos — un estado por cada variante:
      PENDIENTE_PAGO  → TechHub       (Producto 2 + 4)
      PAGO_APROBADO   → CompuMundo    (Producto 1)
      PAGO_RECHAZADO  → Juan Perez    (Producto 5)
      EN_PREPARACION  → TechHub       (Producto 8)
      EN_CAMINO       → CompuMundo    (Producto 9 + 10) [envio_demo_001]
      ENTREGADO       → CompuMundo    (Producto 1 + 3)  [envio_demo_002]
      CANCELADO       → Juan Perez    (Producto 5 + 6)
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })