import { NextResponse, type NextRequest } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/server/prisma'

export async function GET(request: NextRequest) {
  try {
    const nome = request.nextUrl.searchParams.get('nome')

    const where: Prisma.PetWhereInput = { deleted_at: null }
    if (nome) where.nome = { contains: nome, mode: 'insensitive' }

    const pets = await prisma.pet.findMany({ where })
    return NextResponse.json(pets, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar animais' }, { status: 500 })
  }
}
