import { IoClose } from "react-icons/io5";

export default function Poup({titulo, conteudo, show, setShow}) {

    return (<>

    <div className={`${ show ? "bg-[rgba(0,0,0,0.8)] fixed flex items-center inset-0 z-200" : "hidden" } `}>

        <div className="bg-white max-w-screen mx-auto">

            <div className="flex items-center w-full gap-2 p-1
            bg-(--primary-color) font-bold text-(--text-color) text-xl relative">
               <h1 className="w-full text-center">{titulo}</h1> 
               <IoClose
               onClick={()=>setShow(false)}
               className="cursor-pointer rounded-md font-bold text-white bg-red-600 transition-all duration-300 hover:bg-red-800"/> 
            </div>

            

            <span className="text-[#21285C] w-full">
            {conteudo}</span>

          
        </div>
        </div>

    </>)
}