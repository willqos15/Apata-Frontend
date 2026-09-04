import { sign, verify } from 'jsonwebtoken'

const EXPIRES_IN = '7d'

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET não definido')
  return secret
}

export function signToken(id: string): string {
  return sign({ id }, jwtSecret(), { expiresIn: EXPIRES_IN })
}

export function verifyToken(token: string): string {
  const decoded = verify(token, jwtSecret())
  if (typeof decoded === 'string' || typeof decoded.id !== 'string') throw new Error('Token inválido')
  return decoded.id
}
