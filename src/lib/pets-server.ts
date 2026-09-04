import { connection } from 'next/server'
import type { Pet } from '@/types'
import { findActivePets } from '@/server/pets'

const TIMEOUT_MS = 10_000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let handle: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    handle = setTimeout(() => reject(new Error('Tempo esgotado ao buscar animais')), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(handle))
}

export async function fetchPetsServer(): Promise<Pet[] | null> {
  await connection()

  try {
    const rows = await withTimeout(findActivePets(), TIMEOUT_MS)
    const data: unknown = JSON.parse(JSON.stringify(rows))
    return Array.isArray(data) ? (data as Pet[]) : null
  } catch {
    return null
  }
}
