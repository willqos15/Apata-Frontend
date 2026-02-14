
import { useRef, useState } from "react"
import { Controller, useForm } from 'react-hook-form'
import { MdAddPhotoAlternate } from "react-icons/md";
import { PatternFormat } from 'react-number-format'
import axios from 'axios'
import Button from "./button";


function Item({ Nome, Descricao, local, Dono, Contato, Img, Imgtexto, admin, id, fdel, valoresget, fatualizar, itemstart, itemend }) {


    const [aberto, setAberto] = useState(false)
    const [editando, setEditando] = useState(false)
    const [msg, setMsg] = useState(false)
    const { register, handleSubmit, control, formState: { errors }, reset, trigger } = useForm({
        mode: "onChange",
        defaultValues: { nome: "", descricao: "", local: "", proprietario: "", contato: "" }
    })

    const [fotoup, setFotoUp] = useState()
    const foto = useRef(null)



    async function form(dados) {



        try {
            itemstart()

            if (foto.current?.files?.length > 0) {

                const fotodata = new FormData()
                fotodata.append("file", foto.current.files[0])

                const token = localStorage.getItem("token")

                const resposta = await axios.post(`${import.meta.env.VITE_URLAPI}/upload`, fotodata,
                    { headers: { authorization: `Bearer ${token}` } }
                )

                const imagemurl = resposta.data.url
                const imageid = resposta.data.public_idfoto

                const finalData = { ...dados, foto: imagemurl, public_idfoto: imageid }

                return await fatualizar(id, finalData)

            }

            return await fatualizar(id, dados)

        }

        catch (erro) {
            console.error("Erro no formulário", erro)
            throw erro
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

    //Puxa os valores e preenche o formulario
    function editar() {
        setEditando(!editando)
        //resetar( busca valores de determinado id)
        //console.log(valoresget)
        const item = valoresget.find(x => x._id === id)
        reset({ ...item, contato: item.contato?.replace(/\D/g, '') })

    }


    function Scrollar(e) {

        setTimeout(() => {
            e.target.scrollIntoView(
                { behavior: "smooth", block: "center" })
        }
            , 300)

    }




    return (<>


        <div className="inline-flex flex-col rounded-t-[20px] transition-all duration-500 text-[20px]">



            <div onClick={() => {
                if (!admin) { setAberto(!aberto) }
                if (admin) { editar() }
            }} className="cursor-pointer select-none">

                <div className="bg-(--primary-color) rounded-t-xl transition w-30 duration-500 pt-px">

                    <div className="flex justify-center items-center py-2 relative">

                        {(admin && editando) && 
                            <button className="absolute bg-transparent border-0 text-white text-12.5 cursor-pointer transitionduration-200 z-3 text-4xl "
                                onClick={(e) => {
                                    e.stopPropagation()
                                    foto.current.click()
                                }}>
                                <MdAddPhotoAlternate/>
                            </button>
                        }

                        <img src={Img} alt={Imgtexto} 
                        className={`${editando? "brightness-75" : "brightness-100"} w-24 h-24 object-cover border-8 border-(--bg-color2) rounded-full mx-auto transition-all duration-500 bg-white`} />

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
                        <label className="text-(--text-color) font-extrabold"> {Nome} </label>


                        {/*FRASE SAIBA MAIS PARA USUÁRIO GERAL*/}
                        {!admin ? <p className={`text-(--text-color) overflow-hidden transition-all ease-linear ${aberto ? "max-h-0 opacity-0 duration-0" : "max-h-40 opacity-100 duration-300" }`}>
                                Clique para me conhecer! </p> : null}
                        </div>

                    </div>
                </div>


                {/*VERSÃO BOTÃO PARA USUÁRIO GERAL*/}
                {!admin ?
                    <div className={`w-30 bg-(--bg-color2) text-(--text-color2) p-2 flex flex-col ease-linear transition-opacity overflow-hidden ${aberto ? "max-h-40 duration-500 opacity-100" : " max-h-0  duration-0  opacity-0"}` }>
                        <label> <strong>Descrição: </strong>{Descricao}</label>
                        <label> <strong>Local onde foi perdido: </strong>{local}</label>
                        <label> <strong>Proprietário: </strong>{Dono} </label>
                        <br />
                    </div>
                    : null}

                {/*VERSÃO FORMULÁRIO PARA EDITAR COMO ADIMINISTRADOR*/}
                {admin ?
                    <div className={`w-30 bg-(--bg-color2) text-(--text-color2) ease-linear transition-opacity ${editando ? "max-h-fit duration-500 opacity-100" : "max-h-0 duration-0  opacity-0" }`}>

                        <form onSubmit={handleSubmit(form)}>



                            <input type='file' name="file"
                                onChange={uploading} onFocus={Scrollar} ref={foto}
                                className="hidden" />

                            <label> <strong>Nome: </strong></label>
                            <input className="input" {...register("nome", { required: true })} type="text" onFocus={Scrollar} />
                            {errors.nome && <p>Campo obrigatório</p>}

                            <label> <strong>Descrição: </strong></label>
                            <textarea className="textarea" {...register("descricao", { required: true })} onFocus={Scrollar} />
                            {errors.descricao && <p>Campo obrigatório</p>}

                            <label> <strong>Local onde foi perdido: </strong></label>
                            <input className="input"  {...register("local", { required: true })} type="text" onFocus={Scrollar} />
                            {errors.local && <p>Campo obrigatório</p>}

                            <label> <strong>Proprietário: </strong></label>
                            <input  className="input" {...register("proprietario", { required: true })} type="text" onFocus={Scrollar} />
                            {errors.proprietario && <p>Campo obrigatório</p>}

                            <label> <strong>Contato: </strong></label>
                            <Controller
                                name="contato"
                                control={control}
                                
                                rules={{
                                    required: "Campo obrigatório",
                                    validate: valor => {
                                        //uso de REGEX /D retira tudo que não for número e g para aplicat a todos carecteres(global) e substitui por vazio ''
                                        const tirasimbolo = valor.replace(/\D/g, '')
                                        return tirasimbolo.length === 13 || "O número precisa ter 11 dígitos"
                                    }
                                }}
                                render={({ field }) => (

                                    <PatternFormat
                                        {...field}
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
                             func={(e) => {
                                e.stopPropagation()
                                setMsg(trigger())
                            }}/>
                            
                        </form>


                    </div>
                    : null}
            </div>










        </>

        )
    }
    export default Item


