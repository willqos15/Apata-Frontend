'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import Item from '@/components/Item'
import PetFilters from '@/components/PetFilters'
import Spinner from '@/components/Spinner'
import { deletarPet, editarPet, listarPets } from '@/lib/api'
import { EMPTY_FILTERS, filterPets } from '@/lib/filterPets'
import type { Pet, PetFilters as PetFiltersValue } from '@/types'

interface AlvoDelete {
  id: Pet['id']
  nome: string
}

export default function GerenciarPage() {
  const queryClient = useQueryClient()

  const [poup, setPoup] = useState(false)
  const [alvoDelete, setAlvoDelete] = useState<AlvoDelete | null>(null)
  const [load, setLoad] = useState(false)
  const [filters, setFilters] = useState<PetFiltersValue>(EMPTY_FILTERS)

  const { data } = useQuery({ queryKey: ['itens'], queryFn: listarPets })

  const mutationUpdate = useMutation({
    mutationFn: ({ id, dados }: { id: Pet['id']; dados: FormData }) => editarPet(id, dados),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['itens'] })
      setLoad(false)
    },
  })

  const mutationDelete = useMutation({
    mutationFn: (id: Pet['id']) => deletarPet(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['itens'] }),
  })

  function atualizar(id: Pet['id'], dados: FormData): Promise<Pet> {
    return mutationUpdate.mutateAsync({ id, dados })
  }

  function pedirDelete(id: Pet['id'], nome: string) {
    setAlvoDelete({ id, nome: nome.length > 35 ? `${nome.slice(0, 35)}...` : nome })
    setPoup(true)
  }

  function confirmarDelete() {
    if (alvoDelete) mutationDelete.mutate(alvoDelete.id)
    setPoup(false)
  }

  const petsFiltrados = filterPets(data ?? [], filters)

  return (
    <div className="flex flex-col justify-start items-center">
      <a
        href="https://docs.google.com/spreadsheets/d/1mVn88CCj545VMwyB_zKJeR9mQrwkwHTB9OgM_MO7cm8/edit?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button name={<p className="flex whitespace-nowrap items-center justify-center gap-1"> Contato de Doadores</p>} size={15} />
      </a>

      {load ? (
        <Spinner className="m-16 mx-auto" />
      ) : (
        <>
          <Alert
            titulo="AVISO"
            descricao={`Tem certeza que deseja excluir o "${alvoDelete?.nome ?? ''}"?`}
            bty="Sim"
            fbty={confirmarDelete}
            btn="Não"
            fbtn={() => setPoup(false)}
            estado={poup}
          />

          <section className="flex flex-wrap m-4 gap-2 justify-center items-start">
            <div className="flex flex-col p-4 flex-wrap gap-2 w-fit items-center justify-center bg-(--bg-color2)">
              <p className="text-(--text-color)">Filtrar</p>
              <PetFilters filters={filters} onChange={setFilters} />
            </div>
          </section>

          <div className="items-start flex flex-wrap justify-center gap-2 mb-4">
            {petsFiltrados.map((pet) => (
              <Item
                key={pet.id}
                pet={pet}
                admin={true}
                onDelete={pedirDelete}
                onUpdate={atualizar}
                onStart={() => setLoad(true)}
                onEnd={() => setLoad(false)}
              />
            ))}

            {petsFiltrados.length <= 0 && <p className="text-[18pt] text-(--text-color)">Nenhum animal encontrado.</p>}
          </div>
        </>
      )}
    </div>
  )
}
