import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export function proxy(request: NextRequest) {
  const sessionToken = getSessionCookie(request)
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/painel', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/cadastro/:path*', '/gerenciar/:path*'],
}
