'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Item from './Item'
import PetFilters from './PetFilters'
import PetsLoadingMessage from './PetsLoadingMessage'
import { listarPets } from '@/lib/api'
import { EMPTY_FILTERS, filterPets } from '@/lib/filterPets'
import type { Pet, PetFilters as PetFiltersValue } from '@/types'

interface HomePetsProps {
  /** Pets fetched on the server; null when the server fetch failed/timed out. */
  initialPets: Pet[] | null
}

export default function HomePets({ initialPets }: HomePetsProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['itens'],
    queryFn: listarPets,
    initialData: initialPets ?? undefined,
    // Server data is fresh per request; avoid an immediate duplicate client fetch,
    // but refetch on focus/remount after 30 s and on invalidation from /gerenciar.
    staleTime: 30_000,
  })

  const [filters, setFilters] = useState<PetFiltersValue>(EMPTY_FILTERS)
  const petsFiltrados = filterPets(data ?? [], filters)

  return (
    <>
      <div className="w-full [@media(min-width:1100px)]:order-1 order-1">
        <p className="text-(--text-color)">Adotar um animal:</p>

        {!isPending && !isError && (
          <div className="bg-(--bg-color2) w-fit rounded-sm p-4 mx-auto items-center flex flex-col mb-2">
            <PetFilters filters={filters} onChange={setFilters} />
          </div>
        )}
      </div>

      <section
        className="scroll-mt-8 [@media(min-width:1100px)]:order-3 order-2 gap-2 xl:w-97.5 items-start flex flex-wrap justify-center mb-4"
        id="adotar"
      >
        {isError && !isPending && (
          <p className="text-[18pt] font-bold text-red-800 w-full"> Algo deu errado. Tente novamente.</p>
        )}

        {!isError && !isPending && petsFiltrados.length <= 0 && (
          <p className="text-[18pt] text-(--text-color) w-full">Nenhum animal encontrado.</p>
        )}

        {isPending && <PetsLoadingMessage />}

        {!isPending && petsFiltrados.map((pet) => <Item key={pet.id} pet={pet} admin={false} />)}
      </section>
    </>
  )
}
