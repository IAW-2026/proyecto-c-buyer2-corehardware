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
    console.warn(`⚠️  Error real:`, e)
  }
}

async function main() {
  console.log('⏳ Iniciando el sembrado de datos (Seed) en Neon...')

  // 1. Limpieza previa en orden correcto (respeta foreign keys)
  console.log('🗑️  Limpiando datos viejos...')
  await prisma.carritoItem.deleteMany()
  await prisma.carrito.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.comprador.deleteMany()

  // ─────────────────────────────────────────────
  // 2. COMPRADORES
  // ─────────────────────────────────────────────
  console.log('👤 Insertando compradores...')

  const comprador1 = await prisma.comprador.create({
    data: {
      dni: '12345678',
      cuilCuit: '20-12345678-9',
      apellido: 'García',
      nombre: 'Lucas',
      sexo: 'M',
      direccion: 'Av. Corrientes 1234, CABA',
      mail: 'buyer1+clerk_test@iaw.com',
      celular: '1145678901',
      fechaNacimiento: new Date('1990-05-15'),
      nacionalidad: 'Argentina',
      condicionIva: 'Consumidor Final',
      clerkUserId: 'user_3DsljOvfon8on81VhQH4IXlUb92',
      isDeleted: false,
    },
  })

  const comprador2 = await prisma.comprador.create({
    data: {
      dni: '23456789',
      cuilCuit: '27-23456789-4',
      apellido: 'Martínez',
      nombre: 'Ana',
      sexo: 'F',
      direccion: 'Calle Falsa 456, Rosario',
      mail: 'buyer2+clerk_test@iaw.com',
      celular: '3414567890',
      fechaNacimiento: new Date('1995-08-22'),
      nacionalidad: 'Argentina',
      condicionIva: 'Consumidor Final',
      clerkUserId: 'user_3DsllhTwrG6tPrfIkVxm0ccenrQ',
      isDeleted: false,
    },
  })

  const comprador3 = await prisma.comprador.create({
    data: {
      dni: '34567890',
      cuilCuit: '20-34567890-1',
      apellido: 'López',
      nombre: 'Martín',
      sexo: 'M',
      direccion: 'San Martín 789, Córdoba',
      mail: 'buyer3+clerk_test@iaw.com',
      celular: '3514567890',
      fechaNacimiento: new Date('1988-12-01'),
      nacionalidad: 'Argentina',
      condicionIva: 'Responsable Inscripto',
      clerkUserId: 'user_3DslpwkE6FXlO1VdY8HL1aI6Nd4',
      isDeleted: false,
    },
  })

  const comprador4 = await prisma.comprador.create({
    data: {
      dni: '45678901',
      cuilCuit: '27-45678901-3',
      apellido: 'Fernández',
      nombre: 'Valentina',
      sexo: 'F',
      direccion: 'Belgrano 321, Mendoza',
      mail: 'buyer4+clerk_test@iaw.com',
      celular: '2614567890',
      fechaNacimiento: new Date('1998-03-10'),
      nacionalidad: 'Argentina',
      condicionIva: 'Consumidor Final',
      clerkUserId: 'user_3EWGYof98vEs1U1uf0THdCs3O0u',
      isDeleted: false,
    },
  })

  const comprador5 = await prisma.comprador.create({
    data: {
      dni: '56789012',
      cuilCuit: '20-56789012-7',
      apellido: 'Romero',
      nombre: 'Diego',
      sexo: 'M',
      direccion: 'Rivadavia 555, La Plata',
      mail: 'buyer5+clerk_test@iaw.com',
      celular: '2214567890',
      fechaNacimiento: new Date('1993-07-25'),
      nacionalidad: 'Argentina',
      condicionIva: 'Consumidor Final',
      clerkUserId: 'user_3EWGn37JZ0yBUajMGrkJCR3Wmwv',
      isDeleted: false,
    },
  })

  const comprador6 = await prisma.comprador.create({
    data: {
      dni: '67890123',
      cuilCuit: '27-67890123-5',
      apellido: 'Torres',
      nombre: 'Camila',
      sexo: 'F',
      direccion: 'Mitre 876, Tucumán',
      mail: 'buyer6+clerk_test@iaw.com',
      celular: '3814567890',
      fechaNacimiento: new Date('2001-11-18'),
      nacionalidad: 'Argentina',
      condicionIva: 'Consumidor Final',
      clerkUserId: 'user_3EWGwVbYGyg5Kk9Rd1BauDUo2SZ',
      isDeleted: false,
    },
  })

  // ─────────────────────────────────────────────
  // 3. PEDIDOS — variedad de estados y fechas
  // ─────────────────────────────────────────────
  console.log('📦 Insertando pedidos...')

  await prisma.pedido.createMany({
    data: [
      // Lucas García — varios pedidos en distintos estados
      {
        fecha: new Date('2026-03-10'),
        compradorId: comprador1.id,
        vendedorId: 1,
        productosId: [1, 3],
        monto: 3070000,
        estado: 'ENTREGADO',
        envioId: 1,
      },
      {
        fecha: new Date('2026-04-05'),
        compradorId: comprador1.id,
        vendedorId: 2,
        productosId: [5],
        monto: 310000,
        estado: 'ENTREGADO',
        envioId: 2,
      },
      {
        fecha: new Date('2026-05-01'),
        compradorId: comprador1.id,
        vendedorId: 1,
        productosId: [8, 12],
        monto: 1450000,
        estado: 'EN_CAMINO',
        envioId: 7,
      },
      {
        fecha: new Date('2026-05-20'),
        compradorId: comprador1.id,
        vendedorId: 3,
        productosId: [2],
        monto: 950000,
        estado: 'PAGO_APROBADO',
        envioId: null,
      },

      // Ana Martínez
      {
        fecha: new Date('2026-03-22'),
        compradorId: comprador2.id,
        vendedorId: 1,
        productosId: [7, 9],
        monto: 2100000,
        estado: 'ENTREGADO',
        envioId: 3,
      },
      {
        fecha: new Date('2026-04-18'),
        compradorId: comprador2.id,
        vendedorId: 3,
        productosId: [3, 11],
        monto: 318000,
        estado: 'CANCELADO',
        envioId: null,
      },
      {
        fecha: new Date('2026-05-15'),
        compradorId: comprador2.id,
        vendedorId: 2,
        productosId: [14],
        monto: 620000,
        estado: 'PENDIENTE_PAGO',
        envioId: null,
      },

      // Martín López
      {
        fecha: new Date('2026-02-14'),
        compradorId: comprador3.id,
        vendedorId: 2,
        productosId: [15],
        monto: 780000,
        estado: 'ENTREGADO',
        envioId: 4,
      },
      {
        fecha: new Date('2026-04-01'),
        compradorId: comprador3.id,
        vendedorId: 1,
        productosId: [8],
        monto: 620000,
        estado: 'ENTREGADO',
        envioId: 5,
      },
      {
        fecha: new Date('2026-05-10'),
        compradorId: comprador3.id,
        vendedorId: 3,
        productosId: [1, 5, 8],
        monto: 4000000,
        estado: 'EN_PREPARACION',
        envioId: null,
      },

      // Valentina Fernández
      {
        fecha: new Date('2026-04-28'),
        compradorId: comprador4.id,
        vendedorId: 1,
        productosId: [6],
        monto: 450000,
        estado: 'ENTREGADO',
        envioId: 6,
      },
      {
        fecha: new Date('2026-05-22'),
        compradorId: comprador4.id,
        vendedorId: 2,
        productosId: [10, 13],
        monto: 870000,
        estado: 'PAGO_APROBADO',
        envioId: null,
      },

      // Diego Romero
      {
        fecha: new Date('2026-05-18'),
        compradorId: comprador5.id,
        vendedorId: 1,
        productosId: [4],
        monto: 290000,
        estado: 'PAGO_RECHAZADO',
        envioId: null,
      },
      {
        fecha: new Date('2026-05-25'),
        compradorId: comprador5.id,
        vendedorId: 3,
        productosId: [2, 7],
        monto: 1750000,
        estado: 'PENDIENTE_PAGO',
        envioId: null,
      },

      // Camila Torres — compradora nueva, solo un pedido
      {
        fecha: new Date('2026-05-27'),
        compradorId: comprador6.id,
        vendedorId: 2,
        productosId: [16],
        monto: 530000,
        estado: 'PENDIENTE_PAGO',
        envioId: null,
      },
    ],
  })

  // ─────────────────────────────────────────────
  // 4. CARRITOS
  // Algunos compradores tienen carrito activo, otros no.
  // comprador3, comprador4 y comprador6 tienen carrito activo.
  // El resto no tiene (acaban de hacer checkout o nunca agregaron nada).
  // ─────────────────────────────────────────────
  console.log('🛒 Insertando carritos activos...')

  // Martín López — tiene 2 ítems en el carrito
  await prisma.carrito.create({
    data: {
      compradorId: comprador3.id,
      items: {
        create: [
          {
            productoId: 3,
            nombre: 'RTX 4070 Super',
            precio: 1850000,
            imagen: 'https://placehold.co/200x200?text=RTX+4070',
            cantidad: 1,
          },
          {
            productoId: 9,
            nombre: 'SSD NVMe 1TB Samsung 990 Pro',
            precio: 320000,
            imagen: 'https://placehold.co/200x200?text=SSD+1TB',
            cantidad: 2,
          },
        ],
      },
    },
  })

  // Valentina Fernández — tiene 1 ítem en el carrito
  await prisma.carrito.create({
    data: {
      compradorId: comprador4.id,
      items: {
        create: [
          {
            productoId: 1,
            nombre: 'Ryzen 9 7950X',
            precio: 2800000,
            imagen: 'https://placehold.co/200x200?text=Ryzen+9',
            cantidad: 1,
          },
        ],
      },
    },
  })

  // Camila Torres — acaba de agregar algo
  await prisma.carrito.create({
    data: {
      compradorId: comprador6.id,
      items: {
        create: [
          {
            productoId: 5,
            nombre: 'Motherboard ASUS ROG Strix B650-E',
            precio: 980000,
            imagen: 'https://placehold.co/200x200?text=MB+ASUS',
            cantidad: 1,
          },
          {
            productoId: 12,
            nombre: 'RAM DDR5 32GB Kingston Fury',
            precio: 410000,
            imagen: 'https://placehold.co/200x200?text=RAM+DDR5',
            cantidad: 2,
          },
        ],
      },
    },
  })

  // ─────────────────────────────────────────────
  // 5. ROLES EN CLERK
  // ─────────────────────────────────────────────
  console.log('🔑 Asignando roles en Clerk...')
  await setRole(comprador1.clerkUserId, 'buyer')
  await setRole(comprador2.clerkUserId, 'buyer')
  await setRole(comprador3.clerkUserId, 'buyer')
  await setRole(comprador4.clerkUserId, 'buyer')
  await setRole(comprador5.clerkUserId, 'buyer')
  await setRole(comprador6.clerkUserId, 'buyer')

  console.log(`
✅ Seed completado:
   👤 6 compradores
   📦 15 pedidos (ENTREGADO, EN_CAMINO, EN_PREPARACION, PAGO_APROBADO, PAGO_RECHAZADO, PENDIENTE_PAGO, CANCELADO)
   🛒 3 carritos activos (comprador3, comprador4, comprador6)
   🛒 3 compradores sin carrito (comprador1, comprador2, comprador5)
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error en el proceso de seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
