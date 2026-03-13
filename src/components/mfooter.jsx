import { AiFillInstagram } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import LogoCanoa from '../img/logoct.svg'

function MFooter() {
    return (

        <div className="bottom-0 mb-0 pb-0 w-full bg-(--primary-color) pt-0.5">

            <footer className='flex lg:flex-row flex-col p-2 justify-center items-center gap-x-8 gap-y-2 text-center sm:text-[12pt] text-[12pt] bg-(--bg-color2)
        text-(--text-color) pb-4'>

                <div className="flex flex-col gap-x-1">
                    <p className="font-bold">APATA - Altamira Pará</p>
                    <p>Av. Tancredo Neves, 3060. 683712-71</p>
                </div>

                <div className="flex lg:flex-col flex-row gap-1">
                    <div className="flex items-center justify-center">
                       <a href="https://www.instagram.com/apata_altamira/" target="_blank" className="flex items-center hover:text-(--text-color2) transition duration-300"> <AiFillInstagram /> Instagram</a>
                        
                        <a href="mailto:apatadealtamira@gmail.com" target="_blank" className="flex items-center hover:text-(--text-color2) transition duration-300">
                            <MdEmail className="ml-2"/>
                            apatadealtamira@gmail.com</a>
                    </div>
                </div>

                <div className="flex flex-col items-center "
                 >
                    <a className="flex items-center hover:text-(--text-color2) transition duration-300" href="https://canoatech.vercel.app/" target="_blank">
                    <img src={LogoCanoa} className="h-8 w-auto mr-1"/>
                    
                    
                    <p className="font-bold">Site desenvolvido pela Canoa Tech</p> </a>
                    <p>Colaboradores: 
                        <a href="https://github.com/willqos15" target ="_blank" className="hover:text-(--text-color2) transition duration-300"> William Queiroz</a>  e 
                        <a href="https://github.com/FerMacedo" target ="_blank" className="hover:text-(--text-color2) transition duration-300" > Fernando Macedo</a> </p>
                    
                    
                </div>


            </footer>

        </div>)
}

export default MFooter