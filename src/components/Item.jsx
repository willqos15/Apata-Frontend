import styles from "./Item.module.css"
import { useRef, useState } from "react"
import { Controller, useForm } from 'react-hook-form'
import { MdAddPhotoAlternate } from "react-icons/md";
import { PatternFormat } from 'react-number-format'
import axios from 'axios'


function Item({ Nome, Descricao, local, Dono, Contato, Img, Imgtexto, admin, id, fdel, valoresget, fatualizar, itemstart,itemend }) {

    
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
        
        

        try{
            itemstart()

            if (foto.current?.files?.length>0) {

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

        catch(erro){
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
            const item = valoresget.find(x=> x._id === id)
            reset({...item, contato: item.contato?.replace(/\D/g, '')})

        }


        function Scrollar(e) {

            setTimeout(() => {
                e.target.scrollIntoView(
                    { behavior: "smooth", block: "center" })
            }
                , 300)

        }




        return (<>


            <div className={styles.item}>



                <div onClick={() => {
                    if (!admin) { setAberto(!aberto) }
                    if (admin) { editar() }
                }} className={styles.card}>

                    <div className={styles.imagem}>

                        <div className={styles.containerfoto}>

                            {admin && editando ? <>
                                <button className={styles.icoeditfoto}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        foto.current.click()
                                    }}
                                >
                                    <MdAddPhotoAlternate />
                                </button>
                                <img className={styles.imageedit}
                                    src={fotoup ? fotoup : Img}
                                    alt={Imgtexto} />
                            </>
                                : <img src={Img} alt={Imgtexto} />
                            }

                        </div>

                        {admin && <>
                            <button
                                onClick={editar}
                                className={styles.btnadmin}>Editar
                            </button>

                            <button onClick={(e) => {fdel(id, Nome)
                                e.stopPropagation()
                            }} className={styles.btnadmin}>Apagar</button></>}


                        <div className={styles.titulo} >
                            <label> {Nome} </label>



                            {/*FRASE SAIBA MAIS PARA USUÁRIO GERAL*/}
                            {!admin ? <p className={aberto ? styles.pon : styles.poff}>
                                clique para saber mais </p> : null}
                        </div>

                    </div>
                </div>


                {/*VERSÃO BOTÃO PARA USUÁRIO GERAL*/}
                {!admin ?
                    <div className={aberto ? styles.on : styles.off}>
                        <label> <strong>Descrição: </strong>{Descricao}</label>
                        <label> <strong>Local onde foi perdido: </strong>{local}</label>
                        <label> <strong>Proprietário: </strong>{Dono} </label>
                        <br />
                    </div>
                    : null}

                {/*VERSÃO FORMULÁRIO PARA EDITAR COMO ADIMINISTRADOR*/}
                {admin ?
                    <div className={editando ? styles.on : styles.off}>

                        <form onSubmit={handleSubmit(form)}>



                            <input type='file' name="file"
                                onChange={uploading} onFocus={Scrollar} ref={foto}
                                className={styles.ocultar} />

                            <label> <strong>Nome: </strong></label>
                            <input {...register("nome", { required: true })} type="text" onFocus={Scrollar} />
                            {errors.nome && <p>Campo obrigatório</p>}

                            <label> <strong>Descrição: </strong></label>
                            <textarea  {...register("descricao", { required: true })} onFocus={Scrollar} />
                            {errors.descricao && <p>Campo obrigatório</p>}

                            <label> <strong>Local onde foi perdido: </strong></label>
                            <input  {...register("local", { required: true })} type="text" onFocus={Scrollar} />
                            {errors.local && <p>Campo obrigatório</p>}

                            <label> <strong>Proprietário: </strong></label>
                            <input  {...register("proprietario", { required: true })} type="text" onFocus={Scrollar} />
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
                            <button onClick={(e) => {
                                e.stopPropagation()
                                setMsg(trigger())
                            }} type="submit" className={styles.btsave}>Salvar</button>
                        </form>


                    </div>
                    : null}
            </div>










        </>

        )
    }
    export default Item


