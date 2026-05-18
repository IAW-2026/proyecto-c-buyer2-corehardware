import { prisma } from './db' // 👈 Cambió a './db' porque ahora están en la misma carpeta

async function main() {
  const timestamp = Date.now()
  const emailTest = `alice-${timestamp}@example.com`

  // 1. CREATE
  const newComprador = await prisma.comprador.create({
    data: {
      dni: `DNI-${timestamp}`,
      cuilCuit: `CUIT-${timestamp}`,
      apellido: 'Smith',
      nombre: 'Alice',
      direccion: 'Av. Alem 1234',
      mail: emailTest,
      celular: '2914000000',
      fechaNacimiento: new Date('1994-05-18'),
      nacionalidad: 'Argentina',
      condicionIva: 'Consumidor Final',
      clerkUserId: `clerk-${timestamp}`,
    },
  })
  console.log('Created comprador:', newComprador)

  // 2. READ
  const foundComprador = await prisma.comprador.findUnique({
    where: { id: newComprador.id },
  })
  console.log('Found comprador:', foundComprador)

  // 3. UPDATE
  const updatedComprador = await prisma.comprador.update({
    where: { id: newComprador.id },
    data: { nombre: 'Alice Marie' },
  })
  console.log('Updated comprador:', updatedComprador)

  // 4. DELETE
  await prisma.comprador.delete({
    where: { id: newComprador.id },
  })
  console.log('Deleted comprador de prueba correctamente.')
}

main()
  .catch((error) => {
    console.error('Error en el script de prueba:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })