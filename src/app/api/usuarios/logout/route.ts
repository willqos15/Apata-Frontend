import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/server/auth'

export async function POST() {
  const response = NextResponse.json({ msg: 'Logout realizado com sucesso' }, { status: 200 })
  clearAuthCookie(response)
  return response
}
