import Item from '../components/Item'
import { useQuery } from '@tanstack/react-query';
import { ListarItem } from '../hookapi/fetchItem';
import loading from '../img/load.gif'
import imagempix from '../img/QRPIX.jpeg'
import Hero from '../components/hero';
import CardAside from '../components/cardaside';
import Button from '../components/button';
import About from '../components/about';
import { IoLogoWhatsapp } from "react-icons/io";
import { useState } from 'react';
import Search from '../components/search';
import { CiPill } from 'react-icons/ci';
import { FaTshirt } from 'react-icons/fa';


function PagePrincipal() {

  //puxa apenas as propriedades desejadas do query
  //data são os dados pegos do QueryFn
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["itens"],
    queryFn: ListarItem
  })

  const [filtroEspecie, setFiltroEspecie] = useState("")
  const [filtroSexo, setFiltroSexo] = useState("")
  const [filtroPorte, setFiltroPorte] = useState("")
  const [busca, setBusca] = useState("")



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



  return (<div>


    <div className="flex flex-wrap flex-row gap-1 items-start justify-center w-full overflow-x-hidden">


      <div className='w-full [@media(min-width:1100px)]:order-1 order-1'>
        <p className='text-(--text-color)'>Adotar um animal:</p>

        {!isLoading && !error &&
          <div className=' bg-(--bg-color2) w-fit  rounded-sm p-4 mx-auto  items-center flex flex-col mb-2'>

            <Search busca={busca} setBusca={setBusca} />



            <div className='flex flex-row gap-2 w-full items-center justify-center sm:text-[18pt] text-[12pt]'>

              <div className='flex flex-col text-(--text-color) '>
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

        }



      </div>



      <aside className=" [@media(min-width:1100px)]:order-2 order-3 w-fit">
        <div className='scroll-mt-8 sticky sm:w-fit w-full top-8 flex flex-col gap-2 px-2' id="doar">
          <CardAside title="PIX SOLIDÁRIO"
            image={imagempix} content={<><p className='text-[12pt] font-bold'>19.552.047/0001-43</p>
              <p className='text-[10pt]'>Sua contribuição faz a diferença!</p></>} text="" />


          <CardAside title="VOLUNTARIE-SE"
            // image={imagemvolun}
            text="Faça parte da APATA."
            content={<a href='https://chat.whatsapp.com/CwqD6s5Ft5C9ITPPsE1V7q' target='_blank' ><Button name={<div className='flex whitespace-nowrap items-center justify-center gap-1'>Entrar no grupo <IoLogoWhatsapp /></div>} size={15} />  </a>}
          />

          <CardAside title="ASSOCIE-SE"
            // image={imagemvolun}
            text="Mensalidade mínima de R$30,00."
            content={<a href='https://chat.whatsapp.com/JV5q2ig541o5vcenZdzhZl?mode=gi_t' target='_blank' ><Button name={<div className='flex whitespace-nowrap items-center justify-center gap-1'>Entrar no grupo <IoLogoWhatsapp /></div>} size={15} />  </a>}
          />

        </div>

      </aside>

      {/* {data?.length <= 0 &&
          <p className="text-[18pt] text-(--text-color)"
          >Nenhum animal cadastrado! </p>} */}



      <section className="scroll-mt-8  [@media(min-width:1100px)]:order-3 order-2 gap-2  xl:w-97.5 items-start flex flex-wrap justify-center mb-4"
        id="adotar">




        {error && !isLoading && <p className="text-[18pt] font-bold text-red-800 w-full"> Algo deu errado. Tente novamente.</p>}

        {!error && !isLoading && petsFiltrados?.length <= 0 &&
          <p className='text-[18pt] text-(--text-color) w-full'>Nenhum animal encontrado.</p>}

        {isLoading && <div className='flex flex-col justify-center items-center mx-2'>

          <img src={loading} className="w-20 h-auto" />

          <div className="bg-(--bg-color2) text-(--text-color)rounded-2xl text-base p-2.5 mx-auto m-1 text-center">
            <p className='font-bold'>Procurando seu novo melhor amigo!
            </p>
            <p>O carregamento pode demorar alguns segundos.</p>
          </div>
        </div>}


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




      </section>



      <aside className=' [@media(min-width:1100px)]:order-4 order-2 flex flex-col gap-5'>
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

              <div className='flex justify-center items-center gap-2 text-(--text-color)'>
                <CiPill />
                <p className='font-bold text-[20pt] '>APOIE:</p>
                <FaTshirt />
              </div>
              <p className='text-[12pt] text-left'>Doe remédios para os animais ou apoie nosso Bazar com roupas, calçados, artesanato, livros ou plantas.</p>

              <a href="https://wa.me/5593991181760" target='_blank'>
                <Button name={<p className='flex whitespace-nowrap items-center justify-center gap-1'>(93) 99118-1760 <IoLogoWhatsapp /></p>} size={15} />
              </a>

              <a href="https://wa.me/5593992412308" target='_blank'>
                <Button name={<p className='flex whitespace-nowrap items-center justify-center gap-1'>(93) 99241-2308 <IoLogoWhatsapp /></p>} size={15} />
              </a>
            </div>} />



        </div>


      </aside>


    </div>


    <Hero />

    <About />


  </div>
  )
}
export default PagePrincipal