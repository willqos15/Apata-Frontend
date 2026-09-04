import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/server/jwt'

export const AUTH_COOKIE = 'apata_token'
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({ name: AUTH_COOKIE, value: token, maxAge: AUTH_COOKIE_MAX_AGE, ...cookieOptions() })
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({ name: AUTH_COOKIE, value: '', maxAge: 0, ...cookieOptions() })
}

export function authenticate(request: NextRequest): { userId: string } | { error: NextResponse } {
  const cookieToken = request.cookies.get(AUTH_COOKIE)?.value
  const authHeader = request.headers.get('authorization')

  if (!cookieToken && !authHeader) {
    return { error: NextResponse.json({ error: 'Token não fornecido' }, { status: 401 }) }
  }

  const token = cookieToken || (authHeader ?? '').split(' ')[1] || ''

  try {
    return { userId: verifyToken(token) }
  } catch {
    return { error: NextResponse.json({ error: 'Token inválido' }, { status: 401 }) }
  }
}
