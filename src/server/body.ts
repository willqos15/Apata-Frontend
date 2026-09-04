import type { NextRequest } from 'next/server'

export type Fields = Record<string, unknown>

export interface ParsedBody {
  fields: Fields
  file: File | null
}

function contentType(request: NextRequest): string {
  return request.headers.get('content-type') ?? ''
}

export async function readJsonBody(request: NextRequest): Promise<Fields> {
  if (!contentType(request).includes('application/json')) throw new Error('Body não é JSON')

  const data: unknown = await request.json()
  if (typeof data !== 'object' || data === null) throw new Error('Body não é um objeto JSON')

  return data as Fields
}

export async function readPetBody(request: NextRequest): Promise<ParsedBody> {
  if (contentType(request).startsWith('multipart/form-data')) {
    const formData = await request.formData()
    const fields: Fields = {}
    let file: File | null = null

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') fields[key] = value
      else if (key === 'file') file = value
    }

    return { fields, file }
  }

  if (contentType(request).includes('application/json')) {
    return { fields: await readJsonBody(request), file: null }
  }

  return { fields: {}, file: null }
}
