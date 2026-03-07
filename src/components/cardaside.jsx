export default function CardAside({title, image, text, content}) {

    return(
    <section className="bg-(--bg-color2) max-w-32 mx-auto p-2 rounded-xl flex flex-col flex-wrap justify-center items-center">
              <h3 className='text-sm whitespace-nowrap text-[20pt] font-bold text-(--text-color)'>{title}</h3>
              {image && <img src={image} className='w-20 h-auto' />}
              {text && <p className='text-[12pt] pt-1'>{text}</p>}
              {content}
            </section>)
}