import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"
import { ContextNavbar } from "../ContextNavbar";
import Alert from "./alert";
import LogoApata from "/logoapata.svg?url"


function Navbar() {

  const navigate = useNavigate()
  const { itens, setItens, barraBusca, setBarraBusca, adm, setAdm } = useContext(ContextNavbar)
  const [openmenuham, setOpenMenuHam] = useState(false)
  const [poup, setPoup] = useState(false)


  function pesquisar(e) {
    e.preventDefault()

    //verifica se existe algo no barra busca retirando os espaços
    if (!barraBusca.trim()) {
      return
    }

    axios.get(`${import.meta.env.VITE_URLAPI}/busca/${barraBusca.trim()}`)
      .then((resposta) => {
        setItens(resposta.data)
        navigate('/busca')

      })
      .catch(erro => {
        if (erro.status === 404) {
          navigate('/busca')
          setItens(null)
        }
        else { setItens(null) }
      }

      )
  }



  function telaadm() {
    const token = localStorage.getItem("token")
    if (!token) return navigate('./painel')
    axios.get(`${import.meta.env.VITE_URLAPI}/testelogin`,
      { headers: { authorization: `Bearer ${token}` } })
      .then(() => {
        navigate('/gerenciar')
        setAdm(true)
      })
      .catch(() => {
        navigate('/painel')
        setAdm(false)
      })

  }

  function inputpesquisa(valor) {
    setBarraBusca(valor.target.value)
  }



  function sair() {
    localStorage.removeItem("token")
    navigate('/painel')
    setAdm(false)
    setPoup(false)
  }


  function paginacriar() { navigate('/cadastro') }

  function paginainicial() { navigate('/') }



  return (
    <>

      <header className="flex fixed top-0 justify-between items-center w-screen max-h-15 bg-white z-100 px-4 pr-8">

        <div onClick={paginainicial} className="flex flex-row justify-center items-center gap-x-1">
          <img src={LogoApata} className="h-5 w-auto" />
          <h1 className="text-(--text-color) font-extrabold text-base">APATA</h1>
        </div>

      <nav className="relative flex items-center justify-between">

  {/* Botão hambúrguer (só mobile) */}
  <button
    className="flex flex-col justify-center gap-0.5   sm:hidden p-2"
    onClick={() => {
      setOpenMenuHam(x => !x)
      if (!openmenuham) {
        setTimeout(() => setOpenMenuHam(false), 18000)
      }
    }}
  >
    <span className="w-4 h-0.5 bg-(--text-color) transition-all" />
    <span className="w-4 h-0.5 bg-(--text-color) transition-all" />
    <span className="w-4 h-0.5 bg-(--text-color) transition-all" />
  </button>

  {/* Menu */}
  <ul
    className={`
      absolute top-full right-0 mt-0
      w-fit bg-white
      overflow-hidden
      transition-all duration-300

      ${openmenuham ? "max-h-fit opacity-100" : "max-h-0 opacity-0"}

      flex flex-col
      sm:gap-2 gap-0 px-2 pb-1 rounded-b-sm
      sm:static sm:mt-0 sm:w-auto sm:bg-transparent 
      sm:max-h-none sm:opacity-100
      sm:flex-row sm:p-0
      sm:text-sm text-[15pt]
    `}
  >

    <li className="navitem">
      <Link to="/">
        Início
      </Link>
    </li>

    <li onClick={telaadm} className="navitem">
      Gerenciar
    </li>

    {adm && (
      <>
        <li onClick={paginacriar} className="navitem">
          Cadastrar
        </li>

        <li
          onClick={() => setPoup(true)}
          className="navitem"
        >
          Sair
        </li>
      </>
    )}

  </ul>
</nav>



      </header >

      <Alert titulo={"AVISO"}
        descricao={`Tem certeza que deseja sair da conta?`}
        bty={"Sim"} fbty={sair}
        btn={"Não"} fbtn={() => setPoup(false)}
        estado={poup}
      />


    </>

  )
}

export default Navbar