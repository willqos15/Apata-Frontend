'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from './Spinner'
import { useAuthToken, useIsClient } from '@/lib/auth'

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
