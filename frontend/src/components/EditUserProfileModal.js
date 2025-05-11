import React, { useState, useEffect } from 'react';
import { updateProfile } from '../api'; // Assuming updateProfile can handle all these fields

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#fefae0',
  padding: '30px',
  borderRadius: '10px',
  border: '3px solid #000',
  boxShadow: '5px 5px 0px #000',
  zIndex: 1000,
  width: '450px', // Slightly wider for more fields
  fontFamily: "'Press Start 2P'",
  color: '#333',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  zIndex: 999,
};

const inputStyle = {
  width: 'calc(100% - 22px)', // Adjusted for padding/border
  padding: '10px',
  marginBottom: '15px',
  border: '2px solid #000',
  borderRadius: '5px',
  fontFamily: "'Press Start 2P'",
  fontSize: '12px',
};

const buttonStyle = {
  padding: '10px 15px',
  backgroundColor: '#8ecae6',
  border: '3px solid #000',
  borderRadius: '5px',
  fontFamily: "'Press Start 2P'",
  fontSize: '12px',
  cursor: 'pointer',
  boxShadow: '2px 2px 0px #000',
  marginRight: '10px',
  transition: 'background-color 0.2s, transform 0.2s',
};

const closeButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#f4978e',
  marginLeft: 0,
};

const avatarOptions = [
  '/avatars/avatar_1.png',
  '/avatars/avatar_2.png',
  '/avatars/avatar_3.png',
  '/avatars/avatar_4.png',
  '/avatars/avatar_5.png',
  '/avatars/avatar_6.png',
  '/avatars/avatar_7.png',
  '/avatars/avatar_8.png',
];

function EditUserProfileModal({ show, onClose, currentUser, onUserUpdate }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setSelectedAvatar(currentUser.avatar || avatarOptions[0]);
      // Do not prefill password fields for security
      setPassword('');
      setConfirmPassword('');
    }
  }, [currentUser, show]); // Re-run if currentUser changes or modal is reshown

  if (!show) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password && password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      username: username,
      avatar: selectedAvatar,
    };
    if (password) {
      payload.password = password;
    }

    try {
      const response = await updateProfile(payload); // updateProfile should handle these fields
      if (response.success) {
        setSuccessMessage('Profile updated successfully!');
        if (onUserUpdate) {
          onUserUpdate(); // Refresh user data on Home page
        }
        onClose(); // Close modal immediately
      } else {
        setError(response.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <h2 style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'center' }}>Edit Your Profile</h2>
        {error && <p style={{ color: 'red', fontSize: '10px', marginBottom: '10px', textAlign: 'center' }}>Error: {error}</p>}
        {successMessage && <p style={{ color: 'green', fontSize: '10px', marginBottom: '10px', textAlign: 'center' }}>{successMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label htmlFor="avatar" style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Avatar:</label>
            <select
              id="avatar"
              value={selectedAvatar}
              onChange={(e) => setSelectedAvatar(e.target.value)}
              style={{...inputStyle, height: '40px', paddingRight: '10px'}}
            >
              {avatarOptions.map(avatarPath => (
                <option key={avatarPath} value={avatarPath}>
                  {avatarPath.split('/').pop()}
                </option>
              ))}
            </select>
            {selectedAvatar && 
              <img src={`${process.env.PUBLIC_URL}${selectedAvatar}`} alt="Selected Avatar" style={{width: '50px', height: '50px', border: '2px solid black', borderRadius: '4px', marginTop: '5px'}}/>
            }
          </div>
          <div>
            <label htmlFor="password" style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>New Password (optional):</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="Leave blank to keep current"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Confirm New Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              placeholder="Confirm if changing password"
              disabled={!password}
            />
          </div>
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={closeButtonStyle}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={buttonStyle}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditUserProfileModal;
