import './App.css'
import Navbar from './components/Navbar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ContextNavbar } from './ContextNavbar'
import { useState, lazy, Suspense } from 'react'
import MFooter from './components/mfooter'
import ScrollToTop from './components/ScrollToTop'
import loading from './img/load.gif'

const PainelAdm = lazy(() => import('./paginas/PainalAdm'))
const PagePrincipal = lazy(() => import('./paginas/pageprincipal'))
const Formulario = lazy(() => import('./components/formulario'))
const Gerenciar = lazy(() => import('./paginas/gerenciar'))
const Prorota = lazy(() => import('./paginas/Prorota'))


function App() {

  const [itens,setItens] = useState([]) 
  const [barraBusca, setBarraBusca] = useState([])
  const [adm,setAdm] = useState(false)


 
  return (
    <>
  
    
    <ContextNavbar.Provider value={{itens,setItens,barraBusca,setBarraBusca,adm,setAdm}}>
    <Router> {/*Router envolve TODA PAGINA */}

      <ScrollToTop />


      <Navbar/>

      <Suspense fallback={ <div className='min-h-screen flex justify-center items-center'><img src={loading} className="w-20 h-auto mx-auto" /></div>}>

      <Routes>
        <Route path='/' element={<PagePrincipal/>}/>

        <Route element={<Prorota/>}>
        <Route path='/cadastro' element={<Formulario/>}/>
        <Route path='/gerenciar' element={<Gerenciar/>}/>
        </Route>
        
        

        <Route path='/painel' element={<PainelAdm/>}/>
       
      </Routes>
      </Suspense>
    
    <MFooter />
 
    
    </Router>
    </ContextNavbar.Provider>
    </>

    
  )
}

export default App
