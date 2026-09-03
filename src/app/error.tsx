'use client'

import { useEffect } from 'react'
import Button from '@/components/Button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <div className="bg-(--bg-color2) text-(--text-color) rounded-2xl text-base p-6 mx-auto max-w-100 flex flex-col items-center gap-2 text-center">
        <p className="text-[18pt] font-bold text-red-800">Algo deu errado.</p>
        <p>Não foi possível carregar esta página.</p>

        <Button name="Tente novamente" onClick={reset} size={15} className="mt-2" />
      </div>
    </div>
  )
}
