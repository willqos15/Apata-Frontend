import { NextResponse, type NextRequest } from 'next/server'
import { authenticate, setAuthCookie } from '@/server/auth'
import { signToken } from '@/server/jwt'

export async function POST(request: NextRequest) {
  const auth = authenticate(request)
  if ('error' in auth) return auth.error

  try {
    const novoToken = signToken(auth.userId)
    const response = NextResponse.json({ msg: 'Token atualizado com sucesso', token: novoToken }, { status: 200 })
    setAuthCookie(response, novoToken)
    return response
  } catch {
    return NextResponse.json({ error: 'Erro ao renovar token' }, { status: 401 })
  }
}
