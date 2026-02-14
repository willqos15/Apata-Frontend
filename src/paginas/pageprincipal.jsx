import Item from '../components/Item'
import { useQuery } from '@tanstack/react-query';
import { ListarItem } from '../hookapi/fetchItem';
import loading from '../img/load.gif'
import imagemvolun from '../img/QRVoluntario.jpeg'
import imagempix from '../img/QRPIX.jpeg'
import Hero from '../components/hero';
import CardAside from '../components/cardaside';

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
        className="pt-15 w-20" />
      <div className="bg-[rgb(252,255,177)] rounded-2xl text-xl p-2.5 w-1/2 text-left mx-auto mb-7.5">
        <h3 className="text-center m-0 p-0">Aviso: Versão de Teste</h3>
        <p>
          <strong>Observação:</strong> o site pode demorar a carregar no primeiro acesso, pois a hospedagem do servidor e do banco de dados está sendo feita de forma gratuita.
        </p>
      </div>
    </>
  }

  if (error) return <p className="pt-10 text-xl font-bold text-red-800">Erro ao carregar itens</p>


  return (<> <Hero />

    <h3 className='mt-15 text-(--text-color)'>
      Adote um amigo:
    </h3>

    {data?.length <= 0 &&
      <p className="pt-10 text-xl font-bold text-(--text-color)"
      >Nenhum item cadastrado! </p>
    }

    <div className="flex justify-between">



      <aside className="flex flex-col gap-5 px-2">
        <CardAside title="DOE VIA PIX"
          image={imagempix} text="19.552.047/0001-43" />

        <CardAside title="VOLUNTARIE-SE"
          image={imagemvolun} text="entre no grupo do Whatsapp" />

     
      </aside>



      <section>

        <div className="grid grid-flow-col auto-cols-max gap-3 justify-center">





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
      </section>

      <aside className='flex flex-col gap-5 px-5'>


        <CardAside title="RAÇÃO"
          content={
            <ul className='text-[12pt] text-left'>
              <li><strong>JAPI</strong> - Cachorros</li>
              <li><strong>GRAN TURIN</strong> - Gatos </li>
              <li><strong>MAGNUS SALMÃO</strong> - Gatos</li>
            </ul>} />

        <CardAside title="BAZAR"
          text="Doe roupas, livros, etc..." />

             <CardAside title="FARMÁCIA"
          text="Doe remédios" />


      </aside>


    </div> </>)
}
export default PagePrincipal