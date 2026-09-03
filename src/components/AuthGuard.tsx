'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from './Spinner'
import { useAuthToken, useIsClient } from '@/lib/auth'

/**
 * LIMITATION: the JWT lives in localStorage, which the server (and Next's
 * proxy/middleware) cannot read, so this guard runs only in the browser after
 * hydration. The server-rendered HTML for guarded routes contains just a
 * spinner.
 */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const isClient = useIsClient()
  const token = useAuthToken()

  useEffect(() => {
    if (isClient && token === null) {
      router.replace('/painel')
    }
  }, [isClient, token, router])

  if (!isClient || token === null) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner className="mx-auto" />
      </div>
    )
  }

  return <>{children}</>
}
