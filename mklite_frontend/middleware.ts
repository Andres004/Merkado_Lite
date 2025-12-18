import { NextRequest, NextResponse } from 'next/server';

const roleProtectedRoutes = [
  { prefix: '/administrador', role: 'ADMIN' },
  { prefix: '/repartidor', role: 'REPARTIDOR' },
];

const isAsset = (pathname: string) =>
  pathname.startsWith('/_next') ||
  pathname.startsWith('/favicon.ico') ||
  pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAsset(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('authToken')?.value;
  const role = request.cookies.get('userRole')?.value?.toUpperCase();

    const isProfileRoute = pathname === '/perfil' || pathname.startsWith('/perfil/');

  if (isProfileRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }


  const matchedRoute = roleProtectedRoutes.find(({ prefix }) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  // Si intenta acceder a una ruta protegida sin token o rol, enviamos a login.
  if (!token || !role) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si tiene rol pero no coincide con la sección, lo redirigimos a su dashboard correcto.
  if (role !== matchedRoute.role) {
    const fallback =
      role === 'ADMIN'
        ? '/administrador'
        : role === 'REPARTIDOR'
          ? '/repartidor'
          : '/';

    return NextResponse.redirect(new URL(fallback, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};