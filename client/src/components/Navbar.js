import React, { useContext } from 'react';
import { NavLink } from "react-router-dom";
import UserContext from "../UserContext";
import "../Navbar.css";

function NavBar({ onLogout }) {
  const { user, setUser } = useContext(UserContext);

  function handleLogout() {
    fetch("/logout", {
      method: "DELETE",
    }).then(() => {
      setUser(null);
      if (onLogout) onLogout();
    });
  }

  return (
    <>
      <header>
        {user && <button onClick={handleLogout}>Logout</button>}
      </header>
      <nav>
        <NavLink
          to="/"
          className="navbar-link"
          activeClassName="active"
          exact
          onClick={() => console.log("Home link clicked")}
        >
          Home
        </NavLink>
        {user && (
          <NavLink
            to={`/users/${user.id}`}
            className="navbar-link"
            activeClassName="active"
            onClick={() => console.log("Profile link clicked")}
          >
            Profile
          </NavLink>
        )}
        <NavLink
          to="/users"
          className="navbar-link"
          activeClassName="active"
          onClick={() => console.log("User List link clicked")}
        >
          User List
        </NavLink>
        <NavLink
          to="/calendar"
          className="navbar-link"
          activeClassName="active"
          onClick={() => console.log("Calendar link clicked")}
        >
          Calendar
        </NavLink>
      </nav>
    </>
  );
}

export default NavBar;