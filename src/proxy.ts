import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/productos(.*)',
  '/carrito(.*)',
  '/api/webhooks(.*)',
  '/api/orders(.*)',
  '/api/buyers(.*)',
  '/api/seller(.*)',
  '/api/shipping(.*)',
  '/api/auth/role','/api/dashboard-analytics(.*)',
])

const isAdminRoute = createRouteMatcher(['/dashboard(.*)'])

const isBuyerRoute = createRouteMatcher([
  '/productos(.*)',
  '/carrito(.*)',
  '/pedidos(.*)',
  '/perfil(.*)',
  '/seguimiento_envio(.*)',
  '/completar-perfil(.*)',
  '/',
])

const isProfileRoute = createRouteMatcher(['/completar-perfil(.*)'])

// Helper: confirma el rol pegándole directo a Clerk server-side (no al JWT),
// para los casos en que sessionClaims todavía no tiene el metadata fresco.
async function resolveRole(request: NextRequest): Promise<string | undefined> {
  try {
    const res = await fetch(new URL('/api/auth/role', request.url), {
      headers: { cookie: request.headers.get('cookie') ?? '' },
    })
    if (!res.ok) return undefined
    const { role } = await res.json()
    return role ?? undefined
  } catch {
    return undefined
  }
}

async function checkPerfilCompleto(request: NextRequest): Promise<boolean | null> {
  const checkUrl = new URL('/api/perfil/check', request.url)
  const res = await fetch(checkUrl, {
    headers: { cookie: request.headers.get('cookie') ?? '' },
  })
  if (!res.ok) return null
  const { completo } = await res.json()
  return completo as boolean
}

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth()
  const isApi = request.nextUrl.pathname.startsWith('/api')
  let role = (sessionClaims?.metadata as any)?.role as string | undefined

  // ── Sin login ──────────────────────────────────────────────
  if (!userId) {
    if (isPublicRoute(request)) return NextResponse.next()
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // ── API routes: no aplicamos gates de pantalla, solo dejamos pasar ──
  if (isApi) {
    return NextResponse.next()
  }

  // ── Rol no resuelto aún en el JWT → confirmar server-side contra Clerk ──
  // Esto cubre el caso de un usuario recién registrado (buyer o admin)
  // cuyo publicMetadata.role todavía no llegó al JWT de la sesión.
  if (!role) {
    role = await resolveRole(request)
  }

  // ── Rutas de dashboard (admin) ──────────────────────────────
  if (isAdminRoute(request)) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/productos', request.url))
    }
    return NextResponse.next()
  }

  // ── Admin fuera del dashboard → redirigir al dashboard ────
  if (role === 'admin' && isBuyerRoute(request)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── A esta altura: usuario no-admin (buyer, o rol aún sin resolver) ──
  // Si el rol sigue sin resolverse después del fallback, y la ruta no es
  // de buyer ni pública, lo mandamos a /productos como destino seguro.
  if (!role && !isBuyerRoute(request) && !isPublicRoute(request)) {
    return NextResponse.redirect(new URL('/productos', request.url))
  }

  // ── Comprador: si no completó perfil, forzar completar-perfil ─
  if (role !== 'admin' && !isProfileRoute(request)) {
    const completo = await checkPerfilCompleto(request)
    if (completo === false) {
      return NextResponse.redirect(new URL('/completar-perfil', request.url))
    }
  }

  // ── Comprador: perfil completo no necesita /completar-perfil ─
  if (isProfileRoute(request)) {
    const completo = await checkPerfilCompleto(request)
    if (completo === true) {
      return NextResponse.redirect(new URL('/productos', request.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}