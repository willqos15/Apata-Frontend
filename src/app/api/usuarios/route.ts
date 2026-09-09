import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/server/prisma'
import { readJsonBody } from '@/server/body'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await readJsonBody(request)

    const res = await auth.api.signUpEmail({
      body: {
        email: email as string,
        password: password as string,
        name: (name as string) || (email as string).split('@')[0],
      },
    })

    return NextResponse.json(res.user, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar usuário', details: error instanceof Error ? error.message : undefined },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const usuarios = await prisma.user.findMany()
    return NextResponse.json(usuarios, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}
