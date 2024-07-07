import React, { useContext, useState } from 'react';
import NavBar from '../components/Navbar';
import UserContext from '../UserContext';

function ProfilePage() {
  const { user, setUser } = useContext(UserContext);
  const [newUsername, setNewUsername] = useState(user ? user.username : '');

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Assume the backend API endpoint for updating the username is `/update_username`
    fetch('/update_username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: newUsername }),
    })
      .then((response) => response.json())
      .then((updatedUser) => {
        // Update the user context with the new username
        setUser(updatedUser);
      })
      .catch((error) => console.error('Error updating username:', error));
  };

  return (
    <div>
      <NavBar />
      {user ? (
        <div>
          <h1>Hello, {user.username}</h1>
          <form onSubmit={handleSubmit}>
            <label>
              New Username:
              <input
                type="text"
                value={newUsername}
                onChange={handleUsernameChange}
              />
            </label>
            <button type="submit">Update Username</button>
          </form>
        </div>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default ProfilePage;