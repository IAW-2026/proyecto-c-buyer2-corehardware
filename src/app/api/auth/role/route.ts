import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ role: null }, { status: 401 })
  }

  const user = await currentUser()
  const role = (user?.publicMetadata as any)?.role ?? null

  return NextResponse.json({ role })
}