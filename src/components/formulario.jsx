import { Controller, useForm } from 'react-hook-form'
import axios from 'axios'
import { useRef, useState } from 'react'
import Button from './button.jsx'
import { PatternFormat } from 'react-number-format'
import loading from '../img/load.gif'

function Formulario() {


  const telpadrao = "93991185009"

  const foto = useRef(null)
  const inputFile = useRef(null)


  const [msgfoto, setMsgFoto] = useState("")
  const [nomearq, setNomeArq] = useState("")
  const [msg, setMsg] = useState("")
  const [estado, setEstado] = useState("inicio")


  function errofotos() {

    if (!foto.current) {
      setMsgFoto("erro")
      return true
    }

    setMsgFoto("")
    return false
  }

  function enviar(dados) {
    if (estado !== "inicio") return;

    if (errofotos()) return

    setEstado("load")

    const token = localStorage.getItem("token")

    const formData = new FormData()

    formData.append("nome", dados.nome)
    formData.append("especie", dados.especie)
    formData.append("porte", dados.porte)
    formData.append("sexo", dados.sexo)
    formData.append("descricao", dados.descricao)
    formData.append("file", foto.current)
    formData.append("contato", dados.contato)

    axios.post(
      `${import.meta.env.VITE_URLAPI}/pets`,
      formData,
      {
        headers: {
          authorization: `Bearer ${token}`
        }
      }
    )
      .then(() => {

        reset({
          nome: "",
          especie: "",
          porte: "",
          sexo: "",
          descricao: "",
          contato: telpadrao
        })
        inputFile.current.value = ""
        foto.current = null
        setNomeArq("")
        setMsgFoto("")
        setEstado("inicio")
        setMsg("ok")


        // setTimeout(() => {
        //   setEstado("1")
        // }, 800)

      })
      .catch((erro) => {
        console.log(erro)

        setEstado("inicio")
        setMsg("erro")
      })
  }





  const { register, control, handleSubmit, formState: { errors }, reset } =
    useForm({
      mode: "all",
      defaultValues: {
        nome: "",
        especie: "",
        porte: "",
        sexo: "",
        descricao: "",
        contato: telpadrao
      }
    })

  function Scrollar(e) {

    setTimeout(() => {
      e.target.scrollIntoView(
        { behavior: "smooth", block: "center" })
    }
      , 300)

  }

  function uploading(e) {

    const arquivo = e.target.files[0]

    if (!arquivo) return

    foto.current = arquivo
    setNomeArq(arquivo.name)
    setMsgFoto("")
  }












  return (<div className='pt-10 relative min-h-screen'>




    <form onSubmit={handleSubmit(enviar)} className={`flex flex-col max-w-72 px-5 my-10 mx-auto justify-start rounded-2xl bg-(--bg-color2) `}>

      <fieldset disabled={estado !== "inicio"} className="flex flex-col">

        <label className="formlabel"> Nome do animal:</label>
        <input className='input' {...register("nome", { required: true })} type="text" placeholder="Nome do animal." onFocus={Scrollar} />
        {errors.nome && <p className="formerro">Campo obrigatório</p>}


        <label className="formlabel"> Carregue uma imagem:</label>


        {/* <button className="rounded-xl p-2.5 bg-(--secondary-color) border-0 text-white font-bold cursor-pointer transition duration-500 text-2xs font-sans" onClick={()=>{foto.current.click()}}> Escolha sua imagem </button> */}

        <Button
          name="Escolha sua imagem"
          func={() => inputFile.current.click()}
          size="15"
        />




        <input
          type="file"
          ref={inputFile}
          onChange={uploading}
          onFocus={Scrollar}
          className="hidden"
          accept="image/*"
        />

        <p className=" pl-2.5 text-[16px]  text-(--text-color)">
          {nomearq ? nomearq : ""}
        </p>

        {msgfoto === "erro" && <p className="formerro">Campo obrigatório</p>}

        <label className="formlabel">Espécie</label>
        <select className="input" {...register("especie", { required: true })}>
          <option value="">Selecione</option>
          <option value="cachorro">Cachorro</option>
          <option value="gato">Gato</option>
        </select>
        {errors.especie && <p className="formerro">Campo obrigatório</p>}



        <label className="formlabel">Porte</label>
        <select className="input" {...register("porte", { required: true })}>
          <option value="">Selecione</option>
          <option value="pequeno">Pequeno</option>
          <option value="medio">Médio</option>
          <option value="grande">Grande</option>
        </select>
        {errors.porte && <p className="formerro">Campo obrigatório</p>}

        <label className="formlabel">Sexo</label>
        <select className="input" {...register("sexo", { required: true })}>
          <option value="">Selecione</option>
          <option value="macho">Macho</option>
          <option value="femea">Fêmea</option>
        </select>
        {errors.sexo && <p className="formerro">Campo obrigatório</p>}

        <label className="formlabel"> Sobre:</label>
        <textarea className='textarea max-h-16' {...register("descricao", { required: true })} rows={2} placeholder='Idade, castrado, deficiência e etc.' onFocus={Scrollar} />
        {errors.descricao && <p className="formerro">Campo obrigatório</p>}




        <label className="formlabel"> Contato:</label>
        <Controller
          name="contato"
          control={control}

          rules={{
            required: "Campo obrigatório",
            validate: valor => {
              //uso de REGEX /D retira tudo que não for número e g para aplicat a todos carecteres(global) e substitui por vazio ''
              const tirasimbolo = valor.replace(/\D/g, '')
              console.log(tirasimbolo)
              return tirasimbolo.length === 11 || "O número precisa ter 11 dígitos"
            }
          }}
          render={({ field }) => (

            <PatternFormat
              {...field}
              className='input'
              value={field.value}
              prefix="+55 "
              format="(##) # ####-####"
              placeholder='(XX) X XXXX-XXXX'
              onFocus={Scrollar}
              inputMode='numeric'
              onValueChange={(valor) => {
                field.onChange(valor.value)

              }}
            />

          )}
        />
      </fieldset>

      {errors.contato && <p className="formerro">{errors.contato.message}</p>}

      {/* <button type="submit" onClick={errofotos} className="my-5 mx-auto text-7.5 rounded-xl p-2.5 bg-(--secondary-color) border-0 text-white font-bold cursor-pointer transition duration-500 text-2xs font-sans">Enviar</button> */}
      <br />
      <Button name={`${estado === "inicio" ? "Salvar" : "Salvando..."}`} type="submit" size="20"
        disabled={estado !== "inicio"}
        className={`${estado === "inicio" ? "" : "cursor-default bg-gray-300 text-gray-600 hover:bg-gray-300  hover:text-gray-600"}`} />



    </form>

    {estado === "load" && <img src={loading}
      className="w-20 mx-auto m-4" />}

    {msg === "ok" && estado !== "load" && <p className="p-2 text-base text-green-600 font-bold"> Cadastro feito com sucesso!</p>}
    {msg === "erro" && estado !== "load" && <p className="pt-10 text-base text-[rgb(128,0,0)] font-bold"> Erro ao cadastrar!</p>}




  </div>)
}
export default Formulario