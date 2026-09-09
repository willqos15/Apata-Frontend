import axios from 'axios'
import type { Pet, UpdateResult } from '@/types'

const API_URL = '/api'

export async function listPets(): Promise<Pet[]> {
  const { data } = await axios.get<Pet[]>(`${API_URL}/pets`)
  return data
}

export async function createPet(formData: FormData): Promise<Pet> {
  const { data } = await axios.post<Pet>(`${API_URL}/pets`, formData)
  return data
}

export async function updatePet(id: Pet['id'], formData: FormData): Promise<UpdateResult> {
  const { data } = await axios.put<UpdateResult>(`${API_URL}/pets/${id}`, formData)
  return data
}

export async function deletePet(id: Pet['id']): Promise<void> {
  await axios.delete(`${API_URL}/pets/${id}`)
}
