import { Navigate, Outlet } from "react-router-dom"

function Prorota (){
    
    const token = localStorage.getItem("token")

    if (!token) {
        return <Navigate to="/painel" replace></Navigate>
}
    return <Outlet/>

}

export default Prorota