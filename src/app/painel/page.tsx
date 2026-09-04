'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import Button from '@/components/Button'
import Spinner from '@/components/Spinner'
import { loginAdmin } from '@/lib/api'
import { setToken } from '@/lib/auth'
import type { LoginPayload, LoginResponse } from '@/types'

type LoginStatus = 'deslogado' | 'carregando' | 'logado' | 'erro'

export default function PainelPage() {
  const router = useRouter()
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('deslogado')

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginPayload>({ mode: 'onChange' })

  const loginMutation = useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      setToken(data.token)
      setLoginStatus('logado')
      router.push('/gerenciar')
    },
    onError: () => {
      setLoginStatus('erro')
    },
  })

  function login(credentials: LoginPayload) {
    setLoginStatus('carregando')
    loginMutation.mutate(credentials)
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
            {loginMutation.isError && <p className="plogin">Login ou Senha incorreto!</p>}

            <Button name="Entrar" type="submit" size={15} className="text-[10pt] mt-2" />
          </form>
        </div>
      )}
    </div>
  )
}
