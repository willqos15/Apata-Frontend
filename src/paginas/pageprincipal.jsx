import Item from '../components/Item'
import { useQuery } from '@tanstack/react-query';
import { ListarItem } from '../hookapi/fetchItem';
import loading from '../img/load.gif'
import imagemvolun from '../img/QRVoluntario.jpeg'
import imagempix from '../img/QRPIX.jpeg'
import Hero from '../components/hero';
import CardAside from '../components/cardaside';
import Button from '../components/button';
import MFooter from '../components/mfooter';
import About from '../components/about';
import { IoLogoWhatsapp } from "react-icons/io";
import { useState } from 'react';

function PagePrincipal() {

  //puxa apenas as propriedades desejadas do query
  //data são os dados pegos do QueryFn
  const { data, isLoading, error } = useQuery({
    queryKey: ["itens"],
    queryFn: ListarItem
  })

  const [filtroEspecie, setFiltroEspecie] = useState("")
  const [filtroSexo, setFiltroSexo] = useState("")
  const [filtroPorte, setFiltroPorte] = useState("")


  const petsFiltrados = data?.filter((pet) => {
    return (
      (filtroEspecie === "" || pet.especie === filtroEspecie) &&
      (filtroSexo === "" || pet.sexo === filtroSexo) &&
      (filtroPorte === "" || pet.porte === filtroPorte)
    )
  })



  return (<div> <Hero />

    <About />

    <div className="flex flex-wrap flex-row gap-2 justify-center w-full overflow-x-hidden">
     

      <div className='w-full md:order-1 order-3'>
        <p className='text-(--text-color) '>Adotar um animal:</p>

        {!isLoading &&
          <div className=' bg-(--bg-color2) w-fit rounded-sm p-2 mx-auto  items-center flex flex-col mb-2'>


            <div className='flex flex-row gap-2 items-center justify-center'>

              <div className='flex flex-col text-(--text-color) text-[18pt]'>
                <label>Espécie</label>
                <select
                  className="bg-white text-[16pt] px-1 rounded-sm text-black border-2 border-(--primary-color) w-fit"
                  value={filtroEspecie}
                  onChange={(e) => setFiltroEspecie(e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="cachorro">Cachorro</option>
                  <option value="gato">Gato</option>
                </select>
              </div>


              <div className='flex flex-col text-(--text-color) text-[16pt]'>
                <label>Sexo</label>
                <select
                  className="bg-white text-[16pt] px-1 rounded-sm text-black border-2 border-(--primary-color)"
                  value={filtroSexo}
                  onChange={(e) => setFiltroSexo(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="macho">Macho</option>
                  <option value="femea">Fêmea</option>
                </select>
              </div>


              <div className='flex flex-col text-(--text-color) text-[16pt]'>
                <label>Porte</label>
                <select
                  className="bg-white text-[16pt] px-1 rounded-sm text-black border-2 border-(--primary-color)"
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

        }
        

         {data?.length <= 0 &&
          <p className="text-[18pt] text-(--text-color)"
          >Nenhum animal cadastrado! </p>}

        {error && <p className="text-[18pt] font-bold text-red-800"> Algo deu errado. Tente novamente.</p>}





        {isLoading && <div className='flex flex-col justify-center items-center mx-2'>

          <img src={loading} className="pt-15 w-20 h-auto" />

          <div className="bg-[rgb(252,255,177)] rounded-2xl text-base p-2.5 text-left mx-auto mb-7.5">
            <h3 className="text-center m-0 p-0">Aviso: Versão de Teste</h3>
            <p>
              <strong>Observação:</strong> o site pode demorar a carregar no primeiro acesso, pois a hospedagem do servidor e do banco de dados está sendo feita de forma gratuita.
            </p>
          </div>
        </div>}
      </div>
      


      <aside className="md:order-2 order-1 w-fit">
        <div className='scroll-mt-8 sticky w-fit top-8 flex flex-col gap-2 px-2' id="doar">
          <CardAside title="PIX SOLIDÁRIO"
            image={imagempix} content={<><p className='text-[12pt] font-bold'>19.552.047/0001-43</p>
              <p className='text-[10pt]'>Sua contribuição faz a diferença!</p></>} text="" />


          <CardAside title="VOLUNTARIE-SE"
            // image={imagemvolun}
            text="Faça parte da APATA."
            content={<a href='https://chat.whatsapp.com/CwqD6s5Ft5C9ITPPsE1V7q' target='_blank' ><Button name={<div className='flex whitespace-nowrap items-center justify-center gap-1'>Entrar no grupo <IoLogoWhatsapp /></div>} size={15} />  </a>}
          />
        </div>
      
      </aside>





      <section className="scroll-mt-8 md:order-3 order-4 gap-2 justify-center items-start grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1"
        id="adotar">



       

        {!isLoading &&
          <>
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
                admin={false}
              />
            ))} </>}

            {petsFiltrados?.length<=0 && 
            <p className='text-[18pt] text-(--text-color)'>Nenhum animal encontrado.</p>}


      </section>



      <aside className='md:order-4 order-2 flex flex-col gap-5'>
        <div className='sticky top-8 flex flex-col gap-2 px-2'>


          <CardAside title="DOE RAÇÃO:"
            content={<div className='flex flex-col gap-1'>
              <p className="text-[12pt] text-left"> Por recomendações veterinárias, aceitamos apenas as marcas abaixo:
              </p>
              <ul className='text-[12pt] text-left'>
                <li><strong>Cachorros </strong> - JAPI</li>
                <li><strong>Gatos </strong> - GRAN PLUS e MAGNUS SALMÃO </li>
              </ul>

              <hr className='p-[0.5px] w-full bg-(--text-color) text-(--text-color)' />

              <p className='font-bold text-[20pt] text-(--text-color)'>APOIE:</p>
              <p className='text-[12pt] text-left'>Doe remédios para os animais ou apoie nosso Bazar com roupas, calçados, artesanato, livros ou plantas.</p>

              <Button name={<span className='flex whitespace-nowrap items-center justify-center gap-1'>Fale Conosco <IoLogoWhatsapp /></span>} size={15} />
            </div>} />



        </div>


      </aside>


    </div>

    </div>
    )
}
export default PagePrincipal