import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/server/prisma'
import { readJsonBody } from '@/server/body'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })
    return NextResponse.json(user, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'ID inválido ou erro no servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { email, name } = await readJsonBody(request)

    const usuarioAtualizado = await prisma.user.update({
      where: { id },
      data: {
        email: email as string | undefined,
        name: name as string | null | undefined,
      },
    })

    return NextResponse.json(usuarioAtualizado, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Usuário não encontrado ou ID inválido' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ message: 'Usuário deletado com sucesso!' }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar usuário' }, { status: 500 })
  }
}
