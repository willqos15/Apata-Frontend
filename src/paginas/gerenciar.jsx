import Item from '../components/Item'
import { DeletaItem, EditarItem, ListarItem } from '../hookapi/fetchItem'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useContext } from 'react'
import { ContextNavbar } from '../ContextNavbar'
import Alert from '../components/alert'
import loading from '../img/load.gif'
import Search from '../components/search'

function Gerenciar() {


  const { adm, setAdm } = useContext(ContextNavbar)
  const [poup, setPoup] = useState(false)
  const [delid, setDelId] = useState()
  const [delnome, setDelNome] = useState()
  const [estado, setEstado] = useState("ok")

  const { data, isLoading, error } = useQuery({
    queryKey: ["itens"], queryFn: ListarItem
  })





  const [load, setLoad] = useState(false)
  const [busca, setBusca] = useState("")
  function Start() { setLoad(true) }
  function End() { setLoad(false) }




  const queryClient = useQueryClient()
  const mutationUpdate = useMutation(
    {
      mutationFn: ({ id, dados }) => EditarItem(id, dados),
      onSuccess: async () => {
        await queryClient.invalidateQueries(["itens"])
        setLoad(false)

      }
    }
  )

  function fatualizar(id, dados) {
    setEstado("carregando")
    mutationUpdate.mutateAsync({ id, dados })

  }




  function poupdel() {
    setPoup(true)
  }

  const mutationDelete = useMutation(
    {
      mutationFn: (id) => DeletaItem(id),
      onSuccess: () => queryClient.invalidateQueries(["itens"])
    }
  )
  function deletar(id, Nome) {
    if (!poup) {
      setDelId(id)

      if (Nome.length > 35) { setDelNome(Nome.slice(0, 35) + "...") }
      else { setDelNome(Nome) }
      return setPoup(true)
    }
    if (poup) {
      mutationDelete.mutate(delid)
      setPoup(false)
    }
  }




  // if (isLoading) return <img src={loading}
  //   className="pt-16 w-20 mx-auto" />
  // if (error) return <p>Erro ao carregar itens</p>



  const [filtroEspecie, setFiltroEspecie] = useState("")
  const [filtroSexo, setFiltroSexo] = useState("")
  const [filtroPorte, setFiltroPorte] = useState("")


  const petsFiltrados = Array.isArray(data)
    ? data.filter((pet) => {
      return (
        (busca === "" || pet.nome.toLowerCase().includes(busca.toLowerCase())) &&
        (filtroEspecie === "" || pet.especie === filtroEspecie) &&
        (filtroSexo === "" || pet.sexo === filtroSexo) &&
        (filtroPorte === "" || pet.porte === filtroPorte)
      )
    })
    : []



  return (<div className='flex flex-col justify-start items-center'>

    {load === true ? <img src={loading} className="m-16 w-20 mx-auto" /> : <>


      <Alert titulo={"AVISO"}
        descricao={`Tem certeza que deseja excluir o "${delnome}"?`}
        bty={"Sim"} fbty={deletar}
        btn={"Não"} fbtn={() => setPoup(false)}
        estado={poup}
      />



      {/* {data?.length <= 0 && <p className="pt-10 text-xl font-bold">Nenhum item cadastrado! </p>} */}



      <section className="flex flex-wrap m-4 gap-2 justify-center items-start">


        <div className='flex flex-col p-4 flex-wrap gap-2 w-fit items-center justify-center bg-(--bg-color2)'>

          <p className='text-(--text-color)'>Filtrar</p>
          <Search busca={busca} setBusca={setBusca} />

          <div className='flex flex-row sm:text-[18pt] text-[12pt] justify-center items-center gap-2'>

            <div className='flex flex-col text-(--text-color)'>
              <label>Espécie</label>
              <select
                className="bg-white px-1 rounded-sm text-black border-2 border-(--primary-color) w-fit"
                value={filtroEspecie}
                onChange={(e) => setFiltroEspecie(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="cachorro">Cachorro</option>
                <option value="gato">Gato</option>
              </select>
            </div>


            <div className='flex flex-col text-(--text-color)'>
              <label>Sexo</label>
              <select
                className="bg-white px-1 rounded-sm text-black border-2 border-(--primary-color)"
                value={filtroSexo}
                onChange={(e) => setFiltroSexo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </div>


            <div className='flex flex-col text-(--text-color)'>
              <label>Porte</label>
              <select
                className="bg-white px-1 rounded-sm text-black border-2 border-(--primary-color)"
                value={filtroPorte}
                onChange={(e) => setFiltroPorte(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="pequeno">Pequeno</option>
                <option value="medio">Médio</option>
                <option value="grande">Grande</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="items-start flex flex-wrap justify-center gap-2 mb-4">

        {petsFiltrados?.map((pet) => (
          <Item
            key={pet.id}
            id={pet.id}
            Nome={pet.nome}
            Img={pet.foto}
            especie={pet.especie}
            Descricao={pet.descricao}
            porte={pet.porte}
            sexo={pet.sexo}
            contato={pet.contato}
            admin={true}
            fdel={deletar}
            fatualizar={fatualizar}
            valoresget={data}
            itemstart={Start}
            itemend={End}
          />
        ))}



        {petsFiltrados?.length <= 0 &&
          <p className='text-[18pt] text-(--text-color)'>Nenhum animal encontrado.</p>}
      </div>


    </>}

  </div>)

}
export default Gerenciar