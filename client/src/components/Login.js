import React, { useState, useContext } from "react";
import UserContext from "../UserContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { setUser } = useContext(UserContext);

  function handleSubmit(e) {
    e.preventDefault();

    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Login failed");
        }
      })
      .then((user) => {
        setUser(user);
      })
      .catch((error) => {
        setError("Invalid username or password. Please try again.");
        console.error("Login Error:", error);
      });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        value={password}
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}

export default Login;