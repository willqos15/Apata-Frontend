

import './App.css'
import Navbar from './components/Navbar'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import PagePrincipal from './paginas/pageprincipal'
import PageCadastro from './paginas/pagecadastro'
import Gerenciar from './paginas/gerenciar';
import PageBusca from './paginas/pagebusca';
import { ContextNavbar } from './ContextNavbar';
import { useState } from 'react';
import PainelAdm from './paginas/PainalAdm';
import MFooter from './components/mfooter';
import Prorota from './paginas/Prorota';


/*PALETA DE COR
Blue Jungle:
#011D4D
#034078
#1282A2
#E3DFDA
#63372C


 */

function App() {

  const [itens,setItens] = useState([]) 
  const [barraBusca, setBarraBusca] = useState([])
  const [adm,setAdm] = useState(false)


 
  return (
    <>
  
    
    <ContextNavbar.Provider value={{itens,setItens,barraBusca,setBarraBusca,adm,setAdm}}>
    <Router> {/*Router envolve TODA PAGINA */}

      <Navbar/>

      <Routes>
        <Route path='/' element={<PagePrincipal/>}/>

        <Route element={<Prorota/>}>
        <Route path='/cadastro' element={<PageCadastro/>}/>
        <Route path='/gerenciar' element={<Gerenciar/>}/>
        </Route>
        
        

        <Route path='/painel' element={<PainelAdm/>}/>
        <Route path='/busca/' element={<PageBusca/>}/>
      </Routes>
    
    
    </Router>
    </ContextNavbar.Provider>



    


    </>

    
  )
}

export default App
