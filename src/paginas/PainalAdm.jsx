import { useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loginadm } from "../hookapi/fetchItem"
import { useContext, useState, useEffect } from "react"
import { ContextNavbar } from "../ContextNavbar"
import loading from '../img/load.gif'
import Button from "../components/button"

function PainelAdm() {

    const { adm, setAdm } = useContext(ContextNavbar)
    const [msglogin, setMsgLogin] = useState("")
    const [estlogin, setEstLogin] = useState("deslogado")

    const { handleSubmit, watch, register, formState: { errors } } = useForm({ mode: "onChange" })
    const navigate = useNavigate()



    const queryClient = useQueryClient()
    const mutationLogin = useMutation(
        {
            mutationFn: (dados) => Loginadm(dados),
            onSuccess: (data) => {
                const token = data.token
                localStorage.setItem("token", token)
                setAdm(true)
                setEstLogin("logado")
                navigate('/gerenciar')
            },
            onError: (error) => {
                setEstLogin("erro")
            }
        }
    )

    function login(dados) {
        setEstLogin("carregando")
        mutationLogin.mutate(dados)
    }

    useEffect(() => {


        setTimeout(() => {
            if (msglogin === "erro") {
                setMsgLogin("")
            }
        }, 5000)

    }, [msglogin])

    return (
        <div className='min-h-screen flex flex-col items-center justify-center'>
            {estlogin === "carregando" ?
                <img src={loading}
                    className="pt-15 w-20 mx-auto" /> :

                <>
                    <div className="block mx-auto bg-(--bg-color2) sm:rounded-2xl py-1.25 px-5 text-(--text-color) sm:w-60 w-full ">

                        <h2>Área Restrita</h2>
                        <form onSubmit={handleSubmit(login)}>

                            <div className="flex">
                                <div className="flex flex-col items-center gap-2">
                                    <label>Login: </label>
                                    <label>Senha: </label>
                                </div>

                                <div className="flex flex-col w-full justify-center items-center gap-2">

<input className="input" {...register("email", { required: true })} type="text" />

                                    <input className="input" {...register("password", { required: true })} type="password">
                                    </input>

                                    
                                </div>
                            </div>

                            {(errors.email || errors.password) && <p className="plogin">Campo obrigatório</p>}
                            {msglogin === "erro" && <p className="plogin"> Login ou Senha incorreto!</p>}
                            {mutationLogin.isError && <p className="plogin">Login ou Senha incorreto!</p>}

                            <Button name="Entrar" type="submit" size={15} className="text-[10pt] mt-4" />


                        </form>


                    </div>
                </>}
        </div>


    )
}

export default PainelAdm