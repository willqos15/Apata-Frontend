import { useContext, useState} from "react"
import { ContextNavbar } from "../ContextNavbar"
import Item from "../components/Item"
import styles from "./pagebusca.module.css"
import { useNavigate } from "react-router"


function PageBusca(){
    const navigate = useNavigate()
    const {itens,setItens,barraBusca,setBarraBusca} = useContext(ContextNavbar)

    
    function voltar(){navigate("/")}

    return(<>

    {!itens && <>  <p className={styles.paviso}>
        Nenhum item encontrado!
        </p>
        <input className={styles.btnvoltar} onClick={voltar} type="button" value="Voltar a página inicial" />
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