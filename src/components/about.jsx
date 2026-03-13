import Button from "./button";
import { TbDog } from "react-icons/tb";
import { LuCat } from "react-icons/lu";

export default function About() {
    return (<section className="text-(--text-color) text-center md:w-9/12 w-full mx-auto py-8 ">
        
        <div className="flex sm:flex-row flex-col items-center justify-center gap-4 p-4">

            <TbDog className="sm:text-[500px] text-[200px] h-fit text-(--primary-color)" />

            <div className="flex flex-col">
            <h2 className="sm:text-xl text-base font-bold text-left">SOBRE NÓS</h2>

            <p className="text-left sm:text-base text-[18pt]">
                Somos da Associação de proteção dos animais e do meio ambiente de Altamira Pará.
                Atuamos de forma voluntária, sem fins lucrativos.</p>
                </div>
        </div>





        


        <div className="flex sm:flex-row flex-col items-start justify-center gap-4 py-8">
            <div className="flex flex-col justify-start p-4">
                <h2 className="text-left sm:text-xl text-base font-bold">SOBRE O SITE</h2>
                <p className="text-left sm:text-base text-[18pt]">
                    Foi desenvolvido pela Canoa Tech de maneira gratuíta como uma iniciativa solidária.
                </p>

                <a href="https://canoatech.vercel.app/" target="_blank" className="flex">
                <Button name= "CANOA TECH" size={20} /></a>
            </div>

            <LuCat className="sm:text-[300px] text-[200px] h-fit mx-auto text-(--primary-color)" />
        </div>




    </section>)
}