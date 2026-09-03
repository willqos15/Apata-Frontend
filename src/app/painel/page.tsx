'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import Button from '@/components/Button'
import Spinner from '@/components/Spinner'
import { loginAdm } from '@/lib/api'
import { setToken } from '@/lib/auth'
import type { LoginPayload, LoginResponse } from '@/types'

type EstadoLogin = 'deslogado' | 'carregando' | 'logado' | 'erro'

export default function PainelPage() {
  const router = useRouter()
  const [estlogin, setEstLogin] = useState<EstadoLogin>('deslogado')

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginPayload>({ mode: 'onChange' })

  const mutationLogin = useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: loginAdm,
    onSuccess: (data) => {
      setToken(data.token)
      setEstLogin('logado')
      router.push('/gerenciar')
    },
    onError: () => {
      setEstLogin('erro')
    },
  })

  function login(dados: LoginPayload) {
    setEstLogin('carregando')
    mutationLogin.mutate(dados)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {estlogin === 'carregando' ? (
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
            {mutationLogin.isError && <p className="plogin">Login ou Senha incorreto!</p>}

            <Button name="Entrar" type="submit" size={15} className="text-[10pt] mt-2" />
          </form>
        </div>
      )}
    </div>
  )
}
