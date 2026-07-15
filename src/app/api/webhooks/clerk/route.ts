import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'No webhook secret' }, { status: 500 })
  }

  const svix_id = req.headers.get('svix-id')
  const svix_timestamp = req.headers.get('svix-timestamp')
  const svix_signature = req.headers.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await req.text()
  const wh = new Webhook(WEBHOOK_SECRET)

  try {
    wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.type === 'user.created') {
    const { id: clerkUserId, email_addresses } = event.data
    const mail = email_addresses?.[0]?.email_address ?? ''

    await prisma.comprador.create({
      data: {
        clerkUserId,
        mail,
        nombre: '',
        apellido: '',
        dni: '',
        cuilCuit: '',
        celular: '',
        direccion: '',
        fechaNacimiento: new Date('2000-01-01'),
        nacionalidad: '',
        condicionIva: 'Consumidor Final',
        isDeleted: false,
      },
    })

    const clerk = await clerkClient()
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { role: 'buyer' },
    })

  }

  return NextResponse.json({ received: true })
}