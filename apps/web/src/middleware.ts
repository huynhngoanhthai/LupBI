/**
 * Next.js Middleware - Route Protection (Edge Level)
 * Chặn truy cập các route private TRƯỚC khi render, chuyển hướng về /login.
 * Chạy ở Edge Runtime: không có Node.js API, chỉ dùng Web APIs.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes cần đăng nhập
const PROTECTED_PATHS = ['/dashboard', '/queries', '/settings', '/reports'];

// Routes chỉ dành cho khách chưa đăng nhập (auth pages)
const AUTH_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('lupbi_access_token')?.value;

  // ⚠️ Note: Vì Access Token lưu trong localStorage (không phải cookie),
  // middleware edge không đọc được. Giải pháp: dùng cookie session marker
  // hoặc kiểm tra refreshToken cookie còn hiệu lực.
  // Ở đây ta dùng refreshToken cookie làm dấu hiệu "đã đăng nhập".
  const refreshTokenCookie = request.cookies.get('refreshToken')?.value;
  const isLoggedIn = !!refreshTokenCookie;

  const isProtectedPath = PROTECTED_PATHS.some((p) =>
    pathname.startsWith(p),
  );
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Chưa đăng nhập → chặn vào route protected
  if (isProtectedPath && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname); // Nhớ đường quay lại
    return NextResponse.redirect(loginUrl);
  }

  // Đã đăng nhập → không cho vào trang login nữa
  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Áp dụng middleware cho tất cả routes trừ static assets và Next.js internals
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
};
