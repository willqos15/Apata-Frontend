import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/lib/validations/pet'

export interface ServerImageValidationResult {
  valid: boolean
  error?: string
  buffer?: Buffer
}

/**
 * Validação rigorosa no backend:
 * 1. Tamanho do arquivo (<= 5MB)
 * 2. MIME type declarado (image/jpeg, image/png, image/jpg)
 * 3. Magic bytes / assinatura de cabeçalho binário (JPEG / PNG)
 */
export async function validateServerImage(file: File): Promise<ServerImageValidationResult> {
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo enviado.' }
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'O tamanho da imagem não pode ultrapassar 5MB.',
    }
  }

  const mime = (file.type || '').toLowerCase()
  if (!ALLOWED_IMAGE_TYPES.includes(mime)) {
    return {
      valid: false,
      error: 'Formato de imagem inválido. Apenas JPEG, PNG ou JPG são permitidos.',
    }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    const isJpeg =
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff

    const isPng =
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a

    if (!isJpeg && !isPng) {
      return {
        valid: false,
        error: 'Arquivo corrompido ou formato não suportado. Apenas arquivos JPEG ou PNG válidos são permitidos.',
      }
    }

    return { valid: true, buffer }
  } catch (err) {
    console.error('Erro ao inspecionar buffer da imagem:', err)
    return {
      valid: false,
      error: 'Erro ao validar o conteúdo do arquivo de imagem.',
    }
  }
}
