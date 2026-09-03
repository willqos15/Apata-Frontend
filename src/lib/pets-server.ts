import type { Pet } from '@/types'

export async function fetchPetsServer(): Promise<Pet[] | null> {
  const base = process.env.NEXT_PUBLIC_URLAPI
  if (!base) return null

  try {
    const res = await fetch(`${base}/pets`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null

    const data: unknown = await res.json()
    return Array.isArray(data) ? (data as Pet[]) : null
  } catch {
    return null
  }
}
