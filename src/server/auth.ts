import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function authenticate(
  request: NextRequest,
): Promise<{ userId: string } | { error: NextResponse }> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || !session.user) {
      return { error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }) }
    }

    return { userId: session.user.id }
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return { error: NextResponse.json({ error: 'Erro de autenticação' }, { status: 401 }) }
  }
}
