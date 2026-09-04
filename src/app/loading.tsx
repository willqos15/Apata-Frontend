import Spinner from '@/components/Spinner'

export default function Loading() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <Spinner className="mx-auto" />
    </div>
  )
}
