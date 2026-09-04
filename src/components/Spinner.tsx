import Image from 'next/image'
import loading from '@/img/load.gif'

interface SpinnerProps {
  className?: string
}

export default function Spinner({ className = '' }: SpinnerProps) {
  return (
    <Image
      src={loading}
      alt="Carregando"
      unoptimized
      className={`w-20 h-auto ${className}`}
    />
  )
}
