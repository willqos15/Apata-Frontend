import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/server/prisma'
import { authenticate } from '@/server/auth'
import { readPetBody } from '@/server/body'
import { uploadPetPhoto } from '@/server/cloudinary'
import { findActivePets } from '@/server/pets'
import { validateServerImage } from '@/server/imageValidation'
import { petSchema } from '@/lib/validations/pet'

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
  const auth = await authenticate(request)
  if ('error' in auth) return auth.error

  try {
    const { fields, file } = await readPetBody(request)

    // Validação da imagem no cadastro
    if (!file) {
      return NextResponse.json({ error: 'A foto do animal é obrigatória.' }, { status: 400 })
    }

    const imageValidation = await validateServerImage(file)
    if (!imageValidation.valid) {
      return NextResponse.json({ error: imageValidation.error }, { status: 400 })
    }

    // Validação dos dados do formulário com Zod
    const parseResult = petSchema.safeParse(fields)
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Dados inválidos.'
      return NextResponse.json({ error: firstError, details: parseResult.error.flatten() }, { status: 400 })
    }

    const { nome, especie, porte, sexo, descricao, contato, vacinado, vermifugado, castrado, microchip } =
      parseResult.data

    const resultado = await uploadPetPhoto(imageValidation.buffer ?? file)

    const novoPet = await prisma.pet.create({
      data: {
        nome,
        especie,
        porte,
        sexo,
        descricao,
        contato,
        vacinado,
        vermifugado,
        castrado,
        microchip,
        tutelado: fields.tutelado === 'true' || fields.tutelado === true,
        aprovado: true,
        adotado: false,
        foto: resultado.secure_url,
        public_idfoto: resultado.public_id,
        ownerId: auth.userId,
        deleted_at: null,
      },
    })

    return NextResponse.json(novoPet, { status: 201 })
  } catch (error) {
    console.error('Erro ao cadastrar pet:', error)
    return NextResponse.json(
      { error: 'Erro ao cadastrar pet', details: error instanceof Error ? error.message : undefined },
      { status: 500 },
    )
  }
}
