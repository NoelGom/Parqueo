import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <nav className="navbar">
        <div className="container" style={{display:"flex",alignItems:"center",gap:18,justifyContent:"space-between"}}>
          <span className="brand">Parqueo IA</span>
          <div className="nav">
            <NavLink to="/roles">Roles</NavLink>
            <NavLink to="/usuarios">Usuarios</NavLink>
            <NavLink to="/parqueos">Parqueos</NavLink>
            <NavLink to="/espacios">Espacios</NavLink>
            <NavLink to="/vehiculos">Vehículos</NavLink>
            <NavLink to="/reservas">Reservas</NavLink>
            <NavLink to="/pagos">Pagos</NavLink>
            <NavLink to="/sensores">Sensores</NavLink>
            <NavLink to="/lecturas">Lecturas</NavLink>
            <NavLink to="/pagos/cobrar">Cobrar</NavLink>
          </div>
        </div>
      </nav>
      <main className="container" style={{paddingTop:24}}>
        <Outlet />
      </main>
      <footer className="container" style={{opacity:.6, paddingTop:40, paddingBottom:24}}>
        Parqueo — 2025
      </footer>
    </>
  );
}
