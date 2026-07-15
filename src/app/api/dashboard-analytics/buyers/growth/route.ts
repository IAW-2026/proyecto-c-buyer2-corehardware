import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/auth'
import { getCompradorGrowthForRange } from '@/lib/queries/growth'

// Mismo bug que se encontró en Seller: "new Date(to)" con to = "YYYY-MM-DD"
// parsea a medianoche UTC de ese día, dejando afuera cualquier registro
// creado más tarde ese mismo día. Fix aplicado acá desde el vamos:
// llevar "to" a fin de día (23:59:59.999) antes de pasarlo a la query.
function parseDateBoundary(value: string | null, endOfDay: boolean): Date | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  if (endOfDay) date.setUTCHours(23, 59, 59, 999)
  return date
}

export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const from = parseDateBoundary(searchParams.get('from'), false)
  const to = parseDateBoundary(searchParams.get('to'), true)

  if (!from || !to) {
    return NextResponse.json(
      { error: 'Parámetros "from" y "to" son requeridos (YYYY-MM-DD)' },
      { status: 400 }
    )
  }

  const result = await getCompradorGrowthForRange(from, to)

  return NextResponse.json(result, { status: 200 })
}