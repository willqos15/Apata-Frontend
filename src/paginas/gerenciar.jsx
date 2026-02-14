import Item from '../components/Item'
import { useNavigate } from 'react-router'
import { DeletaItem, EditarItem, ListarItem } from '../hookapi/fetchItem'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useContext } from 'react'
import { ContextNavbar } from '../ContextNavbar'
import Alert from '../components/alert'
import axios from 'axios'
import loading from '../img/load.gif'

function Gerenciar() {

  
  const { adm, setAdm } = useContext(ContextNavbar)
  const [poup, setPoup] = useState(false)
  const [delid,setDelId] = useState()
  const [delnome,setDelNome] = useState()
  const [estado,setEstado] = useState("ok")

  const { data, isLoading, error } = useQuery({
    queryKey: ["itens"], queryFn: ListarItem
  })



  const navigate = useNavigate()

  const [load, setLoad] = useState(false)
  function Start() {setLoad(true)}
  function End() {setLoad(false)}




  const queryClient = useQueryClient()
  const mutationUpdate = useMutation(
    {
      mutationFn: ({ id, dados }) => EditarItem(id, dados),
      onSuccess: async () => {await queryClient.invalidateQueries(["itens"])
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
    if(!poup) { setDelId(id)
      
    if (Nome.length>35) {setDelNome(Nome.slice(0,35)+"...")}
    else {setDelNome(Nome)}
      return setPoup(true)}
    if(poup){
    mutationDelete.mutate(delid)
    setPoup(false)
    }
  }




    if (isLoading) return  <img src={loading}
            className="pt-16 w-20 mx-auto"/> 
  if (error) return <p>Erro ao carregar itens</p>


  
  return (<>

   {load === true ? <img src={loading} className="pt-15 w-20 mx-auto"/> : <>  
  

    <Alert titulo={"AVISO"}
      descricao={`Tem certeza que deseja excluir o ítem "${delnome}"?`}
      bty={"Sim"} fbty={deletar}
      btn={"Não"} fbtn={() => setPoup(false)}
      estado={poup}
    />




    
    <div className="flex justify-center gap-2 mt-10">

      {data.length <= 0 && <p className="pt-10 text-xl font-bold text-red-800">Nenhum item cadastrado! </p>}
      {data?.map(x => (
        <Item
          Nome={x.nome}
          Img={x.foto}
          Imgtexto="item perdido"
          Descricao={x.descricao}
          local={x.local}
          Dono={x.proprietario}
          Contato={x.contato}
          key={x._id}
          id={x._id}
          admin={true}
          fdel={deletar}
          fatualizar={fatualizar}
          valoresget={data}
          itemstart={Start}
          itemend={End}
         />
      ))}

    </div>

     </> } 
    
  </>)

}
export default Gerenciar