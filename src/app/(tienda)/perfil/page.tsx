import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PerfilForm from './PerfilForm'

export default async function PerfilPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirectUrl=/perfil')

  const compradorDB = await prisma.comprador.findUnique({
    where: { clerkUserId: userId },
  })

  if (!compradorDB || compradorDB.isDeleted) redirect('/sign-in')

  const comprador = {
    id:              compradorDB.id,
    nombre:          compradorDB.nombre,
    apellido:        compradorDB.apellido,
    dni:             compradorDB.dni,
    cuilCuit:        compradorDB.cuilCuit,
    celular:         compradorDB.celular,
    direccion:       compradorDB.direccion,
    fechaNacimiento: compradorDB.fechaNacimiento.toISOString().split('T')[0],
    nacionalidad:    compradorDB.nacionalidad,
    sexo:            compradorDB.sexo ?? '',
    condicionIva:    compradorDB.condicionIva,
    mail:            compradorDB.mail,
  }

  return <PerfilForm comprador={comprador} />
}