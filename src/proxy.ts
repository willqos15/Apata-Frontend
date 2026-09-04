import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE } from '@/server/auth'
import { verifyToken } from '@/server/jwt'

function hasValidSession(token: string | undefined): boolean {
  if (!token) return false
  try {
    verifyToken(token)
    return true
  } catch {
    return false
  }
}

export function proxy(request: NextRequest) {
  if (hasValidSession(request.cookies.get(AUTH_COOKIE)?.value)) return NextResponse.next()
  return NextResponse.redirect(new URL('/painel', request.url))
}

export const config = {
  matcher: ['/cadastro/:path*', '/gerenciar/:path*'],
}
