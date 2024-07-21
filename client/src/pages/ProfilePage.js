import React, { useContext, useState } from 'react';
import NavBar from '../components/Navbar';
import UserContext from '../UserContext';

function ProfilePage() {
  const { user, setUser } = useContext(UserContext);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleUsernameChange(e){
    setNewUsername(e.target.value);
  };

  function handleEmailChange(e){
    setNewEmail(e.target.value);
  };

  function handleOldPasswordChange(e){
    setOldPassword(e.target.value);
  };

  function handlePasswordChange(e){
    setNewPassword(e.target.value);
  };

  function handleConfirmPasswordChange(e){
    setConfirmPassword(e.target.value);
  };

  function handleUpdateUsername(e){
    e.preventDefault();
    setIsLoading(true);

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
        setNewUsername('');
        setMessage('Username updated successfully');
      })
      .catch((error) => {
        console.error('Error updating username:', error);
        setMessage('Failed to update username');
      })
      .finally(() => setIsLoading(false));
  };

  function handleUpdateEmail(e){
    e.preventDefault();
    setIsLoading(true);

    fetch('/update_email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newEmail }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to update email');
        }
      })
      .then((updatedUser) => {
        setUser(updatedUser);
        setNewEmail('');
        setMessage('Email updated successfully');
      })
      .catch((error) => {
        console.error('Error updating email:', error);
        setMessage('Failed to update email');
      })
      .finally(() => setIsLoading(false));
  };

  function handleUpdatePassword(e){
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    fetch('/update_password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to update password');
        }
      })
      .then((updatedUser) => {
        setUser(updatedUser);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMessage('Password updated successfully');
      })
      .catch((error) => {
        console.error('Error updating password:', error);
        setMessage('Failed to update password');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div>
      <NavBar />
      {user ? (
        <div>
          <h1>Hello, {user.username}</h1>
          <form onSubmit={handleUpdateUsername}>
            <label>
              New Username:
              <input
                type="text"
                value={newUsername}
                onChange={handleUsernameChange}
              />
            </label>
            <br />
            <button type="submit">Update Username</button>
          </form>
          <br />
          <form onSubmit={handleUpdateEmail}>
            <label>
              New Email:
              <input
                type="text"
                value={newEmail}
                onChange={handleEmailChange}
              />
            </label>
            <br />
            <button type="submit">Update Email</button>
          </form>
          <br />
          <form onSubmit={handleUpdatePassword}>
            <label>
              Old Password:
              <input
                type="password"
                value={oldPassword}
                onChange={handleOldPasswordChange}
              />
            </label>
            <br />
            <label>
              New Password:
              <input
                type="password"
                value={newPassword}
                onChange={handlePasswordChange}
              />
            </label>
            <br />
            <label>
              Confirm New Password:
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
            </label>
            <br />
            <button type="submit">Update Password</button>
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