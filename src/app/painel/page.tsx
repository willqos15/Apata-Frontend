'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Button from '@/components/Button'
import Spinner from '@/components/Spinner'
import { authClient, useSession } from '@/lib/auth-client'
import type { LoginPayload } from '@/types'

type LoginStatus = 'deslogado' | 'carregando' | 'logado' | 'erro'

export default function PainelPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('deslogado')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      router.replace('/gerenciar')
    }
  }, [session, router])

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginPayload>({ mode: 'onChange' })

  async function login(credentials: LoginPayload) {
    setLoginStatus('carregando')
    setErrorMessage(null)

    const { error } = await authClient.signIn.email({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      setLoginStatus('erro')
      setErrorMessage(error.message || 'Login ou Senha incorreto!')
      return
    }

    setLoginStatus('logado')
    router.push('/gerenciar')
    router.refresh()
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Spinner className="pt-15 mx-auto" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {loginStatus === 'carregando' ? (
        <Spinner className="pt-15 mx-auto" />
      ) : (
        <div className="block mx-auto bg-(--bg-color2) sm:rounded-2xl py-1.25 px-5 text-(--text-color) sm:w-60 w-full">
          <h2>Área Restrita</h2>
          <form onSubmit={handleSubmit(login)} className="flex flex-col w-full justify-center items-center gap-2">
            <input
              className="input"
              {...register('email', { required: true })}
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="Usuário"
            />

            <input className="input" {...register('password', { required: true })} type="password" placeholder="Senha" />

            {(errors.email || errors.password) && <p className="plogin">Campo obrigatório</p>}
            {loginStatus === 'erro' && <p className="plogin">{errorMessage || 'Login ou Senha incorreto!'}</p>}

            <Button name="Entrar" type="submit" size={15} className="text-[10pt] mt-2" />
          </form>
        </div>
      )}
    </div>
  )
}
