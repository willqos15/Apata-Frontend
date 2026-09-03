import Spinner from './Spinner'

export default function PetsLoadingMessage() {
  return (
    <div className="flex flex-col justify-center items-center mx-2">
      <Spinner />

      <div className="bg-(--bg-color2) text-(--text-color) rounded-2xl text-base p-2.5 mx-auto m-1 text-center">
        <p className="font-bold">Procurando seu novo melhor amigo!</p>
        <p>O carregamento pode demorar alguns segundos.</p>
      </div>
    </div>
  )
}
