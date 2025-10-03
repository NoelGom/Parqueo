import { Link, NavLink } from "react-router-dom";
import { resources } from "../resources/resourcesConfig";

export default function Navbar() {
  return (
    <div className="row" style={{ justifyContent: "space-between" }}>
      <Link to="/" className="brand">Parqueo IA</Link>
      <nav className="nav">
        {resources.map(r => (
          <NavLink key={r.key} to={`/${r.key}`} className={({isActive}) => isActive ? "active" : ""}>
            {r.title}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
