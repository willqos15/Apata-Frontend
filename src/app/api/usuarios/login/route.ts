import { NextResponse, type NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/server/prisma'
import { readJsonBody } from '@/server/body'
import { setAuthCookie } from '@/server/auth'
import { signToken } from '@/server/jwt'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await readJsonBody(request)

    const user = await prisma.user.findUnique({ where: { email: email as string } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const senhaCorreta = await bcrypt.compare(password as string, user.password)
    if (!senhaCorreta) return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })

    const token = signToken(user.id)

    const response = NextResponse.json(
      {
        message: 'Login realizado com sucesso!',
        token,
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 200 },
    )
    setAuthCookie(response, token)
    return response
  } catch {
    return NextResponse.json({ error: 'Erro no servidor ao logar' }, { status: 500 })
  }
}
