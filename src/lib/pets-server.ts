import { connection } from 'next/server'
import type { Pet } from '@/types'
import { findActivePets } from '@/server/pets'
import { withTimeout } from '@/server/timeout'

const TIMEOUT_MS = 10_000

export async function fetchPetsServer(): Promise<Pet[] | null> {
  await connection()

  try {
    const rows = await withTimeout(findActivePets(), TIMEOUT_MS, 'Tempo esgotado ao buscar animais')
    const data: unknown = JSON.parse(JSON.stringify(rows))
    return Array.isArray(data) ? (data as Pet[]) : null
  } catch {
    return null
  }
}
