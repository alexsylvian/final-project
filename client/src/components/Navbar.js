import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import UserContext from './UserContext';
import '../styles/navbarStyles.css';

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

  const isActive = (match, location) => {
    if (!match) {
      return false;
    }
    return match.isExact;
  };

  return (
    <>
      <header>
        {user && <button onClick={handleLogout}>Logout</button>}
      </header>
      <nav>
        <NavLink
          to="/"
          className="navbar-link"
          isActive={(match, location) => location.pathname === "/"}
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
            isActive={(match, location) => location.pathname === `/users/${user.id}`}
            activeClassName="active"
            onClick={() => console.log("Profile link clicked")}
          >
            Profile
          </NavLink>
        )}
        <NavLink
          to="/users"
          className="navbar-link"
          isActive={(match, location) => location.pathname.startsWith("/users") && !location.pathname.includes(`/users/${user?.id}`)}
          activeClassName="active"
          onClick={() => console.log("User List link clicked")}
        >
          User List
        </NavLink>
        <NavLink
          to="/calendar"
          className="navbar-link"
          isActive={(match, location) => location.pathname === "/calendar"}
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