'use client'

import type { FormEvent } from 'react'
import { FaSearch } from 'react-icons/fa'

interface SearchProps {
  search: string
  setSearch: (value: string) => void
}

export default function Search({ search, setSearch }: SearchProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
  }

  return (
    <div className="w-11/12 justify-center items-center">
      <form onSubmit={handleSubmit} className="flex flex-nowrap">
        <input
          type="text"
          value={search}
          placeholder="Buscar por nome."
          onChange={(e) => setSearch(e.target.value)}
          className="border-2 border-(--primary-color) bg-(--bg-color) p-1 h-6 rounded-sm sm:w-40 w-32 sm:text-[24px] text-[18px]"
        />

        <button type="submit" aria-label="Buscar">
          <FaSearch className="ml-2 text-(--text-color)" />
        </button>
      </form>
    </div>
  )
}
