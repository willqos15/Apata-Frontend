import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { WDXL_Lubrifont_JP_N } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import Navbar from '@/components/Navbar'
import MFooter from '@/components/MFooter'
import ScrollToTop from '@/components/ScrollToTop'

const wdxl = WDXL_Lubrifont_JP_N({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-wdxl',
})

export const metadata: Metadata = {
  title: 'Apata ATM',
  description:
    'APATA - Associação de proteção dos animais e do meio ambiente de Altamira Pará. Adote um amigo.',
  icons: { icon: '/logoapata.svg' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={wdxl.variable}>
      <body>
        <Providers>
          <div id="root">
            <ScrollToTop />
            <Navbar />
            {children}
            <MFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
}
