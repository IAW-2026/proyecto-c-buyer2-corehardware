import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

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

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth()
  const isApi = request.nextUrl.pathname.startsWith('/api')
  const role = (sessionClaims?.metadata as any)?.role

  // ── Sin login ──────────────────────────────────────────────
  if (!userId) {
    if (isPublicRoute(request)) return NextResponse.next()
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // ── Rutas de dashboard — se evalúa ANTES del redirect general ──
  if (isAdminRoute(request)) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/productos', request.url))
    }
    return NextResponse.next()
  }

  // ── Admin fuera del dashboard → redirigir al dashboard ────
  if (!isApi && role === 'admin' && isBuyerRoute(request)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── Comprador: si no completó perfil, forzar completar-perfil ─
  if (!isApi && role !== 'admin' && !isProfileRoute(request)) {
    const checkUrl = new URL('/api/perfil/check', request.url)
    const res = await fetch(checkUrl, {
      headers: { cookie: request.headers.get('cookie') ?? '' },
    })
    if (res.ok) {
      const { completo } = await res.json()
      if (!completo) {
        return NextResponse.redirect(new URL('/completar-perfil', request.url))
      }
    }
  }

  // ── Comprador: perfil completo no necesita /completar-perfil ─
  if (!isApi && isProfileRoute(request)) {
    const checkUrl = new URL('/api/perfil/check', request.url)
    const res = await fetch(checkUrl, {
      headers: { cookie: request.headers.get('cookie') ?? '' },
    })
    if (res.ok) {
      const { completo } = await res.json()
      if (completo) {
        return NextResponse.redirect(new URL('/productos', request.url))
      }
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