import { useForm } from 'react-hook-form'
import axios from 'axios'
import Formulario from '../components/formulario'
import { useState } from 'react'



function PageCadastro() {

    const[estado,setEstado] = useState("inicio")

    function enviar(dados){
        
        
        dados.encontrado = false
        var dadosjson = dados
        const token = localStorage.getItem("token")
        
        axios.post(`${import.meta.env.VITE_URLAPI}/cadastro`, dadosjson, 
             {headers: {authorization: `Bearer ${token}`}}
        )
        .then((resposta)=>{
            if(resposta.status === 201 || resposta.status ===200){
                setEstado("fim")
            } 
        })
        .catch((erro)=>{
            if (erro.status === 403){
                setEstado("limite")
            }
            
            else {
                setEstado("erro")
            }
            
            console.error("Erro:", erro)})

        }
    

    const { register, handleSubmit, formState:{errors }, reset} = useForm( {mode: "onChange"})
    
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
    return (<>

    {estado==="fim" && <p className="pt-10 text-xl text-green-600 font-bold"> Cadastro feito com sucesso!</p>}
    {estado==="limite" && <p className="pt-10 text-xl text-[rgb(128,0,0)] font-bold"> Limite de cadastros excedidos!</p>}
    {estado==="erro" && <p className="pt-10 text-xl text-[rgb(128,0,0)] font-bold"> Erro ao cadastrar!</p>}

    <Formulario funcao={enviar}/>

        


    </>)
}
export default PageCadastro