export type Species = 'cachorro' | 'gato'
export type Sex = 'macho' | 'femea'
export type Size = 'pequeno' | 'medio' | 'grande'

export interface Pet {
  id: string
  nome: string
  foto: string | null
  especie: Species
  sexo: Sex
  porte: Size
  descricao: string
  contato: string | null
}

export interface PetFormValues {
  nome: string
  descricao: string
  especie: Species | ''
  porte: Size | ''
  sexo: Sex | ''
  contato: string
}

export interface PetFilters {
  search: string
  species: Species | ''
  sex: Sex | ''
  size: Size | ''
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface UpdateResult {
  count: number
}
