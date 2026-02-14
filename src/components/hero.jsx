import imagempix from '../img/QRPIX.jpeg'
import catdog from '../img/catdog.svg'
import Button from './button'

export default function Hero () {
    return(<div className="h-fit w-full bg-(--bg-color2) flex px-4 gap-4  items-center justify-center">

        <div className='text-sm text-left flex flex-col justify-end'>
        <p className='text-2xl text-(--text-color)'>Adote um amigo. Mude uma vida</p>
        <p className='text-(--text-color2)'>Dezenas de animais esperam um lar com amor. ❤️</p>
        <p className='text-(--text-color2)'>Seja abrigo e companhia constante.</p>

        <div className='flex gap-2 my-2'>
            <Button name="Adotar"/>
            <Button name="Doar"/>
            <Button name="Voluntariar"/>
        </div>

        </div>

        <img src={catdog} className='h-40 my-2 w-auto object-contain'/>

    </div>)
}