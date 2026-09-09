import { z } from 'zod'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg']
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png']
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export const petSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  especie: z.enum(['cachorro', 'gato'], {
    errorMap: () => ({ message: 'Selecione a espécie' }),
  }),
  porte: z.enum(['pequeno', 'medio', 'grande'], {
    errorMap: () => ({ message: 'Selecione o porte' }),
  }),
  sexo: z.enum(['macho', 'femea'], {
    errorMap: () => ({ message: 'Selecione o sexo' }),
  }),
  descricao: z
    .string({ required_error: 'Descrição é obrigatória' })
    .trim()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  contato: z
    .string({ required_error: 'Contato é obrigatório' })
    .min(1, 'Contato é obrigatório')
    .refine((value) => value.replace(/\D/g, '').length === 11, {
      message: 'O contato precisa ter 11 dígitos',
    }),
  vacinado: z.boolean(),
  vermifugado: z.boolean(),
  castrado: z.boolean(),
  microchip: z.boolean(),
})

export type PetFormSchema = z.infer<typeof petSchema>
