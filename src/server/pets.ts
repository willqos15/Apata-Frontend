import type { Pet as PetRecord, Prisma } from '@prisma/client'
import { prisma } from '@/server/prisma'

export const ACTIVE_PETS_WHERE: Prisma.PetWhereInput = {
  OR: [{ deleted_at: null }, { deleted_at: { isSet: false } }],
}

export function findActivePets(): Promise<PetRecord[]> {
  return prisma.pet.findMany({ where: ACTIVE_PETS_WHERE, orderBy: { createdAt: 'desc' } })
}
