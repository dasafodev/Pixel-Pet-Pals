// AddFriendModal.js
import React, { useState } from 'react';

function AddFriendModal({ isOpen, onClose, onAddFriend }) {
  const [newFriend, setNewFriend] = useState({
    nickname: '',
    petName: '',
    bio: '',
    avatar: '😺' // Default avatar
  });
  
  const avatarOptions = ['😺', '🐶', '🐰', '🦊', '🐢', '🦜', '🐹', '🦁', '🐼', '🐨'];
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewFriend(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setNewFriend(prev => ({
      ...prev,
      avatar
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddFriend({
      ...newFriend,
      id: Date.now() // Generate a unique ID
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fefae0',
        border: '4px solid #000',
        boxShadow: '8px 8px 0 #000',
        padding: '20px',
        width: '400px',
        maxWidth: '90%',
        maxHeight: '90%',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Add New Friend</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              Choose Avatar:
            </label>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '15px'
            }}>
              {avatarOptions.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => handleAvatarSelect(avatar)}
                  style={{
                    fontSize: '24px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selectedAvatar === avatar ? '#d0ebff' : '#fff',
                    border: '2px solid #000',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              Friend Nickname:
            </label>
            <input
              type="text"
              name="nickname"
              value={newFriend.nickname}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '3px solid #000',
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              Pet Name:
            </label>
            <input
              type="text"
              name="petName"
              value={newFriend.petName}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '3px solid #000',
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              Bio:
            </label>
            <textarea
              name="bio"
              value={newFriend.bio}
              onChange={handleChange}
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                border: '3px solid #000',
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#f4978e',
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                padding: '10px',
                border: '3px solid #000',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #000',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f2877c';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f4978e';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: '#8ecae6',
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                padding: '10px',
                border: '3px solid #000',
                cursor: 'pointer',
                boxShadow: '2px 2px 0px #000',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#6db5d9';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#8ecae6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Add Friend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFriendModal;
