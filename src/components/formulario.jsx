import { Controller, useForm } from 'react-hook-form'
import axios from 'axios'
import { useRef, useState } from 'react'

import { PatternFormat } from 'react-number-format'
import loading from '../img/load.gif'

function Formulario({ funcao }) {

  const foto = useRef(null)
  const [estado, setEstado] = useState("1")
  const [msgfoto, setMsgFoto] = useState("")
  const [nomearq, setNomeArq] = useState()

  function errofotos() {

    if (foto.current.name<=0) {
      console.log('nao tem:', foto.current.name)
      return setMsgFoto("erro") }
  console.log(foto.current.name)
    setMsgFoto("")
  }

  function enviar(dados) {

    errofotos()

    const fotoup = new FormData()
    
    fotoup.append("file", foto.current)

    setEstado("load")
    const token = localStorage.getItem("token")
    axios.post(`${import.meta.env.VITE_URLAPI}/upload`, fotoup,
      { headers: { authorization: `Bearer ${token}` } }
    )
      .then((resposta) => {
        const imagemurl = resposta.data.url
        const imageid = resposta.data.public_idfoto
        
        const finalData = { ...dados, foto: imagemurl, public_idfoto:imageid}
  
        funcao(finalData)
        reset()

        setTimeout(() => {
          setEstado("1")
        }, 1000)


      }
      )
      .catch((erro) => {
        console.log('erro: ',erro)
        setTimeout(() => {
          setEstado("1")
        }, 1000)
      })
  }




  const { register, control,handleSubmit, formState: { errors }, reset } = useForm({ mode: "onChange" })

  /*
register - linka o input ao React Hook Form (essencial)
handleSubmit - garante a validação antes de rodar a função
watch - observa valores em tempo real
reset - reseta o formulário inteiro
resetField - reseta um campo em especifico
setValue - força um valor manualmente
getValues - pega os valores sem precisar do watch
trigger - força validação de um campo ou todo formulario
formState - usa objeto com estados uteis 
control - usado em compomentes controlado como <Controller/>
setError - seta erros manualmente
clearErrors - limpa erros
*/
  function Scrollar(e) {

    setTimeout(() => {
      e.target.scrollIntoView(
        { behavior: "smooth", block: "center" })
    }
      , 300)

  }

  function uploading(e) {
    foto.current = e.target.files[0]
    if (foto.current) {
      setNomeArq(foto.current.name)
    }
    errofotos()
  }

  return (<>


    {estado === "load" && <img src={loading}
                className="pt-15 w-20"/>}


    <form onSubmit={handleSubmit(enviar)}  className="flex flex-col max-w-100 min-w-50 px-5 my-10 mx-auto justify-start rounded-2xl bg-(--primary-color)">
      {estado === "1" &&
        <>

          <label className="formlabel"> Nome do item perdido:</label>
          <input className='bg-white rounded-md px-2' {...register("nome", { required: true })} type="text" placeholder="Exemplo: Lápis, borracha e etc." onFocus={Scrollar} />
          {errors.nome && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel"> Carregue uma imagem:</label>
          <div className="flex justify-center items-center">

            <button className="rounded-xl p-2.5 bg-(--secondary-color) border-0 text-white font-bold cursor-pointer transition duration-500 text-2xs font-sans" onClick={()=>{foto.current.click()}}> Escolha sua imagem </button>
            
            <input  type='file' onChange={uploading} onFocus={Scrollar} ref={foto} className="hidden"/>


            <span className="text-base pl-2.5 text-white">
              {nomearq ? nomearq : ""}
            </span>
          </div>
          {msgfoto === "erro" && <p className="formerro">Campo obrigatório</p>}


          <label className="formlabel"> Descrição:</label>
          <textarea className='bg-white rounded-md px-2 min-h-8 max-h-20' {...register("descricao", { required: true })} rows={2} placeholder='Descreva a aparência, cor, tamanho, detalhes e etc.' onFocus={Scrollar} />
          {errors.descricao && <p className="formerro">Campo obrigatório</p>}


          <label className="formlabel"> Local onde foi perdido:</label>
          <input className='bg-white rounded-md px-2' {...register("local", { required: true })} type="text" placeholder='Exemplo: Pátio, Sala e etc.' onFocus={Scrollar} />
          {errors.local && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel"> Proprietário:</label>
          <input className='bg-white rounded-md px-2' {...register("proprietario", { required: true })} type="text" placeholder='Nome completo.' onFocus={Scrollar} />
          {errors.proprietario && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel"> Contato (Whatsapp):</label>


          <Controller
            name="contato"
            control={control}
            
            rules={{ required: "Campo obrigatório",
              validate: valor=>{
                //uso de REGEX /D retira tudo que não for número e g para aplicat a todos carecteres(global) e substitui por vazio ''
                const tirasimbolo = valor.replace(/\D/g,'')
                return tirasimbolo.length === 13 || "O número precisa ter 11 dígitos"
              }}}
            render={({ field }) => (

              <PatternFormat
                {...field}
                className='bg-white rounded-md px-2'
                format='+55 (##) # ####-####'
                placeholder='(XX) X XXXX-XXXX'
                onFocus={Scrollar}
                inputMode='numeric'
                onValueChange={(valor)=>{
                  field.onChange(valor.value)
                  
                }}
              />

            )}
          />


          {errors.contato && <p className="formerro">{errors.contato.message}</p>}

          <button type="submit" onClick={errofotos} className="my-5 mx-auto text-7.5 rounded-xl p-2.5 bg-(--secondary-color) border-0 text-white font-bold cursor-pointer transition duration-500 text-2xs font-sans">Enviar</button>

        </>
      }
    </form>




  </>)
}
export default Formulario