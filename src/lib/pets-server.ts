import type { Pet } from '@/types'

/**
 * Server-side fetch of the pet list for the home page.
 * - cache: 'no-store'  → every request sees admin edits immediately (adoption board).
 * - 10 s timeout        → a cold-starting backend cannot block the streamed shell for long;
 *                         on failure we return null and the client (react-query) retries.
 */
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
