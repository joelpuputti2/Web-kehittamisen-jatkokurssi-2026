import { NavLink } from "react-router-dom";

const Nav = () => {
  return ( 
    <nav className="sidebar">
      <h2>StudyFlow</h2>
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>Ohjauspaneeli</NavLink>
        </li>
        <li>
          <NavLink to="/form" className={({ isActive }) => (isActive ? "active" : "")}>Lisää tehtävä</NavLink>
        </li>
        <li><a href="#">Projektit</a></li>
        <li><a href="#">Kalenteri</a></li>
      </ul>
    </nav>
  )
}

export default Nav;