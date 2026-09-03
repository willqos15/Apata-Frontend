import { Suspense } from 'react'
import { IoLogoWhatsapp } from 'react-icons/io'
import { CiPill } from 'react-icons/ci'
import { FaTshirt } from 'react-icons/fa'
import pixImage from '@/img/QRPIX.jpeg'
import About from '@/components/About'
import Button from '@/components/Button'
import CardAside from '@/components/CardAside'
import Hero from '@/components/Hero'
import HomePets from '@/components/HomePets'
import HomePetsFallback from '@/components/HomePetsFallback'
import { fetchPetsServer } from '@/lib/pets-server'

async function PetsFromServer() {
  const pets = await fetchPetsServer()
  return <HomePets initialPets={pets} />
}

function JoinGroupButton() {
  return (
    <Button
      name={
        <div className="flex whitespace-nowrap items-center justify-center gap-1">
          Entrar no grupo <IoLogoWhatsapp />
        </div>
      }
      size={15}
    />
  )
}

export default function HomePage() {
  return (
    <div>
      <div className="flex flex-wrap flex-row gap-1 items-start justify-center w-full overflow-x-hidden">
        <Suspense fallback={<HomePetsFallback />}>
          <PetsFromServer />
        </Suspense>

        <aside className="[@media(min-width:1100px)]:order-2 order-3 w-fit">
          <div className="scroll-mt-8 sticky sm:w-fit w-full top-8 flex flex-col gap-2 px-2" id="doar">
            <CardAside
              title="PIX SOLIDÁRIO"
              image={pixImage}
              content={
                <>
                  <p className="text-[12pt] font-bold">19.552.047/0001-43</p>
                  <p className="text-[10pt]">Sua contribuição faz a diferença!</p>
                </>
              }
            />

            <CardAside
              title="VOLUNTARIE-SE"
              text="Faça parte da APATA."
              content={
                <a href="https://chat.whatsapp.com/CwqD6s5Ft5C9ITPPsE1V7q" target="_blank" rel="noopener noreferrer">
                  <JoinGroupButton />
                </a>
              }
            />

            <CardAside
              title="ASSOCIE-SE"
              text="Mensalidade mínima de R$30,00."
              content={
                <a href="https://chat.whatsapp.com/JV5q2ig541o5vcenZdzhZl?mode=gi_t" target="_blank" rel="noopener noreferrer">
                  <JoinGroupButton />
                </a>
              }
            />
          </div>
        </aside>

        <aside className="[@media(min-width:1100px)]:order-4 order-2 flex flex-col gap-5">
          <div className="sticky top-8 flex flex-col gap-2 px-2">
            <CardAside
              title="DOE RAÇÃO:"
              content={
                <div className="flex flex-col gap-1">
                  <p className="text-[12pt] text-left"> Por recomendações veterinárias, aceitamos apenas as marcas abaixo:</p>
                  <ul className="text-[12pt] text-left">
                    <li>
                      <strong>Cachorros </strong> - JAPI
                    </li>
                    <li>
                      <strong>Gatos </strong> - GRAN PLUS e MAGNUS SALMÃO{' '}
                    </li>
                  </ul>

                  <hr className="p-[0.5px] w-full bg-(--text-color) text-(--text-color)" />

                  <div className="flex justify-center items-center gap-2 text-(--text-color)">
                    <CiPill />
                    <p className="font-bold text-[20pt]">APOIE:</p>
                    <FaTshirt />
                  </div>
                  <p className="text-[12pt] text-left">
                    Doe remédios para os animais ou apoie nosso Bazar com roupas, calçados, artesanato, livros ou plantas.
                  </p>

                  <a href="https://forms.gle/jFhi6fvzJgtbiKV68" target="_blank" rel="noopener noreferrer">
                    <Button name={<p className="flex whitespace-nowrap items-center justify-center gap-1"> Quero Doar</p>} size={15} />
                  </a>
                </div>
              }
            />
          </div>
        </aside>
      </div>

      <Hero />
      <About />
    </div>
  )
}
