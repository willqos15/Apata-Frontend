import type { Pet, PetFilters } from '@/types'

export const EMPTY_FILTERS: PetFilters = {
  search: '',
  species: '',
  sex: '',
  size: '',
}

export function filterPets(pets: Pet[], filters: PetFilters): Pet[] {
  const search = filters.search.toLowerCase()
  return pets.filter(
    (pet) =>
      (search === '' || pet.nome.toLowerCase().includes(search)) &&
      (filters.species === '' || pet.especie === filters.species) &&
      (filters.sex === '' || pet.sexo === filters.sex) &&
      (filters.size === '' || pet.porte === filters.size),
  )
}
