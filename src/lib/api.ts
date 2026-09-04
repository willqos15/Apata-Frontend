import axios from 'axios'
import type { LoginPayload, LoginResponse, Pet, UpdateResult } from '@/types'
import { getToken } from '@/lib/auth'

const API_URL = '/api'

function authConfig() {
  return { headers: { authorization: `Bearer ${getToken() ?? ''}` } }
}

export async function listPets(): Promise<Pet[]> {
  const { data } = await axios.get<Pet[]>(`${API_URL}/pets`)
  return data
}

export async function createPet(formData: FormData): Promise<Pet> {
  const { data } = await axios.post<Pet>(`${API_URL}/pets`, formData, authConfig())
  return data
}

export async function updatePet(id: Pet['id'], formData: FormData): Promise<UpdateResult> {
  const { data } = await axios.put<UpdateResult>(`${API_URL}/pets/${id}`, formData, authConfig())
  return data
}

export async function deletePet(id: Pet['id']): Promise<void> {
  await axios.delete(`${API_URL}/pets/${id}`, authConfig())
}

export async function loginAdmin(credentials: LoginPayload): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(`${API_URL}/usuarios/login`, credentials)
  return data
}

export async function logoutAdmin(): Promise<void> {
  await axios.post(`${API_URL}/usuarios/logout`)
}

export async function verifyToken(): Promise<void> {
  await axios.post(`${API_URL}/usuarios/atualizatoken`, null, authConfig())
}
