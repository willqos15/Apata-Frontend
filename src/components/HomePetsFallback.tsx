import PetsLoadingMessage from './PetsLoadingMessage'

export default function HomePetsFallback() {
  return (
    <>
      <div className="w-full [@media(min-width:1100px)]:order-1 order-1">
        <p className="text-(--text-color)">Adotar um animal:</p>
      </div>

      <section
        className="scroll-mt-8 [@media(min-width:1100px)]:order-3 order-2 gap-2 xl:w-97.5 items-start flex flex-wrap justify-center mb-4"
        id="adotar"
      >
        <PetsLoadingMessage />
      </section>
    </>
  )
}
