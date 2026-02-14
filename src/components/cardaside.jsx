export default function CardAside({title, image, text, content}) {
    return(<section className="bg-(--bg-color2) w-fit mx-auto p-2 rounded-xl">
              <h3 className='text-sm whitespace-nowrap'>{title}</h3>
              {image && <img src={image} className='w-20 h-auto' />}
              {text && <p className='text-[12pt] pt-1'>{text}</p>}
              {content}
            </section>)
}