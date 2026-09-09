import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/server/prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias de expiração da sessão
    updateAge: 60 * 60 * 24, // atualiza a sessão se acessada após 24h (sliding window)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutos de cache para evitar leituras excessivas no MongoDB
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
})

