import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Rutas públicas — cualquiera sin login
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/productos(.*)',
  '/carrito(.*)',
  '/api/webhooks(.*)',
])

// Rutas del panel admin
const isAdminRoute = createRouteMatcher(['/dashboard(.*)'])

// Rutas que requieren login + perfil completo
const isProtectedRoute = createRouteMatcher([
  '/checkout(.*)',
  '/mis-pedidos(.*)',
  '/perfil(.*)',
])

// Ruta de completar perfil
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

  // ── Admin ──────────────────────────────────────────────────
  // Solo usuarios con role: "admin" pueden entrar al dashboard
  if (isAdminRoute(request)) {
    if (role !== 'admin') {
      // Si es comprador, lo manda a productos. Si no está logueado, ya fue manejado arriba.
      return NextResponse.redirect(new URL('/productos', request.url))
    }
    return NextResponse.next()
  }

  // ── Comprador logueado ─────────────────────────────────────
  // En rutas protegidas (checkout, pedidos, perfil) → chequear perfil completo
  if (!isApi && isProtectedRoute(request)) {
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

  // Si ya tiene perfil completo y va a /completar-perfil → redirigir a productos
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
