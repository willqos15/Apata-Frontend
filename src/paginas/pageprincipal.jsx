import Item from '../components/Item'
import { useQuery } from '@tanstack/react-query';
import { ListarItem } from '../hookapi/fetchItem';
import styles from "./pageprincipal.module.css"
import loading from '../img/load.gif'
import imagemvolun from '../img/QRVoluntario.jpeg'
import imagempix from '../img/QRPIX.jpeg'

function PagePrincipal() {

  //puxa apenas as propriedades desejadas do query
  //data são os dados pegos do QueryFn
  const { data, isLoading, error } = useQuery({
    queryKey: ["itens"],
    queryFn: ListarItem
  })

  if (isLoading) {
    
    return <>
    <img src={loading}
      className={styles.imgload}/>
      <div className={styles.alertateste}>
      <h3 className={styles.alertacentro}>Aviso: Versão de Teste</h3>
      <p>
        <strong>Observação:</strong> o site pode demorar a carregar no primeiro acesso, pois a hospedagem do servidor e do banco de dados está sendo feita de forma gratuita.
      </p>
    </div>
    </>
    }

  if (error) return <p className={styles.paviso}>Erro ao carregar itens</p>


  //  const [itens,setItens] = useState([]) 
  //   useEffect(()=>{
  //   axios.get("http://localhost:3000/perdidos")
  //   .then((resposta)=>{
  //     setItens(resposta.data)
  //     console.log(resposta.data)
  //   })
  //   .catch(erro=>console.log("erro: "+erro))
  // },[])



  return (<div className={styles.maintela}>

    <aside>
    <div className={styles.cardaside}>
      <h3>QR CODE PIX</h3>
      <img src={imagempix}/>
      <p>em construção...</p>
    </div>

    <div className={styles.cardaside}>
      <h3>Seja um voluntário</h3>
      <img src={imagemvolun}/>
      <p>grupo do Whatsapp</p>
    </div>

    <div className={styles.cardaside}>
      <h3>Doação Farmácia</h3>
      <p>em construção...</p>
    </div>
    </aside>

    <div className={styles.container}>







      {data?.length <= 0 &&
        <p className={styles.pavisook}>Nenhum item cadastrado! </p>
      }

      {data?.map(x => (
        <Item
          Nome={'Cachorro'}
          Img={'https://jblitoral.com.br/wp-content/uploads/2024/02/foto-doguinho-1.jpeg?v=09.02.4.56.06'}
          Imgtexto="item perdido"
          Descricao={x.descricao}
          local={x.local}
          Dono={x.proprietario}
          Contato={x.contato}
          key={x._id}
          id={x._id}
          admin={false} />
      ))}

    </div>

      <aside>
    <div className={styles.cardaside}>
      <h3>Doação de Ração</h3>
      <ul>
        <li>JAPI - Cachorros</li>
        <li>GRAN TURIN - Gatos </li>
        <li>MAGNUS SALMÃO - Gatos</li>
      </ul>
      <p>em contrsução...</p>
    </div>

    <div className={styles.cardaside}>
      <h3>Bazar da Apata</h3>
      <p>em construção...</p>
    </div>
    </aside>


  </div>)
}
export default PagePrincipal