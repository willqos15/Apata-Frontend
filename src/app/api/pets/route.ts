import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/server/prisma'
import { authenticate } from '@/server/auth'
import { readPetBody } from '@/server/body'
import { uploadPetPhoto } from '@/server/cloudinary'
import { findActivePets } from '@/server/pets'

export async function GET() {
  try {
    const pets = await findActivePets()
    return NextResponse.json(pets, { status: 200 })
  } catch (error) {
    console.error('Erro ao listar:', error)
    return NextResponse.json({ error: 'Erro ao buscar animais' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticate(request)
  if ('error' in auth) return auth.error

  try {
    const { fields, file } = await readPetBody(request)
    const { nome, especie, porte, sexo, descricao, tutelado, contato } = fields

    let fotoUrl: string | null = null
    let publicId: string | null = null

    if (file) {
      const resultado = await uploadPetPhoto(file)
      fotoUrl = resultado.secure_url
      publicId = resultado.public_id
    }

    const novoPet = await prisma.pet.create({
      data: {
        nome: nome as string,
        especie: especie as string,
        porte: porte as string,
        sexo: sexo as string,
        descricao: descricao as string,
        contato: contato as string | undefined,
        tutelado: tutelado === 'true' || tutelado === true,
        aprovado: true,
        adotado: false,
        foto: fotoUrl,
        public_idfoto: publicId,
        ownerId: auth.userId,
        deleted_at: null,
      },
    })

    return NextResponse.json(novoPet, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao cadastrar pet', details: error instanceof Error ? error.message : undefined },
      { status: 500 },
    )
  }
}
