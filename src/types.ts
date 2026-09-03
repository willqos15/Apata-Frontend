export type Especie = 'cachorro' | 'gato'
export type Sexo = 'macho' | 'femea'
export type Porte = 'pequeno' | 'medio' | 'grande'

/** A pet as returned by GET /pets. */
export interface Pet {
  /** ASSUMPTION: the API returns `id` (used as React key and in /pets/:id URLs). If a real response shows a numeric id, change this to `number` — nothing else needs to change. */
  id: string
  nome: string
  /** Absolute URL of the photo (remote host, see D6). */
  foto: string
  especie: Especie
  sexo: Sexo
  porte: Porte
  descricao: string
  /** Phone; may arrive formatted. Always strip non-digits before use. */
  contato: string
}

/** react-hook-form values for create/edit. Empty string = "Selecione". */
export interface PetFormValues {
  nome: string
  descricao: string
  especie: Especie | ''
  porte: Porte | ''
  sexo: Sexo | ''
  contato: string
}

export interface PetFilters {
  busca: string
  especie: Especie | ''
  sexo: Sexo | ''
  porte: Porte | ''
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}
