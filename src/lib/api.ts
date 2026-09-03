import axios from 'axios'
import type { LoginPayload, LoginResponse, Pet } from '@/types'
import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_URLAPI

function authConfig() {
  return { headers: { authorization: `Bearer ${getToken() ?? ''}` } }
}

export async function listarPets(): Promise<Pet[]> {
  const { data } = await axios.get<Pet[]>(`${API_URL}/pets`)
  return data
}

export async function criarPet(dados: FormData): Promise<Pet> {
  const { data } = await axios.post<Pet>(`${API_URL}/pets`, dados, authConfig())
  return data
}

export async function editarPet(id: Pet['id'], dados: FormData): Promise<Pet> {
  const { data } = await axios.put<Pet>(`${API_URL}/pets/${id}`, dados, authConfig())
  return data
}

export async function deletarPet(id: Pet['id']): Promise<void> {
  await axios.delete(`${API_URL}/pets/${id}`, authConfig())
}

export async function loginAdm(dados: LoginPayload): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(`${API_URL}/login`, dados)
  return data
}

/** Throws (401/403) when the stored token is no longer valid. */
export async function verificarToken(): Promise<void> {
  await axios.get(`${API_URL}/usuarios`, authConfig())
}
