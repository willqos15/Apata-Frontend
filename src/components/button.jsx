export default function Button({name, func, size, type,className, disable}) {

    return(
        <button type={type} disabled={disable} className={`bg-(--primary-color) text-(--text-color) hover:bg-(--tertiary-color) hover:text-(--text-color2) text-[${size}pt] font-bold px-2 py-1 rounded transition-colors duration-200 cursor-pointer my-1 w-full ${className}`} onClick={func}>
            {name}
        </button>
    
        
  )
}