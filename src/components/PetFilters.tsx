'use client'

import Search from './Search'
import type { PetFilters as PetFiltersValue, Sex, Size, Species } from '@/types'

interface PetFiltersProps {
  filters: PetFiltersValue
  onChange: (filters: PetFiltersValue) => void
}

export default function PetFilters({ filters, onChange }: PetFiltersProps) {
  return (
    <>
      <Search search={filters.search} setSearch={(search) => onChange({ ...filters, search })} />

      <div className="flex flex-row gap-2 w-full items-center justify-center sm:text-[18pt] text-[12pt]">
        <div className="flex flex-col text-(--text-color)">
          <label htmlFor="filtro-especie">Espécie</label>
          <select
            id="filtro-especie"
            className="bg-white px-1 rounded-sm text-black border-2 border-(--primary-color) w-fit"
            value={filters.species}
            onChange={(e) => onChange({ ...filters, species: e.target.value as Species | '' })}
          >
            <option value="">Todas</option>
            <option value="cachorro">Cachorro</option>
            <option value="gato">Gato</option>
          </select>
        </div>

        <div className="flex flex-col text-(--text-color)">
          <label htmlFor="filtro-sexo">Sexo</label>
          <select
            id="filtro-sexo"
            className="bg-white px-1 rounded-sm text-black border-2 border-(--primary-color)"
            value={filters.sex}
            onChange={(e) => onChange({ ...filters, sex: e.target.value as Sex | '' })}
          >
            <option value="">Todos</option>
            <option value="macho">Macho</option>
            <option value="femea">Fêmea</option>
          </select>
        </div>

        <div className="flex flex-col text-(--text-color)">
          <label htmlFor="filtro-porte">Porte</label>
          <select
            id="filtro-porte"
            className="bg-white px-1 rounded-sm text-black border-2 border-(--primary-color)"
            value={filters.size}
            onChange={(e) => onChange({ ...filters, size: e.target.value as Size | '' })}
          >
            <option value="">Todos</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </select>
        </div>
      </div>
    </>
  )
}
