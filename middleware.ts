import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

//Definimos qué páginas puede ver cualquiera (Públicas)
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/productos(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  //Si el usuario intenta entrar a algo que NO es público
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
};