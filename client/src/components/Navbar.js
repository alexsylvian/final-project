import { NavLink } from "react-router-dom";
// import "./NavBar.css";

function NavBar() {
  return (
    <nav>
      <NavLink
        to="/"
        className="navbar"
      >
        Home
      </NavLink>
      <NavLink
        to="/users"
        className="navbar"
      >
        User List
      </NavLink>
    </nav>
  );
};

export default NavBar;