'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import Item from '@/components/Item'
import PetFilters from '@/components/PetFilters'
import Spinner from '@/components/Spinner'
import { deletePet, listPets, updatePet } from '@/lib/api'
import { EMPTY_FILTERS, filterPets } from '@/lib/filterPets'
import type { Pet, PetFilters as PetFiltersValue } from '@/types'

interface DeleteTarget {
  id: Pet['id']
  name: string
}

export default function GerenciarPage() {
  const queryClient = useQueryClient()

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState<PetFiltersValue>(EMPTY_FILTERS)

  const { data } = useQuery({ queryKey: ['itens'], queryFn: listPets })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: Pet['id']; formData: FormData }) => updatePet(id, formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['itens'] })
      setSaving(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: Pet['id']) => deletePet(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['itens'] }),
  })

  function handleUpdate(id: Pet['id'], formData: FormData): Promise<Pet> {
    return updateMutation.mutateAsync({ id, formData })
  }

  function requestDelete(id: Pet['id'], name: string) {
    setDeleteTarget({ id, name: name.length > 35 ? `${name.slice(0, 35)}...` : name })
    setDeleteAlertOpen(true)
  }

  function confirmDelete() {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
    setDeleteAlertOpen(false)
  }

  const filteredPets = filterPets(data ?? [], filters)

  return (
    <div className="flex flex-col justify-start items-center">
      <a
        href="https://docs.google.com/spreadsheets/d/1mVn88CCj545VMwyB_zKJeR9mQrwkwHTB9OgM_MO7cm8/edit?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button name={<p className="flex whitespace-nowrap items-center justify-center gap-1"> Contato de Doadores</p>} size={15} />
      </a>

      {saving ? (
        <Spinner className="m-16 mx-auto" />
      ) : (
        <>
          <Alert
            title="AVISO"
            description={`Tem certeza que deseja excluir o "${deleteTarget?.name ?? ''}"?`}
            confirmLabel="Sim"
            onConfirm={confirmDelete}
            cancelLabel="Não"
            onCancel={() => setDeleteAlertOpen(false)}
            open={deleteAlertOpen}
          />

          <section className="flex flex-wrap m-4 gap-2 justify-center items-start">
            <div className="flex flex-col p-4 flex-wrap gap-2 w-fit items-center justify-center bg-(--bg-color2)">
              <p className="text-(--text-color)">Filtrar</p>
              <PetFilters filters={filters} onChange={setFilters} />
            </div>
          </section>

          <div className="items-start flex flex-wrap justify-center gap-2 mb-4">
            {filteredPets.map((pet) => (
              <Item
                key={pet.id}
                pet={pet}
                admin={true}
                onDelete={requestDelete}
                onUpdate={handleUpdate}
                onStart={() => setSaving(true)}
                onEnd={() => setSaving(false)}
              />
            ))}

            {filteredPets.length <= 0 && <p className="text-[18pt] text-(--text-color)">Nenhum animal encontrado.</p>}
          </div>
        </>
      )}
    </div>
  )
}
