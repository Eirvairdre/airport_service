import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Middleware для проверки авторизации и прав доступа
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  // Эти страницы доступны всем - логин, статика, API авторизации
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/api/auth') || pathname.startsWith('/api/test-session') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  // Если пользователь не залогинен - отправляю на страницу входа
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Если обычный пользователь пытается зайти в админку - отправляю на дашборд
  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
      Защищаю все страницы, кроме публичных
      Можно добавить сюда другие публичные страницы, если понадобится
    */
    '/((?!login|api/auth|api/test-session|_next|favicon.ico).*)',
  ],
} 