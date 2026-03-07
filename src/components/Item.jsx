
import { useRef, useState } from "react"
import { Controller, useForm } from 'react-hook-form'
import { MdAddPhotoAlternate } from "react-icons/md";
import { PatternFormat } from 'react-number-format'
import Button from "./button";
import { IoMdMale } from "react-icons/io";
import { IoMdFemale } from "react-icons/io";

function Item({
    Nome,
    Descricao,
    especie,
    Img,
    porte,
    sexo,
    contato,
    admin,
    id,

    fdel,
    fatualizar,
    valoresget,
    itemstart,
    itemend
}) {


    const [aberto, setAberto] = useState(false)
    const [editando, setEditando] = useState(false)
    const [msg, setMsg] = useState(false)

    const { register, handleSubmit, control, formState: { errors }, reset, trigger } = useForm({
        mode: "onChange",
        defaultValues: {
            nome: "",
            descricao: "",
            especie: "",
            porte: "",
            sexo: "",
            contato: "",
        }
    })

    const [fotoup, setFotoUp] = useState()
    const foto = useRef(null)





    async function form(dados) {
        try {
            itemstart()

            const formData = new FormData()

            // adiciona todos os campos
            Object.keys(dados).forEach((key) => {
                formData.append(key, dados[key])
            })

            // adiciona imagem se existir
            if (foto.current?.files?.length > 0) {
                formData.append("file", foto.current.files[0])
            }

            await fatualizar(id, formData)

            itemend()

        } catch (erro) {
            console.error(erro)
            itemend()
        }
    }

    function uploading(e) {
        const arquivo = e.target.files[0]
        if (!arquivo) return

        const leitor = new FileReader()
        leitor.onload = () => {
            setFotoUp(leitor.result)
        }
        leitor.readAsDataURL(arquivo)



    }

    function editar() {

        const numero = contato.replace(/\D/g, '')

        setEditando(!editando)

        reset({
            nome: Nome,
            descricao: Descricao,
            especie: especie,
            porte: porte,
            sexo: sexo,
            contato: numero
        })
    }


    function Scrollar(e) {

        setTimeout(() => {
            e.target.scrollIntoView(
                { behavior: "smooth", block: "center" })
        }
            , 300)

    }


    function formatarTelefone(numero) {

        const n = numero.replace(/\D/g, '')

        if (n.length === 13) {
            return `(${n.slice(2, 4)}) ${n.slice(4, 9)}-${n.slice(9)}`
        }

        return numero
    }



    return (<>


        <div className="flex flex-col rounded-t-[20px] transition-all duration-500 text-[20px]">



            <div onClick={() => {
                if (!admin) { setAberto(!aberto) }
                if (admin) { editar() }
            }} className="cursor-pointer select-none">

                <div className="bg-(--primary-color) rounded-t-xl transition w-30 duration-500">

                    <div className="flex justify-center items-center py-2 relative">

                        {(admin && editando) &&
                            <button className="absolute bg-transparent border-0 text-white text-12.5 cursor-pointer transitionduration-200 z-3 text-4xl "
                                onClick={(e) => {
                                    e.stopPropagation()
                                    foto.current.click()
                                }}>
                                <MdAddPhotoAlternate />
                            </button>
                        }

                        <img src={fotoup ? fotoup : Img} alt={`um ${especie} ${sexo} ${porte}`}
                            className={`${editando ? "brightness-75" : "brightness-100"} w-24 h-24 object-cover border-8 border-(--bg-color2) rounded-full mx-auto transition-all duration-500 bg-white`} />

                    </div>

                    {admin && <>
                        <button
                            onClick={editar}
                            className="m-1 py-1 px-2 text-[13pt] rounded-xl text-(--text-color) border-0 font-bold transition duration-500 cursor-pointer font-sans hover:text-white bg-white hover:bg-(--secondary-color)">Editar
                        </button>



                        <button onClick={(e) => {
                            fdel(id, Nome)
                            e.stopPropagation()
                        }} className="m-1 py-1 px-2 text-[13pt] rounded-xl text-(--text-color) border-0 font-bold transition duration-500 cursor-pointer font-sans hover:text-white  bg-white hover:bg-(--secondary-color)">Apagar</button></>}


                    <div className="mt-0.5 p-1  h-fit bg-(--bg-color2)  cursor-pointer transition-all duration-300" >
                        <label className="text-(--text-color) font-extrabold text-base flex justify-center items-center"> {`${Nome} `}  {sexo === "macho" ? <IoMdMale className="text-blue-500" /> : <IoMdFemale className="text-pink-500" />}</label>


                        {/*FRASE SAIBA MAIS PARA USUÁRIO GERAL*/}
                        {!admin ? <p className={`text-(--text-color) overflow-hidden transition-all ease-linear ${aberto ? "max-h-0 opacity-0 duration-0" : "max-h-40 opacity-100 duration-300"}`}>
                            Clique para me conhecer! </p> : null}
                    </div>

                </div>
            </div>


            {/*VERSÃO BOTÃO PARA USUÁRIO GERAL*/}
            {!admin ?
                <div className={`w-30 bg-(--bg-color2) text-(--text-color2) p-2 pt-0 flex flex-col ease-linear transition-opacity overflow-hidden ${aberto ? "max-h-40 duration-500 opacity-100" : " max-h-0  duration-0  opacity-0"}`}>
                    <label className="font-bold text-[12pt]">
                        {especie === "cachorro" && sexo === "macho" && " Cachorro | Macho"}
                        {especie === "cachorro" && sexo === "femea" && " Cachorro | Fêmea "}
                        {especie === "gato" && sexo === "femea" && "Gato | Fêmea "}
                        {especie === "gato" && sexo === "macho" && "Gato | Macho "}

                        | Porte {porte === "medio" ? "médio" : porte}</label>
                    <p className="text-left">{Descricao}.</p>



                    <label className="font-bold pt-4 text-(--text-color)">Entre em contato:</label>
                    <a
  href={`https://wa.me/${contato}?text=${encodeURIComponent(
    `Quero saber mais sobre o ${especie} ${Nome}`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
>
                        <Button name={formatarTelefone(contato)} /></a>

                </div>
                : null}

            {/*VERSÃO FORMULÁRIO PARA EDITAR COMO ADIMINISTRADOR*/}
            {admin ?
                <div className={`w-30 bg-(--bg-color2) text-(--text-color2) ease-linear transition-opacity ${editando ? "max-h-fit duration-500 opacity-100" : "max-h-0 duration-0  opacity-0"}`}>

                    <form onSubmit={handleSubmit(form)}>



                        <input type='file' name="file"
                            onChange={uploading} onFocus={Scrollar} ref={foto}
                            className="hidden" />

                        <label><strong>Nome:</strong></label>
                        <input
                            className="input"

                            {...register("nome", {
                                required: true,
                                onChange: (e) => {
                                    e.target.value =
                                        e.target.value.charAt(0).toUpperCase() +
                                        e.target.value.slice(1)
                                }
                            })}
                            type="text"

                        />
                        {errors.nome && <p>Campo obrigatório</p>}


                        <label><strong>Espécie:</strong></label>
                        <select className="input" {...register("especie", { required: true })}>
                            <option value="">Selecione</option>
                            <option value="cachorro">Cachorro</option>
                            <option value="gato">Gato</option>
                        </select>
                        {errors.especie && <p>Campo obrigatório</p>}


                        <label><strong>Porte:</strong></label>
                        <select className="input" {...register("porte", { required: true })}>
                            <option value="">Selecione</option>
                            <option value="pequeno">Pequeno</option>
                            <option value="medio">Médio</option>
                            <option value="grande">Grande</option>
                        </select>
                        {errors.porte && <p>Campo obrigatório</p>}


                        <label><strong>Sexo:</strong></label>
                        <select className="input" {...register("sexo", { required: true })}>
                            <option value="">Selecione</option>
                            <option value="macho">Macho</option>
                            <option value="femea">Fêmea</option>
                        </select>
                        {errors.sexo && <p>Campo obrigatório</p>}


                        <label><strong>Descrição:</strong></label>
                        <textarea
                            className="textarea"
                            {...register("descricao", {
                                required: true,
                                onChange: (e) => {
                                    e.target.value =
                                        e.target.value.charAt(0).toUpperCase() +
                                        e.target.value.slice(1)
                                }
                            })}
                        />
                        {errors.descricao && <p>Campo obrigatório</p>}




                        <label> <strong>Contato: </strong></label>
                        <Controller
                            name="contato"
                            control={control}

                            rules={{
                                required: "Campo obrigatório",
                                validate: valor => {
                                    //uso de REGEX /D retira tudo que não for número e g para aplicat a todos carecteres(global) e substitui por vazio ''

                                    if (!valor) return "Campo obrigatório"

                                    const tirasimbolo = valor.replace(/\D/g, '')
                                    return tirasimbolo.length === 13 || "Número inválido"
                                }

                            }}
                            render={({ field }) => (

                                <PatternFormat
                                    {...field}
                                    value={field.value}
                                    className="input"
                                    format='+55 (##) # ####-####'
                                    placeholder='(XX) X XXXX-XXXX'
                                    onFocus={Scrollar}
                                    inputMode='numeric'
                                    onValueChange={(valor) => {
                                        field.onChange(valor.value)

                                    }}
                                />

                            )}
                        />
                        {errors.contato && <p>{errors.contato.message}</p>}
                        {msg}


                        <Button name="Salvar" type="submit"
                        // func={() => {

                        //     setMsg(trigger())
                        // }} 
                        />

                    </form>


                </div>
                : null}
        </div>










    </>

    )
}
export default Item


