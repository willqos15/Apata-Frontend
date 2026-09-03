'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Alert from './Alert'
import LogoApata from '@/img/logoapata.png'
import { clearToken, getToken, useAuthToken } from '@/lib/auth'
import { verificarToken } from '@/lib/api'

export default function Navbar() {
  const router = useRouter()
  const adm = useAuthToken() !== null
  const [openmenuham, setOpenMenuHam] = useState(false)
  const [poup, setPoup] = useState(false)

  async function telaadm() {
    if (!getToken()) {
      router.push('/painel')
      return
    }

    try {
      await verificarToken()
      router.push('/gerenciar')
    } catch {
      clearToken()
      router.push('/painel')
    }
  }

  function sair() {
    clearToken()
    router.push('/painel')
    setPoup(false)
  }

  function paginacriar() {
    router.push('/cadastro')
  }

  function paginainicial() {
    router.push('/')
  }

  function alternarMenu() {
    setOpenMenuHam((aberto) => !aberto)
    if (!openmenuham) {
      setTimeout(() => setOpenMenuHam(false), 18000)
    }
  }

  return (
    <>
      <header className="flex fixed top-0 justify-between items-center w-full max-h-16 bg-white z-100 px-4 sm:pr-8">
        <div onClick={paginainicial} className="flex flex-row justify-center items-center gap-x-1 cursor-pointer">
          <Image src={LogoApata} alt="APATA" className="h-5 w-auto" />
          <h1 className="text-(--text-color) font-extrabold text-base">APATA</h1>
        </div>

        <nav className="relative flex items-center justify-between">
          <button className="flex flex-col justify-center gap-0.5 sm:hidden p-2" onClick={alternarMenu} aria-label="Abrir menu">
            <span className="w-4 h-0.5 bg-(--text-color) transition-all" />
            <span className="w-4 h-0.5 bg-(--text-color) transition-all" />
            <span className="w-4 h-0.5 bg-(--text-color) transition-all" />
          </button>

          <ul
            className={`
              absolute top-full right-0 mt-0
              w-fit bg-white
              overflow-hidden
              transition-all duration-300
              ${openmenuham ? 'max-h-fit opacity-100' : 'max-h-0 opacity-0'}
              flex flex-col
              sm:gap-2 gap-0 px-2 pb-1 rounded-b-sm
              sm:static sm:mt-0 sm:w-auto sm:bg-transparent
              sm:max-h-none sm:opacity-100
              sm:flex-row sm:p-0
              sm:text-sm text-[15pt]
            `}
          >
            <li className="navitem">
              <Link href="/">Início</Link>
            </li>

            <li onClick={telaadm} className="navitem">
              Gerenciar
            </li>

            {adm && (
              <>
                <li onClick={paginacriar} className="navitem">
                  Cadastrar
                </li>

                <li onClick={() => setPoup(true)} className="navitem">
                  Sair
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <Alert
        titulo="AVISO"
        descricao="Tem certeza que deseja sair da conta?"
        bty="Sim"
        fbty={sair}
        btn="Não"
        fbtn={() => setPoup(false)}
        estado={poup}
      />
    </>
  )
}
