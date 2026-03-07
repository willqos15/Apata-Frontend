import { useContext, useState} from "react"
import { ContextNavbar } from "../ContextNavbar"
import Item from "../components/Item"
import { useNavigate } from 'react-router-dom'


function PageBusca(){
    const navigate = useNavigate()
    const {itens,setItens,barraBusca,setBarraBusca} = useContext(ContextNavbar)

    
    function voltar(){navigate("/")}

    return(<>

    {!itens && <>  <p className="pt-10 text-xl font-bold text-red-800">
        Nenhum item encontrado!
        </p>
        <input className="font-sans text-xl font-bold py-1.25 px-2.5 self-center rounded-xl mt-5 mb-1.25 bg-(--text-color) text-white transition duration-500 border-0 cursor-pointer" onClick={voltar} type="button" value="Voltar a página inicial" />
        </>}

    {itens?.map(x=> (
        <Item
     Nome= {x.nome}
     Img= {x.foto}
     Imgtexto = "item perdido"
     Descricao= {x.descricao}
     local= {x.local}
     Dono = {x.proprietario}
     Contato={x.contato}
     key={x._id}
     id={x._id}
     admin={false}/>
    ))}
    


    </>)
}

export default PageBusca