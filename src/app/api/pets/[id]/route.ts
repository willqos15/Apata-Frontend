import { NextResponse, type NextRequest } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/server/prisma'
import { authenticate } from '@/server/auth'
import { readPetBody } from '@/server/body'
import { destroyPhoto, uploadPetPhoto } from '@/server/cloudinary'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const pet = await prisma.pet.findFirst({ where: { id, deleted_at: null } })
    if (!pet) return NextResponse.json({ message: 'Animal não encontrado' }, { status: 404 })
    return NextResponse.json(pet, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar detalhes' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = authenticate(request)
  if ('error' in auth) return auth.error

  try {
    const { id } = await params
    const dadosAtuais = await prisma.pet.findFirst({ where: { id, deleted_at: null } })
    if (!dadosAtuais) return NextResponse.json({ error: 'Pet não encontrado' }, { status: 404 })

    const { fields, file } = await readPetBody(request)
    const dataUpdate: Record<string, unknown> = { ...fields }

    if (file) {
      if (dadosAtuais.public_idfoto) await destroyPhoto(dadosAtuais.public_idfoto)

      const resultado = await uploadPetPhoto(file)
      dataUpdate.foto = resultado.secure_url
      dataUpdate.public_idfoto = resultado.public_id
    }

    const petAtualizado = await prisma.pet.updateMany({
      where: { id, deleted_at: null },
      data: dataUpdate as Prisma.PetUpdateManyMutationInput,
    })

    return NextResponse.json(petAtualizado, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar pet' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = authenticate(request)
  if ('error' in auth) return auth.error

  try {
    const { id } = await params
    const pet = await prisma.pet.findUnique({ where: { id } })
    if (!pet) return NextResponse.json({ error: 'Pet não encontrado' }, { status: 404 })

    if (pet.public_idfoto) await destroyPhoto(pet.public_idfoto)

    await prisma.pet.update({
      where: { id },
      data: { deleted_at: new Date(), foto: null, public_idfoto: null },
    })

    return NextResponse.json({ message: 'Animal e imagem removidos com sucesso!' }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 })
  }
}
