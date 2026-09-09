import imageCompression from 'browser-image-compression'
import { ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from './validations/pet'

export interface ImageValidationResult {
  valid: boolean
  error?: string
}

/**
 * Valida se o arquivo possui formato permitido (JPEG, JPG ou PNG)
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo selecionado.' }
  }

  const mime = (file.type || '').toLowerCase()
  const extensionMatch = file.name.match(/\.[0-9a-z]+$/i)
  const ext = extensionMatch ? extensionMatch[0].toLowerCase() : ''

  const isMimeValid = ALLOWED_IMAGE_TYPES.includes(mime)
  const isExtValid = ALLOWED_IMAGE_EXTENSIONS.includes(ext)

  if (!isMimeValid && !isExtValid) {
    return {
      valid: false,
      error: 'Formato inválido. Apenas imagens JPEG, PNG ou JPG são permitidas.',
    }
  }

  return { valid: true }
}

/**
 * Converte e/ou comprime a imagem caso ultrapasse o limite de 5MB (ou valor configurado).
 * Se o arquivo já estiver abaixo de 5MB, ele é retornado diretamente.
 */
export async function compressImageIfNeeded(
  file: File,
  options?: {
    maxSizeMB?: number
    onProgress?: (progress: number) => void
  },
): Promise<File> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const targetMaxMB = options?.maxSizeMB ?? 4.8 // 4.8MB para garantir margem segura abaixo de 5MB

  // Se o arquivo já for menor ou igual a 5MB, não necessita compressão pesada
  if (file.size <= MAX_IMAGE_SIZE_BYTES) {
    return file
  }

  try {
    const compressionOptions = {
      maxSizeMB: targetMaxMB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      onProgress: options?.onProgress,
      fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
    }

    let compressedBlob = await imageCompression(file, compressionOptions)

    // Caso raro onde uma única passada não alcance <= 5MB
    if (compressedBlob.size > MAX_IMAGE_SIZE_BYTES) {
      compressedBlob = await imageCompression(compressedBlob, {
        ...compressionOptions,
        maxSizeMB: 3.5,
      })
    }

    return new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    })
  } catch (error) {
    console.error('Falha ao comprimir imagem:', error)
    throw new Error('Falha ao processar e comprimir a imagem. Tente uma imagem diferente.')
  }
}
