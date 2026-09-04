import { NextResponse, type NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/server/prisma'
import { readJsonBody } from '@/server/body'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await readJsonBody(request)

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password as string, salt)

    const novoUsuario = await prisma.user.create({
      data: {
        email: email as string,
        name: name as string | null | undefined,
        password: passwordHash,
      },
    })

    const usuarioSemSenha = { id: novoUsuario.id, email: novoUsuario.email, name: novoUsuario.name }
    return NextResponse.json(usuarioSemSenha, { status: 201 })
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
