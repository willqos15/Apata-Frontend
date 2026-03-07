import imagempix from '../img/QRPIX.jpeg'
import catdog from '../img/catdog.svg'
import Button from './button'

export default function Hero () {
    return(<div className="h-fit w-full bg-(--bg-color2) flex lg:flex-row flex-col px-4 gap-4  items-center justify-center">

        <div className='lg:order-1 order-2 text-wrap text-sm text-left flex flex-col justify-end'>
        <p className='sm:text-2xl text-sm text-(--text-color)'>Adote um amigo. Mude uma vida</p>
        <p className='text-(--text-color2) sm:text-sm text-[16pt]'>Dezenas de animais esperam um lar com amor. ❤️</p>
        <p className='text-(--text-color2) sm:text-sm text-[16pt]'>Seja abrigo e companhia constante.</p>

        <div className='flex sm:flex-row flex-col gap-x-2 my-2'>
           <a href="#adotar"> <Button name="Adotar" size={20} /></a>
            <a href="#doar"><Button name="Doar" size={20}/></a>
            <a className='flex' href='https://chat.whatsapp.com/CwqD6s5Ft5C9ITPPsE1V7q' target='_blank'><Button name="Voluntariar" size={20}/></a>
        </div>

        </div>

        <img src={catdog} className='lg:order-2 order-1 w-40 my-2 h-auto object-contain'/>

    </div>)
}