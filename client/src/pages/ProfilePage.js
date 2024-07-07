import React, { useContext, useState } from 'react';
import NavBar from '../components/Navbar';
import UserContext from '../UserContext';

function ProfilePage() {
  const { user, setUser } = useContext(UserContext);
  const [newUsername, setNewUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/update_username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: newUsername }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to update username');
        }
      })
      .then((updatedUser) => {
        setUser(updatedUser);
        setNewUsername('')
        setMessage('Username updated successfully');
      })
      .catch((error) => {
        console.error('Error updating username:', error);
        setMessage('Failed to update username');
      });
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
          {message && <p>{message}</p>}
        </div>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default ProfilePage;