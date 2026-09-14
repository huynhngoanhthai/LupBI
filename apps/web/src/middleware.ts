/**
 * Next.js Middleware - Route Protection (Edge Level)
 * Chặn truy cập các route private TRƯỚC khi render, chuyển hướng về /login.
 * Chạy ở Edge Runtime: dùng cookie session marker `is_logged_in` hoặc `refreshToken`.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/queries', '/settings', '/reports'];
const AUTH_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const refreshTokenCookie = request.cookies.get('refreshToken')?.value;
  const isLoggedInCookie = request.cookies.get('is_logged_in')?.value;
  const isLoggedIn = !!refreshTokenCookie || !!isLoggedInCookie;

  const isProtectedPath = PROTECTED_PATHS.some((p) =>
    pathname.startsWith(p),
  );
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Chưa đăng nhập → chuyển hướng về /login kèm callbackUrl
  if (isProtectedPath && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Đã đăng nhập → chuyển hướng thẳng vào /dashboard
  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
};
