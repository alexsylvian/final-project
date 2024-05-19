import { NavLink } from "react-router-dom";
// import "./NavBar.css";

function NavBar() {
  return (
    <nav>
      <NavLink
        to="/"
        className="navbar"
        onClick={() => console.log("Home link clicked")}
      >
        Home
      </NavLink>
      <NavLink
        to="/users"
        className="navbar"
        onClick={() => console.log("User List link clicked")}
      >
        User List
      </NavLink>
    </nav>
  );
};

export default NavBar;