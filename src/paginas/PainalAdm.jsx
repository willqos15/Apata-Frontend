import axios from "axios"
import {useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import styles from './PainelAdm.module.css'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loginadm } from "../hookapi/fetchItem"
import { useContext, useState, useEffect } from "react"
import { ContextNavbar } from "../ContextNavbar"
import loading from '../img/load.gif'

function PainelAdm (){
    
     const {adm,setAdm} = useContext(ContextNavbar)
    const[msglogin,setMsgLogin] = useState("")
    const[estlogin,setEstLogin] = useState ("deslogado")

    const {handleSubmit, watch, register, formState: {errors}} = useForm({mode: "onChange"})
    const navigate = useNavigate()


    
        const queryClient = useQueryClient()
        const mutationLogin = useMutation(
            {mutationFn: (dados)=> Loginadm(dados),
            onSuccess: (data)=>{
                const token = data.token
                localStorage.setItem("token", token)
                setAdm(true)
                setEstLogin("logado")
                navigate('/gerenciar')
            }
             }
        )

    function login(dados){
        setEstLogin("carregando")
        mutationLogin.mutate(dados)
    }

    useEffect(()=>{ 
        

        setTimeout(()=>{
            if(msglogin==="erro"){
                setMsgLogin("")}
        },5000)

        },[msglogin])

    return(
        <>
        {estlogin === "carregando" && 
            <img src={loading}
        className={styles.imgload}/>}

        {estlogin !== "carregando" &&
        <>
        <div className={styles.loginmain}>
        
        <h2>Área Restrita</h2>
        <form onSubmit={handleSubmit(login)}>

        <div>
        <label>Login: </label>
        <input {... register("email", {required: true})}type="text"/>
        </div>

        <div>
            <label>Senha: </label>
            <input {... register("password", {required: true})} type="password"></input>
        </div>

        {(errors.email || errors.password) && <p className={styles.plogin}>Campo obrigatório</p>}
        {msglogin === "erro" && <p className={styles.plogin}> Login ou Senha incorreto!</p>}
        {mutationLogin.isError && <p className={styles.plogin}>Login ou Senha incorreto!</p>}
        <button type="submit" className={styles.btnlogin}> Enviar </button>
        
        </form>
        
        
        </div>
        </>}
        </>
        

    )
}

export default PainelAdm