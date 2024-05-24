import React, { useState } from "react";

function RegistrationForm({ onRegister }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!username) {
      setError("All fields are required");
      return;
    }

    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Registration failed");
        }
        return response.json();
      })
      .then((data) => {
        onRegister(data);
      })
      .catch((error) => {
        setError("Registration failed. Please try again.");
        console.error("Registration error:", error);
      });
  }

  return (
    <div>
      <h2>New User? Register Here:</h2>
      {error && <div>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegistrationForm;