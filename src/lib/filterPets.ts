import type { Pet, PetFilters } from '@/types'

export const EMPTY_FILTERS: PetFilters = {
  busca: '',
  especie: '',
  sexo: '',
  porte: '',
}

export function filterPets(pets: Pet[], filters: PetFilters): Pet[] {
  const busca = filters.busca.toLowerCase()
  return pets.filter(
    (pet) =>
      (busca === '' || pet.nome.toLowerCase().includes(busca)) &&
      (filters.especie === '' || pet.especie === filters.especie) &&
      (filters.sexo === '' || pet.sexo === filters.sexo) &&
      (filters.porte === '' || pet.porte === filters.porte),
  )
}
