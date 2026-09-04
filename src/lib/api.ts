import axios from 'axios'
import type { LoginPayload, LoginResponse, Pet } from '@/types'
import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_URLAPI

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

export async function updatePet(id: Pet['id'], formData: FormData): Promise<Pet> {
  const { data } = await axios.put<Pet>(`${API_URL}/pets/${id}`, formData, authConfig())
  return data
}

export async function deletePet(id: Pet['id']): Promise<void> {
  await axios.delete(`${API_URL}/pets/${id}`, authConfig())
}

export async function loginAdmin(credentials: LoginPayload): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(`${API_URL}/login`, credentials)
  return data
}

export async function verifyToken(): Promise<void> {
  await axios.get(`${API_URL}/usuarios`, authConfig())
}
