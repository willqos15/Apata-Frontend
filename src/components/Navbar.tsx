'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Alert from './Alert'
import LogoApata from '@/img/logoapata.png'
import { clearToken, getToken, useAuthToken } from '@/lib/auth'
import { verifyToken } from '@/lib/api'

export default function Navbar() {
  const router = useRouter()
  const isAdmin = useAuthToken() !== null
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutAlertOpen, setLogoutAlertOpen] = useState(false)

  async function goToAdminArea() {
    if (!getToken()) {
      router.push('/painel')
      return
    }

    try {
      await verifyToken()
      router.push('/gerenciar')
    } catch {
      clearToken()
      router.push('/painel')
    }
  }

  function logout() {
    clearToken()
    router.push('/painel')
    setLogoutAlertOpen(false)
  }

  function goToPetRegistration() {
    router.push('/cadastro')
  }

  function goToHomePage() {
    router.push('/')
  }

  function toggleMenu() {
    setMenuOpen((open) => !open)
    if (!menuOpen) {
      setTimeout(() => setMenuOpen(false), 18000)
    }
  }

  return (
    <>
      <header className="flex fixed top-0 justify-between items-center w-full max-h-16 bg-white z-100 px-4 sm:pr-8">
        <div onClick={goToHomePage} className="flex flex-row justify-center items-center gap-x-1 cursor-pointer">
          <Image src={LogoApata} alt="APATA" className="h-5 w-auto" />
          <h1 className="text-(--text-color) font-extrabold text-base">APATA</h1>
        </div>

        <nav className="relative flex items-center justify-between">
          <button className="flex flex-col justify-center gap-0.5 sm:hidden p-2" onClick={toggleMenu} aria-label="Abrir menu">
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
              ${menuOpen ? 'max-h-fit opacity-100' : 'max-h-0 opacity-0'}
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

            <li onClick={goToAdminArea} className="navitem">
              Gerenciar
            </li>

            {isAdmin && (
              <>
                <li onClick={goToPetRegistration} className="navitem">
                  Cadastrar
                </li>

                <li onClick={() => setLogoutAlertOpen(true)} className="navitem">
                  Sair
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <Alert
        title="AVISO"
        description="Tem certeza que deseja sair da conta?"
        confirmLabel="Sim"
        onConfirm={logout}
        cancelLabel="Não"
        onCancel={() => setLogoutAlertOpen(false)}
        open={logoutAlertOpen}
      />
    </>
  )
}
