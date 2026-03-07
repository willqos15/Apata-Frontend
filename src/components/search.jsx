import { useState } from "react"
import axios from "axios"
import { FaSearch } from "react-icons/fa";

export default function Search({ busca, setBusca }) {

 
  const [itens, setItens] = useState([])

  async function pesquisar(e) {
    e.preventDefault()

    const nome = barraBusca.trim()

    if (!nome) return

    try {

      const resposta = await axios.get(
        `${import.meta.env.VITE_URLAPI}/pets/busca?nome=${nome}`
      )

      setItens(resposta.data)

    } catch (erro) {

      if (erro.response?.status === 404) {
        setItens([])
      } else {
        setItens([])
      }

    }
  }

  return (
    <div className="flex w-full justify-center items-center">
      <form onSubmit={pesquisar}>
         <input
      type="text"
      value={busca}
      placeholder="Buscar por nome."
      onChange={(e) => setBusca(e.target.value)}
      className="border-2 border-(--primary-color) bg-(--bg-color) p-1 h-6 rounded-sm w-fit"
    />

        <button type="submit">
          <FaSearch className="ml-2 text-(--text-color)"/>
        </button>
      </form>
    </div>
  )
}