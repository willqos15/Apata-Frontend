import axios from "axios"
import { AxiosHeaders } from "axios"

//exporta função pra usar fora desse arquivo
export const ListarItem = async ()=>{
    //pega domente a propriedade {data} retornada do axios
    
    const {data} = await axios.get(`${import.meta.env.VITE_URLAPI}/pets`)
    return data
}

// EDITAR (com ou sem imagem)
export const EditarItem = async (id, dados) => {
  const token = localStorage.getItem("token")

  const config = {
    headers: {
      authorization: `Bearer ${token}`
    }
  }

  const { data } = await axios.put(
    `${import.meta.env.VITE_URLAPI}/pets/${id}`,
    dados,
    config
  )

  return data
}

export const DeletaItem = async (id)=> {
    const token = localStorage.getItem("token")
    const {data} = await axios.delete(`${import.meta.env.VITE_URLAPI}/pets/${id}`,
        {headers: {authorization: `Bearer ${token}`}})
    return data
}

export const Loginadm = async (dados) => {
    const {data} = await axios.post(`${import.meta.env.VITE_URLAPI}/login`,dados)
    return data
}