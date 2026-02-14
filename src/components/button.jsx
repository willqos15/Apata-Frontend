export default function Button({name, func}) {

    return(
        <button className="bg-(--primary-color) text-(--text-color) hover:bg-(--tertiary-color) hover:text-(--text-color2) text-[15pt] font-bold px-2 py-1 rounded transition-colors duration-200 cursor-pointer my-1" onClick={func}>
            {name}
        </button>
    
        
  )
}